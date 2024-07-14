<script setup lang="ts">
import manageHeader from '@/components/common/manageHeader/index.vue'
import { useUserStore } from '@/store/modules/user'
import talkCard from '@/components/common/talkCard/index.vue'
import type { ListItem } from './type.ts'
import { queryTopicListApi } from '@/apis/manageTalk/index.ts'
import { Search } from '@element-plus/icons-vue'
import router from '@/router/index.ts'

const userStore = useUserStore()

const { userInfo } = userStore

const talkCardList = ref<ListItem[]>([])

const inputValue = ref('')

const queryTopicList = () => {
  const class_id = userStore.userInfo.class_id
  const content = inputValue.value
  queryTopicListApi(class_id, content)
    .then(res => {
      const data = res

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
  // router.go(0)
}


const handleSearch = () => {
  queryTopicList()
}
</script>

<template>
  <section class="manage-page-talk">
    <manage-header :username="userInfo.nickname"></manage-header>
    <main class="join-talk-container">
      <header class="title-container">
        <span>加入讨论!</span>
        <div class="input-container">
          <el-input
            v-model="inputValue"
            placeholder="搜索讨论..."
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </header>
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
  overflow-y: auto;
  overflow-x: hidden;
  // overflow: hidden;
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
    .input-container {
      width: 200px;
      &:deep(.el-input__wrapper.is-focus) {
        z-index: 10;
        box-shadow: 0 0 0 1px var(--theme-color);
      }
    }
    .title-container {
      display: flex;
      height: 50px;
      justify-content: space-between;
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
