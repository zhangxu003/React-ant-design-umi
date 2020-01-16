
import { 
    getTaskOverview, 
    getExamNum, 
    tsmkTaskDetail, 
    publishGrade, 
    getReportOverview, 
    getRankingList, 
    getTranscript, 
    getTranscriptSuggest, 
    getStudentReportOverview, 
    setStudentScoreRate, 
    fetchPaperShowData, 
    getPaperSapshot, 
    getTeacherSubquestion, 
    getStudentSubquestion, 
    getStudentSubquestionSpeech, 
    getStudentAnswerReport,
} from '@/services/api';
import { OptionDisturb, sequenceDisrupted } from '@/frontlib/utils/utils';

export default {
  namespace: 'report',
  state: {
    taskOverview: null,   // 任务信息
    examNum: null,         // 学生答卷人数
    taskStatus: null,     // 任务状态
    reportOverView: null, // 考试情况总览
    rankingList: null,     // 考试情况总览 - 排名分布
    transcript: null,   // 成绩单
    suggestResult: null, // 建议关注
    studentReportOverview: null, // 学生报告总览
    showData: {}, // 试题渲染数据
    paperData: {}, // 试卷快照数据
    teacherPaperInfo: {},// 教师详情页试卷结构
    studentAnswer: [],// 学生答案信息
    studentPaper: {},// 学生试卷报告数据信息
  },
  effects: {
    *clearCache({ payload }, { call, put }) {
      yield put({
        type: 'handleClearCache',
        payload,
      });
    },
    /* 教师报告 */
    *getPaperSapshot({ payload, callback }, { call, put }) {
      const response = yield call(getPaperSapshot, payload);
      yield put({
        type: 'savePaperData',
        payload: response,
      });
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *getTeacherPaperInfo({ payload, callback }, { call, put }) {
      const response = yield call(getTeacherSubquestion, payload)
      yield put({
        type: 'saveTeacherPaperInfo',
        payload: response,
      });
    },

    *fetchPaperShowData({ payload }, { call, put }) {
      const response = yield call(fetchPaperShowData, payload);
      yield put({
        type: 'saveShowData',
        payload: response,
      });
    },

    /* 教师报告 */
    // 任务信息
    *getTaskOverview({ payload }, { call, put }) {
      const res = yield call(getTaskOverview, payload);
      yield put({
        type: 'saveTaskOverview',
        payload: res.data
      })
      return res;
    },
    // 获取任务状态
    *getTaskStatus({ payload }, { call, put }) {
      const res = yield call(tsmkTaskDetail, payload);
      yield put({
        type: 'saveTaskStatus',
        payload: res.data
      });
      return res;
    },
    // 学生答卷人数
    *getExamNum({ payload }, { call, put }) {
      const res = yield call(getExamNum, payload);
      return res
    },
    // 发布成绩
    *publishGrade({ payload }, { call, put }) {
      const res = yield call(publishGrade, payload);
      if (res.responseCode === '200') {
        yield put({
          type: 'savePublishGrade',
          payload: res.data
        })
      }
      return res;
    },
    // 教师报告总览
    *getReportOverview({ payload }, { all, call, put }) {
      const [res1, res2] = yield all([
        call(getReportOverview, payload),
        call(getRankingList, payload)
      ])
      const resData = { reportOverview: res1.data, rankingList: res2.data };
      yield put({
        type: 'saveReportOverview',
        payload: resData
      })
      return { res1, res2 };
    },
    // 成绩单&建议关注
    *getTranscript({ payload }, { all, call, put }) {
      const { campusId, taskId, paperId, classIdList } = payload;
      const [res1, res2] = yield all([
        call(getTranscript, payload),
        call(getTranscriptSuggest, { campusId, taskId, paperId, classIdList })
      ])
      const resData = { transcript: res1.data, suggestResult: res2.data };
      yield put({
        type: 'saveTranscript',
        payload: resData
      })
      return res1;
    },
    // 成绩单分页
    *refreshTranscriptTable({ payload }, { call, put }) {
      const res = yield call(getTranscript, payload);
      yield put({
        type: 'refreshTranscript',
        payload: res.data
      })
      return res
    },
    *getStudentReportOverview({ payload }, { call, put }) {
      const res = yield call(getStudentReportOverview, payload);
      yield put({
        type: 'saveStudentReportOverview',
        payload: res.data
      });
      return res;
    },
    *setStudentScoreRate({ payload }, { call, put }) {
      const res = yield call(setStudentScoreRate, payload);
      return res;
    },
    *getStudentSubquestion({ payload, callback }, { call, put }) {
      const res = yield call(getStudentSubquestion, payload);
      if (res) {
        if (callback) {
          callback(res);
        }
      }
    },
    *getStudentSubquestionSpeech({ payload, callback }, { call, put }) {
      const res = yield call(getStudentSubquestionSpeech, payload);
      let show=[]
      let data=[]
      if (res) {
        if (callback) {
          callback(res);
        }
      }
    },
    *getStudentAnswerReport({ payload }, { call, put }) {
      const res = yield call(getStudentAnswerReport, payload);
      yield put({
        type: 'saveStudentAnswer',
        payload: res.data
      })
      return res;
    }
  },
  reducers: {
    handleClearCache(state, action) {
      if(action.payload.type&&action.payload.type==="student"){
        return {
          ...state,
          studentReportOverview: null, // 学生报告总览
        }
      }else{
        return {
          ...state,
          taskOverview: null,   // 任务信息
          examNum: null,         // 学生答卷人数
          reportOverView: null, // 考试情况总览
          rankingList: null,     // 考试情况总览 - 排名分布
          transcript: null,   // 成绩单
          suggestResult: null, // 建议关注
          studentReportOverview: null, // 学生报告总览
          showData: {},
        }
      }
    },

    saveTaskOverview(state, action) {
      return {
        ...state,
        taskOverview: action.payload
      }
    },
    saveTaskStatus(state, action) {
      const { status, linkStatus } = action.payload;
      return {
        ...state,
        taskStatus: { status, linkStatus }
      }
    },
    savePublishGrade(state) {
      return {
        ...state,
        taskStatus: { status: 'TS_5', linkStatus: 'ES_21' }
      }
    },
    saveReportOverview(state, action) {
      const { reportOverview, rankingList } = action.payload;
      return {
        ...state,
        reportOverview,
        rankingList
      }
    },
    saveTranscript(state, action) {
      const { transcript, suggestResult } = action.payload;
      return {
        ...state,
        transcript,
        suggestResult,
      }
    },
    refreshTranscript(state, action) {
      return {
        ...state,
        transcript: action.payload
      }
    },
    saveStudentReportOverview(state, action) {
      return {
        ...state,
        studentReportOverview: action.payload
      }
    },

    saveShowData(state, action) {
      return {
        ...state,
        showData: action.payload.data,
      };
    },
    savePaperData(state, action) {
      return {
        ...state,
        showData: {},// 每次请求新的试卷快照后，先清空showData数据
        paperData: action.payload.data
      };
    },
    saveTeacherPaperInfo(state, action) {
      return {
        ...state,
        teacherPaperInfo: action.payload.data
      };
    },
    saveStudentAnswer(state, action) {
      let paperData = OptionDisturb(state.paperData, action.payload)//选项打乱
      paperData = sequenceDisrupted(paperData, action.payload)//题序打乱
      return {
        ...state,
        studentAnswer: action.payload,
        paperData: paperData,
      };
    }
  }
}

