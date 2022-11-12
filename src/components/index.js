// Register components
import Vue from 'vue'
import { marked } from 'marked'

// pro components
import CommentEditor from './CommentEditor'
import CommentNode from './CommentNode'
import CommentLoading from './CommentLoading'
import Pagination from './Pagination'

const _components = {
  CommentEditor,
  CommentNode,
  CommentLoading,
  Pagination
}

const components = {}

Object.keys(_components).forEach(key => {
  components[key] = Vue.component(key, _components[key])
})

marked.use({
  renderer: {
    listitem(text, task) {
      return `<li${task ? ' class="task-list-item"' : ''}>${text}</li>`
    },
    image(href, title, text) {
      return `<a class="not-render" target="_blank" href="${href}"><img src="${href}"${
        text ? ` alt="${text}"` : ''
      }></a>`
    },
    link(href, title, text) {
      return `<a target="_blank" href="${href}">${text}</a>`
    }
  },
  breaks: true
})

export default components
