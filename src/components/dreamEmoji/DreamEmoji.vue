<template>
  <span class="emoji-item" :title="data.name">
    <img
      :alt="data.name"
      :src="dreamSrc"
      onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='"
    />
  </span>
</template>

<script>
export default {
  name: 'DreamEmoji',
  props: {
    data: {
      type: Object
    },
    url: {
      type: String,
      required: false,
      default: `${process.env.BASE_URL}assets/emoji/`
    }
  },
  computed: {
    dreamSrc() {
      return this.url + this.data.fileName + '.png'
    }
  }
}
</script>
