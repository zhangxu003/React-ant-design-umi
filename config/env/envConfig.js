/*
 * @Author: tina.zhang
 * @Date: 2019-01-04 10:43:23
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-04-23 13:37:35
 * @Description: npm start 命令的配置项
 * 本地代码代理不同的环境
 * 三个环境
 * dev : 开发环境--用于开发       命令 npm start -- --env=dev  || npm start
 * sit ：测试环境--用于调试sit    命令 npm start -- --env=sit  || npm run start:sit
 * pro ：生产环境--用于调试pro    命令 npm start -- --env=pro  || npm run start:pro
 * 其它命令的使用方式（命令具体查看defaultConfig）
 * npm start -- --port=9000 --https
 */
const { argv } = require('yargs');

const localesDataIds = [
  '5dbbf2df279509006c4524fe', // 后台返回的字典库
  '5dbbf37e279509006c452663', // 考中字典库
  '5dbbf3e2279509006c452a5e', // 公共组件字典库
];

// 默认配置项
const localServerConfig = {
  projectName: 'Exam', // 表示考中
  https: false, // 是否开启https服务
  port: 8000, // 默认开启端口
  privatePath: '/node_modules/', // 私有包的位置
  downloadLocalesApi: `https://front-basic-dev.aidoin.com/api/i10n/down?vids=${localesDataIds.join(
    ','
  )}`, // 下载字典库的网址
};

// 开发环境
const devConfig = {
  proxy: 'http://10.17.32.34:8200',

  resourceproxy: 'http://10.18.32.150:1443',

  // proxy    : "http://10.17.9.21:8200",
  authCode: 'Basic d2ViYXBwMjphZG1pbg==',
};

// 测试环境
const sitConfig = {
  // sit - proxy
  proxy: 'http://10.17.32.35:8200',
  // uat - proxy
  // proxy    : "http://10.17.9.233:8200",

  resourceproxy: 'http://10.17.32.35:1443',

  // 北京-demo 版本
  // proxy    : "http://10.17.9.130:8200",
  authCode: 'Basic d2ViYXBwMjphZG1pbg==',
};

// 生产环境
const proConfig = {
  proxy: 'http://10.17.9.233:8200',

  resourceproxy: 'http://10.18.32.150:1443',

  authCode: 'Basic d2ViYXBwMjphZG1pbg==',
};

module.exports = () => {
  // 获取当期的环境
  let currentEnv = {};
  const type = typeof argv.env === 'object' ? argv.env.pop() : argv.env;
  if (!type || type === 'dev') {
    currentEnv = { ...devConfig };
  } else if (type === 'sit') {
    currentEnv = { ...sitConfig };
  } else if (type === 'pro') {
    currentEnv = { ...proConfig };
  }
  return {
    ...localServerConfig,
    ...currentEnv,
    ...argv,
    env: type,
  };
};
