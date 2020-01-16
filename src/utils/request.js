import axios from 'axios';
import qs from 'qs';
import hash from 'hash.js';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { message } from 'antd';

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
 * 缓存接口数据
 * @param {*} response
 * @param {*} hashcode
 */
const cachedSave = (result, hashcode) => {
  if( result && typeof(result) === "object" && hashcode ){
    sessionStorage.setItem(hashcode, JSON.stringify(result));
    sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
  }
};


// 网络连接断开的报错，默认在200ms 内只能出现一次
let showMessage = false;
const missNet = ()=>{
  if( !showMessage ){
    message.error("网络连接断开！",3);
    showMessage = true;
    setTimeout(()=>{
      showMessage = false;
    },1000);
  }
}


// 账号过期的保存，默认在200ms 内只执行一次
let noTokenMessage = false;
const noToken = ()=>{
  if( !noTokenMessage ){
    message.error("账号已过期，请重新登录！",3);
    noTokenMessage = true;
    setTimeout(()=>{
      noTokenMessage = false;
    },1000);
  }
}

/**
 * handle catch
 * 对最后产出的异常，进行统一的处理，并添加到 error.next 上，
 * 方便 接口  ，自动处理相关错误的业务
 */
const handleCatch = (err)=>{

  // 对api的统一的请求做特殊处理
  if( err.type === "server" ){
    // eslint-disable-next-line no-param-reassign
    err.type = "hasHandle";
    // @HACK
    /* eslint-disable no-underscore-dangle */
    const { runtimeMode } = window.g_app._store.getState().vbClient;
    const { status } = err;

    // 业务错误,用户名密码错误--验证失败,业务警告类状态
    if( status === 460 || status === 461 || status === 462 ){
      message.warning( err.message );
      return;
    }

    // 后台错误
    if( status === 400 ){
      if( runtimeMode === "development" ){
        router.push('/agenterror/ERROR_400');
      }else{
        window.location.href = '/agenterror/ERROR_400';
      }
      return;
    }

    // 用户名密码--认证失败|token过期--认证失败-跳转到首页( 401,402 )
    if( status === 401  || status === 402 ){
      noToken();
      if( runtimeMode === "development" ){
        router.push('/');
      }else{
        setTimeout(()=>{
          window.location.href = '/';
        },600);
      }
      return;
    }

    // 请求超时，请求失败，axios 失败 默认为网络断开
    if( status === "timeout" || status === "brokenNetwork" || status === "other" ){
      missNet();
      return;
    }

    // 其它类型的错误
    if( status > 400 && status < 500 ){
      if( runtimeMode === "development" ){
        router.push('/agenterror/ERROR_400');
      }else{
        window.location.href = '/agenterror/ERROR_400';
      }
      return;
    }

    if( status >= 500 ){
      // 网络问题
      missNet();
    }

  }
}



export default function request(url,option={}){

  const {
    body,     // post 携带的 内容，fetch 为body axios 为data
    expirys,  // 是否直接调用缓存的值，进行逻辑处理（如果true：则为6000ms，或者直接设置时长）
    ...params
  } = option;

  // 设置默认的配置项
  const options = {
    timeout  : 20000,  // 默认20秒的请求超时时间
    // `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。
    // 如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，
    // promise 将被 resolve; 否则，promise 将被 rejecte
    validateStatus: (status)=> status >= 200 && status < 300,
    headers  : {
      'Accept' : 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    },
    data : body,
    ...params
  };

  // 判断token 是否存在，如果存在则 添加 token
  const token = localStorage.getItem('access_token');
  if( token ){
    options.headers.Authorization = token;
  }else{
    options.headers.Authorization = process.env.ENV_CONFIG.authCode;
  }

  // 如果请求的body中 有formdata=true， 则默认任务是表单提交（主要用于文件的上传，下载）
  if( options.data && options.data.formdata ){
    options.headers['Content-Type'] = "application/x-www-form-urlencoded;charset=utf-8";
    options.headers.Authorization = process.env.ENV_CONFIG.authCode;
    options.data = qs.stringify(options.data);
  }

  // 是否获取缓存进行逻辑处理
  let hashcode = "";
  if( expirys ){
    const cacheTime = typeof(expirys) === "number" ? expirys : 6000;
    // 对当前请求生成 hashCode，进行下一次的比较
    const fingerprint = url + (options.data ? JSON.stringify(options.data) : '');
    hashcode = hash.sha256().update(fingerprint).digest('hex');

    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if( cached && whenCached ){
      const age = (Date.now() - whenCached);
      if ( age < cacheTime ) {
        return Promise.resolve(JSON.parse(cached));
      }

      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }
  return axios( url, options )
  .then((response)=>{
    // 对数据进行初步处理
    const { data } = response;
    const { responseCode } = data || {};

    // data 不包含 responseCode 或则 等于 200 才能继续执行
    if( !responseCode || responseCode === "200" ){
      // if( url.includes("proxy-token/create") ){
      //   const err = new Error();
      //   err.response = response;
      //   err.response.data = {
      //     responseCode : "400",
      //     data : "自测接口"
      //   }
      //   throw err;
      // }
      cachedSave( data, hashcode );
      return data;
    }

    // 异常返回值则抛出
    const error = new Error("请求失败");
    error.response = response;
    throw error;
  })
  .catch(err=>{
    const error = new Error("请求异常！");
    error.type = "server";

    // 用于在 modal effect 捕获异常以后，对特定异常做处理，其它类型异常继续执行
    error.next = ()=>{
      handleCatch(error);
    };

    // 对异常返回内容进行处理
    if( err.response ){
      const { status, data, statusText }  = err.response;
      if( status >= 200 && status < 300 ){
        // 后台服务器提供的错误
        const { responseCode, data : info } = data || {};
        const msg = formatMessage({id:info});
        error.response = data;
        error.message = msg;
        error.status = Number( responseCode );
        // "400" 系统错误
        // "401" 用户名密码--认证失败
        // "402" token过期--认证失败
        // "460" 业务错误
        // "461" 用户名密码错误--验证失败
        // "462" 业务警告类状态
      }else{
        // http协议提供的警告
        error.response = err.response;
        error.status = status;
        error.message = statusText || codeMessage[error.status];
        // if( status >= 500 ){
        //   error.message = "网络连接断开";
        // }
      }

      throw error;
    }

    // 请求直接失败处理
    if( err.request ){
      // 请求超时引发的问题
      if(err.message.includes('timeout') ){
        error.response = err.request;
        error.message =  "网络连接断开!";
        error.status = "timeout";
      }else{
        // 其他原因导致的请求失败（默认任务网络异常）
        error.response = err.request;
        error.message = "网络连接断开!";
        error.status = "brokenNetwork";
      }
      throw error;
    }

    // 其他类型错误，原因未知
    error.response = err;
    error.message = "原因未知";
    error.status = "other";
    throw error;
  });

}
