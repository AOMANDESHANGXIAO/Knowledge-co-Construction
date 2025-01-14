<script setup lang="ts">
import {Delete} from "@element-plus/icons-vue";

const props = defineProps({
  maxSize: {
    type: Number,
    default: 1024 * 1024 * 10
  },
  maxCount: {
    type: Number,
    default: 5
  },
  multiple: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['onFilesChange'])
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadFileListInfo = ref<File[]>([])
const realUploadFileList = computed(() => {
  /* 过滤掉被删除的文件；剔除体积过大的文件；对纳入的文件数量进行限制 */
  return uploadFileListInfo.value.filter((file: File) => {
    return !removedFileList.value.includes(file) && file.size < props.maxSize
  }).slice(0, props.maxCount) as File[]
})
const handleFileChange = () => {
  emits('onFilesChange')
  if (!fileInputRef.value) return
  const files = fileInputRef.value.files
  if (!files) return
  uploadFileListInfo.value = Array.from(files)

  // 判断是否有文件过大
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!removedFileList.value.includes(file)) {
      if (file.size > props.maxSize) {
        ElMessage.error(`文件过大，最大支持${props.maxSize / 1024 / 1024}MB`)
        removedFileList.value.push(file)
      }
    }
  }
  // 判断文件数量是否超标
  const isOverMaxCount = uploadFileListInfo.value.filter((file: File) => {
    return file.size < props.maxSize && !removedFileList.value.includes(file)
  }).length > props.maxCount

  if (isOverMaxCount) {
    ElMessage.error(`文件数量已达上限，最大支持${props.maxCount}个文件`)
  }
}
const goFile = () => {
  if (!fileInputRef.value) return
  fileInputRef.value.click()
}
const getFileList = (): void | FileList | null | File[] => {
  if (!fileInputRef.value) return
  const files = fileInputRef.value.files
  if (files !== null) {
    return realUploadFileList.value
  }
  return files
}
const clearFileList = () => {
  if (!fileInputRef.value) return
  fileInputRef.value.value = ''
  uploadFileListInfo.value = []
  removedFileList.value = []
}
/**
 * 已删除的文件列表
 */
const removedFileList = ref<File[]>([])
const handleRemoveFile = (file: File) => {
  removedFileList.value.push(file)
}
defineExpose({
  goFile,
  fileInputRef,
  getFileList,
  clearFileList
})
</script>

<template>
  <input ref="fileInputRef" style="margin-left:10px;display: none" type="file" :multiple="props.multiple"
         @change="handleFileChange"/>
  <ul class="upload-list">
    <li v-for="(item,index) in realUploadFileList" :key="item.name">
      <n-text>{{ index + 1 }}. {{ item.name }}</n-text>&nbsp;<el-icon class="delete-icon"
                                                                      @click="()=>{handleRemoveFile(item)}">
      <Delete/>
    </el-icon>
    </li>
  </ul>
  <n-text>已选择{{ realUploadFileList?.length || 0 }}个文件</n-text>
</template>

<style scoped lang="scss">
.upload-list {
  li {
    display: flex;
    //justify-content: center;
    align-items: center;
    list-style: none;

    .delete-icon {
      cursor: pointer;
      margin-left: 10px;
    }
  }
}
</style>