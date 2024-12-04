<script lang="ts" setup>
import { Props, Tag } from './type'
import { ArgumentType } from '../ArgumentFlowComponent/type'
import { useCssVar, useElementHover } from '@vueuse/core'
import { Plus } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import tips from '../toolTips/index.vue'
import lightText from '@/components/common/highlight/index.vue'
import { useForm } from '@/hooks/form'
import vFocus from '@/directives/focus'
import guideData from './argumentGuide.data'
defineOptions({
  name: 'elementComponent',
})

const elementMap = {
  [ArgumentType.Backing]: {
    msg: '论证的支撑不能为空!',
    color: '#ef5a6f',
    title: '支撑',
  },
  [ArgumentType.Warrant]: {
    msg: '论证的辩护不能为空!',
    color: '#88d66c',
    title: '辩护',
  },
  [ArgumentType.Claim]: {
    msg: '论证的结论不能为空!',
    color: '#615efc',
    title: '结论',
  },
  [ArgumentType.Qualifier]: {
    msg: '论证的限定词不能为空!',
    color: '#ffc94a',
    title: '限定',
  },
  [ArgumentType.Rebuttal]: {
    msg: '论证的反驳不能为空!',
    color: '#6dc5d1',
    title: '反驳',
  },
  [ArgumentType.Data]: {
    msg: '论证的前提不能为空!',
    color: '#ff8225',
    title: '前提',
  },
}

const props = withDefaults(defineProps<Props>(), {
  _type: ArgumentType.Backing,
  nodeId: '',
  tags: () => [],
  visible: true,
  argumentGuideType: 'propose',
})

watch(
  () => props.modelValue,
  () => {
    setInputValue(props.modelValue)
  }
)

// console.log('debugger props ===> ', props)

const dialogVisible = ref(false)

const emit = defineEmits(['addBacking', 'update:modelValue', 'notAllowed'])

const openDialog = () => {
  if (!props.visible) {
    emit('notAllowed')
    dialogVisible.value = false
  } else {
    dialogVisible.value = true
  }
}

const defaultColor = useCssVar('--default-theme-color')

const el = ref<HTMLElement | null>(null)

const isHovered = useElementHover(el)

const active = ref('0')

const { form, formRef, rules, updateModelValue, setInputValue } = useForm({
  message: elementMap[props._type].msg,
  emit,
})

setInputValue(props.modelValue)

const submit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      dialogVisible.value = false
    } else {
      ElMessage.error(elementMap[props._type].msg)
    }
  })
}

/**
 * Warrant逻辑
 */
// ===================================
const warrant = ref()

function useWarrant() {
  const handleEmitAddBacking = () => {
    const payload = {
      inputValue: form.value.inputValue,
      nodeId: props.nodeId,
    }
    emit('addBacking', payload)
  }
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
    form.value.inputValue += template.value
  }

  return {
    handleEmitAddBacking,
    template,
    tOptions,
    handleInsertTemplate,
  }
}

// const { warrant?.handleEmitAddBacking, template, tOptions, handleInsertTemplate } =
//   useWarrant()

if (props._type === ArgumentType.Warrant) {
  warrant.value = useWarrant()
} else {
  warrant.value = null
}
// ===================================

/**
 * Backing逻辑
 */
const backing = ref()

// 考虑移除添加支撑标签的作用
function useBacking() {
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

  const tags = ref<Tag[]>(props.tags || [])

  const tag = ref('')

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
    tags.value.push(newTag as Tag)
  }

  const handleRemoveTag = (tag: Tag) => {
    tags.value = tags.value.filter(item => item !== tag)
  }

  return {
    tag,
    tagsOpt,
    tags,
    handleInsertTag,
    handleRemoveTag,
  }
}

