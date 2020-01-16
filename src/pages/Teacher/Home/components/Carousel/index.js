/*
 * @Description: 首页面模块滑动功能（ 考中首页， 线上平台-听说模块-首页 ）
 * @Version:
 * @export: []
 * @export.default:
 */

import React,{PureComponent} from "react";
import ReactDOM from "react-dom";
import cs from "classnames";
import styles from "./index.less";


class Carousel extends PureComponent{

  childrenRefs = [];    // 子级列表

  childrenPos = [];     // 子集位移

  connectWidth = 0; // 显示区的宽度

  sliderWidth = 0; //  滑块区域的总长度

  state = {
    mode : "init", // init 初始化 inside 足够宽的时候 outside 不够快的时候
    left : 0,      // 偏移量
  }

  constructor(props){
    super(props);
    this.contentDom = React.createRef();
    this.sliderDom = React.createRef();
  }

  componentDidMount(){
    this.onWindowSize();
    window.addEventListener("resize",this.onWindowSize);
    this.childrenPos = this.childrenRefs.map(item=>{
      // eslint-disable-next-line react/no-find-dom-node
      const {offsetLeft,offsetWidth} = ReactDOM.findDOMNode(item.current);
      return {
        offsetLeft,
        offsetWidth
      }
    })
  }

  componentWillUnmount(){
    window.removeEventListener("resize",this.onWindowSize);
  }

  // windowsize 变化
  onWindowSize = ()=>{
    this.connectWidth = this.contentDom.current.offsetWidth;
    this.sliderWidth = this.sliderDom.current.offsetWidth;
    if( this.connectWidth >= this.sliderWidth ){
      this.setState({
        mode : "inside",
        left : 0
      })
    }else{
      this.setState({
        mode : "outside"
      })
    }
  }

  // 向左
  nextFn = ()=>{
    const { left, mode } = this.state;

    if( mode === "init" || mode === "inside" ){
      return;
    }

    // 获取最靠左侧未隐藏的 hideKey
    let hideKey = 0;
    let find = false;
    this.childrenPos.forEach((item,index)=>{
      const { offsetLeft } = item;
      if( offsetLeft+left >= 0 && !find ){
        find = true;
        hideKey = index;
      }
    });

    // 假设如果向左移动一格，右侧还预留多少
    const nextPos = this.childrenPos[hideKey+1];
    if( nextPos && find ){
      const { offsetLeft } = nextPos;
      if( this.sliderWidth - offsetLeft > this.connectWidth ){
        this.setState({
          left : 0-offsetLeft
        });
      }else{
        this.setState({
          left : this.connectWidth - this.sliderWidth
        });
      }
    }
  }

  // 向右
  preFn = ()=>{
    const { left, mode } = this.state;

    if( mode === "init" || mode === "inside" ){
      return;
    }

    // 获取最靠右侧未隐藏的 hideKey
    let hideKey = 0;
    let find = false;
    this.childrenPos.forEach((item,index)=>{
      const { offsetLeft, offsetWidth } = item;
      if( offsetLeft+left+offsetWidth <= this.connectWidth ){
        find = true;
        hideKey = index;
      }
    });

    // 假设如果向右移动一格，左侧还预留多少
    const nextPos = this.childrenPos[hideKey-1];
    if( nextPos && find ){
      const { offsetLeft, offsetWidth } = nextPos;
      if( offsetLeft + offsetWidth > this.connectWidth ){
        this.setState({
          left : this.connectWidth - offsetLeft - offsetWidth
        });
      }else{
        this.setState({
          left : 0
        });
      }
    }

  }



  // 根据相关条件，生成滑动块相关的样式
  getSliderStyle = ()=>{
    const { mode, left } = this.state;

    const defaultStyle = {
      top : 0,
      position: 'absolute',
      display : "flex",
      justifyContent : "flex-start",
      left
    };

    // 初始化
    if( mode === "init" ){
      return {
        ...defaultStyle,
        visibility : "hidden" // 第一次只是占位，获取宽度，不显示内容
      }
    }

    // 如果总模块的宽度大于等于滑块的总宽度，则显示全部
    if( mode === "inside" ){
      // 不影响正常引用的清空下，置空
      const { connectWidth, sliderWidth } = this;
      return {
        ...defaultStyle,
        marginLeft: `${(connectWidth - sliderWidth)/2}px`
      }
    }

    // 如果模块大于滑块的总宽度
    return {
      ...defaultStyle,
      transition : "all 0.3s ease-in-out"
    }
  }


  // 获取滑动块的子元素
  getChildren = ()=>{
    const { children } = this.props;
    const { mode, left } = this.state;
    // 添加child试卷
    this.childrenRefs = [];
    return React.Children.map(children,(child,index)=>{
      const params = {
        style : {
          transition : "opacity 0.3s ease-in-out"
        }
      };
      if( mode === "init" ){
        // 初始化
        const ref = React.createRef();
        this.childrenRefs.push(ref);
        params.ref = ref;
      }else if( mode === "outside" ){
        // 滑块大于外部，超出部分半透明效果
        const { offsetLeft, offsetWidth } = this.childrenPos[index];
        if( offsetLeft+left < 0 || offsetLeft+left+offsetWidth > this.connectWidth ){
          params.style.opacity = 0.2;
          params.style.pointerEvents="none";
        }
      }
      return React.cloneElement(child, params);
    });
  }

  // 切换tab
  getChangeTab = ()=>{
    const { mode, left } = this.state;
    if( mode !== "outside" ){
      return null;
    }

    const preStyle = {
      left : "-30px"
    }

    const nextStyle = {
      right : "-30px"
    }

    const preCs = cs(
      styles.btn,
      { [styles.disabled] : left === 0 },
      'icon-previous',
      'iconfont'
    );

    const nextCs = cs(
      styles.btn,
      { [styles.disabled] : left === (this.connectWidth - this.sliderWidth ) },
      'icon-next',
      'iconfont'
    );

    return (
      <>
        <div className={preCs} onClick={this.preFn} style={preStyle} />
        <div className={nextCs} onClick={this.nextFn} style={nextStyle} />
      </>
    );

  }


  render(){
    const { className, style } = this.props;

    // 主体模块样式
    const contentStyle = {
      width : "100%",
      height : "100%",
      ...style,
      overflow : "none",
      position : "relative",
    };

    // 获取滑块的样式
    const sliderStyle = this.getSliderStyle();

    return (
      <div ref={this.contentDom} className={className} style={contentStyle}>
        <div ref={this.sliderDom} style={sliderStyle}>
          {this.getChildren()}
        </div>
        {
          this.getChangeTab()
        }
      </div>
    )
  }

}

export default Carousel;
