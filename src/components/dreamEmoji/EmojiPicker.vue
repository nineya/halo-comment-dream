<template>
  <EmojiList :data="pack" @select="onSelectEmoji" />
</template>

<script>
import EmojiList from './EmojiList'

export default {
  name: 'EmojiPicker',
  props: {
    pack: { type: Array, required: true }
  },
  components: {
    EmojiList
  },
  data: () => ({
    mapEmojis: {}
  }),
  methods: {
    onSelectEmoji(data) {
      this.$emit('select', data)
    }
  }
}
</script>
