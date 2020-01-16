/*
 * @Author: tina.zhang
 * @Date: 2018-12-28 13:33:17
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-13 15:24:28
 * @Description: 教师机-任务列表页--上传答案包|下载是卷包的 文件传输失败。
 */

import React, { Component } from 'react';
import { connect } from "dva";
import { Button } from "antd";
import { formatMessage } from 'umi/locale';
import cs from "classnames";
import taskType from "@/pages/Teacher/taskType";
import styles from './index.less';

@connect(( {popup,teacher} )=>{
  const { data : taskId } = popup.transFail;
  const { records = [] } = teacher.taskData;
  let taskInfo = null;
  /**区校考主任务+子任务，需要遍历子任务linkStatus */
  if(teacher.taskData.type === "TT_6"){
   
    for(let i in records){
      taskInfo = records[i].subTaskList.find(item=>item.taskId===taskId);
      if(taskInfo){
        break;
      }
    }

  }else{
    taskInfo = records.find(item=>item.taskId===taskId) || {};
  }

  const { linkStatus, type } = taskInfo;

  // 统计状态 是在打包中，上传中，下载中
  let linkMap = "";
  if( linkStatus === "ES_1" || linkStatus === "ES_2" || linkStatus === "ES_3" ){
    linkMap = "package";
  }else if( linkStatus === "ES_4" || linkStatus === "ES_5" || linkStatus === "ES_6" ){
    linkMap = "download";
  }else if( linkStatus === "ES_7" || linkStatus === "ES_8" || linkStatus === "ES_9" ){
    linkMap = "upload";
  }

  const { taskData } = teacher;
  return {  taskId, linkMap, type ,taskData };
})
class TransFail extends Component {

  componentDidMount(){
    const { modal, linkMap } = this.props;

    const footer = linkMap === "package"?[
      <Button key="export" shape="round" type="main" onClick={this.clickHandleBtn}>
        {formatMessage({id:"task.button.i.know",defaultMessage:"我知道了"})}
      </Button>
    ]:[
      <Button key="again" shape="round" type="main" onClick={this.clickAgainBtn}>{formatMessage({id:"task.button.retry",defaultMessage:"重试"})}</Button>,
      <Button key="export" shape="round" type="minor" onClick={this.clickHandleBtn}>{formatMessage({id:"task.button.back.list",defaultMessage:"返回列表"})}</Button>
    ]

    // 更新弹出框的具体样式
    modal.update({
      wrapClassName : styles.downloadfaild,
      footer
    });
  }

  /**
   * @description: 重试按钮点击
   * @param {type}
   * @return:
   */
  clickAgainBtn = ()=>{
    const { modal, taskId, linkMap, dispatch } = this.props;
    if( linkMap === "download" ){
      // 重新下载
      dispatch({
        type : "teacher/runTask",
        payload : taskId
      });
    }else if( linkMap === "upload" ){
      // 重新上传
      dispatch({
        type : "teacher/endTask",
        payload : taskId
      });
    }
    // 关闭弹出框
    modal.onCancel();
  }

  /**
   * @description: 返回列表，关闭弹框，并刷新列表页面
   * @param {type}
   * @return:
   */
  clickHandleBtn = ()=>{
    const { modal, dispatch, taskData } = this.props;

    if(taskData.type === "TT_6"){
      dispatch({ type : "teacher/getDistrictData" });
    }else{
      dispatch({ type : "teacher/getTaskData" });
    }
    
    // 关闭弹出框
    modal.onCancel();
  }


  render() {
    const { linkMap, type } = this.props;
    const copyWriting = taskType(type);
    // {
    //   name         : "考试",
    //   ctualAttend  : "实考",
    //   shouldAttend : "应考",
    //   Invigilate   : "监考中"
    // }
    let msg = "";
    if( linkMap === "package" ){
      msg = formatMessage({id:"task.message.retry.publish.tag",defaultMessage:"本次{tag}无法启动，请重新发布{tag}！"},{"tag":copyWriting.name});
    }else if( linkMap === "download" ){
      msg = formatMessage({id:"task.message.download.paper.failed",defaultMessage:"下载试卷失败！"});
    }else if( linkMap === "upload" ){
      msg = formatMessage({id:"task.message.upload.answer.failed",defaultMessage:"上传答卷包失败！"});
    }
    return (
      <div>
        <span className={cs('iconfont','icon-warning',styles['icon-warning'])} />
        <div className={styles.info}>{msg}</div>
      </div>
    );
  }
}

export default TransFail;
