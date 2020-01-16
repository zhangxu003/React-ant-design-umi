/**
 * 画板功能测试
 */
import React, { PureComponent } from 'react';
import { Radio, Divider } from 'antd';
import cs from 'classnames';
import styles from './draw.less';

const toolList = [
  { key: 'frame', icon: 'icon-board-rectangle' },
  { key: 'circle', icon: 'icon-board-circular' },
  { key: 'arrow', icon: 'icon-board-arrow' },
  { key: 'pen', icon: 'icon-board-pen' },
  { key: 'text', icon: 'icon-board-text' },
];

const weightList = [
  { key: 'lighter', weight: 3 },
  { key: 'normal', weight: 7 },
  { key: 'bold', weight: 10 },
];

const colorList = [
  { key: 'redOrigin', color: '#FF6E4A' },
  { key: 'green', color: '#03C46B' },
  { key: 'orange', color: '#FFB400' },
  { key: 'blue', color: '#228EFF' },
];

const sizeList = [
  { key: 'small', size: 12, icon: 'icon-a-' },
  { key: 'middle', size: 16, icon: 'icon-a1' },
  { key: 'large', size: 22, icon: 'icon-a' },
];

class Draw extends PureComponent {
  state = {
    tool: 'frame', // 绘图工具 frame:框; circle:圈; arrow:箭头; pen:笔; text:文本
    weight: 'lighter', // 线条粗细 lighter:细; normal: 正常； bold:粗；
    color: 'redOrigin', // 线条颜色
    size: 'middle', // 字体大小
    type: 'draw', // 绘图模式，draw: 画面模式； show: 试卷模式
  };

  drawData = {
    // 初始化绘制数据
  };

  constructor(props) {
    super(props);
    this.textArea = React.createRef();
  }

  // ====================== 流程 =======================

  componentDidMount() {
    const { relation } = this.props;
    // 在该页面，生成两层cavase
    // 1、内层展示
    // 2、外层绘制

    if (!relation.current) return;

    relation.current.style.position = 'relative';

    const { offsetWidth, offsetHeight } = relation.current;
    /**
     * 图形在 外层绘制，
     * 当鼠标mouseup,则，将绘制层的图，生成图片，并写去到 内层展示，并且 外层 重置画布
     */

    // 生成展示层
    const showCanvas = document.createElement('canvas');
    showCanvas.width = offsetWidth;
    showCanvas.height = offsetHeight;
    showCanvas.style.position = 'absolute';
    showCanvas.style.top = '0px';
    showCanvas.style.left = '0px';
    showCanvas.style.zIndex = 2;
    relation.current.appendChild(showCanvas);
    this.showCanvas = showCanvas;
    this.showCanvasCtx = showCanvas.getContext('2d');

    // 生成绘制层
    const drawCanvas = showCanvas.cloneNode();
    drawCanvas.style.zIndex = 3;
    relation.current.appendChild(drawCanvas);
    this.drawCanvas = drawCanvas;
    this.drawCanvasCtx = drawCanvas.getContext('2d');

    // 展示层默认穿透
    showCanvas.style.pointerEvents = 'none';

    // 给绘制层，绑定监听鼠标事件，用于图形绘制
    this.drawCanvas.addEventListener('mousedown', this.drawMouseDown);
    this.drawCanvas.addEventListener('click', this.drawText);
  }

  // 判断项目id，是否变动，如果改变则重置
  componentDidUpdate(preProps) {
    const { uuiq, relation } = this.props;
    const { uuiq: oldUuiq } = preProps;
    if (uuiq && uuiq !== oldUuiq) {
      // 删除文本框
      if (this.cursor && this.cursor.parentNode) {
        this.cursor.parentNode.removeChild(this.cursor);
      }
      // 清空绘图
      this.clear();
      // 重置范围
      if (!relation.current || !this.drawCanvas || !this.showCanvas) return;
      relation.current.style.position = 'relative';
      const { offsetWidth, offsetHeight } = relation.current;
      this.drawCanvas.width = offsetWidth;
      this.drawCanvas.height = offsetHeight;
      this.showCanvas.width = offsetWidth;
      this.showCanvas.height = offsetHeight;
    }
  }

