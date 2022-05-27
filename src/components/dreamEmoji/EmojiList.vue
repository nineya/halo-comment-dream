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

<style lang="scss">
.emoji-container {
  max-height: 120px;
  user-select: none;
  border-radius: 4px;
  padding: 6px;
  background: var(--bg-g);
  margin: 5px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(143 143 143 / 30%);
    border-radius: 2em;
  }

  .emoji-item {
    padding: 3px;
    cursor: pointer;
    border-radius: 4px;
    display: inline-block;

    &:hover {
      background-color: rgb(133 135 138 / 20%);
    }

    img {
      display: block;
      width: 30px;
      height: 30px;
    }
  }
}
</style>
