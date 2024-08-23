<script setup lang="ts">
import colorPicker from '@/components/common/colorPicker/index.vue'
import waveAnimation from '@/components/common/waveAnimation/index.vue'
import analysisItem from '@/components/common/analysisItem/index.vue'
import memberAnalysis from '@/components/common/memberAnalysis/index.vue'
import manageHeader from '@/components/common/manageHeader/index.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useColorStore } from '@/store/modules/color'
import {
  createGroupApi,
  joinGroupApi,
  queryCollaborationData,
  queryMemberData,
  queryGroupStudentsApi,
} from '@/apis/group/index.ts'
import {
  CreateGroupParams,
  CollaborationListItem,
  QueryGroupMemberItem,
} from '@/apis/group/type.ts'
import { TeamStatus } from './type.ts'
import groupMemberItem from './components/groupMember/index.vue'

const userStore = useUserStore()

const { userInfo } = userStore

// 管理当前页面的状态
const teamStatus = ref<TeamStatus>(TeamStatus.groupAnalysis)

const initTeamStatus = () => {
  // 判断用户信息中的group_id是否为null
  if (userInfo && !userInfo.group_id) {
    teamStatus.value = TeamStatus.notJoinGroup
  } else {
    teamStatus.value = TeamStatus.groupAnalysis
  }
}

initTeamStatus()

const setTeamStatus = (status: TeamStatus) => {
  teamStatus.value = status
}

const { themeColor } = useColorStore()

const isCreateButtonLoading = ref<boolean>(false)

const groupForm = ref({
  group_name: '',
  group_description: '',
  color: '',
})

const formRules: FormRules = reactive({
  group_name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' },
  ],
  group_description: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  color: [{ required: true, message: '请选择团队颜色', trigger: 'change' }],
})

const createFormRef = ref<FormInstance | null>(null)

const waveColor = computed(() => {
  if (groupForm.value.color !== '') {
    return groupForm.value.color
  } else {
    return themeColor
  }
})

const openCreateTeam = () => {
  setTeamStatus(TeamStatus.creating)
}

const handleCancelCreateTeam = () => {
  setTeamStatus(TeamStatus.notJoinGroup)
}

const onCreateTeam = () => {
  if (!createFormRef.value) return
  createFormRef.value.validate(valid => {
    if (valid) {
      isCreateButtonLoading.value = true

      const params: CreateGroupParams = {
        student_id: userInfo.id,
        group_name: groupForm.value.group_name,
        group_description: groupForm.value.group_description,
        group_color: groupForm.value.color,
        class_id: userInfo.class_id,
      }

      createGroupApi(params)
        .then(res => {
          const data: any = res
          if (data.success) {
            isCreateButtonLoading.value = false

            const result = data.data

            userStore.setUserInfo(result)

            ElNotification({
              title: '创建成功',
              dangerouslyUseHTMLString: true,
              message: `团队代码为<strong>${userStore.userInfo.group_code}</strong>,去召唤组员吧!`,
              type: 'success',
              duration: 5000,
            })

            setTeamStatus(TeamStatus.groupAnalysis)
          } else {
            ElNotification({
              title: '创建失败',
              dangerouslyUseHTMLString: true,
              message: data.message,
              type: 'error',
              duration: 5000,
            })
          }
        })
        .finally(() => {
          isCreateButtonLoading.value = false
        })
    } else {
      console.log('error submit!')
    }
  })
}

// 加入团队
const teamCodeInput = ref<string>('')

const isShowTeamCodeInput = ref<boolean>(false)

const toggleShowTeamCodeInput = () => {
  isShowTeamCodeInput.value = !isShowTeamCodeInput.value
}

const onJoinTeam = () => {
  //
  if (teamCodeInput.value.trim() === '') {
    ElNotification({
      title: '请输入团队代码',
      type: 'warning',
      duration: 2000,
    })
    return
  }
  const params = {
    student_id: userInfo.id,
    group_code: teamCodeInput.value,
  }

  joinGroupApi(params)
    .then(res => {
      const data: any = res
      if (data.success) {
        const result = data.data
        userStore.setUserInfo(result)

        ElNotification({
          title: '加入成功',
          dangerouslyUseHTMLString: true,
          message: `欢迎加入<strong>${result.group_name}</strong>`,
          type: 'success',
          duration: 2000,
        })

        setTeamStatus(TeamStatus.groupAnalysis)
      } else {
        ElNotification({
          title: '加入失败',
          dangerouslyUseHTMLString: true,
          message: data.message,
          type: 'error',
          duration: 2000,
        })
      }
    })
    .finally(() => {})
}

const groupAnalysisList = ref<CollaborationListItem[]>([])

const queryCollaborationDataApi = () => {
  const group_id = userStore.userInfo.group_id as unknown as number

  if (!group_id) return

  queryCollaborationData(group_id)
    .then((res: any) => {
      if (res.success) {
        groupAnalysisList.value = res.data.list
      } else {
        console.log(res.message)
      }
    })
    .catch(err => {
      console.log(err)
    })
}

queryCollaborationDataApi()

const chartDataList_ = ref({
  feedbackList: [],
  proposeList: [],
  summaryList: [],
})

const queryMemberDataApi = () => {
  const group_id = userStore.userInfo.group_id as unknown as number

  if (!group_id) return

  queryMemberData(group_id).then((res: any) => {
    if (res.success) {
      chartDataList_.value = res.data
    } else {
      console.log(res.message)
    }
  })
}
queryMemberDataApi()

const groupStudentList = ref<QueryGroupMemberItem[]>([])

