<script lang="ts" setup>
import { useCssVar } from '@vueuse/core'
import { LoginForm, RegisterForm, classItem } from './type.ts'
import type { FormInstance, FormRules } from 'element-plus'
import {
  queryClassRoomList,
  signInAction,
  signUpAction,
} from '@/apis/login/index.ts'
import router from '@/router/index.ts'
import { SignInParams } from '@/apis/login/type.ts'
import { useUserStore } from '@/store/modules/user/index.ts'

const themeColor = useCssVar('--theme-color')

const isLogin = ref<boolean>(true)

const toggleRegisterAndLogin = () => {
  isLogin.value = !isLogin.value
}

const loginForm = ref<LoginForm>({
  username: '',
  password: '',
})

// 登录校验规则
const loginRules: FormRules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]{3,10}$/,
      message: '账号由3-10位数字、字母、下划线、减号组成',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]{6,20}$/,
      message: '密码由6-20位数字、字母、下划线、减号组成',
      trigger: 'blur',
    },
  ],
})

const loginButtonLoading = ref<boolean>(false)

const loginFormRef = ref<FormInstance>()

const submitLogin = () => {
  // 模拟进行登录
  if (!loginFormRef) return
  loginFormRef.value?.validate(async valid => {
    if (valid) {
      console.log('submit')
      loginButtonLoading.value = true
      const params = {
        ...loginForm.value,
      }
      signInAction(<SignInParams>params)
        .then(res => {
          const data: any = res
          if (data.success) {
            ElMessage.success('登录成功!')
            // 存储用户信息
            const userStore = useUserStore()
            userStore.setUserInfo(data.data)
            router.push('/manage')
          } else {
            const msg = data.message
            ElMessage.error(msg)
          }
        })
        .catch(() => {
          ElMessage.error('服务器有点累~')
        })
        .finally(() => {
          loginButtonLoading.value = false
        })
    } else {
      console.log('error submit')
    }
  })
}

const registerForm = ref<RegisterForm>({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  class_id: null,
})

