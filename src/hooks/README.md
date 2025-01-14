# Vue 3 Composition API Hooks

## 概述 (Overview)
本目录包含了项目中使用的自定义 Vue 3 Composition API Hooks。Hooks 是可重用的逻辑单元，帮助我们在组件之间共享状态和行为。

## Hooks 使用指南 (Usage Guide)
### 创建 Hooks
- 每个 Hook 应该专注于单一功能
- 使用 `use` 前缀命名 Hook（例如 `useRequest`）
- 尽可能保持 Hook 的通用性和可复用性

### 常见 Hooks 类型
- 数据获取 (Data Fetching)
- 状态管理 (State Management)
- 表单处理 (Form Handling)
- 生命周期逻辑 (Lifecycle Logic)

## 最佳实践 (Best Practices)
1. 保持 Hooks 纯净和无副作用
2. 使用 TypeScript 增加类型安全
3. 编写单元测试覆盖 Hooks 的各种场景

## 目录结构 (Directory Structure)
```
src/hooks/
├── useRequest.ts       # 网络请求相关 Hook
├── useForceUpdateComponent.ts       # 强制更新组件 Hook
└── README.md           # 当前文档
```

## 示例 (Example)
```typescript
// useRequest.ts
import { ref } from 'vue'

export function useRequest<T>(fetchFn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    try {
      data.value = await fetchFn()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
```

## 贡献指南 (Contributing)
- 新增 Hook 时，请遵循现有的命名和结构约定
- 为新的 Hook 编写详细的文档和单元测试
- 在 PR 中解释 Hook 的用途和实现方式