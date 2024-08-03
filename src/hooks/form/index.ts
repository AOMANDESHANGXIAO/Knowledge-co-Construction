/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-29 16:56:04
 * @Description  : 只有一个inputValue，以及校验规则的hook
 */
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  message?: string
  emit: any
}

export function useForm(props: Props) {
  const { message, emit } = props
  const form = ref({
    inputValue: '',
  })

  const rules: FormRules = reactive({
    inputValue: [
      {
        required: true,
        message: message || '请输入内容',
        trigger: 'blur',
      },
    ],
  })

  const formRef = ref<FormInstance>()

  const setInputValue = (value: string) => {
    form.value.inputValue = value
  }

  const updateModelValue = () => {
    emit('update:modelValue', form.value.inputValue)
  }

  return { form, formRef, rules, updateModelValue, setInputValue }
}
