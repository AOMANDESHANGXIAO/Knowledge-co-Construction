<script lang="ts" setup>
import { useCssVar } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
import { Plus } from '@element-plus/icons-vue'
import type { Props } from './type.ts'
defineOptions({
  name: 'WarrantComponent',
})

const props = defineProps<Props>()

const inputValue = ref('')

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')

const emits = defineEmits(['addBacking'])

const handleEmitAddWarrant = () => {
  const payload = {
    inputValue,
    nodeId: props.nodeId,
  }
  console.log('payload is ', payload)
  emits('addBacking', payload)
}
</script>

<template>
  <div class="data-component-container">
    <div class="title">理据</div>
    <div class="text" @dblclick="dialogVisible = true">
      {{ inputValue || '此处添加论证的理据,双击以编辑' }}
    </div>
    <div
      class="add"
      @click="handleEmitAddWarrant"
    >
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
  </div>
  <el-dialog
    title="输入论证的理据"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-input
      v-model="inputValue"
      placeholder="论证的理据是什么?"
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 8 }"
    ></el-input>
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
</style>
