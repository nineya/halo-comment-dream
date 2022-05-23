<template>
  <section class="comment-editor" role="form" v-if="isCurrReply">
    <div class="avatar-body">
      <img :src="avatar" class="avatar" alt="avatar" />
    </div>
    <form class="comment-form">
      <div class="author-info">
        <input
          id="author"
          v-model="comment.author"
          aria-required="true"
          :placeholder="configs.getQQInfo ? '* 昵称（输入QQ自动获取）' : '* 昵称'"
          required="required"
          type="text"
          @blur="configs.getQQInfo && handleQQInfo()"
        />
        <input
          id="email"
          v-model="comment.email"
          placeholder="邮箱"
          :class="!this.comment.email || isEmail() ? '' : 'error'"
          type="text"
        />
        <input id="authorUrl" v-model="comment.authorUrl" placeholder="网址" type="text" />
      </div>
      <div v-if="!previewMode" class="comment-textarea">
        <textarea
          ref="commentTextarea"
          v-model="comment.content"
          :placeholder="options.comment_content_placeholder || '撰写评论...'"
          :class="!comment.content || comment.content.length < 1023 ? '' : 'error'"
          aria-required="true"
          required="required"
        >
        </textarea>
        <span class="emoji-picker">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0zm1-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
              fill="rgba(174,174,174,1)"
            />
          </svg>
        </span>
      </div>
      <div v-else class="comment-preview markdown-content" v-html="renderedContent"></div>
      <ul>
        <li v-if="this.replyComment">
          <button class="btn" type="button" @click="globalData.replyId = 0">取消</button>
        </li>
        <li v-if="comment.content">
          <button class="btn" type="button" @click="previewMode = !previewMode">
            {{ previewMode ? '编辑' : '预览' }}
          </button>
        </li>
        <li>
          <button class="btn btn-primary" type="button" @click="handleSubmitClick">提交</button>
        </li>
      </ul>
      <div class="comment-alert">
        <!-- Info -->
        <template v-if="infoAlertVisible">
          <div v-for="(info, index) in infoes" :key="index" class="alert info">
            <span class="closebtn" @click="clearAlertClose">&times;</span>
            <strong>{{ info }}</strong>
          </div>
        </template>

        <!-- Success -->
        <template v-if="successAlertVisible">
          <div v-for="(success, index) in successes" :key="index" class="alert success">
            <span class="closebtn" @click="clearAlertClose">&times;</span>
            <strong>{{ success }}</strong>
          </div>
        </template>

        <!-- Warning -->
        <template v-if="warningAlertVisible">
          <div v-for="(warning, index) in warnings" :key="index" class="alert warning">
            <span class="closebtn" @click="clearAlertClose">&times;</span>
            <strong>{{ warning }}</strong>
          </div>
        </template>
      </div>
    </form>
  </section>
</template>
<script>
import { marked } from 'marked'
import md5 from 'md5'
import { isEmpty, isObject, isQQ, validEmail } from '@/utils/util'
import apiClient from '@/plugins/api-client'
import autosize from 'autosize'
import { EmojiButton } from '@joeattardi/emoji-button'
import globals from '@/utils/globals.js'
import { encodeHtml } from '../utils/util'

