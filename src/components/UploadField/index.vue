<script setup lang="ts">
const emits = defineEmits(['onFilesChange'])
const fileInputRef = ref<HTMLInputElement|null>(null)
const uploadFileListInfo = ref<File[]>([])
const handleFileChange = () =>{
  emits('onFilesChange')
  if(!fileInputRef.value) return
  const files = fileInputRef.value.files
  if(!files) return
  uploadFileListInfo.value = Array.from(files)
}
const goFile = () => {
  console.log('goFile', fileInputRef.value)
  if(!fileInputRef.value) return
  console.log('goFile', fileInputRef.value)
  fileInputRef.value.click()
}
const getFileList = () => {
  if(!fileInputRef.value) return
  return fileInputRef.value.files
}
const clearFileList = () => {
  if(!fileInputRef.value) return
  fileInputRef.value.value = ''
  uploadFileListInfo.value = []
}
defineExpose({
  goFile,
  fileInputRef,
  getFileList,
  clearFileList
})
</script>

<template>
  <input ref="fileInputRef" style="margin-left:10px;display: none" type="file" :multiple="true"
         @change="handleFileChange"/>
  <ul class="upload-list">
    <li v-for="(item,index) in uploadFileListInfo" :key="item.name">
      <n-text>{{ index + 1 }}. {{ item.name }}</n-text>
    </li>
  </ul>
  <n-text>已选择{{ uploadFileListInfo?.length || 0 }}个文件</n-text>
</template>

<style scoped lang="scss">
.upload-list {
  li {
    list-style: none;
  }
}
</style>