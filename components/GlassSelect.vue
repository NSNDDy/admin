<template>
  <div class="gs" :class="{ open, disabled }">
    <button class="gs-btn" type="button" :disabled="disabled" @click="toggle">
      <span class="gs-label">{{ currentLabel }}</span>
      <i class="fa-solid fa-chevron-down gs-caret"></i>
    </button>

    <div v-if="open" class="gs-menu">
      <button
        v-for="opt in options"
        :key="opt.value"
        class="gs-item"
        :class="{ selected: String(opt.value) === String(value) }"
        type="button"
        @click="select(opt.value)"
      >
        <span class="gs-item-label">{{ opt.label }}</span>
        <i v-if="String(opt.value) === String(value)" class="fa-solid fa-check gs-check"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlassSelect',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      open: false
    }
  },
  computed: {
    currentLabel() {
      const v = this.value
      const found = this.options.find((o) => String(o.value) === String(v))
      if (found) return found.label
      return this.placeholder || ''
    }
  },
  mounted() {
    if (process.server) return
    document.addEventListener('click', this.onDocClick, true)
    document.addEventListener('keydown', this.onKeydown, true)
  },
  beforeDestroy() {
    if (process.server) return
    document.removeEventListener('click', this.onDocClick, true)
    document.removeEventListener('keydown', this.onKeydown, true)
  },
  methods: {
    toggle() {
      if (this.disabled) return
      this.open = !this.open
    },
    select(v) {
      this.$emit('input', v)
      this.open = false
    },
    close() {
      this.open = false
    },
    onDocClick(e) {
      if (!this.open) return
      if (!this.$el) return
      if (this.$el.contains(e.target)) return
      this.close()
    },
    onKeydown(e) {
      if (!this.open) return
      if (e.key === 'Escape') this.close()
    }
  }
}
</script>

<style scoped>
.gs {
  position: relative;
  width: 100%;
}

.gs-btn {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.50);
  background: rgba(255, 255, 255, 0.25);
  outline: none;
  font-weight: 900;
  font-size: 13px;
  color: rgba(31, 45, 61, 0.78);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease;
}

.gs.open .gs-btn {
  border-color: rgba(102, 126, 234, 0.55);
  box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.14);
}

.gs.disabled .gs-btn {
  opacity: 0.55;
  cursor: not-allowed;
}

.gs-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gs-caret {
  font-size: 12px;
  color: rgba(31, 45, 61, 0.55);
  transition: transform 0.14s ease;
}

.gs.open .gs-caret {
  transform: rotate(180deg);
}

.gs-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(220, 222, 235, 0.65);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 60px rgba(44, 38, 76, 0.18);
  overflow: hidden;
}

.gs-item {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: rgba(31, 45, 61, 0.8);
  font-weight: 800;
  font-size: 13px;
  transition: background 0.12s ease;
}

.gs-item:hover {
  background: rgba(255, 255, 255, 0.18);
}

.gs-item.selected {
  background: rgba(102, 126, 234, 0.14);
}

.gs-check {
  font-size: 12px;
  color: rgba(64, 86, 190, 0.95);
}
</style>
