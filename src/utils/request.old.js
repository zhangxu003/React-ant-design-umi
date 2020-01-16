import fetch from 'dva/fetch';
import { message } from 'antd';
import { isJsonString } from '@/utils/utils';
import hash from 'hash.js';
import { formatMessage } from 'umi/locale';
import { isAntdPro } from './utils';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};


/**
 * @description:  http code 类型的统一处理
 * @param {type}
 * @return:
 */
const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  let errortext = codeMessage[response.status] || response.statusText;
  if( response.status >= 500 ){
    errortext = "网络连接断开"
  }
  const error = new Error(errortext);
  error.type = "server";        // 错误的类型
  error.status = response.status;
  error.response = response;
  throw error;
};


/**
 * @description: 对后台返回信息 进行 统一的处理模型
 * @param {type}
 * @return:
 */
const serverStatus = result=>{

  const { responseCode, data  } = result;
  let res = data;

  // 系统错误
  if (responseCode === '400') {
    const error = new Error(res);
    error.type = "server";
    error.status = 400;
    error.response = result;
    throw error;
  }

  // 用户名密码--认证失败
  if (responseCode === '401') {
    const error = new Error(res);
    error.type = "server";
    error.status = 401;
    error.response = result;
    throw error;
  }

  // token过期--认证失败
  if (responseCode === '402') {
    const error = new Error(res);
    error.type = "server";
    error.status = 402;
    error.response = result;
    throw error;
  }

  // 业务错误
  if (responseCode === '460') {
    message.info(res, 2);
  }

  // 用户名密码错误--验证失败
  if (responseCode === '461') {
    message.info(res, 2);
  }

  // 业务警告类状态
  if (responseCode === '462') {
    // 判断data是否是json字符串
    if (isJsonString(res)) {
      const { type, message: msg } = JSON.parse(res);
      message.warn(msg, 2);
      res = type;
    } else {
      message.warn(res, 2);
    }

  }
  // 返回请求成功
  return {
    responseCode,
    data: res
  };
}

// 默认 在 1s 内只能提示一次
let showMessage = false;
const showNet = ()=>{
  if( !showMessage ){
    message.info("网络不稳定！",3);
    showMessage = true;
    setTimeout(()=>{
      showMessage = false;
    },1000);
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
  const options = {
    expirys: isAntdPro(),
    ...option,
  };

  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  const taken = localStorage.getItem('access_token');
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body && newOptions.body.formdata)) {
      if (taken && taken !== 'undefined') {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: taken,
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      } else {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      }
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        Authorization: process.env.ENV_CONFIG.authCode,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        ...newOptions.headers,
      };
      let ret = '';
      for (let it in newOptions.body) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(newOptions.body[it]) + '&';
      }
      newOptions.body = ret;
    }
  } else {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: taken,
      ...newOptions.headers,
    };
  }




  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }


  let longRequest = setTimeout(()=>{
    longRequest = "";
    showNet();
  },20000);

  // 获取请求数据
  return fetch( url,newOptions )
  .then(checkStatus)
  .then(response=>response.json())
  .then(item=>{
    if( !item.responseCode ){
      return item;
    }
    const {responseCode,...params} = item;
    const {data} =params;
    if( responseCode !== "200" ){
      params.data = formatMessage({id:data});
    }
    return {
      responseCode,
      ...params
    };
  })
  .then(serverStatus)
  .then(data=>{
    // 结束请求
    if( longRequest ){
      clearTimeout(longRequest);
    }
    return data;
  })
  .catch(err=>{
    // 结束请求
    if( longRequest ){
      clearTimeout(longRequest);
    }
    throw err;
  });
}


export function requestBasic(url, option){

  const options = {
    expirys: isAntdPro(),
    ...option,
  };
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  const taken = localStorage.getItem('access_token');
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body && newOptions.body.formdata)) {
      if (taken && taken !== 'undefined') {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: taken,
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      } else {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      }
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        Authorization: process.env.ENV_CONFIG.authCode,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        ...newOptions.headers,
      };
      let ret = '';
      for (let it in newOptions.body) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(newOptions.body[it]) + '&';
      }
      newOptions.body = ret;
    }
  } else {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: taken,
      ...newOptions.headers,
    };
  }

  // 获取请求数据
  return fetch( url,newOptions )
  .then(checkStatus)
  .then(response=>response.json())
}
