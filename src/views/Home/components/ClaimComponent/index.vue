<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import { useForm } from '@/hooks/form'
import tips from '../toolTips/index.vue'
import lightText from '@/components/common/highlight/index.vue'

defineOptions({
  name: 'ClaimComponent',
})

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const { form, formRef, rules, updateModelValue } = useForm({
  message: '论证结果不能为空!',
  emit
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const el = ref<HTMLElement | null>(null)
const isHovered = useElementHover(el)

const active = ref('0')

const sumbit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      dialogVisible.value = false
    } else {
      ElMessage.error('论证结果不能为空!')
    }
  })
}
</script>

<template>
  <div
    class="data-component-container"
    @dblclick="dialogVisible = true"
    ref="el"
  >
    <div class="title">结论</div>
    <div class="text">{{ form.inputValue || '此处添加结论,双击编辑' }}</div>
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
      defaultValue="还未添加结论"
    ></tips>
  </div>
  <el-dialog
    title="输入论证的结论"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-collapse v-model="active">
      <el-collapse-item title="结论是什么?" name="1">
        <el-text>
          <lightText :keywords="['你希望证明的主要观点或立场']">
            在论证过程中，结论（Claim）是你希望证明的主要观点或立场。它是整个论证的核心，是你通过提供证据和推理想要让听众或读者接受的陈述。结论通常是一个明确的、可辩论的命题，表示你对某个问题或主题的看法。
          </lightText>
        </el-text>
        <el-text>
          <lightText :keywords="['是所有支持性材料和逻辑推理的最终指向']">
            结论在论证中起着至关重要的作用，因为它是所有支持性材料和逻辑推理的最终指向。有效的结论应当是明确的、具体的，并且能够激发听众或读者的兴趣，使他们愿意进一步探讨和思考这个问题。
          </lightText>
        </el-text>
        <el-text>
          <lightText
            :keywords="['结论', '论据', '辩护', '支持', '限定', '反驳']"
          >
            例如，考虑以下论证： 结论（Claim）：人们应该每天锻炼。
            论据（Grounds）：锻炼有助于保持健康，减少患病的风险。
            辩护（Warrant）：因为身体健康状况与定期锻炼有直接关系。
            支持（Backing）：研究表明，定期锻炼的人比不锻炼的人平均寿命更长。
            限定（Qualifier）：大多数情况下。
            反驳（Rebuttal）：除非有医学上的禁忌，否则人们应该每天锻炼。
          </lightText>
        </el-text>
        <el-text>
          在这个例子中，结论“人们应该每天锻炼”是论证的中心，所有其他部分都是为了支持、解释和限定这一结论。通过清晰地陈述结论，并提供充分的证据和合理的推理，论证者可以有效地说服听众或读者接受这一观点。
        </el-text>
      </el-collapse-item>
    </el-collapse>
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="inputValue">
        <el-input
          v-model="form.inputValue"
          @input="updateModelValue"
          placeholder="请输入论证的结论"
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
          @click="sumbit"
          :color="defaultColor"
          >确 定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
$color: #615efc;
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
