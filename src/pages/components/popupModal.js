/*
 * @Author: tina.zhang
 * @Date: 2018-12-19 17:15:32
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-05 10:56:28
 * @Description: 用于设置popup的弹出框,
 * 进过该组件包裹以后的组件，都会存在 modal数据，可以绑定onOK，onCancel事件
 */


import React, { PureComponent } from 'react';
import { Modal } from "antd";

const defaultOpt = {
  centered       : true, // 是否居中显示
  destroyOnClose : true, // 关闭后销毁子元素
  maskClosable   : false, // 是否允许点击遮罩层关闭弹框
};

class PopupModal extends PureComponent {

  /**
   * 初始化配置数据
   */
  state={
    options : defaultOpt,
  }

  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const { visible : current } = this.props;
    // 关闭弹框后清空当前的页面状态
    if( visible === false && current ){
      setTimeout(()=>{
        this.setState({options:defaultOpt});
      },300);
    }
  }

  /**
   * @description: 绑定modal的onOk事件
   * @param {type}
   * @return:
   */
  setOk = fn =>{
    this.setState(state=>({
      options : {
        ...state.options,
        onOk : fn
      }
    }));
  }

  /**
   * @description: 绑定modal的onCancel事件
   * @param {type}
   * @return:
   */
  setCancel = fn=>{
    this.setState(state=>({
      options : {
        ...state.options,
        onCancel : fn
      }
    }));
  }

  /**
   * @description: 绑定modal的全部配置参数
   * @param {type}
   * @return:
   */
  update = options=>{
    this.setState(state=>({
      options : {
        ...state.options,
        ...options
      }
    }))
  }


  render(){
    const { children, ...params } = this.props;
    const { options } = this.state;
    const item = { ...params,...options };

    item.visible = Boolean(item.visible);

    if( !item.onOk || typeof(item.onOk) !== "function" ){
      item.onOk = ()=>{};
    }

    if( !item.onCancel || typeof(item.onCancel) !== "function" ){
      item.onCancel = ()=>{};
    }

    const newChildren = React.cloneElement(children,{
      modal  : {
        ...item,
        setOk     : this.setOk,
        setCancel : this.setCancel,
        update    : this.update
      },
    });

    return <Modal {...item}>{newChildren}</Modal>;
  }

}

export default PopupModal;
