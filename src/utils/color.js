/**
 * 十六进制颜色码转换为RGB颜色，并设置透明度
 * @author tina.zhang
 * @date   2019-05-10
 * @param {string} color - 十六进制颜色码
 * @param {number} opacity - 透明度0-1,默认值0.1
 */
// eslint-disable-next-line import/prefer-default-export
export function getRGBWithTransition(color, opacity) {

    let sColor = color.toLowerCase();
  
    // 十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        Array.prototype.map.call(sColor, (item) => {
          sColorNew += item + item;
        })
        sColor = sColorNew;
      }
      // 处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        // eslint-disable-next-line radix
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`));
      }
      return `RGB(${sColorChange.join(",")},${opacity || 0.1})`;
    }
    return sColor;
  }
  
  /**
   * 图表主题
   */
  // export const BizChartColors = ["#03C46B", "#228EFF", "#FFB400", "#7D5CD5", "#FF6E4A", "#01BAD4", "#FFEB3C", "#96C2F8", "#FFB4CD", "#AFE96E", "#C6834F", "#E076E8", "#019688", "#C2CFDE", "#FFAA7E"];
  export const BizChartColors = ["#03C46B", "#228EFF", "#FFB400", "#7D5CD5", "#FF6E4A", "#01BAD4", "#FFEB3C", "#96C2F8", "#FFB4CD", "#AFE96E", "#C6834F", "#E076E8", "#019688", "#C2CFDE", "#FFAA7E", "#03C46B", "#228EFF", "#FFB400", "#7D5CD5", "#FF6E4A", "#01BAD4", "#FFEB3C", "#96C2F8", "#FFB4CD"];
  