<template>
  <button class="btn" :class="classes" :disabled="disabled" type="button" @click="handleClick">
    <slot />
  </button>
</template>
<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    size: {
      type: String,
      default: 'md'
    },
    circle: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes() {
      return [`btn-${this.size}`, `btn-${this.type}`, { 'btn-circle': this.circle }, { 'btn-block': this.block }]
    }
  },
  methods: {
    handleClick(e) {
      if (!this.disabled) {
        this.$emit('click', e)
      }
    }
  }
}
</script>
