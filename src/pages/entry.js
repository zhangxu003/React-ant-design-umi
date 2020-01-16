/*
 * @Author: tina.zhang
 * @Date: 2018-12-25 16:21:30
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-02-26 11:06:00
 * @Description: 系统的整体入口，用于区分学生机和教师机
 */
import React,{PureComponent, Fragment} from 'react';
import { connect } from "dva";
import router from 'umi/router';
import Popup from "./popup";

@connect(({ vbClient })=>({
  role  : vbClient.role,  // 机器的角色 teacher or student
  state : vbClient.state  // agent链接状态 119 连通 120 不连接
}))
class Entry extends PureComponent {

  componentDidMount(){
    // 判断当前的路径是否是/如果是则进行路由选择，否则直接进入下一个页面
    const { role,state,history } = this.props;
    if( history.location.pathname !== "/" ) return;
    let director = "";
    if( state !== 119 && state !== 120 ){
      // 未连接的话，跳转到错误页
      director = "/agenterror";
    }else if( role === "student" ){
      // 登录学生机
      director = "/student";
    }else if( role === "teacher" ){
      // 登录教师机
      director = "/teacher/clientCheck";
    }
    if( director ){
      router.push(director);
    }
    window.IsExamClient="Exam";//表示在考中平台
  }

  componentDidUpdate(){
    this.componentDidMount();
  }


  render(){
    const { children } = this.props;
    return <Fragment>{children}<Popup /></Fragment>;
  }

}

export default Entry;
