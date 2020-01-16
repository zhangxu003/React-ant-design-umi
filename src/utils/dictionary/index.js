/**
 * 字典工具集合
 */

import { STUDENTEXERCISESTATUS, STUDENTEXAMSTATUS, RESPONDENTSSTATUS } from "./taskWatch";
import { TASK_TYPE, TASK_QUERY_DATE } from "./taskList";


// 通过code获取value
function getValueByCode( arr ){
  return new Proxy(arr,{
    get( target,key ){
      const result = target.find(item=>item.code===key);
      if( result ){
        return result.value
      }
      return "";
    }
  });
}


// 学生练习状态
const studentExerciseStatusLib = getValueByCode(STUDENTEXERCISESTATUS);

// 学生考试状态
const studentExamsStatusLib =  getValueByCode(STUDENTEXAMSTATUS);

// 答题包状态
const respondentStatusLib =  getValueByCode(RESPONDENTSSTATUS);

// 按类型任务类型
const taskTypeLib = getValueByCode(TASK_TYPE);

// 按任务时间
const taskQueryDateLib = getValueByCode(TASK_QUERY_DATE);

export {
  studentExerciseStatusLib,
  studentExamsStatusLib,
  respondentStatusLib,
  taskTypeLib,
  taskQueryDateLib
};
