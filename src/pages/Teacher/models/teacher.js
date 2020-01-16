/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
// 教师相关modal处理
import {
  // getTeacherInfo,             // 获取教师信息api
  getTaskList, // 获取任务列表api
  getTaskCount, // 获取任务统计api
  runTask, // 下载任务详情和答题包
  taskAutoDownload, // 根据校区id判断并下载最新的测试包
  taskDownResult, // 根据校区id获取最新测试包的下载进度
  queryChangeTaskTitle, // 修改任务名称
  getTaskStatus,
  batchesStudentCount, // PROXY-701：获取任务未考人员信息及正在监考的信息
  uploadTaskToServer, // PROXY-204 从PROXY同步任务数据到平台
  delTask, // Proxy-604 删除任务
  getTaskStudentList, // Proxy-603 获取指定任务的参考学生列表
  getDistrictList, // Proxy-750  区校中(校)任务列表
} from '@/services/teacher';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { delay } from '@/utils/utils';
import { message } from 'antd';

// 默认的state
const defaultState = {
  // 教师相关信息
  userInfo: {
    accountId: '', // accountId
    campusId: '', // 校区id
    teacherId: '', // 教师编号( 只有教师在该校区的teacherId，无则为空 )
    teacherName: '', // 教师名称
    inCurrentCampus: '', // 当前教师是否在该校区里
    teacherList: [], // 当期教师所有关联账号的列表
  },

  // 任务的统计数据
  taskCount: [
    // {                         // 本班考试的 统计数量 （ 依次类推，有多个显示多个 ）
    //   taskType  : "TT_1",
    //   taskCount : 0,
    // }
  ],

  // 任务列表信息
  taskData: {
    // 状态数据
    total: 0, // 任务总条数
    records: [
      // 任务列表数据
      // {
      // createdBy :  "124f6d6c7e5d4cde98951be08b609434"
      // createdDatetime:1545115431080
      // distributeType:"2ce6fc6c40074c27907de7d4f01cff99"
      // distributeTypeValue:null
      // examType:"dbe366bd46b24142bc7b1019813755a0,"
      // examTypeValue:null
      // id:"32619665654022144"
      // name:"20181218001"
      // numberOfActual:null
      // numberOfApplications:3
      // status:"TS_2"
      // statusValue:null
      // taskClassRelationList:[]
      // taskPaperList:[,…]
      // upStatus : 0 失败 1上传中 2 失败
      // type:"TT_1"
      // typeValue:null
      // version:4
      // studentList : []    // 通过额外接口获取 该任务下的学生列表
      // }
    ],
    // 请求列表的参数
    type: '', // 按状态（ 所有、本班考试、多班联考、练习）
    status: '', // 按状态（ 所有、未开始、进行中、待处理、评分中、已完成 ）
    time: '', // 按时间（ 所有、本月、 本周）
    classType: '', // 按教室类型
    filterWord: '', // 搜索条件
    pageIndex: 1, // 当前页
    pageSize: 10, // 每页条数
  },
};

