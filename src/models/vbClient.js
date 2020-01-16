/*
 * @Author: tina.zhang
 * @Date: 2019-01-04 09:39:27
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-01-08 10:49:52
 * @Description:
 */
/*
 * @Author: tina.zhang
 * @Date: 2018-12-21 18:05:02
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-07 16:45:59
 * @Description: 获取client的通用功能配置以及方法重写
 */

import {
  isDesktop,
  getRoles,
  getc,
  getcode,
  getCurrentClientIPAddress,
  getMicphoneVolume,
  setMicphoneVolume,
  getEarphoneVolume,
  setEarphoneVolume,
  myClose,
  importAnswerPack,
  onReceive,
  checkEarAndMicphoneStatus, // 音视频检测
  checkComputeAi, // 频分引擎检测
  initOnReceive, // 消息监听正式启动
  businessReceive, // 启用消息接收功能
  // callOne,                    // 单发消息
  // callAll,                    // 群发消息
  deviceManager, // 设备管理方案
  vbClientWin, // vbClient 窗口管理
  keyLocked, // 键盘锁
  copyRight, // 获取版本信息
} from '@/utils/instructions';
import { message } from 'antd';
import { delay } from '@/utils/utils';

// 处理整体的监控事件
// eslint-disable-next-line no-unused-vars
function startOnReceive(dispatch, config) {
  onReceive(() => {});

  // 添加业务消息监听的处理
  businessReceive(dispatch, config);

  // 判断根据不同的角色启用不同的监听数据
  // 添加系统类消息监听的处理
  if (config.role === 'student') {
    // 学生机
    onReceive(({ command, data }) => {
      switch (command) {
        // 教师机或学生机链接上
        case 'connect':
          dispatch({
            type: 'task/connect',
            payload: data,
          });
          break;
        // 教师机或学生机断开链接
        case 'disconnect':
          dispatch({
            type: 'task/disconnect',
            payload: data,
          });
          break;
        default:
          break;
      }
    });
  } else {
    // 教师机
    onReceive(({ command, data, connId }) => {
      switch (command) {
        // 教师机或学生机链接上
        case 'connect':
          dispatch({
            type: 'task/connect',
            payload: data,
            connId,
          });
          break;
        // 教师机或学生机断开链接
        case 'disconnect':
          dispatch({
            type: 'task/disconnect',
            payload: data,
            connId,
          });
          break;
        default:
          break;
      }
    });
  }

  // 启动监听
  initOnReceive();
}

/**
 * @description:  vbClient 对象，整体处理
 * @param {type}
 * @return:
 */