  componentWillUnmount() {
    this.drawCanvas.removeEventListener('mousedown', this.drawMouseDown);
    this.drawCanvas.removeEventListener('mousemove', this.drawMouseMove);
    this.drawCanvas.removeEventListener('click', this.drawText);
    document.removeEventListener('mouseup', this.drawMouseUp);

    // 删除文本框
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }

    // 删除绘制层canvas
    if (this.drawCanvas && this.drawCanvas.parentNode) {
      this.drawCanvas.parentNode.removeChild(this.drawCanvas);
    }

    // 删除展示层canvas
    if (this.showCanvas && this.showCanvas.parentNode) {
      this.showCanvas.parentNode.removeChild(this.showCanvas);
    }
  }

  // ====================== canvas event =======================

  // 鼠标按下
  drawMouseDown = ev => {
    const { tool, weight, color } = this.state;
    const ctx = this.drawCanvasCtx;
    // 开启新路径
    ctx.beginPath();
    // 确认颜色
    const { color: colorVal } = colorList.find(item => item.key === color);
    ctx.strokeStyle = colorVal;
    ctx.fillStyle = colorVal;
    // 确认宽度
    ctx.lineWidth = weightList.find(item => item.key === weight).weight;
    // 接触点圆角
    ctx.lineJoin = 'round';
    // 获取起始点
    const { offsetX, offsetY } = ev;
    this.drawData.start = {
      x: offsetX,
      y: offsetY,
    };
    ctx.moveTo(offsetX, offsetY);
    // 文件绘制，不走此方法
    if (tool === 'text') return;
    // 监听移动
    this.drawCanvas.addEventListener('mousemove', this.drawMouseMove);
    // 监听放开
    document.addEventListener('mouseup', this.drawMouseUp);
  };

  // 鼠标移动
  drawMouseMove = ev => {
    const { tool } = this.state;
    switch (tool) {
      // 矩形
      case 'frame':
        this.drawFrame(ev);
        break;
      // 圈
      case 'circle':
        this.drawCircle(ev);
        break;
      // 箭头
      case 'arrow':
        this.drawArrow(ev);
        break;
      // 画笔
      case 'pen':
        this.drawPen(ev);
        break;
      default:
        break;
    }
  };

  // 鼠标放开
  drawMouseUp = () => {
    this.drawCanvas.removeEventListener('mousemove', this.drawMouseMove);
    document.removeEventListener('mouseup', this.drawMouseUp);
    // 将绘制层内容，复制到 展示层
    this.showCanvasCtx.drawImage(this.drawCanvas, 0, 0);
    // 绘制层重置画布
    this.drawCanvasCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
  };

  // 绘制 矩形
  drawFrame = ev => {
    const { start = {} } = this.drawData;
    // 获取当前点位
    const { offsetX, offsetY } = ev;
    const ctx = this.drawCanvasCtx;
    ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    ctx.strokeRect(start.x, start.y, offsetX - start.x, offsetY - start.y);
  };

  // 绘制圈
  drawCircle = ev => {
    const { start = {} } = this.drawData;
    // 获取当前点位
    const { offsetX, offsetY } = ev;
    const ctx = this.drawCanvasCtx;
    // 圆心
    const x = (offsetX - start.x) / 2 + start.x;
    const y = (offsetY - start.y) / 2 + start.y;
    ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    if (ev.ctrlKey === true) {
      // 如果当前是按住ctrl，则圆形
      const r = Math.sqrt((offsetX - start.x) ** 2 + (offsetY - start.y) ** 2) / 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      // 椭圆形
      let radiusX;
      let radiusY;
      if (Math.abs(offsetX - start.x) > Math.abs(offsetY - start.y)) {
        radiusX = Math.abs(offsetX - start.x) / 2;
        radiusY = Math.abs(offsetY - start.y) / 2;
      } else {
        radiusX = Math.abs(offsetX - start.x) / 2;
        radiusY = Math.abs(offsetY - start.y) / 2;
      }
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  // 绘制箭头
  drawArrow = ev => {
    const { weight } = this.state;
    const weightVal = weightList.find(item => item.key === weight).weight;
    const { start = {} } = this.drawData;
    // 获取当前点位
    const { offsetX, offsetY } = ev;
    const ctx = this.drawCanvasCtx;

    ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    ctx.beginPath();

    // 画箭头
    const angle = (Math.atan2(start.y - offsetY, start.x - offsetX) * 180) / Math.PI;
    // 箭头和直线的夹角
    const theta = 30;
    const length = weightVal * 3;
    const angle1 = ((angle + theta) * Math.PI) / 180;
    const angle2 = ((angle - theta) * Math.PI) / 180;
    const topX = length * Math.cos(angle1);
    const topY = length * Math.sin(angle1);
    const botX = length * Math.cos(angle2);
    const botY = length * Math.sin(angle2);
    // 箭头 a 点 x,y 坐标
    const arrowAX = offsetX + topX;
    const arrowAY = offsetY + topY;
    // 箭头 b 点 x,y 坐标
    const arrowBX = offsetX + botX;
    const arrowBY = offsetY + botY;

    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(arrowAX, arrowAY);
    ctx.lineTo(arrowBX, arrowBY);
    ctx.closePath();
    ctx.fill();

    // 画直线,直线稍短点
    const x = (arrowAX - arrowBX) / 2 + arrowBX;
    const y = (arrowAY - arrowBY) / 2 + arrowBY;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 画笔绘制
  drawPen = ev => {
    // 获取当前点位
    const { offsetX, offsetY } = ev;
    const ctx = this.drawCanvasCtx;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  // 文本操作
  drawText = ev => {
    const { tool, color, size } = this.state;
    if (tool !== 'text') return;
    const { relation } = this.props;
    const { offsetX, offsetY } = ev;
    const { color: colorVal } = colorList.find(item => item.key === color);
    const { size: sizeVal } = sizeList.find(item => item.key === size);
    const font = `normal normal ${sizeVal}px/${sizeVal * 1.5}px Arial, serif`;

    // 在当前位置，生成一个可编辑的div
    const cursor = document.createElement('div');
    cursor.id = 'drawDiv';
    cursor.setAttribute('type', 'text');
    cursor.style.top = `${offsetY}px`;
    cursor.style.left = `${offsetX}px`;
    cursor.style.color = colorVal;
    cursor.style.font = font;
    cursor.contentEditable = true;
    relation.current.appendChild(cursor);
    cursor.focus();
    this.cursor = cursor;

    cursor.addEventListener('blur', () => {
      const ctx = this.showCanvasCtx;
      // 绑定失去焦点事件
      // 1、获取文本写入 canvas 中
      ctx.font = font;
      ctx.textAlign = 'start';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colorVal;
      /**
       * 绘制多行文本
       * 思路：
       * 1、将文本通过换行符，风格成 多个字符串数据。
       * 2、对字符串数组遍历成字符串绘制
       * 3、绘制的时候，通过字节判断，截取超出的文本，进行换行
       */
      const lineHeight = sizeVal * 1.5; // 每行高度
      const x = offsetX + 1; // 启始位置X
      const y = offsetY + lineHeight / 2 + 1; // 启始位置Y

      let lineNum = 0;

      const strlist = cursor.innerText.split('\n');

      strlist.forEach(str => {
        let lineWidth = x;
        let lastSubStrIndex = 0; // 每次开始截取的字符串的索引
        for (let i = 0; i < str.length; i += 1) {
          const chartWidth = ctx.measureText(str[i]).width;
          lineWidth += chartWidth;
          if (lineWidth > this.showCanvas.width) {
            ctx.fillText(str.substring(lastSubStrIndex, i), x, lineHeight * lineNum + y); // 绘制截取部分
            lineNum += 1;
            lineWidth = x + chartWidth;
            lastSubStrIndex = i;
          }
          if (i === str.length - 1) {
            // 绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), x, lineHeight * lineNum + y);
          }
        }
        lineNum += 1;
      });

      // 2、删除当前输入框
      cursor.parentNode.removeChild(cursor);
      this.cursor = '';
    });
  };

  // ====================== button event =======================

  /**
   * 切换绘图工具
   */
  changeTool = tool => {
    this.setState({ tool });
  };

  /**
   * 切换线的粗细
   */
  changeWeight = weight => {
    this.setState({ weight });
  };

  /**
   * 切换字号
   */
  changeSize = size => {
    this.setState({ size });
  };

  /**
   * 切换颜色
   */
  changeColor = color => {
    this.setState({ color });
  };

  /**
   * 切换画板还是试卷展示
   */
  changeType = e => {
    this.setState(
      {
        type: e.target.value,
      },
      () => {
        const { type } = this.state;
        if (type === 'show') {
          this.drawCanvas.style.pointerEvents = 'none';
        } else {
          this.drawCanvas.style.pointerEvents = 'auto';
        }
      }
    );
  };

  /**
   * 清空画布
   */
  clear = () => {
    this.drawCanvasCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.showCanvasCtx.clearRect(0, 0, this.showCanvas.width, this.showCanvas.height);
  };

  // ====================== render =======================
  /**
   * 工具类render
   */
  toolRender = () => {
    const { tool } = this.state;
    return toolList.map(item => (
      <div
        key={item.key}
        className={cs(
          styles['draw-tool-item'],
          { [styles.selected]: item.key === tool },
          'iconfont',
          item.icon
        )}
        onClick={() => this.changeTool(item.key)}
      />
    ));
  };

  /**
   * 线的粗细render
   */
  weightRender = () => {
    const { weight } = this.state;
    return weightList.map(item => (
      <div
        key={item.key}
        className={cs(styles['draw-font-weight'], { [styles.selected]: item.key === weight })}
        onClick={() => this.changeWeight(item.key)}
      >
        <div style={{ width: `${item.weight}px`, height: `${item.weight}px` }} />
      </div>
    ));
  };

  /**
   * 文本的字号
   */
  sizeRender = () => {
    const { size } = this.state;
    return sizeList.map(item => (
      <div
        key={item.key}
        className={cs(
          styles['draw-tool-item'],
          { [styles.selected]: item.key === size },
          'iconfont',
          item.icon
        )}
        onClick={() => this.changeSize(item.key)}
      />
    ));
  };

  /**
   * 颜色的render
   */
  colorRender = () => {
    const { color } = this.state;
    return colorList.map(item => (
      <div
        key={item.key}
        className={cs(styles['draw-font-color'], { [styles.selected]: item.key === color })}
        style={{ backgroundColor: item.color }}
        onClick={() => this.changeColor(item.key)}
      />
    ));
  };

  render() {
    const { type, tool } = this.state;
    return (
      <div className={styles.draw}>
        {/* 画板工具 */}
        {type === 'draw' && (
          <div className={styles['draw-tool']}>
            {this.toolRender()}
            <Divider className={styles['draw-tool-divider']} type="vertical" />
            <div className={styles['draw-tool-clear']} onClick={this.clear}>
              清空
            </div>
          </div>
        )}

        {/* 画板颜色，粗细 */}
        {type === 'draw' && (
          <div className={styles['draw-font']}>
            {tool === 'text' ? this.sizeRender() : this.weightRender()}
            <Divider className={styles['draw-font-divider']} type="vertical" />
            {this.colorRender()}
          </div>
        )}

        {/* 画板/试卷切换 */}
        <Radio.Group
          className={styles['draw-type']}
          value={type}
          buttonStyle="solid"
          onChange={this.changeType}
        >
          <Radio.Button value="draw">画板模式</Radio.Button>
          <Radio.Button value="show">试卷模式</Radio.Button>
        </Radio.Group>
      </div>
    );
  }
}

export default Draw;
