<template>
  <div class="serach">
    <el-input v-model="searchValue" placeholder="视频网址"></el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchValue = ref<string>('')
</script>
