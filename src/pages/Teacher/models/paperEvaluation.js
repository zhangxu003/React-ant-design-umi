/* eslint-disable no-lonely-if */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
import { countDown } from '@/utils/timeHandle';
import { formatMessage, defineMessages } from 'umi/locale';
import { getOneAnswerDetail, getOneAnswerList, getOneAnswerextend } from '@/services/api';

const messages = defineMessages({
  introLabel: {
    id: 'app.open.book.intro.label',
    defaultMessage: '开卷介绍',
  },
});
// teacher 学生相关状态库
export default {
  namespace: 'paperEvaluation',

  state: {
    masterData: null,
    studentId: null,
    studentAnswer: [],
    isCanSee: false,
    answerStatics: {},
    answerList: [],
  },

  effects: {
    *assemblyData({ payload }, { put }) {
      const { data, invalidate, showData } = payload;
      const master = {
        controlStatus: 'STATIC', // PLAY动态播放/PAUSE动态暂停/STATIC静态待命
        isRedording: 'N', // 启动录音时，大部分事件失效，通过这个信号量控制
        scene: 'EDIT', // SHOW展示/EDIT编辑试卷/CORRECT修正/VERIFY校对//EXERCISE练习
        coverRate: data.coverRate, // 任务完成度百分比
        paperTime: (data.paperTime && countDown(data.paperTime)) || 0, // 试卷时间
        allowChooseQuestion: data.allowChooseQuestion,
        staticIndex: {
          mainIndex: 1, // 大题序号，注意0为开卷介绍，从1开始是标准题型，初始0
          questionIndex: 0, // 题目序号，复合题型为子题型序号，初始0
          // "subIndex":0    //小题序号（二层才有，含复合下的二层），初始0
        },
        mains: [],
      };
      const { paperInstance } = data;
      const questions = new Array(paperInstance.length + 1);

      let paperHeadStatus = 0;

      if (data.paperHead.paperHeadName != undefined && data.paperHead.paperHeadName != '') {
        paperHeadStatus = 100;
        // 判断校对
        // const { ExampaperStatus } = this.props;
        const ExampaperStatus = '';
        if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
          if (invalidate && invalidate.paperHead) {
            const paperHeadVo = invalidate.paperHead;
            console.log(paperHeadVo.verifyStatus);
            if (paperHeadVo.verifyStatus == 300) {
              paperHeadStatus = 100;
            }
            if (paperHeadVo.verifyStatus == 0) {
              paperHeadStatus = 300;
            }
            if (
              paperHeadVo.verifyStatus == '200' ||
              paperHeadVo.verifyStatus == '100' ||
              paperHeadVo.verifyStatus == '250'
            ) {
              paperHeadStatus = 200;
            }
            // if ((paperHeadVo.verifyStatus == '200' || paperHeadVo.verifyStatus == '250') && ExampaperStatus == 'VALIDATE') {
            //   paperHeadStatus = 0;
            // }
          } else {
            paperHeadStatus = 0;
          }
        }
      }
      questions[0] = {
        // 单个大题（含开卷）
        index: 0,
        type: 'INTRODUCTION', // 开卷介绍
        label: formatMessage(messages.introLabel),
        multipleQuestionPerPage: 'N', // 一页多题
        questions: [
          {
            // 单个题目
            index: 0,
            subs: ['i'], // subs里面是小题题序的数组，主要用于生成导航
            type: 'INTRODUCTION',
            status: paperHeadStatus, // 状态，不同视图下对应不同的内容，但颜色和数字统一
            pageSplit: 'N',
            answerStatus: window.ExampaperStatus === 'EXAM' ? 'Y' : 'N',
          },
        ],
      };
      for (const i in paperInstance) {
        paperInstance[i].sss = 123;
        const m = Number(i) + 1;
        if (paperInstance[i].type == null || paperInstance[i].type == 'PATTERN') {
          const { pattern } = paperInstance[i];
          questions[m] = {};
          questions[m].index = m;
          questions[m].type = pattern.questionPatternType;
          if (pattern.mainPatterns.questionPatternInstanceName != undefined) {
            questions[m].newLabel =
              (pattern.mainPatterns.questionPatternInstanceSequence || '') +
              pattern.mainPatterns.questionPatternInstanceName;
          }
          questions[m].label =
            pattern.mainPatterns.questionPatternInstanceName || pattern.questionPatternName;
          questions[m].multipleQuestionPerPage = 'N';
          if (pattern.questionPatternType == 'COMPLEX') {
            // 复合题型拼装数据
            const patternGroups = pattern.groups;
            questions[m].questions = new Array(Number(patternGroups.length));
            for (let j = 0; j < Number(patternGroups.length); j++) {
              // 复合题型下面的题型是种类数
              questions[m].questions[j] = {};

              if (
                showData &&
                showData[pattern.questionPatternId] &&
                showData[pattern.questionPatternId].structure.groups[j].structure.flowInfo
              ) {
                // 允许合并答题
                questions[m].questions[j].allowMultiAnswerMode =
                  showData[pattern.questionPatternId].structure.groups[
                    j
                  ].structure.flowInfo.allowMultiAnswerMode;
              } else {
                questions[m].questions[j].allowMultiAnswerMode = 'N';
              }

              if (patternGroups[j].pattern.hints) {
                questions[m].questions[j].hints = patternGroups[j].pattern.hints[0];
              }

              questions[m].questions[j].type = patternGroups[j].pattern.questionPatternType;
              questions[m].questions[j].markRatio =
                patternGroups[j].pattern.mainPatterns.markRatio || '1';
              questions[m].questions[j].index = Number(j);

              if (
                paperInstance[i].questions[0] != null &&
                paperInstance[i].questions[0].id != undefined
              ) {
                questions[m].questions[j].status = 100;
                // 制卷完成判断校对
                const questionID = paperInstance[i].questions[0].id;

                questions[m].questions[j].answerStatus = 'N';
                // const { ExampaperStatus } = this.props;
                const ExampaperStatus = '';
                if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
                  questions[m].questions[j].status = 0;
                  if (invalidate && invalidate.mains) {
                    invalidate.mains.map(item => {
                      if (item && item.verifies) {
                        item.verifies.map(vo => {
                          if (vo.questionId == questionID) {
                            if (vo.verifyStatus == 300) {
                              questions[m].questions[j].status = 100;
                            }
                            if (vo.verifyStatus == 0) {
                              questions[m].questions[j].status = 300;
                            }
                            if (
                              vo.replierName != null ||
                              vo.verifyStatus == '200' ||
                              vo.verifyStatus == '100'
                            ) {
                              questions[m].questions[j].status = 200;
                            }
                            if (
                              (vo.verifyStatus == '200' || vo.verifyStatus == '250') &&
                              ExampaperStatus == 'VALIDATE'
                            ) {
                              questions[m].questions[j].status = 0;
                            }
                            if (vo.verifyStatus == '250' && ExampaperStatus == 'CORRECT') {
                              questions[m].questions[j].status = 200;
                            }
                          }
                        });
                      }
                    });
                  }
                }
              } else {
                questions[m].questions[j].status = 0;
              }
              questions[m].questions[j].answerStatus = 'N';

              if (window.ExampaperStatus == 'EXAM') {
                try {
                  if (
                    paperInstance[i].questions[0].data.groups[j].data.totalPoints ||
                    paperInstance[i].questions[0].data.groups[j].data.totalPoints == 0
                  ) {
                    questions[m].questions[j].answerStatus = 'Y';
                  }
                } catch (e) {
                  console.error(e);
                }
              }

              questions[m].questions[j].pageSplit = 'N';

              questions[m].questions[j].subs = [];
              const patternComplex = patternGroups[j].pattern;
              if (patternComplex.sequenceNumber) {
                questions[m].questions[j].subs = patternComplex.sequenceNumber[0];
              } else {
                for (let l = 0; l < Number(patternComplex.mainPatterns.questionCount); l++) {
                  // 每道题型的大题个数

                  if (patternComplex.questionPatternType == 'NORMAL') {
                    questions[m].multipleQuestionPerPage = 'Y';
                    if (j != 0) {
                      // 获取上个题型最大题号
                      const maxLength = questions[m].questions[Number(j) - 1].subs.length;
                      const beforeNum = Number(
                        questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                      );

                      questions[m].questions[j].subs.push(beforeNum + (Number(l) + 1));
                    } else {
                      questions[m].questions[j].subs = [Number(l) + 1];
                    }
                  } else if (patternComplex.questionPatternType == 'TWO_LEVEL') {
                    const subQuestionCount = patternComplex.mainPatterns.subQuestionCount; // 二层题型小题个数

                    for (let k = 0; k < Number(subQuestionCount); k++) {
                      if (j != 0) {
                        const maxLength = questions[m].questions[Number(j) - 1].subs.length;
                        const beforeNum = Number(
                          questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                        );
                        questions[m].questions[j].subs.push(beforeNum + (Number(k) + 1));
                      } else {
                        questions[m].questions[j].subs.push(Number(k) + 1);
                      }
                    }
                  }
                }
              }
            }
          } else {
            // 普通，二层题型拼装数据
            questions[m].questions = new Array(Number(pattern.mainPatterns.questionCount));

            for (let j = 0; j < Number(pattern.mainPatterns.questionCount); j++) {
              questions[m].questions[j] = {};
              questions[m].questions[j].type = pattern.questionPatternType;
              questions[m].questions[j].markRatio = pattern.mainPatterns.markRatio || '1';
              questions[m].questions[j].index = Number(j);

              if (pattern.hints) {
                questions[m].questions[j].hints = pattern.hints[j];
              }
              if (showData && showData[pattern.questionPatternId]) {
                // 允许合并答题
                questions[m].questions[j].allowMultiAnswerMode =
                  showData[pattern.questionPatternId].structure.flowInfo.allowMultiAnswerMode;
              } else {
                questions[m].questions[j].allowMultiAnswerMode = 'N';
              }

              if (
                paperInstance[i].questions[j] != null &&
                paperInstance[i].questions[j].id != undefined
              ) {
                questions[m].questions[j].status = 100;
                // 制卷完成判断校对
                const questionID = paperInstance[i].questions[j].id;
                // const { ExampaperStatus } = this.props;
                const ExampaperStatus = '';
                if (ExampaperStatus == 'VALIDATE' || ExampaperStatus == 'CORRECT') {
                  questions[m].questions[j].status = 0;
                  if (invalidate && invalidate.mains) {
                    invalidate.mains.map(item => {
                      if (item && item.verifies) {
                        item.verifies.map(vo => {
                          if (vo.questionId == questionID) {
                            if (vo.verifyStatus == 300) {
                              questions[m].questions[j].status = 100;
                            }
                            if (vo.verifyStatus == 0) {
                              questions[m].questions[j].status = 300;
                            }
                            if (
                              vo.replierName != null ||
                              vo.verifyStatus == '200' ||
                              vo.verifyStatus == '100'
                            ) {
                              questions[m].questions[j].status = 200;
                            }
                            if (
                              (vo.verifyStatus == '200' || vo.verifyStatus == '250') &&
                              ExampaperStatus == 'VALIDATE'
                            ) {
                              questions[m].questions[j].status = 0;
                            }
                            if (vo.verifyStatus == '250' && ExampaperStatus == 'CORRECT') {
                              questions[m].questions[j].status = 200;
                            }
                          }
                        });
                      }
                    });
                  }
                }
              } else {
                questions[m].questions[j].status = 0;
              }
              if (pattern.questionPatternType == 'NORMAL') {
                // 普题型分页
                if (pattern.pageSplit) {
                  // eslint-disable-next-line no-restricted-syntax
                  for (const pageIndex in pattern.pageSplit) {
                    if (pattern.pageSplit[pageIndex] == j) {
                      questions[m].questions[j].pageSplit = 'Y';
                      break;
                    } else {
                      questions[m].questions[j].pageSplit = 'N';
                    }
                  }
                } else {
                  questions[m].questions[j].pageSplit = 'N';
                }
              } else {
                questions[m].questions[j].pageSplit = 'N';
              }
              questions[m].questions[j].answerStatus = 'N';
              if (window.ExampaperStatus == 'EXAM') {
                try {
                  if (
                    paperInstance[i].questions[j].data.totalPoints ||
                    paperInstance[i].questions[j].data.totalPoints == 0
                  ) {
                    questions[m].questions[j].answerStatus = 'Y';
                  }
                } catch (e) {
                  console.error(e);
                }
              }

              if (pattern.sequenceNumber) {
                questions[m].questions[j].subs = pattern.sequenceNumber[j];
              } else if (pattern.questionPatternType == 'NORMAL') {
                questions[m].multipleQuestionPerPage = 'Y';
                questions[m].questions[j].subs = [`${Number(j) + 1}`];
              } else if (pattern.questionPatternType == 'TWO_LEVEL') {
                let subQuestionCount = pattern.subQuestionPatterns[j].subQuestionCount;
                if (subQuestionCount == 0) {
                  subQuestionCount = pattern.mainPatterns.subQuestionCount;
                }
                questions[m].questions[j].subs = [];

                for (let k = 0; k < Number(subQuestionCount); k++) {
                  if (j != 0) {
                    const maxLength = questions[m].questions[Number(j) - 1].subs.length;
                    const beforeNum = Number(
                      questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                    );
                    questions[m].questions[j].subs.push(`${beforeNum + (Number(k) + 1)}`);
                  } else {
                    questions[m].questions[j].subs.push(`${Number(k) + 1}`);
                  }
                }
              }
            }
          }
        } else if (paperInstance[i].type == 'SPLITTER') {
          // 分隔页
          const splitter = paperInstance[i].splitter;
          questions[m] = {};
          questions[m].index = m;
          questions[m].type = paperInstance[i].type;
          questions[m].label = splitter.content;
          questions[m].multipleQuestionPerPage = 'N';
          questions[m].questions = [];
          questions[m].questions[0] = {};
          questions[m].questions[0].index = 0;
          questions[m].questions[0].type = paperInstance[i].type;
          questions[m].questions[0].status = 0;
          questions[m].questions[0].pageSplit = 'N';
          questions[m].questions[0].answerStatus = 'N';
        } else if (paperInstance[i].type == 'RECALL') {
          // 回溯
          const recall = paperInstance[i].recall;
          questions[m] = {};
          questions[m].index = m;
          questions[m].type = paperInstance[i].type;
          questions[m].label = 'recall';
          questions[m].questions = [];
          questions[m].questions[0] = {};
          questions[m].questions[0].index = 0;
          questions[m].questions[0].type = paperInstance[i].type;
          questions[m].questions[0].status = 0;
          questions[m].questions[0].pageSplit = 'N';
          questions[m].questions[0].answerStatus = 'N';
        }
      }
      master.mains = questions;
      yield put({
        type: 'setMasterData',
        payload: {
          masterData: master,
        },
      });
      return master;
    },

    /**
     * @Author   tina.zhang
     * @DateTime  2018-10-18
     * @copyright 左侧点击导航切换
     * @param     {[type]}    item          二层题型序号
     * @param     {[type]}    mainIndex     大题序号
     * @param     {[type]}    questionIndex 小题序号
     * @param     {[type]}    type          题型类型
     * @return    {[type]}                  [description]
     */
    *changeFocusIndex({ payload }, { put, call, select }) {
      const { item, mainIndex, questionIndex, type, questionId } = payload;
      const { masterData, snapshotId, taskId, classId } = yield select(
        state => state.paperEvaluation
      );
      const { paperData } = yield select(state => state.exerciseReport);
      const newData = JSON.parse(JSON.stringify(masterData));

      const resp = yield call(getOneAnswerList, {
        taskId,
        snapshotId,
        classId,
        subquestionNo: questionId,
      });

      const res = yield call(getOneAnswerextend, {
        taskId,
        snapshotId,
        classId,
        subquestionNo: questionId,
      });

      console.log(questionId);

      newData.staticIndex.mainIndex = mainIndex;
      newData.staticIndex.questionIndex = questionIndex;
      if (type == 'TWO_LEVEL') {
        newData.staticIndex.subIndex = item;
      } else {
        delete newData.staticIndex.subIndex;
      }

      yield put({
        type: 'setMasterData',
        payload: {
          masterData: newData,
          answerStatics: res.data.answerStatics,
          answerList: resp.data,
        },
      });
    },

    // 获取答题详情
    *fetchAnswerData({ payload }, { call, put, select }) {
      const { masterData, snapshotId, taskId, classId } = yield select(
        state => state.paperEvaluation
      );
      const { paperData } = yield select(state => state.exerciseReport);
      let questionId = '';
      const paperInstance = paperData.paperInstance[0];
      const { pattern } = paperData.paperInstance[0];
      if (pattern.questionPatternType == 'NORMAL') {
        questionId = paperInstance.questions[0].id;
      } else if (pattern.questionPatternType == 'COMPLEX') {
        if (paperInstance.questions[0].data.groups[0].data.patternType === 'NORMAL') {
          questionId = paperInstance.questions[0].data.groups[0].id;
        } else {
          if (
            paperInstance.questions[0].data.groups[0].data &&
            paperInstance.questions[0].data.groups[0].data.subQuestion
          ) {
            questionId = paperInstance.questions[0].data.groups[0].data.subQuestion[0].id;
          }
        }
      } else {
        if (paperInstance.questions[0].data && paperInstance.questions[0].data.subQuestion) {
          questionId = paperInstance.questions[0].data.subQuestion[0].id;
        }
      }

      const res = yield call(getOneAnswerextend, {
        taskId,
        snapshotId,
        classId,
        subquestionNo: questionId,
      });

      const resp = yield call(getOneAnswerList, {
        taskId,
        snapshotId,
        classId,
        subquestionNo: questionId,
      });

      yield put({
        type: 'setAnswerStatics',
        payload: {
          answerStatics: res.data.answerStatics,
          answerList: resp.data,
        },
      });
    },

    // 获取试卷答案详情
    *getAnswerDetail({ payload }, { call, put }) {
      if (!payload.studentId) {
        yield put({
          type: 'saveTeacherPaperInfo',
          payload: [],
          taskId: payload.taskId,
          snapshotId: payload.snapshotId,
          classId: payload.classId,
        });
        return null;
      }
      const resp = yield call(getOneAnswerDetail, payload);
      yield put({
        type: 'saveTeacherPaperInfo',
        payload: resp.data,
        taskId: payload.taskId,
        snapshotId: payload.snapshotId,
        classId: payload.classId,
      });
      return resp;
    },
  },

  reducers: {
    // 更新当前页面的state
    setMasterData(state, { payload }) {
      const param = { masterData: payload.masterData };
      if (payload.answerStatics) {
        param.answerStatics = payload.answerStatics;
        param.answerList = payload.answerList;
      }
      return {
        ...state,
        ...param,
      };
    },

    setAnswerStatics(state, { payload }) {
      return {
        ...state,
        answerStatics: payload.answerStatics,
        answerList: payload.answerList,
      };
    },

    // 保存学生ID
    saveStudentId(state, { payload }) {
      return {
        ...state,
        studentId: payload.studentId,
      };
    },

    saveTeacherPaperInfo(state, action) {
      return {
        ...state,
        studentAnswer: action.payload,
        taskId: action.taskId,
        snapshotId: action.snapshotId,
        classId: action.classId,
      };
    },

    saveisCanSee(state, action) {
      return {
        ...state,
        isCanSee: action.payload,
      };
    },
  },
};