export default {
  name: 'CommentEditor',
  props: {
    targetId: {
      type: Number,
      required: false,
      default: 0
    },
    target: {
      type: String,
      required: false,
      default: 'posts',
      validator: function (value) {
        return ['posts', 'sheets', 'journals'].indexOf(value) !== -1
      }
    },
    replyComment: {
      type: Object,
      required: false,
      default: () => {}
    },
    options: {
      required: false,
      default: []
    },
    configs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      comment: {
        author: null,
        authorUrl: null,
        email: null,
        content: ''
      },
      previewMode: false,
      globalData: globals,
      infoes: [],
      warnings: [],
      successes: []
    }
  },
  computed: {
    isCurrReply() {
      return !this.replyComment || this.globalData.replyId === this.replyComment.id
    },
    renderedContent() {
      return this.comment.content ? marked.parse(encodeHtml(this.comment.content, this.configs.commentHtml)) : ''
    },
    avatar() {
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'

      if (!this.comment.email || !validEmail(this.comment.email)) {
        return `${gravatarSource}?d=${gravatarDefault}`
      }

      const gravatarMd5 = md5(this.comment.email)
      return `${gravatarSource}${gravatarMd5}?s=256&d=${gravatarDefault}`
    },
    infoAlertVisible() {
      return this.infoes !== null && this.infoes.length > 0
    },
    warningAlertVisible() {
      return this.warnings !== null && this.warnings.length > 0
    },
    successAlertVisible() {
      return this.successes !== null && this.successes.length > 0
    }
  },
  created() {
    // Get info from local storage
    const author = localStorage.getItem('comment-author')
    const authorUrl = localStorage.getItem('comment-authorUrl')
    const email = localStorage.getItem('comment-email')
    this.comment.author = author ? author : ''
    this.comment.authorUrl = authorUrl ? authorUrl : ''
    this.comment.email = email ? email : ''

    this.handleCreateEmojiPicker()
  },
  mounted() {
    autosize(document.querySelector('textarea'))
  },
  methods: {
    isEmail() {
      return validEmail(this.comment.email)
    },
    handleCreateEmojiPicker() {
      this.$nextTick(() => {
        const picker = new EmojiButton({ zIndex: 9999, theme: this.configs.dark ? 'dark' : 'light' })
        picker.on('emoji', selection => {
          this.comment.content += selection.emoji
        })
        const trigger = this.$el.getElementsByClassName('emoji-picker')[0]
        trigger.addEventListener('click', () => picker.togglePicker(trigger))
      })
    },
    handleQQInfo() {
      if (!isQQ(this.comment.author)) {
        return
      }
      fetch('https://api.coor.top/qqinfo/?qq=' + this.comment.author)
        .then(response => response.json())
        .then(data => {
          this.comment.author = data.nickname
          this.comment.email = data.email
        })
    },
    handleSubmitClick() {
      if (isEmpty(this.comment.author)) {
        this.warnings.push('评论者昵称不能为空')
        return
      }
      if (isEmpty(this.comment.content)) {
        this.warnings.push('评论内容不能为空')
        return
      }
      // Submit the comment
      this.comment.postId = this.targetId
      if (this.replyComment) {
        // Set parent id if available
        this.comment.parentId = this.replyComment.id
      }

      apiClient.comment
        .create(this.target, this.comment)
        .then(response => {
          // Store comment author, email, authorUrl
          localStorage.setItem('comment-author', this.comment.author)
          localStorage.setItem('comment-email', this.comment.email)
          localStorage.setItem('comment-authorUrl', this.comment.authorUrl)

          // clear comment
          this.comment.content = ''
          this.handleCommentCreated(response.data)
        })
        .catch(error => {
          this.handleFailedToCreateComment(error)
        })
    },
    handleCommentCreated(createdComment) {
      this.clearAlertClose()

      if (createdComment.status === 'PUBLISHED') {
        this.successes.push('评论成功，刷新即可显示最新评论！')
      } else {
        // Show tips
        this.infoes.push('您的评论已经投递至博主，等待博主审核！')
      }
    },
    handleFailedToCreateComment(response) {
      this.clearAlertClose()
      if (response.status === 400) {
        this.warnings.push(response.data.message)
        if (response.data) {
          const errorDetail = response.data.data
          if (isObject(errorDetail)) {
            Object.keys(errorDetail).forEach(key => {
              this.warnings.push(errorDetail[key])
            })
          }
        }
      } else if (response.status === 401) {
        this.warnings.push('评论失败，博主关闭了评论功能！')
      }
    },
    clearAlertClose() {
      this.infoes = []
      this.warnings = []
      this.successes = []
    }
  }
}
</script>
