import React, { Component, Fragment } from 'react';
import { Steps, Spin, Card, Dropdown, Menu, message, Drawer } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { connect } from 'dva';
import Modal from '@/components/Modal';
import RaiseHands from './Components/RaiseHands';
import SetTest from './Components/SetTest/api';
import DownCount from './Components/DownCount';
import TaskDetail from './Detail';
import TaskExamDetail from '../../DistrictList/Detail';
// import SiderDrawer from './SiderDrawer';
import NewAdd from './Components/NewAdd';
import Report from './report';
import { sendMS } from '@/utils/instructions';
import { showTime } from '@/utils/timeHandle';
import { watching } from './watching';
import { proxyTokenDelete } from '@/services/teacher';
import ExerciseReport from '../../ExerciseReport';
import PaperEvaluation from '../../PaperEvaluation';
import newRes from '@/assets/new_res_pop_icon_1.png';
import newRes2 from '@/assets/new_res_pop_icon_2.png';
import { delay } from '@/utils/utils';
import styles from './index.less';

const { confirm } = Modal;
const { Step } = Steps;
const { vb } = window;

let timer;

@connect(({ task, dictionary, loading, teacher }) => {
  const {
    userInfo: { accountId },
  } = teacher;
  const { taskInfo, students, examStatus, closeStatus, showDrawer, showNewModal, countTime } = task;
  const {
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type = 'TT_1',
    name,
    classList,
    taskStatus,
    ueInfo,
    campusId,
  } = taskInfo;
  const { EXAMFLAG, EXAM_TYPE, DIST_TYPE } = dictionary;
  return {
    accountId,
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    students,
    classList,
    examStatus,
    closeStatus,
    showDrawer,
    taskStatus,
    showNewModal,
    ueInfo,
    EXAMFLAG,
    EXAM_TYPE,
    DIST_TYPE,
    campusId,
    countTime,
    loadingTaskInfo: loading.effects['task/getTaskById'],
  };
})
class Watch extends Component {
  state = {
    showDetail: false, // 是否显示任务详情
    showReport: false, // 是否打开练习结果
    showPaperEvaluation: false, // 是否打开试卷讲评
    newAdd: [],
    paperTimes: 0, // 考试时长
    backBtn: false, // 返回按钮是否可点
  };

  componentWillMount() {
    const { dispatch, match } = this.props;
    const that = this;
    // 更新学生列表信息
    dispatch({
      type: 'task/updateLinking',
      payload: {
        students: [],
      },
    }).then(() => {
      // 获取当前任务详情
      dispatch({
        type: 'task/getTaskById',
        payload: match.params.id,
        callback: data => {
          const { taskPaperIdList } = data;
          let paperTimes = 0;
          taskPaperIdList.forEach(vo => {
            if (vo.paperTime > paperTimes) {
              paperTimes = vo.paperTime;
            }
          });
          that.setState({
            paperTimes,
            newAdd: data.taskStudentRelationVOList.filter(
              vo => vo.examFlag && vo.examFlag !== '' && vo.examFlag !== null && vo.status === 'Y'
            ),
          });
        },
      }).then(() => {
        // 开始轮询获取考试状态，判断考试是否已经结束
        if (match.params.id !== 'autoCheck') {
          this.loopWatchStatus();
        }
      });
      dispatch({
        type: 'task/updateClose',
        payload: {
          closeStatus: 1,
        },
      });
    });
  }

  componentDidMount() {
    const that = this;
    // 获取密钥
    // 考试监控
    vb.getSocketManager().onReceive(res => {
      console.log('watch');
      console.log(res);
      const currentStep = that.getCurrentStep();
      const { closeStatus, taskId } = that.props;
      console.log(taskId);
      if ((closeStatus || (res && res.command === 'disconnect')) && taskId !== '') {
        const { dispatch: thatDispatch } = that.props;
        watching(res, currentStep, that, thatDispatch);
      }
    });
  }