// 注册校验规则
const registerRules: FormRules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]{3,10}$/,
      message: '账号由3-10位数字、字母、下划线、减号组成',
      trigger: 'blur',
    },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
  ],
  class_id: [{ required: true, message: '请选择所在班级', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]{6,20}$/,
      message: '密码由6-20位数字、字母、下划线、减号组成',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      validator: function (rule, value, callback) {
        console.log(rule)
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const registerButtonLoading = ref<boolean>(false)

const registerFormRef = ref<FormInstance>()

const classnameList = ref<classItem[]>()

const handleQueryClassList = () => {
  queryClassRoomList()
    .then(res => {
      const data = res
      console.log('data ===> ', data)
      if (data.success) {
        classnameList.value = data.data.list
      }
      // console.log('接口查询列表所得===>', classnameList)
    })
    .catch(err => {
      console.log(err)
    })
}

handleQueryClassList()

const submitRegister = () => {
  if (!registerFormRef) return
  registerFormRef.value?.validate(async valid => {
    if (valid) {
      registerButtonLoading.value = true
      const params = {
        class_id: registerForm.value.class_id,
        username: registerForm.value.username,
        nickname: registerForm.value.nickname,
        password: registerForm.value.password,
      }
      signUpAction(params)
        .then(res => {
          const data= res
          if (data.success) {
            ElMessage.success('注册成功!')
            toggleRegisterAndLogin()
          } else {
            ElMessage.error('注册失败')
          }
        })
        .finally(() => {
          registerButtonLoading.value = false
        })
    } else {
      console.log('error submit')
    }
  })
}
</script>

<template>
  <el-row style="height: 100vh; width: 100vw; overflow: hidden">
    <el-col :span="12">
      <section class="left-container">
        <img src="@/assets/img/collaborative.png" alt="" />
      </section>
    </el-col>
    <el-col :span="12" class="right-container">
      <section
        class="login-form-container"
        :class="{ 'is-transform-left': !isLogin }"
      >
        <div class="title">登录Stream of Thoughts平台</div>
        <el-form
          style="width: 600px"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
        >
          <el-form-item prop="username">
            <div class="sub-title">账号</div>
            <el-input placeholder="请输入账号" v-model="loginForm.username" />
          </el-form-item>
          <el-form-item prop="password">
            <div class="sub-title">密码</div>
            <el-input
              placeholder="请输入密码"
              v-model="loginForm.password"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :color="themeColor"
              style="width: 100%; height: 50px; font-size: 24px"
              round
              :loading="loginButtonLoading"
              @click="submitLogin"
              >登录
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-divider>
              <el-text class="register-text" @click="toggleRegisterAndLogin"
                >还没有账号？点击注册
              </el-text>
            </el-divider>
          </el-form-item>
        </el-form>
      </section>

      <section
        class="register-form-container"
        :class="{ 'is-not-transform': !isLogin }"
      >
        <div class="title">注册Stream of Thoughts平台</div>
        <el-form
          style="width: 600px"
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
        >
          <el-form-item prop="class_id">
            <div class="sub-title">班级</div>
            <el-select
              v-model="registerForm.class_id"
              placeholder="选择您所在的班级 "
            >
              <el-option
                v-for="item in classnameList"
                :key="item.id"
                :label="item.class_name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="username">
            <div class="sub-title">账号</div>
            <el-input
              placeholder="请输入账号"
              v-model="registerForm.username"
            />
          </el-form-item>
          <el-form-item prop="nickname">
            <div class="sub-title">昵称</div>
            <el-input
              placeholder="请输入昵称"
              v-model="registerForm.nickname"
            />
          </el-form-item>
          <el-form-item prop="password">
            <div class="sub-title">密码</div>
            <el-input
              placeholder="请输入密码"
              v-model="registerForm.password"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <div class="sub-title">确认密码</div>
            <el-input
              placeholder="请再次输入密码"
              v-model="registerForm.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :color="themeColor"
              style="width: 100%; height: 50px; font-size: 24px"
              round
              :loading="registerButtonLoading"
              @click="submitRegister"
              >注册
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-divider>
              <el-text class="register-text" @click="toggleRegisterAndLogin"
                >已有账号？点击登录
              </el-text>
            </el-divider>
          </el-form-item>
        </el-form>
      </section>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
$img-bgc-color: #e9efff;
.left-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: $img-bgc-color;

  img {
    width: 500px;
    height: 500px;
    animation: img-move 3s infinite;
  }
}

//动画效果，img 上下走动
@keyframes img-move {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

.right-container {
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form-container,
.register-form-container {
  position: absolute;
  width: 600px;
  padding: 10px;
  box-sizing: content-box;
  overflow: hidden;
  //margin-left: 50%;
  //margin-top: -50%;
  transform: translateX(0%) translateY(0%);
  transition: all 0.5s;

  .is-not-transform {
    transform: translateX(0%) !important;
  }

  .title {
    font-size: 36px;
    margin-bottom: 40px;
    color: #333;
  }

  .sub-title {
    font-size: 20px;
    color: #333;
    margin-bottom: 10px;
  }

  &:deep(.el-select) {
    height: 50px;
  }

  &:deep(.el-select__wrapper) {
    height: 50px;
  }

  &:deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px var(--theme-color);
  }

  &:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--theme-color);
  }

  &:deep(.el-input__wrapper) {
    height: 50px;
  }

  &:deep(.el-text.register-text) {
    &:hover {
      cursor: pointer;
      color: var(--theme-color);
    }
  }
}

.login-form-container.is-transform-left {
  transform: translateX(-200%) translateY(0%) !important;
}

.register-form-container {
  transform: translateX(200%) translateY(50%);
  //margin-bottom: 0;
}

.register-form-container.is-not-transform {
  transform: translateX(0%) translateY(0%) !important;
}
</style>
