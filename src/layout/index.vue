<template>
  <div class="w-full" style="height: calc(100vh - 75px)">
    <Siderbar />
    <Navbar />
    <AppMain class="ml-mainLeft mt-mainTop" />
  </div>
</template>

<script lang="ts" setup>
import { Siderbar, AppMain, Navbar } from './component/index'
</script>
