import { Graph, Shape } from '@antv/x6';
import { onMounted, computed } from 'vue'

export interface Node {
    id?: string;
    x?:number;
    y?:number;
    width?:number;
    height?:number;
    label?: string;
    shape?: string;
}
export interface Edge {
    source: string;
    target: string;
}
export interface useGraphProps {
    nodes: Node[];
    edges:Edge[];
    graphOptions?: Graph.Options;
}

export default function useGraph (props: useGraphProps){
    const container = ref<HTMLElement>()
    const graph = ref<Graph>()
    const data = computed(()=>{
        return {
            nodes: props.nodes,
            edges: props.edges
        }
    })
    // 添加新的节点函数
    function addNode(node: Node) :boolean{
        const circleNode = new Shape.Circle({...node})
        if(graph.value){
            try {
                graph.value.addNode(circleNode)
                return true
            } catch {
                return false;
            }
        }else {
            return false
        }
    }
    // 添加新的边的函数
    function addEdge(edge: Edge) :boolean{
        const newEdge = new Shape.Edge(edge)
        if(graph.value){
            try {
                graph.value.addEdge(newEdge)
                return true
            } catch {
                return false;
            }
        } else {
            return false
        }
    }
    onMounted(() => {
        if(container.value) {
            // 获取container的宽度和高度
            const { width , height } = container.value.getBoundingClientRect()
            graph.value = new Graph({
                ...props.graphOptions,
                container: container.value,
                width,
                height,
            });
            graph.value.fromJSON(data.value)
            graph.value.centerContent() // 居中图
            // graph.value.dispose() // 销毁画布
        }
    })
    return {
        container,
        graph,
        addNode,
        addEdge
    }
}