/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 设置耳机麦克风设置的弹出框
 * @Date: 2019-02-26 10:22:44
 * @LastEditTime: 2019-02-27 15:41:20
 */

import React,{Component} from "react";
import { Popover } from "antd";
import EarSetting from "./index";

export default class PopEarSetting extends Component{

  state = {
    visible : false
  }

  handleVisibleChange = (visible=false)=>{
    this.setState({visible});
  }

  render(){
    const { children } = this.props;
    const { visible } = this.state;
    return (
      <Popover
        content={<EarSetting onClose={this.handleVisibleChange} />}
        trigger="click"
        visible={visible}
        placement="topLeft"
        onVisibleChange={this.handleVisibleChange}
      >
        {children}
      </Popover>
    );
  }
}
