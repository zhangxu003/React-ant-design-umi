/**
 * 教师相关接口
 */
import qs from 'qs';
import apiUrl from './apiUrl';
import request from '@/utils/request';

/* eslint-disable */
function urlEncode(param, key, encode) {
  if (param == null) return '';
  let paramStr = '';
  const t = typeof param;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    paramStr += '&' + key + '=' + (encode == null || encode ? encodeURIComponent(param) : param);
  } else {
    for (let i in param) {
      let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
}
/* eslint-enable */

// 接口类型统一处理
const teacherRequest = (url, params = {}, method = 'POST') =>
  request(url, { method, body: params });

/**
 * PROXY-111 获取老师任务的统计数据
 * @param {Object} params {
 *  teacherId  // 老师id
 *  taskTypes  // 要获取的任务类型
 * }
 */
export async function getTaskCount(params) {
  const arr = Object.keys(params).map(i => `${i}=${params[i]}`);
  return teacherRequest(`${apiUrl['PROXY-111']}?${arr.join('&')}`);
}

// PROXY-404获取老师详情
// export async function getTeacherInfo(teacherId) {
//   return teacherRequest(`${apiUrl['PROXY-404']}?teacherId=${teacherId}`);
// }

/**
 * PROXY-301
 * 轮询获取任务状态
 * "PROXY-301" : "/proxy-taskInfo/paper"
 * @param {*} id
 * id : taskId
 */
export async function checkTransStatusByTaskId(id) {
  return teacherRequest(apiUrl['PROXY-301'], { id });
}

/**
 * PROXY-403
 * 查询任务详情(从线上获取任务信息)
 * "PROXY-403" : "/proxy-taskInfo",
 * @param {*} id
 * id : taskId
 * 注意 ： 和后台了解后，任务只从proxy端获取
 */
export async function getTaskInfoOnline(id) {
  return teacherRequest(apiUrl['PROXY-403'], { id });
}

/**
 * PROXY-107
 * 查询任务详情from proxy
 * "PROXY-107" : "/proxy-taskInfo/proxy-local",
 * @param {*} id
 * id : taskId
 */
export async function getTaskInfo(id) {
  return teacherRequest(apiUrl['PROXY-107'], { id });
}

/**
 * PROXY-305
 * 从平台下载任务到PROXY
 * "PROXY-305" : "/proxy-taskInfo/task",
 * @param {Object} params
 * id : taskId
 *
 */
export async function runTask(id) {
  return teacherRequest(apiUrl['PROXY-305'], { id });
}

/**
 * PROXY-102
 * 更新考试练习任务(PROXY)
 * "PROXY-102" : "/proxy-student-relation/status",
 * @param {Object} params
 *  "taskId": "string",
    "status": "string",
    "taskStudentStatusList": [
      {
        "id": "string",
        "taskId": "string",
        "classId": "string",
        "studentId": "string",
        "examNo": "string",
        "status": "string",
        "examStatus": "string"
      }
    ]
 */
export async function updateStudentTaskStatus(params) {
  return teacherRequest(apiUrl['PROXY-102'], params);
}

/**
 *PROXY-104
 * 提交考场监控结果(PROXY)
 * "PROXY-104" : "proxy-taskInfo/exam-result",
 * @param {Object} params
 *  [
      {
        "paperList": [
          {
            "answerProcess": "string",
            "elapsedTime": 0,
            "fileCount": 0,
            "isDeleted": 0,
            "needFileCount": 0,
            "paperName": "string",
            "respondentsMd5": "string",
            "respondentsName": "string",
            "respondentsStatus": "string",
            "snapshotId": "string",
            "zeroCount": 0
          }
        ],
        "monitoringId": "string",
        "taskId": "string",
        "taskType": "string",
        "screening": "string",
        "connId": "string",
        "ipAddress": "string",
        "seatNo": "string",
        "identifyCode": "string",
        "studentId": "string",
        "classId": "string",
        "monitoringStatus": "string",
        "examStatus": "string",
        "paperName": "string",
        "answerProcess": "string",
        "snapshotId": "string",
        "elapsedTime": 0,
        "isDeleted": 0,
        "respondentsStatus": "string",
        "monitoringDesc": "string"
      }
    ]
 */
export async function saveExamResult(params) {
  // 对 请求的数据进行二次处理( 将 answerProcess 转换成 字符串 )
  const result = params.map(item => ({
    ...item,
    answerProcess: Array.isArray(item.answerProcess)
      ? item.answerProcess.join('')
      : item.answerProcess,
    paperList: item.paperList.map(tag => ({
      ...tag,
      answerProcess: Array.isArray(tag.answerProcess)
        ? tag.answerProcess.join('')
        : tag.answerProcess,
    })),
  }));
  return teacherRequest(apiUrl['PROXY-104'], result);
}

/**
 * PROXY-112
 * 任务列表结束任务
 * "PROXY-112" : "/closetask",
 * @param {*} id
 * id : taskId
 */
export async function endTaskByTaskId(taskId) {
  // TODO
  return teacherRequest(`${apiUrl['PROXY-112']}?taskId=${taskId}`);
}

/**
 * PROXY-113
 * 获取taskIds中应考实考人数
 * "PROXY-112" : "/closetask",
 * @param {*} taskIds   已逗号分隔的任务ids
 * id : taskId
 */
export async function getTaskJoinStatusByTaskIds(taskIds) {
  // TODO
  return teacherRequest(`${apiUrl['PROXY-113']}?taskIds=${taskIds}`);
}

/**
 * PROXY-205
 * 查询上传答题包的当期状态
 * @param {*} id
 * id : taskId
 */
export async function checkUploadStatusByTaskId(id) {
  // TODO
  return teacherRequest(`${apiUrl['PROXY-205']}?taskId=${id}`);
}

/**
 * PROXY-201
 * 上传答题包到线上平台中
 * "PROXY-201" : "/proxy-taskInfo/to-server/answer",
 * @param {String} id  任务id
 */
export async function uploadAnswerToServer(id) {
  return teacherRequest(apiUrl['PROXY-201'], { id });
}

/**
 * PROXY-204
 * 从PROXY同步任务数据到平台
 * "PROXY-204" : "/proxy-taskInfo/to-server/task",
 * @param {String} id  任务id
 */
export async function uploadTaskToServer(params) {
  return teacherRequest(apiUrl['PROXY-204'], params);
}

/**
 * PROXY-106
 * 销毁token，及教师机退出
 * "PROXY-106" : "/proxy-token/delete",
 * @param {String} ipAddress  教师机ip
 */
export async function proxyTokenDelete(ipAddress) {
  const list = Array.isArray(ipAddress) ? ipAddress : [ipAddress];
  return teacherRequest(apiUrl['PROXY-106'], {
    ipAddressList: list,
  });
}

/**
 * PROXY-110
 * POST /proxy/proxy-token/query
 *PROXY-110: 从TOKEN列表中获取学生的TOKEN信息
 * @param {String} examNo  学号
 */
export async function proxyTokenQuery(examNo, taskId) {
  return teacherRequest(apiUrl['PROXY-110'], { examNo, taskId });
}

// 分发试卷方式  考试策略  考试状态POST code-list
export async function queryDistribution(params) {
  return request(`${apiUrl['PROXY-108']}?codeType=${params.codeType}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * PROXY-306: /task/auto-download
 * @description: 从平台下载自动检测试卷包
 * @param {String} campusId : 校区ID
 * @return: 返回结果
 */
export async function taskAutoDownload(campusId) {
  return teacherRequest(apiUrl['PROXY-306'], { campusId });
}

/**
 * PROXY-114: /tasks/download-result
 * @description: 获取自动检测试卷包下载的结果
 * @param {String} campusId : 校区ID
 * @return: 返回结果
 */
export async function taskDownResult(campusId) {
  return teacherRequest(apiUrl['PROXY-114'], { campusId });
}

/**
 * "PROXY-405" : "/natural-classes",
 * @description: 我的行政班
 * @param {String} teacherId : 教师id
 * @return: 返回结果
 */
export async function queryNaturalClasses(teacherId) {
  return teacherRequest(`${apiUrl['PROXY-405']}?teacherId=${teacherId}`);
}

/**
 * "PROXY-406" : "/stratified-class/list",
 * @description: 406：我的分层教学班
 * @param {String} teacherId : 教师id
 * @return: 返回结果
 */
export async function queryStratifiedClassList(teacherId) {
  return teacherRequest(`${apiUrl['PROXY-406']}?teacherId=${teacherId}`);
}

/**
 * "PROXY-407" : "/class-student-relation/info-with-student",
 * @description: 407：根据校区ID和年级查询所有行政班
 * @param {Object} params
 * {
 *  campusId // 校区id
 *  classId  // 班级id
 * }
 * @return: 返回结果
 */
export async function queryClassStudentRelation(params) {
  return teacherRequest(
    `${apiUrl['PROXY-407']}?classId=${params.classId}&campusId=${params.campusId}`,
    { params }
  );
}

/**
 * "PROXY-408" : "/paper-template/list-by-campusId",
 * @description: 408：查询授权给学校的试卷的试卷范围列表
 * @param {String} campusId  校区id
 * @return: 返回结果
 */
export async function queryPaperTemplateListByCampusId(campusId) {
  return teacherRequest(`${apiUrl['PROXY-408']}?campusId=${campusId}`);
}

/**
 * "PROXY-409" : "/proxy-clazz/clazz-info",
 * @description: PROXY-409： 根据老师ID查询所有的班级（包括行政班和分层班），每个班级都带出学生信息一起返回
 * @param {String} teacherId  老师id
 * @return: 返回结果
 */
export async function queryProxyClazzInfo(teacherId) {
  return teacherRequest(`${apiUrl['PROXY-409']}?teacherId=${teacherId}`);
}

/**
 * "PROXY-410" : "/paper-list",
 * @description: PROXY-410： 根据校区ID、试卷结构/年级/难易度/学年获取试卷列表
 * @param {object} param
 * @return:
 */
//
export async function queryPaperList(params) {
  const arr = Object.keys(params).map(i => `${i}=${params[i]}`);
  return teacherRequest(`${apiUrl['PROXY-410']}?${arr.join('&')}`);
}

/**
 * "PROXY-401" : "/proxy/task",
 * @description:  PROXY-401: 保存听说模考任务内容
 * @param {object} param
 * {
  "taskPaperIdList": [
    "string"
  ],
  "taskStudentRelationVOList": [
    {
      "taskId": "string",
      "classId": "string",
      "studentId": "string",
      "examNo": "string",
      "status": "string",
      "className": "string",
      "classType": "string",
      "studentName": "string",
      "gender": "string",
      "examStatus": "string",
      "ipAddress": "string",
      "seatNo": "string",
      "monitoringDesc": "string"
    }
  ],
  "name": "string",
  "type": "string",
  "distributeType": "string",
  "examType": "string",
  "campusId": "string"
}
 * @return:
 */
export async function saveTask(params) {
  return teacherRequest(apiUrl['PROXY-401'], params);
}

/**
 * "PROXY-118" : "/tasks/status"
 * @description:  PROXY-118: 获取指定任务id的任务状态
 * @param {type}
 * @return:
 */
export async function getTaskStatusByTaskId(idArr = []) {
  return teacherRequest(`${apiUrl['PROXY-118']}`, { taskIds: idArr });
}

/**
 *获取试卷详情信息
 *PROXY-614

 * @export
 * @param {*} paperId
 * @returns
 */
export async function queryPaperDetails(params) {
  const url = urlEncode(params);
  return teacherRequest(`${apiUrl['PROXY-614']}?${url.slice(1)}`, {}, 'POST');
}

/**
 * /question-pattern/question-edit-render-meta
 * PROXY-615
 *  获取试卷展示渲染元数据
 */
export async function fetchPaperShowData(params) {
  return teacherRequest(`${apiUrl['PROXY-615']}?idList=${params.idList}`, {}, 'POST');
}

/** 根据条件查询试卷 *
 * 查询校本资源-试卷
 * PROXY-608
 */
export async function queryPaperResource(params) {
  const url = urlEncode(params);
  return teacherRequest(`${apiUrl['PROXY-608']}?${url.slice(1)}`, {}, 'GET');
}

/** 查看教师班级详细信息 *
 * PROXY-610
 *
 */
export async function queryClassDetail(params) {
  return teacherRequest(
    `${apiUrl['PROXY-610']}?teacherId=${params.teacherId}&status=${params.status}`,
    {},
    'POST'
  );
}

/** 年级列表 *
 * PROXY-613
 */
export async function queryGrade() {
  return teacherRequest(`${apiUrl['PROXY-613']}?campusId=${localStorage.getItem('campusId')}`);
}

/** 根据账号返回年级列表 *
 * PROXY-412
 */
export async function queryAccountGrade() {
  return teacherRequest(`${apiUrl['PROXY-412']}${localStorage.getItem('uid')}`, {}, 'GET');
}

/** 年度 * */
export async function queryYears() {
  return teacherRequest(`/api/dict/data-codes?dataType=ANNUAL`);
}
/** 难度 * */
export async function queryDifficult() {
  return teacherRequest(`/api/dict/data-codes?dataType=DIFFICULT_LVL`);
}

/**
 *查询校区试卷结构
 *PROXY-609

 * @param {*} paperId
 * @returns
 */
export async function queryPaperTemplates(params) {
  const url = urlEncode(params);
  return teacherRequest(`${apiUrl['PROXY-609']}?${url.slice(1)}`, {}, 'POST');
}

/** POST /exam-task/publish 发布考试任务*
 *
 * PROXY-601
 */
export async function publishTask(params) {
  return teacherRequest(`${apiUrl['PROXY-601']}`, params, 'POST');
}

/** POST /exam-task/publish 发布考试任务*
 *
 * PROXY-601
 */
export async function batchTask(params) {
  return teacherRequest(`${apiUrl['PROXY-703']}`, params, 'POST');
}

/**
 * "PROXY-602" : "/practice/filter-teacher-exam",
 * @description: 筛选教师的考试任务-分页
 * @param {object} param
 * {
 *  campusId   : "校区ID",
 *  teacherId  : "教师ID"，
 *  type       : "类型"，
 *  status     ： 状态(选填) 需要Split返回的是字符串
 *  time       : 按时间(选填)
 *  classType  : 教室类型
 *  filterWord ： 关键词过滤
 *  pageIndex  ： 页码
 *  pageSize   : 每页显示数
 * }
 * @return:
 */
export async function getTaskList(params) {
  return teacherRequest(`${apiUrl['PROXY-602']}?${qs.stringify(params)}`);
}

/**
 * "PROXY-750" : "/ue/tasks",
 * @description: 区校中(校)任务列表
 * @param {object} param
 * {
 *  campusId   : "校区ID",
 *  teacherIds  : "教师ID"，
 *  type       : "类型"，
 *  classType  : 教室类型
 *  filterWord ： 关键词过滤
 *  pageIndex  ： 页码
 *  pageSize   : 每页显示数
 * }
 * @return:
 */
export async function getDistrictList(params) {
  // return teacherRequest(`${apiUrl['PROXY-750']}?${qs.stringify(params)}`);

  return teacherRequest(`${apiUrl['PROXY-750']}`, params, 'POST');
}

/**
  PROXY-751：获取指定考点中(校)任务所属学校班级考点信息
 * @return:
 */
export async function getExamPlaceInfo(params) {
  return teacherRequest(`${apiUrl['PROXY-751']}?${qs.stringify(params)}`, {}, 'POST');
}

/**
  TSMK-752: 获取指定中(校)任务任务、班级的学生清单
 * @return:
 */
export async function getRegisterStudentInfo(params) {
  return teacherRequest(`${apiUrl['PROXY-752']}?${qs.stringify(params)}`, {}, 'POST');
}

/**
 * TSMK-753: 现场报名接口
 * @param {string} taskId
 */
export async function registrationInfo(params) {
  return teacherRequest(`${apiUrl['PROXY-753']}`, params, 'PUT');
}

/**
  TSMK-756: 获取指定中(校)任务中未开始的子任务数据
 * @return:
 */
export async function getStartTasks(params) {
  return teacherRequest(`${apiUrl['PROXY-756']}?${qs.stringify(params)}`, {}, 'POST');
}
/**
 * "PROXY-755" : "/tasks/info",
 * @description: 获取线上平台信息
 * @param {object} param
 * @return:
 */
export async function getDistrictDetail(params) {
  return teacherRequest(`${apiUrl['PROXY-755']}`, params, 'POST');
}

/**
 * "PROXY-757" : "/ue/task",
 * @description: 获取指定子任务状态以及中(校)任务下未开始子任务数据
 * @param {object} param
 * @return:
 */
export async function getSubDistrictData(params) {
  return teacherRequest(`${apiUrl['PROXY-757']}?${qs.stringify(params)}`, params, 'POST');
}

/**
 * TSMK-754: 重新考试接口
 * @param {string} taskId
 */
export async function repeatTest(params) {
  return teacherRequest(`${apiUrl['PROXY-754']}`, params, 'PUT');
}

/**
 * "PROXY-605" : POST /proxy/practice/batch/update-task
 * @description: PROXY-605：编辑考试
 * @param {object} param
 * {
 *  taskId    : 任务Id
 *  name      : 任务名称
 * }
 * @return:
 */
export async function queryChangeTaskTitle(params) {
  return teacherRequest(`${apiUrl['PROXY-605']}?${qs.stringify(params)}`);
}

/**
 *  "PROXY-702" : "/practice/batch/task-link-status",
 * @description: 获取任务的状态及环节状态
 * @param {object} param
 * {
 *  taskId    : 任务Id
 * }
 * @return:
 */
export async function getTaskStatus(taskId) {
  return teacherRequest(`${apiUrl['PROXY-702']}?taskId=${taskId}`);
}

/**
 *  "PROXY-701" : "/practice/batches-student-count",
 * @description: PROXY-701：获取任务未考人员信息及正在监考的信息
 * @param {object} param
 * {
 *  taskId    : 任务Id
 * }
 * @return:
 */
export async function batchesStudentCount(taskId) {
  return teacherRequest(`${apiUrl['PROXY-701']}`, { id: taskId });
}

/**
 *  "PROXY-604" : "/practice/batch/task",
 * @description: PROXY-604：删除考试
 * @param {object} param
 * {
 *  taskId    : 任务Id
 * }
 * @return:
 */
export async function delTask(taskId) {
  return teacherRequest(`${apiUrl['PROXY-604']}?taskId=${taskId}`);
}

/**
 * "PROXY-603：查看考试学生名单"
 * "PROXY-603" : "/practice/batch/exam-student",
 * @param {object} param
 * {
 *  taskId    : 任务Id
 *  classId   : 班级ID(选填),不传入为查看所有名单
 * }
 * @return:
 */
export async function getTaskStudentList(params) {
  return teacherRequest(`${apiUrl['PROXY-603']}?${qs.stringify(params)}`);
}

/**
 * "PROXY-106" : "/exercise/last/time-stamp",
 * @description: POST Exercise-106：获取队列-已处理学生答卷的最新时间戳
 * { taskId: 任务Id}
 * @return:
 */
export async function timeStamp(params) {
  return teacherRequest(`${apiUrl['PROXY-Exercise-106']}?taskId=${params.taskId}`, {}, 'POST');
}

/**
 * "PROXY-104" : "/exercise/result",
 * @description: POST Exercise-104：获取练习报告生成结果
 * { taskId: 任务Id}
 * @return:
 */
export async function exerciseResult(params) {
  return teacherRequest(`${apiUrl['PROXY-Exercise-104']}?taskId=${params.taskId}`, {}, 'POST');
}

/**
 * "PROXY-103" : "/exercise/status",
 * @description: POST Exercise-103：获取练习报告生成状态
 * @return:
 */
export async function exerciseStatus(params) {
  return teacherRequest(`${apiUrl['PROXY-Exercise-103']}?taskId=${params.taskId}`, {}, 'POST');
}

/**
 * "PROXY-102" : "/exercise/build",
 * @description: POST Exercise-102：生成练习报告
 * @return:
 */
export async function exerciseBuild(params) {
  return teacherRequest(
    `${apiUrl['PROXY-Exercise-102']}?taskId=${params.taskId}&&timeStamp=${params.timeStamp}`,
    {},
    'POST'
  );
}

/**
 * GET PROXY-619 查询我的组卷
 * @param {string} teacherId
 * @param {string} pageIndex
 * @param {string} pageSize
 */
export async function queryMyPaper(params) {
  return teacherRequest(`${apiUrl['PROXY-619']}?${qs.stringify(params)}`, {}, 'GET');
}

/**
 * GET/practice/custom-paper
    PROXY-620：获取自由组卷内容
 * @param {string} paperId
 */
export async function queryMyPaperDetails(params) {
  return teacherRequest(`${apiUrl['PROXY-620']}?id=${params.paperId}`, {}, 'GET');
}

/**
 * GET/practice/custom-paper
 * [API]PROXY-121：获取校区授权版本
 * @param {Object} params
 * {
 *  campusId	校区ID	String
 * }
 */
export async function getPremissionVersion(params) {
  return teacherRequest(`${apiUrl['PROXY-121']}?${qs.stringify(params)}`, {}, 'GET');
}

/**
 * GET/practice/custom-paper
 * PROXY-119：获取校区的版本功能清单
 * @param {Object} params
 * {
 *  campusId	校区ID	String
 *  applicationId	应用ID	String
 * }
 */
export async function getPremissionList(params) {
  return teacherRequest(`${apiUrl['PROXY-119']}?${qs.stringify(params)}`, {}, 'GET');
}

/**
 * GET /resources/app-info
 * AUTH-399：获取APP对应版本功能清单
 * @param {*} params : {applicationId}
 */
export async function getStandardList(params) {
  return teacherRequest(`${apiUrl['PROXY-122']}?${qs.stringify(params)}`, {}, 'GET');
}
