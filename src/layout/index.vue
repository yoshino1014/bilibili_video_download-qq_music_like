<template>
  <div class="w-full h-full">
    <Siderbar />
    <Navbar />
    <AppMain class="ml-mainLeft mt-mainTop" />
  </div>
</template>

<script lang="ts" setup>
import { Siderbar, AppMain, Navbar } from './component/index'
</script>
