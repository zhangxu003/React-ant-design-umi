/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable eqeqeq */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/button-has-type */
/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Tag, Divider, Menu, Dropdown, Icon, Table, Radio } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import cs from 'classnames';
import { sendM } from '@/utils/instructions';
import Modal from '@/components/Modal';
import FontButton from '@/pages/Teacher/components/FontButton';
import BatchesStudentCount from './popup/BatchesStudentCount';
import taskType from '@/pages/Teacher/taskType';
import styles from './index.less';
import TaskSubCard from './taskSubCard';
import noneCardIcon from '@/assets/none_list_pic.png';
import {
  studentExamsStatusLib, // 学生考试任务状态字典库
} from '@/utils/dictionary';
// 显示空对象
const getEmptyRender = (img, text) => (
  <div className={styles.empty}>
    <img className={styles['empty-img']} src={img} alt={text} />
    <div className={styles['empty-text']}>{text}</div>
  </div>
);
@connect(({ dictionary, loading, task, teacher }, { teacherType = '' }) => {
  const { userInfo } = teacher;
  const {
    TASK_STATUS = [],
    LINKSTATUS = [],
    GRADE = [],
    UE_TYPE = [],
    UE_STATUS = [],
  } = dictionary;
  const runTask = loading.effects['teacher/runTask'];
  const delTask = loading.effects['teacher/delTask'];
  const beforeEndTask = loading.effects['teacher/beforeEndTask'];
  const endTask = loading.effects['teacher/endTask'];
  const { examPlaceDetail, examPlaceTasksDetail, registerStudentInfo } = task;
  // 文档路径-- 18.9	任务列表-不同角色对任务权限的调整
  // 根据 teacherType 获取当前老师的类型
  // MASTER	发布老师
  // SUB	代课老师
  // TEACHER	任课教师
  // 返回的teacherType可能是
  // Master
  // Sub
  // Teacher
  // Master,Teacher  属于Master
  // Sub,Teacher 属于Sub
  const teacherRole = teacherType.split(',') || [];

  return {
    runTask, // 开始测试或继续测试的loading
    beforeEndTask, // 点击结束按钮前的操作
    endTask, // 结束任务的loading状态
    delTask, // 删除任务的loading状态
    TASK_STATUS, // 任务状态字典库
    LINKSTATUS, // 任务的环节状态字典库
    teacherRole, // 当前任务中对于当前教师的角色( Master,SUB,TEACHER )
    examPlaceDetail,
    examPlaceTasksDetail,
    registerStudentInfo,
    GRADE,
    UE_STATUS,
    UE_TYPE,
    userInfo,
  };
})
class TaskList extends Component {
  state = {
    editTitle: false, // 编辑名称
    taskTitle: '', // 新的名称
    isDrown: this.props.showMore,
    ownClassName: '',
    choosePlaceVisible: false,
    infoVisible: false,
    jsx: <div />,
    name: '',
    classId: '',
    warntext: '',
  };

