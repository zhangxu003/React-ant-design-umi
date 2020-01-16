// 教师机相关路由配置

export default [
  // 老师自动检测页面
  {
    path: '/teacher/clientCheck',
    component: '../layouts/CheckLayout',
    routes: [ {component:'./Teacher/ClientCheck'}]
  },
  // 老师登录页
  {
    path: '/teacher/login',
    component: '../layouts/UserLayout',
    routes: [ {component:'./Teacher/Login'}]
  },
  // 老师主页面（需要登录权限）
  {
    path      : '/teacher',
    component : './Teacher',
    // Routes    : ['src/pages/Teacher/Authorized'],
    // authority : ['user'],
    routes: [
      // 重定向到Home 页面
      { path: '/teacher/', redirect: '/teacher/home' },

      // 教师主页面
      {
        path: '/teacher/home',
        name : "teacherHome",
        component: './Teacher/Home',
      },

      // 任务列表页面(考试，练习)
      {
        path: '/teacher/tasklist/:type',
        name : 'taskList',
        component:'./Teacher/layouts/sideLayout',
        routes: [{name : "list", component:'./Teacher/TaskList'}]
      },


      // 统考任务列表页面(考试，练习)
      {
        path: '/teacher/districtList/:type',
        name : 'districtList',
        component:'./Teacher/layouts/sideLayout',
        routes: [{name : "districtlist", component:'./Teacher/DistrictList'}]
      },

      // 听说模考
      {
        path: '/teacher/examination/publish/:taskType/:step',
        name: 'release',
        component: './Teacher/Examination/Publish',
        routes: [
          {
            path: '/teacher/examination/publish/:taskType/configuration',
            component: './Teacher/Examination/Publish/Configuration',
          },
          {
            path: '/teacher/examination/publish/:taskType/selectpaper',
            component: './Teacher/Examination/Publish/SelectPaper',
          },
          {
            path: '/teacher/examination/publish/:taskType/confirm',
            component: './Teacher/Examination/Publish/Confirm',
          },
          {
            path: '/teacher/examination/publish/:taskType/showTask/:taskId',
            component: './Teacher/Examination/Publish/ShowTask',
          },
        ],
      },

      // 报告
      {
        path: '/teacher/report/:taskType/showReport/:taskId/:stage',
        name : 'report',
        component:'./Teacher/Report',
      },

      // 任务的详情和监控页面
      {
        path: '/teacher/task/:id',
        name : 'task',
        component: './Teacher/Task',
        routes: [

          // 重定向到Home 页面
          { path: '/teacher/task/:id', redirect: '/teacher/task/:id/watch' },

          // 任务监听页面
          {
            path: '/teacher/task/:id/watch',
            component: './Teacher/Task/Watch',
            routes:[
              {
                path: '/teacher/task/:id/watch',
                redirect: '/teacher/task/:id/watch/step1',
              },
              {
                path: '/teacher/task/:id/watch/step1',
                component: './Teacher/Task/Watch/Step1',
              },
              {
                path: '/teacher/task/:id/watch/step2',
                component: './Teacher/Task/Watch/Step2',
              },
              {
                path: '/teacher/task/:id/watch/step3',
                component: './Teacher/Task/Watch/Step3',
              },
              {
                path: '/teacher/task/:id/watch/step4',
                component: './Teacher/Task/Watch/Step4',
              }
           ]
          },

          // 如果没有匹配路由则，跳转到教师机首页
          { redirect: '/teacher/home' },
        ],
      },

      // 如果没有想过页面，则跳转到首页
      { redirect: '/teacher/home' },
    ],
  },
];
