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
        <a :href="`${comment.authorUrl ? comment.authorUrl : 'javascript:void(0)'}`" rel="nofollow" target="_blank">
          <img :alt="comment.author + `'s avatar`" :src="avatar" class="avatar" />
        </a>
      </div>
      <div class="comment-main">
        <div class="comment-meta">
          <div class="comment-author" itemprop="author">
            <div class="author-info">
              <a :href="comment.authorUrl" class="author-name" rel="nofollow" target="_blank">{{ comment.author }}</a>
              <span v-if="comment.isAdmin" class="is-admin">博主</span>
            </div>
            <span class="btn btn-primary comment-reply" @click="editing = !editing">{{
              editing ? '取消回复' : '回复'
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
          <div class="markdown-content" ref="comment">
            <span
              v-if="parent"
              class="comment-reference"
              @mouseenter="handleHighlightParent"
              @mouseleave="handleHighlightParent(false)"
            >
              <a :href="'#comment-' + this.parent.id">@{{ this.parent.author }}</a>
            </span>
          </div>
        </div>
      </div>
    </div>
    <comment-editor
      v-if="editing"
      :configs="configs"
      :options="options"
      :replyComment="comment"
      :target="target"
      :targetId="targetId"
    />
    <ol v-if="comment.children" class="children-nodes">
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
    </ol>
  </li>
</template>
<script>
import './index'
import { timeAgo } from '@/utils/util'
import ua from 'ua-parser-js'
import { marked } from 'marked'

const rendererMD = new marked.Renderer()
rendererMD.listitem = function (text, task) {
  return `<li${task ? ' class="task-list-item"' : ''}>${text}</li>`
}

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
      editing: false
    }
  },
  created: function () {
    this.$nextTick(function () {
      let tempNode = document.createElement('div')
      tempNode.innerHTML = marked.parse(this.comment.content, { renderer: rendererMD })
      tempNode.childNodes.forEach(node => this.$refs.comment.appendChild(node))
    })
  },
  computed: {
    avatar() {
      const gravatarDefault = this.options.comment_gravatar_default
      const gravatarSource = this.options.gravatar_source || '//cn.gravatar.com/avatar/'
      if (this.comment.avatar) {
        return this.comment.avatar
      }
      return `${gravatarSource}${this.comment.gravatarMd5}?s=256&d=${gravatarDefault}`
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
