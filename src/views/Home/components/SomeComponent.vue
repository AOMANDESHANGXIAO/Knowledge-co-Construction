<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import eventBus from '@/hooks/eventBus';

const handleMessage = (data: any) => {
    console.log('收到消息:', data);
    // 执行相应的函数
};

onMounted(() => {
    eventBus.on('messagePublished', handleMessage);
});

onBeforeUnmount(() => {
    eventBus.off('messagePublished', handleMessage);
});
</script>

<template>
  <div>
    <h1>消息接收组件</h1>
  </div>
</template> 