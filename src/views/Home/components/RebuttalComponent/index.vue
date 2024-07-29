<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import tips from '../toolTips/index.vue'
import type { FormInstance, FormRules } from 'element-plus'
import lightText from '@/components/common/highlight/index.vue'

defineOptions({
  name: 'RebuttalComponent',
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const el = ref<HTMLElement | null>(null)

const isHovered = useElementHover(el)

const form = ref({
  inputValue: '',
})

const rules = reactive<FormRules<typeof form>>({
  inputValue: [
    {
      required: true,
      message: '论证的反驳情况不能为空!',
      trigger: 'blur',
    },
  ],
})

const formRef = ref<FormInstance>()

const active = ref('0')

const keywords = [
  '可能的反对意见或批评进行预先处理',
  '它展示了论证者对不同观点的考虑和应对能力',
]
</script>

<template>
  <div class="data-component-container" @dblclick="dialogVisible = true" ref="el">
    <div class="title">反驳</div>
    <div class="text">
      {{ form.inputValue || '此处添加论证的反驳情况,双击以编辑' }}
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
      v-show="isHovered"
      :value="form.inputValue"
      defaultValue="还未添加反驳"
    ></tips>
  </div>
  <el-dialog
    title="输入论证的反驳"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-collapse v-model="active">
      <el-collapse-item title="反驳是什么？" name="1">
        <el-text>
          <lightText :keywords="keywords">
            反驳（Rebuttal）是在论证过程中对可能的反对意见或批评进行预先处理的部分。它的作用是识别并回应那些可能削弱论证或提出相反观点的要素，从而增强论证的说服力和可信度。反驳通常包括两部分：首先，识别潜在的反对意见，这些意见可能是对论题、论据、辩护或其他论证部分的质疑或攻击；其次，对这些反对意见进行回应或反驳，通过提供进一步的证据、解释或辩护来化解这些质疑。
          </lightText>
        </el-text>
        <el-text>
          <lightText :keywords="keywords"
            >反驳的重要性在于它展示了论证者对不同观点的考虑和应对能力，使论证显得更加全面和公正。例如，如果有人主张“人们应该每天锻炼”，他们可能会预见到一些反对意见，如“有些人可能因为健康问题无法进行日常锻炼”。作为反驳，论证者可以回应道：“除非有医学上的禁忌，否则大多数人应该每天锻炼，因为即使是轻度的运动对大部分人的健康也是有益的，并且可以根据个人情况调整锻炼强度。”</lightText
          ></el-text
        >
        <el-text>
          通过有效地处理和回应反对意见，反驳部分不仅可以增强论证的说服力，还能展示论证者对问题的深刻理解和辩证思维能力，从而使论证更具说服力和可靠性。
        </el-text>
      </el-collapse-item>
    </el-collapse>
    <el-form :rules="rules" ref="formRef" :model="form">
      <el-form-item prop="inputValue">
        <el-input
          v-model="form.inputValue"
          placeholder="输入你的反驳..."
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          :maxlength="200"
          show-word-limit
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
$color: #6dc5d1;
.data-component-container {
  display: flex;
  width: 200px;
  height: 50px;
  // box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  border: 1px solid $color;
  background-color: #fff;
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $color;
    color: #fff;
    writing-mode: vertical-lr; /*垂直展示*/
    width: 40px;
    font-size: 16px;
  }
  .text {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 10px;
    padding: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    // text-align: center;
    // line-height: 50px;
  }
}
// .vue-flow__handle {
//   height: 24px;
//   width: 10px;
//   background: $color;
//   border-radius: 4px;
// }
:deep(.el-text) {
  display: block;
  text-indent: 2em;
}
</style>
