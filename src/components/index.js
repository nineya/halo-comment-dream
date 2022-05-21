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
    }
  }
})

export default components