// teacher 学生相关状态库
export default {
  namespace: 'teacher',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {
    /**
     * 接口逻辑
     * 教师机--获取老师详情
     * @param {*} _
     * @param {*} param1
     */
    *getTeacherInfo(_, { put }) {
      // 不再通过接口获取，用户信息，直接通过 localstorage 账号信息
      const accountInfo = localStorage.getItem('accountInfo');
      try {
        if (!accountInfo) {
          throw String('未获取到教师信息，重新登录');
        }
        const info = JSON.parse(accountInfo);
        const { accountId, campusId, teacherId, teacherName, inCurrentCampus, teacherList } = info;
        yield put({
          type: 'setTeacherInfo',
          payload: {
            accountId,
            campusId,
            teacherId,
            teacherName,
            inCurrentCampus,
            teacherList,
          },
        });
      } catch (e) {
        console.warn(e);
        router.push('/');
      }
    },

    /**
     * 接口逻辑
     * 教师机--教师首页--获取各种类型的任务统计数
     * @param {String} payload : 任务类型集合， 例如： [TT_1,TT_2,TT_3]
     * 特例： 如果有 TT_6 需要带上 teacherIds ( 区校统考 )
     */
    *getTaskCount({ payload = [] }, { select, call, put }) {
      const { teacherId, inCurrentCampus, teacherList, campusId } = yield select(
        state => state.teacher.userInfo
      );
      const requestParams = {
        campusId,
      };
      const taskTypeList = [...payload];

      if (taskTypeList.includes('TT_6')) {
        requestParams.teacherIds = teacherList.map(item => item.teacherId).join(',');
        // 需要显示区校统考
        if (inCurrentCampus) {
          // 在当前校区
          requestParams.teacherId = teacherId;
          requestParams.taskTypes = taskTypeList.filter(item => item !== 'TT_6').join(',');
        } else {
          requestParams.taskTypes = '';
        }
      } else {
        requestParams.teacherId = teacherId;
        requestParams.taskTypes = payload;
      }

      if (inCurrentCampus) {
        requestParams.teacherId = teacherId;
      }
      const { data } = yield call(getTaskCount, requestParams);

      // 将数据写入 teacher modal
      yield put({
        type: 'updateState',
        payload: {
          taskCount: data.map(item => ({
            taskType: item.taskType,
            taskCount: item.taskCount,
          })),
        },
      });

      // const params = {
      //   examCount         : 0,
      //   practiceCount     : 0,
      //   entranceExamCount : 0,
      //   uexamCount        : 0,
      // };
      // data.forEach(({taskCount,taskType})=>{
      //   const status = {"TT_1":"examCount","TT_2":"practiceCount","TT_3":"entranceExamCount","TT_6":"uexamCount"}[taskType];
      //   if( status )
      //     params[status] = taskCount;
      // });
      // yield put({
      //   type: 'setTaskData',
      //   payload: params
      // });
    },

    /**
     * 接口逻辑
     * 教师机--任务列表页--获取任务列表数据
     * PROXY-402根据状态、类型、时间、教师ID、教师任课班级查询任务
     * @param {*} param0
     * @param {*} param1
     */
    getTaskData: [
      function* getTaskData({ payload = {} }, { call, put, select }) {
        const { type, status, time, classType, filterWord, pageIndex, pageSize } = yield select(
          state => state.teacher.taskData
        );
        const { teacherId, campusId } = yield select(state => state.teacher.userInfo);
        const params = {
          type,
          status,
          time,
          classType,
          filterWord,
          pageIndex,
          pageSize,
          teacherId,
          campusId,
          ...payload,
        };

        // 先记录当前的选项状态，在去请求接口
        yield put({
          type: 'setTaskData',
          payload: { ...payload },
        });

        // 获取任务列表
        const { data } = yield call(getTaskList, params);

        yield put({
          type: 'setTaskData',
          payload: {
            pageIndex: data.current,
            records: data.records,
            total: data.total,
            pageSize: data.size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    /**
     * 接口逻辑
     * 教师机--任务列表页--获取任务列表数据
     * PROXY-402根据状态、类型、时间、教师ID、教师任课班级查询任务
     * @param {*} param0
     * @param {*} param1
     */
    getDistrictData: [
      function* getTaskData({ payload = {} }, { call, put, select }) {
        const { filterWord, pageIndex, pageSize } = yield select(state => state.teacher.taskData);
        const { campusId, teacherList } = yield select(state => state.teacher.userInfo);

        let teacherIds = '';
        for (const i in teacherList) {
          if (i !== 0) {
            teacherIds = `${teacherIds},${teacherList[i].teacherId}`;
          } else {
            teacherIds += teacherList[i].teacherId;
          }
        }
        const params = {
          type: 'TT_6',
          filterWord,
          pageIndex,
          pageSize,
          teacherIds,
          campusId,
          ...payload,
        };

        // 先记录当前的选项状态，在去请求接口
        yield put({
          type: 'setTaskData',
          payload: { ...payload },
        });

        // 获取任务列表
        const { data } = yield call(getDistrictList, params);

        yield put({
          type: 'setTaskData',
          payload: {
            pageIndex: data.current,
            records: data.records,
            total: data.total,
            pageSize: data.size,
          },
        });
      },
      { type: 'takeLatest' },
    ],

    /**
     * 接口逻辑
     * 任务列表--按钮事件--开始按钮(继续按钮)
     * @param {*} param0
     * @param {*} param1
     * 逻辑描述 ：
     * 1、通过proxy-702 轮询的去检查任务是否在打包中
     * 2、通过proxy-702 轮询的去检查任务是否在下载中
     * 3、通过proxy-305 获取当前的任务详情，判断任务是否结束
     * 4、判断任务是否打包失败了
     * 5、打包失败提示重新创建任务，成功的话305自动下载试卷。
     * 6、轮询proxy-702 轮询查看下载中的具体状态。
     * 7、成功或失败具体处理
     *
     */
    *runTask({ payload }, { call, put }) {
      // 显示过渡状态（ 通过 loading.effects["teacher/runTask"] 控制开关 ）
      yield put({
        type: 'popup/open',
        payload: 'transLoading',
        data: payload,
      });
      // 通过 proxy-702 接口获取当前的 任务环节状态
      let { linkStatus } = yield put.resolve({ type: 'getTaskStatus', payload });

      // 如果当前状态为打包失败，提示错误
      if (linkStatus === 'ES_3') {
        // 提示打包失败
        yield put({
          type: 'popup/open',
          payload: 'transFail',
          data: payload,
        });
        return;
      }

      // 当前环节状态为ES_5 及 下载完成，直接进入页面
      if (linkStatus === 'ES_5') {
        // 提示打包失败
        router.push(`/teacher/task/${payload}`);
        return;
      }

      // 如果是打包状态，轮训的去检测打包状态
      if (linkStatus === 'ES_1') {
        ({ linkStatus } = yield put.resolve({ type: 'rotationPacking', payload }));
      }

      // 如果当前是打包完成，或下载失败，重新触发下载事件
      if (linkStatus === 'ES_2' || linkStatus === 'ES_6') {
        // 如果不是下载中的状态，则去查询任务并下载
        const { responseCode } = yield call(runTask, payload);
        if (responseCode !== '200') return;
      }

      // 轮训的去检测任务下载状态
      yield put.resolve({ type: 'rotationDownload', payload });
    },

    /**
     * 通过proxy-702 轮询的去检查任务是否在打包中
     * @param {*} param0
     * @param {*} param1
     */
    *rotationPacking({ payload, number = 5 }, { call, put }) {
      if (number <= 0) {
        // 五次以后提示 网络不稳定
        yield put({
          type: 'popup/open',
          payload: 'transWarn',
          data: payload,
        });
        throw new Error('当前网络不稳定，请稍候！');
      }
      yield call(delay, 2000);
      const data = yield put.resolve({ type: 'getTaskStatus', payload });
      // 打包中
      if (data.linkStatus === 'ES_1') {
        return yield put.resolve({
          type: 'rotationPacking',
          number: number - 1,
          payload,
        });
      }
      // 打包失败
      if (data.linkStatus === 'ES_3') {
        // 提示打包失败
        yield put({
          type: 'popup/open',
          payload: 'transFail',
          data: payload,
        });
        throw new Error(`任务打包失败，请重新创建任务！`);
      }
      // 打包成功
      return data;
    },

    /**
     * 通过proxy-702 轮询的去检查任务是否在下载中
     * @param {*} param0
     * @param {*} param1
     */
    *rotationDownload({ payload, number = 5 }, { call, put }) {
      if (number <= 0) {
        // 五次以后提示 网络不稳定
        yield put({
          type: 'popup/open',
          payload: 'transWarn',
          data: payload,
        });
        throw new Error('当前网络不稳定，请稍候！');
      }
      yield call(delay, 2000);
      const { linkStatus } = yield put.resolve({ type: 'getTaskStatus', payload });
      // 下载中
      if (linkStatus === 'ES_4') {
        yield put.resolve({
          type: 'rotationDownload',
          number: number - 1,
          payload,
        });
      } else if (linkStatus === 'ES_6') {
        // 下载失败
        // 提示下载失败
        yield put({
          type: 'popup/open',
          payload: 'transFail',
          data: payload,
        });
        throw new Error(`任务下载失败，请重新创建任务！`);
      } else if (linkStatus === 'ES_5') {
        // 下载成功
        router.push(`/teacher/task/${payload}`);
      }
    },

    /**
     * 结束任务前环境检测
     * @param {*} param0
     * @param {*} param1
     */
    *beforeEndTask({ payload }, { call, put }) {
      // 获取最新的任务状态
      const { linkStatus } = yield put.resolve({ type: 'getTaskStatus', payload });

      // 判断是否在这结束中
      if (linkStatus === 'ES_7') {
        message.info(
          formatMessage({ id: 'task.message.task.ending', defaultMessage: '任务数据正在结束中！' })
        );
        return false;
      }

      // 判断是否已经结束了
      if (linkStatus === 'ES_8') {
        // 正在结束中
        message.info(
          formatMessage({ id: 'task.message.task.has.end', defaultMessage: '任务已被结束！' })
        );
        return false;
      }

      // 获取当期的监控信息
      const { responseCode, data } = yield call(batchesStudentCount, payload);
      if (responseCode !== '200') return false;

      return data;
    },

    /**
     * 结束任务
     * @param {*} param0
     * @param {*} param1
     */
    *endTask({ payload }, { select, call, put }) {
      const { taskId, studentExamInfo = [] } = payload;
      const { teacherId, teacherName } = yield select(state => state.teacher.userInfo);

      const params = {
        id: taskId, // 任务id
        teacherId,
        teacherName,
        studentExamInfo,
      };
      // 打开弹框
      yield put({
        type: 'popup/open',
        payload: 'transLoading',
        data: taskId,
      });
      // 任务状态设置为 上传中
      yield put({
        type: 'updateTaskInfo',
        payload: {
          taskId,
          linkStatus: 'ES_7',
        },
      });
      const { responseCode } = yield call(uploadTaskToServer, params);
      if (responseCode !== '200') return;
      // 轮训的去检测,获取下载状态
      yield put.resolve({
        type: 'rotationUpload',
        payload: taskId,
      });
    },

    /**
     * 通过proxy-702 轮询的去检查任务是否在上传中
     * @param {*} param0
     * @param {*} param1
     */
    *rotationUpload({ payload, number = 5 }, { call, put }) {
      if (number <= 0) {
        // 五次以后提示 网络不稳定
        yield put({
          type: 'popup/open',
          payload: 'transWarn',
          data: payload,
        });
        throw new Error('当前网络不稳定，请稍候！');
      }
      yield call(delay, 2000);
      const { linkStatus } = yield put.resolve({ type: 'getTaskStatus', payload });
      // 上传中
      if (linkStatus === 'ES_7') {
        yield put.resolve({
          type: 'rotationUpload',
          number: number - 1,
          payload,
        });
      } else if (linkStatus === 'ES_9') {
        // 提示上传失败
        yield put({
          type: 'popup/open',
          payload: 'transFail',
          data: payload,
        });
        throw new Error(`试卷下载失败！`);
      } else if (linkStatus !== 'ES_8') {
        throw new Error(`异常类型状态!`);
      }
    },

    /**
     * 删除任务
     * @param {*} param0
     * @param {*} param1
     */
    *delTask({ payload }, { call }) {
      // 删除数据
      yield call(delTask, payload);
    },

    /**
     * 获取任务当期的状态（任务状态，任务环节状态）
     * @param {*} param0
     * @param {*} param1
     */
    *getTaskStatus({ payload, isLoop }, { call, put, select }) {
      try {
        const { data = {} } = yield call(getTaskStatus, payload);
        const { taskId, status, linkStatus } = data;
        // 判断值是否改变，如果改变更新
        const { records, type } = yield select(state => state.teacher.taskData);

        /** 区校考主任务+子任务，需要遍历子任务linkStatus */

        let tag = null;
        if (type === 'TT_6') {
          for (const i in records) {
            tag = records[i].subTaskList.find(item => item.taskId === payload);
            if (tag) {
              break;
            }
          }
        } else {
          tag = records.find(item => item.taskId === payload);
        }

        if (tag) {
          if (tag.linkStatus !== linkStatus || tag.status !== status) {
            yield put({
              type: 'updateTaskInfo',
              payload: { taskId, linkStatus, status },
            });
          }
        }
        return data;
      } catch (err) {
        if (!isLoop) {
          const { type } = yield select(state => state.teacher.taskData);
          if (type === 'TT_6') {
            yield put({ type: 'getDistrictData' });
          } else {
            yield put({ type: 'getTaskData' });
          }
        }
        throw err;
      }
    },

    /**
     * 获取任务当期的状态（任务状态，任务环节状态）
     * @param {*} param0
     * @param {*} param1
     */
    *getNowTaskStatus({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(getTaskStatus, payload);
      if (responseCode !== '200') {
        throw new Error('请求任务不存在！');
      }
      callback(data);
    },

    /**
     * 业务逻辑
     * @description: 点击一键检测按钮的事件
     * @param {type}
     * @return:
     */
    *autoCheck(_, { call, put, select }) {
      const { campusId } = yield select(state => state.vbClient);
      // 第一步: 打开检测页面的弹框
      yield put({
        type: 'popup/open',
        payload: 'autoCheck',
        data: 'checking',
      });
      yield call(delay, 1000);
      // 第二步 ： 调用接口获取是否需要下载最新的测试版
      const { data } = yield call(taskAutoDownload, campusId);

      // 第三步 ： 如果检测到有新的测试包，则去下载测试包
      if (data === 'NoPackage') {
        // 弹框显示内容为下载中
        yield put({
          type: 'popup/open',
          payload: 'autoCheck',
          data: 'downloading',
        });
        yield put.resolve({
          type: 'getTaskDownResult',
        });
      } else {
        yield put({
          type: 'popup/close',
          payload: 'autoCheck',
        });
        router.push(`/teacher/task/autoCheck`);
      }
    },

    /**
     * 业务逻辑
     * @description: 轮训的去查看是否已经下载完成
     * @param {type}
     * @return:
     */
    *getTaskDownResult(_, { call, put, select }) {
      const { campusId } = yield select(state => state.vbClient);
      const { data } = yield call(taskDownResult, campusId);

      // 下载失败
      if (data === '0') {
        message.error(
          formatMessage({
            id: 'task.message.autocheck.pack.download.failed',
            defaultMessage: '自动检测包下载失败',
          })
        );
        yield put({
          type: 'popup/close',
          payload: 'autoCheck',
        });
        return;
      }

      // 正在下载
      if (data === '1') {
        yield call(delay, 2000);
        // 2s后再次检查该下载任务状态
        yield put.resolve({ type: 'getTaskDownResult' });
        return;
      }

      // 下载成功
      if (data === '2') {
        yield put({
          type: 'popup/close',
          payload: 'autoCheck',
        });
        router.push(`/teacher/task/autoCheck`);
      }
    },

    /**
     * 修改任务的名称
     * @param {*} { payload : id,name }
     */
    *queryChangeTaskTitle({ payload }, { call, put }) {
      const { taskId, name } = payload;
      const { responseCode } = yield call(queryChangeTaskTitle, { taskId, name });
      if (responseCode !== '200') return;
      // 更新数据
      yield put({
        type: 'updateTaskInfo',
        payload: { taskId, name },
      });
    },

    /**
     * 根据任务id 获取 该任务下参加考试的学生
     */
    *getTaskStudentList({ payload }, { call, put }) {
      const { responseCode, data } = yield call(getTaskStudentList, {
        taskId: payload,
        classId: '',
      });
      if (responseCode !== '200') return;
      yield put({
        type: 'updateTaskInfo',
        payload: {
          taskId: payload,
          studentList: data,
        },
      });
    },
  },

  reducers: {
    // 更新当前页面的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    // 设置老师信息
    setTeacherInfo: (state, { payload }) => ({
      ...state,
      userInfo: {
        ...state.userInfo,
        ...payload,
      },
    }),

    // 清空老师信息
    clearTeacherInfo: state => ({
      ...state,
      userInfo: JSON.parse(JSON.stringify(defaultState.userInfo)),
    }),

    // 清空任务条数
    clearTaskCount: state => ({
      ...state,
      taskCount: JSON.parse(JSON.stringify(defaultState.taskCount)),
    }),

    // 获取任务列表
    setTaskData: (state, { payload }) => ({
      ...state,
      taskData: {
        ...state.taskData,
        ...payload,
      },
    }),

    /**
     * 修改某个任务的状态
     * payload = {id,type}
     */
    updateTaskInfo: (state, { payload }) => {
      const { taskId, ...params } = payload;
      let records = [];
      let subTaskList = [];
      /** 区校考试对比子任务 */
      if (state.taskData.type === 'TT_6') {
        // eslint-disable-next-line guard-for-in
        for (const i in state.taskData.records) {
          subTaskList = state.taskData.records[i].subTaskList.map(item => ({
            ...item,
            ...(item.taskId === taskId ? params : {}),
          }));
          records[i] = {
            ...state.taskData.records[i],
            subTaskList,
          };
        }
      } else {
        records = state.taskData.records.map(item => ({
          ...item,
          ...(item.taskId === taskId ? params : {}),
        }));
      }

      return {
        ...state,
        taskData: {
          ...state.taskData,
          records,
        },
      };
    },
  },

  subscriptions: {
    /**
     * 如果跳转到老师的home页面，则清除任务列表检索条件的缓存
     * @param {*} param0
     */
    setup({ dispatch, history }) {
      //
      // 判断路由
      history.listen(location => {
        if (location.pathname.indexOf('/teacher/home') === 0) {
          dispatch({
            type: 'setTaskData',
            payload: {
              records: [],
              pageIndex: 1,
              total: 0, // 任务总条数
              pageSize: 10, // 每页条数
              status: '', // 按进度（ 所有、未开始、进行中、待处理、评分中、已完成 ）
              classType: '',
              time: '', // 按时间（ 所有、本月、 本周）
              filterWord: '', // 搜索条件
            },
          });
        }
      });
    },
  },
};
