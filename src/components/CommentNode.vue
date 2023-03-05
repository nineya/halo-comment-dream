<template>
  <li
    v-if="comment.no <= replyNum"
    :id="'li-comment-' + comment.id"
    :class="commentClass"
    class="comment"
    itemprop="comment"
    itemtype="https://schema.org/Comment"
  >
    <div :id="'comment-' + comment.id" :ref="'comment-' + comment.id" class="comment-body">
      <div class="avatar-body">
        <a
          v-if="comment.authorUrl && comment.authorUrl !== ''"
          :href="comment.authorUrl"
          rel="nofollow"
          target="_blank"
        >
          <avatar :src="avatar" :author="comment.author" :configs="configs" />
        </a>
        <avatar v-else :src="avatar" :author="comment.author" :configs="configs" />
      </div>
      <div class="comment-main">
        <div class="comment-meta">
          <div class="comment-author" itemprop="author">
            <div class="author-meta">
              <a
                v-if="comment.authorUrl && comment.authorUrl !== ''"
                :href="comment.authorUrl"
                class="author-name"
                rel="noopener noreferrer nofollow"
                target="_blank"
                >{{ comment.author }}</a
              >
              <a v-else class="author-name">{{ comment.author }}</a>
              <span v-if="comment.isAdmin" class="is-admin">博主</span>
            </div>
            <div class="author-operation">
              <span class="btn btn-primary comment-reply" @click="handleCreateComment">{{
                globalData.replyId === comment.id ? '取消回复' : '回复'
              }}</span>
              <div class="btn comment-operation">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200">
                  <g>
                    <circle cx="60" cy="31.1" r="18.4" />
                    <circle cx="60" cy="100" r="18.4" />
                    <circle cx="60" cy="168.9" r="18.4" />
                  </g>
                </svg>
                <ol class="comment-operation-list">
                  <li v-if="commentStatus === 'published'" @click="() => handleUpdateCommentStatus('RECYCLE')">
                    回收站
                  </li>
                  <li v-if="commentStatus === 'recycle'" @click="() => handleUpdateCommentStatus('PUBLISHED')">恢复</li>
                  <li v-if="commentStatus === 'recycle'" @click="handleDeleteComment">永久删除</li>
                </ol>
              </div>
            </div>
          </div>
          <div class="comment-info">
            <time :datetime="comment.createTime" class="comment-time" itemprop="datePublished">{{
              createTimeAgo
            }}</time>
            <div v-if="configs.showUserAgent" class="useragent-info">
              {{ compileUserAgent }}
            </div>
          </div>
        </div>
        <div class="markdown-body" itemprop="description">
          <span
            v-if="parent"
            class="comment-reference"
            @click="handleToCommentRef"
            @mouseenter="handleHighlightParent"
            @mouseleave="handleHighlightParent(false)"
          >
            <a :href="'#comment-' + this.parent.id">@{{ this.parent.author }}</a>
          </span>
          <span class="markdown-content" v-html="compileContent"></span>
        </div>
      </div>
    </div>
    <keep-alive>
      <comment-editor
        v-if="globalData.replyId === comment.id"
        :configs="configs"
        :options="options"
        :replyComment="comment"
        :target="target"
        :targetId="targetId"
      />
    </keep-alive>
    <ul v-if="comment.children" class="children-nodes">
      <!-- :parent="comment" 修改为 children.parent，因为原先的树结构被破坏 -->
      <template v-for="children in comment.children">
        <CommentNode
          :key="children.id"
          :comment="children"
          :configs="configs"
          :replyNum="replyNum"
          :isChild="true"
          :options="options"
          :parent="children.parent"
          :target="target"
          :targetId="targetId"
        />
      </template>
    </ul>
    <div class="unfold-reply" v-if="!isChild && replyNum < comment.replyCount">
      <span @click="replyNum += Math.max(Math.min(replyNum, 20), 6)"
        >展开{{ comment.replyCount - replyNum }}条回复</span
      >
    </div>
  </li>
