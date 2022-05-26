<template>
  <li
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
          <img :alt="comment.author + `'s avatar`" :src="avatar" class="avatar" />
        </a>
        <img v-else :alt="comment.author + `'s avatar`" :src="avatar" class="avatar" />
      </div>
      <div class="comment-main">
        <div class="comment-meta">
          <div class="comment-author" itemprop="author">
            <div class="author-meta">
              <a
                v-if="comment.authorUrl && comment.authorUrl !== ''"
                :href="comment.authorUrl"
                class="author-name"
                rel="nofollow"
                target="_blank"
                >{{ comment.author }}</a
              >
              <a v-else class="author-name">{{ comment.author }}</a>
              <span v-if="comment.isAdmin" class="is-admin">博主</span>
            </div>
            <span class="btn btn-primary comment-reply" @click="handleCreateComment">{{
              globalData.replyId === comment.id ? '取消回复' : '回复'
            }}</span>
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
      <template v-for="(children, index) in comment.children">
        <CommentNode
          :key="index"
          :comment="children"
          :configs="configs"
          :isChild="true"
          :options="options"
          :parent="comment"
          :target="target"
          :targetId="targetId"
        />
      </template>
    </ul>
  </li>
</template>
<script>
import './index'
import { animateScroll, timeAgo } from '@/utils/util'
import ua from 'ua-parser-js'
import { marked } from 'marked'
import globals from '@/utils/globals.js'
import { decodeHtml } from '../utils/util'

export default {
  name: 'CommentNode',
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
      globalData: globals
    }
  },
  computed: {
    avatar() {
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'
      if (!this.configs.priorityQQAvatar && this.comment.avatar) {
        return this.comment.avatar
      }
      return `${gravatarSource}${this.comment.gravatarMd5}?s=256&d=${gravatarDefault}`
    },
    compileContent() {
      return marked.parse(decodeHtml(this.comment.content, this.configs.commentHtml))
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
      return ' li-comment-' + this.comment.id + isChild
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
    }
  }
}
</script>
