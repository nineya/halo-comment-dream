<template>
  <img
    :alt="author ? author + `'s avatar` : 'avatar'"
    :src="configs.avatarLoading"
    class="avatar"
    @click="click"
    @load="handleAvatarLoading"
    @error="handleAvatarError"
  />
</template>
<script>
export default {
  name: 'Avatar',
  props: {
    src: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: false
    },
    configs: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleAvatarLoading(e) {
      const img = e.target || e.srcElement
      if (!img.finish) {
        img.finish = true
        img.src = this.src
      }
    },
    handleAvatarError(e) {
      const img = e.target || e.srcElement
      img.onerror = null
      img.finish = true
      img.src = this.configs.defaultAvatar
    },
    click() {
      this.$emit('click')
    }
  }
}
</script>
