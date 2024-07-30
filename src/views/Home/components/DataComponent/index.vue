<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import tips from '../toolTips/index.vue'
import { useForm } from '@/hooks/form'

defineOptions({
  name: 'DataComponent',
})

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const active = ref('0')

const emit = defineEmits(['update:modelValue'])

const { form, formRef, rules, updateModelValue } = useForm({
  message: '论证的前提条件不能为空!',
  emit,
})

const el = ref<HTMLElement | null>(null)

const isHovered = useElementHover(el)
</script>

<template>
  <div
    class="data-component-container"
    @dblclick="dialogVisible = true"
    ref="el"
  >
    <div class="title">前提</div>
    <div class="text-container">
      <div class="text">
        {{ form.inputValue || '此处添加前提,双击以编辑' }}
      </div>
    </div>
    <Handle
      type="target"
      :position="Position.Top"
      :connectable="false"
    ></Handle>
    <Handle
      type="source"
      :position="Position.Bottom"
      :connectable="false"
    ></Handle>

    <tips
      :value="form.inputValue"
      defaultValue="还未添加前提"
      v-show="isHovered"
    ></tips>
  </div>

  <el-dialog
    title="输入论证的前提条件"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-collapse v-model="active">
      <el-collapse-item title="前提条件是什么？" name="1">
        <el-text>
          前提条件(Data)是支持论题(Claim)的证据或事实，是你用来证明论题的基础。例如你要证明"人们应该每天锻炼",那么你论证的前提可能是"锻炼有助于保持健康，减少患病的风险。"
        </el-text>
        <el-text
          >我们使用D表示前提,
          使用C表示论题。那么"D一类的数据使人们得出类似C的结论或提出类似C的主张"，或"既然D,必然C"。</el-text
        >
      </el-collapse-item>
    </el-collapse>
    <el-form ref="formRef" :rules="rules" :model="form">
      <el-form-item prop="input">
        <el-input
          v-model="form.inputValue"
          @input="updateModelValue"
          placeholder="论证的前提条件是什么?"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 8 }"
          show-word-limit
          maxlength="150"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false" plain :color="defaultColor"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="dialogVisible = false"
          :color="defaultColor"
          >确 定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.data-component-container {
  position: relative;
  display: flex;
  width: 200px;
  height: 50px;
  box-sizing: content-box;
  // box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  border: 1px solid #ff8225;
  background-color: #fff;
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ff8225;
    color: #fff;
    writing-mode: vertical-lr; /*垂直展示*/
    width: 40px;
    font-size: 16px;
  }
  .text-container {
    flex: 1;
    padding: 10px;
    overflow: hidden;
    .text {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 10px;
      // padding: 5px;
      word-break: break-all;
      // overflow: hidden;
      // display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      // text-align: center;
      // line-height: 50px;
    }
  }
}
// .vue-flow__handle {
//   height: 24px;
//   width: 10px;
//   background: #ff8225;
//   border-radius: 4px;
// }
:deep(.el-text) {
  display: block;
  text-indent: 2em;
}
</style>
