<template>
  <section class="comment-editor" role="form">
    <div class="avatar-body">
      <div v-if="configs.enableBloggerOperation && bloggerComment" class="blogger-avatar" title="博主登录">
        <avatar :src="avatar" :configs="configs" @click="randomAuthor" style="cursor: pointer" title="点击头像试试" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">
          <path
            fill="var(--comment-theme)"
            d="M114.7,34.7c-19.4-41-38.7-41-58.1,0C11.4,31,1.8,47.7,27.6,85c-25.8,37.3-16.2,54,29,50.3c19.4,41,38.7,41,58.1,0
	c45.2,3.7,54.9-13,29.1-50.3C169.6,47.7,159.9,31,114.7,34.7z M82.4,110.9"
          />
          <path
            fill="rgba(255, 255, 255, 0.8)"
            d="M117.4,75.9l-35,35c-2.6,2.6-6.9,2.6-9.6,0L50.5,88.6c-2.6-2.6-2.6-6.9,0-9.6s6.9-2.6,9.6,0l17.5,17.5
	l30.2-30.2c2.6-2.6,6.9-2.6,9.6,0C120,68.9,120,73.2,117.4,75.9L117.4,75.9z"
          />
        </svg>
      </div>
      <avatar
        v-else
        :src="avatar"
        :configs="configs"
        @click="randomAuthor"
        style="cursor: pointer"
        title="点击头像试试"
      />
    </div>
    <form class="comment-form">
      <div class="blogger-info" v-if="configs.enableBloggerOperation && bloggerComment">
        <div>
          <p class="blogger-name">{{ this.globalData.blogger.nickname }}</p>
          <p class="blogger-email">{{ this.globalData.blogger.email }}</p>
        </div>
        <button class="btn" type="button" @click="bloggerComment = false">切换访客</button>
      </div>
      <div v-else class="author-info">
        <input
          id="author"
          v-model="comment.author"
          aria-required="true"
          :placeholder="
            (this.configs.anonymousUserName ? '' : '* ') + (this.configs.getQQInfo ? '昵称（输入QQ自动获取）' : '昵称')
          "
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
      <div v-show="!previewMode" class="comment-textarea">
        <textarea
          ref="commentTextarea"
          v-model="comment.content"
          :placeholder="options.comment_content_placeholder || '撰写评论...'"
          :class="!comment.content || comment.content.length < 1023 ? '' : 'error'"
          aria-required="true"
          required="required"
        >
        </textarea>
        <span class="edit-picker">
          <span class="edit-btn" :class="emojiDialogVisible ? 'edit-open' : ''" @click="handleToggleDialogEmoji">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              >
              <path
                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0zm1-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
              />
            </svg>
          </span>
          <span
            v-if="configs.enableImageUpload"
            class="edit-btn"
            :class="imageDialogVisible ? 'edit-open' : ''"
            @click="handleImageUpload"
          >
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path
                d="M896 128a64 64 0 0 1 64 64v640a64 64 0 0 1-64 64H128a64 64 0 0 1-64-64V192a64 64 0 0 1 64-64h768zM288 409.6L128 569.536V832h768v-83.2l-204.8-204.8-134.4 134.4-268.8-268.8zM896 192H128v288L288 320l268.8 268.8 134.4-134.4 204.8 204.8V192z"
              />
              <path d="M774.08 356.736a44.8 44.8 0 1 0 0-89.6 44.8 44.8 0 0 0 0 89.6z" />
            </svg>
          </span>
          <transition name="emoji-fade">
            <keep-alive>
              <EmojiPicker :pack="emojiPack" @select="handleSelectEmoji" v-if="emojiDialogVisible" />
            </keep-alive>
          </transition>
        </span>
      </div>
      <div v-if="previewMode" class="comment-preview markdown-content" v-html="renderedContent"></div>
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
          <button
            class="btn btn-primary"
            :class="commentSumbit ? 'btn-forbid' : ''"
            type="button"
            @click="handleSubmitClick"
          >
            {{ commentSumbit ? '提交中 ~' : '提交' }}
          </button>
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
import { buildNickName, isEmpty, isObject, isQQ, validEmail } from '@/utils/util'
import apiClient from '@/plugins/api-client'
import adminClient from '@/plugins/admin-client'
import autosize from 'autosize'
import globals from '@/utils/globals.js'
import { encodeHtml } from '@/utils/util'
import EmojiPicker from './dreamEmoji/EmojiPicker.vue'
import emojiData from './dreamEmoji/emojis.js'
import { renderedEmojiHtml } from './dreamEmoji/renderedEmoji.js'
import Avatar from './Avatar'

