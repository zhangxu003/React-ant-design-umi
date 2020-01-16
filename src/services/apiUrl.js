/**
 * 全部路由相关
 */
// const config = {
//   proxy : "http://10.18.32.148:8200",   // 路由地址 //http://10.18.32.148:8200/swagger-ui.html#/
//   // proxy : "http://10.17.9.21:8200",       // enzi
//   paperUrl:"http://res.gaocloud.local"  // 试卷信息前缀
// }

const basicApi = {
  // 5.2.1.1.	PROXY-101登录接口
  'PROXY-101': '/uaa/authentication',

  // PROXY-102 更新考试练习任务(PROXY)
  'PROXY-102': '/proxy-student-relation/status',

  // PROXY-103 检测Proxy服务状态接口
  'PROXY-103': '/proxy-status',

  // PROXY-104 提交考场监控结果(todo)
  'PROXY-104': '/proxy-taskInfo/exam-result',

  // PROXY-105创建TOKEN
  'PROXY-105': '/proxy-token/create',

  // PROXY-106: 销毁TOKEN
  'PROXY-106': '/proxy-token/delete',

  // PROXY-107查询任务详情(Proxy端数据)
  'PROXY-107': '/proxy-taskInfo/proxy-local',

  // PROXY-108:根据codetype查询字典
  'PROXY-108': '/code-list',

  // PROXY-109: 查询任务列表(数据来源proxy)
  'PROXY-109': '/proxy-tasks-list-page',

  // PROXY-110: 从TOKEN列表中获取学生的TOKEN信息(todo)
  'PROXY-110': '/proxy-token/query',

  // PROXY-111 教师节获取当前老师的任务统计数据
  'PROXY-111': '/proxy-taskInfo/task-type-count',

  // PROXY-112 任务列表结束任务
  'PROXY-112': '/proxy-student-relation/finish',

  // PROXY-113 获取应考实考人数
  'PROXY-113': '/proxy-student-relation/exam-num',

  // PROXY-114: 获取自动检测试卷包下载的结果
  'PROXY-114': '/tasks/download-result',

  // PROXY-118: 获取指定任务id的任务状态
  'PROXY-118': '/tasks/status',

  // PROXY-119：获取校区的版本功能清单
  'PROXY-119': '/resources/list',

  // PROXY-121：获取校区授权版本
  'PROXY-121': '/tenant/authorize-version',

  // PROXY-122：获取APP对应版本功能清单
  'PROXY-122': '/resources/app-info',

  // PROXY-201 从PROXY上传答卷包到平台(todo)
  'PROXY-201': '/proxy-taskInfo/to-server/answer',

  // PROXY-203上传/导入答卷包(PROXY)(todo)
  'PROXY-203': '/file',

  // PROXY-204 从PROXY同步任务数据到平台
  'PROXY-204': '/proxy-taskInfo/to-server/task',

  // PROXY-205 查询任务答卷包上传状态
  'PROXY-205': '/tasks/task-status',

  // PROXY-301 从平台下载试卷到PROXY
  'PROXY-301': '/proxy-taskInfo/paper-status',

  // PROXY-303根据分发策略筛选试卷快照
  'PROXY-303': '/proxy-taskInfo/strategy',

  // PROXY-304从PROXY下载试卷包到学生机(todo)
  'PROXY-304': '/file',

  // PROXY-305 从平台下载任务到PROXY
  'PROXY-305': '/proxy-taskInfo/task',

  // PROXY-306: 从平台下载自动检测试卷包
  'PROXY-306': '/tasks/auto-download',

  // PROXY-401: 保存听说模考任务内容
  'PROXY-401': '/task',

  // PROXY-402根据状态、类型、时间、教师ID、教师任课班级查询任务(数据来源 云平台)
  'PROXY-402': '/proxy-tasks-page',

  // PROXY-403查询任务详情
  'PROXY-403': '/proxy-taskInfo',

  // PROXY-404获取老师详情
  'PROXY-404': '/teacher',

  // PROXY-405：我的行政班
  'PROXY-405': '/natural-classes',

  // ROXY-406：我的分层教学班
  'PROXY-406': '/stratified-class/list',

  // PROXY-407：根据校区ID和年级查询所有行政班
  'PROXY-407': '/natural-class/page',

  // PROXY-408：查询授权给学校的试卷的试卷范围列表
  'PROXY-408': '/paper-template/list-by-campusId',

  // PROXY-409： 根据老师ID查询所有的班级（包括行政班和分层班），每个班级都带出学生信息一起返回
  'PROXY-409': '/proxy-clazz/clazz-info',

  // GET PROXY-410：根据校区ID、试卷结构/年级/难易度/学年获取试卷列表
  'PROXY-410': '/paper-list',

  // PROXY-411更新考试任务名称
  'PROXY-411': '/tasks',

  // 筛选教师的考试任务-分页
  'PROXY-602': '/practice/filter-teacher-exam',

  // "PROXY-603：查看考试学生名单"
  'PROXY-603': '/practice/batch/exam-student',

  // PROXY-604：删除考试
  'PROXY-604': '/practice/batch/task',

  // PROXY-605：编辑考试名称
  'PROXY-605': '/practice/batch/update-task',

  // PROXY-610：查看教师班级详细信息
  'PROXY-610': '/practice/batch/teacher/all-class',

  // PROXY-613：查看所有年级
  'PROXY-613': '/practice/batch/config/allGrade',
  // PROXY-613：查看所有年级
  'PROXY-412': '/teacher/',
  // PROXY-609：查询校区试卷结构
  'PROXY-609': '/practice/batch/paper-template',

  // PROXY-608：查询校本资源-试卷
  'PROXY-608': '/practice/batch/campus-resource',

  // PROXY-615：获取试卷展示渲染元数据
  'PROXY-615': '/practice/batch/question-pattern/question-edit-render-meta',

  // PROXY-614：获取试卷详情
  'PROXY-614': '/practice/batch/paper-task/paper-detail',

  // PROXY-601：发布考试任务
  'PROXY-601': '/practice/batch/publish',

  // PROXY-701：获取任务未考人员信息及正在监考的信息
  'PROXY-701': '/practice/batches-student-count',

  // PROXY-702：获取任务的状态及环节状态
  'PROXY-702': '/practice/batch/task-link-status',

  // PROXY-703：记录任务开始的场次信息
  'PROXY-703': '/practice/batch',

  // PROXY-750：区校中(校)任务列表
  'PROXY-750': '/ue/page/tasks',

  // PROXY-751：获取指定考点中(校)任务所属学校班级考点信息
  'PROXY-751': '/ue/task',

  // POST TSMK-752: 获取指定中(校)任务任务、班级的学生清单
  'PROXY-752': '/ue/task/students',

  // TSMK-753: 现场报名接口
  'PROXY-753': '/ue/task/student-makeup',

  // PROXY-755: 获取线上平台信息
  'PROXY-755': '/tasks/info',

  // TSMK-756: 获取指定中(校)任务中未开始的子任务数据
  'PROXY-756': '/ue/not-started-tasks',

  // PUT /proxy/ue/task/student-re-examination TSMK-754: 重新考试接口
  'PROXY-754': '/ue/task/student-re-examination',

  // TSMK-757: 获取指定子任务状态以及中(校)任务下未开始子任务数据
  'PROXY-757': '/ue/tasks',

  // Exercise-102：生成练习报告
  'PROXY-Exercise-102': '/exercise/build',

  // Exercise-103：获取练习报告生成状态
  'PROXY-Exercise-103': '/exercise/status',

  // Exercise-104：获取练习报告生成结果
  'PROXY-Exercise-104': '/exercise/result',

  // Exercise-106：获取队列-已处理学生答卷的最新时间戳
  'PROXY-Exercise-106': '/exercise/last/time-stamp',
  'PROXY-619': '/practice/custom-paper-page',
  'PROXY-620': '/practice/custom-paper',
  'PROXY-616': '/practice/batch/file',

  'PROXY-resource': '/resource',
  // VBClient 相关操作
  'VB-file': '/file',

  // vbClient 的服务
  'VB-host': APP_VB_HOST, // APP_VB_HOST 在 打包命令中添加 define
};

