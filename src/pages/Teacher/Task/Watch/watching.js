/**
 * @description
 * @author tina.zhang
 * @date 2018-12-15
 * @export
 * @param {*} res   学生端的回调指令
 * @param {*} currentStep  当前在什么状态下  等待考试  开始考试  结束考试
 * @param {*} that  watch
 * @param {*} dispatch
 */
import { sendMS } from '@/utils/instructions';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { proxyTokenQuery } from '@/services/teacher';

const { vb } = window;
export function ownSortAdd(a, b) {
  console.log(a, b);
  if (a.seatNo && b.seatNo && a.seatNo !== b.seatNo) {
    return Number(a.seatNo) - Number(b.seatNo);
  }
  if (
    a.seatNo &&
    b.seatNo &&
    a.seatNo === b.seatNo &&
    a.identifyCode &&
    b.identifyCode &&
    (a.identifyCode.length > 17 || b.identifyCode.length > 17)
  ) {
    const pre = a.identifyCode.toString().substring(0, 16);
    const next = b.identifyCode.toString().substring(0, 16);
    const preTo = a.identifyCode.toString().substring(16, 20);
    const nextTo = b.identifyCode.toString().substring(16, 20);
    if (Number(pre) > Number(next)) {
      return 1;
    }
    if (Number(pre) === Number(next)) {
      return Number(preTo) - Number(nextTo);
    }
  }
  return Number(a.identifyCode) - Number(b.identifyCode);
}

// function ownSort(a,b){
//     return Number(a.seatNo) - Number(b.seatNo)
// }

export function ownSortCode(a, b) {
  if ((a.examNo && a.examNo.length > 17) || (b.examNo && b.examNo.length > 17)) {
    const pre = a.examNo.toString().substring(0, 16);
    const next = b.examNo.toString().substring(0, 16);
    const preTo = a.examNo.toString().substring(16, 20);
    const nextTo = b.examNo.toString().substring(16, 20);
    if (Number(pre) > Number(next)) {
      return 1;
    }
    if (Number(pre) === Number(next)) {
      return Number(preTo) - Number(nextTo);
    }
  }
  return Number(a.examNo) - Number(b.examNo);
}

