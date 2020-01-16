import React, { Component } from 'react';
import { List, Card, Tabs, Icon, message, Dropdown, Menu, Tooltip, Progress } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import ProgressIndex from './Components/Progress/index';
import cn from 'classnames';
import router from 'umi/router';
import Modal from '@/components/Modal';
import { connect } from 'dva';
import { switchStatus } from './watching';
import { sendMS, closeStudent } from '@/utils/instructions';
import EditSeat from './Components/EditSeat/api';
import StopTest from './Components/StopTest/api';
import RecyleFail from './Components/RecyleFail/api';
import { saveExamResult, proxyTokenDelete } from '@/services/teacher';
import cornerLess from '@/assets/corner_less_icon.png';
import studentHead from '@/assets/none_card_icon.png';

const { TabPane } = Tabs;
const { vb } = window;
@connect(({ task, teacher }) => {
  const {
    userInfo: { accountId },
  } = teacher;
  const { taskInfo, students, filterStudents, conditions, countTime } = task;
  const {
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    classList,
    campusId,
  } = taskInfo;
  return {
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    students,
    classList,
    taskInfo,
    accountId,
    campusId,
    filterStudents,
    conditions,
    countTime,
  };
})
class Step3 extends Component {
  endPaperTime = 0;

  paperTestTime = 0;

  state = {
    loadingGif: false,
  };

