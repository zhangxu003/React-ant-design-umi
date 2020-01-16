import { stringify } from 'qs';
import apiUrl from './apiUrl';
import request from '@/utils/request';

/**
 *
 *
 *  @Author: tina.zhang
 * @date 2018-12-14
 * @export
 * @returns
 */
export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

// 用户登录
export async function fakeAccountLogin(params) {
  return request(apiUrl['PROXY-101'], {
    method: 'POST',
    body: params,
  });
}
// 用户注册
export async function fakeRegister(params) {
  return request('/api/uaa/security/account', {
    method: 'POST',
    body: params,
  });
}
// 退出登录
export async function userLogout() {
  return request('/api/uaa/logout');
}
// 5.2.1.3.	PROXY-103检测Proxy服务状态接口
export async function proxyStatus(params) {
  return request(apiUrl['PROXY-103'], {
    method: 'POST',
    body: params,
  });
}
// PROXY-105创建TOKEN
export async function creatToken(params) {
  return request(apiUrl['PROXY-105'], {
    method: 'POST',
    body: params,
  });
}

/**
 * GET /file/{fileId}
    获取源文件下载地址
 */
export async function fetchPaperFileUrl(params) {
  if (params.fileId) {
    return request(`${apiUrl['PROXY-616']}?fileId=${params.fileId}`, {
      method: 'POST',
      body: params,
    });
  }
  return null;
}

// 根据分发策略筛选试卷快照
export async function fileDownLoad(params) {
  return request(apiUrl['PROXY-303'], {
    method: 'POST',
    body: params,
  });
}

/**
 * 从VBclient 下载试卷JSON
 */
export async function downloadFromVbclient(paperMd5) {
  return request(`${apiUrl['VB-host']}/${paperMd5}/paper`);
}

/**
 * 从VBclient 下载试卷的展示JSON
 */
export async function downloadShowFromVbclient(paperMd5, questionPatternId) {
  return request(
    `${apiUrl['VB-host']}/${paperMd5}/question_intest_render_meta_${questionPatternId}`
  );
}

/* --------------------报告api-------------- */

// REPORT-101：查看考试情况总览
export async function getTaskOverview(params) {
  return request(`/proxyapi/proxy/task-summary/${params.taskId}`);
}

/**
 * REPORT-109：查看群体统计
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 */
export async function getExamNum(params) {
  const urlParams = stringify(params);
  return request(
    `/proxyapi/proxy/student-score/group-statis?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`
  );
}

// PROXY-607 查询任务状态
export async function tsmkTaskDetail(params) {
  return request(`/proxyapi/proxy/practice/batch/task-link-status?taskId=${params.taskId}`, {
    method: 'POST',
  });
}

/**
 * TSMK-708：发布成绩
 * @param {string} taskId
 */
export async function publishGrade(params) {
  return request(`/proxyapi/proxy/tasks/status/task-link-status?taskId=${params.taskId}`, {
    method: 'PUT',
  });
}

/**
 * REPORT-102：本次考试详情总览
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getReportOverview(params) {
  return request(
    `/proxyapi/proxy/task-details/${params.campusId}/${params.taskId}/${params.paperId}`
  );
}

/**
 * REPORT-107：本次考试详情总览—班级排名
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getRankingList(params) {
  return request(`/proxyapi/proxy/student-score/rank-range/${params.taskId}/${params.paperId}`);
}

/**
 * REPORT-103：学生成绩单-分页
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 * @param {number} pageIndex
 * @param {number} pageSize
 */
export async function getTranscript(params) {
  const urlParams = stringify(params);
  return request(`/proxyapi/proxy/student-scores?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`);
}

/**
 * REPORT-108：学生成绩单—建议关注
 * @param {string} taskId
 * @param {string} paperId
 * @param {array} classIdList
 * @param {number} pageIndex
 * @param {number} pageSize
 */
export async function getTranscriptSuggest(params) {
  const urlParams = stringify(params);
  return request(
    `/proxyapi/proxy/student-score/suggestion?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`
  );
}

/**
 * REPORT-301：学生考试详情统计 {taskId,paperId,studentId}
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} studentId
 */
export async function getStudentReportOverview(params) {
  return request(
    `/proxyapi/proxy/student-exam/detail/${params.taskId}/${params.paperId}/${params.studentId}`
  );
}

/**
 * REPORT-304：设置或者修改得分率
 * @param {string} campusId
 * @param {string} studentId
 * @param {string} studentName
 * @param {string} scoreRate
 */
