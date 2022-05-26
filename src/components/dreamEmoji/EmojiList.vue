<template>
  <div class="emoji-container">
    <DreamEmoji v-for="(emoji, index) in data" :key="index" :data="emoji" @click.native="onSelect(emoji)" />
  </div>
</template>

<script>
import DreamEmoji from './DreamEmoji'

export default {
  name: 'EmojiList',
  components: {
    DreamEmoji
  },
  props: {
    data: { type: Object }
  },
  methods: {
    onSelect(emoji) {
      this.$emit('select', emoji)
    }
  },
  watch: {
    data() {
      this.$refs['container-emoji'].scrollTop = 0
    }
  }
}
</script>

<style type="scss">
.emoji-container {
  .emoji-item {
    img {
      width: 30px;
    }
  }
}
</style>