  componentDidMount() {
    const ipAddressTeacher = localStorage.getItem('ipAddress');
    const that = this;
    const { dispatch, taskId, type } = this.props;
    sendMS('student:getstatus', {
      ipAddr: ipAddressTeacher,
    });

    const params = {
      taskId, // 任务ID
      taskType: type, // 任务类型
    };

    setTimeout(() => {
      const { accountId, campusId } = this.props;
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (student[index].monitoringStatus === 'MS_6') {
          // 当3S时间到时，检查监考列表中是否存在“等待考试”状态的学生机，若存在，单独发送开始考试指令：start:manual（开始考试）
          const obj = vb.getStorageManager().get({ key: accountId });
          if (obj && obj.value !== '') {
            sendMS('start:manual', params, student[index].connId);
          }
        }
      });
      // 添加保存数据缓存
      const objects = vb.getStorageManager().get({ key: accountId });
      let currentTime;
      if (objects && objects.value !== '') {
        const strToObj = JSON.parse(objects.value);
        currentTime = strToObj.startTime;
      }
      const obj = {
        teacherAction: '03',
        task_id: taskId,
        monitorInfo: student,
        campusId,
        startTime: currentTime,
      };
      if (taskId !== 'autoCheck') {
        vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
      }
      console.log('3s保存了缓存！');
    }, 3000);

    // 当考试时间结束后自动发送结束考试指令 并生成检测报告操作   记录结束时间
    const { taskPaperIdList, match } = this.props;
    // 考试时长
    const paperTime =
      taskPaperIdList && taskPaperIdList[0] && taskPaperIdList[0].autoCheckUsedTime * 1000;
    const newTaskID = match.params.id;
    if (newTaskID === 'autoCheck') {
      this.endPaperTime = setTimeout(() => {
        const newStudent = that.props.students;
        const result = JSON.parse(JSON.stringify(newStudent));
        result.forEach((item, index) => {
          if (
            item.monitoringStatus !== 'MS_9' &&
            item.monitoringStatus !== 'MS_11' &&
            item.monitoringStatus !== 'MS_14'
          ) {
            result[index].examStatus = 'ES_3';
          }
        });
        // 在一键检测的任务下结束考试 结束考试  跳转到检测报告页

        // 结束考试并保存任务结束 考试时间
        const timestamp = new Date().getTime();
        const paramsData = {
          taskId: newTaskID, // 任务ID
          taskType: type, // 任务类型
        };
        // 更新学生列表信息
        dispatch({
          type: 'task/updateLinking',
          payload: {
            students: result,
          },
        });
        // 保存结束考试时的时间戳
        dispatch({
          type: 'task/saveEndTime',
          payload: {
            endTime: timestamp,
          },
        });
        sendMS('stop:manual', paramsData, '');
        router.push(`/teacher/task/${match.params.id}/watch/step4`);
      }, paperTime);
    }

    // 考试时间计时器
    this.paperTestTime = setInterval(() => {
      const { countTime } = that.props;
      dispatch({
        type: 'task/addPaperTime',
        payload: {
          countTime: countTime + 1,
        },
      });
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    const { taskId } = this.props;
    if (taskId !== prevProps.taskId) {
      clearTimeout(this.endPaperTime);
      clearInterval(this.paperTestTime);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.endPaperTime);
    clearInterval(this.paperTestTime);
  }

  // 确认提交监考数据
  confirmSaveData = async params => {
    const { type, taskId, dispatch, match, accountId, campusId } = this.props;
    this.setState({
      loadingGif: true,
    });
    const that = this;
    const paramsData = {
      taskId, // 任务ID
      taskType: type, // 任务类型
    };
    const student = params; // .filter(obj => obj.monitoringId !== '');
    // 点击”确定“，将监控状态处于过程中的考生判定为考试失败
    student.forEach((item, index) => {
      if (item.examStatus === 'ES_2' && item.monitoringStatus !== 'MS_14') {
        student[index].examStatus = 'ES_3';
      }
      if (
        item.examStatus === 'ES_2' &&
        (item.monitoringStatus === 'MS_14' || item.monitoringStatus === 'MS_16')
      ) {
        student[index].examStatus = 'ES_4';
      }
      if (
        type === 'TT_2' &&
        item.examStatus === 'ES_2' &&
        item.monitoringStatus !== 'MS_1' &&
        item.monitoringStatus !== 'MS_2' &&
        item.monitoringStatus !== 'MS_3' &&
        item.monitoringStatus !== 'MS_4' &&
        item.monitoringStatus !== 'MS_5' &&
        item.monitoringStatus !== 'MS_7'
      ) {
        student[index].examStatus = 'ES_4';
      }
      if (
        (item.monitoringStatus === 'MS_8' ||
          item.monitoringStatus === 'MS_9' ||
          item.monitoringStatus === 'MS_10' ||
          item.monitoringStatus === 'MS_11') &&
        item.accessFlag === 'auto' &&
        item.examStatus === 'ES_2'
      ) {
        student[index].monitoringDesc = 'ES_4';
        student[index].monitoringStatus = 'MS_13';
      }
    });

    // 结束考试前判断当前任务里的学生数据是否跟当前监考数据一致 不一致更新状态
    console.log(student);
    let resultNew = student;
    try {
      const result = await dispatch({
        type: 'task/beforeEndTask',
        payload: taskId,
      });
      const { studentExamInfo } = result;

      if (studentExamInfo.length > 0) {
        resultNew = student.map(vo => {
          if (
            vo.accessFlag === 'auto' &&
            studentExamInfo.filter(item => item.studentId === vo.studentId).length > 0
          ) {
            const current = studentExamInfo.find(item => item.studentId === vo.studentId);
            if (type === 'TT_2' && current.snapshotInfo.length > 0) {
              return {
                ...vo,
                examStatus: 'ES_4',
              };
            }
            if (type !== 'TT_2' && current.snapshotInfo.length > 0) {
              if (current.snapshotInfo[0].respondentsStatus === 'RS_1') {
                return {
                  ...vo,
                  examStatus: 'ES_4',
                  monitoringDesc: '',
                };
              }
              return {
                ...vo,
                examStatus: 'ES_3',
                monitoringDesc:
                  current.snapshotInfo[0].respondentsStatus === 'RS_5' ? 'ES_7' : 'ES_8',
              };
            }
          }
          return vo;
        });
      }
      // 更新学生列表信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: resultNew,
        },
      });
      if (resultNew.filter(obj => obj.monitoringId !== '').length > 0) {
        const resultData = JSON.parse(JSON.stringify(resultNew));
        resultData.forEach((item, index) => {
          const arr = item.answerProcess;
          let str = '';
          if (Array.isArray(arr)) {
            arr.forEach(vo => {
              str += vo;
            });
            resultData[index].answerProcess = str;
          }
          const papers = resultData[index].paperList || [];
          papers.forEach((vo1, index2) => {
            const paperProcess = vo1.answerProcess;
            let paperProcessStr = '';
            if (Array.isArray(paperProcess)) {
              paperProcess.forEach(vo2 => {
                paperProcessStr += vo2;
              });
              resultData[index].paperList[index2].answerProcess = paperProcessStr;
            }
          });
        });
        saveExamResult(resultData.filter(obj => obj.monitoringId !== '')).then(() => {
          that.setState({
            loadingGif: false,
          });
          // 结束考试  回收答案
          // 考试成功清楚缓存
          vb.getStorageManager().remove({ key: accountId });
          // end
          // sendMS('stop:manual',paramsData,'')
          router.push(`/teacher/task/${match.params.id}/watch/step4`);
        });
      } else {
        vb.getStorageManager().remove({ key: accountId });
        // end
        sendMS('stop:manual', paramsData, '');
        router.push(`/teacher/task/${match.params.id}/watch/step4`);
      }
    } catch (err) {
      console.warn(err);
      // 添加保存数据缓存
      that.setState({
        loadingGif: false,
      });
      const objects = vb.getStorageManager().get({ key: accountId });
      let currentTime;
      if (objects && objects.value !== '') {
        const strToObj = JSON.parse(objects.value);
        currentTime = strToObj.startTime;
      }
      const obj = {
        teacherAction: '03',
        task_id: taskId,
        monitorInfo: resultNew,
        campusId,
        startTime: currentTime,
      };
      if (taskId !== 'autoCheck') {
        vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
      }

      Modal.confirm({
        title: formatMessage({
          id: 'task.message.serviceNo',
          defaultMessage:
            '如多次重试无响应，请确认网络、服务器正常后、再处理。您现在可以暂时关闭系统。',
        }),
        cancelText: formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' }),
        okText: formatMessage({ id: 'task.text.closeTeacher', defaultMessage: '关闭教师机' }),
        okButtonProps: {
          type: 'warn',
          shape: 'round',
        },
        cancelButtonProps: {
          shape: 'round',
        },
        onOk: () => {
          vb.close();
        },
      });
    }
  };

  /**
   * @description 提交监考结果
   * @memberof saveResult
   */
  saveResult = params => {
    clearTimeout(this.endPaperTime);
    const that = this;
    this.endPaperTime = null;
    const { type, taskId } = this.props;
    const paramsData = {
      taskId, // 任务ID
      taskType: type, // 任务类型
    };

    const waitStudent = params.filter(vo => vo.monitoringStatus === 'MS_8').length;
    if (waitStudent > 0) {
      sendMS('stop:manual', paramsData, '');
      let secondsToGo = 20;
      const modal = Modal.success({
        icon: <Progress type="circle" percent={0} />,
        className: 'recyleTest',
        width: 300,
        content: formatMessage({
          id: 'task.message.getpaperResult',
          defaultMessage: '收取答卷中...',
        }),
      });
      const timer = setInterval(() => {
        const { students } = that.props;
        const sucessStudent = students.filter(
          vo =>
            (vo.monitoringStatus === 'MS_14' || vo.monitoringStatus === 'MS_16') &&
            vo.accessFlag === 'auto'
        ).length;
        const answerStudent = students.filter(
          vo => vo.monitoringStatus === 'MS_8' && vo.accessFlag === 'auto'
        ).length;
        const percent = parseInt((sucessStudent / (sucessStudent + answerStudent)) * 100, 10);
        secondsToGo -= 1;
        modal.update({
          icon: <Progress type="circle" percent={percent} />,
          className: 'recyleTest',
          width: 300,
          content: formatMessage({
            id: 'task.message.getpaperResult',
            defaultMessage: '收取答卷中...',
          }),
        });
        if (percent === 100) {
          clearInterval(timer);
          modal.destroy();
          // 收取成功
          Modal.success({
            icon: <i className="iconfont icon-right" />,
            className: 'recyleTestOk',
            width: 300,
            okText: formatMessage({ id: 'task.button.complete', defaultMessage: '完成' }),
            content: formatMessage({
              id: 'task.message.paperSucess',
              defaultMessage: '答卷收取成功！',
            }),
            onOk() {
              const newStudent = that.props.students;
              that.confirmSaveData(newStudent);
            },
          });
        }
        if (secondsToGo === 0 && percent !== 100) {
          clearInterval(timer);
          modal.destroy();
          // 20s后收取失败
          RecyleFail({
            dataSource: {
              title: formatMessage({
                id: 'task.message.paperFailure',
                defaultMessage: '回收答卷包失败',
              }),
              students,
              type,
            },
            callback: e => {
              if (e) {
                // 放弃回收答卷包并结束考试
                const newStudent = that.props.students;
                that.confirmSaveData(newStudent);
              } else {
                // 再次收取
                const newStudent = that.props.students;
                that.saveResult(newStudent);
              }
            },
          });
        }
      }, 1000);
      // setTimeout(() => {
      //   clearInterval(timer);
      //   modal.destroy();
      //   // 20s 后 判断答卷是否收取完成
      //   const {students} = that.props;
      //   waitStudent = students.filter(vo=>vo.monitoringStatus==='MS_8').length;
      //   if(waitStudent===0) {
      //     // 20s后收取成功
      //     Modal.success({
      //       icon:<i className="iconfont icon-right" />,
      //       className:"recyleTestOk",
      //       width:300,
      //       okText:"完成",
      //       content: `答卷收取成功！`,
      //       onOk() {that.confirmSaveData(students)}
      //     });
      //   } else {
      //     // 20s后收取失败
      //     RecyleFail({
      //       dataSource: {
      //         title: '回收答卷包失败',
      //         students,
      //         type
      //       },
      //       callback: (e) => {
      //         if(e) {
      //           // 放弃回收答卷包并结束考试
      //           that.confirmSaveData(students)
      //         } else {
      //           // 再次收取
      //           that.saveResult(students)
      //         }

      //       },
      //     });
      //   }
      // }, secondsToGo * 1000);
    } else {
      if (type === 'TT_2') {
        sendMS('stop:manual', paramsData, '');
      }
      that.confirmSaveData(params);
    }
  };

  /**
   * @description 结束考试
   * @memberof endTest
   */
  endTest = () => {
    const { dispatch, taskId, type, match } = this.props;
    const that = this;
    const { loadingGif } = this.state;
    if (loadingGif) {
      return;
    }
    // 判断是否处理完所有的异常  若存在正在考试 考试失败  则提示  请处理完所有的异常并完成考试
    const { students } = this.props;
    const result = JSON.parse(JSON.stringify(students));
    result.forEach((item, index) => {
      if (type === 'TT_2' && item.examStatus === 'ES_2') {
        result[index].examStatus = 'ES_4';
      }
    });
    if (taskId !== 'autoCheck') {
      // 提交监控信息
      StopTest({
        dataSource: {
          title: formatMessage({ id: 'task.title.Candidates', defaultMessage: '考生情况' }),
          students: result,
          type,
        },
        callback: () => {
          that.saveResult(result);
        },
      });
      // end
    } else {
      // 在一键检测的任务下结束考试 结束考试跳转到检测报告页
      // 结束考试并保存任务结束 考试时间
      const timestamp = new Date().getTime();
      const paramsData = {
        taskId, // 任务ID
        taskType: type, // 任务类型
      };
      result.forEach((item, index) => {
        if (
          item.monitoringStatus !== 'MS_9' &&
          item.monitoringStatus !== 'MS_11' &&
          item.monitoringStatus !== 'MS_14'
        ) {
          result[index].examStatus = 'ES_3';
        }
      });
      // 更新学生列表信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: result,
        },
      });
      // 保存结束考试时的时间戳
      dispatch({
        type: 'task/saveEndTime',
        payload: {
          endTime: timestamp,
        },
      });
      sendMS('stop:manual', paramsData, '');
      // 跳转到检测报告页
      router.push(`/teacher/task/${match.params.id}/watch/step4`);
    }
  };

  /**
   * @description 修改座位号
   * @memberof editSeatUser
   */
  editSeatUser = (currentIp, connID, seatNo) => {
    console.log(currentIp);
    EditSeat({
      dataSource: {
        title: formatMessage({ id: 'task.title.tips', defaultMessage: '提示' }),
        seatNo,
      },
      callback: userSeatNumber => {
        const data = {
          ipAddr: currentIp, // 学生机IP
          number: Number(userSeatNumber), // 座位号
        };
        sendMS('modify:number', data, connID);
        // 添加保存数据缓存 需在座位号修改完成回调后再保存缓存
        // that.saveCacheData()
      },
    });
  };

  // 关闭学生机二次确认框
  beforeCloseStudent = (ip, connID, userName, seatNo, monitoringStatus) => {
    if (monitoringStatus === 'MS_10') {
      return;
    }
    Modal.confirm({
      title: null,
      width: 400,
      content: (
        <span>
          {formatMessage({ id: 'task.text.yesornoclose', defaultMessage: '是否关闭' })}{' '}
          <span className={styles['del-task']}>
            {seatNo} {userName || ip}
          </span>{' '}
          {formatMessage({ id: 'task.text.yesornoclosed', defaultMessage: '的学生机？' })}
        </span>
      ),
      icon: null,
      centered: true,
      okText: formatMessage({ id: 'task.button.yes', defaultMessage: '是' }),
      cancelText: formatMessage({ id: 'task.button.no', defaultMessage: '否' }),
      okButtonProps: {
        type: 'warn',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        this.closeStudent(ip, connID);
      },
    });
  };

  /**
   * @description 关闭学生机
   * @memberof closeStudent
   */
  closeStudent = (ip, connID) => {
    const { accountId, campusId } = this.props;
    // const data = {
    //   "ipAddr":ip
    // }
    const v = 'student_';
    const userIp = v + ip;
    proxyTokenDelete(userIp).then(res => {
      if (res.responseCode !== '200') {
        message.warning(res.data);
      }
    });
    const { taskId, students, dispatch, filterStudents, conditions } = this.props;
    const student = JSON.parse(JSON.stringify(students));
    const filterStudent = JSON.parse(JSON.stringify(filterStudents));
    student.forEach((item, index) => {
      if (item.ipAddress === ip) {
        student.splice(index, 1);
      }
    });
    filterStudent.forEach((item, index) => {
      if (item.ipAddress === ip) {
        filterStudent.splice(index, 1);
      }
    });
    dispatch({
      type: 'task/savefilterTaskWathData',
      payload: {
        filterStudent,
        conditions,
      },
    });

    // 更新学生列表信息
    dispatch({
      type: 'task/updateLinking',
      payload: {
        students: student,
      },
    });
    // 添加保存数据缓存
    const objects = vb.getStorageManager().get({ key: accountId });
    let currentTime;
    if (objects && objects.value !== '') {
      const strToObj = JSON.parse(objects.value);
      currentTime = strToObj.startTime;
    }
    const obj = {
      teacherAction: '03',
      task_id: taskId,
      monitorInfo: student,
      campusId,
      startTime: currentTime,
    };
    if (taskId !== 'autoCheck') {
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
    }
    // sendMS('close',data,connID)
    closeStudent(connID);
  };

  // 重置登录二次确认框
  beforeResetLogin = (ip, connID, userName) => {
    Modal.confirm({
      title: null,
      width: 400,
      content: (
        <span>
          {formatMessage({ id: 'task.text.yesornoreset', defaultMessage: '是否重置' })}{' '}
          <span className={styles['del-task']}>{userName || ip}</span>{' '}
          {formatMessage({ id: 'task.text.yesornoreseted', defaultMessage: '的登录状态？' })}
        </span>
      ),
      icon: null,
      centered: true,
      okText: formatMessage({ id: 'task.button.yes', defaultMessage: '是' }),
      cancelText: formatMessage({ id: 'task.button.no', defaultMessage: '否' }),
      okButtonProps: {
        type: 'warn',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        this.resetLogin(ip, connID);
      },
    });
  };

  /**
   * @description 重置登录
   * @memberof resetLogin
   */
  resetLogin = (ip, connID) => {
    console.log(ip);
    const { students, dispatch, accountId, campusId } = this.props;
    const data = {
      ipAddr: ip,
    };
    const v = 'student_';
    const userIp = v + ip;
    proxyTokenDelete(userIp).then(res => {
      if (res.responseCode === '200') {
        sendMS('clean', data, connID);
        const result = JSON.parse(JSON.stringify(students));
        result.forEach((item, index) => {
          if (ip === item.ipAddress) {
            result[index].paperName = '';
            result[index].userName = '';
            result[index].identifyCode = '';
            result[index].answerProcess = '';
            result[index].monitoringStatus = 'MS_1';
            result[index].studentId = '';
            result[index].monitoringId = '';
            result[index].classId = '';
            result[index].screening = '';
            result[index].paperList = [];
            result[index].accessFlag = 'auto';
          }
        });
        // 更新学生列表信息
        dispatch({
          type: 'task/updateLinking',
          payload: {
            students: result,
          },
        });
        const { taskId } = this.props;
        // 添加保存数据缓存
        const objects = vb.getStorageManager().get({ key: accountId });
        let currentTime;
        if (objects && objects.value !== '') {
          const strToObj = JSON.parse(objects.value);
          currentTime = strToObj.startTime;
        }
        const obj = {
          teacherAction: '03',
          task_id: taskId,
          monitorInfo: result,
          campusId,
          startTime: currentTime,
        };
        if (taskId !== 'autoCheck') {
          vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
        }
      } else {
        message.warning(res.data);
      }
    });
    // sendMS('exit',data,connID)
  };

  /**
   * @description 显示学生总数搜索抽屉
   * @memberof showDrawerSider
   */
  showDrawerSider = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showDrawer: true,
      },
    });
  };

  /**
   * @description 异常处理
   * @memberof exceptionUser
   */
  exceptionUser = sid => {
    const { dispatch, type } = this.props;

    dispatch({
      type: 'popup/open',
      payload: type === 'TT_2' ? 'practiceExceptionHandle' : 'examExceptionHandle',
      data: sid,
      status: 'taskIng',
    });
  };

  /**
   * @description 渲染Item
   * @memberof showItem
   */
  showItem = item => {
    // 如果考试失败则添加卡片的背景色样式
    const { type } = this.props;
    return (
      <Card
        title={item.ipAddress}
        className={item.monitoringStatus === 'MS_10' ? 'studentIpOrange' : ''}
        style={item.examStatus === 'ES_3' ? { background: '#FFE3DD' } : {}}
      >
        <div className={styles.main}>
          <div className={styles.status}>
            <div className={styles.examFlagStatus}>
              {item.examFlag && (
                <div>
                  {item.examFlag.split(',').map(vo =>
                    vo === 'APPLY' ? (
                      <Tooltip
                        title={formatMessage({
                          id: 'task.text.on.site.registration',
                          defaultMessage: '现场报名',
                        })}
                        className={styles.news}
                      >
                        {formatMessage({
                          id: 'task.text.text.on.site.newspaper',
                          defaultMessage: '报',
                        })}
                      </Tooltip>
                    ) : (
                      vo === 'MAKE_UP_EXAM' && (
                        <Tooltip
                          title={`${formatMessage({
                            id: 'task.text.Make.up.Examination',
                            defaultMessage: '已补考',
                          })}${item.makeUpCount || 0}${formatMessage({
                            id: 'task.text.exam.second.count',
                            defaultMessage: '次',
                          })}`}
                          className={styles.makeup}
                        >
                          {formatMessage({ id: 'task.text.repair', defaultMessage: '补' })}
                        </Tooltip>
                      )
                    )
                  )}
                </div>
              )}
            </div>
            <span className={cn(styles.seatNumber, 'connect'.concat(item.monitoringStatus))}>
              {item.seatNo !== '' ? item.seatNo : '--'}
            </span>
            <span className={cn(styles.connect, 'connect'.concat(item.monitoringStatus))}>
              {switchStatus(item.monitoringStatus, type)}
            </span>
          </div>
          <div className={styles.detail}>
            <div className={item.paperName ? '' : styles.student}>
              <span className={styles.studentName}>
                <Tooltip title={item.userName || '---'}>{item.userName || '---'}</Tooltip>
              </span>{' '}
              <span className={styles.studentNumber}>
                {formatMessage({ id: 'task.text.studentCode', defaultMessage: '考号' })}{' '}
                <Tooltip title={item.identifyCode ? item.identifyCode : ''}>
                  {item.identifyCode ? item.identifyCode : '---'}
                </Tooltip>
              </span>
              <br />
              <div className={item.paperName ? styles.paperName : ''}>
                <Tooltip title={item.paperName}>{item.paperName}</Tooltip>
              </div>
            </div>
            <div className={styles.percent}>
              <span className={styles.percentTitle}>
                {formatMessage({ id: 'task.text.processAnswer', defaultMessage: '答题进度' })}
              </span>{' '}
              {item.tipName ? (
                <ProgressIndex
                  data={item.answerProcess}
                  counts={item.totalQuestionNum}
                  tipDecript={item.tipName}
                  type={type}
                />
              ) : (
                '--'
              )}
            </div>
          </div>
        </div>
        {type === 'TT_2' &&
        item.paperList.length > 0 &&
        item.paperList.filter(vo => vo.upLoadStatus === 0).length > 0 ? (
          <div>
            <img src={cornerLess} alt="" />
          </div>
        ) : (
          ''
        )}
      </Card>
    );
  };

  /**
   * @description 渲染空数据
   * @memberof showItem
   */
  emptyNoData = () => (
    <div className={styles.emptyNoData}>
      <img src={studentHead} alt="" />
      {formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })}
    </div>
  );

  /**
   * @description 显示新增学生列表
   * @memberof showNewModal
   */
  showNewModalVisible = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showNewModal: false,
      },
    });
  };

  // 切换不同tab 暂存当前tab数据
  changeStatus = key => {
    console.log(key);
    const { dispatch, students, type } = this.props;
    if (key === '1') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students,
          conditions: key,
        },
      });
    }
    if (key === '4') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(data => data.monitoringStatus === 'MS_8'),
          conditions: key,
        },
      });
    }
    if (key === '5') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(
            data => data.monitoringStatus === 'MS_14' || data.monitoringStatus === 'MS_16'
          ),
          conditions: key,
        },
      });
    }
    if (key === '6') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent:
            type === 'TT_2'
              ? students.filter(data => data.monitoringStatus !== 'MS_16')
              : students.filter(
                  data => data.monitoringStatus !== 'MS_14' && data.monitoringStatus !== 'MS_8'
                ),
          conditions: key,
        },
      });
    }
  };

  render() {
    const { students, taskStudentRelationVOList, type, filterStudents } = this.props;
    const { loadingGif } = this.state;
    // 练习的时候卡片菜单
    const menu = (sid, connId, seatNo, userName, monitoringStatus) => (
      <Menu className="oper">
        <Menu.Item key="1" onClick={() => this.editSeatUser(sid, connId, seatNo)}>
          <i className="iconfont icon-edit" />
          {formatMessage({ id: 'task.text.editSeatNo', defaultMessage: '修改座位号' })}
        </Menu.Item>
        <Menu.Item key="3" onClick={() => this.beforeResetLogin(sid, connId, userName)}>
          <i className="iconfont icon-back" />
          {formatMessage({ id: 'task.text.resetLogin', defaultMessage: '重置登录' })}
        </Menu.Item>
        <Menu.Item
          key="4"
          onClick={() => this.beforeCloseStudent(sid, connId, userName, seatNo, monitoringStatus)}
          className={monitoringStatus === 'MS_10' ? 'disabled' : ''}
        >
          <i className="iconfont icon-shut_down" />
          {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
        </Menu.Item>
      </Menu>
    );

    // 考试的时候卡片菜单
    const menuPaper = (sid, examStatus) =>
      examStatus === 'ES_3' ? (
        <div />
      ) : (
        <Menu className="oper">
          <Menu.Item key="5" onClick={() => this.exceptionUser(sid)}>
            <i className="iconfont icon-warning" />
            {formatMessage({ id: 'task.button.exceptStudent', defaultMessage: '异常考生处理' })}
          </Menu.Item>
        </Menu>
      );
    const newAdd = taskStudentRelationVOList.filter(
      vo => vo.examFlag && vo.examFlag !== '' && vo.examFlag !== null && vo.status === 'Y'
    );
    return (
      <div className={styles.steps}>
        <div
          className={styles.endTest}
          onClick={this.endTest}
          style={type === 'TT_2' ? { marginLeft: '-137px' } : {}}
        >
          {loadingGif && <Icon type="loading" />}
        </div>
        <div className={styles.step}>
          <div className={styles.notices}>
            {type === 'TT_6' && newAdd.length > 0 && (
              <i className="iconfont icon-bell" onClick={this.showNewModalVisible} />
            )}
            {/* <div className={styles.counts} onClick={this.showDrawerSider}>
              <i className="iconfont icon-user" />
              {type==='TT_2'?formatMessage({id:"task.text.practicedStudent",defaultMessage:"应练学生"}):formatMessage({id:"task.text.teacher.task.watch.step1.testStudents",defaultMessage:"应考学生"})}({taskStudentRelationVOList.filter(data => data.status === "Y").length})
              <Icon className={styles.icon} type="caret-down" theme="filled" color="#000000" />
            </div> */}
          </div>
        </div>
        <Tabs defaultActiveKey="1" animated={false} onChange={this.changeStatus}>
          <TabPane
            tab={
              <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                {formatMessage({ id: 'task.text.all', defaultMessage: '全部' })} ({students.length})
              </span>
            }
            key="1"
          >
            {students.length === 0 && this.emptyNoData()}
            {students.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={students}
                renderItem={item => (
                  <Dropdown
                    overlay={
                      type === 'TT_2'
                        ? menu(
                            item.ipAddress,
                            item.connId,
                            item.seatNo,
                            item.userName,
                            item.monitoringStatus
                          )
                        : menuPaper(item.studentId, item.examStatus)
                    }
                    trigger={['contextMenu']}
                  >
                    <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                      {this.showItem(item)}
                    </List.Item>
                  </Dropdown>
                )}
              />
            )}
          </TabPane>
          {type !== 'TT_2' && (
            <TabPane
              tab={
                <span className={cn(styles.waiting, styles.statusNow, 'waiting')}>
                  <i />
                  {formatMessage({ id: 'task.title.tabanswering', defaultMessage: '答题中' })} (
                  {students.filter(data => data.monitoringStatus === 'MS_8').length})
                </span>
              }
              key="4"
            >
              {filterStudents.length === 0 && this.emptyNoData()}
              {filterStudents.length > 0 && (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                  dataSource={filterStudents}
                  renderItem={item =>
                    item.monitoringStatus === 'MS_8' ? (
                      <Dropdown
                        overlay={
                          type === 'TT_2'
                            ? menu(item.ipAddress, item.connId, item.seatNo, item.userName)
                            : menuPaper(item.studentId, item.examStatus)
                        }
                        trigger={['contextMenu']}
                      >
                        <List.Item
                          className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}
                        >
                          {this.showItem(item)}
                        </List.Item>
                      </Dropdown>
                    ) : (
                      <List.Item
                        className={
                          item.monitoringStatus === 'MS_13' ? 'uploadFail notAllow' : 'notAllow'
                        }
                      >
                        {this.showItem(item)}
                      </List.Item>
                    )
                  }
                />
              )}
            </TabPane>
          )}
          <TabPane
            tab={
              <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                <i />
                {type === 'TT_2'
                  ? formatMessage({ id: 'task.title.competed', defaultMessage: '已完成' })
                  : formatMessage({
                      id: 'task.title.paperSucess',
                      defaultMessage: '交卷成功',
                    })}{' '}
                (
                {
                  students.filter(
                    data => data.monitoringStatus === 'MS_14' || data.monitoringStatus === 'MS_16'
                  ).length
                }
                )
              </span>
            }
            key="5"
          >
            {filterStudents.length === 0 && this.emptyNoData()}
            {filterStudents.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={filterStudents}
                renderItem={item =>
                  item.monitoringStatus === 'MS_14' || item.monitoringStatus === 'MS_16' ? (
                    <Dropdown
                      overlay={
                        type === 'TT_2'
                          ? menu(item.ipAddress, item.connId, item.seatNo, item.userName)
                          : menuPaper(item.studentId, item.examStatus)
                      }
                      trigger={['contextMenu']}
                    >
                      <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                        {this.showItem(item)}
                      </List.Item>
                    </Dropdown>
                  ) : (
                    <List.Item
                      className={
                        item.monitoringStatus === 'MS_13' ? 'uploadFail notAllow' : 'notAllow'
                      }
                    >
                      {this.showItem(item)}
                    </List.Item>
                  )
                }
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span className={cn(styles.excepted, styles.statusNow, 'excepted')}>
                <i />
                {type === 'TT_2'
                  ? formatMessage({ id: 'task.title.TabnoComplete', defaultMessage: '未完成' })
                  : formatMessage({ id: 'task.title.otherTab', defaultMessage: '其它' })}
                (
                {type === 'TT_2'
                  ? students.filter(data => data.monitoringStatus !== 'MS_16').length
                  : students.filter(
                      data => data.monitoringStatus !== 'MS_14' && data.monitoringStatus !== 'MS_8'
                    ).length}
                )
              </span>
            }
            key="6"
          >
            {filterStudents.length === 0 && this.emptyNoData()}
            {filterStudents.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={filterStudents}
                renderItem={item =>
                  (type === 'TT_2' && item.monitoringStatus !== 'MS_16') ||
                  (type !== 'TT_2' &&
                    item.monitoringStatus !== 'MS_8' &&
                    item.monitoringStatus !== 'MS_14') ? (
                    // eslint-disable-next-line react/jsx-indent
                    <Dropdown
                      overlay={
                        type === 'TT_2'
                          ? menu(item.ipAddress, item.connId, item.seatNo, item.userName)
                          : menuPaper(item.studentId, item.examStatus)
                      }
                      trigger={['contextMenu']}
                    >
                      <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                        {this.showItem(item)}
                      </List.Item>
                    </Dropdown>
                  ) : (
                    <List.Item
                      className={
                        item.monitoringStatus === 'MS_13' ? 'uploadFail notAllow' : 'notAllow'
                      }
                    >
                      {this.showItem(item)}
                    </List.Item>
                  )
                }
              />
            )}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default Step3;
