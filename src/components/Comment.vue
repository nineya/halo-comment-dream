<template>
  <div id="halo-comment" class="halo-comment" :class="mergedConfigs.night ? 'night' : ''">
    <keep-alive>
      <comment-editor :configs="mergedConfigs" :options="options" :target="target" :targetId="id" />
    </keep-alive>

    <div v-if="!mergedConfigs.autoLoad && !list.loaded" class="load-comment">
      <button class="btn btn-primary" type="button" @click="handleGetComments">加载评论</button>
    </div>
    <div class="comment-action" v-if="list.loaded">
      <h3 class="comment-title">{{ list.total }} 条评论</h3>
      <svg
        class="comment-refresh"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        @click="handlePaginationChange(0)"
      >
        <path
          d="M55.935033 264.48948c0 0 85.897017-132.548409 221.81443-203.673173 135.916406-71.121743 303.368504-50.646859 413.187968 18.319527 109.819465 68.970415 146.791894 127.160016 146.791894 127.160016l94.59499-53.879895c0 0 19.576483-9.697092 19.576483 12.932142l0 338.379961c0 0 0 30.17399-22.837719 19.395191-19.210878-9.062571-226.959086-127.198289-292.424528-164.466828-35.950145-16.035251-4.365101-29.062068-4.365101-29.062068l91.284402-52.173738c0 0-52.068992-65.209619-128.278989-99.744682-81.576231-42.501826-157.948384-47.541735-251.497925-12.224097-61.002644 23.025054-132.823368 81.988166-184.553949 169.082716L55.935033 264.48948 55.935033 264.48948 55.935033 264.48948zM904.056909 711.697844c0 0-85.897017 132.550423-221.816444 203.671159-135.917413 71.12275-303.366489 50.651895-413.186961-18.315498-109.825508-68.972429-146.790886-127.165052-146.790886-127.165052L27.662591 823.768348c0 0-19.572454 9.703135-19.572454-12.932142L8.090137 472.459267c0 0 0-30.170968 22.831676-19.397205 19.211885 9.067607 226.965129 127.198289 292.430571 164.470856 35.950145 16.035251 4.366109 29.058039 4.366109 29.058039l-91.285409 52.175753c0 0 52.071006 65.206598 128.279996 99.744682 81.57321 42.498804 157.942341 47.540728 251.496918 12.222082 60.998616-23.026061 132.820346-81.983131 184.546898-169.082716L904.056909 711.697844 904.056909 711.697844 904.056909 711.697844zM904.056909 711.697844"
        ></path>
      </svg>
    </div>
    <comment-loading v-show="list.loading" :configs="configs" />
    <ul v-if="list.data.length >= 1" class="comment-nodes">
      <template v-for="(comment, index) in list.data">
        <CommentNode
          :key="index"
          :comment="comment"
          :configs="mergedConfigs"
          :options="options"
          :target="target"
          :targetId="id"
        />
      </template>
    </ul>

    <div v-if="list.loaded && !list.loading && list.data.length <= 0" class="comment-empty">暂无评论</div>

    <pagination
      v-if="list.pages > 1"
      :page="list.params.page"
      :size="list.size"
      :total="list.total"
      @change="handlePaginationChange"
    />
  </div>
</template>
<script>
import './index'
import apiClient from '../plugins/api-client'

const defaultConfig = {
  autoLoad: true,
  showUserAgent: true,
  priorityQQAvatar: false,
  getQQInfo: false,
  commentHtml: false,
  loadingStyle: 'default',
  night: (localStorage && localStorage.getItem('night') === 'true') || false
}

export default {
  name: 'Comment',
  props: {
    id: {
      type: Number,
      required: false,
      default: 0
    },
    type: {
      type: String,
      required: false,
      default: 'post',
      validator: function (value) {
        return ['post', 'sheet', 'journal'].indexOf(value) !== -1
      }
    },
    configs: {
      type: [Object, String],
      required: false,
      default: () => defaultConfig
    }
  },
  data() {
    return {
      list: {
        data: [],
        loading: false,
        loaded: false,
        params: {
          page: 0
        },
        pages: 0,
        total: 0,
        size: 10
      },

      options: {
        comment_gravatar_default: ''
      }
    }
  },
  computed: {
    target() {
      // pluralize it
      return `${this.type}s`
    },
    mergedConfigs() {
      let externalConfigs = {}
      if (Object.prototype.toString.call(this.configs) === '[object String]') {
        externalConfigs = JSON.parse(this.configs)
      }
      return Object.assign(defaultConfig, externalConfigs)
    }
  },
  created() {
    this.handleGetOptions()
    if (this.mergedConfigs.autoLoad) {
      this.handleGetComments()
    }
  },
  methods: {
    async handleGetComments() {
      this.list.loading = true

      const { data } = await apiClient.comment.listAsTreeView(this.target, this.id, this.list.params)

      this.list.data = data.content
      this.list.total = data.total
      this.list.pages = data.pages
      this.list.size = data.rpp

      this.list.loading = false
      this.list.loaded = true
    },

    async handleGetOptions() {
      const { data } = await apiClient.option.comment()
      this.options = data
      if (this.mergedConfigs.priorityQQAvatar) {
        this.options.gravatar_source = 'https://cravatar.cn/avatar/'
      }
    },

    handlePaginationChange(page) {
      this.list.params.page = page
      this.handleGetComments()
    }
  }
}
</script>
<style lang="scss">
@import '../styles/global';
@import '../styles/github-markdown';
</style>
