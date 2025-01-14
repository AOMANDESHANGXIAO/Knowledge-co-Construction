/**
 * 颜色转换工具函数
 */

/**
 * hex转rgb
 * @param {string} str  色值，如：#409EFF
 * @returns rgb数组[64, 158, 255]
 */
const hexToRgb = (str: string): number[] => {
    let hexs: null | string[] = null;
    let reg = /^\#?[0-9A-Fa-f]{6}$/;
    if (!reg.test(str)) {
        throw new Error("色值不正确");
    }
    ;
    str = str.replace("#", ""); // 去掉#
    hexs = str.match(/../g); // 切割成数组 409EFF => ['40','9E','FF']
    if (hexs == null || hexs.length === 0) {
        throw new Error("色值不正确");
    }
    return hexs.map((item) => {
        return parseInt(item, 16)
    });
};

/**
 * 颜色减淡
 * @param {string} color  色值，如：##409EFF
 * @param {number} level 调整幅度，0~1之间
 * @returns {array} 最终颜色减淡的rgb数组
 */
const getLightColor = (color: string, level: number) => {
    let reg = /^\#?[0-9A-Fa-f]{6}$/;
    if (!reg.test(color)) {
        throw new Error("色值不正确");
    }
    ;
    let rgb = hexToRgb(color);
    // 循环对色值进行调整
    return rgb.map(color => {
        return Math.floor((255 - color) * level + color)
    });
};

/**
 * 颜色加深
 * @param {string} color  色值，如：##409EFF
 * @param {number} level 调整幅度，0~1之间
 * @returns 最终颜色加深的rgb数组
 */
const getDarkColor = (color: string, level: number) => {
    let reg = /^\#?[0-9A-Fa-f]{6}$/;
    if (!reg.test(color)){
        throw new Error("色值不正确");
    };
    let rgb = hexToRgb(color);
    return rgb.map(color => {
        return Math.floor(color - color * level)
    })
};

/**
 * rgb转hex
 * @param {number} r 红色色值，如：64
 * @param {number} g 绿色色值，如：158
 * @param {number} b 蓝色色值，如：255
 * @returns 最终rgb转hex的值，如：64,158,255 -> #409EFF
 */
const rgbToHex = (r: number, g: number, b: number): string => {
    let reg = /^\d{1,3}$/; // 限定1-3位 -> 0~255
    if (!reg.test(String(r)) || !reg.test(String(g)) || !reg.test(String(b))) {
        throw new Error("rgb值不正确");
    };
    let hex = [r.toString(16), g.toString(16), b.toString(16)];
    // 转换的值如果只有一位则补0
    for (let i = 0; i < 3; i++) {
        if (hex[i].length === 1) hex[i] = `0${hex[i]}`;
    }
    return `#${hex.join("")}`; // #409eff
};

/**
 *  获取hex加深后的颜色
 * @param color hex颜色
 * @param level 加深的程度
 * @returns string hex颜色
 */

const getHexColorDark = (color: string, level: number) => {
    let rgb = getDarkColor(color, level);
    if(!rgb){
        throw new Error("rgb值不正确");
    }
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 *  获取hex变浅后的颜色
 * @param color hex颜色
 * @param level 减少的程度
 * @returns string hex颜色
 */

const getHexColorLight = (color: string, level: number) => {
    let rgb = getLightColor(color, level);
    if(!rgb){
        throw new Error("rgb值不正确");
    }
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 *
 * @returns 颜色值
 */
const rdmRgbColor = () => {
    //随机生成RGB颜色
    let arr:number[] = [];
    for (let i = 0; i < 3; i++) {
        // 暖色
        arr.push(Math.floor(Math.random() * 128 + 64));
        // 亮色
        arr.push(Math.floor(Math.random() * 128 + 128));
    }
    let [r, g, b] = arr;
    // rgb颜色
    // 16进制颜色
    return `#${r.toString(16).length > 1 ? r.toString(16) : '0' + r.toString(16)}${g.toString(16).length > 1 ? g.toString(16) : '0' + g.toString(16)}${
        b.toString(16).length > 1 ? b.toString(16) : '0' + b.toString(16)}`;
}

export {
    hexToRgb,
    getLightColor,
    getDarkColor,
    rgbToHex,
    getHexColorDark,
    getHexColorLight,
    rdmRgbColor
};
