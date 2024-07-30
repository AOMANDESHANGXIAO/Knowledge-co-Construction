<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import { Plus } from '@element-plus/icons-vue'
import type { Props } from './type.ts'
import tips from '../toolTips/index.vue'
import type { FormInstance, FormRules } from 'element-plus'
import lightText from '@/components/common/highlight/index.vue'

defineOptions({
  name: 'WarrantComponent',
})

const props = defineProps<Props>()

const form = ref({
  input: '',
})

const formRef = ref<FormInstance>()

const rules = reactive<FormRules<typeof form>>({
  input: [
    {
      required: true,
      message: '论证的辩护不能为空!',
      trigger: 'blur',
    },
  ],
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const emits = defineEmits(['addBacking'])

const handleEmitAddWarrant = () => {
  const payload = {
    inputValue: form.value.input,
    nodeId: props.nodeId,
  }
  // console.log('payload is ', payload)
  emits('addBacking', payload)
}

const el = ref<HTMLElement | null>(null)

const isHovered = useElementHover(el)

const active = ref('0')

const template = ref('')

const tOptions = ref([
  {
    label: '如果A,那么B。', // 假言三段论
    value: '如果A,那么B。',
  },
  {
    label: 'A。因此, B', // 肯定前件式的假言三段论
    value: 'A。因此, B',
  },
  {
    label: '如果A。那么B。不是B。因此, 不是A', // 否定后件式
    value: '如果A。那么B。不是B。因此, 不是A',
  },
  {
    label: '如果A, 那么B。不是A。因此, 不是B', // 否定前件式
    value: '如果A, 那么B。不是A。因此, 不是B',
  },
])

const handleInsertTemplate = () => {
  if (!template.value) return
  form.value.input += template.value
}
</script>

<template>
  <div class="data-component-container" ref="el">
    <div class="title">辩护</div>
    <div class="text" @dblclick="dialogVisible = true">
      {{ form.input || '此处添加论证的辩护,双击以编辑' }}
    </div>
    <div class="add" @click="handleEmitAddWarrant">
      <el-icon><Plus /></el-icon>
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
      :value="form.input"
      defaultValue="还未添加辩护"
    ></tips>
  </div>
  <el-dialog
    title="输入论证的辩护"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-collapse v-model="active">
      <el-collapse-item title="辩护是什么?" name="1">
        <el-text>
          <lightText :keywords="[
            '论据和论题之间的逻辑连接或推理', '为什么论据可以支持论题的理由'
          ]">
            辩护是指论据和论题之间的逻辑连接或推理，是为什么论据可以支持论题的理由。例如一个论证的前提是“锻炼有助于保持健康，减少患病的风险。”,
            结论是“人要定期锻炼身体”。那么为了说明前提和结论的关系,我们需要加入辩护。在这个论证中,辩护可以是:“因为身体健康状况与定期锻炼有直接关系。”
          </lightText>
        </el-text>
      </el-collapse-item>
    </el-collapse>

    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="input">
        <el-input
          v-model="form.input"
          placeholder="论证的辩护是什么?"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 8 }"
          maxlength="150"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>

    <el-divider>辩护模板</el-divider>

    <div class="template-container">
      <el-select
        v-model="template"
        placeholder="需要辩护模板吗?"
        style="width: 250px"
      >
        <el-option
          v-for="item in tOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button :color="defaultColor" @click="handleInsertTemplate"
        >插 入</el-button
      >
    </div>

    <el-divider></el-divider>

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
$color: #88d66c;
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
  }
  .add {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $color;
    color: #fff;
    width: 40px;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      background-color: darken($color, 10%);
    }
  }
}
:deep(.el-text) {
  display: block;
  text-indent: 2em;
}
.template-container {
  display: flex;
  justify-content: space-between;
}
</style>
