<script lang="ts" setup>
import { useCssVar } from '@vueuse/core'
import { Handle, Position } from '@vue-flow/core'
defineOptions({
  name: 'DataComponent',
})
const inputValue = ref('')

const dialogVisible = ref(false)

const defaultColor = useCssVar('--default-theme-color')
</script>

<template>
  <div class="data-component-container" @dblclick="dialogVisible = true">
    <div class="title">前提</div>
    <div class="text">{{ inputValue || '此处添加论证的前提条件,双击以编辑' }}</div>
    <Handle
      type="target"
      :position="Position.Right"
      :connectable="false"
    ></Handle>
  </div>
  <el-dialog
    title="输入论证的前提条件"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <el-input
      v-model="inputValue"
      placeholder="论证的前提条件是什么?"
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
.data-component-container {
  display: flex;
  width: 200px;
  height: 50px;
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
.vue-flow__handle {
  height: 24px;
  width: 10px;
  background: #ff8225;
  border-radius: 4px;
}
</style>
