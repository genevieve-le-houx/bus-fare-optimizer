<script lang="ts">

import { defineComponent } from 'vue'
import MainView from '@/components/MainView.vue';

export default defineComponent({
  name: "App",
  components: {
    MainView,
  }
})

</script>

<template>
  <MainView msg="Bus fare optimizer" />
</template>

<style scoped>

</style>