export default {
  name: 'CommentEditor',
  components: {
    Avatar,
    EmojiPicker
  },
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
      emojiPack: emojiData,
      emojiDialogVisible: false,
      imageDialogVisible: false,
      comment: {
        author: null,
        authorUrl: null,
        email: null,
        content: ''
      },
      previewMode: false,
      globalData: globals,
      bloggerComment: true,
      commentSumbit: false,
      infoes: [],
      warnings: [],
      successes: []
    }
  },
  computed: {
    renderedContent() {
      return this.comment.content
        ? marked.parse(renderedEmojiHtml(encodeHtml(this.comment.content, this.configs.commentHtml)))
        : ''
    },
    avatar() {
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'

      let email = this.configs.enableBloggerOperation ? this.globalData.blogger.email : this.comment.email
      if (!email || !validEmail(email)) {
        return `${gravatarSource}?d=${gravatarDefault}`
      }

      const gravatarMd5 = md5(email)
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
  },
  activated() {
    autosize(this.$el.querySelector('textarea'))
  },
  methods: {
    randomAuthor() {
      this.comment.author = buildNickName()
    },
    isEmail() {
      return validEmail(this.comment.email)
    },
    handleQQInfo() {
      if (!isQQ(this.comment.author)) {
        return
      }
      fetch('https://api.nsmao.net/api/qq/v1/query?key=YvmkHw55XwyW0W8N4FJVwkrbjo&qq=' + this.comment.author)
        .then(response => response.json())
        .then(data => {
          this.comment.email = this.comment.author + '@qq.com'
          this.comment.author = data.name
        })
        .catch(error => {
          this.clearAlertClose()
          this.warnings.push('使用QQ获取昵称失败: ' + error)
        })
    },
    handleSubmitClick() {
      if (isEmpty(this.comment.content)) {
        this.warnings.push('评论内容不能为空')
        return
      }
      let apiComment = adminClient.comment
      if (!this.configs.enableBloggerOperation || !this.bloggerComment) {
        apiComment = apiClient.comment
        if (isEmpty(this.comment.author)) {
          if (this.configs.anonymousUserName) {
            this.comment.author = this.configs.anonymousUserName
          } else {
            this.warnings.push('评论者昵称不能为空')
            return
          }
        }
      }
      // Submit the comment
      this.comment.postId = this.targetId
      if (this.replyComment) {
        // Set parent id if available
        this.comment.parentId = this.replyComment.id
      }

      this.commentSumbit = true
      apiComment
        .create(this.target, this.comment)
        .then(response => {
          // Store comment author, email, authorUrl
          if (!this.configs.enableBloggerOperation || !this.bloggerComment) {
            localStorage.setItem('comment-author', this.comment.author)
            localStorage.setItem('comment-email', this.comment.email)
            localStorage.setItem('comment-authorUrl', this.comment.authorUrl)
          }

          // clear comment
          this.comment.content = ''
          this.handleCommentCreated(response.data)
          try {
            window.onCommentSuccessEvent && window.onCommentSuccessEvent(this.comment, this.target)
          } catch (e) {
            console.error('onCommentSuccessEvent执行异常', e)
          }
        })
        .catch(error => {
          this.handleFailedToCreateComment(error)
          try {
            window.onCommentErrorEvent && window.onCommentErrorEvent(this.comment, error)
          } catch (e) {
            console.error('onCommentErrorEvent执行异常', e)
          }
        })
        .finally(() => setTimeout(() => (this.commentSumbit = false), 300))
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
    handleToggleDialogEmoji() {
      this.emojiDialogVisible = !this.emojiDialogVisible
    },
    handleImageUpload() {
      if (this.imageDialogVisible || !this.configs.imageUploadApi) return
      const fileElem = document.createElement('input')
      fileElem.setAttribute('type', 'file')
      fileElem.style.display = 'none'
      fileElem.accept = 'image/*'
      fileElem.addEventListener('change', () => {
        const file = fileElem.files[0]
        if (!file) return
        this.imageDialogVisible = true
        this.infoes.push('图片上传中，请稍后……')
        const formData = new FormData()
        formData.append('image', file)
        fetch(this.configs.imageUploadApi, {
          method: 'POST',
          body: formData
        })
          .then(response => {
            this.clearAlertClose()
            if (response.status !== 200) {
              throw new Error(`错误状态码：${response.status}, ${response.text()}`)
            }
            return response.json()
          })
          .then(data => {
            if ((data.code && String(data.code) !== '200') || (data.status && String(data.status) !== '200')) {
              this.warnings.push(`图片上传失败：${data.message ? data.message : data}`)
              return
            }
            let image = data.data
            this.comment.content += `\n![${image.name}](${image.url})\n`
            this.successes.push('图片上传成功！')
          })
          .catch(e => {
            this.clearAlertClose()
            this.warnings.push(`图片上传失败：${e}`)
          })
          .finally(() => (this.imageDialogVisible = false))
      })
      fileElem.click()
    },
    handleSelectEmoji(emoji) {
      this.comment.content += `[/${emoji.name}]`
    },
    clearAlertClose() {
      this.infoes = []
      this.warnings = []
      this.successes = []
    }
  }
}
</script>