  /**
   * 轮询获取任务状态，知道任务结束
   */
  loopWatchStatus = async () => {
    // 等30s
    await delay(30000);
    const { dispatch, taskId, location } = this.props;

    if (!location.pathname.includes(`/teacher/task/${taskId}/watch`)) {
      return;
    }
    const result = await dispatch({
      type: 'teacher/getTaskStatus',
      payload: taskId,
      isLoop: true,
    });

    const { status, linkStatus, endTeacherName: teacherName } = result || {};

    // 结束已经被结束
    if (
      !(
        status === 'TS_2' &&
        (linkStatus === 'ES_1' ||
          linkStatus === 'ES_2' ||
          linkStatus === 'ES_3' ||
          linkStatus === 'ES_4' ||
          linkStatus === 'ES_5' ||
          linkStatus === 'ES_6')
      )
    ) {
      this.watchStopTask(teacherName);
      return;
    }

    // 保存监控数据
    this.saveWatchDataToLocal();
    // 继续轮询
    this.loopWatchStatus();
  };

  // 保存监控数据
  saveWatchDataToLocal = () => {
    const { students, taskId, accountId, campusId } = this.props;
    const step = this.getCurrentStep();
    // 当点击了“开始考试”按钮，未点击【结束考试】，并且间隔时间到了，保存当前监控数据到缓存
    const objects = vb.getStorageManager().get({ key: accountId });
    let currentTime;
    if (objects && objects.value !== '') {
      const strToObj = JSON.parse(objects.value);
      currentTime = strToObj.startTime;
    }
    if (step === 2) {
      const obj = {
        teacherAction: '03',
        task_id: taskId,
        monitorInfo: students,
        campusId,
        startTime: currentTime,
      };
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
    }
  };

  /**
   * 处理监听到任务结束以后，进行操作
   */
  watchStopTask = teacherName => {
    const { type, taskId, students, dispatch, accountId } = this.props;
    // 启动倒计时
    // 1、弹框提示 “任务被XX教师终止”，5S后自动转到任务列表页；
    Modal.info({
      title: formatMessage({ id: 'task.title.tips', defaultMessage: '提示' }),
      icon: null,
      centered: true,
      width: 500,
      content: <DownCount teacherName={teacherName} taskType={type} />,
      okButtonProps: { style: { display: 'none' } },
      onOk: () => {
        // 清除学生的token
        const ipAddr = students.map(item => `student_${item.ipAddress}`);
        proxyTokenDelete(ipAddr).then(() => {
          // 更新学生列表信息
          this.updateStudent([]);
          // 判断是否需要调整到首页
          if (taskId === 'autoCheck') {
            router.push(`/teacher/home`);
          } else if (type === 'TT_6') {
            router.push(`/teacher/districtList/${type}`);
          } else {
            router.push(`/teacher/tasklist/${type}`);
          }
        });
      },
    });
    // 2、群发指令"taskStop" 调用VBShell，vb.getSocketManager().send
    sendMS('taskStop', {
      ipAddr: localStorage.getItem('ipAddress'),
      taskId,
      msgInfo: teacherName,
    });

    // 3、去掉缓存
    vb.getStorageManager().remove({ key: accountId });

    // 改变监控的人的状态
    dispatch({ type: 'task/saveBatch', payload: { status: '2' } });
  };

