type Listener<T = any> = (payload: T) => void

class EventEmitter<Topics extends Record<string, any> = any> {
    events: any = {}

    constructor() {
        this.events = {}
    }

    on<EventName extends keyof Topics>(
        eventName: EventName,
        callback: Listener<Topics[EventName]>
    ) {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(callback)
    }

    emit<EventName extends keyof Topics>(
        eventName: EventName,
        payload: Topics[EventName]
    ) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((callback: (...args: any[]) => void) => {
                callback.apply(this, [payload])
            })
        } else {
            throw new Error(`事件${String(eventName)}不存在`)
        }
    }

    off<EventName extends keyof Topics>(
        eventName: EventName,
        callback: Listener<Topics[EventName]>
    ) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(
                (cb: (...args: any[]) => void) => cb !== callback
            )
        }
    }
}

function useEventBus<Topics extends Record<string, any>>() {
    const eventBus = new EventEmitter<Topics>()
    const on = function <EventName extends keyof Topics>(eventName: EventName, callback: Listener<Topics[EventName]>) {
        eventBus.on(eventName, callback)
    }
    const off = function <EventName extends keyof Topics>(eventName: EventName, callback: Listener<Topics[EventName]>) {
        eventBus.off(eventName, callback)
    }
    const emit = function<EventName extends keyof Topics>(eventName: EventName,payload?: Topics[EventName]){
        eventBus.emit(eventName, payload||{} as Topics[EventName])
    }

    return {
        eventBus,
        on,
        off,
        emit
    }
}

export default useEventBus

// const eventBus = new EventBus()
// export default eventBus
