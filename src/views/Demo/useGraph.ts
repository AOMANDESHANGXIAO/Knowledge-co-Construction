import { Graph } from '@antv/x6';
import { onMounted, computed } from 'vue'

export interface Node {
    id: string;
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
        }
    })
    return {
        container,
        graph
    }
}