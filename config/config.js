// https://umijs.org/config/
import path from 'path';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';
import getConfig from './env/envConfig';

const envConfig = getConfig();
// envConfig = {
//   https    : false, // 是否开启https服务
//   port     : 8000,  // 默认开启端口
//   env      : "dev", // 启动的环境
//   proxy    : "",    // 反向代理的地址
//   authCode : "",    // 登录需要的header头里面的code
//   order    : start || build  // 启动命令是打包还是开发
//
// }

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      targets: {
        ie: 11,
      },
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
      },
      dynamicImport: false,
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      // },
      pwa: {
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
          importWorkboxFrom: 'local',
        },
      },
      // ...(!process.env.TEST && os.platform() === 'darwin' ? {
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch', 'react'],
      //   exclude: ['@babel/runtime'],
      // },
      hardSource: false,
      // } : {}),
      // chunks: ['vendors', 'umi']
      // 如果是生产环境，在 head头里面 引入public中的locales.js 文件
      ...(process.env.NODE_ENV!=="development"?{
        headScripts : [{ src: `/locales.js?${envConfig.commit_id}` }]
      }:{})
    },
  ],
];

// 针对 preview.pro.ant.design 的 GA 统计代码
// 业务上不需要这个
if (process.env.APP_TYPE === 'site') {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

export default {
  // add for transfer to umi
  plugins,
  hash: true,
  targets: {
    ie: 11,
  },
  define: {
    APP_TYPE: process.env.APP_TYPE || '',
    'process.env.ENV_CONFIG': envConfig,
    APP_VB_HOST : "http://res.gaocloud.local",   // vbClient 内部服务
  },
  alias: {
    // 私有源的路径--默认在 根目录下 private 目录下
    _private:
      process.env.NODE_ENV === 'development'
        ? path.resolve(envConfig.privatePath)
        : path.resolve('/node_modules/'),
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  /*
   * 配置服务器端
   * @author tina
   */
  proxy: {
    '/ws/': {
      target: "wss://wt.gaocloud.com:443",
      ws: true,
      secure: false,
      logLevel: 'debug',
    },
    '/proxyapi': {
      target: envConfig.proxy,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/proxyapi': '' }, // /server/api/currentUser -> /api/currentUser
    },
    '/resource': {
      target: envConfig.resourceproxy,
      changeOrigin: true,
      secure: false,
    },
    // 下载字典库
    "/downloadI10n" : {
      target : envConfig.downloadLocalesApi,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/downloadI10n': '' },
    }
  },
  extraBabelPlugins:      // 是否提取国际化的内容
    process.env.BABEL_CACHE === 'none'
      ? [
          [
            'react-intl',
            {
              messagesDir: './i18n-messages',
              moduleSourceName: 'umi/locale',
            },
          ],
        ]
      : null,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = antdProPath
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },

  chainWebpack: webpackPlugin,
};
