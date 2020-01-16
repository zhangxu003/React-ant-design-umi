/**
 * 教师机 -- 任务基础相关数据
 */


// 任务类型
const TASK_TYPE = [
  {
      "type_code": "TASK_TYPE",
      "code": "TT_1",
      "value": "考试",
      "sequence": "10"
  },
  {
      "type_code": "TASK_TYPE",
      "code": "TT_2",
      "value": "练习",
      "sequence": "20"
  },
  {
      "type_code": "TASK_TYPE",
      "code": "TT_3",
      "value": "联考",
      "sequence": "30"
  }
];

// 任务时间
const TASK_QUERY_DATE = [
  {
    "type_code": "TASK_QUERY_DATE",
    "code": "TQD_1",
    "value": "本月",
    "sequence": "10"
  },
  {
      "type_code": "TASK_QUERY_DATE",
      "code": "TQD_2",
      "value": "本周",
      "sequence": "20"
  }
];



export {
  TASK_TYPE,
  TASK_QUERY_DATE
}
