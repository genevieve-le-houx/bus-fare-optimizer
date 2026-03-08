<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: { type: String, required: true },
  },
  data() {
    return {
      count: 0
    }
  }
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>

</template>

<style scoped>

</style>