</template>
<script>
import './index'
import { animateScroll, timeAgo, decodeHtml } from '@/utils/util'
import ua from 'ua-parser-js'
import { marked } from 'marked'
import globals from '@/utils/globals.js'
import { renderedEmojiHtml } from './dreamEmoji/renderedEmoji.js'
import Avatar from './Avatar'
import adminClient from '@/plugins/admin-client'

export default {
  name: 'CommentNode',
  components: { Avatar },
  props: {
    isChild: {
      type: Boolean,
      required: false,
      default: false
    },
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
    parent: {
      type: Object,
      required: false
    },
    comment: {
      type: Object,
      required: false,
      default: () => {}
    },
    replyNum: {
      type: Number,
      required: true,
      default: 10
    },
    options: {
      type: Object,
      required: false,
      default: () => {}
    },
    configs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      globalData: globals,
      // published表示正常，recycle表示回收，delete表示删除
      commentStatus: 'published'
    }
  },
  computed: {
    avatar() {
      if (!this.configs.priorityQQAvatar && this.comment.avatar) {
        return this.comment.avatar
      }
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'
      return `${gravatarSource}${this.comment.gravatarMd5}?s=256&d=${gravatarDefault}`
    },
    compileContent() {
      return marked.parse(renderedEmojiHtml(decodeHtml(this.comment.content, this.configs.commentHtml)))
    },
    createTimeAgo() {
      return timeAgo(this.comment.createTime)
    },
    compileUserAgent() {
      const parser = new ua()
      parser.setUA(this.comment.userAgent)
      const result = parser.getResult()
      return `（${result.browser.name} ${result.browser.version} in ${result.os.name} ${result.os.version}）`
    },
    commentClass() {
      let isChild = this.isChild ? ' ' : ' index-1'
      return ' li-comment-' + this.comment.id + isChild + ' ' + this.commentStatus
    }
  },
  methods: {
    handleToCommentRef() {
      const shadowRoot = document.getElementById(this.targetId + '').shadowRoot
      if (!shadowRoot) {
        return
      }
      const commentRef = shadowRoot.getElementById(`comment-${this.parent.id}`)
      commentRef.classList.add('comment-active')
      animateScroll(commentRef, 20, (window.innerHeight || document.documentElement.clientHeight) / 4, () =>
        setTimeout(() => commentRef.classList.remove('comment-active'), 500)
      )
    },
    handleCreateComment() {
      if (this.globalData.replyId === this.comment.id) {
        this.globalData.replyId = 0
      } else {
        this.globalData.replyId = this.comment.id
        this.$nextTick(() => {
          const commentEditor = this.$el.querySelector('.comment-editor')
          const rect = commentEditor.getBoundingClientRect()
          const windowHeight = window.innerHeight || document.documentElement.clientHeight
          if (rect.top < 0 || rect.bottom > windowHeight) {
            animateScroll(commentEditor, 20, windowHeight / 2)
          }
        })
      }
    },
    handleHighlightParent(highlight) {
      const shadowRoot = document.getElementById(this.targetId + '').shadowRoot
      if (!shadowRoot) {
        return
      }
      const commentRef = shadowRoot.getElementById(`comment-${this.parent.id}`)
      if (commentRef) {
        const classList = commentRef.classList
        highlight ? classList.add('comment-ref') : classList.remove('comment-ref')
      }
    },
    handleUpdateCommentStatus(status) {
      adminClient.comment
        .updateStatusById(this.target, this.comment.id, status)
        .then(() => {
          this.commentStatus = status.toLowerCase()
          window.alert('操作成功！')
        })
        .catch(error => {
          this.handleFailedToOperationComment(error)
        })
    },
    handleDeleteComment() {
      adminClient.comment
        .delete(this.target, this.comment.id)
        .then(() => {
          this.commentStatus = 'delete'
          window.alert('已删除该评论！')
        })
        .catch(error => {
          this.handleFailedToOperationComment(error)
        })
    },
    handleFailedToOperationComment(response) {
      if (response.status === 400) {
        window.alert(response.data.message)
      } else if (response.status === 401) {
        window.alert('操作失败，博主登录状态已失效！')
      } else {
        window.alert(`操作失败：${response.data}`)
      }
    }
  }
}
</script>
