/**
 * 教师机 -- 任务监控相关字典
 */


// 学生考试状态字典
const STUDENTEXERCISESTATUS = [
  {
      "type_code": "STUDENTEXERCISESTATUS",
      "code": "ES_1",
      "value": "未练习",
      "sequence": "10"
  },
  {
      "type_code": "STUDENTEXERCISESTATUS",
      "code": "ES_2",
      "value": "正在练习",
      "sequence": "20"
  },
  {
      "type_code": "STUDENTEXERCISESTATUS",
      "code": "ES_3",
      "value": "练习失败",
      "sequence": "30"
  },
  {
      "type_code": "STUDENTEXERCISESTATUS",
      "code": "ES_4",
      "value": "练习完成",
      "sequence": "40"
  }
];


// 学生练习状态字典
const STUDENTEXAMSTATUS = [
  {
      "type_code": "STUDENTEXAMSTATUS",
      "code": "ES_1",
      "value": "未考",
      "sequence": "10"
  },
  {
      "type_code": "STUDENTEXAMSTATUS",
      "code": "ES_2",
      "value": "正在考试",
      "sequence": "20"
  },
  {
      "type_code": "STUDENTEXAMSTATUS",
      "code": "ES_3",
      "value": "考试失败",
      "sequence": "30"
  },
  {
      "type_code": "STUDENTEXAMSTATUS",
      "code": "ES_4",
      "value": "考试成功",
      "sequence": "40"
  }
];

// 答题包状态字典
const RESPONDENTSSTATUS = [
  {
    "type_code": "RESPONDENTSSTATUS",
    "code": "RS_1",
    "value": "正常",
    "sequence": "10"
  },
  {
    "type_code": "RESPONDENTSSTATUS",
    "code": "RS_2",
    "value": "异常",
    "sequence": "20"
  }
];

export {
  STUDENTEXERCISESTATUS,
  STUDENTEXAMSTATUS,
  RESPONDENTSSTATUS
}
