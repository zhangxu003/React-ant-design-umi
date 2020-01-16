/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 创建编辑任务
 * @Date: 2019-02-27 17:39:28
 * @LastEditTime: 2019-05-10 09:33:30
 */


// 教师相关modal处理
import {
  queryNaturalClasses,               // 405: 我的行政班
  queryStratifiedClassList,          // 406：我的分层教学班
  queryClassStudentRelation,         // 407：根据校区ID和年级查询所有行政班
  queryPaperTemplateListByCampusId,  // PROXY-408：查询授权给学校的试卷的试卷范围列表
  queryProxyClazzInfo,               // 409: 获取我的行政班和分层教学班，并获取学生列表
  queryPaperList,                    // 410: 根据校区ID、试卷结构/年级/难易度/学年获取试卷列表
  saveTask                           // 401：保存创建的任务
} from "@/services/teacher";

const defaultState = {
  // 我的行政班
  naturalClassed : [],

  // 我的分层教学班
  stratifiedClassList : [],

  // 获取试卷结果
  paperTemplateList : [],

  // 我的行政班和分层教学班和学生列表
  proxyClazzInfo : [],

  // 根据校区ID和年级查询所有行政班
  relationClass : [],

  // 试卷的数据
  paperInfo : {},

  // 试卷预览数据
  paperData:{},

  showData:{},

};

// teacher 学生相关状态库
export default {
  namespace: 'taskEdit',

  state: defaultState,

  effects: {
    /**
     * @description: 获取我的行政班消息
     * @param {type}
     * @return:
     */
    *getNaturalClassed(_,{put, call, select}){
      const { teacherId } = yield select(state=>state.teacher.userInfo);
      const { responseCode, data } = yield call(queryNaturalClasses,teacherId);
      if( responseCode !== "200" ) return;
      yield put({
        type    : "updateTaskEdit",
        payload : {
          naturalClassed : data
        }
      });
    },

    /**
     * @description: 获取我的分层班信息
     * @param {type}
     * @return:
     */
    *getStratifiedClassList(_,{put, call, select}){
      const { teacherId } = yield select(state=>state.teacher.userInfo);
      const { responseCode, data } = yield call(queryStratifiedClassList,teacherId);
      if( responseCode !== "200" ) return;
      yield put({
        type    : "updateTaskEdit",
        payload : {
          stratifiedClassList : data
        }
      });
    },


    /**
     * @description: 获取试卷结构
     * @param {type}
     * @return:
     */
    *getPaperTemplateList(_,{put, call, select}){
      const { campusId } = yield select(state=>state.teacher.userInfo);
      const { responseCode, data } = yield call(queryPaperTemplateListByCampusId,campusId);
      if( responseCode !== "200" ) return;
      yield put({
        type    : "updateTaskEdit",
        payload : {
          paperTemplateList : data
        }
      });
    },

    /**
     * @description: 获取我的教室和分层教室的全部信息
     * @param {type}
     * @return:
     */
    *getProxyClazzInfo(_,{put, call, select}){
      const { teacherId } = yield select(state=>state.teacher.userInfo);
      const { responseCode, data } = yield call(queryProxyClazzInfo,teacherId);
      if( responseCode !== "200" ) return;
      // 过滤掉学生数量为0的学校
      const proxyClazzInfo = data.filter(item=>item.classStudentList.length>0);
      yield put({
        type    : "updateTaskEdit",
        payload : {
          proxyClazzInfo
        }
      });
    },


    /**
     * @description: 407：根据校区ID和年级查询所有行政班
     * @param {type}
     * @return:
     */
    *getClassStudentRelation({payload},{put, call, select}){
      const { campusId } = yield select(state=>state.teacher.userInfo);
      const { responseCode, data } = yield call(queryClassStudentRelation,{ classId:payload, campusId });
      if( responseCode !== "200" ) return;
      // 过滤掉学生数量为0的学校
      const relationClass = data.filter(item=>item.classStudentList.length>0);
      yield put({
        type    : "updateTaskEdit",
        payload : {
          relationClass
        }
      });
    },

    /**
     * @description: 根据条件获取试卷包
     * @param {type}
     * @return:
     */
    *getPaperList({payload},{put, call, select}){
      const { campusId } = yield select(state=>state.teacher.userInfo);
      const params = {
        pageIndex    : payload.pageIndex || "",
        pageSize     : payload.pageSize || "",
        campusId,
        gradeValues  : payload.grade || "",
        annualValues : payload.annual || "",
        difficultLevelValues : payload.difficultLvl || "",
        paperTemplateValues : payload.paperTemplate || "",
      };
      const { responseCode, data } = yield call(queryPaperList,params);
      if( responseCode !== "200" ) return;
      yield put({
        type    : "updateTaskEdit",
        payload : {
          paperInfo : data
        }
      });
    },

    /**
     * 保存数据
     */
    *saveTask({payload},{call, select}){
      const { campusId } = yield select(state=>state.teacher.userInfo);
      const { responseCode } = yield call(saveTask,{...payload, campusId });
      if( responseCode !== "200" ) return false;
      return true;
    },


  },

  reducers: {

    // 清空缓存
    clearCache(state){
      return{
        ...state,
        ...defaultState
      }
    },

    // 更新数据
    updateTaskEdit(state, { payload }){
      return {
        ...state,
        ...payload
      }
    },



  },
};

