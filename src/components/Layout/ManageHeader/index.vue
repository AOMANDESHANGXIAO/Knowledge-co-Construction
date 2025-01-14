<script setup lang="ts">
import { useNow } from "@vueuse/core";
import { format } from "date-fns";

const props = defineProps({
  username: {
    type: String,
    default: "用户",
  },
});

const now = useNow();

const welcomeText = computed(() => {
  const hour = now.value.getHours();
  if (hour < 6) {
    return "凌晨好";
  } else if (hour < 9) {
    return "早上好";
  } else if (hour < 12) {
    return "上午好";
  } else if (hour < 14) {
    return "中午好";
  } else if (hour < 17) {
    return "下午好";
  } else if (hour < 19) {
    return "傍晚好";
  }
  return "晚上好";
});

const formattedNow = computed(() => format(now.value, "yyyy-MM-dd HH:mm:ss"));
</script>

<template>
  <header>
    <div class="welcome-text">{{ welcomeText }}!{{ props.username }}。</div>
    <div>{{ formattedNow }}</div>
  </header>
</template>

<style scoped lang="scss">
header {
  width: 100%;
  height: 400px;
  background-color: var(--theme-color);
  padding: 80px 80px;
  color: #fff;
  font-family: "PingFang", monospace;

  .welcome-text {
    font-size: 22px;
    font-weight: 200;
  }
}
</style>