// const { tag, tagsOpt, tags, handleInsertTag, handleRemoveTag } = useBacking()
if (props._type === ArgumentType.Backing) {
  backing.value = useBacking()
} else {
  backing.value = null
}
// 元素的介绍提示词
const getElementTipsRenderMap = (argumentType: ArgumentType) => {
  switch (argumentType) {
    case ArgumentType.Warrant: {
      return {
        texts: [
          '辩护是指论据和论题之间的逻辑连接或推理,是为什么论据可以支持论题的理由。例如一个论证的前提是“锻炼有助于保持健康,减少患病的风险。',
          '结论是“人要定期锻炼身体”。那么为了说明前提和结论的关系,我们需要加入辩护。在这个论证中,辩护可以是:“因为身体健康状况与定期锻炼有直接关系。”',
        ],
        lightText: true,
        keywords: [
          '论据和论题之间的逻辑连接或推理',
          '为什么论据可以支持论题的理由',
        ],
      }
    }
    case ArgumentType.Data: {
      return {
        texts: [
          `前提条件(Data)是支持论题(Claim)的证据或事实,是你用来证明论题的基础。例如你要证明"人们应该每天锻炼",那么你论证的前提可能是"锻炼有助于保持健康,减少患病的风险。"`,
          `我们使用D表示前提,`,
          `使用C表示论题。那么"D一类的数据使人们得出类似C的结论或提出类似C的主张",或"既然D,必然C"。`,
        ],
      }
    }
    case ArgumentType.Backing: {
      return {
        texts: [
          ` 支撑（Backing）是为辩护（Warrant）提供进一步支持的证据或信息。支撑的作用是加强和验证辩护的有效性,使整个论证更加有力和可信。
              具体来说,辩护是解释为什么论据（Grounds）能够支持结论（Claim）的推理或原则,而支撑则为这一推理或原则提供额外的证据和理由,以确保其稳固性和可靠性。支撑可以是各种形式的证据,如统计数据、研究结果、专家意见、历史案例等。`,
        ],
        lightText: true,
        keywords: [
          '支撑可以是各种形式的证据,如统计数据、研究结果、专家意见、历史案例等',
        ],
      }
    }
    case ArgumentType.Rebuttal: {
      return {
        text: [
          '反驳（Rebuttal）是在论证过程中对可能的反对意见或批评进行预先处理的部分。它的作用是识别并回应那些可能削弱论证或提出相反观点的要素,从而增强论证的说服力和可信度。反驳通常包括两部分：首先,识别潜在的反对意见,这些意见可能是对论题、论据、辩护或其他论证部分的质疑或攻击；其次,对这些反对意见进行回应或反驳,通过提供进一步的证据、解释或辩护来化解这些质疑。',
          `反驳的重要性在于它展示了论证者对不同观点的考虑和应对能力,使论证显得更加全面和公正。例如,如果有人主张“人们应该每天锻炼”,他们可能会预见到一些反对意见,如“有些人可能因为健康问题无法进行日常锻炼”。作为反驳,论证者可以回应道：“除非有医学上的禁忌,否则大多数人应该每天锻炼,因为即使是轻度的运动对大部分人的健康也是有益的,并且可以根据个人情况调整锻炼强度。”`,
          ' 通过有效地处理和回应反对意见,反驳部分不仅可以增强论证的说服力,还能展示论证者对问题的深刻理解和辩证思维能力,从而使论证更具说服力和可靠性。',
        ],
        lightText: true,
        keywords: [
          '可能的反对意见或批评进行预先处理',
          '它展示了论证者对不同观点的考虑和应对能力',
        ],
      }
    }
    case ArgumentType.Qualifier: {
      return {
        texts: [
          '限定词（Qualifier）是用来表明论题的适用范围或强度的词语或短语。在图尔敏的论证模型中,限定词帮助论证者对自己的论题进行一定程度的限制或调节,以便更加准确和现实地表达自己的观点。',
          '通过使用限定词,论证者可以避免过于绝对的主张,从而使论证更加合理和有说服力。',
        ],
        lightText: true,
        keywords: ['限定词', '表明概率、频率、强度或范围的词语'],
      }
    }
    case ArgumentType.Claim: {
      return {
        texts: [
          '结论（Claim）是你希望证明的主要观点或立场。它是整个论证的核心,是你通过提供证据和推理想要让听众或读者接受的陈述。',
          '有效的结论应当是明确的、具体的,并且能够激发听众或读者的兴趣,使他们愿意进一步探讨和思考这个问题。',
        ],
        lightText: true,
        keywords: ['主要观点', '论证的核心'],
      }
    }
  }
}
const currentElementTips = computed(() => {
  return getElementTipsRenderMap(props._type)
})
// TODO: 引导语句,提出自己观点时+同意观点时引导+不同意时引导+总结观点时引导
const argumentGuideMapping: {
  [key in ArgumentType]: {
    [key in Props['argumentGuideType']]: string[]
  }
} = guideData

