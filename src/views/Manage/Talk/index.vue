<script setup lang="ts">
import manageHeader from "@/components/common/manageHeader/index.vue";
import { useUserStore } from "@/store/modules/user";
import talkCard from "@/components/common/talkCard/index.vue";

const userStore = useUserStore();

const { userInfo } = userStore;

const talkCardList = ref([
  {
    createdTime: "2022-01-01",
    title: "人工智能是否有利于促进学生深度学习的发展?",
    createdUser: "谢斌",
  },
  {
    createdTime: "2024-01-01",
    title: "怎样看待人工智能发展?",
    createdUser: "谢斌",
  },
  {
    createdTime: "2022-01-01",
    title: "生成式人工智能怎样影响学生的认知发展?",
    createdUser: "谢斌",
  },
  {
    createdTime: "2022-01-01",
    title: "生成式人工智能怎样影响学生的认知发展?",
    createdUser: "谢斌",
  },
]);
</script>

<template>
  <section class="manage-page-talk">
    <manage-header :username="userInfo.nickname"></manage-header>
    <main class="join-talk-container">
      <header>加入讨论!</header>
      <el-divider></el-divider>
      <section class="talk-card-list-container">
        <talk-card
          v-for="(item, index) in talkCardList"
          :key="index"
          :created-time="item.createdTime"
          :title="item.title"
          :created-user="item.createdUser"
        ></talk-card>
      </section>
    </main>
  </section>
</template>

<style scoped lang="scss">
@import "@/styles/mixin/title.scss";

.manage-page-talk {
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #f9f9f9;

  main {
    transform: translateY(-265px);
    width: calc(100% - 160px);
    margin: 0 auto;
    height: 700px;
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
