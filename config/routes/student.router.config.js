// 学生机相关路由配置

export default [
  {
    // 学生机统一入口文件。  可以在 Student/index.js 中做一些全局事件。
    // 如 ：
    // 1、全局耳机掉落的监听。
    // 2、全局的socket通信的监听等
    // 3、...
    path      : '/student',
    component : './Student',
    routes: [
      // 重定向到学生机的准备页面
      { path: '/student/', redirect: '/student/ready' },

      // 学生机准备页面
      {
        path: '/student/ready/:changeip?',
        component: '../layouts/CheckLayout',
        routes: [ {component:'./Student/Ready'}]
      },

      // 学生机登录页
      {
        path: '/student/login',
        component: '../layouts/UserLayout',
        routes: [{ component: './Student/Login' }]
      },

      // 设备检测页面
      {
        path: '/student/deviceCheck/:taskType?',
        component: './Student/layouts/StudentLayout',
        routes: [{ component: './Student/DeviceCheck' }]
      },

      // 练习下载试卷列表
      {
        path: '/student/download/paper/:taskType?',
        component: './Student/layouts/StudentLayout',
        routes: [{ component: './Student/DownLoadPaper' }]
      },

      // 考试页面
      {
        path: '/student/exam',
        component: '../layouts/ExamLayout',
        routes: [{ component: './Student/Exam' }]
      },

      // 练习页面
      {
        path: '/student/exercise',
        component: '../layouts/ExamLayout',
        routes: [{ component: './Student/Exercise' }]
      }

    ]
  }
];



//   // 学生机准备页面
//   {
//     path: '/student',
//     component: '../layouts/CheckLayout',
//     routes: [
//       { path: '/student', redirect: '/student/check' },
//       { path: '/student/check', component: './Student' },
//     ],

//   }, {
//     path: '/Exam',
//     component: '../layouts/ExamLayout',
//     routes: [
//       { path: '/Exam', component: './Exam' },

//     ],

//   }, {
//     path: '/exercise',
//     component: '../layouts/ExamLayout',
//     routes: [
//       { path: '/exercise', component: './Exercise' },

//     ],

//   }


// ];
