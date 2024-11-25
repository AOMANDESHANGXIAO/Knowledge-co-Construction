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
        <div v-if="props._type === ArgumentType.Warrant">
          <el-text>
            <lightText
              :keywords="[
                '论据和论题之间的逻辑连接或推理',
                '为什么论据可以支持论题的理由',
              ]"
            >
              辩护是指论据和论题之间的逻辑连接或推理，是为什么论据可以支持论题的理由。例如一个论证的前提是“锻炼有助于保持健康，减少患病的风险。”,
              结论是“人要定期锻炼身体”。那么为了说明前提和结论的关系,我们需要加入辩护。在这个论证中,辩护可以是:“因为身体健康状况与定期锻炼有直接关系。”
            </lightText>
          </el-text>
        </div>

        <div v-else-if="props._type === ArgumentType.Data">
          <el-text>
            前提条件(Data)是支持论题(Claim)的证据或事实，是你用来证明论题的基础。例如你要证明"人们应该每天锻炼",那么你论证的前提可能是"锻炼有助于保持健康，减少患病的风险。"
          </el-text>
          <el-text
            >我们使用D表示前提,
            使用C表示论题。那么"D一类的数据使人们得出类似C的结论或提出类似C的主张"，或"既然D,必然C"。</el-text
          >
        </div>

        <div v-else-if="props._type === ArgumentType.Backing">
          <el-text>
            <lightText
              :keywords="[
                '支撑可以是各种形式的证据，如统计数据、研究结果、专家意见、历史案例等',
              ]"
            >
              支撑（Backing）是为辩护（Warrant）提供进一步支持的证据或信息。支撑的作用是加强和验证辩护的有效性，使整个论证更加有力和可信。
              具体来说，辩护是解释为什么论据（Grounds）能够支持结论（Claim）的推理或原则，而支撑则为这一推理或原则提供额外的证据和理由，以确保其稳固性和可靠性。支撑可以是各种形式的证据，如统计数据、研究结果、专家意见、历史案例等。
            </lightText>
          </el-text>
        </div>

        <div v-else-if="props._type === ArgumentType.Rebuttal">
          <el-text>
            <lightText
              :keywords="[
                '可能的反对意见或批评进行预先处理',
                '它展示了论证者对不同观点的考虑和应对能力',
              ]"
            >
              反驳（Rebuttal）是在论证过程中对可能的反对意见或批评进行预先处理的部分。它的作用是识别并回应那些可能削弱论证或提出相反观点的要素，从而增强论证的说服力和可信度。反驳通常包括两部分：首先，识别潜在的反对意见，这些意见可能是对论题、论据、辩护或其他论证部分的质疑或攻击；其次，对这些反对意见进行回应或反驳，通过提供进一步的证据、解释或辩护来化解这些质疑。
            </lightText>
          </el-text>
          <el-text>
            <lightText
              :keywords="[
                '可能的反对意见或批评进行预先处理',
                '它展示了论证者对不同观点的考虑和应对能力',
              ]"
              >反驳的重要性在于它展示了论证者对不同观点的考虑和应对能力，使论证显得更加全面和公正。例如，如果有人主张“人们应该每天锻炼”，他们可能会预见到一些反对意见，如“有些人可能因为健康问题无法进行日常锻炼”。作为反驳，论证者可以回应道：“除非有医学上的禁忌，否则大多数人应该每天锻炼，因为即使是轻度的运动对大部分人的健康也是有益的，并且可以根据个人情况调整锻炼强度。”</lightText
            ></el-text
          >
          <el-text>
            通过有效地处理和回应反对意见，反驳部分不仅可以增强论证的说服力，还能展示论证者对问题的深刻理解和辩证思维能力，从而使论证更具说服力和可靠性。
          </el-text>
        </div>

        <div v-else-if="props._type === ArgumentType.Qualifier">
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
          <el-text
            >例如，考虑下面的论题：“人们应该每天锻炼。”这是一个绝对的主张，听起来没有任何例外。但如果添加一个限定词，这个论题可以变得更加温和和实际：“大多数情况下，人们应该每天锻炼。”这样一来，论证者承认有些情况下（例如，某些健康问题或特别忙碌的日子），人们可能无法每天锻炼。</el-text
          >
          <el-text
            >使用限定词可以让论证显得更为谨慎和可信，因为它展示了论证者对现实复杂性的考虑，避免了不切实际或过于武断的主张。通过这种方式，限定词在论证中起到了重要的调节和细化作用，使论题更具说服力和现实适应性。</el-text
          >
        </div>

        <div v-else-if="props._type === ArgumentType.Claim">
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

    <el-divider v-if="props._type === ArgumentType.Warrant"
      >辩护模板</el-divider
    >

    <!-- 辩护模板 -->
    <div class="template-container" v-if="props._type === ArgumentType.Warrant">
      <el-select
        v-model="warrant.template"
        placeholder="需要辩护模板吗?"
        style="width: 250px"
      >
        <el-option
          v-for="item in warrant.tOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button :color="defaultColor" @click="warrant.handleInsertTemplate"
        >插 入</el-button
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