const queryGroupStudents = () => {
  const id = userStore.userInfo.group_id as unknown as number

  if (!id) return

  queryGroupStudentsApi(id).then(res => {
    if (res.success) {
      groupStudentList.value = res.data.list
    } else {
      console.log(res.message)
    }
  })
}
queryGroupStudents()
</script>

<template>
  <div class="team-manage-page">
    <section
      v-if="teamStatus === TeamStatus.creating"
      class="creating-team-container"
    >
      <transition name="scale">
        <el-card class="box-card" style="width: 500px">
          <template #header>
            <div class="title">创建团队</div>
          </template>
          <el-form
            ref="createFormRef"
            label-position="left"
            label-width="auto"
            :model="groupForm"
            :rules="formRules"
            hide-required-asterisk
          >
            <el-form-item label="队名" prop="group_name">
              <el-input
                v-model="groupForm.group_name"
                placeholder="为你的团队取个名字吧"
              />
            </el-form-item>
            <el-form-item label="简介" prop="group_description">
              <el-input
                v-model="groupForm.group_description"
                type="textarea"
                rows="4"
                placeholder="描述你的团队风格"
              />
            </el-form-item>
            <el-form-item label="颜色" prop="color">
              <section class="color-picker-container" style="width: 500px">
                <color-picker
                  v-model:selectedColor="groupForm.color"
                ></color-picker>
              </section>
            </el-form-item>
            <el-divider></el-divider>
            <el-form-item>
              <el-button
                type="primary"
                @click="onCreateTeam"
                :color="themeColor"
                :loading="isCreateButtonLoading"
                >创建
              </el-button>
              <el-button
                @click="handleCancelCreateTeam"
                :color="themeColor"
                plain
                >取消
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </transition>
      <section class="wave-animation-container">
        <wave-animation :color="waveColor"></wave-animation>
      </section>
    </section>

    <section
      v-else-if="teamStatus === TeamStatus.notJoinGroup"
      class="empty-container"
    >
      <el-empty description="还没有加入团队哦,你可以...">
        <div>
          <el-button
            plain
            :color="themeColor"
            size="large"
            @click="openCreateTeam"
            >创建团队
          </el-button>
          <el-button
            :color="themeColor"
            size="large"
            @click="toggleShowTeamCodeInput"
            >加入团队
          </el-button>
        </div>
        <transition name="scale">
          <div
            style="margin-top: 10px; transition: all 0.2s"
            v-if="isShowTeamCodeInput"
          >
            <el-input v-model="teamCodeInput" placeholder="请输入团队码">
              <template #append>
                <el-button :color="themeColor" @click="onJoinTeam"
                  >Join!
                </el-button>
              </template>
            </el-input>
          </div>
        </transition>
      </el-empty>
    </section>

    <section
      v-else-if="teamStatus === TeamStatus.groupAnalysis"
      class="group-manage-container"
    >
      <manage-header :username="userInfo.nickname"></manage-header>
      <main>
        <section class="group-info">
          <div class="title">{{ userStore.userInfo.group_name }}的团队统计</div>
          <div class="group-code">
            团队码:&nbsp;{{ userStore.userInfo.group_code }}
          </div>
          <el-divider></el-divider>
          <div class="group-member">
            <h3>团队成员:</h3>
            <div class="memeber-list">
              <group-member-item
                v-for="item in groupStudentList"
                :data="item.data"
                :title="item.title"
                :name="item.name"
                :id="item.id"
                :key="item.id"
              ></group-member-item>
            </div>
          </div>
          <el-divider></el-divider>
          <section class="group-analysis">
            <analysis-item
              v-for="(item, index) in groupAnalysisList"
              :key="index"
              :icon-name="item.iconName"
              :num="item.num"
              :text="item.text"
            ></analysis-item>
          </section>
        </section>
        <section class="group-member-analysis">
          <member-analysis
            :chart-data="chartDataList_.proposeList"
            title="😁分享观点"
          ></member-analysis>
          <member-analysis
            :chart-data="chartDataList_.feedbackList"
            title="🤔反馈观点"
          ></member-analysis>
          <member-analysis
            :chart-data="chartDataList_.summaryList"
            title="😎总结观点"
          ></member-analysis>
        </section>
      </main>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/mixin/layout.scss';
@import '@/styles/mixin/title.scss';

@mixin group-analysis-container-layout {
  width: calc(100% - 160px);
  margin: 0 auto;
  min-height: 400px;
  padding: 30px;
  border-radius: 30px;
  background-color: var(--dark-color);
}

.team-manage-page {
  width: 100%;
  height: 100%;
  overflow-x: hidden;

  .memeber-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
    align-items: baseline;
    // align-items: center;
  }


  .creating-team-container,
  .empty-container {
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
      @include banner-title;
    }

    &:deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px var(--theme-color);
    }

    &:deep(.el-textarea) {
      --el-input-focus-border-color: var(--theme-color);
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
      z-index: 10;
    }
  }
}

.scale-enter,
.scale-leave-to {
  transform: scale(0);
}

.scale-leave,
.scale-enter-to {
  transform: scale(1);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s;
}

.group-manage-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  main {
    width: 100%;
    transform: translateY(-75px);

    .group-info {
      @include group-analysis-container-layout;
      color: #fff;

      .title {
        color: #fff;
        font-size: 24px;
        font-weight: 300;
      }

      .group-code {
        color: #fff;
        font-weight: 300;
      }

      .group-analysis {
        @include flex-gap-flex-evenly(20px);
      }
    }

    .group-member-analysis {
      @include group-analysis-container-layout;
      @include flex-gap-flex-evenly(20px);
      margin-top: 10px;
    }
  }
}
</style>
