import { getExerciseTaskOverview, getExerciseTranscript, getExerciseTimeStamp, getAnswerDetail } from '@/services/api';
import { queryPaperDetails, queryMyPaperDetails, fetchPaperShowData } from '@/services/teacher';

/**
 * 练习实时报告 models
 * @author tina.zhang
 * @date  2019-07-03
 */
export default {
  namespace: 'exerciseReport',
  state: {
    taskOverview: null, // 任务信息
    transcript: null,    // 成绩单
    paperData: [],//试卷数据
    showData: [],//试卷渲染数据
    teacherPaperInfo: [],//教师答案详情
  },
  effects: {

    // 获取练习任务总览数据
    *getExerciseTaskOverview({ payload }, { call, put }) {
      const resp = yield call(getExerciseTaskOverview, payload);
      yield put({
        type: 'saveExerciseTaskOverview',
        payload: resp.data
      })
      return resp;
    },
    // 获取练习报告生成结果
    *getExerciseTimeStamp({ payload }, { call }) {
      const resp = yield call(getExerciseTimeStamp, payload);
      return resp;
    },
    // 获取练习成绩单数据
    *getExerciseTranscript({ payload }, { call, put }) {
      const resp = yield call(getExerciseTranscript, payload);
      yield put({
        type: 'saveExerciseTranscript',
        payload: resp.data
      })
      return resp;
    },
    // 获取试卷答案详情
    *getAnswerDetail({ payload }, { call, put }) {
      const resp = yield call(getAnswerDetail, payload);
      yield put({
        type: 'saveTeacherPaperInfo',
        payload: resp.data
      })
      return resp;
    },
    *fetchPaperDetail({ payload }, { call, put }) {//点击试卷查询试卷详情
      const response = yield call(queryPaperDetails, payload);
      let idList = "";
      if (response && response.data) {
        for (let i in response.data.paperInstance) {
          if (response.data.paperInstance[i].pattern) {
            idList = idList + "," + response.data.paperInstance[i].pattern.questionPatternId;
          }
        }
        let idLists = {
          idList: idList.slice(1, idList.length)
        }
        const response1 = yield call(fetchPaperShowData, idLists);
        yield put({
          type: 'savePaperDetail',
          paperData: response && response.data,
          showData: response1 && response1.data,
        });
      }
    },
    *fetchCustomPaperDetail({ payload }, { call, put }) {// 点击试卷查询试卷详情
      const response = yield call(queryMyPaperDetails, payload);
      let idList = "";
      if (response && response.data) {
        for (let i in response.data.paperInstance) {
          if (response.data.paperInstance[i].pattern) {
            idList = idList + "," + response.data.paperInstance[i].pattern.questionPatternId;
          }
        }
        let idLists = {
          idList: idList.slice(1, idList.length)
        }
        const response1 = yield call(fetchPaperShowData, idLists);
        yield put({
          type: 'savePaperDetail',
          paperData: response && response.data,
          showData: response1 && response1.data,
        });
      }
    },
  },
  reducers: {
    clearCache(state) {
      return {
        ...state,
        taskOverview: null, // 任务信息
        transcript: null,    // 成绩单
      }
    },
    saveExerciseTaskOverview(state, { payload }) {
      return {
        ...state,
        taskOverview: payload
      }
    },
    saveExerciseTranscript(state, { payload }) {
      return {
        ...state,
        transcript: payload
      }
    },
    savePaperDetail(state, action) {
      return {
        ...state,
        paperData: action.paperData,
        showData: action.showData
      };
    },
    saveTeacherPaperInfo(state, action) {
      return {
        ...state,
        teacherPaperInfo: action.payload
      }
    }
  }
}
