<script setup lang="ts">
import manageHeader from '@/components/common/manageHeader/index.vue'
import {useUserStore} from '@/store/useUserStore.ts'
import talkCard from '@/components/common/talkCard/index.vue'
import type {ListItem} from './type.ts'
import {queryTopicListApi} from '@/apis/manageTalk/index.ts'
import {Search} from '@element-plus/icons-vue'
import router from '@/router/index.ts'
import useRequest from "@/hooks/useRequest.ts";

const userStore = useUserStore()

const {userInfo} = userStore

const talkCardList = ref<ListItem[]>([])

const inputValue = ref('')

/* 设置默认值 */
const DESC = 0 // 正向
const ASC = 1 // 逆向
const selectValue = ref(ASC)

const options = [
  {
    value: DESC,
    label: '正向时间排序',
  },
  {
    value: ASC,
    label: '逆向时间排序',
  },
]

const {run: getTopicList} = useRequest({
  apiFn: async () => {
    const class_id = userStore.userInfo.class_id
    const content = inputValue.value
    const sort = selectValue.value
    return queryTopicListApi(class_id, content, +sort)
  },
  immediate: true,
  onSuccess(res: { list: ListItem[] }) {
    talkCardList.value = res.list
  },
  onError() {
    ElNotification({
      title: '查询失败',
      dangerouslyUseHTMLString: false,
      message: '服务器有点累~',
      type: 'error',
      duration: 2000,
    })
  },
  onFail() {
    ElNotification({
      title: '查询失败',
      dangerouslyUseHTMLString: false,
      message: '服务器有点累~',
      type: 'error',
      duration: 2000,
    })
  }
})

const handleClick = (topic_id: number) => {
  router.push({path: '/home', query: {topic_id: topic_id}})

}
const handleSearch = () => {
  getTopicList()
}
watch(selectValue, () => {
  getTopicList()
})
</script>

<template>
  <section class="manage-page-talk">
    <manage-header :username="userInfo.nickname"></manage-header>
    <main class="join-talk-container">
      <header class="title-container">
        <span>加入讨论!</span>
        <div class="input-container">
          <el-select
              v-model="selectValue"
              placeholder="时间排序"
              style="width: 200px;"
          >
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <el-input
              v-model="inputValue"
              placeholder="搜索讨论..."
              @keyup.enter="handleSearch"
              style="width: 200px"
              @change="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch"/>
            </template>
          </el-input>
        </div>
      </header>
      <el-divider></el-divider>
      <section class="talk-card-list-container">
        <talk-card
            style="width:calc(50% - 10px);margin-bottom: 10px;"
            @click="handleClick"
            v-for="item in talkCardList"
            :key="item.id"
            :id="item.id"
            :created-time="item.created_time"
            :title="item.topic_content"
            :created-user="item.nickname"
        ></talk-card>
      </section>
      <el-empty v-if="talkCardList.length === 0" description="暂无讨论"/>
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
      display: flex;
      gap: 10px;

      &:deep(.el-select__wrapper) {
        height: 28px;
        // box-sizing: border-box;
      }

      &:deep(.el-input__wrapper.is-focus) {
        z-index: 10;
        box-shadow: 0 0 0 1px var(--theme-color);
      }
    }

    .title-container {
      display: flex;
      height: 32px;
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