export function switchStatus(status, type) {
  switch (status) {
    case 'MS_1':
      return formatMessage({ id: 'task.title.MS_1', defaultMessage: '已连接' });
    case 'MS_6':
      return formatMessage({ id: 'task.title.MS_6', defaultMessage: '等待开始' });
    case 'MS_2':
      return formatMessage({ id: 'task.title.MS_2', defaultMessage: '身份验证中' });
    case 'MS_3':
      return formatMessage({ id: 'task.title.MS_3', defaultMessage: '设备测试中' });
    case 'MS_7':
      return formatMessage({ id: 'task.title.MS_7', defaultMessage: '下载试卷失败' });
    case 'MS_5':
      return formatMessage({ id: 'task.title.MS_5', defaultMessage: '硬件异常' });
    case 'MS_10':
      return formatMessage({ id: 'task.title.MS_10', defaultMessage: '断开连接' });
    case 'MS_4':
      return formatMessage({ id: 'task.title.MS_4', defaultMessage: '正在下载试卷' });
    case 'MS_8':
      return formatMessage({ id: 'task.title.MS_8', defaultMessage: '答题中' });
    case 'MS_9':
      return formatMessage({ id: 'task.title.MS_9', defaultMessage: '答题完成' });
    case 'MS_11':
      return formatMessage({ id: 'task.title.MS_11', defaultMessage: '交卷中' });
    case 'MS_14':
      return formatMessage({ id: 'task.title.MS_14', defaultMessage: '交卷成功' });
    case 'MS_13':
      return formatMessage({ id: 'task.title.MS_13', defaultMessage: '答卷缺失' });
    case 'MS_12':
      return formatMessage({ id: 'task.title.MS_12', defaultMessage: '答题终止' });
    case 'MS_15':
      return formatMessage({ id: 'task.title.MS_15', defaultMessage: '未检测到答案包' });
    case 'MS_16':
      return type === 'TT_2'
        ? formatMessage({ id: 'task.title.MS_16_2', defaultMessage: '练习完成' })
        : formatMessage({ id: 'task.title.MS_16', defaultMessage: '上传答案包成功' });
    default:
      return 0;
  }
}
export function watching(res, currentStep, that, dispatch) {
  const { accountId } = that.props;
  if (res && res.data) {
    const connID = res.connId;
    let studentNew = {};
    studentNew = JSON.parse(res.data);
    const { type } = that.props;
    const myDate = new Date();
    const dateTimes = myDate.getFullYear() + (myDate.getMonth() + 1) + myDate.getDate();
    const timeStart = new Date().getTime();
    // 当前考试学生列表
    if (res && res.command === 'connect' && currentStep !== 3) {
      // 此时判断是哪个IP对应修改该学生的状态
      const ipAddr = studentNew.ipAddr.trim();
      let connectStatus = false;
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          connectStatus = true;
          student[index].monitoringStatus = 'MS_1';
          student[index].connId = connID;
          // 更新学生列表信息
          dispatch({
            type: 'task/updateLinking',
            payload: {
              students: student,
            },
          });
        }
      });
      if (!connectStatus) {
        const testStudent = {
          monitoringId: '', // 监考ID
          screening: dateTimes, // 场次
          seatNo: '', // 座位号
          connId: connID,
          elapsedTime: 0, // 用时
          examStatus: 'ES_1', // 考试状态
          taskId: that.props.taskId,
          taskType: that.props.type,
          studentId: '', // 学生ID
          classId: '', // 班级ID
          totalQuestionNum: [], // 总大题
          userName: '', // 学生姓名
          identifyCode: '', // 学号
          ipAddress: ipAddr, // 用户IP
          paperName: '', // 试卷名称
          handStatus: '', // 举手状态
          tipName: '', // 当前题目名称
          answerProcess: [], // 当前进度
          monitoringStatus: 'MS_1', // 当前学生所处状态\
          accessFlag: 'auto', // 处理标准 默认auto:自动处理; manual:手动处理（如异常处理，耳机掉率）
          paperList: [],
        };
        dispatch({
          type: 'task/addLinking',
          payload: {
            students: testStudent,
          },
        });
      }
      // 发送给学生时间同步
      // 可获得当前已连接的学生IP改变对应ip的状态
      const data = {
        timestamp: timeStart,
      };
      sendMS('time:global', data, connID);
    }
    if (res && res.command === 'commandstatus' && currentStep !== 3) {
      // 接收到学生端请求指令返回学生当前的操作状态
      // "01" //登录
      // "02" //身份确认
      // "03" //放录音检测
      // "04" //练习/考试开始
      // "05" //练习/考试结束
      const currentStatus = currentStep;
      if (that.props.taskPaperIdList.length === 0) {
        const data = {
          ipAddr: studentNew.ipAddr,
          commandOperationFlag: '00',
          taskId: that.props.taskId,
          description: that.props.name,
          paperpolicy: that.props.examType,
        };
        sendMS('commandstatus:return', data, connID);
      } else if (currentStatus === 1) {
        const data = {
          ipAddr: studentNew.ipAddr,
          commandOperationFlag: type === 'TT_2' ? '00' : '01',
          taskId: that.props.taskId,
          description: that.props.name,
          paperpolicy: that.props.examType,
        };
        sendMS('commandstatus:return', data, connID);
      } else if (currentStatus === 2) {
        const data = {
          ipAddr: studentNew.ipAddr,
          commandOperationFlag: type === 'TT_2' ? '03' : '02',
          taskId: that.props.taskId,
          description: that.props.name,
          paperpolicy: that.props.examType,
        };
        sendMS('commandstatus:return', data, connID);
      } else if (currentStatus === 3) {
        const data = {
          ipAddr: studentNew.ipAddr,
          commandOperationFlag: type === 'TT_2' ? '05' : '04',
          taskId: that.props.taskId,
          description: that.props.name,
          paperpolicy: that.props.examType,
        };
        sendMS('commandstatus:return', data, connID);
      } else {
        const data = {
          ipAddr: studentNew.ipAddr,
          commandOperationFlag: '00',
          taskId: that.props.taskId,
          description: that.props.name,
          paperpolicy: that.props.examType,
        };
        sendMS('commandstatus:return', data, connID);
      }
    }
    if (res && res.command === 'number:update' && currentStep !== 3) {
      // 修改座位号回调
      const ipAddr = studentNew.ipAddr.trim();
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].seatNo = studentNew.number;
        }
      });
      // 更新学生列表信息
      // const seatNoStu = student.filter(v=>v.seatNo!=='')
      // const seatNoStuNo = student.filter(v=>v.seatNo==='')
      // const students =(seatNoStu.sort(ownSort)).concat(seatNoStuNo)
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
      const { taskId } = that.props;
      const currentStatus = currentStep;
      let currentStatusStep = '';
      if (currentStatus === 1) {
        currentStatusStep = type === 'TT_2' ? '00' : '01';
      } else if (currentStatus === 2) {
        currentStatusStep = type === 'TT_2' ? '03' : '02';
      } else if (currentStatus === 3) {
        currentStatusStep = type === 'TT_2' ? '05' : '04';
      } else {
        currentStatusStep = '00';
      }
      // 添加保存数据缓存
      const { campusId } = that.props;
      const objects = vb.getStorageManager().get({ key: accountId });
      let currentTime;
      if (objects && objects.value !== '') {
        const strToObj = JSON.parse(objects.value);
        currentTime = strToObj.startTime;
      }
      const obj = {
        teacherAction: currentStatusStep,
        task_id: taskId,
        monitorInfo: student,
        campusId,
        startTime: currentTime,
      };
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
    }
    if (res && res.command === 'paperused' && currentStep !== 3) {
      // 接收到学生机发送的paperused指令 则将任务中的试卷列表反馈给学生机
      const data = that.props.taskPaperIdList;
      sendMS('paperused:return', data, connID);
    }
    if (res && res.command === 'disconnect' && currentStep !== 3) {
      // 学生关闭客户端或断开连接响应
      // 此时判断是哪个IP对应修改该学生的状态
      const ipAddr = studentNew.ipAddr.trim();
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          const currentStatus = currentStep;
          if (currentStatus === 0 || (currentStatus === 1 && type === 'TT_2')) {
            student.splice(index, 1);
          } else {
            student[index].monitoringStatus = 'MS_10';
          }
        }
      });
      // 更新学生列表信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    if (res && res.command === 'watchStatus' && currentStep !== 3) {
      const ipAddr = studentNew.ipAddr.trim();
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].monitoringStatus = 'MS_1';
        }
      });
      // 更新学生列表信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 学生端登录窗口 点击登录
    if (res && res.command === 'login' && currentStep !== 3) {
      const ipAddr = studentNew.ipAddr.trim();
      let loginStatus = true;
      // 学生登录连接响应
      const { taskStudentRelationVOList, taskId } = that.props;
      taskStudentRelationVOList.forEach(item => {
        if (item.examNo === studentNew.id && item.status === 'Y') {
          if (
            item.examStatus != null &&
            item.examStatus !== '' &&
            item.examStatus !== 'ES_1' &&
            taskId !== 'autoCheck'
          ) {
            loginStatus = false;
            // 账号已在在其他设备登录，请退出后再重试！ login:denied
            const params = {
              taskId: '', // 任务ID
              id: studentNew.id, // 考号
              number: studentNew.number, // 座位号
              name: '', // 姓名
              ipAddr: '', // 学生机IP
              error:
                type === 'TT_2'
                  ? formatMessage({
                      id: 'task.message.you.has.join.practice',
                      defaultMessage: '你已经参加过练习，请联系教师处理！',
                    })
                  : formatMessage({
                      id: 'task.message.you.has.join.exam',
                      defaultMessage: '您已参加过考试，请联系教师处理！',
                    }),
            };
            sendMS('login:denied', params, connID);
          } else {
            loginStatus = false;
            proxyTokenQuery(item.examNo, taskId).then(result => {
              const { data } = result;
              if (result.responseCode === '200') {
                const pre = 'student_';
                const queryIp = pre + ipAddr;
                if (
                  result.data == null ||
                  (data && data.ipAddress === queryIp) ||
                  taskId === 'autoCheck'
                ) {
                  loginStatus = false;
                  // 与本地学生列表匹配  如果匹配成功 则发送login:allow
                  const taskType = type === 'TT_2' ? 'practice' : 'exam';
                  const params = {
                    taskId: item.taskId, // 任务ID
                    id: item.examNo, // 考号
                    stuid: item.studentId, // 学生ID
                    number: studentNew.number, // 座位号
                    name: item.studentName, // 姓名
                    ipAddr, // 学生机IP
                    taskType, // 考试类型
                    classId: item.classId,
                  };
                  sendMS('login:allow', params, connID);
                  // 匹配成功则此时判断是哪个IP对应修改该学生的信息
                  const student = JSON.parse(JSON.stringify(that.props.students));
                  let studentStatus = false;
                  student.forEach((vo, index) => {
                    if (vo.ipAddress === ipAddr) {
                      studentStatus = true;
                      student[index].ipAddress = ipAddr;
                      student[index].examStatus = 'ES_1';
                      student[index].userName = item.studentName;
                      student[index].seatNo = studentNew.number;
                      student[index].identifyCode = item.examNo;
                      student[index].monitoringStatus = 'MS_2';
                      student[index].studentId = item.studentId;
                      student[index].classId = item.classId;
                      student[index].monitoringId = that.props.taskId + item.studentId;
                      student[index].examFlag = item.examFlag;
                      student[index].makeUpCount = item.makeUpCount;

                      // 更新学生信息
                      //  const seatNoStu = student.filter(v=>v.seatNo!=='')
                      //  const seatNoStuNo = student.filter(v=>v.seatNo==='')
                      //  const students =(seatNoStu.sort(ownSort)).concat(seatNoStuNo)
                      dispatch({
                        type: 'task/updateLinking',
                        payload: {
                          students: student,
                        },
                      });
                    }
                  });
                  if (!studentStatus) {
                    const testStudent = [];
                    testStudent.push({
                      monitoringId: '', // 监考ID
                      screening: dateTimes, // 场次
                      seatNo: studentNew.number, // 座位号
                      connId: connID,
                      taskId: that.props.taskId,
                      taskType: that.props.type,
                      studentId: '', // 学生ID
                      classId: '', // 班级ID
                      userName: '', // 学生姓名
                      identifyCode: '', // 学号
                      paperName: '',
                      elapsedTime: 0, // 用时
                      examStatus: 'ES_1',
                      handStatus: '', // 举手状态
                      totalQuestionNum: [], // 总大题
                      tipName: '', // 当前题目名称
                      answerProcess: [], // 当前进度
                      ipAddress: ipAddr,
                      accessFlag: 'auto', // 处理标准 默认auto:自动处理; manual:手动处理（如异常处理，耳机掉率）
                      monitoringStatus: 'MS_2', // 当前学生所处状态
                      paperList: [],
                    });

                    // 更新学生信息
                    dispatch({
                      type: 'task/addLinking',
                      payload: {
                        students: testStudent,
                      },
                    });
                  }
                } else {
                  loginStatus = false;
                  // 账号已在在其他设备登录，请退出后再重试！ login:denied
                  const params = {
                    taskId: '', // 任务ID
                    id: studentNew.id, // 考号
                    number: studentNew.number, // 座位号
                    name: '', // 姓名
                    ipAddr: '', // 学生机IP
                    error: formatMessage({
                      id: 'task.message.account.has.login.in.other.device',
                      defaultMessage: '账号已在在其他设备登录，请退出后再重试！',
                    }), // 消息
                  };
                  sendMS('login:denied', params, connID);
                }
              } else {
                message.warning(
                  formatMessage({
                    id: 'task.message.count.get.logins.list',
                    defaultMessage: '获取学生登录列表失败！',
                  })
                );
              }
            });
          }
        }
      });
      if (loginStatus && taskId !== 'autoCheck') {
        // 与本地学生列表匹配  如果匹配失败则发送 login:denied
        const current = taskStudentRelationVOList.find(vo => vo.examNo === studentNew.id);
        const params = {
          taskId: '', // 任务ID
          id: studentNew.id, // 考号
          number: studentNew.number, // 座位号
          name: '', // 姓名
          ipAddr: '', // 学生机IP
          error:
            current && current.processResult !== null && current.status === 'N'
              ? formatMessage({
                  id: 'task.message.login.allow.process.result',
                  defaultMessage: '你已被安排到其它考场进行补考，请与老师联系！',
                })
              : formatMessage({
                  id: 'task.message.cound.not.find.student.in.task.list',
                  defaultMessage: '该考号不在考生名单上，请重新输入或联系老师！',
                }), // 消息
        };
        sendMS('login:denied', params, connID);
      }
    }

    // 学生端登录成功 确认信息
    if (res && res.command === 'verification' && currentStep !== 3) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const ipAddr = studentNew.ipAddr.trim();
      const verificationStatus = studentNew.verification;
      const student = JSON.parse(JSON.stringify(that.props.students));
      if (verificationStatus === '1') {
        // 学生已确认信息
        const { taskId } = that.props;
        // taskStudentRelationVOList.forEach(item => {
        //   if (item.examNo === studentNew.id) {
        //     student.forEach((vo, index) => {
        //       if (vo.ipAddress === ipAddr) {
        //         student[index].seatNo = studentNew.number;
        //         student[index].identifyCode = studentNew.id;
        //         student[index].monitoringStatus = 'MS_3';
        //         student[index].userName = studentNew.name;
        //         student[index].examStatus = 'ES_1';
        //         student[index].studentId = item.studentId;
        //         student[index].classId = item.classId;
        //         student[index].monitoringId = that.props.taskId + item.studentId;
        //         student[index].examFlag = item.examFlag;
        //         student[index].makeUpCount = item.makeUpCount;
        //       }
        //     });
        //   }
        // });

        // 添加保存数据缓存
        if (type === 'TT_2') {
          const { campusId } = that.props;
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
          vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
        }
        // 更新学生信息
        // const seatNoStu = student.filter(vo=>vo.seatNo!=='')
        // const seatNoStuNo = student.filter(vo=>vo.seatNo==='')
        // const students =(seatNoStu.sort(ownSort)).concat(seatNoStuNo)
      } else {
        // 为0时则 清除学生信息
        student.forEach((vo, index) => {
          if (vo.ipAddress === ipAddr) {
            student[index].seatNo = '';
            student[index].identifyCode = '';
            student[index].monitoringStatus = 'MS_1';
            student[index].userName = '';
            student[index].examStatus = 'ES_1';
            student[index].studentId = '';
            student[index].classId = '';
            student[index].monitoringId = '';
            student[index].examFlag = '';
            student[index].makeUpCount = '';
          }
        });
      }
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 学生端耳机掉落
    if (res && res.command === 'student:examstatus') {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].monitoringStatus = 'MS_12';
          student[index].examStatus = 'ES_3';
          student[index].accessFlag = 'manual';
          student[index].monitoringDesc = 'ES_6';
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 试卷下载状态变化
    if (
      res &&
      res.command === 'paper:down' &&
      ((currentStep !== 3 && currentStep !== 2) || (type === 'TT_2' && currentStep !== 3))
    ) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      const downLoadStatus = studentNew.status;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      const taskPaperList = that.props.taskPaperIdList;
      const currentPapaer = taskPaperList.find(vo => vo.paperId === studentNew.paperId);
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          if (downLoadStatus === true) {
            student[index].examStatus = type === 'TT_2' ? 'ES_2' : 'ES_1';
            student[index].monitoringStatus = type === 'TT_2' ? 'MS_8' : 'MS_6';
            student[index].paperName = studentNew.paperName;
            student[index].snapshotId = studentNew.paperId;
            student[index].totalQuestionNum = studentNew.instanceList;
            student[index].fullMark = (currentPapaer && currentPapaer.fullMark) || '';
            student[index].paperTime = (currentPapaer && currentPapaer.paperTime) || '';
            student[index].questionPointCount =
              (currentPapaer && currentPapaer.questionPointCount) || '';
            student[index].answerProcess = [];
          } else {
            student[index].monitoringStatus = 'MS_7';
            student[index].paperName = '';
            student[index].snapshotId = '';
            student[index].totalQuestionNum = [];
            student[index].answerProcess = [];
            student[index].fullMark = '';
            student[index].paperTime = '';
            student[index].questionPointCount = '';
          }
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 放音录音测试
    if (
      res &&
      res.command === 'check:wavein' &&
      ((currentStep !== 3 && currentStep !== 2) || (type === 'TT_2' && currentStep !== 3))
    ) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      const waveinStatus = studentNew.result;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          if (waveinStatus === 2) {
            student[index].monitoringStatus = 'MS_5';
            // student[index].examStatus ='ES_3'
          } else if (waveinStatus === 1) {
            student[index].monitoringStatus = 'MS_4';
            student[index].playVolume = studentNew.playVolume;
            student[index].recordVolume = studentNew.recordVolume;
            student[index].checkResult = studentNew.checkResult || '';
            student[index].recordMax = studentNew.recordMax || '';
            student[index].recordAvg = studentNew.recordAvg || '';
          }
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 放音录音测试
    if (
      res &&
      res.command === 'check:waveout' &&
      ((currentStep !== 3 && currentStep !== 2) || (type === 'TT_2' && currentStep !== 3))
    ) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      const waveoutStatus = studentNew.result;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          if (waveoutStatus === 2) {
            student[index].monitoringStatus = 'MS_5';
            // student[index].examStatus ='ES_3'
          } else if (waveoutStatus === 1) {
            student[index].monitoringStatus = 'MS_4';
          }
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 学生举手
    if (res && res.command === 'help') {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].handStatus = 1;
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 学生开始考试
    if (res && res.command === 'progress' && currentStep !== 3) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].tipName = studentNew.description;
          student[index].answerProcess = studentNew.answerNum;
          student[index].paperId = studentNew.paperId;
          student[index].paperName = studentNew.paperName;
          student[index].totalQuestionNum = studentNew.instanceList;
          console.log(student);
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 学生答题完成
    if (res && res.command === 'complete' && currentStep !== 3) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].answerProcess = 'complete';
          student[index].monitoringStatus =
            student[index].monitoringStatus === 'MS_11' ? student[index].monitoringStatus : 'MS_9';
          student[index].paperId = studentNew.paperId;
          student[index].paperName = studentNew.paperName;
          student[index].elapsedTime = studentNew.duration;
        }
      });
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
    // 回收答案包
    if (res && res.command === 'recycle:reply') {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr } = studentNew;
      const recycleStatus = studentNew.result;
      const { taskPaperIdList, students: propsStudents } = that.props;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(propsStudents));
      // 获取相应的试卷信息(原始信息)
      const paperObj = taskPaperIdList.find(item => item.snapshotId === studentNew.paperid) || {};
      let studentId = '';
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          // eslint-disable-next-line prefer-destructuring
          studentId = item.studentId;
          const papers = item.paperList || [];
          // 获取是否已经在现用的监听试卷列表中了
          const paperIndex = papers.findIndex(tag => tag.snapshotId === studentNew.paperid);

          student[index].snapshotId = studentNew.paperid; // 试卷快照ID
          student[index].respondentsStatus = recycleStatus; // 答卷包状态

          if (recycleStatus === 2) {
            // 打包失败

            student[index].monitoringStatus = 'MS_15';
            student[index].respondentsStatus = 'RS_2';
            student[index].monitoringDesc = 'ES_5';
            // 判断该试卷是否已经在监听试卷列表中
            if (paperIndex >= 0) {
              student[index].paperList[paperIndex].respondentsStatus = 'RS_3';
            } else {
              const paperInfo = {
                answerProcess: student[index].answerProcess, // "答题进度"
                elapsedTime: 0, // "用时"
                fileCount: '', // "答卷包文件数"
                isDeleted: 0, // "删除标记"
                needFileCount: '', // "待打包文件数"
                paperName: paperObj.name, // "试卷名称"
                respondentsMd5: '', // "0字节文件数"
                respondentsName: '', // "答卷包名称"
                respondentsStatus: 'RS_3', // "答卷包状态"
                snapshotId: paperObj.snapshotId, // "试卷快照ID"
                zeroCount: '', // "0字节文件数"
                upLoadStatus: 0,
              };
              student[index].paperList = [...papers, paperInfo];
            }
          } else if (recycleStatus === 3) {
            // 上传答案包失败
            const paper = studentNew.respondentsObject.respondentsObject;
            student[index].monitoringStatus = 'MS_13';
            student[index].respondentsStatus = 'RS_2';
            student[index].monitoringDesc = 'ES_5';

            // 判断该试卷是否已经在监听试卷列表中
            if (paperIndex >= 0) {
              student[index].paperList[paperIndex].respondentsStatus = 'RS_4';
            } else {
              const paperInfo = {
                answerProcess: student[index].answerProcess, // "答题进度"
                elapsedTime: paper.duration, // "用时"
                fileCount: '', // "答卷包文件数"
                isDeleted: 0, // "删除标记"
                needFileCount: '', // "待打包文件数"
                paperName: paperObj.name, // "试卷名称"
                respondentsMd5: '', // "0字节文件数"
                respondentsName: '', // "答卷包名称"
                respondentsStatus: 'RS_4', // "答卷包状态"
                snapshotId: paperObj.snapshotId, // "试卷快照ID"
                zeroCount: '', // "0字节文件数"
                upLoadStatus: paper.upLoadStatus, // 上传状态
                fullMark: paper.fullMark, // 总分
                paperTime: paper.paperTime, // 时长
                questionPointCount: paper.questionPointCount || 0, // 小题数
                score: paper.score, // 得分
                responseQuestionCount: paper.responseQuestionCount || 0, // 答题数
              };
              console.log(papers);
              student[index].paperList = [...papers, paperInfo];
            }
          } else if (recycleStatus === 1) {
            // 回收答案包成功  考试成功

            // 如果是练习，则本次练习结束，如果是考试则 任务完成
            const paper = studentNew.respondentsObject.respondentsObject;
            student[index].monitoringStatus = type === 'TT_2' ? 'MS_16' : 'MS_14';
            student[index].respondentsStatus = paper.respondentsStatus || 'RS_1';
            if (student[index].accessFlag === 'auto') {
              student[index].examStatus = paper.respondentsStatus ? 'ES_3' : 'ES_4';
            }
            if (paper.respondentsStatus && student[index].accessFlag === 'auto') {
              student[index].monitoringDesc = paper.respondentsStatus === 'RS_5' ? 'ES_7' : 'ES_8';
            }

            // 判断该试卷是否已经在监听试卷列表中
            if (paperIndex >= 0) {
              const paperInfo = {
                ...student[index].paperList[paperIndex],
                respondentsStatus: paper.respondentsStatus || 'RS_1',
                fileCount: paper.fileCount, // "答卷包文件数"
                needFileCount: paper.needFileCount, // "待打包文件数"
                respondentsMd5: paper.respondentsMd5, // "0字节文件数"
                respondentsName: paper.paperName, // "答卷包名称"
                zeroCount: paper.zeroCount, // "0字节文件数"
                paperName: paperObj.name,
                upLoadStatus: paper.upLoadStatus, // 上传状态
                fullMark: paper.fullMark, // 总分
                paperTime: paper.paperTime, // 时长
                questionPointCount: paper.questionPointCount || 0, // 小题数
                score: paper.score, // 得分
                responseQuestionCount: paper.responseQuestionCount || 0, // 答题数
              };
              student[index].paperList.splice(paperIndex, 1, paperInfo);
            } else {
              const paperInfo = {
                answerProcess: student[index].answerProcess, // "答题进度"
                elapsedTime: paper.duration, // "用时"
                fileCount: paper.fileCount, // "答卷包文件数"
                isDeleted: 0, // "删除标记"
                needFileCount: paper.needFileCount, // "待打包文件数"
                paperName: paperObj.name, // "试卷名称"
                respondentsMd5: paper.respondentsMd5, // "0字节文件数"
                respondentsName: paper.paperName, // "答卷包名称"
                respondentsStatus: paper.respondentsStatus || 'RS_1', // "答卷包状态"
                snapshotId: paperObj.snapshotId, // "试卷快照ID"
                zeroCount: paper.zeroCount, // "0字节文件数"
                upLoadStatus: paper.upLoadStatus, // 上传状态
                fullMark: paper.fullMark, // 总分
                paperTime: paper.paperTime, // 时长
                questionPointCount: paper.questionPointCount || 0, // 小题数
                score: paper.score, // 得分
                responseQuestionCount: paper.responseQuestionCount || 0, // 答题数
              };
              student[index].paperList = [...papers, paperInfo];
            }
          }
        }
      });
      console.log(student);
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });

      // 如果是 练习模式， 并且已经结束了 答题，则提交监控数据到后台
      if (currentStep === 3 && studentId) {
        dispatch({
          type: 'task/updateTaskWatchResult',
          payload: { studentId },
        });
      }
    }
    // 教师机发送开始考试指令，如何确保学生机是否收到的异常处理
    if (res && res.command === 'student:status' && currentStep !== 3) {
      // 匹配成功则此时判断是哪个IP对应修改该学生的信息
      const { ipAddr, monitorStatus, answerProcess } = studentNew;
      const { taskPaperIdList } = that.props;
      // 学生已确认信息
      const student = JSON.parse(JSON.stringify(that.props.students));
      student.forEach((item, index) => {
        if (item.ipAddress === ipAddr) {
          student[index].connId = connID;
          if (type === 'TT_2') {
            const paper = studentNew.respondentsObject || [];
            console.log(studentNew.respondentsObject);
            const paperInfo = [];
            paper.forEach(elements => {
              const paperObj =
                taskPaperIdList.find(tag => tag.snapshotId === elements.paperid) || {};
              if (elements.result !== 2) {
                const respondent = elements.respondentsObject.respondentsObject;
                paperInfo.push({
                  // "answerProcess": student[index].answerProcess,// "答题进度"
                  elapsedTime: respondent.duration, // "用时"
                  fileCount: respondent.fileCount, // "答卷包文件数"
                  isDeleted: 0, // "删除标记"
                  needFileCount: respondent.needFileCount, // "待打包文件数"
                  paperName: paperObj.name, // "试卷名称"
                  respondentsMd5: respondent.respondentsMd5, // "0字节文件数"
                  respondentsName: respondent.paperName, // "答卷包名称"
                  respondentsStatus:
                    elements.result === 1 ? respondent.respondentsStatus || 'RS_1' : 'RS_4', // "答卷包状态"
                  snapshotId: elements.paperid, // "试卷快照ID"
                  zeroCount: respondent.zeroCount, // "0字节文件数"
                  upLoadStatus: respondent.upLoadStatus, // 上传状态
                  fullMark: respondent.fullMark, // 总分
                  paperTime: respondent.paperTime, // 时长
                  questionPointCount: respondent.questionPointCount || 0, // 小题数
                  score: respondent.score, // 得分
                  responseQuestionCount: respondent.responseQuestionCount || 0, // 答题数
                });
                console.log(paperInfo);
              } else {
                paperInfo.push({
                  // "answerProcess": student[index].answerProcess,// "答题进度"
                  elapsedTime: 0, // "用时"
                  fileCount: '', // "答卷包文件数"
                  isDeleted: 0, // "删除标记"
                  needFileCount: '', // "待打包文件数"
                  paperName: paperObj.name, // "试卷名称"
                  respondentsMd5: '', // "0字节文件数"
                  respondentsName: '', // "答卷包名称"
                  respondentsStatus: 'RS_3', // "答卷包状态"
                  snapshotId: elements.paperid, // "试卷快照ID"
                  zeroCount: '', // "0字节文件数"
                  upLoadStatus: 0,
                });
              }
            });
            student[index].paperList = paperInfo;
          }
          if (monitorStatus === 'MS_3') {
            // 重新检测
            student[index].monitoringStatus = monitorStatus || student[index].monitoringStatus;
          } else if (answerProcess === 'complete') {
            student[index].answerProcess = 'complete';
            const exam =
              type === 'TT_2' &&
              (monitorStatus !== 'MS_1' &&
                monitorStatus !== 'MS_2' &&
                monitorStatus !== 'MS_3' &&
                monitorStatus !== 'MS_4' &&
                monitorStatus !== 'MS_5' &&
                monitorStatus !== 'MS_7')
                ? 'ES_2'
                : student[index].examStatus;
            student[index].examStatus = monitorStatus === 'MS_12' ? 'ES_3' : exam;
            student[index].monitoringStatus = monitorStatus || 'MS_9';
            student[index].elapsedTime = studentNew.duration;
          } else {
            const exam =
              type === 'TT_2' &&
              (monitorStatus !== 'MS_1' &&
                monitorStatus !== 'MS_2' &&
                monitorStatus !== 'MS_3' &&
                monitorStatus !== 'MS_4' &&
                monitorStatus !== 'MS_5' &&
                monitorStatus !== 'MS_7')
                ? 'ES_2'
                : student[index].examStatus;
            student[index].examStatus = monitorStatus === 'MS_12' ? 'ES_3' : exam;
            student[index].monitoringStatus = monitorStatus || student[index].monitoringStatus;
            student[index].tipName = studentNew.description || '';
            student[index].answerProcess = studentNew.answerNum;
            student[index].totalQuestionNum = studentNew.instanceList;
          }
        }
      });
      console.log(student);
      // 更新学生信息
      dispatch({
        type: 'task/updateLinking',
        payload: {
          students: student,
        },
      });
    }
  }
}
