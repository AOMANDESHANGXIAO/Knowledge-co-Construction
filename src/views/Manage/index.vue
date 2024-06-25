<script setup lang="ts">
import Icon from '@/components/Icons/ManagePageIcon/index.vue'
import { Name } from '@/components/Icons/ManagePageIcon/type.ts'
import { useRouter } from 'vue-router'
// 根据当前的路由确定el-menu-item的激活状态
const router = useRouter()

const defaultActive = computed(() => {
  return router.currentRoute.value.path
})
</script>

<template>
  <div class="manage-page">
    <el-row style="height: 100%">
      <el-col :span="3" style="height: 100%">
        <h2>StreamFlow</h2>
        <el-menu
          mode="vertical"
          style="height: calc(100% - 60px)"
          background-color="#222d3c"
          text-color="#fff"
          router
          :default-active="defaultActive"
        >
          <el-menu-item index="/manage/team">
            <section class="menu-item">
              <Icon :name="Name.Team"></Icon>
              <span>团队管理</span>
            </section>
          </el-menu-item>
          <el-menu-item index="/manage/talk">
            <section class="menu-item">
              <Icon :name="Name.Talk"></Icon>
              <span>讨论管理</span>
            </section>
          </el-menu-item>
          <el-menu-item index="/manage/my">
            <section class="menu-item">
              <Icon :name="Name.User"></Icon>
              <span>个人管理</span>
            </section>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="21" style="height: 100%">
        <router-view />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.manage-page {
  width: 100vw;
  height: 100vh;

  h2 {
    width: 100%;
    height: 60px;
    padding: 10px;
    background-color: #222d3c;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    line-height: 40px;

    &:hover {
      cursor: default;
    }
  }

  &:deep(.el-menu-item) {
    &:hover {
      background-color: var(--theme-color);
    }

    &.is-active {
      color: #fff;
      background-color: var(--theme-color);
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 10px;
    padding-left: 20px;
  }
}
</style>