const apiUrl = new Proxy(basicApi, {
  get(target, key) {
    // 对路由进行分发处理
    if (key in target) {
      const effect = 'proxyapi/proxy';
      if (key === 'PROXY-resource') {
        return target[key];
      }
      // 正常的proxy服务器通信
      if (key.indexOf('PROXY') === 0) {
        return `/${effect}${target[key]}`;
      }

      // VBClient相关通信处理
      // 注解：由于前端将地址提供给VBClient客户端，在有VBClient 拼接全路径，而VBClient域名如下格式 http://10.17.9.17:8080/
      // 由于最后带有斜杠，则我们提供的路径上不能在带上斜杠 如 proxyapi/proxy/file 而不是 /proxyapi/proxy/file
      // 可能回生成以下格式 http://10.17.9.17:8080//proxyapi/proxy/file 此路径无法被devserver准确解析
      if (key === 'VB-file') {
        return `${effect}${target[key]}`;
      }

      // VBclient 内部服务器，用于上传下载试卷包等功能
      if (key === 'VB-host') {
        return `${target[key]}`;
      }

      return `/${target[key]}`;
    }

    if (`MOCK-${key}` in target) {
      return `${target[`MOCK-${key}`]}`;
    }

    throw new Error(`don't find api:${key}`);
  },
});

export default apiUrl;
