/**
 vue3 div 拖动 通用逻辑
 author：yangfeng
 reviewer: xiebin
 date：2024/5/25
 */
 import { ref, onMounted, onUnmounted } from 'vue'

 /**
  * 判断指定dom节点是否是具有定位属性的节点 - 即：position为 absolute | relative | fixed
  * @param _node
  * @returns {boolean}
  */
 function judgeIsLocateNode(_node: HTMLElement) {
   const cssStyle = window.getComputedStyle(_node, null)
   return cssStyle.position !== 'static' // 不是默认的就是有定位的
 }
 
 /**
  * 获取指定节点的有定位的父节点
  * @param ele 子节点
  * @param flag 父节点类或id选择器或者元素节点名称，eg： 类：.app | id: #app | 元素节点名称 body 或者 flag直接是dom对象
  * @returns {HTMLElement | null}
  */
 function findLocateParentNode(ele: HTMLElement) {
   if (!ele) return null
   let parent: HTMLElement | null = ele.parentNode as HTMLElement
 
   let locateParentNode: HTMLElement | null = null // 有定位父节点
   while (parent && parent.nodeName !== 'BODY' && parent.nodeName !== 'HTML') {
     if (judgeIsLocateNode(parent)) {
       // 是定位节点
       locateParentNode = parent
       break
     }
     parent = parent.parentNode as HTMLElement
   }
 
   // 默认是body
   if (!locateParentNode) {
     locateParentNode = document.getElementsByTagName('body')[0]
   }
 
   return locateParentNode
 }
 
 /**
   * div 拖动 通用逻辑
   * @param {
    moveingCallback, // 当前正在移动回调函数 非必填 - 有此参数则外部自行处理更改定位的逻辑，不传则拖动时更改dragBoxRef的left，top值
    moveEndCallback // 移动结束回调函数 非必填
   * } param0 
   * @returns 
   */
 // 解决鼠标拖拽与点击事件冲突：时间差
 //  const dragStartTime = new Date().getTime();
 //  document.onmousemove = () => {
 //    const dragEndTime = new Date().getTime();
 //    if (dragEndTime - dragStartTime > 200) {
 //      target.setAttribute('drag-flag', true);
 //    }
 //  };
 type funType = (() => void) | undefined
 type moveingCallbackType = ((e: MouseEvent, arg: { left: number; top: number }) => void) | undefined
 export function useDivDrag({
   moveingCallback, // 当前正在移动回调函数 非必填
   moveEndCallback, // 移动结束回调函数 非必填
   openBoundary // 是否开启边界条件【将拖拽盒子限制在定位父节点范围内】 - 注意：如果拖拽盒子有margin 偏移或者translate 偏移，会导致看起来不准确
 }: {
   moveingCallback?: moveingCallbackType
   moveEndCallback?: funType
   openBoundary?: boolean
 } = {}) {
   const dragBoxRef = ref() // 需要拖动的盒子
   const isMoving = ref(false) // 当前是否正在移动
   const dragFlag = ref(true) // 检测是不是拖动事件，根据时间
   let dragStartTime: number
   let dragEndTime: number
   const tools = {
     isFunction(fn: any) {
       return fn && typeof fn === 'function'
     },
     getToContainerXY(e: MouseEvent) {
       return {
         x: e.x || e.pageX,
         y: e.y || e.pageY
       }
     },
     // 添加移除鼠标事件
     addRemoveMouseEvent(callback: Function) {
       // 鼠标移动
       const moveHandle = (moveE: MouseEvent) => {
         callback && callback(moveE)
       }
 
       // 移除鼠标事件
       const clearMouseEvent = () => {
         window.removeEventListener('mousemove', moveHandle)
         window.removeEventListener('mouseup', clearMouseEvent)
         changeMoveing(false)
         // 移动结束
         if (tools.isFunction(moveEndCallback)) {
           moveEndCallback && moveEndCallback()
         }
       }
       window.addEventListener('mousemove', moveHandle, false)
       window.addEventListener('mouseup', clearMouseEvent, false)
     }
   }
 
   const changeMoveing = (bool = false) => {
     isMoving.value = bool
   }
 
   // 鼠标事件监听
   const mouseDownEventListenerHandle = (e: MouseEvent) => {
     e?.stopPropagation && e.stopPropagation()
     e?.preventDefault && e.preventDefault()
 
     changeMoveing(true)
     // 解决拖拽事件和点击事件冲突
     dragStartTime = new Date().getTime()
     dragFlag.value = false
     // 1.获取拖拽盒子有定位的父节点距离浏览器的距离
     const LocateParentNode = findLocateParentNode(dragBoxRef.value)
     let canvasBoxLeft = 0
     let canvvasBoxTop = 0
     if (LocateParentNode) {
       const info = LocateParentNode.getBoundingClientRect()
       canvasBoxLeft = info.left
       canvvasBoxTop = info.top
     }
 
     // 2.被拖拽盒子距离有定位父节点左、上的距离信息
     const boxLeft = dragBoxRef.value.offsetLeft
     const boxTop = dragBoxRef.value.offsetTop
 
     // 3.鼠标在被拖拽盒子中按下的位置距离信息【距离浏览器】
     const { x: mouseLeft, y: mouseTop } = tools.getToContainerXY(e)
 
     // 4.计算出鼠标按下点距离拖拽盒子左侧、顶部的距离 保证后续拖拽时鼠标位置相对拖拽盒子不变
     // 若发现拖动有偏移考虑是否是边框引起的
     const toBox_X = mouseLeft - boxLeft - canvasBoxLeft // 鼠标距离盒子左侧距离 鼠标距离浏览器左侧距离 - 拖拽盒子距离有定位父节点左侧距离 - 有定位父节点距离左侧距离浏览器左侧距离
     const toBox_Y = mouseTop - boxTop - canvvasBoxTop // 鼠标距离盒子顶部距离
 
     tools.addRemoveMouseEvent((moveE: MouseEvent) => {
       const { x, y } = tools.getToContainerXY(moveE) // 鼠标点击位置，距离画布边界的距离
 
       let left = x - toBox_X - canvasBoxLeft
       let top = y - toBox_Y - canvvasBoxTop
 
       const dragDom = dragBoxRef.value
 
       // 拖拽边界 拖拽盒子不允许超出定位父节点
       if (openBoundary) {
         try {
           const minX = 0
           const minY = 0
           const maxX = LocateParentNode!.clientWidth - dragDom.offsetWidth
           const maxY = LocateParentNode!.clientHeight - dragDom.offsetHeight
           left < minX && (left = minX)
           top < minY && (top = minY)
           left > maxX && maxX > 0 && (left = maxX)
           top > maxY && maxY > 0 && (top = maxY)
         } catch (error) {
           console.log('error')
         }
       }
 
       if (tools.isFunction(moveingCallback)) {
         // 有回调函数，交给外部处理
         moveingCallback &&
           moveingCallback(
             moveE, // 鼠标event
             {
               left, // 拖动盒子现在的left 像素
               top // 拖动盒子现在的top 像素
             }
           )
       } else {
         // 没有回调函数，直接更改
         dragDom.style.left = left + 'px'
         dragDom.style.top = top + 'px'
         // 解决拖拽事件和点击事件冲突
         dragEndTime = new Date().getTime()
         if (dragEndTime - dragStartTime > 300) {
           dragFlag.value = true
         }
       }
     })
   }
 
   onMounted(() => {
     if (!dragBoxRef.value) return console.error('dragBoxRef 未绑定到需要移动的 dom 上！')
     dragBoxRef.value.addEventListener('mousedown', mouseDownEventListenerHandle, false)
   })
   onUnmounted(() => {
     dragBoxRef.value &&
       dragBoxRef.value.removeEventListener('mousedown', mouseDownEventListenerHandle)
   })
 
   return {
     dragBoxRef, // 需要拖动的盒子 ref
     isMoving, // 当前是否正在移动
     dragFlag //判断是否是点击事件
   }
 }
 