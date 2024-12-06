<script lang="ts" setup>
defineOptions({
  name: 'index',
})
</script>

<template>
  <div class="editer-container">
    <n-row style="display: flex;justify-content: center;">
      <n-h1>
        <n-text type="info">编辑器</n-text>
      </n-h1>
    </n-row>
    <n-row :gutter="12">
      <n-col :span="8">
        <n-space vertical>
          <div>
            <n-h3 prefix="bar" type="info">
              <n-text type="info">结论</n-text>
              <n-text style="font-size: 14px"
                ><br />请输入你观点的结论部分</n-text
              >
              <n-input type="textarea" placeholder="输入结论..."></n-input>
              <div class="tags-container">
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
              </div>
            </n-h3>
          </div>
          <div>
            <n-h3 prefix="bar" type="info">
              <n-text type="info">证据</n-text>
              <n-text style="font-size: 14px"
                ><br />请输入你观点的证据部分</n-text
              >
              <n-input type="textarea" placeholder="输入结论..."></n-input>
              <div class="tags-container">
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
              </div>
            </n-h3>
          </div>
          <div>
            <n-h3 prefix="bar" type="info">
              <n-text type="info">限定条件</n-text>
              <n-text style="font-size: 14px"
                ><br />请输入你观点的限定条件部分</n-text
              >
              <n-input type="textarea" placeholder="输入结论..."></n-input>
              <div class="tags-container">
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
                <n-tag type="info">结论就是</n-tag>
              </div>
            </n-h3>
          </div>
        </n-space>
      </n-col>
      <n-col :span="8" style="background-color: bisque"></n-col>
      <n-col :span="8" style="background-color: blueviolet"></n-col>
    </n-row>
    <n-row>
      <n-space>
        <n-button type="info" secondary>取 消</n-button>
        <n-button type="info">确 定</n-button>
      </n-space>
    </n-row>
  </div>
</template>

<style lang="scss" scoped>
.editer-container {
  width: 100%;
  height: 100%;
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    :deep(.n-tag) {
      cursor: pointer;
    }
  }
}
</style>
