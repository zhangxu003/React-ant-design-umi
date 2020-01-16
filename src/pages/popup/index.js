/*
 * @Author: tina.zhang
 * @Date: 2018-12-19 13:55:35
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-05 16:10:03
 * @Description: 弹出框集合
 *
 * 注意 ： 在弹出的子组件中，props会多一个modal对象
 * 1. 可以通过setOk方法改写弹出层默认的确认按钮事件；
 * modal.setOk(fn)
 * 2. 可以通过setCancel方法改写弹出层默认的取消事件
 * modal.setCancel(fn)
 * 3. 可以通过onOK方法自动调用确认按钮事件
 * modal.onOk();
 * 4. 可以通过onCancel方法自动调用取消按钮事件
 * modal.onCancel();
 * 5. 可以通过update方法自动改写弹出层全部功能
 * modal.update({
 *  title   : "new title",
 *  loading : true,
 *  onOk    : ()=>{},
 *  onCancel : ()={}
 *  ...
 * })
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import PopupModal from '@/pages/components/popupModal';
import ExamExceptionHanding from './ExceptionHanding/Exam';
import PracticeExceptionHanding from './ExceptionHanding/Practice';
import TransLoading from './FileTransStatus/transLoading';
import TransFail from './FileTransStatus/transFail';
import TransWarn from './FileTransStatus/transWarn';
import Report from './Report';
import AutoCheck from './AutoCheck';
import DropEarphone from './DropEarphone';
import Permission from './Permission';

@connect(({ popup, loading }) => ({
  examExceptionHandle: popup.examExceptionHandle && popup.examExceptionHandle.visible, // 教师机--任务监控--异常处理-考试
  practiceExceptionHandle: popup.practiceExceptionHandle && popup.practiceExceptionHandle.visible, // 教师机--任务监控--异常处理-练习
  transLoading:
    loading.effects['teacher/runTask'] ||
    loading.effects['teacher/endTask'] ||
    loading.effects['teacher/rotationUpload'], // 教师机--任务列表--上传答题包或下载试卷包loading
  transFail: popup.transFail && popup.transFail.visible, // 教师机--任务列表--上传答题包或下载试卷包fail
  transWarn: popup.transWarn && popup.transWarn.visible, // 教师机--任务列表--上传答题包或下载试卷包warn
  report: popup.report && popup.report.visible, // 教师机--监控--一键检测报告弹框
  autoCheck: loading.effects['teacher/autoCheck'], // 教师机--首页--自动检测进度状态
  dropEarphone: popup.dropEarphone && popup.dropEarphone.visible, // 学生机--耳机掉落事件
  permission: popup.permission && popup.permission.visible, // 权限不足的时候提示弹框
}))
class Popup extends PureComponent {
  render() {
    const { dispatch } = this.props;
    // 是否显示某个弹框
    const {
      // 教师机
      examExceptionHandle,
      practiceExceptionHandle,
      transLoading,
      transFail,
      transWarn,
      report,
      autoCheck,
      // 学生机
      dropEarphone,
      permission,
    } = this.props;

    // 默认的弹框配置
    const defaultOpt = {
      centered: true, // 是否居中显示
      destroyOnClose: true, // 关闭后销毁子元素
      maskClosable: false, // 是否允许点击遮罩层关闭弹框
    };

    // 弹出层对象集合
    const modals = [];

    // 教师机--任务监控--异常处理--考试
    modals.push({
      key: 'examExceptionHandle',
      visible: Boolean(examExceptionHandle),
      forceRender: true,
      title: formatMessage({ id: 'task.title.handle.error', defaultMessage: '异常处理' }),
      width: 500,
      children: <ExamExceptionHanding />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'examExceptionHandle',
        });
      },
    });

    // 教师机--任务监控--异常处理--练习
    modals.push({
      key: 'practiceExceptionHandle',
      visible: Boolean(practiceExceptionHandle),
      forceRender: true,
      title: formatMessage({ id: 'task.title.handle.error', defaultMessage: '异常处理' }),
      width: 600,
      footer: null,
      children: <PracticeExceptionHanding />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'practiceExceptionHandle',
        });
      },
    });

    //  教师机--任务列表--上传答题包或下载试卷包loading
    modals.push({
      key: 'transLoading',
      visible: Boolean(transLoading),
      closable: false,
      width: 340,
      footer: null,
      children: <TransLoading />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'transLoading',
        });
      },
    });

    // 教师机--任务列表--上传答题包或下载试卷包fail
    modals.push({
      key: 'transFail',
      visible: Boolean(transFail),
      width: 400,
      closable: false,
      footer: null,
      children: <TransFail />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'transFail',
        });
      },
    });

    // 任务列表中-上传或下载任务的时候网络不稳定
    modals.push({
      key: 'transWarn',
      visible: Boolean(transWarn),
      width: 400,
      closable: false,
      footer: null,
      children: <TransWarn />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'transWarn',
        });
      },
    });

    // 教师机--test--一键检测报告
    modals.push({
      key: 'report',
      visible: Boolean(report),
      width: 570,
      title: formatMessage({ id: 'task.title.tips', defaultMessage: '提示' }),
      footer: null,
      children: <Report />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'report',
        });
      },
    });

    // 教师机--首页--一键检测状态弹框
    modals.push({
      key: 'autoCheck',
      visible: Boolean(autoCheck),
      closable: false,
      width: 360,
      footer: null,
      children: <AutoCheck />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'autoCheck',
        });
      },
    });

    // 学生机--耳机掉落
    modals.push({
      key: 'dropEarphone',
      title: formatMessage({ id: 'task.title.tips', defaultMessage: '提示' }),
      visible: Boolean(dropEarphone),
      closable: false,
      width: 520,
      footer: null,
      children: <DropEarphone />,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'dropEarphone',
        });
      },
    });

    // 权限内容的弹出成
    modals.push({
      key: 'permission',
      title: null,
      visible: Boolean(permission),
      closable: true,
      centered: true,
      width: 930,
      footer: null,
      children: <Permission />,
      zIndex: 1001,
      onCancel: () => {
        dispatch({
          type: 'popup/close',
          payload: 'permission',
        });
      },
    });

    // 生成弹出层集合
    return modals.map(item => {
      const { children, key, ...params } = item;
      const opt = { ...defaultOpt, ...params };
      return (
        <PopupModal key={key} {...opt}>
          {children}
        </PopupModal>
      );
    });
  }
}
export default Popup;
