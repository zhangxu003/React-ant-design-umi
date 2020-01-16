/*
 * @Author: tina.zhang
 * @Date: 2018-12-28 13:33:17
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-13 15:24:28
 * @Description: 教师机-任务列表页--上传答案包|下载是卷包的 网络不稳定，请稍后的作用
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { formatMessage } from 'umi/locale';
import cs from 'classnames';
import styles from './index.less';

@connect(({ popup, teacher }) => {
  const { data: taskId } = popup.transWarn;
  const { records = [] } = teacher.taskData;
  const { taskData } = teacher;
  let taskInfo = null;
  /** 区校考主任务+子任务，需要遍历子任务linkStatus */
  if (teacher.taskData.type === 'TT_6') {
    records.forEach(element => {
      if (!taskInfo) {
        taskInfo = element.subTaskList.find(item => item.taskId === taskId);
      }
    });
  } else {
    taskInfo = records.find(item => item.taskId === taskId) || {};
  }

  const { linkStatus } = taskInfo || {};

  // 统计状态 是在打包中，上传中，下载中
  let linkMap = '';
  if (linkStatus === 'ES_1' || linkStatus === 'ES_2' || linkStatus === 'ES_3') {
    linkMap = 'package';
  } else if (linkStatus === 'ES_4' || linkStatus === 'ES_5' || linkStatus === 'ES_6') {
    linkMap = 'download';
  } else if (linkStatus === 'ES_7' || linkStatus === 'ES_8' || linkStatus === 'ES_9') {
    linkMap = 'upload';
  }
  return { taskId, linkMap, taskData };
})
class TransFail extends Component {
  componentDidMount() {
    const { modal } = this.props;
    // 更新弹出框的具体样式
    modal.update({
      wrapClassName: styles.downloadfaild,
      footer: [
        <Button key="again" shape="round" type="main" onClick={this.clickAgainBtn}>
          {formatMessage({ id: 'task.button.keep.waiting', defaultMessage: '继续等待' })}
        </Button>,
        <Button key="export" shape="round" type="minor" onClick={this.clickHandleBtn}>
          {formatMessage({ id: 'task.button.back.list', defaultMessage: '返回列表' })}
        </Button>,
      ],
    });
  }

  /**
   * @description: 重试按钮继续等待
   * @param {type}
   * @return:
   */
  clickAgainBtn = () => {
    const { modal, taskId, linkMap, dispatch } = this.props;
    if (linkMap === 'package' || linkMap === 'download') {
      // 重新开始考试
      dispatch({
        type: 'teacher/runTask',
        payload: taskId,
      });
    } else if (linkMap === 'upload') {
      // 触发继续等待上传事件
      dispatch({
        type: 'teacher/rotationUpload',
        payload: taskId,
      });
    }
    // 关闭弹出框
    modal.onCancel();
  };

  /**
   * @description: 返回列表，关闭弹框，并刷新列表页面
   * @param {type}
   * @return:
   */
  clickHandleBtn = () => {
    const { modal, dispatch, taskData } = this.props;
    console.log('返回列表', taskData.type);
    if (taskData && taskData.type === 'TT_6') {
      // 区校考试列表刷新
      dispatch({ type: 'teacher/getDistrictData' });
    } else {
      dispatch({ type: 'teacher/getTaskData' });
    }

    // 关闭弹出框
    modal.onCancel();
  };

  render() {
    const { linkMap } = this.props;
    return (
      <div>
        <span className={cs('iconfont', 'icon-tip', styles['icon-tip'])} />
        <div className={styles.info}>
          {linkMap === 'package' || linkMap === 'download'
            ? formatMessage({
                id: 'task.message.network.instable',
                defaultMessage: '当前网络不稳定,请稍候！',
              })
            : formatMessage({
                id: 'task.message.task.running.in.back',
                defaultMessage: '任务在后台自动上传，上传结果请稍后，刷新列表或在线上平台查看！',
              })}
        </div>
      </div>
    );
  }
}

export default TransFail;
