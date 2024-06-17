<script setup lang="ts">
import {useCssVar} from "@vueuse/core"
import colorPicker from '@/components/common/colorPicker/index.vue'
import waveAnimation from '@/components/common/waveAnimation/index.vue'
import type {FormInstance, FormRules} from 'element-plus'


const themeColor = useCssVar("--theme-color")

const isNotJoinGroup = ref<boolean>(true)

const isCreatingTeam = ref<boolean>(false)

const isCreateButtonLoading = ref<boolean>(false)


const openCreateTeam = () => {
  isCreatingTeam.value = true
  isNotJoinGroup.value = false
}

const form = ref({
  name: "",
  description: "",
  color: ""
})

const formRules: FormRules = reactive({
  name: [
    {required: true, message: "请输入团队名称", trigger: "blur"},
    {min: 1, max: 10, message: "长度在 1 到 10 个字符", trigger: "blur"}
  ],
  description: [
    {required: true, message: "请输入团队描述", trigger: "blur"},
    {min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur"}
  ],
  color: [
    {required: true, message: "请选择团队颜色", trigger: "change"}
  ]
})

const createFormRef = ref<FormInstance | null>(null)

const waveColor = computed(() => {
  if (form.value.color !== "") {
    return form.value.color
  } else {
    return themeColor.value
  }
})

const onCreateTeam = () => {
  if (!createFormRef.value) return
  createFormRef.value.validate((valid) => {
    if (valid) {
      isCreateButtonLoading.value = true
      setTimeout(() => {
        isCreateButtonLoading.value = false
        isCreatingTeam.value = false
        isNotJoinGroup.value = false

        ElNotification({
          title: '创建成功',
          dangerouslyUseHTMLString: true,
          message: '团队代码为<strong>CKB123</strong>,去召唤组员吧!',
          type: 'success',
          duration: 5000
        })

      }, 2000)
      console.log("submit!")
    } else {
      console.log("error submit!")
      return false
    }
  })
}

const handleCancelCreateTeam = () => {
  isCreatingTeam.value = false
  isNotJoinGroup.value = true
}


// 加入团队
const teamCodeInput = ref<string>("")

const isShowTeamCodeInput = ref<boolean>(false)

const toggleShowTeamCodeInput = () => {
  isShowTeamCodeInput.value = !isShowTeamCodeInput.value
}

const onJoinTeam = () => {
  //
  if(teamCodeInput.value.trim() === "") {
    ElNotification({
      title: '请输入团队代码',
      type: 'warning',
      duration: 2000
    })
    return
  }
  ElNotification({
    title: '加入成功',
    dangerouslyUseHTMLString: true,
    message: '欢迎加入<strong>CKB</strong>',
    type: 'success',
    duration: 2000
  })
  isNotJoinGroup.value = false
  isCreatingTeam.value = false
}
</script>

<template>
  <div class="team-manage-page">


    <section v-if="isCreatingTeam" class="creating-team-container">
      <transition name="scale">
      <el-card class="box-card" style="width: 500px">
        <template #header>
          <div class="title">创建团队</div>
        </template>
        <el-form ref="createFormRef" label-position="left" label-width="auto" :model="form" :rules="formRules"
                 hide-required-asterisk>
          <el-form-item label="队名" prop="name">
            <el-input v-model="form.name" placeholder="为你的团队取个名字吧"/>
          </el-form-item>
          <el-form-item label="简介" prop="description">
            <el-input v-model="form.description" type="textarea" rows="4" placeholder="描述你的团队风格"/>
          </el-form-item>
          <el-form-item label="颜色" prop="color">
            <section class="color-picker-container" style="width: 500px">
              <color-picker v-model:selectedColor="form.color"></color-picker>
            </section>
          </el-form-item>
          <el-divider></el-divider>
          <el-form-item>
            <el-button type="primary" @click="onCreateTeam" :color="themeColor" :loading="isCreateButtonLoading">创建
            </el-button>
            <el-button @click="handleCancelCreateTeam" :color="themeColor" plain>取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      </transition>
      <section class="wave-animation-container">
        <wave-animation :color="waveColor"></wave-animation>
      </section>
    </section>

    <section v-else-if="isNotJoinGroup" class="empty-container">
      <el-empty description="还没有加入团队哦,你可以...">
        <div>
          <el-button plain :color="themeColor" size="large" @click="openCreateTeam">创建团队</el-button>
          <el-button :color="themeColor" size="large" @click="toggleShowTeamCodeInput">加入团队</el-button>
        </div>
        <transition name="scale">
          <div style="margin-top: 10px;transition: all .2s" v-if="isShowTeamCodeInput">
            <el-input v-model="teamCodeInput" placeholder="请输入团队码">
              <template #append>
                <el-button :color="themeColor" @click="onJoinTeam">Join!</el-button>
              </template>
            </el-input>
          </div>
        </transition>
      </el-empty>
    </section>

    <section v-else-if="!isNotJoinGroup">
      <div>团队管理页面</div>
    </section>

  </div>
</template>

<style scoped lang="scss">
.team-manage-page {
  width: 100%;
  height: 100%;

  .creating-team-container,.empty-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .wave-animation-container {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -10;
    }

    .title {
      font-size: 24px;
      font-weight: 300;
    }

    &:deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px var(--theme-color);
    }

    &:deep(.el-textarea) {
      --el-input-focus-border-color: var(--theme-color)
    }

    &:deep(.el-input__wrapper) {
      height: 50px;
    }

    &:deep(.el-form-item__label) {
      font-size: 16px;
    }
  }

  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    &:deep(.el-input__wrapper) {
      //防止输入框的阴影颜色被盖住
      z-index:10;
    }
  }
}

.scale-enter, .scale-leave-to {
  transform: scale(0)
}
.scale-leave, .scale-enter-to {
  transform: scale(1)
}
.scale-enter-active, .scale-leave-active {
  transition: all .2s
}

</style>