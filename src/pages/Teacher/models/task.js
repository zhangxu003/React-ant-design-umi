// 任务相关的数据设置

// 教师相关modal处理
import {
  getTaskInfo, // 获取任务详情
  updateStudentTaskStatus, // 更新任务状态
  queryDistribution,
  saveExamResult, // proxy-104 提交监控数据
  batchTask, // 记录任务场次
  timeStamp, // 获取队列-已处理学生答卷的最新时间戳
  exerciseResult,
  exerciseBuild,
  exerciseStatus,
  batchesStudentCount,
  getDistrictDetail,
  getSubDistrictData,
  repeatTest,
  getExamPlaceInfo,
  getRegisterStudentInfo,
  getStartTasks,
  registrationInfo,
  proxyTokenDelete,
} from '@/services/teacher';
import router from 'umi/router';
import { sendM, sendMS } from '@/utils/instructions';
import { ownSortAdd } from '../Task/Watch/watching';
import { delay } from '@/utils/utils';

const { vb } = window;

export default {
  namespace: 'task',

  state: {
    // 当前考试学生列表
    students: [
      // {
      //  monitoringId: "string",//"监考ID"
      //  screening: "string",//"场次"
      //  studentId :''//学生ID
      //  examStatus:''//考试状态  考试成功  考试失败  正在考试
      //  classId :'', //班级ID
      //  snapshotId ：'', //当前试卷快照ID
      //  connId:'',
      //  elapsedTime:'', //"用时"
      //  taskId: "string",//"任务ID"
      //  taskType: "string",//"任务类型"
      //  seatNo:'01',         // 座位号
      //  userName:'我是学生01',           // 学生姓名
      //  identifyCode:'0101',         // 考号
      //  ipAddress:  "10.17.9.26",           // res.ipAddr,
      //  paperName:'我是试卷01',          // 试卷名称
      //  tipName:'打的费',            // 显示浮层 当前用户当前答到哪题
      //  answerProcess:'',           // 进度条
      //  handStatus: 1,         // 是否举手
      //  totalQuestionNum: 3,   // 试卷共多少大题
      //  monitoringStatus:0 ,             // 监考状态 当前学生所处状态（）（考试，练习通用）
      //  monitoringDesc : "作弊",           // 考试状态异常的原因，老师输入内容（ 考试专用 ）
      //  paperNum : [],         // 练习试卷数量（练习专用）
      //  packageStatus : '',    // 答题包状态（对应字典表：respondentStatus）
      //  paperList:''//试卷包列表
      // },
      // {
      //   "paperList": [
      //     {
      //       "answerProcess": "string",//"答题进度"
      //       "elapsedTime": 0,//"试卷用时"
      //       "fileCount": 0,//"答卷包文件数"
      //       "isDeleted": 0,//"删除标记"
      //       "needFileCount": 0,//"待打包文件数"
      //       "paperName": "string",//"试卷名称"
      //       "respondentsMd5": "string",//"0字节文件数"
      //       "respondentsName": "string",//"答卷包名称"
      //       "respondentsStatus": "string",//"答卷包状态"
      //       "snapshotId": "string",//"试卷快照ID"
      //       "zeroCount": 0//"0字节文件数"
      // "upLoadStatus":respondent.upLoadStatus,                   // 上传状态
      // "fullMark":respondent.fullMark,                           // 总分
      // "paperTime":respondent.paperTime,                         // 答题用时
      // "questionPointCount":respondent.questionPointCount||0,       // 小题数
      // "score":respondent.score,                                 // 得分
      // "responseQuestionCount":respondent.responseQuestionCount||0, // 答题数
      //     }
      //   ],
      //   "isDeleted": 0,// "删除标记"
      //    playVolume:"耳机音量",
      //    recordVolume:"MIC音量",
      //    checkResult:"检测结果",
      //    recordMax:"录音音量峰值",
      //    recordAvg:"录音音量平均值",
      //   "respondentsStatus": "string",//"答卷包状态"
      //   "accessFlag" : "auto",    // 处理标准 默认auto:自动处理; manual:手动处理（如异常处理，耳机掉率）
      // }
      // {
      //   studentId         : "111",
      //   examStatus        : "ES_3",
      //   monitoringDesc    : "作弊",
      //   respondentsStatus : "RS_2",
      // }
    ],
    examStatus: [
      // {
      //     "type_code": "EXAMMONITORSTATUS",
      //     "code": "MS_1",
      //     "value": "已连接",
      //     "sequence": "10"
      // }
    ], // 考试状态
    closeStatus: 1,
    // 任务详情信息
    taskInfo: {
      startTime: '', // 任务开始时间
      taskPaperIdList: [], // 试卷 ,
      taskStudentRelationVOList: [
        // {
        //   classId     : "31508840008646656"
        //   gender      : 性别
        //   className   : "一年级一班"
        //   classType   : "NATURAL_CLASS"
        //   examNo      : "00103",
        //   status      : "Y":"N"        // 是否参加任务
        //   examStatus :                 // 学生状态（对应字典表：练习 studentExerciseStatus, 考试 studentExamsStatus）
        //   studentId   : "31509008586113024"
        //   studentName : null
        //   新增字段↓↓
        //   ipAddress   : ip地址
        //   seatNo      : 座位号
        //   monitoringDesc : 监考异常原因
        // }
      ], // 学生 ,
      distributeType: '', // 分发方式 ,
      examType: '', // 考试策略 ,
      taskId: '', // 任务ID ,
      type: '', // 任务的类型（TT_1,TT_2,TT_3）（对应字典表：taskType）
      name: '', // 任务名称 ,
      classList: [], // 班级列表
      status: '', // 任务的状态（未开始，进行中。。。）
      endTime: '', // 一键检测 考试结束时间
      taskStatus: '', // 考试状态 connect : 准备阶段（未开始） ready : 开始登录   play : 开始任务   stop : 任务结束
    },
    examPlaceInfo: {},
    examPlaceDetail: {}, // 现场报名信息
    showDrawer: false, // 是否显示学生总数详情
    examPlaceTasksDetail: [],
    registerStudentInfo: [],
    showNewModal: false, // 是否显示新增学生列表弹窗
    copyStudents: [], // 用于结束任务以后的固化数据，暂时只适用于 一键检测报告
    filterStudents: [], // 用于保存切换tab后 当前tab的数据
    conditions: '', // 用于tab切换时保存当前的筛选条件
    countTime: 0, // 已考时间计时器
  },

  effects: {
    // 记录场次
    *saveBatch({ payload, callback }, { call, select }) {
      const {
        userInfo: { teacherName, teacherList },
      } = yield select(state => state.teacher);
      const {
        taskInfo: { taskId, campusId },
      } = yield select(state => state.task);
      const { ipAddress } = yield select(state => state.vbClient);
      const { teacherId } = teacherList.find(item => item.campusId === campusId) || {};
      const params = {
        taskId,
        batchNo: ipAddress,
        teacherId: taskId === 'autoCheck' ? 'autocheck' : teacherId,
        teacherName,
        status: payload.status,
      };
      const { responseCode } = yield call(batchTask, { ...params, ...payload });
      if (callback) {
        callback(responseCode);
      }
    },
    // 保存结束考试时间戳
    *saveEndTime({ payload }, { put }) {
      yield put({
        type: 'saveTestEndTime',
        payload,
      });
    },
    // 已连接的学生列表
    *addLinking({ payload }, { put }) {
      yield put({
        type: 'saveStudent',
        payload,
      });
    },

    // 更新已连接的学生列表
    *updateLinking({ payload }, { put }) {
      yield put({
        type: 'updateStudent',
        payload,
      });
    },

    *updateClose({ payload }, { put }) {
      yield put({
        type: 'updateCloseStatus',
        payload,
      });
    },
    *updateDrawer({ payload }, { put }) {
      yield put({
        type: 'updateDrawerStatus',
        payload,
      });
    },
    // 学生发送给教师机 获取ip地址
    *changeStudentIp(data, { put }) {
      console.log('=============', data);
      data.callBack(1111);
      yield put({
        type: 'changeStudentIp111',
        data,
      });
    },

    // 任务及任务信息
    *getTaskById({ payload, callback }, { select, call, put }) {
      let data;
      try {
        ({ data } = yield call(getTaskInfo, payload));
      } catch (e) {
        if (e.next) {
          e.next();
        }
        yield call(delay, 1000);
        window.history.back();
        return;
      }
      // 获取到任务信息后 将已连接的学生加到列表里
      // 获取上次未完成的考试任务
      const { accountId } = yield select(state => state.teacher.userInfo);
      const obj = vb.getStorageManager().get({ key: accountId });
      console.log(obj);
      const { type, taskId } = data;
      // 获取当前已经打开的学生机列表
      const ipAddress = vb.getSocketManager().clients;
      const testStudent = [];
      ipAddress.forEach(item => {
        const connID = item.connId;
        const myDate = new Date();
        const dateTimes = myDate.getFullYear() + (myDate.getMonth() + 1) + myDate.getDate();
        const currentStudent = testStudent.find(vo => vo.ipAddress === item.ipAddress);
        if (!currentStudent && taskId !== '') {
          testStudent.push({
            monitoringId: '', // 监考ID
            screening: dateTimes, // 场次
            seatNo: '', // 座位号
            connId: connID,
            elapsedTime: 0, // 用时
            examStatus: 'ES_1', // 考试状态
            taskId,
            taskType: type,
            studentId: '', // 学生ID
            classId: '', // 班级ID
            totalQuestionNum: [], // 总大题
            userName: '', // 学生姓名
            identifyCode: '', // 学号
            ipAddress: item.ipAddress, // 用户IP
            paperName: '', // 试卷名称
            handStatus: '', // 举手状态
            tipName: '', // 当前题目名称
            answerProcess: [], // 当前进度
            monitoringStatus: 'MS_1', // 当前学生所处状态
            accessFlag: 'auto', // 处理标准 默认auto:自动处理; manual:手动处理（如异常处理，耳机掉率）
            paperList: [],
          });
        }
      });
      console.log(obj);
      if (obj && obj.value !== '') {
        const strToObj = JSON.parse(obj.value);
        if (strToObj.monitorInfo && strToObj.monitorInfo.length > 0) {
          console.log(strToObj);
          yield put({
            type: 'saveStudent',
            payload: {
              students: strToObj.monitorInfo,
            },
          });
          const ipAddrList = [];
          strToObj.monitorInfo.forEach(item => {
            ipAddrList.push(`student_${item.ipAddress}`);
          });
          if (strToObj.teacherAction === '01') {
            sendM('clean', '');
            yield call(proxyTokenDelete, ipAddrList);
            const dataObj = {
              ipAddr: '',
              commandOperationFlag: '01',
              taskId,
            };
            sendM('commandstatus:return', dataObj);
            router.push(`/teacher/task/${taskId}/watch/step2`);
          }
          if (strToObj.teacherAction === '02') {
            router.push(`/teacher/task/${taskId}/watch/step3`);
          }
          if (strToObj.teacherAction === '03') {
            router.push(`/teacher/task/${taskId}/watch/step3`);
          }
          if (strToObj.startTime) {
            const current = new Date().getTime();
            const date3 = current - strToObj.startTime;
            yield put({
              type: 'addPaperTime',
              payload: {
                countTime: Math.floor(date3 / 1000),
              },
            });
          }
        } else {
          sendM('clean', '');
          yield put({
            type: 'saveStudent',
            payload: {
              students: testStudent,
            },
          });
        }
      } else {
        // sendM('clean', '');
        yield put({
          type: 'saveStudent',
          payload: {
            students: testStudent,
          },
        });
      }
      // end
      // 添加任务的开始时间
      data.startTime = Date.now();

      // 保存数据前，对教室列表进行排序(根据 classIndex 排序 )
      data.classList.sort((a, b) => {
        const aVal = a.classIndex ? a.classIndex : a.className;
        const bVal = b.classIndex ? b.classIndex : b.className;
        return (aVal || '').localeCompare(bVal || '');
      });

      yield put({
        type: 'saveTaskInfo',
        payload: data,
      });
      if (callback) {
        callback(data);
      }
    },

    /**
     * 接口逻辑
     * 教师机--任务列表页--获取任务列表详情数据
     * PROXY-402根据状态、类型、时间、教师ID、教师任课班级查询任务
     * @param {*} param0
     * @param {*} param1
     */

    *getDistrictListDetail({ payload }, { call, put }) {
      const params = { ...payload };

      const { data, responseCode } = yield call(getDistrictDetail, params);
      if (responseCode !== '200' || data == null) return;

      yield put({
        type: 'saveTaskInfo',
        payload: data,
      });
    },

    /**
     *POST /proxy/ue/task
      TSMK-751: 获取指定考点中(校)任务所属学校班级考点信息
     * @param {*} param0
     * @param {*} param1
     */

    *getExamPlaceDetail({ payload }, { call, put }) {
      const params = { ...payload };
      const { data, responseCode } = yield call(getExamPlaceInfo, params);
      if (responseCode !== '200' || data == null) return;

      yield put({
        type: 'saveExamPlaceDetail',
        payload: data,
      });
    },

    /**
      POST /proxy/ue/not-started-tasks
       TSMK-756: 获取指定中(校)任务中未开始的子任务数据
     * @param {*} param0
     * @param {*} param1
     */
    *getStartTasksDetail({ payload }, { call, put }) {
      const params = { ...payload };
      const { data, responseCode } = yield call(getStartTasks, params);
      if (responseCode !== '200' || data == null) return;

      yield put({
        type: 'saveStartTasksDetail',
        payload: data,
      });
    },

    /**
     *POST /ue/task/students
      TSMK-752: 获取指定中(校)任务任务、班级的学生清单
     * @param {*} param0
     * @param {*} param1
     */

    *getRegisterStudentDetail({ payload }, { call, put }) {
      const params = { ...payload };
      const { data, responseCode } = yield call(getRegisterStudentInfo, params);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveRegisterStudentInfo',
        payload: data,
      });
    },

    /**
      TSMK-754: 现场报名
     * @param {*} param0
     * @param {*} param1
     */

    // eslint-disable-next-line consistent-return
    *getRegistrationInfo({ payload }, { call }) {
      const params = { ...payload };

      // if (responseCode !== '200' || data == null) return;
      try {
        // eslint-disable-next-line no-unused-vars
        const { data, responseCode } = yield call(registrationInfo, params);
        return {
          data: 'SUCCESS',
          message: data,
        };
      } catch (e) {
        const { type, message, next, status } = e;
        if (type === 'server') {
          if (status === 460) {
            return {
              data: 'FAIL',
              message,
            };
          }
          next();
        }
      }
    },

    /**
     *POST /proxy/ue/tasks
      TSMK-757: 获取指定子任务状态以及中(校)任务下未开始子任务数据
     * @param {*} param0
     * @param {*} param1
     */

    *getSubDistrict({ payload }, { call, put }) {
      const params = { ...payload };
      const { data, responseCode } = yield call(getSubDistrictData, params);
      if (responseCode !== '200' || data == null) return;

      yield put({
        type: 'saveExamPlaceInfo',
        payload: data,
      });
    },

    /**
     *POST /proxy/ue/tasks
      TSMK-757: 获取指定子任务状态以及中(校)任务下未开始子任务数据
     * @param {*} param0
     * @param {*} param1
     */

    // eslint-disable-next-line consistent-return
    *getRepeatTestData({ payload }, { call, put, select }) {
      const params = { ...payload };
      const { examPlaceValue } = params;
      delete params.examPlaceValue;
      try {
        // eslint-disable-next-line no-unused-vars
        const { data, responseCode } = yield call(repeatTest, params);
        // 判断当前任务状态是否已经完成
        const {
          // eslint-disable-next-line no-unused-vars
          taskInfo: { taskId, taskStudentRelationVOList, status },
          students,
        } = yield select(state => state.task);
        const student = taskStudentRelationVOList.find(
          item => item.studentId === payload.studentInfo.studentId
        );
        const watchStudent = students.find(
          item => item.studentId === payload.studentInfo.studentId
        );

        const studentInfo = watchStudent || student || {};

        const examFlag = studentInfo.examFlag || '';
        const makeUpCount = studentInfo.makeUpCount || 0;
        // 更新任务全部用户的数据信息
        yield put({
          type: 'updateStudentTaskData',
          payload: {
            studentId: params.studentInfo.studentId,
            status: examPlaceValue === '1' ? 'Y' : 'N',
            examStatus: 'ES_1',
            examFlag:
              examPlaceValue === '1' && !examFlag.includes('MAKE_UP_EXAM')
                ? `${examFlag},MAKE_UP_EXAM`
                : examFlag,
            makeUpCount: Number(makeUpCount) + 1,
            seatNo: studentInfo.seatNo || '', // 清空座位号
            respondentsStatus: '', // 打包结构
            ipAddress: studentInfo.ipAddress || '', // 清空ip
            monitoringDesc: '', // 清空原因,
            respondentsList: [], // 清空试卷
            processResult:
              examPlaceValue === '1' ? '安排到 当前批次|考场' : `安排到${params.subTaskName}`,
            loading: false,
          },
        });

        // 删除指定的监控数据
        if (watchStudent) {
          // 重置学生机 item.ipAddress,item.connId
          sendMS('clean', { ipAddr: watchStudent.ipAddress }, watchStudent.connId);
          // 重新考试重新练习  直接删掉监控数据中此学生记录
          // yield put({
          //   type: 'delStudentWatchData',
          //   payload: {
          //     studentId: params.studentInfo.studentId,
          //   },
          // });
          students.forEach((vo, index) => {
            if (vo.ipAddress === watchStudent.ipAddress) {
              students[index].seatNo = '';
              students[index].identifyCode = '';
              students[index].monitoringStatus = 'MS_1';
              students[index].userName = '';
              students[index].examStatus = 'ES_1';
              students[index].studentId = '';
              students[index].classId = '';
              students[index].monitoringId = '';
              students[index].examFlag = '';
              students[index].makeUpCount = '';
              students[index].tipName = '';
              students[index].taskType = '';
              students[index].connId = '';
              students[index].handStatus = '';
              students[index].paperName = '';
              students[index].answerProcess = [];
              students[index].totalQuestionNum = [];
              students[index].paperList = [];
              students[index].elapsedTime = 0;
              students[index].respondentsStatus = '';
              students[index].snapshotId = '';
              students[index].paperId = '';
              students[index].taskId = '';
            }
          });
          yield put({
            type: 'task/updateLinking',
            payload: {
              students,
            },
          });
        }

        return {
          data: 'SUCCESS',
        };
      } catch (e) {
        const { type, next, status, message } = e;
        if (type === 'server') {
          if (status === 460) {
            return {
              data: 'FAIL',
              message,
            };
          }
          next();
        }
      }
    },

    // 考试状态字典
    *queryExamStatus({ payload }, { call, put }) {
      const { responseCode, data } = yield call(queryDistribution, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveExamStatus',
        payload: {
          examStatus: data,
        },
      });
    },

    // 更新考试练习任务学生状态 ( 参加考试，或重新考试 )
    *updateStudentTaskStatus({ payload }, { call, put, select }) {
      // 判断当前任务状态是否已经完成
      const {
        taskInfo: { taskId, taskStudentRelationVOList, status },
        students,
      } = yield select(state => state.task);

      const student = taskStudentRelationVOList.find(item => item.studentId === payload);
      const watchStudent = students.find(item => item.studentId === payload);

      const studentInfo = watchStudent || student || {};

      const params = {
        taskId, // 任务id
        status, // 任务状态
        taskStudentStatusList: [],
      };
      params.taskStudentStatusList.push({
        classId: student.classId, // 教室id
        studentId: student.studentId, // 学生id
        examNo: student.examNo, // 考号
        seatNo: studentInfo.seatNo || '', // 清空座位号
        ipAddress: studentInfo.ipAddress || '', // 清空ip
        monitoringDesc: '', // 清空原因
        respondentsStatus: '', // 打包结构
        paperList: [], // 清空试卷
        status: 'Y', // 是否参加考试
        examStatus: 'ES_1', // 考试的状态
        respondentsInValid: 1, // 是否将线上已有的监控数据设置为无效
      });

      // 设置该数据为loading状态，方便用户状态控制
      yield put({
        type: 'updateStudentTaskData',
        payload: {
          studentId: student.studentId,
          loading: true,
        },
      });

      yield call(updateStudentTaskStatus, params);

      // 更新任务全部用户的数据信息
      yield put({
        type: 'updateStudentTaskData',
        payload: {
          studentId: student.studentId,
          status: 'Y',
          examStatus: 'ES_1',
          seatNo: studentInfo.seatNo || '', // 清空座位号
          respondentsStatus: '', // 打包结构
          ipAddress: studentInfo.ipAddress || '', // 清空ip
          monitoringDesc: '', // 清空原因,
          respondentsList: [], // 清空试卷
          loading: false,
        },
      });

      // 删除指定的监控数据
      if (watchStudent) {
        // 重置学生机 item.ipAddress,item.connId
        sendMS('clean', { ipAddr: watchStudent.ipAddress }, watchStudent.connId);
        // 重新考试重新练习  直接删掉监控数据中此学生记录
        // yield put({
        //   type: 'delStudentWatchData',
        //   payload: {
        //     studentId: student.studentId,
        //   },
        // });

        students.forEach((vo, index) => {
          if (vo.ipAddress === watchStudent.ipAddress) {
            students[index].seatNo = '';
            students[index].identifyCode = '';
            students[index].monitoringStatus = 'MS_1';
            students[index].userName = '';
            students[index].examStatus = 'ES_1';
            students[index].studentId = '';
            students[index].classId = '';
            students[index].monitoringId = '';
            students[index].examFlag = '';
            students[index].makeUpCount = '';
            students[index].tipName = '';
            students[index].taskType = '';
            students[index].connId = '';
            students[index].handStatus = '';
            students[index].paperName = '';
            students[index].answerProcess = [];
            students[index].totalQuestionNum = [];
            students[index].paperList = [];
            students[index].elapsedTime = 0;
            students[index].respondentsStatus = '';
            students[index].snapshotId = '';
            students[index].paperId = '';
            students[index].taskId = '';
          }
        });
        yield put({
          type: 'task/updateLinking',
          payload: {
            students,
          },
        });
      }
    },

    // 更新考场的监控结果104
    *updateTaskWatchResult({ payload }, { call, put, select }) {
      // 更新监控数据
      const { students } = yield select(state => state.task);
      // 判断payload是数组，还是对象，及判断要更新的监控是多个还是单个
      let params;
      if (Array.isArray(payload)) {
        params = [...payload];
      } else if (typeof payload === 'object') {
        params = [payload];
      } else {
        return;
      }
      // 更新监控数据
      const result = params
        .map(item => {
          const obj = students.find(student => student.studentId === item.studentId);
          if (obj) {
            return {
              ...obj,
              ...item,
            };
          }
          return false;
        })
        .filter(item => !!item);

      // 提交到proxy-104
      yield call(saveExamResult, result);
      yield put({
        type: 'updateStudentWatchData',
        payload: result,
      });
    },

    /**
     * @description: 将任务状态设置为已经结束
     * @param {type}
     * @return:
     */
    *stopTask({ payload }, { put }) {
      yield put({
        type: 'updateTaskInfo',
        payload: {
          taskId: payload,
          taskStatus: 'stop',
        },
      });
    },
    /**
     * @description: 获取队列-已处理学生答卷的最新时间戳
     * @param {type}
     * @return:
     */
    *getTimeStamp({ payload, callback }, { call }) {
      const response = yield call(timeStamp, payload);
      if (callback) {
        callback(response);
      }
    },

    /**
     * @description: 获取练习报告生成结果
     * @param {type}
     * @return:
     */
    *getExerciseResult({ payload, callback }, { call }) {
      const response = yield call(exerciseResult, payload);
      if (callback) {
        callback(response);
      }
    },

    /**
     * @description: 获取练习报告生成状态
     * @param {type}
     * @return:
     */
    *getExerciseStatus({ payload, callback }, { call }) {
      const response = yield call(exerciseStatus, payload);
      if (callback) {
        callback(response);
      }
    },

    /**
     * @description: 生成练习报告
     * @param {type}
     * @return:
     */
    *getExerciseBuild({ payload, callback }, { call }) {
      const response = yield call(exerciseBuild, payload);
      if (callback) {
        callback(response);
      }
    },

    *beforeEndTask({ payload }, { call }) {
      // 获取当期的监控信息
      const { responseCode, data } = yield call(batchesStudentCount, payload);
      if (responseCode !== '200') return false;
      return data;
    },

    *addPaperTime({ payload }, { put }) {
      // 更新已考时间
      yield put({
        type: 'updateDrawerStatus',
        payload,
      });
    },
  },

  reducers: {
    // 保存考试状态字典
    saveExamStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    /**
     * 保存任务详情数据
     */
    updateCloseStatus(state, action) {
      return {
        ...state,
        closeStatus: action.payload.closeStatus,
      };
    },
    /**
     * 保存显示隐藏学生总数抽屉
     */
    updateDrawerStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    // 保存已连接的学生
    saveStudent(state, action) {
      // const seatNoStu = state.students.concat(action.payload.students).filter(vo=>vo.seatNo!=='')
      // const seatNoStuNo = state.students.concat(action.payload.students).filter(vo=>vo.seatNo==='')
      // const students =(seatNoStu.sort(ownSortAdd)).concat(seatNoStuNo)
      return {
        ...state,
        students: state.students.concat(action.payload.students),
      };
    },

    // 更新已连接的学生
    updateStudent(state, action) {
      // 更新学生列表 则要更新当前过滤的学生列表信息
      const filterStudent = state.filterStudents;
      // 当当前的过滤学生列表存在此学生仅更新该学生的信息
      console.log(filterStudent);
      const studentList = filterStudent.map(item => {
        const current = action.payload.students.find(vo => vo.ipAddress === item.ipAddress);
        if (current) {
          return {
            ...item,
            ...current,
          };
        }
        return item;
      });
      console.log(studentList);
      // 当当前学生更新状态后  不存在此过滤学生列表时
      const condition = state.conditions;
      // 更新状态后 重新获取符合当前条件的tab 学生列表
      let studentAccord = [];
      console.log(condition);
      if (condition === '2') {
        studentAccord = action.payload.students.filter(vo => vo.monitoringStatus === 'MS_6');
      }
      if (condition === '3') {
        studentAccord = action.payload.students.filter(vo => vo.monitoringStatus !== 'MS_6');
      }
      if (condition === '4') {
        studentAccord = action.payload.students.filter(vo => vo.monitoringStatus === 'MS_8');
      }
      if (condition === '5') {
        studentAccord = action.payload.students.filter(
          vo => vo.monitoringStatus === 'MS_14' || vo.monitoringStatus === 'MS_16'
        );
      }
      if (condition === '6') {
        studentAccord =
          state.taskInfo.type === 'TT_2'
            ? action.payload.students.filter(data => data.monitoringStatus !== 'MS_16')
            : action.payload.students.filter(
                data => data.monitoringStatus !== 'MS_14' && data.monitoringStatus !== 'MS_8'
              );
      }
      if (condition === '7') {
        studentAccord = action.payload.students
          .filter(data => data.examStatus === 'ES_4')
          .filter(data => {
            if (data.paperList.length > 0) {
              return data.paperList.filter(vo => vo.upLoadStatus !== 0).length > 0;
            }
            return true;
          });
      }
      if (condition === '8') {
        studentAccord =
          state.taskInfo.type === 'TT_2'
            ? action.payload.students.filter(data => {
                if (data.paperList.length > 0) {
                  return data.paperList.filter(vo => vo.upLoadStatus === 0).length > 0;
                }
                return false;
              })
            : action.payload.students
                .filter(data => data.examStatus === 'ES_3')
                .filter(data => data.monitoringStatus !== 'MS_13');
      }
      if (condition === '9') {
        studentAccord = action.payload.students.filter(
          data => data.examStatus !== 'ES_3' && data.examStatus !== 'ES_4'
        );
      }
      // 如果当前新获取的学生列表不等于当前的过滤学生列表
      console.log(action.payload.students.filter(data => data.monitoringStatus !== 'MS_16'));
      console.log(studentAccord, studentList);
      if (studentAccord.length !== studentList.length) {
        studentAccord.forEach(item => {
          const student = studentList.filter(vo => vo.ipAddress === item.ipAddress);
          if (student.length === 0) {
            studentList.push(item);
          }
        });
      }

      return {
        ...state,
        students: action.payload.students,
        filterStudents: studentList,
      };
    },

    // 保存任务详情信息
    saveTaskInfo(state, action) {
      return {
        ...state,
        taskInfo: action.payload,
      };
    },

    // 保存考场详情信息
    saveExamPlaceInfo(state, action) {
      return {
        ...state,
        examPlaceInfo: action.payload,
      };
    },

    saveExamPlaceDetail(state, action) {
      return {
        ...state,
        examPlaceDetail: action.payload,
      };
    },

    saveStartTasksDetail(state, action) {
      return {
        ...state,
        examPlaceTasksDetail: action.payload,
      };
    },

    saveRegisterStudentInfo(state, action) {
      return {
        ...state,
        registerStudentInfo: action.payload,
      };
    },

    // 更新任务详情信息
    updateTaskInfo(state, { payload }) {
      return {
        ...state,
        taskInfo: {
          ...state.taskInfo,
          ...payload,
        },
      };
    },

    /**
     * @description 保存结束时间戳
     * @author tina.zhang
     * @date 2019-02-20
     * @param {*} state
     * @param {*} {payload}
     * @returns
     */
    saveTestEndTime(state, { payload }) {
      return {
        ...state,
        taskInfo: {
          ...state.taskInfo,
          endTime: payload.endTime,
        },
      };
    },

    /**
     * 根据payload.studentId
     * 更新 taskInfo.taskStudentRelationVOList 中某些对象
     * @param {*} state
     * @param {*} param1
     */
    updateStudentTaskData(state, { payload }) {
      const { taskStudentRelationVOList } = state.taskInfo;
      const studentList = taskStudentRelationVOList.map(item => {
        if (item.studentId === payload.studentId) {
          return {
            ...item,
            ...payload,
          };
        }
        return item;
      });
      return {
        ...state,
        taskInfo: {
          ...state.taskInfo,
          taskStudentRelationVOList: studentList,
        },
      };
    },

    /**
     * @description: 删除指定用户的信息
     * @param {type}
     * @return: state
     */
    delStudentWatchData(state, { payload }) {
      const { students } = state;
      const studentList = students.filter(obj => obj.studentId !== payload.studentId);
      // 更新学生列表 则要更新当前过滤的学生列表信息
      const filterStudent = state.filterStudents;
      // 当当前的过滤学生列表存在此学生仅更新该学生的信息
      const studentListFilter = filterStudent.filter(obj => obj.studentId !== payload.studentId);

      return {
        ...state,
        students: studentList,
        filterStudents: studentListFilter,
      };
    },

    /**
     * @description: 更新监控学生列表中指定用户的信息
     * @param {type}
     * @return: state
     */
    updateStudentWatchData(state, { payload }) {
      let params;
      if (Array.isArray(payload)) {
        params = [...payload];
      } else {
        params = [payload];
      }
      const { students } = state;
      const studentList = students.map(item => {
        const student = params.find(obj => obj.studentId === item.studentId);
        if (student) {
          return {
            ...item,
            ...student,
          };
        }
        return { ...item };
      });

      // 更新学生列表 则要更新当前过滤的学生列表信息
      const filterStudent = state.filterStudents;
      // 当当前的过滤学生列表存在此学生仅更新该学生的信息
      const studentListFilter = filterStudent.map(item => {
        const current = studentList.find(vo => vo.ipAddress === item.ipAddress);
        if (current) {
          return {
            ...item,
            ...current,
          };
        }
        return item;
      });
      // 当当前学生更新状态后  不存在此过滤学生列表时
      const condition = state.conditions;
      // 更新状态后 重新获取符合当前条件的tab 学生列表
      let studentAccord = [];
      if (condition === '7') {
        studentAccord = studentList
          .filter(data => data.examStatus === 'ES_4')
          .filter(data => {
            if (data.paperList.length > 0) {
              return data.paperList.filter(vo => vo.upLoadStatus !== 0).length > 0;
            }
            return true;
          });
      }
      if (condition === '8') {
        studentAccord =
          state.taskInfo.type === 'TT_2'
            ? studentList.filter(data => {
                if (data.paperList.length > 0) {
                  return data.paperList.filter(vo => vo.upLoadStatus === 0).length > 0;
                }
                return false;
              })
            : studentList
                .filter(data => data.examStatus === 'ES_3')
                .filter(data => data.monitoringStatus !== 'MS_13');
      }
      if (condition === '9') {
        studentAccord = studentList.filter(
          data => data.examStatus !== 'ES_3' && data.examStatus !== 'ES_4'
        );
      }
      // 如果当前新获取的学生列表不等于当前的过滤学生列表
      if (studentAccord.length !== studentListFilter.length) {
        studentAccord.forEach(item => {
          const student = studentListFilter.filter(vo => vo.ipAddress === item.ipAddress);
          if (student.length === 0) {
            studentListFilter.push(item);
          }
        });
      }

      return {
        ...state,
        students: studentList,
        filterStudents: studentListFilter,
      };
    },

    copyTaskWathData(state, { payload }) {
      return {
        ...state,
        copyStudents: payload || JSON.parse(JSON.stringify(state.students || [])),
      };
    },

    filterTaskWathData(state, { payload }) {
      console.log(payload.filterStudent);
      const seatNoStu = state.students.filter(vo => vo.seatNo !== '').sort(ownSortAdd);
      const seatNoStuNo = state.students.filter(vo => vo.seatNo === '');
      // const students =(seatNoStu.sort(ownSortAdd)).concat(seatNoStuNo)
      const studentNew = [...seatNoStu, ...seatNoStuNo];
      const students = studentNew;

      const seatNoStuFilter = payload.filterStudent.filter(vo => vo.seatNo !== '').sort(ownSortAdd);
      const seatNoStuNoFilter = payload.filterStudent.filter(vo => vo.seatNo === '');
      // const students =(seatNoStu.sort(ownSortAdd)).concat(seatNoStuNo)
      const studentNewFilter = [...seatNoStuFilter, ...seatNoStuNoFilter];
      const NewFilterStudents = studentNewFilter;
      console.log(students, NewFilterStudents);

      return {
        ...state,
        students,
        filterStudents: NewFilterStudents,
        conditions: payload.conditions,
      };
    },
    savefilterTaskWathData(state, { payload }) {
      return {
        ...state,
        filterStudents: payload.filterStudent,
      };
    },
  },

  subscriptions: {
    /**
     * 如果跳转到老师的home页面，则清除任务列表检索条件的缓存
     * @param {*} param0
     */
    setup({ dispatch, history }) {
      // 判断路由
      history.listen(location => {
        if (
          location.pathname.indexOf('/teacher/home') === 0 ||
          location.pathname.indexOf('/teacher/tasklist') === 0 ||
          location.pathname.indexOf('/teacher/districtList') === 0
        ) {
          dispatch({
            type: 'updateDrawerStatus',
            payload: {
              showNewModal: false,
            },
          });
          dispatch({
            type: 'saveTaskInfo',
            payload: {
              startTime: '', // 任务开始时间
              taskPaperIdList: [], // 试卷 ,
              taskStudentRelationVOList: [], // 学生 ,
              distributeType: '', // 分发方式 ,
              examType: '', // 考试策略 ,
              taskId: '', // 任务ID ,
              type: '', // 任务的类型（TT_1,TT_2,TT_3）（对应字典表：taskType）
              name: '', // 任务名称 ,
              classList: [], // 班级列表
              status: '', // 任务的状态（未开始，进行中。。。）
              endTime: '', // 一键检测 考试结束时间
            },
          });
        }
      });
    },
  },
};
