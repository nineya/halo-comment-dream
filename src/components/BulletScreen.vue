<template>
  <div v-show="!stopBulletScreen" class="bullet-screen-container">
    <template v-for="comment of comments">
      <div
        class="bullet-screen"
        :class="[comment.stop ? 'stagnation' + (comment.click ? ' click' : '') : '']"
        v-if="comment.style.left"
        :style="comment.style"
        :key="comment.id"
        @click="() => (comment.click = true)"
        @mouseenter="() => (comment.stop = true)"
        @mouseleave="() => handleMouseleave(comment)"
      >
        <template v-if="comment.click">
          <div class="comment-meta">
            <avatar :key="comment.id" :src="avatar(comment)" :author="comment.author" :configs="configs" />
            <div class="comment-author">
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
              <time :datetime="comment.createTime" class="comment-time" itemprop="datePublished">{{
                createTimeAgo(comment.createTime)
              }}</time>
            </div>
          </div>
          <span class="markdown-content" v-html="comment.content"></span>
        </template>
        <template v-else>
          <avatar :key="comment.id" :src="avatar(comment)" :author="comment.author" :configs="configs" />
          <p class="comment-content" v-html="comment.summary"></p>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import apiClient from '../plugins/api-client'
import Avatar from './Avatar'
import { buildRandomNum, buildSummary, decodeHtml, timeAgo } from '@/utils/util'
import { renderedEmojiHtml } from './dreamEmoji/renderedEmoji.js'
import { marked } from 'marked'

export default {
  name: 'BulletScreen',
  components: { Avatar },
  data() {
    return {
      loaded: false,
      comments: []
    }
  },
  props: {
    target: {
      type: String,
      required: false,
      default: 'posts',
      validator: function (value) {
        return ['posts', 'sheets', 'journals'].indexOf(value) !== -1
      }
    },
    id: {
      type: Number,
      required: false,
      default: 0
    },
    options: {
      type: Object,
      required: false,
      default: () => {}
    },
    configs: {
      type: Object,
      required: true
    },
    stopBulletScreen: {
      type: Boolean,
      required: true
    }
  },
  created() {
    if (window.innerHeight > 500 && window.innerWidth > 768) {
      this.handleGetComments()
      this.bulletScreenAnimate()
    }
  },
  methods: {
    /* 处理鼠标离开事件 */
    handleMouseleave(comment) {
      comment.click = false
      comment.stop = false
    },
    /* 转换时间格式 */
    createTimeAgo(createTime) {
      return timeAgo(createTime)
    },
    /* 取得图片链接 */
    avatar(comment) {
      if (!this.configs.priorityQQAvatar && comment.avatar) {
        return comment.avatar
      }
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'
      return `${gravatarSource}${comment.gravatarMd5}?s=256&d=${gravatarDefault}`
    },
    /* 获取评论 */
    async handleGetComments() {
      let page = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data } = await apiClient.comment.listTopComments(this.target, this.id, { page: page++ })
        let time = data.content.length * 100
        for (let comment of data.content) {
          let content = marked.parse(decodeHtml(comment.content, this.configs.commentHtml))
          comment.summary = renderedEmojiHtml(buildSummary(content))
          comment.content = renderedEmojiHtml(content)
          comment.top = buildRandomNum(50, window.innerHeight - 350)
          comment.startTime = buildRandomNum(0, time)
          comment.speed = buildRandomNum(0.5, 3)
          this.$set(comment, 'style', { top: comment.top + 'px' })
          this.$set(comment, 'stop', false)
          this.$set(comment, 'click', false)
        }
        this.comments.push(...data.content)
        if (!data.hasNext) {
          break
        }
      }
      this.loaded = true
    },
    /* 弹幕位置处理与滚动动画 */
    bulletScreenAnimate() {
      const shadowRoot = document.getElementById(this.id + '').shadowRoot
      let requestId
      let _this = this
      function draw() {
        let width = window.innerWidth
        let height = window.innerHeight - 350
        if (height < 50) {
          _this.comments.splice(0, _this.comments.length)
          window.cancelAnimationFrame(requestId)
          return
        }
        for (let i = _this.comments.length - 1; i >= 0; i--) {
          let comment = _this.comments[i]
          if (comment.stop) continue
          if (comment.startTime <= 0) {
            comment.left = comment.left ? comment.left - comment.speed : width
            _this.$set(comment.style, 'left', comment.left + 'px')
            if (comment.top > height) {
              comment.top = buildRandomNum(50, height)
              _this.$set(comment.style, 'top', comment.top + 'px')
            }
          } else {
            comment.startTime -= 1
          }
          if (comment.left < -420) {
            _this.comments.splice(i, 1)
          }
        }
      }
      function step() {
        if (
          !shadowRoot ||
          !shadowRoot.getElementById('halo-comment') ||
          !shadowRoot.getElementById('halo-comment').getAttribute('stop-bullet-screen')
        ) {
          if (_this.stopBulletScreen) {
            _this.stopBulletScreen = false
            _this.$emit('update:stopBulletScreen', false)
          }
          draw()
        } else if (!_this.stopBulletScreen) {
          _this.stopBulletScreen = true
          _this.$emit('update:stopBulletScreen', true)
        }
        if (_this.loaded && _this.comments.length === 0) {
          window.cancelAnimationFrame(requestId)
        } else {
          requestId = window.requestAnimationFrame(step)
        }
      }
      requestId = window.requestAnimationFrame(step)
    }
  }
}
</script>
<style lang="scss">
.bullet-screen {
  position: fixed;
  z-index: 1000;
  cursor: pointer;
  overflow: hidden;
  background: var(--comment-bg-a);
  border-radius: 13px;
  transition: color 0.8s, max-width 0.5s, max-height 0.5s;
  border: 1px solid var(--comment-color-a);

  &:hover,
  &:hover .avatar {
    border-color: var(--comment-theme);
  }

  .avatar {
    padding: 0;
    margin: -1px;
    float: left;
    width: 26px;
    height: 26px;
    cursor: pointer;
  }

  .comment-content {
    line-height: 26px;
    padding: 0 8px 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    .dream-emoji {
      height: 24px;
      margin: auto 2px;
      vertical-align: middle;
    }
  }

  &.stagnation {
    z-index: 1001;
  }

  &:not(.click) {
    max-height: 26px;
    max-width: 420px;
  }

  &.click {
    padding: 4px;
    overflow-y: auto;
    max-height: 350px;
    min-width: 140px;
    max-width: 600px;
  }

  .comment-meta {
    padding-bottom: 2px;
    margin-bottom: 4px;
    border-bottom: 1px solid var(--comment-color-a);
    .avatar {
      width: 32px;
      height: 32px;
    }
  }

  .comment-author {
    max-height: 50px;
    margin-left: 4px;
    display: inline-block !important;
  }

  .is-admin {
    height: 1.5em !important;
    line-height: 1.5em !important;
  }

  .author-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.1em !important;
  }

  .comment-time {
    display: block;
    font-size: 0.8em;
    color: var(--comment-color-c);
  }

  .markdown-content {
    max-height: 300px;
    cursor: initial;
  }
}
</style>
