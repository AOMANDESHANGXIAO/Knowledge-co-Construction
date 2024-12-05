/**
 * 发布订阅模型
 */
class EventBus {
  private events: { [key: string]: Function[] } = {}

  // 订阅事件
  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  // 发布事件
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args))
    }
  }

  // 取消订阅事件
  off(event: string, listener: Function) {
    if (!this.events[event]) return

    this.events[event] = this.events[event].filter(l => l !== listener)
  }
}

const eventBus = new EventBus()
export default eventBus
