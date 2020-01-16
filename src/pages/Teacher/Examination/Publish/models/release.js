import {
  queryPaperDetails,
  fetchPaperShowData,
  queryPaperResource,
  queryClassDetail,
  queryYears,
  queryDifficult,
  queryAccountGrade,
  queryPaperTemplates,
  publishTask,
  queryMyPaper,
  queryGrade,
  queryMyPaperDetails,
} from '@/services/teacher';
import { MatchUnitType } from '@/frontlib/utils/utils';
/**
 * @Author   tina.zhang
 * 发布页面的数据处理
 * @DateTime  2018-09-21
 */
export default {
  namespace: 'release',

  state: {
    grade: [],
    years: {},
    difficulty: [],
    distribution: [], // 分卷方式
    strategy: [], // 考试策略
    rectify: [], // 人工纠偏
    distributeType: 'DT_1',
    examType: 'ET_1',
    rectifyType: 'NOTHING',
    selectedTeacher: {}, // 代课教师
    currentPaperDetail: '',
    paperSelected: [],
    typeList: {},
    paperList: [],
    myPaperList: [],
    classList: { learningGroup: [], naturalClass: [], teachingClass: [] },
    myClassList: [],
    JointyClassList: [],
    responseCode: '200',
    responseMsg: '',
    taskType: '', // 第一步保存所选的类型
    checkStudentList: [],
    joinStudentList: [],
    showData: {},
    choosedNum: 0,
    mystudentListNum: 0,
    selectedClass: [],
    templates: [],
    publishSaveData: {},
    classType: 'NATURAL_CLASS',
    gradeIndex: '',
    gradeValue: '不限',
  },

  effects: {
    *saveTaskType({ payload }, { put }) {
      // 保存选择的发布类型
      yield put({
        type: 'changeTaskType',
        taskType: payload.taskType,
      });
    },

    *fetchSaveTask({ payload }, { call }) {
      // 第三步确认发布任务
      const response = yield call(publishTask, payload);

      return response;
    },
    *fetchPaper({ payload }, { call, put }) {
      // 查询试卷列表
      const response = yield call(queryPaperResource, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'savePaper',
        payload: response && response.data,
      });
    },
    *getDictData({ callback }, { select }) {
      const dictionary = yield select(state => state.dictionary);
      console.log(dictionary);
      callback(dictionary);
    },
    *fetchClass({ payload }, { call, put, select }) {
      // 查询班级列表
      const { teacherId } = yield select(state => state.teacher.userInfo);
      console.log(teacherId);
      localStorage.setItem('teacherId', teacherId);
      const response = yield call(queryClassDetail, { ...payload, teacherId });
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveClass',
        payload: response && response.data,
      });
    },

    *fetchPaperSelected({ payload }, { put }) {
      // 保存所选试卷
      const response = payload.selectedPaper;
      yield put({
        type: 'savePaperSelected',
        payload: response,
      });
    },
    *fetchPaperTemplates({ payload }, { call, put }) {
      // 查询我的试卷列表
      const response = yield call(queryPaperTemplates, payload);
      yield put({
        type: 'saveTemplates',
        payload: response && response.data,
      });
    },
    *fetchPaperDetail({ payload }, { call, put }) {
      // 点击试卷查询试卷详情
      const response = yield call(
        payload.paperType === '1' ? queryPaperDetails : queryMyPaperDetails,
        payload
      );

      let idList = '';
      if (response && response.data) {
        response.data.paperInstance.forEach(item => {
          if (item.pattern) {
            idList = `${idList},${item.pattern.questionPatternId}`;
          }
        });
        // for (let i in response.data.paperInstance) {
        //   if (response.data.paperInstance[i].pattern) {
        //     idList = idList + ',' + response.data.paperInstance[i].pattern.questionPatternId;
        //   }
        // }

        const idLists = {
          idList: idList.slice(1, idList.length),
        };
        const response1 = yield call(fetchPaperShowData, idLists);
        yield put({
          type: 'savePaperDetail',
          paperData: response && response.data,
          showData: response1 && response1.data,
        });
      }
    },
    *fetchGrade({ payload, callback }, { call, put, select }) {
      // 查询年级
      const response = yield call(queryAccountGrade, payload);
      const {
        userInfo: { teacherId },
      } = yield select(state => state.teacher);
      let dataSource = [];
      const current = response.data.find(vo => vo.teacherId === teacherId);
      if (current && current.gradeList && current.gradeList.length > 0) {
        dataSource = current.gradeList;
        yield put({
          type: 'saveGrade',
          payload: current.gradeList,
        });
      } else if (current.isAdmin) {
        const res = yield call(queryGrade, payload);
        const { responseCode, data } = res;
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'saveGrade',
          payload: res && res.data,
        });
        dataSource = res.data;
      } else {
        yield put({
          type: 'saveGrade',
          payload: [],
        });
      }

      callback(dataSource);
    },

    *fetchYears({ payload }, { call, put }) {
      // 查询年度
      const response = yield call(queryYears, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveYears',
        payload: response && response.data,
      });
    },
    *fetchDifficult({ payload }, { call, put }) {
      // 查询难度
      const response = yield call(queryDifficult, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveDifficult',
        payload: response && response.data,
      });
    },
    *fetchMyPaper({ payload }, { call, put }) {
      // 查询我的组卷
      const response = yield call(queryMyPaper, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveMyPaper',
        payload: response && response.data,
      });
    },
  },

  reducers: {
    initData(state) {
      return {
        ...state,
        currentPaperDetail: '',
      };
    },
    changeJoinStudentList(state, action) {
      return {
        ...state,
        joinStudentList: action.joinStudentList,
      };
    },
    changeStudentList(state, action) {
      return {
        ...state,
        checkStudentList: action.checkStudentList,
      };
    },
    changeTaskType(state, action) {
      return {
        ...state,
        taskType: action.taskType,
        checkStudentList: [],
        joinStudentList: [],
      };
    },
    saveTaskData(state, action) {
      return {
        ...state,
        responseCode: action.payload,
      };
    },
    saveClass(state, action) {
      return {
        ...state,
        classList: action.payload,
        distributeType: 'DT_1',
        examType: 'ET_1',
        rectifyType: 'NOTHING',
        selectedTeacher: {}, // 代课教师
        currentPaperDetail: '',
        typeList: {},
        choosedNum: 0,
        mystudentListNum: 0,
        selectedClass: [],
        templates: [],
        publishSaveData: {},
        classType: 'NATURAL_CLASS',
      };
    },
    saveClassInfo(state, action) {
      const gradeList = action.grade;
      let number = 0;
      let mystudentListNum = 0;
      const myteacherId = localStorage.getItem('teacherId');
      gradeList.classList.forEach(item => {
        if (item.isChoosed && item.choosedNum) {
          number += item.choosedNum;
          if (item.teacherId === myteacherId) {
            mystudentListNum += item.choosedNum;
          }
        }

        if (item.learningGroupList) {
          item.learningGroupList.forEach(vo => {
            if (vo.isChoosed) {
              number += vo.choosedNum;
              if (vo.teacherId === myteacherId) {
                mystudentListNum += vo.choosedNum;
              }
            }
          });
          // for (let n in item.learningGroupList) {
          //   if (item.learningGroupList[n].isChoosed) {
          //     number = number + item.learningGroupList[n].choosedNum;
          //     if (item.learningGroupList[n].teacherId === myteacherId) {
          //       mystudentListNum =
          //         mystudentListNum + item.learningGroupList[n].choosedNum;
          //     }
          //   }
          // }
        }
      });
      // for (let i in gradeList.classList) {
      //   if (gradeList.classList[i].isChoosed && gradeList.classList[i].choosedNum) {
      //     number = number + gradeList.classList[i].choosedNum;
      //     if (gradeList.classList[i].teacherId === myteacherId) {
      //       mystudentListNum = mystudentListNum + gradeList.classList[i].choosedNum;
      //     }
      //   }

      //   if (gradeList.classList[i].learningGroupList) {
      //     for (let n in gradeList.classList[i].learningGroupList) {
      //       if (gradeList.classList[i].learningGroupList[n].isChoosed) {
      //         number = number + gradeList.classList[i].learningGroupList[n].choosedNum;
      //         if (gradeList.classList[i].learningGroupList[n].teacherId === myteacherId) {
      //           mystudentListNum =
      //             mystudentListNum + gradeList.classList[i].learningGroupList[n].choosedNum;
      //         }
      //       }
      //     }
      //   }
      // }
      return {
        ...state,
        classList: action.payload,
        choosedNum: number,
        mystudentListNum,
      };
    },

    saveMyClass(state, action) {
      return {
        ...state,
        myClassList: action.payload,
      };
    },
    saveJointClass(state, action) {
      return {
        ...state,
        JointyClassList: action.payload,
      };
    },
    savePaper(state, action) {
      return {
        ...state,
        paperList: action.payload,
      };
    },

    savePaperSelected(state, action) {
      return {
        ...state,
        paperSelected: action.payload,
      };
    },
    saveMyPaper(state, action) {
      return {
        ...state,
        myPaperList: action.payload,
      };
    },
    savePaperDetail(state, action) {
      return {
        ...state,
        currentPaperDetail: action.paperData,
        showData: action.showData,
      };
    },
    saveGrade(state, action) {
      return {
        ...state,
        grade: action.payload,
      };
    },
    saveYears(state, action) {
      return {
        ...state,
        years: action.payload,
      };
    },
    saveDifficult(state, action) {
      return {
        ...state,
        difficulty: action.payload,
      };
    },
    saveType(state, action) {
      return {
        ...state,
        typeList: action.payload,
      };
    },
    saveDistribution(state, action) {
      return {
        ...state,
        distribution: action.payload,
      };
    },
    saveStrategy(state, action) {
      return {
        ...state,
        strategy: action.payload,
      };
    },
    saveRectify(state, action) {
      return {
        ...state,
        rectify: action.payload,
      };
    },

    saveExamSetting(state, action) {
      return {
        ...state,
        distributeType: action.distributeType,
        examType: action.examType,
        rectifyType: action.rectifyType,
      };
    },

    saveTeacherInfo(state, action) {
      return {
        ...state,
        selectedTeacher: { ...action.payload, campusId: localStorage.getItem('campusId') },
      };
    },
    saveSelectedClass(state, action) {
      return {
        ...state,
        selectedClass: action.payload,
        gradeIndex: action.gradeIndex,
        gradeValue: action.gradeValue,
      };
    },
    saveTemplates(state, action) {
      return {
        ...state,
        templates: action.payload,
      };
    },
    saveClassType(state, action) {
      return {
        ...state,
        classType: action.payload,
      };
    },

    savePublishTaskData(state) {
      const paperList = [];
      state.paperSelected.forEach(vo => {
        paperList.push({
          paperId: vo.id,
          name: vo.name,
          gradeValue: vo.gradeValue,
          paperTime: vo.paperTime,
          fullMark: vo.fullMark,
          paperName: vo.paperName,
          templateName: vo.templateName,
          paperScopeValue: vo.paperScopeValue,
          unitId: vo.unitId,
          scopeName: MatchUnitType(vo),
        });
      });
      // for (let i in state.paperSelected) {
      //   paperList.push({
      //     paperId: state.paperSelected[i].id,
      //     name: state.paperSelected[i].name,
      //     gradeValue: state.paperSelected[i].gradeValue,
      //     paperTime: state.paperSelected[i].paperTime,
      //     fullMark: state.paperSelected[i].fullMark,
      //     paperName: state.paperSelected[i].paperName,
      //     templateName: state.paperSelected[i].templateName,
      //     paperScopeValue: state.paperSelected[i].paperScopeValue,
      //     unitId: state.paperSelected[i].unitId,
      //     scopeName: MatchUnitType(state.paperSelected[i]),
      //   });
      // }

      let str = '';
      if (state.selectedClass.length === 1) {
        str = state.selectedClass[0].className || state.selectedClass[0].name;
      } else if (state.selectedClass[0].classType === 'LEARNING_GROUP') {
        str = `${state.selectedClass[0].name}等${state.selectedClass.length}个组`;
      } else {
        str = `${state.selectedClass[0].className}等${state.selectedClass.length}个班`;
      }

      switch (state.taskType) {
        case 'TT_1':
          str = `${str}模考`;
          break;
        case 'TT_2':
          str = `${str}训练`;
          break;
        case 'TT_3':
          str = `${str}'联考`;
          break;
        default:
          break;
      }

      const myDate = new Date();

      str = `${str}${myDate.getFullYear()}${`0${myDate.getMonth() + 1}`.slice(
        -2
      )}${`0${myDate.getDate()}`.slice(-2)}`;

      const saveData = {
        name: str,
        campusId: localStorage.getItem('campusId'),
        type: state.taskType,
        classType: state.classType,
        status: state.status,
        classList: state.selectedClass,
        paperList,
      };

      let teacherArr = [
        {
          teacherId: localStorage.getItem('teacherId'),
          campusId: localStorage.getItem('campusId'),
          teacherName: localStorage.getItem('teacherName'),
          type: 'MASTER',
        },
      ];
      // const suTeacherId = "";
      // if(state.selectedTeacher.campusId){
      //   suTeacherId = state.selectedTeacher.teacherId;
      //   teacherArr.push({...state.selectedTeacher,type:"SUB"})
      // }

      if (state.taskType === 'TT_3') {
        const newArr = [];
        state.selectedClass.forEach(vo => {
          newArr.push({
            teacherId: vo.teacherId,
            campusId: vo.campusId,
            teacherName: vo.teacherName,
            type: 'TEACHER',
          });
        });
        // for (let i in state.selectedClass) {
        //   newArr.push({
        //     teacherId: state.selectedClass[i].teacherId,
        //     campusId: state.selectedClass[i].campusId,
        //     teacherName: state.selectedClass[i].teacherName,
        //     type: 'TEACHER',
        //   });
        // }

        const result = newArr.reduce((init, current) => {
          const maxCode = current.teacherId;
          const index = `${maxCode}`;
          const bax = init;
          if (init.length === 0 || !init[index]) {
            bax[index] = current;
          }
          return bax;
        }, []);

        const teacherArr2 = [];
        result.forEach(vo => {
          teacherArr2.push(vo);
        });
        // for (let i in result) {
        //   teacherArr2.push(result[i]);
        // }

        teacherArr = teacherArr.concat(teacherArr2);
        console.log(teacherArr);
      }
      saveData.teacher = teacherArr;

      if (state.taskType !== 'TT_2') {
        saveData.distributeType = state.distributeType;
        saveData.examType = state.examType;
        saveData.rectifyType = state.rectifyType;
      }
      return {
        ...state,
        publishSaveData: saveData,
      };
    },
    saveCurrent(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.indexOf('/teacher/examination/publish') === -1) {
          dispatch({
            type: 'saveCurrent',
            payload: {
              grade: [],
              years: {},
              difficulty: [],
              distribution: [], // 分卷方式
              strategy: [], // 考试策略
              rectify: [], // 人工纠偏
              distributeType: 'DT_1',
              examType: 'ET_1',
              rectifyType: 'NOTHING',
              selectedTeacher: {}, // 代课教师
              currentPaperDetail: '',
              paperSelected: [],
              typeList: {},
              paperList: [],
              myPaperList: [],
              classList: { learningGroup: [], naturalClass: [], teachingClass: [] },
              myClassList: [],
              JointyClassList: [],
              responseCode: '200',
              responseMsg: '',
              taskType: '', // 第一步保存所选的类型
              checkStudentList: [],
              joinStudentList: [],
              showData: {},
              choosedNum: 0,
              mystudentListNum: 0,
              selectedClass: [],
              templates: [],
              publishSaveData: {},
              classType: 'NATURAL_CLASS',
              gradeIndex: '',
              gradeValue: '不限',
            },
          });
        }
      });
    },
  },
};