  // 更新任务列表
  getTaskData = (params = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'teacher/getTaskData',
      payload: params,
    });
  };

  // ====================tasklist按钮触发事件 ======================

  // 点击开始按钮
  clickBeginBtn = () => {
    const { dispatch, taskId, type } = this.props;
    const { name } = taskType(type);
    // 调用vb.getSocketManager().clientsInfo 获取学生机所有的状态
    const list = window.vb.getSocketManager().clients || [];
    const inTaskCount = list.reduce((arr, item) => {
      const { data } = item;
      if (data) {
        const info = JSON.parse(data);
        if (info.netStatus === 'MS_1' && !['MS_1', 'MS_10'].includes(info.binessStatus)) {
          arr.push({
            ...item,
            ...info,
          });
        }
      }
      return arr;
    }, []);

    if (inTaskCount.length === 0) {
      dispatch({
        type: 'teacher/runTask',
        payload: taskId,
      });
    } else {
      // 弹框提示,是否确认新任务
      // 弹出框
      Modal.confirm({
        title: '',
        width: 480,
        className: styles.confirm,
        content: (
          <div>
            <span className={cs('iconfont', 'icon-tip', styles['icon-tip'])} />
            <div className={styles.info}>
              <div className={styles.warning}>
                {formatMessage(
                  {
                    id: 'task.message.has.student.unfinished.type',
                    defaultMessage: '有学生未结束{type}！',
                  },
                  { type: name }
                )}
              </div>
              <div className={styles.label}>
                {formatMessage(
                  {
                    id: 'task.text.click.running.pre.task',
                    defaultMessage: '点击“开始”将结束上一场{name}',
                  },
                  { name }
                )}
                <br />
                {formatMessage({
                  id: 'task.message.do.sure.beginning',
                  defaultMessage: '是否确认开始？',
                })}
              </div>
            </div>
          </div>
        ),
        icon: null,
        centered: true,
        autoFocusButton: null,
        okText: formatMessage({ id: 'task.button.begin', defaultMessage: '开始' }),
        cancelText: formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' }),
        okButtonProps: {
          type: 'warn',
          shape: 'round',
        },
        cancelButtonProps: {
          shape: 'round',
          type: '',
        },
        onOk: () => {
          // 发送指令beforeProcess
          sendM('beforeProcess', { type: 'beforeProcess' });
          // 继续开始任务
          dispatch({
            type: 'teacher/runTask',
            payload: taskId,
          });
        },
      });
    }
  };

  // 点击结束按钮
  endTask = async studentExamInfo => {
    const { dispatch, taskId } = this.props;
    await dispatch({
      type: 'teacher/endTask',
      payload: {
        taskId,
        studentExamInfo,
      },
    });
    // 结束任务以后刷新列表
    this.getTaskData();
  };

  // 检测点击结束按钮
  beforeEndTask = async () => {
    const { dispatch, taskId, type } = this.props;

    // 通过获取最新的轮训状态，和监控状态，判断是否能够结束任务
    const result = await dispatch({
      type: 'teacher/beforeEndTask',
      payload: taskId,
    });

    // 如果检测通过则打开弹框，确认能否结束任务
    if (result) {
      const { noExamStudentCount, batchInfo = [], studentExamInfo = [] } = result;
      if (noExamStudentCount !== 0 || batchInfo.length !== 0 || studentExamInfo.length !== 0) {
        // 弹出框
        Modal.confirm({
          title: formatMessage({
            id: 'task.title.current.task.detail',
            defaultMessage: '考试情况',
          }),
          width: 680,
          content: (
            <BatchesStudentCount
              type={type}
              noExamStudentCount={noExamStudentCount}
              batchInfo={batchInfo}
              studentExamInfo={studentExamInfo}
              endTask={this.endTask}
            />
          ),
          icon: null,
          centered: true,
          okButtonProps: {
            type: 'warn',
            shape: 'round',
          },
          cancelButtonProps: {
            shape: 'round',
          },
        });
      } else {
        this.endTask();
      }
    } else {
      this.getTaskData();
    }
  };

  // 删除任务
  delTask = () => {
    const { dispatch, taskId, name } = this.props;

    const tpl = (
      <FormattedMessage
        id="task.message.do.sure.delete"
        values={{ name: <span className={styles['del-task']}>{name}</span> }}
        defaultMessage="删除{name}，是否确认？"
      />
    );
    Modal.confirm({
      title: null,
      width: 400,
      content: tpl,
      icon: null,
      centered: true,
      okButtonProps: {
        type: 'warn',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        await dispatch({
          type: 'teacher/delTask',
          payload: taskId,
        });
        this.getTaskData();
      },
    });
  };

  // 获取任务详情
  showDetail = () => {
    const { taskId, type } = this.props;
    router.push(`/teacher/examination/publish/${type}/showTask/${taskId}`);
  };

  // 查看报告
  reportResult = () => {
    const { taskId, type } = this.props;
    router.push(`/teacher/report/${type}/showReport/${taskId}/score`);
  };

  // 分析结果
  analysisResult = () => {
    const { taskId, type } = this.props;
    router.push(`/teacher/report/${type}/showReport/${taskId}/analysis`);
  };

  // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 任务名称 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

  /**
   * @description: 切换能否编辑任务名称
   * @param {type}
   * @return:
   */
  toggleEditTaskTile = () => {
    const { name } = this.props;
    // 打开编辑功能
    this.setState(
      {
        editTitle: true,
        taskTitle: name,
      },
      () => {
        this.taskTitleRef.input.focus();
      }
    );
  };

  /**
   * @description: 保存修改的title
   * @param {type}
   * @return:
   */
  saveTaskTitle = async () => {
    const { dispatch, name, taskId } = this.props;
    const { taskTitle } = this.state;

    if (name) {
      const newTaskTitle = taskTitle.trim() || name;
      if (newTaskTitle !== name) {
        // 保存修改-并修改本地的modal
        await dispatch({
          type: 'teacher/queryChangeTaskTitle',
          payload: {
            taskId,
            name: newTaskTitle,
          },
        });
      }
      // 关闭编辑
      this.setState({
        editTitle: false,
        taskTitle: '',
      });
    }
  };

  /**
   * @description: 编辑任务的名称
   * @param {type}
   * @return:
   */
  changeTaskTitle = e => {
    this.setState({ taskTitle: e.target.value });
  };

  /**
   * 根据不同的类型或状态获取任务相关组件
   */
  getStatus = () => {
    const {
      runTask,
      delTask,
      UE_STATUS,
      beforeEndTask,
      endTask,
      status,
      linkStatus,
      inProcessing,
      teacherRole,
      UE_TYPE,
      ueType,
    } = this.props;

    const obj = {
      color: '', // 标签颜色
      text: '', // 标签内容
      tag: null, // 标签
      buttonList: [], // 按钮集合
    };
    switch (status) {
      case 'TS_0':
      case 'TS_0_1':
      case 'TS_1':
        obj.color = '';
        obj.text = 'TS_1';
        obj.buttonList = [
          {
            style: cs(styles.button),
            loading: runTask,
            text: formatMessage({ id: 'task.button.begin', defaultMessage: '开始' }),
            type: 'main',
            hide: !['ES_1', 'ES_2'].includes(linkStatus),
            icon: 'icon-v-play',
            fun: this.clickBeginBtn,
          },
          {
            style: cs(styles.button),
            text: formatMessage({ id: 'task.button.delete', defaultMessage: '删除' }),
            hide:
              !['TS_1', 'TS_0_1', 'TS_0'].includes(status) ||
              teacherRole.every(item => item === 'TEACHER'),
            loading: delTask,
            type: 'warn',
            icon: 'icon-detele',
            fun: this.delTask,
          },
        ];
        break;
      case 'TS_2':
        obj.color = 'green';
        obj.text = 'TS_2';
        obj.buttonList = [
          {
            style: cs(styles.button),
            loading: runTask,
            text: formatMessage({ id: 'task.button.continue', defaultMessage: '继续' }),
            hide: !['ES_2', 'ES_5', 'ES_6'].includes(linkStatus),
            type: 'main',
            icon: 'icon-v-play',
            fun: this.clickBeginBtn,
          },
          {
            style: cs(styles.button),
            text: formatMessage({ id: 'task.button.end', defaultMessage: '结束' }),
            loading: endTask || beforeEndTask,
            hide:
              !['ES_5', 'ES_7', 'ES_9'].includes(linkStatus) ||
              teacherRole.every(item => item === 'TEACHER'),
            type: 'warn',
            icon: 'icon-v-stop',
            fun: this.beforeEndTask,
          },
        ];
        break;
      case 'TS_3':
        obj.color = 'orange';
        obj.text = 'TS_3';
        break;
      case 'TS_4':
        obj.color = 'blue';
        obj.text = 'TS_4';
        obj.buttonList = [
          {
            style: cs(styles.button),
            text: formatMessage({
              id: 'task.button.show.score.result',
              defaultMessage: '评分结果',
            }),
            hide: !['ES_17'].includes(linkStatus) || teacherRole.every(item => item !== 'MASTER'),
            type: 'main',
            icon: 'icon-computer-ai',
            fun: this.reportResult,
          },
        ];
        break;
      case 'TS_5':
        obj.color = '';
        obj.text = 'TS_5';
        obj.buttonList = [
          {
            style: cs(styles.button),
            text: formatMessage({
              id: 'task.button.show.analysis.report',
              defaultMessage: '分析报告',
            }),
            hide: teacherRole.every(item => item === 'SUB') || !['ES_21'].includes(linkStatus),
            type: 'main',
            icon: 'icon-statistics',
            fun: this.analysisResult,
          },
        ];
        break;
      case 'TS_6':
        obj.text = 'TS_6';

        break;
      case 'TS_7':
        obj.color = 'green';
        obj.text = 'TS_7';
        break;
      case 'TS_8':
        obj.color = 'orange';
        obj.text = 'TS_8';
        break;
      case 'TS_9':
        obj.color = 'blue';
        obj.text = 'TS_9';
        break;
      default:
        break;
    }

    // 添加默认的详情按钮
    obj.buttonList.push({
      style: cs(styles.button),
      text: formatMessage({ id: 'task.button.detail', defaultMessage: '详情' }),
      type: 'minor',
      icon: '',
      fun: this.showDetail,
    });

    // 点击事件
    const bindOnClick = async fn => {
      // 绑定点击的taskId,用于loading效果
      // clickBindTaskId(taskId);
      // 同一个任务，执行期间只能执行一个
      if (obj.buttonList.every(item => !item.loading)) {
        fn();
      }
    };

    // 生成标签
    if (status) {
      // 获取 字典
      const ue_value = UE_TYPE.find(item => item.code === ueType) || {};
      obj.tag1 = <Tag className={styles['task-tag']}>{ue_value.value}</Tag>;

      const { value } = UE_STATUS.find(item => item.code === status) || {};
      obj.tag2 = (
        <Tag className={styles['task-tag']} color={obj.color}>
          {value}
        </Tag>
      );
    }

    // 生成统一的按钮
    obj.buttons = obj.buttonList
      .filter(item => !item.hide)
      .map(item => (
        <FontButton
          disabled={obj.buttonList.some(tag => !!tag.loading)}
          loading={item.loading && inProcessing}
          key={item.text}
          shape="round"
          type={item.type}
          className={item.style}
          onClick={() => bindOnClick(item.fun)}
          fontIcon={item.icon}
        >
          {item.text}
        </FontButton>
      ));
    return obj;
  };

  /**
   * 根据不同的类型或状态获取任务相关组件
   */
  getSubStatus = (data = {}) => {
    const {
      runTask,
      delTask,
      TASK_STATUS,
      beforeEndTask,
      endTask,
      teacherRole,
      inProcessing,
    } = this.props;
    const { status, linkStatus } = data;
    const obj = {
      color: '', // 标签颜色
      text: '', // 标签内容
      tag: null, // 标签
      buttonList: [], // 按钮集合
    };
    switch (status) {
      case 'TS_0':
      case 'TS_0_1':
      case 'TS_1':
        obj.color = '';
        obj.text = 'TS_1';
        obj.buttonList = [
          {
            style: cs(styles.button),
            loading: runTask,
            text: formatMessage({ id: 'task.button.begin', defaultMessage: '开始' }),
            type: 'main',
            hide: !['ES_1', 'ES_2'].includes(linkStatus),
            icon: 'icon-v-play',
            fun: this.clickBeginBtn,
          },
          {
            style: cs(styles.button),
            text: formatMessage({ id: 'task.button.delete', defaultMessage: '删除' }),
            hide:
              !['TS_1', 'TS_0_1', 'TS_0'].includes(status) ||
              teacherRole.every(item => item === 'TEACHER'),
            loading: delTask,
            type: 'warn',
            icon: 'icon-detele',
            fun: this.delTask,
          },
        ];
        break;
      case 'TS_2':
        obj.color = 'green';
        obj.text = 'TS_2';
        obj.buttonList = [
          {
            style: cs(styles.button),
            loading: runTask,
            text: formatMessage({ id: 'task.button.continue', defaultMessage: '继续' }),
            hide: !['ES_2', 'ES_5', 'ES_6'].includes(linkStatus),
            type: 'main',
            icon: 'icon-v-play',
            fun: this.clickBeginBtn,
          },
          {
            style: cs(styles.button),
            text: formatMessage({ id: 'task.button.end', defaultMessage: '结束' }),
            loading: endTask || beforeEndTask,
            hide:
              !['ES_5', 'ES_7', 'ES_9'].includes(linkStatus) ||
              teacherRole.every(item => item === 'TEACHER'),
            type: 'warn',
            icon: 'icon-v-stop',
            fun: this.beforeEndTask,
          },
        ];
        break;
      case 'TS_3':
        obj.color = 'orange';
        obj.text = 'TS_3';
        break;
      case 'TS_4':
        obj.color = 'blue';
        obj.text = 'TS_4';
        obj.buttonList = [
          {
            style: cs(styles.button),
            text: formatMessage({
              id: 'task.button.show.score.result',
              defaultMessage: '评分结果',
            }),
            hide: !['ES_17'].includes(linkStatus) || teacherRole.every(item => item !== 'MASTER'),
            type: 'main',
            icon: 'icon-computer-ai',
            fun: this.reportResult,
          },
        ];
        break;
      case 'TS_5':
        obj.color = '';
        obj.text = 'TS_5';
        obj.buttonList = [
          {
            style: cs(styles.button),
            text: formatMessage({
              id: 'task.button.show.analysis.report',
              defaultMessage: '分析报告',
            }),
            hide: teacherRole.every(item => item === 'SUB') || !['ES_21'].includes(linkStatus),
            type: 'main',
            icon: 'icon-statistics',
            fun: this.analysisResult,
          },
        ];
        break;
      default:
        break;
    }

    // 添加默认的详情按钮
    obj.buttonList.push({
      style: cs(styles.button),
      text: formatMessage({ id: 'task.button.detail', defaultMessage: '详情' }),
      type: 'minor',
      icon: '',
      fun: this.showDetail,
    });

    // 点击事件
    const bindOnClick = async fn => {
      // 绑定点击的taskId,用于loading效果
      // clickBindTaskId(taskId);
      // 同一个任务，执行期间只能执行一个
      if (obj.buttonList.every(item => !item.loading)) {
        fn();
      }
    };

    // 生成标签
    if (obj.text) {
      // 获取 字典
      const { value } = TASK_STATUS.find(item => item.code === obj.text) || {};
      obj.tag = (
        <Tag className={styles['task-tag']} color={obj.color}>
          {value}
        </Tag>
      );
    }

    // 生成统一的按钮
    obj.buttons = obj.buttonList
      .filter(item => !item.hide)
      .map(item => (
        <FontButton
          disabled={obj.buttonList.some(tag => !!tag.loading)}
          loading={item.loading && inProcessing}
          key={item.text}
          shape="round"
          type={item.type}
          className={item.style}
          onClick={() => bindOnClick(item.fun)}
          fontIcon={item.icon}
        >
          {item.text}
        </FontButton>
      ));
    return obj;
  };

  /**
   * 显示异常的link状态
   */
  getLinkStatusName = () => {
    const { LINKSTATUS, linkStatus } = this.props;
    if (['ES_3', 'ES_7', 'ES_9', 'ES_15'].includes(linkStatus)) {
      const { value } = LINKSTATUS.find(item => item.code === linkStatus) || {};
      return value || null;
    }
    return null;
  };

  /**
   * 是否显示未收到有效答卷
   * 在任务列表中，当考试状态=ES_4 且
   * effectiveAnswers = 0 显示“!未收到有效答卷”
   */
  effecticeAnswers = () => {
    const { status, effectiveAnswers } = this.props;
    return status === 'TS_5' && effectiveAnswers === 0;
  };

  timestampToTime = timestamp => {
    const date = new Date(timestamp); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = `${date.getFullYear()}-`;
    const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
    const D = date.getDate() < 10 ? `0${date.getDate()} ` : date.getDate();
    // const h = date.getHours() < 10 ? `0${date.getHours() }:` : `${date.getHours() }:`;
    // const m = date.getMinutes() < 10 ? `0${date.getMinutes() }:` : `${date.getMinutes() }:`;
    // const s = date.getSeconds()< 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return Y + M + D;
  };

  onRegister = async () => {
    const { dispatch, data, userInfo } = this.props;
    const { taskId } = data;

    await dispatch({
      type: 'task/getExamPlaceDetail',
      payload: {
        taskId,
        type: 'TT_6',
        examPlaceCampusId: userInfo && userInfo.campusId,
      },
    });
    this.setState({
      baseInfoVisible: true,
      name: '',
      classId: '',
      ownClassName: '',
      warntext: '',
      currentSubTask: {},
    });
  };

  registerNext = async () => {
    const { dispatch, taskId, userInfo } = this.props;
    const { name, classId } = this.state;
    this.state.warntext = '';
    if (name === '') {
      this.setState({
        warntext: formatMessage({ id: 'app.text.namenone', defaultMessage: '姓名不能为空' }),
      });
      return;
    }
    if (classId === '') {
      this.setState({
        warntext: formatMessage({ id: 'app.text.classnone', defaultMessage: '所属班级不能为空' }),
      });
      return;
    }

    await dispatch({
      type: 'task/getRegisterStudentDetail',
      payload: {
        taskId,
        type: 'TT_6',
        studentName: name,
        classId,
      },
    });

    await dispatch({
      type: 'task/getStartTasksDetail',
      payload: {
        taskId,
        type: 'TT_6',
        examPlaceCampusId: userInfo && userInfo.campusId,
      },
    });

    const { registerStudentInfo } = this.props;
    if (registerStudentInfo.length === 0) {
      this.setState({ baseInfoVisible: false, choosePlaceVisible: true });
    } else {
      this.setState({ baseInfoVisible: false });
      this.studentInfoModal();
    }
  };

  // eslint-disable-next-line react/sort-comp
  chooseClass(item) {
    this.setState({
      ownClassName: item.className,
      classId: item.classId,
    });
  }

  confirmInfo() {
    this.setState({
      choosePlaceVisible: false,
    });
    const { examPlaceDetail } = this.props;
    const { ueInfo } = this.state;
    if (ueInfo) {
      const { examBatchTime, examDate, examBatch, examRoom } = ueInfo;
      const { name, ownClassName } = this.state;
      const Dates = this.timestampToTime(examDate);
      const examDates = `${Dates}`.split('-');
      Modal.confirm({
        title: null,
        width: 460,
        className: styles.confirm,
        content: (
          <div>
            <button
              aria-label="Close"
              className="ant-modal-close"
              style={{ display: 'block' }}
              onClick={() => {
                Modal.destroyAll();
              }}
            >
              <span className="ant-modal-close-x">
                <i aria-label="icon: close" className="anticon anticon-close ant-modal-close-icon">
                  <svg
                    viewBox="64 64 896 896"
                    className=""
                    data-icon="close"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
                  </svg>
                </i>
              </span>
            </button>
            <div className={styles.tip}>
              {formatMessage({
                id: 'task.text.confirmregistrationinformation',
                defaultMessage: '确认报名信息',
              })}
            </div>

            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.dqkd', defaultMessage: '当前考点' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.examPlace}</div>
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}：
              </div>
              <div className={styles.info}>{name}</div>
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ssxx', defaultMessage: '所属学校' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.campusName}</div>
            </div>
            <div className={cs(styles.card, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ssbj', defaultMessage: '所属班级' })}：
              </div>
              <div className={styles.info}>{ownClassName}</div>
            </div>
            <div className={cs(styles.card, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ccap', defaultMessage: '批次安排' })}：
              </div>
              <div className={styles.info}>{`${examDates[1] +
                formatMessage({ id: 'task.text.month', defaultMessage: '月' }) +
                examDates[2] +
                formatMessage({
                  id: 'task.text.date',
                  defaultMessage: '日',
                })} ${examBatchTime} ${examBatch},${examRoom}`}</div>
            </div>
          </div>
        ),
        icon: null,
        centered: true,
        okText: formatMessage({ id: 'task.button.confirmBtn', defaultMessage: '确认' }),
        cancelText: formatMessage({ id: 'task.text.prestep', defaultMessage: '上一步' }),
        okButtonProps: {
          type: 'main',
          shape: 'round',
        },
        cancelButtonProps: {
          shape: 'round',
        },
        onOk: async () => {
          this.submitReExamInfo();
        },
        onCancel: () => {
          this.setState({ choosePlaceVisible: true });
        },
      });
    }
  }

  studentInfoModal() {
    // eslint-disable-next-line no-unused-vars
    const config = {
      taskStatus: studentExamsStatusLib, // 考试状态字典
      title: formatMessage({ id: 'task.text.testExam', defaultMessage: '考试' }),
      unTask: formatMessage({ id: 'task.text.NoReference', defaultMessage: '不参考' }),
      shouldTask: formatMessage({ id: 'task.text.testPeople', defaultMessage: '应考人数' }),
      actualTask: formatMessage({ id: 'task.text.actual.exam.number', defaultMessage: '实考人数' }),
      noTest: formatMessage({ id: 'task.title.examStatusNoTest', defaultMessage: '未考' }),
    };
    const studentsColumns = [
      {
        title: formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: 300,
      },
      {
        title: formatMessage({ id: 'task.title.name', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: 150,
      },
      {
        title: formatMessage({ id: 'task.title.classes', defaultMessage: '班级' }),
        dataIndex: 'className',
        width: 150,
      },
      {
        title: formatMessage({ id: 'task.text.examplan', defaultMessage: '考试安排' }),
        dataIndex: 'examPlan',
        width: 150,
        render: examPlan => <span>{examPlan}</span>,
      },
      {
        title: formatMessage({ id: 'task.text.invigilateteacher', defaultMessage: '监考老师' }),
        dataIndex: 'monitorTeacher',
        width: 150,
      },
      // {
      //   title: formatMessage({id:"task.text.state",defaultMessage:"状态"}),
      //   dataIndex: 'examStatus',
      //   width :150,
      //   render    : (examStatus,record) => {
      //       // 任务进行中
      //       if( examStatus === 'ES_2' ){
      //         return <span style={{color:"rgba(3, 196, 107, 1)"}}>{config.taskStatus[examStatus]}</span>
      //       }
      //       // 任务失败
      //       if( examStatus === 'ES_3' ){
      //         return <span style={{color:"rgba(255, 110, 74, 1)"}}>{config.taskStatus[examStatus]}</span>
      //       }

      //       // 未考
      //       if( examStatus == null ){
      //         return <span style={{color:"rgba(51,51,51,1);"}}>{config.noTest}</span>
      //       }
      //       return <span>{config.taskStatus[examStatus]}</span>

      //   }
      // }
    ];

    const { registerStudentInfo } = this.props;
    Modal.confirm({
      title: null,
      width: 700,
      className: styles.tosignup,
      content: (
        <div>
          <button
            aria-label="Close"
            className="ant-modal-close"
            style={{ display: 'block' }}
            onClick={() => {
              Modal.destroyAll();
            }}
          >
            <span className="ant-modal-close-x">
              <i aria-label="icon: close" className="anticon anticon-close ant-modal-close-icon">
                <svg
                  viewBox="64 64 896 896"
                  className=""
                  data-icon="close"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
                </svg>
              </i>
            </span>
          </button>
          <div className={styles.warnTip}>
            <i className="iconfont icon-tip icontips" />
            {formatMessage({
              id: 'task.text.warningtips',
              defaultMessage: '该考生姓名/班级与以下考生相同，确定是否继续为其报名？',
            })}
          </div>

          <Table
            rowKey="studentInfo"
            className={cs(styles.table)}
            columns={studentsColumns}
            dataSource={registerStudentInfo || []}
            locale={{
              emptyText: getEmptyRender(
                noneCardIcon,
                formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })
              ),
            }}
            pagination={false}
            size="small"
          />
        </div>
      ),
      icon: null,
      centered: true,
      okText: formatMessage({ id: 'task.text.nextstep', defaultMessage: '下一步' }),
      cancelText: formatMessage({ id: 'task.text.prestep', defaultMessage: '上一步' }),
      okButtonProps: {
        type: 'main',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        this.setState({ choosePlaceVisible: true });
      },
      onCancel: () => {
        this.setState({ baseInfoVisible: true });
      },
    });
  }

  // 提交现场报名信息
  submitReExamInfo = async () => {
    const { dispatch, examPlaceDetail, onReload } = this.props;
    const { currentSubTask, ueInfo, name, classId, ownClassName } = this.state;
    const { examBatchTime, examDate, examBatch, examRoom } = ueInfo;
    // 设置考试状态未未考状态
    const res = await dispatch({
      type: 'task/getRegistrationInfo',
      payload: {
        studentInfo: {
          classId,
          studentName: name,
          subTaskId: currentSubTask.taskId, // 安排的子任务Id
          taskId: ueInfo.ueTaskId, // 主任务Id
        },
        taskId: ueInfo.ueCampusTaskId, // 中（校）任务ID
        type: 'TT_6',
      },
    });

    let jsx = null;

    if (res.data === 'SUCCESS') {
      onReload();
      const Dates = this.timestampToTime(examDate);
      const examDates = `${Dates}`.split('-');

      jsx = (
        <div>
          <div className={styles.success}>
            <i className="iconfont icon-success" />
            <div className={styles.successtext}>
              {formatMessage({
                id: 'task.text.siteregistrationsuccessful',
                defaultMessage: '现场报名成功',
              })}
            </div>
          </div>

          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}：
            </div>
            <div className={styles.info}>{name}</div>
          </div>
          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' })}：
            </div>
            <div className={styles.info}>{res.message.examNo}</div>
          </div>

          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.examPlace', defaultMessage: '考点' })}：
            </div>
            <div className={styles.info}>{examPlaceDetail.examPlace}</div>
          </div>

          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ccap', defaultMessage: '批次安排' })}：
            </div>
            <div className={styles.info}>{`${examDates[1] +
              formatMessage({ id: 'task.text.month', defaultMessage: '月' }) +
              examDates[2] +
              formatMessage({
                id: 'task.text.date',
                defaultMessage: '日',
              })} ${examBatchTime} ${examBatch},${examRoom}`}</div>
          </div>
          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ssxx', defaultMessage: '所属学校' })}：
            </div>
            <div className={styles.info}>{examPlaceDetail.campusName}</div>
          </div>
          <div className={cs(styles.card, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ssbj', defaultMessage: '所属班级' })}：
            </div>
            <div className={styles.info}>{ownClassName}</div>
          </div>
        </div>
      );
    } else {
      jsx = (
        <div className={styles.center}>
          <div className={styles.error}>
            <i className="iconfont icon-error" />
          </div>
          <div className={cs(styles.confirmTip, styles.centers)}>
            {formatMessage({
              id: 'task.text.siteregistrationfail',
              defaultMessage: '现场报名失败',
            })}
          </div>
          <div className={cs(styles.normal_text)}>
            <div className={styles.info}>{res.message}</div>
          </div>
        </div>
      );
    }

    this.setState({
      infoVisible: true,
      jsx,
    });
  };

  // eslint-disable-next-line class-methods-use-this
  matchValue(type, data) {
    let res = type;
    // eslint-disable-next-line no-restricted-syntax
    for (const i in data) {
      if (data[i].code === type) {
        res = data[i].value;
      }
    }

    return res;
  }

  render() {
    const { status, data, examPlaceDetail, enrollAnytime } = this.props;

    const { subTaskList } = data;

    // 根据不同的任务类型获取不同的文案
    // const copyWriting = taskType(type);
    // {
    //   ctualAttend  : "实考",
    //   shouldAttend : "应考",
    //   Invigilate   : "监考中"
    // }
    // 获取标签 ，和 按钮列表
    const itemObj = this.getStatus();
    // 获取特殊环节状态的提示
    // const linkStatusName = this.getLinkStatusName();
    // 是否显示 为手动有效答卷
    // const hasAnswer = this.effecticeAnswers();

    /** 子任务显示list */
    const jsx = subTaskList.map((item, index) => (
      <TaskSubCard key={item.taskId} {...item} index={index} mainStatus={status} />
    ));

    let menu = null;
    if (examPlaceDetail.classList) {
      // eslint-disable-next-line no-shadow
      const jsx = examPlaceDetail.classList.map(item => (
        // eslint-disable-next-line react/jsx-no-bind
        <Menu.Item onClick={this.chooseClass.bind(this, item)}>
          <span>{item.className}</span>
        </Menu.Item>
      ));
      menu = <Menu>{jsx}</Menu>;
    }

    const examPlaceColumns = [
      {
        title: formatMessage({ id: 'task.text.ksrq', defaultMessage: '考试日期' }),
        dataIndex: 'ueInfo',
        width: 380,
        render: ueInfo => (
          <span>{`${this.timestampToTime(ueInfo.examDate)} ${ueInfo.examBatchTime}`}</span>
        ),
      },
      {
        title: formatMessage({ id: 'task.title.session', defaultMessage: '批次' }),
        dataIndex: 'examBatch',
        width: 150,
        render: (_, record) => <span>{record.ueInfo.examBatch}</span>,
      },
      {
        title: formatMessage({ id: 'task.text.kaochang', defaultMessage: '考场' }),
        dataIndex: 'examRoom',
        width: 150,
        render: (_, record) => <span>{record.ueInfo.examRoom}</span>,
      },
      {
        title:
          this.props.examPlaceTasksDetail &&
          this.props.examPlaceTasksDetail[0] &&
          this.props.examPlaceTasksDetail[0].ueInfo.hasLimited === 'Y'
            ? formatMessage({ id: 'task.text.sy', defaultMessage: '剩余' })
            : formatMessage({ id: 'task.text.have.arranged', defaultMessage: '已安排' }),
        dataIndex: 'enrolledNum',
        width: 150,
        render: (_, record) => {
          if (record.ueInfo.hasLimited === 'Y') {
            return <span>{record.ueInfo.examRemainder}</span>;
          }
          return <span>{record.ueInfo.enrolledNum}</span>;
        },
      },
      {
        title: formatMessage({ id: 'task.title.options', defaultMessage: '操作' }),
        dataIndex: 'options',
        width: 100,
        render: (_, record) => (
          <span>
            <Radio
              checked={
                this.state.currentSubTask && record.taskId === this.state.currentSubTask.taskId
              }
              key={`record${record.taskId}`}
              onChange={() => {
                this.setState({
                  ueInfo: record.ueInfo,
                  currentSubTask: record,
                });
              }}
            >
              选择
            </Radio>
          </span>
        ),
      },
    ];

    return (
      <li className={styles.task}>
        <div className={styles['task-content']}>
          <div className={styles['task-head']}>
            <span className={styles['task-name']}>{data.name}</span>
            {itemObj.tag1}
            {itemObj.tag2}
            {enrollAnytime == 'Y' && itemObj.text === 'TS_6' && (
              <span className={styles['task-class-xcbm-disabled']}>
                {formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
              </span>
            )}
            {enrollAnytime == 'Y' && itemObj.text === 'TS_7' && (
              <span
                className={styles['task-class-xcbm']}
                onClick={() => {
                  this.onRegister();
                }}
              >
                {formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
              </span>
            )}
          </div>
          <div className={cs(styles['task-li'], styles.mb10)}>
            <span>{formatMessage({ id: 'task.text.school', defaultMessage: '学校：' })}</span>
            <span className={styles['task-class']}>{data.campusName}</span>

            <Divider type="vertical" style={{ margin: '0px 10px' }} />
            <span>{formatMessage({ id: 'task.text.grade', defaultMessage: '年级：' })}</span>
            <span className={styles['task-class']}>
              {this.matchValue(data.grade, this.props.GRADE)}
            </span>

            <Divider type="vertical" style={{ margin: '0px 10px' }} />
            <span>
              {formatMessage({ id: 'task.text.studentNum', defaultMessage: '考生总数：' })}
            </span>
            <span className={styles['task-class']}>{data.studentNum}</span>

            <Divider type="vertical" style={{ margin: '0px 10px' }} />
            <span>{formatMessage({ id: 'task.text.examTime', defaultMessage: '考试时间：' })}</span>
            <span className={styles['task-class']}>
              {`${this.timestampToTime(data.examBeginTime)}至${this.timestampToTime(
                data.examEndTime
              )}`}
            </span>
          </div>

          <div className={styles['task-bottom']}>
            <div
              className={styles['task-bottom-list']}
              onClick={() => {
                this.setState({ isDrown: !this.state.isDrown });
              }}
            >
              {this.state.isDrown ? (
                <i className="iconfont icon-link-arrow-down" />
              ) : (
                <i className="iconfont icon-link-arrow" />
              )}
              <span className={styles['task-name']}>
                {formatMessage({ id: 'task.title.session', defaultMessage: '批次' })}
              </span>
            </div>
            {this.state.isDrown && <div className={styles['task-session-list']}>{jsx}</div>}
          </div>
        </div>

        <Modal
          visible={this.state.baseInfoVisible}
          className={styles.confirm}
          width={460}
          closable
          onCancel={() => {
            this.setState({
              baseInfoVisible: false,
            });
          }}
          footer={
            <div className={styles.footerbtn}>
              <div className={styles.warntext}>{this.state.warntext}</div>
              <button
                type="button"
                className="ant-btn ant-btn-main ant-btn-round"
                onClick={() => {
                  this.registerNext();
                }}
              >
                <span>下一步</span>
              </button>
            </div>
          }
        >
          <div>
            <div className={styles.tip}>
              {formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
            </div>

            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.dqkd', defaultMessage: '当前考点' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.examPlace}</div>
            </div>
            <div className={cs(styles.card, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ssxx', defaultMessage: '所属学校' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.campusName}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.paper_title}>
                {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}
              </div>
              <Input
                placeholder={formatMessage({
                  id: 'task.text.qsrksxm',
                  defaultMessage: '请输入考生姓名',
                })}
                value={this.state.name}
                maxLength={20}
                onChange={e => {
                  this.setState({ name: e.target.value });
                }}
              />
            </div>
            <div className={styles.item}>
              <div className={styles.paper_title}>
                {formatMessage({ id: 'task.text.ssbj', defaultMessage: '所属班级' })}
              </div>
              <Dropdown overlay={menu} trigger={['click']}>
                <Input
                  placeholder={formatMessage({
                    id: 'task.placeholder.please.select',
                    defaultMessage: '请选择',
                  })}
                  value={this.state.ownClassName}
                />
              </Dropdown>
              <Icon type="down" className="Dropdown-icon" />
            </div>
          </div>
        </Modal>

        {/* 安排其他场次 */}
        <Modal
          visible={this.state.choosePlaceVisible}
          onCancel={() => {
            this.setState({
              choosePlaceVisible: false,
            });
          }}
          className={styles.confirm}
          width={653}
          closable
          footer={
            <div className={styles.footerbtn}>
              <div className={styles.warntext}>{this.state.warntext}</div>
              <div>
                <button
                  type="button"
                  className="ant-btn ant-btn-round"
                  onClick={() => {
                    if (this.props.registerStudentInfo.length == 0) {
                      this.setState({
                        choosePlaceVisible: false,
                        baseInfoVisible: true,
                      });
                    } else {
                      this.setState({
                        choosePlaceVisible: false,
                      });
                      this.studentInfoModal();
                    }
                  }}
                >
                  <span>上一步</span>
                </button>
                <button
                  type="button"
                  className="ant-btn ant-btn-main ant-btn-round"
                  onClick={() => {
                    if (this.state.currentSubTask && this.state.currentSubTask.taskId) {
                      this.state.warntext = '';
                      this.confirmInfo();
                    } else if (
                      this.props.examPlaceTasksDetail &&
                      this.props.examPlaceTasksDetail.length == 0
                    ) {
                      this.setState({
                        choosePlaceVisible: false,
                      });
                    } else {
                      this.setState({
                        warntext: formatMessage({
                          id: 'task.text.chooseexamroompi',
                          defaultMessage: '请选择批次/考场',
                        }),
                      });
                    }
                  }}
                >
                  <span>
                    {this.props.examPlaceTasksDetail && this.props.examPlaceTasksDetail.length === 0
                      ? formatMessage({ id: 'task.text.end.apply', defaultMessage: '结束报名' })
                      : formatMessage({ id: 'task.text.nextstep', defaultMessage: '下一步' })}
                  </span>
                </button>
              </div>
            </div>
          }
        >
          <div>
            <div className={styles.tip}>
              {formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.dqkd', defaultMessage: '当前考点' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.examPlace}</div>
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ssxx', defaultMessage: '所属学校' })}：
              </div>
              <div className={styles.info}>{examPlaceDetail.campusName}</div>
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}：
              </div>
              <div className={styles.info}>{this.state.name}</div>
            </div>
            <div className={cs(styles.card, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ssbj', defaultMessage: '所属班级' })}：
              </div>
              <div className={styles.info}>{this.state.ownClassName}</div>
            </div>
            <div className={cs(styles.tip, styles.margintop)}>
              {formatMessage({ id: 'task.text.apcckc', defaultMessage: '安排批次/考场' })}
            </div>
            <Table
              rowKey="studentId"
              className={cs(styles.table)}
              columns={examPlaceColumns}
              dataSource={this.props.examPlaceTasksDetail || []}
              locale={{
                emptyText: getEmptyRender(
                  noneCardIcon,
                  formatMessage({
                    id: 'task.text.warntip',
                    defaultMessage: '暂无空位，无法安排当前考生',
                  })
                ),
              }}
              pagination={false}
              size="small"
            />
          </div>
        </Modal>

        {/* 安排开场结果信息提示 */}
        <Modal
          visible={this.state.infoVisible}
          footer={
            <div
              className={styles.bottom_btn}
              onClick={() => {
                this.setState({
                  infoVisible: false,
                });
              }}
            >
              我知道了
            </div>
          }
          className={styles.confirm}
          width={460}
          closable={false}
        >
          {this.state.jsx}
        </Modal>
      </li>
    );
  }
}
export default TaskList;
