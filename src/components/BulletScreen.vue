<template>
  <div>
    <template v-for="comment of comments">
      <div
        class="bullet-screen"
        :class="[comment.stop ? 'stagnation' : '']"
        v-if="comment.style.left"
        :style="comment.style"
        :key="comment.id"
        @mouseenter="() => (comment.stop = true)"
        @mouseleave="() => (comment.stop = false)"
      >
        <avatar :key="comment.id" :src="avatar(comment)" :author="comment.author" :configs="configs" />
        <p v-html="comment.content"></p>
      </div>
    </template>
  </div>
</template>

<script>
import apiClient from '../plugins/api-client'
import Avatar from './Avatar'
import { buildRandomNum, buildSummary, decodeHtml } from '@/utils/util'
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
    }
  },
  created() {
    if (window.innerHeight > 500 && window.innerWidth > 768) {
      this.handleGetComments()
      this.bulletScreenAnimate()
    }
  },
  methods: {
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
        for (let comment of data.content) {
          comment.content = renderedEmojiHtml(
            buildSummary(marked.parse(decodeHtml(comment.content, this.configs.commentHtml)))
          )
          comment.top = buildRandomNum(50, window.innerHeight - 350)
          comment.startTime = new Date().getTime() + buildRandomNum(0, 10000)
          comment.speed = buildRandomNum(0.5, 3)
          this.$set(comment, 'style', { top: comment.top + 'px' })
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
      let requestId
      let _this = this
      function step() {
        let time = new Date().getTime()
        let width = window.innerWidth
        let height = window.innerHeight
        for (let i = _this.comments.length - 1; i >= 0; i--) {
          let comment = _this.comments[i]
          if (comment.stop) continue
          if (comment.startTime <= time) {
            comment.left = comment.left ? comment.left - comment.speed : width
            _this.$set(comment.style, 'left', comment.left + 'px')
            if (comment.top > height) {
              comment.top = buildRandomNum(100, height - 100)
              _this.$set(comment.style, 'top', comment.top + 'px')
            }
          }
          if (comment.left < -420) {
            _this.comments.splice(i, 1)
          }
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
  height: 26px;
  max-width: 420px;
  cursor: pointer;
  overflow: hidden;
  background: var(--bg-a);
  border-radius: 999px;
  transition: color 0.8s;
  border: 1px solid var(--color-a);

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

  p {
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
}
</style>
