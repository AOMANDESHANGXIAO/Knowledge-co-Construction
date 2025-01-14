import { defineComponent, h, type App } from "vue";
import { parse } from "svg-parser";

const icons = import.meta.glob("./icons/*.svg", {
    as: "raw",
    eager: true,
});

const getIconURL = (name: string) => {
    return `./icons/${name}.svg`;
};

const getIconComponent = (name: string) => {
    const iconName = name;
    const svgText = icons[getIconURL(iconName)]

    if (!svgText) {
        throw new Error(`Icon ${iconName} not found`)
    }

    return defineComponent({
        name: `${name}Icon`,
        props: {
            size: {
                type: [Number, String],
                default: 24,
            },
            color: {
                type: String,
                default: "#333",
            },
            strokeWidth: {
                type: [Number, String],
                default: 2,
            },
        },
        setup({ size, color, strokeWidth }) {
            return () => {
                // Parse SVG text
                const parsedSvg = parse(svgText);

                // Modify SVG attributes
                const modifySvgAttributes = (node: any) => {
                    if (node.type === "element" && node.tagName === "svg") {
                        node.properties = {
                            ...node.properties,
                            width: size,
                            height: size,
                            stroke: color,
                            fill: "none",
                            "stroke-width": strokeWidth,
                            viewBox: node.properties.viewBox || "0 0 24 24",
                        };
                    } else if (node.type === "element") {
                        node.properties = {
                            ...node.properties,
                            stroke: color,
                            fill: "none",
                            "stroke-width": strokeWidth,
                        };
                    }

                    // Recursively process child nodes
                    if (node.children) {
                        node.children = node.children.map(modifySvgAttributes);
                    }

                    return node;
                };

                // Convert parsed SVG to VNode
                const transformParsedSvgToVNode = (node: any): any => {
                    if (node.type === "element") {
                        return h(
                            node.tagName,
                            node.properties,
                            node.children
                                ? node.children.map(transformParsedSvgToVNode)
                                : undefined
                        );
                    }
                    return node.value;
                };

                const modifiedSvg = modifySvgAttributes(parsedSvg.children[0]);
                return transformParsedSvgToVNode(modifiedSvg);
            };
        },
    });
};

/**
 * This function is for local registration of icons
 */
export { getIconComponent };

/**
 * This plugin for global registration of all icons
 */
export default {
    install(app: App) {
        try {
            Object.keys(icons).forEach(async (key) => {
                const name = key
                    .match(/([^/\\]+)(?:\.[^.]+)?$/)?.[1]!
                    .replace(/\.[^.]+$/, "")!;
                const IconComponent = getIconComponent(name);
                console.log("IconComponent", IconComponent);
                app.component(name, IconComponent);
            });
        } catch (error) {
            console.error("There was an error, when installing the icons", error);
        }
    },
};
