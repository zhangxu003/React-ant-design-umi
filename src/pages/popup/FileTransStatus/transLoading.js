/*
 * @Author: tina.zhang
 * @Date: 2018-12-28 13:33:17
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-15 19:11:14
 * @Description: 教师机-任务列表页--上传答案包|下载是卷包的 文件传输中。
 */

import React, { Component } from 'react';
import { connect } from "dva";
import { formatMessage } from 'umi/locale';
import cs from "classnames";
import styles from './index.less';

@connect(( {popup,teacher} )=>{
  const { data : taskId } = popup.transLoading || {};
  let linkStatus = "";
  if( taskId ){
    const { records = [] } = teacher.taskData;
    /**区校考主任务+子任务，需要遍历子任务linkStatus */
    if(teacher.taskData.type === "TT_6"){
      let taskInfo = null;
      for(let i in records){
        taskInfo = records[i].subTaskList.find(item=>item.taskId===taskId);
        if(taskInfo){
          break;
        }
      }
      
      if( taskInfo ){
        ({linkStatus} = taskInfo);
      }
    }else{
      const taskInfo = records.find(item=>item.taskId===taskId);
      if( taskInfo ){
        ({linkStatus} = taskInfo);
      }
    }
    
  }

  // 统计状态 是在打包中，上传中，下载中
  let linkMap = "";
  if( linkStatus === "ES_1" || linkStatus === "ES_3" ){
    linkMap = "package";
  }else if( linkStatus === "ES_4" || linkStatus === "ES_5" || linkStatus === "ES_6" || linkStatus === "ES_2" ){
    linkMap = "download";
  }else if( linkStatus === "ES_7" || linkStatus === "ES_8" || linkStatus === "ES_9" ){
    linkMap = "upload";
  }

  return { linkMap };
})
class TransLoading extends Component {

  componentDidMount(){
    const {modal} = this.props;
    modal.update({
      wrapClassName : styles.downloading,
    });
  }

  render( ) {
    const { linkMap } = this.props;
    let msg = "";
    if( linkMap === "package" ){
      msg = formatMessage({id:"task.message.wait.for.package.paper",defaultMessage:"正在打包试卷...请耐心等待"});
    }else if( linkMap === "download" ){
      msg = formatMessage({id:"task.message.wait.for.download.paper",defaultMessage:"正在下载试卷...请耐心等待"});
    }else if( linkMap === "upload" ){
      msg = formatMessage({id:"task.message.wait.for.upload.paper",defaultMessage:"正在上传答卷包…请稍候"});
    }

    return (
      <>
        <span className={cs('iconfont','icon-loading',styles['icon-loading'])} />
        <div className={styles['loading-info']}>{msg}</div>
      </>
    );
  }
}

export default TransLoading;
