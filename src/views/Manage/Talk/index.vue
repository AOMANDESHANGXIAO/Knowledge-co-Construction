<script setup lang="ts">
import manageHeader from '@/components/common/manageHeader/index.vue'
import { useUserStore } from '@/store/modules/user'
import talkCard from '@/components/common/talkCard/index.vue'
import type { TalkCardItem } from './type.ts'
import { queryTopicListApi } from '@/apis/manage_talk/index.ts'
import router from '@/router/index.ts'

const userStore = useUserStore()

const { userInfo } = userStore

const talkCardList = ref<TalkCardItem[]>([])

const queryTopicList = () => {
  const class_id = userStore.userInfo.class_id

  queryTopicListApi(class_id)
    .then(res => {
      const data: any = res

      if (data.success) {
        talkCardList.value = data.data.list
      } else {
        ElNotification({
          title: '查询失败',
          dangerouslyUseHTMLString: false,
          message: data.message,
          type: 'error',
          duration: 2000,
        })
      }
    })
    .catch(() => {
      ElNotification({
        title: '查询失败',
        dangerouslyUseHTMLString: false,
        message: '服务器有点累~',
        type: 'error',
        duration: 2000,
      })
    })
}
queryTopicList()

const handleClick = (topic_id: number) => {
  router.push({ path: '/home', query: { topic_id: topic_id } })
}
</script>

<template>
  <section class="manage-page-talk">
    <manage-header :username="userInfo.nickname"></manage-header>
    <main class="join-talk-container">
      <header>加入讨论!</header>
      <el-divider></el-divider>
      <section class="talk-card-list-container">
        <talk-card
          @click="handleClick"
          v-for="item in talkCardList"
          :key="item.id"
          :id="item.id"
          :created-time="item.created_time"
          :title="item.topic_content"
          :created-user="item.created_user_name"
        ></talk-card>
      </section>
    </main>
  </section>
</template>

<style scoped lang="scss">
@import '@/styles/mixin/title.scss';

.manage-page-talk {
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f9f9f9;

  main {
    transform: translateY(-265px);
    width: calc(100% - 160px);
    margin: 0 auto;
    min-height: 700px;
    padding: 30px;
    border-radius: 30px;
    background-color: var(--dark-color);

    header {
      @include banner-title;
    }

    .talk-card-list-container {
      display: flex;
      justify-content: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }
  }
}
</style>
