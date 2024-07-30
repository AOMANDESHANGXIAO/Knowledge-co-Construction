<script lang="ts" setup>
import { useCssVar, useElementHover } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import tips from '../toolTips/index.vue'
import { useForm } from '@/hooks/form'

defineOptions({
  name: 'BackingComponent',
})

interface Props {
  modelValue: string
  tags: Tag[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => '',
  tags: () => [],
})

const emit = defineEmits(['update:modelValue'])

const { form, formRef, rules, updateModelValue } = useForm({
  message: '理据的支撑条件不能为空!',
  emit,
})

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const el = ref<HTMLElement | null>(null)

const isHovered = useElementHover(el)

const tag = ref('')

const tagsOpt = ref([
  {
    label: '归纳概括',
    value: '归纳概括',
  },
  {
    label: '预测论证',
    value: '预测论证',
  },
  {
    label: '权威论证',
    value: '权威论证',
  },
  {
    label: '数据论证',
    value: '数据论证',
  },
  {
    label: '类比论证',
    value: '类比论证',
  },
])

interface Tag {
  name: string
  type: string
}

const tags = ref<Tag[]>(props.tags)

const handleInsertTag = () => {
  const types = ['primary', 'success', 'warning', 'danger', 'info']

  // 不能重复添加
  if (tags.value.some(item => item.name === tag.value)) {
    ElMessage.error('不能添加相同标签!')
    return
  }

  const newTag = {
    name: tag.value,
    type: types[Math.floor(Math.random() * types.length)],
  }
  tags.value.push(newTag)
}

const handleRemoveTag = (tag: Tag) => {
  tags.value = tags.value.filter(item => item !== tag)
}

const sumbit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      dialogVisible.value = false
    } else {
      ElMessage.error('理据的支撑条件不能为空!')
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
    <div class="title">支撑</div>
    <div class="text">{{ form.inputValue || '此处添加理据的支撑' }}</div>
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
      defaultValue="还未添加支撑"
    ></tips>
  </div>

  <el-dialog
    title="输入理据的支撑"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-form :rules="rules" ref="formRef" :model="form">
      <el-form-item prop="inputValue">
        <el-input
          v-model="form.inputValue"
          placeholder="论证的支撑是什么?"
          type="textarea"
          @change="updateModelValue"
          :autosize="{ minRows: 4, maxRows: 8 }"
        ></el-input>
      </el-form-item>
    </el-form>

    <div class="tags-list">
      <el-tag
        v-for="(tag, index) in tags"
        :key="index"
        closable
        :type="tag.type"
        effect="dark"
        @close="handleRemoveTag(tag)"
      >
        {{ tag.name }}
      </el-tag>
    </div>

    <el-divider>支撑标签</el-divider>
    <div class="tags-container">
      <el-select
        v-model="tag"
        placeholder="你使用了何种证据来支撑?"
        style="width: 250px"
      >
        <el-option
          v-for="item in tagsOpt"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button :color="defaultColor" @click="handleInsertTag"
        >插 入</el-button
      >
    </div>
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
$color: #ef5a6f;
.data-component-container {
  position: relative;
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
.tags-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}
.tags-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
