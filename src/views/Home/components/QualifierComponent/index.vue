<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import { useForm } from '@/hooks/form'
import tips from '../toolTips/index.vue'
import lightText from '@/components/common/highlight/index.vue'

defineOptions({
  name: 'QualifierComponent',
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const { form, rules, formRef } = useForm({
  message: '限定词不能为空!',
  emit
})

const el = ref<HTMLElement | null>(null)
const isHovered = useElementHover(el)

const active = ref('0')

const sumbit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      dialogVisible.value = false
    } else {
      ElMessage.error('限定词不能为空!')
    }
  })
}
</script>

<template>
  <div class="data-component-container" @dblclick="dialogVisible = true" ref="el">
    <div class="title">限定</div>
    <div class="text">
      {{ form.inputValue || '此处添加论证的限定条件,双击以编辑' }}
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
      defaultValue="还没有添加关键词!"
    ></tips>
  </div>
  <el-dialog
    title="输入论证的限定词"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-collapse v-model="active">
      <el-collapse-item title="限定词是什么?" name="1">
        <el-text>
          限定词（Qualifier）是用来表明论题的适用范围或强度的词语或短语。在图尔敏的论证模型中，限定词帮助论证者对自己的论题进行一定程度的限制或调节，以便更加准确和现实地表达自己的观点。通过使用限定词，论证者可以避免过于绝对的主张，从而使论证更加合理和有说服力。
        </el-text>
        <el-text>
          <lightText
            :keywords="[
              '限定词',
              '表明概率、频率、强度或范围的词语',
              '通常',
              '大多数情况下',
              '很可能',
              '几乎',
              '在某些情况下',
            ]"
          >
            限定词通常包括一些表明概率、频率、强度或范围的词语，例如“通常”、“大多数情况下”、“很可能”、“几乎”、“在某些情况下”等。它们的作用是为论题增加一些灵活性和现实性，承认在某些情况下，论题可能不适用或有例外。
          </lightText>
        </el-text>
        <el-text>例如，考虑下面的论题：“人们应该每天锻炼。”这是一个绝对的主张，听起来没有任何例外。但如果添加一个限定词，这个论题可以变得更加温和和实际：“大多数情况下，人们应该每天锻炼。”这样一来，论证者承认有些情况下（例如，某些健康问题或特别忙碌的日子），人们可能无法每天锻炼。</el-text>
        <el-text>使用限定词可以让论证显得更为谨慎和可信，因为它展示了论证者对现实复杂性的考虑，避免了不切实际或过于武断的主张。通过这种方式，限定词在论证中起到了重要的调节和细化作用，使论题更具说服力和现实适应性。</el-text>
      </el-collapse-item>
    </el-collapse>
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="inputValue">
        <el-input
          v-model="form.inputValue"
          placeholder="论证的限定词是什么?"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
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
          @click="sumbit"
          :color="defaultColor"
          >确 定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
$color: #ffc94a;
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
