<script lang="ts" setup>
import {Handle, Position} from "@vue-flow/core";
import {watch} from 'vue'
import lottie from '@/components/common/lottie/index.vue'
import LoadingAnimation from '@/assets/animation/loading.json'
import {useCssVar, useElementHover} from '@vueuse/core'
import { IdeaNodeProps } from './type.ts'

// 控制按钮的主题颜色
const themeColor = useCssVar('--theme-color')

interface Props {
  data: IdeaNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    id: 'noId',
    name: '学生',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top
  })
})


// 控制学生内容信息的加载
const loading = ref<boolean>(true)

const optionText = ref<string>('')

const mockData = () => {
  //  模拟与后端通信拿到学生的观点信息
  let timer = setTimeout(() => {
    optionText.value = '我认为人工智能在2020年，将会成为人类生活必需品。而且2020年，人工智能将改变世界。我的依据是，人工智能将改变世界。我的依据是，人工智能将改变世界。我的依据是，人工智能将改变世界。我的依据是，人工智能将改变世界。我的依据'
    clearTimeout(timer)
    loading.value = false
  }, 2000)
}


// ========== 实现悬停时至少显示一秒 ============
const myHoverableElement = ref()

const isHovered = useElementHover(myHoverableElement)

const isShow = ref<boolean>(false)

const timer = ref()

watch(() => isHovered.value, (newVal) => {
  if(newVal) {
    // 只要鼠标悬浮在上面就开始定时器，如果超过
    isShow.value = true
    if(timer.value) {
      clearTimeout(timer.value)
    }
    if (loading.value) {
      mockData()
    }
  } else {
    timer.value = setTimeout(() => {
      isShow.value = false
    }, 1000)
  }
})



// 向父组件传递事件，同意或者反对
const emits = defineEmits(['reply-oppose', 'reply-approve'])

const sendReply = (emitEvent: 'reply-oppose' | 'reply-approve') => {
  emits(emitEvent, props.data.id)
}


</script>

<template>
  <div class="idea-node" ref="myHoverableElement">
    <Handle :position="props.data.targetPosition" type="target"/>
    <Handle :position="props.data.sourcePosition" type="source"/>
    <span>{{ props.data.name }}</span>
    <transition name="fade">
      <section v-if="isShow" class="content-container">
        <div class="idea-container">
          <lottie v-if="loading" :animation-data="LoadingAnimation"/>
          <div v-else style="width: 100%;">
            <el-text>{{ optionText }}</el-text>
            <el-divider content-position="left">🤔回应观点</el-divider>
            <div class="button-group">
              <el-button type="danger" @click.prevent="sendReply('reply-oppose')">比较反对</el-button>
              <el-button :color="themeColor" @click.prevent="sendReply('reply-approve')">比较赞同</el-button>
            </div>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
$node-width: 50px;
.idea-node {
  position: relative;
  width: $node-width;
  height: $node-width;
  border-radius: 50%;
  background-color: #67c23a;
  color: #fff;
  font-size: 10px;
  text-align: center;
  line-height: $node-width;


  span {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:hover {
    background-color: lighten($color: #67c23a, $amount: 10%);
  }

  .content-container {
    position: absolute;
    top: 0;
    left: calc(#{$node-width} + 10px);
    transform: translateY(calc(-50% + #{$node-width} / 2));
    width: 200px;
    min-height: 100px;
    max-height: 500px;
    overflow: auto;
    padding: 10px;
    border-radius: 10px;
    background-color: #fff;
    color: #242424;
    font-size: 12px;
    box-shadow: 0 2px 2px 2px #f3f3f3;
    z-index: 999; // 保证显示在最上层
    .idea-container {
      width: 100%;
      height: 100%;
      text-align: left;
      line-height: 1;

      &:deep(.el-text) {
        font-size: 12px;
      }
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      width: 100%;

      &:deep(.el-button) {
        margin-left: 0;

        span {
          font-size: 14px;
        }

        //font-size: 14px;
      }
    }

  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>