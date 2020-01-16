/**
 * 整体路由
 * 便于不同的用户类型开发，将路由分开处理
 * 方便协助开发
 */
import studentRouter from './routes/student.router.config';
import teacherRouter from './routes/teacher.router.config';

/**
 * 基础的路由配置页
 * 路由分发，
 */

const basicRouter = [
  // 路由分发页面：确认当期是否是学生机，还是教师机
  {
    path: '/',
    component: './entry',
    routes: [{ path: '/', exact: true }, ...studentRouter, ...teacherRouter],
  },
];

/**
 * 处理类型的路由
 * 404页面
 */
const handleRoute = [
  // agent 授权验证逻辑错误调整
  {
    path: '/agenterror/:type?',
    component: './Result/AgentError',
  },
];

// 自定义测试页面( 用于测试一些功能的页面， 只在生产环境中 )
if (process.env.NODE_ENV === 'development') {
  handleRoute.push({
    path: '/private',
    component: './Private',
    routes: [
      { path: '/private', exact: true },
      {
        // 测试proxy 环境下 显示 视频 图片的流
        path: '/private/importfile',
        component: './Private/ImportFile',
      },
      {
        // 测试proxy 环境下 显示 视频 图片的流
        path: '/private/drawBoard',
        component: './Private/DrawBoard',
      },
    ],
  });
}

export default [...handleRoute, ...basicRouter];
