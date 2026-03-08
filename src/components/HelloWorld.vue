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
  },
  computed: {
    textCount(): string {
      return `Count is: ${this.count}`;
    }
  }
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <v-btn 
      type="button" 
      @click="count++"
      :text="textCount"
    />
  </div>

</template>

<style scoped>

</style>