  /**
   * @description  获取当前第几步
   * @author tina.zhang
   * @date 2018-12-15
   * @returns
   * @memberof Watch
   */
  getCurrentStep = () => {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'step1':
        return 0;
      case 'step2':
        return 1;
      case 'step3':
        return 2;
      case 'step4':
        return 3;
      default:
        return 0;
    }
  };

  /**
   * @description 更新学生列表信息
   * @memberof students 学生列表
   */
  updateStudent = students => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateLinking',
      payload: {
        students,
      },
    });
  };

  /**
   * @description 考试设置信息
   * @memberof Watch
   */
  setTestInfo = () => {
    const { distributeType, examType } = this.props;
    SetTest({
      dataSource: {
        title: '提示',
        distributeType,
        examType,
      },
      callback: () => {},
    });
  };

  // 开关详情页面
  toggleDetailPage = () => {
    const { showDetail } = this.state;
    this.setState({
      showDetail: !showDetail,
    });
  };

  // 开关新增学生列表页面
  hideModalAdd = () => {
    const { showNewModal, dispatch } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showNewModal: !showNewModal,
      },
    });
  };

  /**
   * @description 关闭所有学生机
   * @memberof Watch
   */
  closeAll = () => {
    const { dispatch, students } = this.props;
    const that = this;
    const step = this.getCurrentStep();
    const showTitle =
      step === 2
        ? formatMessage({
            id: 'task.text.closeStudentYesOrNo',
            defaultMessage: '关闭学生机本场所有考试考试失败，确认关闭？',
          })
        : formatMessage({
            id: 'task.text.closeAllStudent',
            defaultMessage: '您确定关闭所有学生机吗？',
          });
    confirm({
      title: showTitle,
      content: '',
      okText: formatMessage({ id: 'task.button.close', defaultMessage: '关闭' }),
      cancelText: formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' }),
      onOk() {
        // 更新学生列表信息
        dispatch({
          type: 'task/updateClose',
          payload: {
            closeStatus: 0,
          },
        }).then(() => {
          sendMS('close', '');
          const ipAddr = [];
          students.forEach((item, index) => {
            students[index].monitoringStatus = 'MS_10';
            ipAddr.push(`student_${item.ipAddress}`);
          });
          proxyTokenDelete(ipAddr).then(res => {
            if (res.responseCode === '200') {
              that.updateStudent(students);
            } else {
              message.warning(res.data);
            }
          });
        });
      },
      onCancel() {},
    });
  };

  removeCurrent = id => {
    // 处理单个举手学生
    const { students } = this.props;
    const student = JSON.parse(JSON.stringify(students));
    student.forEach((item, index) => {
      if (item.identifyCode === id) {
        student[index].handStatus = 0;
        // 更新学生列表信息
        this.updateStudent(student);
      }
    });
  };

  removeAllHands = () => {
    const { students } = this.props;
    // 清空所有举手学生
    const student = JSON.parse(JSON.stringify(students));
    student.forEach((item, index) => {
      student[index].handStatus = 0;
    });
    // 更新学生列表信息
    this.updateStudent(student);
  };

  // 销毁TOKEN
  proxyTokenDel = () => {
    const { type, students, taskId } = this.props;
    const ipAddr = [];
    const that = this;
    students.forEach(item => {
      ipAddr.push(`student_${item.ipAddress}`);
    });
    proxyTokenDelete(ipAddr)
      .then(res => {
        that.setState({
          backBtn: false,
        });
        if (res.responseCode !== '200') {
          message.warning(res.data);
          return;
        }
        // 更新学生列表信息
        this.updateStudent([]);
        sendMS('clean', '');
        // 判断是否需要调整到首页
        if (taskId === 'autoCheck') {
          router.push(`/teacher/home`);
        } else if (type === 'TT_6') {
          router.push(`/teacher/districtList/${type}`);
        } else {
          router.push(`/teacher/tasklist/${type}`);
        }
      })
      .catch(() => {
        that.setState({
          backBtn: false,
        });
      });
  };

  // 返回任务列表
  backList = () => {
    const { accountId } = this.props;
    const currentStep = this.getCurrentStep();
    const { dispatch } = this.props;
    const that = this;
    if (currentStep !== 2) {
      Modal.confirm({
        title: null,
        width: 360,
        content: (
          <span className={styles.closeConfirm}>
            {formatMessage({
              id: 'task.message.returnToTheTaskListInitializesTheExaminationRoomConfirmBack',
              defaultMessage: '返回任务列表，将初始化考场，确认返回？',
            })}
          </span>
        ),
        icon: null,
        centered: true,
        okText: formatMessage({ id: 'task.button.confirmBtn', defaultMessage: '确认' }),
        cancelText: formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' }),
        okButtonProps: {
          type: 'warn',
          shape: 'round',
        },
        cancelButtonProps: {
          shape: 'round',
        },
        onOk: async () => {
          vb.getStorageManager().remove({ key: accountId });
          that.setState({
            backBtn: true,
          });
          dispatch({
            type: 'task/saveBatch',
            payload: {
              status: '2',
            },
            callback: res => {
              if (res === '200') {
                dispatch({
                  type: 'task/addPaperTime',
                  payload: {
                    countTime: 0,
                  },
                });
                that.proxyTokenDel();
              }
            },
          }).catch(() => {
            that.setState({
              backBtn: false,
            });
          });
        },
      });
    }
  };

  /**
   * @description 关闭学生搜索抽屉
   * @memberof onClose
   */
  onClose = () => {
    const { dispatch } = this.props;
    // 关闭学生总数搜索抽屉
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showDrawer: false,
      },
    });
  };

  // 打开或者关闭练习结果弹窗
  openExerciseReport = () => {
    const { showReport } = this.state;
    Modal.destroyAll();
    this.setState({
      showReport: !showReport,
    });
  };

  // 销毁对话框
  closeModal = () => {
    Modal.destroyAll();
    clearInterval(timer);
  };

  ExerciseResult = timeStamp => {
    const { match, dispatch } = this.props;
    const okHtml = (
      <div className={styles.newReport}>
        <i className="iconfont icon-close" onClick={this.closeModal} />
        <p className={styles.news}>新的练习结果已统计完成</p>
        <div className={styles.startExercise} onClick={this.openExerciseReport}>
          开始讲评
        </div>
      </div>
    );
    const taskId = match.params.id; // '50879020107038847' // match.params.id
    // 若不是最新报告，第一次调用接口【Exercise-103获取报告生成状态】
    dispatch({
      type: 'task/getExerciseStatus',
      payload: {
        taskId,
      },
      callback: vo => {
        if (vo.responseCode === '200') {
          if (vo.data.exerciseReportStatus === 'ES_1') {
            // ES_1生成中 ES_2成功 ES_3失败

            // 调用接口【Exercise-104：获取练习报告生成结果】，若返回不为空，则显示“您还可以，打开已有的练习结果”，若为空，则不显示
            let sureContent = '';
            dispatch({
              type: 'task/getExerciseResult',
              payload: {
                taskId,
              },
              callback: item => {
                if (item.responseCode === '200') {
                  if (JSON.stringify(item.data) !== '{}') {
                    sureContent = true;
                  }
                  const contentHtml = (
                    <div className={styles.newReport}>
                      <i className="iconfont icon-close" onClick={this.closeModal} />
                      <p className={styles.news}>系统检测到新的答卷</p>
                      <p className={styles.generate}>正在为您统计最新的练习结果...</p>
                      <p
                        className={styles.sure}
                        style={{ display: sureContent === '' ? 'none' : 'block' }}
                      >
                        您还可以，<span onClick={this.openExerciseReport}>打开已有的练习结果</span>
                      </p>
                    </div>
                  );

                  const modal = Modal.success({
                    icon: <img src={newRes} alt="" className={styles.updateReport} />,
                    className: 'recyleTest',
                    width: 420,
                    content: contentHtml,
                  });

                  timer = setInterval(() => {
                    // 每隔20秒询问练习状态
                    if (window.location.href.indexOf('/teacher/task/') > -1) {
                      dispatch({
                        type: 'task/getExerciseStatus',
                        payload: {
                          taskId,
                        },
                        callback: e => {
                          if (e.responseCode === '200') {
                            if (e.data.exerciseReportStatus !== 'ES_1') {
                              clearInterval(timer);
                              modal.destroy();
                              // 弹出练习报告页面
                              Modal.success({
                                icon: <img src={newRes2} alt="" className={styles.updateReport} />,
                                className: 'recyleTest',
                                width: 420,
                                content: okHtml,
                              });
                            }
                          } else {
                            clearInterval(timer);
                          }
                        },
                      }).catch(() => {
                        clearInterval(timer);
                        modal.destroy();
                      });
                    }
                  }, 20000);
                }
              },
            });
          } else {
            // 报告不是生成中时直接调生成练习报告
            // 若返回“未生成/生成完成”，异步调用【Exercise-102开始生成报告】，弹出“答卷有更新”弹框
            dispatch({
              type: 'task/getExerciseBuild',
              payload: {
                taskId,
                timeStamp,
              },
              callback: res => {
                // 弹出练习报告页面
                if (res.responseCode === '200') {
                  Modal.success({
                    icon: <img src={newRes2} alt="" className={styles.updateReport} />,
                    className: 'recyleTest',
                    width: 420,
                    content: okHtml,
                  });
                }
              },
            });
          }
        }
      },
    });
  };

  /**
   * @description 互动讲评
   * @memberof interCommary
   */
  interCommary = () => {
    const { match, dispatch } = this.props;
    const that = this;
    const taskId = match.params.id; // '50879020107038847' // match.params.id
    // 调用接口【Exercise-106：获取队列-已处理学生答卷的最新时间戳】，获取最新的提交数据的时间戳，以及是否最新报告，若是，直接弹框打开报告
    dispatch({
      type: 'task/getTimeStamp',
      payload: {
        taskId,
      },
      callback: res => {
        if (window.location.href.indexOf('/teacher/task/') > -1) {
          if (res.responseCode === '200') {
            if (res.data.isNewReport === 'Y') {
              // 若是，直接弹框打开报告
              that.openExerciseReport();
            } else {
              that.ExerciseResult(res.data.timeStamp);
            }
          }
        }
      },
    });
  };

  render() {
    const {
      children,
      taskPaperIdList,
      taskStudentRelationVOList,
      name,
      classList,
      students,
      type,
      taskId,
      taskStatus,
      loadingTaskInfo,
      ueInfo,
      EXAMFLAG,
      showNewModal,
      distributeType,
      examType,
      EXAM_TYPE,
      DIST_TYPE,
      countTime,
    } = this.props;
    const { backBtn } = this.state;
    // 排除taskStudentRelationVOList中当前正在考试的学生的状态信息
    const joinTestStudents = taskStudentRelationVOList.filter(item => item.status === 'Y');
    const otherStudents = joinTestStudents.filter(
      data => !students.some(item => item.studentId === data.studentId)
    );
    const sucessTest =
      type === 'TT_2' && this.getCurrentStep() !== 3
        ? otherStudents.filter(data => data.examStatus === 'ES_4')
        : [
            ...otherStudents.filter(data => data.examStatus === 'ES_4'),
            ...students.filter(data => data.studentId && data.examStatus === 'ES_4'),
          ];
    const failureTest =
      type === 'TT_2' && this.getCurrentStep() !== 3
        ? otherStudents.filter(data => data.examStatus === 'ES_3')
        : [
            ...otherStudents.filter(data => data.examStatus === 'ES_3'),
            ...students.filter(data => data.studentId && data.examStatus === 'ES_3'),
          ];
    const noTest = joinTestStudents.length - sucessTest.length - failureTest.length;
    const { showDetail, showReport, newAdd, showPaperEvaluation, paperTimes } = this.state;
    let backClick = false;
    const currentStep = this.getCurrentStep();
    if (currentStep !== 2) {
      backClick = true;
    } else {
      backClick = false;
    }

    const menu = (
      <Menu className="classOper">
        {classList.map(item => (
          <Menu.Item key={item.classId}>{item.className}</Menu.Item>
        ))}
      </Menu>
    );
    const menuTest = (
      <Menu className="classOper">
        {taskPaperIdList.map(item => (
          <Menu.Item key={item.paperId}>{item.name}</Menu.Item>
        ))}
      </Menu>
    );
    let dist = '';
    let exam = '';
    if (distributeType) {
      const arr = distributeType.split(',');
      DIST_TYPE.forEach(item => {
        distributeType.split(',').forEach((vo, index) => {
          if (item.code === vo) {
            if (index === arr.length - 1 || arr.length === 1) {
              dist += item.value;
            } else {
              dist += item.value.concat(',');
            }
          }
        });
      });
    }
    if (examType) {
      const arr = examType.split(',');
      EXAM_TYPE.forEach(item => {
        examType.split(',').forEach((vo, index) => {
          if (item.code === vo) {
            if (index === arr.length - 1 || arr.length === 1) {
              exam += item.value;
            } else {
              exam += item.value.concat(',');
            }
          }
        });
      });
    }
    const Examination = (
      <div className={styles.examStrategy}>
        <div className={styles.seat}>
          <span>
            {formatMessage({
              id: 'task.text.distributeExaminationPapers',
              defaultMessage: '分发试卷方式',
            })}
            :
          </span>
          {dist}
        </div>
        <div className={styles.seat}>
          <span>
            {formatMessage({ id: 'task.text.ExaminationStrategy', defaultMessage: '考试策略' })}:
          </span>{' '}
          {exam || formatMessage({ id: 'task.text.no', defaultMessage: '无' })}
        </div>
      </div>
    );

    // 生成内容区的显示效果
    let contentReactDom = children;
    if (taskStatus === 'stop' && taskId === 'autoCheck') {
      // 1、如果开启了一键检测报告，则显示一键检测的报告页
      contentReactDom = <Report onClose={this.backList} />;
    }
    return (
      <div className={styles.monitorContainers}>
        <Spin spinning={loadingTaskInfo} delay={200} wrapperClassName={styles.spin}>
          {type && (
            <div className={styles.monitor}>
              {/* <Drawer
                placement="right"
                closable
                className={styles['monitor-drawer']}
                onClose={this.onClose}
                visible={showDrawer}
                width={470}
                height="calc( 100% - 55px )"
                maskClosable
                mask
                destroyOnClose
              >
                <SiderDrawer />
              </Drawer> */}
              <RaiseHands
                raiseData={students.filter(data => data.handStatus === 1)}
                removeCurrentStudent={id => this.removeCurrent(id)}
                removeAll={this.removeAllHands}
              />
              <div className={styles.sliderLeft}>
                <div
                  className={
                    // eslint-disable-next-line no-nested-ternary
                    backClick ? (backBtn ? styles.noBackList : styles.backList) : styles.noBack
                  }
                  onClick={backBtn ? null : this.backList}
                >
                  <i className="iconfont icon-back" />
                  {taskId === 'autoCheck'
                    ? formatMessage({ id: 'task.text.backHome', defaultMessage: '返回首页' })
                    : formatMessage({ id: 'task.button.back.list', defaultMessage: '返回列表' })}
                </div>
                <Card
                  title={
                    (type === 'TT_2' &&
                      formatMessage({
                        id: 'task.text.practiceInfo',
                        defaultMessage: '练习信息',
                      })) ||
                    (type === 'TT_1' &&
                      formatMessage({
                        id: 'task.text.watch.test.info',
                        defaultMessage: '考试信息',
                      })) ||
                    formatMessage({ id: 'task.text.watch.test.info', defaultMessage: '考试信息' })
                  }
                  className={styles.taskInfo}
                >
                  <p className={styles.taskNameInfo}>
                    {type !== 'TT_6' && (
                      <span>{name.length > 24 ? `${name.slice(0, 21)}...` : name}</span>
                    )}
                    {type === 'TT_6' && (
                      <span>
                        {ueInfo.ueTaskName && ueInfo.ueTaskName.length > 24
                          ? `${ueInfo.ueTaskName.slice(0, 21)}...`
                          : ueInfo.ueTaskName}
                      </span>
                    )}
                  </p>
                  {type === 'TT_6' && (
                    <p className={styles.joinExam}>
                      <span className={styles.examBatch}>
                        {ueInfo.examBatch}&nbsp;|&nbsp;{ueInfo.examRoom}
                      </span>
                      <span className={styles.paperGoupname}>{ueInfo.paperGroupName}</span>
                    </p>
                  )}
                  {type !== 'TT_6' && (
                    <ul className="task">
                      <li>
                        <Dropdown overlay={menu} trigger={['click']}>
                          <span>{classList.length}</span>
                        </Dropdown>
                        {formatMessage({ id: 'task.text.joinClass', defaultMessage: '参与班级' })}
                      </li>
                      <li>
                        <Dropdown overlay={menuTest} trigger={['click']}>
                          <span>{taskPaperIdList.length}</span>
                        </Dropdown>
                        {formatMessage({ id: 'task.text.usedPaper', defaultMessage: '使用试卷' })}
                      </li>
                    </ul>
                  )}
                  {type === 'TT_2' ? null : (
                    <div className={styles.setTests}>
                      <Dropdown overlay={Examination} trigger={['click']}>
                        <span>
                          {formatMessage({
                            id: 'task.text.ExaminationStrategy',
                            defaultMessage: '考试策略',
                          })}
                        </span>
                      </Dropdown>
                    </div>
                  )}
                </Card>
                {taskId !== 'autoCheck' && (
                  <Card
                    title={formatMessage({
                      id: 'task.text.infomationTotal',
                      defaultMessage: '情况统计',
                    })}
                    className={styles.taskInfo}
                  >
                    <ul className="count">
                      <li>
                        <span>{joinTestStudents.length}</span>
                        {type === 'TT_2'
                          ? formatMessage({
                              id: 'task.title.praticeStudentLeft',
                              defaultMessage: '应练学生',
                            })
                          : formatMessage({
                              id: 'task.text.testPeople',
                              defaultMessage: '应考人数',
                            })}
                      </li>
                      {type === 'TT_2' && (
                        <li>
                          <span className="sucess">{joinTestStudents.length - noTest}</span>
                          {formatMessage({ id: 'task.text.praticed', defaultMessage: '已练习' })}
                        </li>
                      )}
                      {type !== 'TT_2' && (
                        <li>
                          <span className="sucess">
                            {sucessTest.length > 0 ? sucessTest.length : '0'}
                          </span>
                          {formatMessage({
                            id: 'task.text.testSucess',
                            defaultMessage: '考试成功',
                          })}
                        </li>
                      )}
                      <li>
                        <span className="noTest">{noTest > 0 ? noTest : '0'}</span>
                        {type === 'TT_2'
                          ? formatMessage({
                              id: 'task.text.studentNoTest',
                              defaultMessage: '未练学生',
                            })
                          : formatMessage({
                              id: 'task.text.noTestPeople',
                              defaultMessage: '未考人数',
                            })}
                      </li>
                      {type !== 'TT_2' && (
                        <li>
                          <span className="failure">
                            {failureTest.length > 0 ? failureTest.length : '0'}
                          </span>
                          {formatMessage({
                            id: 'task.text.testFailure',
                            defaultMessage: '考试失败',
                          })}
                        </li>
                      )}
                    </ul>
                    {/* <span className={styles.notice}>
                        以上数据仅供参考
                        <Tooltip title={tipText}>
                          <i className="iconfont icon-help" />
                        </Tooltip>
                      </span> */}
                    <div className={styles.lookDetail} onClick={this.toggleDetailPage}>
                      <span>
                        {formatMessage({ id: 'task.text.lookDetail', defaultMessage: '查看详情' })}
                      </span>
                    </div>
                  </Card>
                )}
              </div>
              <div className={styles.sliderRight}>
                <Fragment>
                  <Steps
                    current={this.getCurrentStep()}
                    className="steps"
                    style={type === 'TT_2' ? { marginLeft: '-137px' } : {}}
                  >
                    <Step
                      title={formatMessage({
                        id: 'task.text.allowLogin',
                        defaultMessage: '允许登录',
                      })}
                      style={type === 'TT_2' ? { opacity: 0 } : { opacity: 1 }}
                    />
                    {type === 'TT_2' ? (
                      <Step
                        title={formatMessage({
                          id: 'task.text.beginPractice',
                          defaultMessage: '开始练习',
                        })}
                      />
                    ) : (
                      <Step
                        title={formatMessage({
                          id: 'task.text.beginTest',
                          defaultMessage: '开始考试',
                        })}
                      />
                    )}
                    {type === 'TT_2' ? (
                      <Step
                        title={formatMessage({
                          id: 'task.text.endPractice',
                          defaultMessage: '结束练习',
                        })}
                        className={this.getCurrentStep() === 2 ? 'current' : ''}
                      />
                    ) : (
                      <Step
                        title={formatMessage({
                          id: 'task.text.endTest',
                          defaultMessage: '结束考试',
                        })}
                        className={this.getCurrentStep() === 2 ? 'current' : ''}
                      />
                    )}
                  </Steps>
                </Fragment>

                {type === 'TT_2' && (
                  <div className={styles.InterCommary}>
                    <div className={styles.line}>|</div>
                    <div
                      className={backClick ? styles.InteractiveCommentary : styles.noInterCommarys}
                      onClick={this.interCommary}
                    >
                      互动讲评
                    </div>
                  </div>
                )}
                {countTime > 0 && (
                  <div className={styles.paperTimeTest}>
                    {type === 'TT_2' ? '已练' : '已考'}：
                    <span className={styles.detailTime}>
                      {(countTime && showTime(countTime, 's')) || '--'}
                    </span>
                    {type !== 'TT_2' && (
                      <span>
                        <span className={styles.line}>|</span>
                        试卷时长：
                        <span className={styles.detailTime}>
                          约{Math.ceil(paperTimes / 60, 10)}分钟
                        </span>
                      </span>
                    )}
                  </div>
                )}
                {/* <div className="secretkey">
                  鉴权密钥：<span>{codeKey}</span>
                  <Tooltip placement="bottom" title={text}>
                    <i className="iconfont icon-help" />
                  </Tooltip>
                </div> */}
                {/* <Button className="closeStudent" disabled={closeStudentAllDisable} onClick={this.closeAll}>关闭学生机</Button> */}
                {/* 判断是详情页还是步骤页还是一键检测 */}
                {contentReactDom}
              </div>
              {type === 'TT_6' && newAdd.length > 0 && (
                <NewAdd
                  data={newAdd}
                  EXAMFLAG={EXAMFLAG}
                  hideModalNew={this.hideModalAdd}
                  visible={!showNewModal}
                />
              )}
            </div>
          )}
          <Drawer
            placement="bottom"
            closable={false}
            onClose={this.toggleDetailPage}
            destroyOnClose
            maskClosable={false}
            visible={showDetail}
            className={styles.detail}
            height="calc( 100% - 55px )"
          >
            {type !== 'TT_6' && <TaskDetail onClose={this.toggleDetailPage} />}
            {type === 'TT_6' && <TaskExamDetail onClose={this.toggleDetailPage} />}
          </Drawer>
          {showReport && (
            <ExerciseReport
              taskId={taskId}
              onClose={this.openExerciseReport}
              onOpen={id => {
                const { dispatch } = this.props;
                dispatch({
                  type: 'paperEvaluation/saveStudentId',
                  payload: {
                    studentId: id,
                  },
                });
                this.setState({ showPaperEvaluation: true });
              }}
            />
          )}
          {showPaperEvaluation && (
            <PaperEvaluation
              taskId={taskId}
              studentId={this.studentId}
              onClose={() => {
                this.setState({
                  // showReport: !showReport,
                  showPaperEvaluation: !showPaperEvaluation,
                });
              }}
            />
          )}
        </Spin>
      </div>
    );
  }
}
export default Watch;