export async function setStudentScoreRate(params) {
  return request(`/proxyapi/proxy/student-config`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * ROXY-615 获取试卷展 调用CONTENT-010
 */
export async function fetchPaperShowData(params) {
  return request(
    `/proxyapi/proxy/practice/batch/question-pattern/question-edit-render-meta?idList=${
      params.idList
    }`,
    {
      method: 'POST',
    }
  );
}

/**
 * 获取教师报告试卷快照 report-013 TODO
 * @param {string} taskId
 * @param {string} paperId
 */
export async function getPaperSapshot(params) {
  return request(`/proxyapi/proxy/report/paper-snapshot/${params.taskId}/${params.paperId}`);
}

/**
 * REPORT-104：考后报告教师端—答案详情
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 */
export async function getTeacherSubquestion(params) {
  return request(
    `/proxyapi/proxy/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${
      params.classId
    }`
  );
}

/**
 * REPORT-105：答案详情-学生列表-选择填空
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 * @param {string} classId
 */
export async function getStudentSubquestion(params) {
  return request(
    `/proxyapi/proxy/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${
      params.classId
    }/${params.subQuestionId}`
  );
}

/**
 * REPORT-105：答案详情-学生列表-口语题
 * @param {string} campusId
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} classId
 * @param {string} type 1得分，2发音，3完整度，4流利度
 */
export async function getStudentSubquestionSpeech(params) {
  return request(
    `/proxyapi/proxy/paper-subquestion/${params.campusId}/${params.taskId}/${params.paperId}/${
      params.classId
    }/${params.subQuestionId}/${params.type}`
  );
}

/**
 * REPORT-302：学生答案详情 {taskId,paperId,studentId}
 * @param {string} taskId
 * @param {string} paperId
 * @param {string} studentId
 */
export async function getStudentAnswerReport(params) {
  return request(
    `/proxyapi/proxy/student-answer/detail/${params.taskId}/${params.paperId}/${params.studentId}`
  );
}

/* 练习实时报告 add by leo 2019-07-03 */

/**
 * Exercise-201：获取练习任务总览数据
 * @param {string} taskId 任务ID
 */
export async function getExerciseTaskOverview(params) {
  return request(`/proxyapi/proxy/exercise/summarize-data?taskId=${params.taskId}`, {
    method: 'POST',
  });
}

/**
 * Exercise-202：获取练习成绩单数据
 * @param {string} taskId 任务ID
 */
export async function getExerciseTranscript(params) {
  return request(`/proxyapi/proxy/exercise/transcript?taskId=${params.taskId}`, {
    method: 'POST',
  });
}

/**
 * Exercise-104：获取练习报告生成结果
 * @param {string} taskId 任务ID
 */
export async function getExerciseTimeStamp(params) {
  return request(`/proxyapi/proxy/exercise/result?taskId=${params.taskId}`, {
    method: 'POST',
  });
}

/**
 * Exercise-203：获取答卷详情数据
 * @param {string}
 * taskId 任务ID
 * snapshotId 试卷快照Id
 * classId 班级ID 全部班级 FULL
 */
export async function getAnswerDetail(params) {
  return request(
    `/proxyapi/proxy/exercise/answer-detail?taskId=${params.taskId}&snapshotId=${
      params.snapshotId
    }&classId=${params.classId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * Exercise-204：获取答卷详情数据
 * @param {string}
 * taskId 任务ID
 * snapshotId 试卷快照Id
 * student 学生
 */
export async function getOneAnswerDetail(params) {
  const urlParams = stringify(params);

  return request(
    `/proxyapi/proxy/exercise/exercise-answer/stu-detail?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`,
    {
      method: 'GET',
    }
  );
}

/**
 * GET /proxy/exercise/exercise-answer/list
Exercise-204：学生答案-列表-20190823投屏
 */
export async function getOneAnswerList(params) {
  const urlParams = stringify(params);

  return request(
    `/proxyapi/proxy/exercise/exercise-answer/list?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`,
    {
      method: 'GET',
    }
  );
}

/**
 *GET /proxy/exercise/answer-detail/extend
Exercise-203-ex：获取答卷详情数据-扩展-20190823投屏
 */
export async function getOneAnswerextend(params) {
  const urlParams = stringify(params);

  return request(
    `/proxyapi/proxy/exercise/answer-detail/extend?${urlParams.replace(/%5B[\w*]%5D/gi, '')}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Exercise-101：学生答卷结果入队列
 * @param {string} taskId 任务ID
 */
export async function saveQueueInfo(params) {
  return request(`/proxyapi/proxy/exercise/queue-info`, {
    method: 'POST',
    body: params,
  });
}