// 论证引导语句
const getElementArgumentGuide = (argumentType: ArgumentType) => {
  return argumentGuideMapping[argumentType][props.argumentGuideType]
}
const currentElemntArgumentGuide = computed(() => {
  return getElementArgumentGuide(props._type)
})
const handleClickTag = (tip: string) => {
  // 将提示词填写到输入框中
  form.value.inputValue = form.value.inputValue + tip
}
</script>

<template>
  <div
    class="data-component-container"
    ref="el"
    @dblclick="openDialog"
    :style="{ border: `1px solid ${elementMap[props._type].color}` }"
  >
    <div
      class="title"
      :style="{ backgroundColor: elementMap[props._type].color }"
    >
      {{ elementMap[props._type].title }}
    </div>

    <div class="text" @dblclick="dialogVisible = true">
      {{
        form.inputValue ||
        `双击以编辑。此处添加论证的${elementMap[props._type].title}。`
      }}
    </div>

    <!-- Warrant特有 -->
    <div
      class="add"
      @click="warrant.handleEmitAddBacking"
      v-if="props._type === ArgumentType.Warrant"
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

    <tips
      v-show="isHovered"
      :value="form.inputValue"
      :defaultValue="`还未添加${elementMap[props._type].title}`"
    ></tips>
  </div>

  <el-dialog
    :title="`输入论证的${elementMap[props._type].title}`"
    v-if="dialogVisible"
    v-model="dialogVisible"
    width="500"
    append-to-body
  >
    <!-- 元素的介绍提示词 -->
    <el-collapse v-model="active">
      <el-collapse-item
        :title="`${elementMap[props._type].title}是什么?`"
        name="1"
      >
        <div v-for="(item, index) in currentElementTips.texts" :key="index">
          <div v-if="currentElementTips.lightText">
            <el-text>
              <lightText :keywords="currentElementTips.keywords">
                {{ item }}
              </lightText>
            </el-text>
          </div>
          <div v-else>
            <el-text>{{ item }}</el-text>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!-- 输入框 -->
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="input">
        <el-input
          v-model="form.inputValue"
          v-focus
          ref="elInputRef"
          @input="updateModelValue"
          :placeholder="`论证的${elementMap[props._type].title}是什么?`"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 8 }"
          :autofocus="true"
          maxlength="200"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>
    <!-- 论证前提词汇 -->
    <div class="argument-guide-container">
      <n-tag
        v-for="(item, index) in currentElemntArgumentGuide"
        :key="index"
        @click="handleClickTag(item)"
        type="info"
        >{{ item }}</n-tag
      >
    </div>
    <el-divider></el-divider>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false" plain :color="defaultColor"
          >取 消</el-button
        >
        <el-button type="primary" @click="submit" :color="defaultColor"
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
    line-clamp: 3;
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
.argument-guide-container {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  gap: 10px;
  :deep(.n-tag) {
    // margin-top: 10px;
    cursor: pointer;
  }
}
</style>
