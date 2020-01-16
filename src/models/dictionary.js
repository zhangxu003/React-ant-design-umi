/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 获取全部的字典库，并且缓存到页面中
 * @Date: 2019-02-27 17:07:52
 * @LastEditTime: 2019-05-06 16:21:31
 */

import { queryDistribution } from '@/services/teacher';

export default {
  namespace: 'dictionary',

  state: {
    hasLoad           : false,  // 字典库是否已经加载过了
    TASK_TYPE         : [],     // 任务类型
    DIST_TYPE         : [],     // 试卷分发方式
    PAPERSOURCE       : [],     // 试卷来源
    EXAM_TYPE         : [],     // 考试策略
    GRADE             : [],     // 年级
    DIFFICULT_LVL     : [],     // 难易度
    ANNUAL            : [],     // 年度
    RESPONDENTSSTATUS : [],     // 答案包的状态 RS_1：正常  RS_2 ：未产生包  RS_3：打包失败  RS_4：上传失败
  },

  effects: {
    /**
     * 获取字典表
     * 根据 字典名，获取以逗号分隔的多个字典
     * 空字符串则获取全部
     * @param {*} param0
     * @param {*} param1
     */
    *queryDictionary({payload=""}, { call, put, select }) {

      // 判断字典库是否已经获取了，如果获取过了则不再去获取
      const { hasLoad } = yield select(state=>state.dictionary);
      if( hasLoad ) return;
      let responseData = "";
      try{
        // 此接口不需要单独的报错处理
        const { responseCode, data } = yield call(queryDistribution,{codeType:payload});
        if( responseCode !== "200" ){
          throw new Error("");
        }
        responseData = data;
      }catch(err){
        console.log(err);
        return;
      }

      // 遍历数据生成key-value形式
      const result = {};
      responseData.forEach(item=>{
        if( item.codeType in result ){
          result[item.codeType].push(item);
        }else{
          result[item.codeType] = [item];
        }
      });

      yield put({
        type: 'updateDictionary',
        payload: {
          ...result,
          hasLoad : true
        }
      });
    }

  },

  reducers: {
    /**
     * @description: 更新字典表库
     * @param {type}
     * @return:
     */
    updateDictionary(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },

  subscriptions : {

    /**
     * @description: 加载页面的时候主动的去加载字典库
     * @param {type}
     * @return:
     */
    async autoAddDictionary({ dispatch }){
      // 获取字典库
      dispatch({ type : "queryDictionary" });
    }

  }
};