export default {
  namespace: 'vbClient',

  state: {
    code: '', // 鉴权码
    running: true, // 程序是否在运行中
    isClient: false, // 是桌面版还是客户端版本
    version: 1, // 桌面软件的版本号，后期用于软件版本的检查和更新
    role: '', // student ： 学生机； teacher : 教师机
    runtimeMode: '', // vbClient允许模式，development 开发时,   production 产品时,   presentation 演示时
    campusId: '',
    applicationId: 'a04c35fe2bf8468f8aabf53b62177303', // 考中平台的固定id
    expired: '',
    state: '', // 软件的状态 119 ：客户端验证通过  120 ： 客户端已经过期了
    ipAddress: '', // ip地址
    teacherIpAddress: '', // 学生机 中 获取到的教师机ip地址
    sizeType: 'normal', // 获取VBClient尺寸 minimized 最小化  maximized 最大化  normal 正常模式
    keyLocked: '', // 键盘锁状态
    copyRight: '', // 获取版权信息

    micphoneVolume: '', // 麦克风音量大小
    earphoneVolume: '', // 耳机的音量大小
    deviceState: '', // 耳机掉落的监听状态 offline ： 耳机掉落  online : 耳机重连
    computerAi: '', // 评分引擎的状态 checking 检测中 success 检测成功 fail 检测失败
    earphone: '', // 耳机设备的状态 checking 检测中 success 检测成功 fail 检测失败
    microphone: '', // 麦克风设备的状态 checking 检测中 success 检测成功 fail 检测失败

    player: true, // 是否有放音设备
    recorder: true, // 是否有录音设备
  },

  effects: {
    /**
     * @description: 导入答题包
     * @param {payload} 当前处理的学生id
     * @return:
     */
    *importAnswerPack({ payload }, { call, put, select }) {
      const { sid: studentId, snapshotId } = payload;
      const {
        students,
        taskInfo: { taskPaperIdList, type },
      } = yield select(state => state.task);
      const originPaperInfo = taskPaperIdList.find(item => item.snapshotId === snapshotId);
      const student = students.find(item => item.studentId === studentId);
      const {
        paperList = [],
        taskId,
        identifyCode,
        accessFlag,
        examStatus,
        monitoringDesc,
      } = student;
      // 判断paperList 中是否答题包
      const paperInfo = paperList.find(item => item.snapshotId === snapshotId);

      // 添加页面上的loading状态
      if (type === 'TT_2') {
        // 如果是练习
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId,
            paperList: paperList.map(item => ({
              ...item,
              respondentsStatus:
                item.snapshotId === snapshotId ? 'loading' : item.respondentsStatus,
            })),
          },
        });
      } else {
        // 如果是考试
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId,
            respondentsStatus: 'loading',
          },
        });
      }

      try {
        // 导入答题包
        const res = yield call(importAnswerPack, {
          taskId,
          studentId,
          snapshotId,
          token: localStorage.getItem('access_token'),
          fileName: `${taskId}_${identifyCode}_${snapshotId}`,
        });
        // 设置答题包导入成功
        message.success('导入答题包成功！', 2);
        const { userData } = res;
        const paper = JSON.parse(userData);

        // const papers = student.paperList || [];
        // 获取是否已经在现用的监听试卷列表中了
        const paperIndex = paperList.findIndex(tag => tag.snapshotId === snapshotId);
        // 判断该试卷是否已经在监听试卷列表中
        if (paperInfo) {
          const paperInfobj = {
            ...paperInfo,
            respondentsStatus: paper.respondentsStatus || 'RS_1',
            fileCount: paper.fileCount, // "答卷包文件数"
            needFileCount: paper.needFileCount, // "待打包文件数"
            respondentsMd5: paper.respondentsMd5, // "0字节文件数"
            respondentsName: paper.paperName, // "答卷包名称"
            zeroCount: paper.zeroCount, // "0字节文件数"
            paperName: originPaperInfo.name,
            upLoadStatus: 1, // 上传状态
            fullMark: paper.fullMark, // 总分
            paperTime: paper.paperTime, // 时长
            questionPointCount: paper.questionPointCount, // 小题数
            score: paper.score, // 得分
            responseQuestionCount: paper.responseQuestionCount, // 答题数
          };
          paperList.splice(paperIndex, 1, paperInfobj);
        } else {
          // 如果在监控数据当前学生的paperList，没有该试卷信息，则创建一份该数据
          const obj = {
            answerProcess: student.answerProcess, // "答题进度"
            elapsedTime: student.elapsedTime, // "用时"
            fileCount: paper.fileCount, // "答卷包文件数"
            isDeleted: 0, // "删除标记"
            needFileCount: paper.needFileCount, // "待打包文件数"
            paperName: originPaperInfo.name, // "试卷名称"
            respondentsMd5: paper.respondentsMd5, // "0字节文件数"
            respondentsName: paper.paperName, // "答卷包名称"
            respondentsStatus: paper.respondentsStatus || 'RS_1', // "答卷包状态"
            snapshotId, // "试卷快照ID"
            zeroCount: paper.zeroCount, // "0字节文件数"
            upLoadStatus: 1, // 上传状态
            fullMark: paper.fullMark, // 总分
            paperTime: paper.paperTime, // 时长
            questionPointCount: paper.questionPointCount, // 小题数
            score: paper.score, // 得分
            responseQuestionCount: paper.responseQuestionCount, // 答题数
          };
          paperList.push(obj);
        }

        let examResult = '';
        if (accessFlag === 'manual') {
          examResult = examStatus;
        } else if (paper.respondentsStatus) {
          examResult = 'ES_3';
        } else {
          examResult = 'ES_4';
        }
        let monitoringDescNew = '';
        if (accessFlag === 'manual' && examStatus === 'ES_3') {
          monitoringDescNew = monitoringDesc;
        } else {
          monitoringDescNew =
            (paper &&
              paper.respondentsStatus &&
              (paper.respondentsStatus === 'RS_5' ? 'ES_7' : 'ES_8')) ||
            '';
        }
        yield put({
          type: 'task/updateTaskWatchResult',
          payload: {
            studentId: student.studentId,
            respondentsStatus: paper.respondentsStatus || 'RS_1',
            monitoringDesc: monitoringDescNew,
            monitoringStatus: 'MS_14',
            examStatus: examResult,
            paperList,
          },
        });
        return true;
      } catch (e) {
        if (paperInfo) {
          paperInfo.respondentsStatus = 'RS_4';
        }
        // 设置答题包导出失败
        if (e.error !== 'ImportCancel') {
          message.error('导入答题包失败！', 2);
        }
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId: student.studentId,
            respondentsStatus: 'RS_2',
            paperList,
          },
        });
        return e;
      }
    },

    /**
     * 监听 上传进度
     * @param {*} param0
     * @param {*} param1
     */
    *updateProgress({ payload }, { select, put }) {
      const { studentId, snapshotId, uploadProcess } = payload;
      const { students } = yield select(state => state.task);
      const { paperList } = students.find(item => item.studentId === studentId) || {};
      if (studentId && snapshotId && paperList && uploadProcess) {
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId,
            paperList: paperList.map(item => {
              if (item.snapshotId === snapshotId) {
                return {
                  ...item,
                  uploadProcess,
                };
              }
              return { ...item };
            }),
          },
        });
      }
    },

    /**
     * @description: 重新发送获取答案包命令
     * @param {type}
     * @return:
     */
    *reGetAnswerPack({ payload }, { call, put, select }) {
      const { task } = yield select(state => state);
      const student = task.students.find(item => item.studentId === payload);
      // 设置答题包上传中的状态（导入答题包，导入答题包成功）
      yield put({
        type: 'task/updateStudentWatchData',
        payload: {
          studentId: student.studentId,
          respondentsStatus: 'loading',
        },
      });
      // 导入答题包
      try {
        yield call(importAnswerPack, {
          taskId: student.taskId,
          studentId: student.studentId,
          snapshotId: student.snapshotId,
          token: localStorage.getItem('access_token'),
          fileName: '答题包',
        });
        // 设置答题包导入成功
        message.success('导入答题包成功！', 2);
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId: student.studentId,
            respondentsStatus: 'RS_1',
          },
        });
      } catch (e) {
        // 设置答题包导出失败
        message.error('导入答题包失败！', 2);
        yield put({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId: student.studentId,
            respondentsStatus: 'RS_2',
          },
        });
      }
    },

    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓设备检测功能块↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

    /**
     * @description: 学生机的检测 业务逻辑
     * @param {type}
     * @return:
     */
    *studentDeviceCheck({ payload }, { call, put, select }) {
      // 状态还原
      yield put({
        type: 'setVbClientConfig',
        payload: {
          computerAi: '',
          earphone: '',
          microphone: '',
        },
      });
      // 判断是考试检测还是练习检测
      if (payload === 'practice') {
        // 开始评分引擎检测
        yield put.resolve({ type: 'computerAiCheck' });
        // 为了页面效果延时一秒以后进入下一步
        yield call(delay, 500);
        // 判断引擎是否检测成功
        const { computerAi } = yield select(state => state.vbClient);
        if (computerAi === 'fail') return false;
      }
      // 开始耳机检测
      yield put.resolve({ type: 'earphoneCheck' });
      // 为了页面效果延时一秒以后进入下一步
      yield call(delay, 500);
      const { earphone } = yield select(state => state.vbClient);
      if (earphone === 'fail') return false;
      // 开始麦克风检测
      yield put.resolve({ type: 'microphoneCheck' });
      const { microphone } = yield select(state => state.vbClient);
      if (microphone === 'fail') return false;
      return true;
    },

    /**
     * 评分引擎进行检测中
     */
    *computerAiCheck(_, { call, put }) {
      // 强制设置检测中
      yield put({
        type: 'setVbClientConfig',
        payload: { computerAi: 'checking' },
      });
      // 为了效果1s以后进行检测
      const status = yield call(checkComputeAi);
      yield put({
        type: 'setVbClientConfig',
        payload: { computerAi: status ? 'success' : 'fail' },
      });
    },

    /**
     * 耳机进行检测中
     */
    *earphoneCheck(_, { call, select, put }) {
      // 强制设置检测中
      yield put({
        type: 'setVbClientConfig',
        payload: { earphone: 'checking' },
      });
      // 为了效果2s以后进行检测
      yield call(delay, 1500);
      const { player } = yield select(state => state.vbClient);
      yield put({
        type: 'setVbClientConfig',
        payload: { earphone: player ? 'success' : 'fail' },
      });
    },

    /**
     * 麦克风进行检测中
     */
    *microphoneCheck(_, { call, select, put }) {
      // 强制设置检测中
      yield put({
        type: 'setVbClientConfig',
        payload: { microphone: 'checking' },
      });
      // 为了效果2s以后进行检测
      yield call(delay, 1500);
      const { recorder } = yield select(state => state.vbClient);
      yield put({
        type: 'setVbClientConfig',
        payload: { microphone: recorder ? 'success' : 'fail' },
      });
    },

    /**
     * 判断耳机的状态(默认 麦克风耳机都可用就是 online 否则为 offline)
     */
    *getDeviceStatus(_, { put, call, race }) {
      const checkResult = yield race({
        result: call(checkEarAndMicphoneStatus),
        timeout: call(delay, 1500),
      });
      if ('timeout' in checkResult) {
        throw new Error('耳机麦克风检测超时！');
      }
      const { player, recorder } = checkResult.result;
      yield put({
        type: 'setVbClientConfig',
        payload: {
          deviceState: player && recorder ? 'online' : 'offline',
          player,
          recorder,
        },
      });
    },

    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑设备检测功能块↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    *getVbClientState(_, { select }) {
      const { vbClient } = yield select(state => state);
      return vbClient;
    },

    // 设置键盘锁状态
    *setKeyLocked({ payload }, { put }) {
      // 设置vbClient中isKeyLocked的值
      keyLocked.value = payload;
      yield put({
        type: 'setVbClientConfig',
        payload: {
          keyLocked: payload,
        },
      });
    },
  },

  reducers: {
    /**
     * 更新配置数据
     * @param {*} state
     * @param {*} param1
     */
    setVbClientConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    /**
     * 设置麦克风音量
     * @param {*} param0
     * @param {*} param1
     */
    setMicphoneVolume(state, { payload }) {
      // 1.设置音量
      // 2.获取音量
      // 3.保存音量数据
      setMicphoneVolume(payload);
      const volume = getMicphoneVolume();
      return {
        ...state,
        micphoneVolume: volume,
      };
    },

    /**
     * 设置耳机音量
     * @param {*} param0
     * @param {*} param1
     */
    setEarphoneVolume(state, { payload }) {
      // 1.设置音量
      // 2.获取音量
      // 3.保存音量数据
      setEarphoneVolume(payload);
      const volume = getEarphoneVolume();
      return {
        ...state,
        earphoneVolume: volume,
      };
    },

    /**
     * 关闭客户端
     */
    closeVbClient(state) {
      myClose();
      return {
        ...state,
        running: false,
      };
    },
  },

  subscriptions: {
    /**
     * 初始化获取vbClient的基础配置数据
     */
    getVbClientConfig({ dispatch }) {
      // 判断是否有客户端，如果有则获取客户端配置项
      const config = {};
      if (isDesktop) {
        // 是否是客户端登录
        config.isClient = isDesktop;

        // 登录的角色是
        config.role = getRoles() === 101 ? 'student' : 'teacher';

        // 键盘锁状态
        config.keyLocked = keyLocked.value;

        // 获取客户端相关设置
        const { campusId, expired, state, runtimeMode, teacherIpAddress } = getc();
        config.campusId = campusId;
        config.expired = expired;
        config.state = state;
        config.runtimeMode = runtimeMode;
        config.teacherIpAddress = teacherIpAddress;

        // 获取当前机器的ip地址
        // 考虑到开发环境中，教师机和学生机可能会用同一台机器，设置教师机为指定ip
        if (process.env.NODE_ENV === 'development' && config.role === 'teacher') {
          // location中有ip地址，则直接使用，否则随机生成ip地址
          const ipStr = localStorage.getItem('ipAddress');
          if (ipStr) {
            config.ipAddress = ipStr;
          } else {
            const ipArr = [];
            ipArr.push(Math.floor(Math.random() * 255 + 1));
            ipArr.push(Math.floor(Math.random() * 255 + 1));
            ipArr.push(Math.floor(Math.random() * 255 + 1));
            ipArr.push(Math.floor(Math.random() * 255 + 1));
            config.ipAddress = ipArr.join('.');
            localStorage.setItem('ipAddress', config.ipAddress);
          }
        } else {
          // 生产或测试环境
          config.ipAddress = getCurrentClientIPAddress();
        }
        // 获取鉴权码
        config.code = getcode();
        // 只有学生机才会获取麦克风，和耳机的音量
        if (config.role === 'student') {
          // 获取麦克风音量
          config.micphoneVolume = getMicphoneVolume();
          // 获取耳机的音量
          config.earphoneVolume = getEarphoneVolume();
        }
      } else {
        config.role = 'student';
      }

      // 获取版权信息
      config.copyRight = copyRight();

      // 提交配置
      dispatch({
        type: 'setVbClientConfig',
        payload: config,
      });

      // if( getRoles() !== 101 ){
      //   setInterval(()=>{
      //     sendM("========================================================== 在连接中 =================================================================",{});
      //   },500);
      // }

      // 启动业务类型的消息监听
      // startOnReceive(dispatch,config);

      // 开发环境中，为了能同时启动多台教师机，如需要学生机需要告诉教师自己随机的ip地址
      // if( process.env.NODE_ENV === "development" && config.role === "student" ){
      //   callOne({
      //     type : "task/changeStudentIp",
      //     data : {
      //       ipAddress : config.ipAddress
      //     },
      //     hasBack : true
      //   }).then((tt)=>{
      //     console.log(tt);
      //   });
      // }
    },
    /**
     * @description: 监听vbClient的一些状态
     * @param {type}
     * @return:
     */
    async listenVbClient({ dispatch }) {
      const { role } = await dispatch({ type: 'getVbClientState' });

      // 1、 监听耳机的掉落事件，并做一些处理
      if (role === 'student') {
        deviceManager.addListener('deviceStateChanged', ({ state, data }) => {
          const { player, recorder } = data;
          dispatch({
            type: 'setVbClientConfig',
            payload: {
              player,
              recorder,
              deviceState: player && recorder ? 'online' : state,
            },
          });
        });
      }
    },

    /**
     * @description: 监听vbClient的最大最小化普通状态
     * @param {type}
     * @return:
     */
    listenVbResize({ dispatch }) {
      const setSizeType = () => {
        dispatch({
          type: 'setVbClientConfig',
          payload: {
            sizeType: vbClientWin.size,
          },
        });
      };
      // 初始化
      setSizeType();
      // 监听大小尺寸
      vbClientWin.onSize(setSizeType);
    },

    /**
     * 获取权限
     */
    initPremission({ dispatch }) {
      dispatch({ type: 'permission/getPremissionVersion' });
    },
  },
};
