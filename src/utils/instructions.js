/* eslint-disable no-param-reassign */
/*
 * @Author: tina.zhang
 * @Date: 2019-01-30 11:19:12
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-09 17:47:08
 * @Description:
 */
import apiUrl from '@/services/apiUrl';
import { EventEmitter } from 'events';

const { vb } = window;

/**
 * @Author   tina.zhang
 * @DateTime  2018-11-28
 * @copyright 指令配置
 */

// 获取键盘锁
export const keyLocked = {
  get value() {
    return vb.isKeyLocked;
  },

  set value(val) {
    vb.isKeyLocked = val;
  },
};

// 判断当前是否使用了软件
export function isDesktop() {
  return !!window.vb;
}

//  获取角色
export function getRoles() {
  return vb.role;
  // var h = $("#label-result-1").text();
  // $("#label-result-1").text(h + "\r\n" + JSON.stringify(res));
}
// 指令发送接口--全发
export function sendM(type, data) {
  vb.getSocketManager().send({
    command: type,
    data: JSON.stringify(data),
  });
}

// 指令发送接口--单发   根据connId进行单发
export function sendMS(type, data, connId = '') {
  console.log('sendMS', type, data, connId);
  vb.getSocketManager().send({
    command: type,
    data: JSON.stringify(data),
    connId,
  });
}

// 监听数据的方法
export function onReceive(fn) {
  vb.getSocketManager().onReceive(res => {
    if (fn && typeof fn === 'function') {
      fn(res);
    }
  });
}

// 强制关闭学生机或者老师机
export function myClose() {
  vb.close();
}
// 录音管理--开始录音（若request参数存在则调用评分接口，若不存在，仅录音）
export function start() {
  vb.getRecorderManager().start({
    duration: 50,
    nsx: false,
    resourceType: 'off',
    request: {
      kernelType: 'eval.para.en',
      rank: 100,
      reference: {
        lms: [
          {
            text:
              'Last week I went to the theatre. I had a very good seat. The play was very interesting. I did not enjoy it. A young man and a young woman were sitting behind me. They were talking loudly. I got very angry. I could not hear the actors. I turned round. I looked at the man and the woman angrily.',
          },
        ],
        questionId: 'test',
      },
      precision: 0.5,
    },
  });
}

// 录音管理--停止录音
export function stop() {
  if (vb.deviceState.value === 'recording') {
    vb.getRecorderManager().stop();
  }
}

// 放音管理--开始放音
export function playType(resourceType) {
  vb.getPlayerManager().play({
    resourceType,
  });
}

// 放音管理--开始放音
export function play(tokenId) {
  vb.getPlayerManager().play({
    tokenId,
  });
}
// 放音管理--停止放音
export function stopplay() {
  if (vb.deviceState.value === 'playing') {
    vb.getPlayerManager().stop();
  }
}

//  获取学生机AENT配置信息
export function getc() {
  const res = vb.getConfigurationManager().get() || {};
  // 添加运行模式
  res.runtimeMode = vb.runtimeMode;
  return res;
}

// 重连 aent 配置
export function reAent() {
  vb.getConfigurationManager().refresh();
}

/**  更新学生机AENT配置信息
 *  @Author: tina.zhang
 * @date 2018-12-10
 *  dataSource:{
 *      params:{
 *          number:'座位号',
 *          teacherIpAddress:'老师机IP'
 *      },
 *      sucessCallback,
 *      failCallback
 *  }
 */
export function setc(dataSource) {
  // params,sucessCallback,failCallback
  const { params, sucessCallback, failCallback } = dataSource;
  const { number, teacherIpAddress } = params;
  const teacherIpAddressStr = String(teacherIpAddress);
  vb.getConfigurationManager().modify({
    number: Number(number),
    teacherIpAddress: teacherIpAddressStr,
    success: () => {
      sucessCallback();
    },
    fail: res => {
      failCallback(res);
    },
  });
}

// 获取教师机的鉴权码
export function getcode() {
  return vb.getConfigurationManager().code;
}

/**
 * getFileManager(文件管理)
 *  @Author: tina.zhang
 * @description 试卷下载
 * @return   {[type]}                 [description]
 */
// export function download({ url, paperMd5, success, fail }) {
//   const token = localStorage.getItem("access_token");
//   console.log("token", token)
//   console.log({
//     url,
//     token, // "qweqwewqe.qweqwewqe.qweqwewqe","2476e7a690.1447f888412b725.fe41c6e"
//     md5: paperMd5,
//   })
//   vb.getFileManager().download({
//     url,
//     token, // "qweqwewqe.qweqwewqe.qweqwewqe","2476e7a690.1447f888412b725.fe41c6e"
//     md5: paperMd5,
//     success: (e) => {
//       console.log(e);
//       success(e)
//     },
//     fail: (e) => {
//       console.log(e);
//       fail(e);
//     },
//     onProgressChanged: (e) => {
//       console.log(e);
//     }
//   });

export function download(params) {
  return new Promise((resolve, reject) => {
    const { url, token, md5, progress } = params;
    console.log('download', params);
    vb.getFileManager().download({
      url,
      token,
      md5,
      success: e => {
        resolve(e);
      },
      fail: e => {
        reject(e);
      },
      onProgressChanged: e => {
        if (typeof progress === 'function') {
          progress(e);
        }
      },
    });
  });
}

// vb.getFileManager().onProgressChanged(function (res) {
//       console.log(res);
// });
// vb.getFileManager().onDownloadCompleted(function (res) {
//       console.log(res);
//       success(res)
// });

// vb.getFileManager().onError(function (res) {
//     console.log(res);
// });

/**
 * 上传答卷包文件
 * @Author   tina.zhang
 * @DateTime 2018-12-20T09:10:09+0800
 * @param    {[type]}                 options.url      [description]
 * @param    {[type]}                 options.paperMd5 [description]
 * @param    {[type]}                 options.fileName [description]
 * @param    {[type]}                 options.success  [description]
 * @param    {[type]}                 options.fail     [description]
 * @return   {[type]}                                  [description]
 */
export function upload({ url, paperMd5, fileName, success, fail }) {
  const token = localStorage.getItem('access_token');

  vb.getFileManager().upload({
    url,
    token,
    md5: paperMd5,
    fileName,
    success: res => {
      console.log(res);
      success(res);
    },
    fail: res => {
      console.log(res);
      fail(res);
    },
    onProgressChanged: res => {
      console.log(res);
    },
  });
}

export function uploadAnswerPack(params) {
  const { taskId, studentId, snapshotId, fileName, paperMd5 } = params;
  const url = `${apiUrl['VB-file']}?taskId=${taskId}&studentId=${studentId}&snapshotId=${snapshotId}`;
  const promise = new Promise((resolve, reject) => {
    vb.getFileManager().upload({
      url,
      token: localStorage.getItem('access_token'),
      md5: paperMd5,
      fileName,
      success: res => {
        console.log('上传成功', res);
        resolve(res);
      },
      fail: res => {
        console.log('上传失败', res);
        reject(res);
      },
      onProgressChanged: res => {
        console.log('上传进度', res);
      },
    });
  });
  return promise;
}

/**
 * 获取耳机音量大小
 *
 *  @Author: tina.zhang
 * @date 2018-12-15
 * @export
 */
export function getEarphoneVolume() {
  const volumeObj = vb.getPlayerManager().volume;
  const volume = volumeObj.volume ? volumeObj.volume : 0;
  return volume;
}

/**
 * 设置耳机音量大小
 *
 *  @Author: tina.zhang
 * @date 2018-12-15
 * @export
 * @param {*} value
 */
export function setEarphoneVolume(value, tag = false) {
  const vol = Number(value);
  vb.getPlayerManager().setVolume({
    volume: vol,
    tip: tag,
  });
}

/**
 * 获取麦克风音量大小
 *
 *  @Author: tina.zhang
 * @date 2018-12-15
 * @export
 * @returns
 */
export function getMicphoneVolume() {
  const volumeObj = vb.getRecorderManager().volume;
  const volume = volumeObj.volume ? volumeObj.volume : 0;
  return volume;
}

/**
 * 设置麦克风音量大小
 *
 *  @Author: tina.zhang
 * @date 2018-12-15
 * @export
 * @param {*} vol
 */
export function setMicphoneVolume(value) {
  const vol = Number(value);
  console.log(vol);
  vb.getRecorderManager().setVolume({
    volume: vol,
  });
}

/**
 * 获取本机ip
 *
 *  @Author: tina.zhang
 * @date 2018-12-17
 * @export
 */
export function getCurrentClientIPAddress() {
  const res = vb.getSocketManager().ipAddress;
  const { ipAddress } = res;

  console.log('获取ipAddress', ipAddress);
  return ipAddress;
}

/**
 * 播放提示音资源
 *
 *  @Author: tina.zhang
 * @date 2018-12-17
 * @export
 * @param {*} {type,success=undefined,error=undefined}
 */
export function playTipSoundResource({ type, success = undefined, error = undefined }) {
  vb.getPlayerManager().play({
    resourceType: type,
  });

  vb.getPlayerManager().onStop(data => {
    if (success) {
      success(data);
    }
  });

  vb.getPlayerManager().onError(res => {
    if (error) {
      error(res);
    }
  });
}

/**
 * 锁屏
 *
 *  @Author: tina.zhang
 * @date 2018-12-17
 * @export
 */
export function lockScreen() {
  console.log('锁屏操作');
}

/**
 * 启用英文输入法
 *
 *  @Author: tina.zhang
 * @date 2018-12-25
 * @export
 */
export function LockInputMethod() {
  console.log('启用英文输入法');
  vb.imeMode = false;
}

/**
 * 更新本地时钟
 *
 *  @Author: tina.zhang
 * @date 2018-12-17
 * @export
 */
export function updateLocalClock() {
  console.log('更新本地时钟');
}

/**
 * 检测耳机、麦克风状态( 由于检测只能同时执行一次，先做队列处理 )
 *
 *  @Author: tina.zhang
 * @date 2018-12-18
 * @export
 */
async function checkEarAndMicphoneStatusPromise() {
  console.time('checkEarAndMicphoneStatus');
  // 1、检测放音设备
  const playerPromise = new Promise(resolve => {
    vb.getPlayerManager().onTest(res => {
      vb.getPlayerManager().onTest(() => {});
      console.timeEnd('getPlayerManager');
      resolve(res.isValid);
    });
    console.time('getPlayerManager');
    vb.getPlayerManager().test();
  });

  // 2、检测录音设备
  const recorderPromise = new Promise(resolve => {
    let isError = false;
    const clearFn = () => {
      vb.getRecorderManager().onTest(() => {});
      vb.getRecorderManager().onStop(() => {});
      vb.getRecorderManager().onError(() => {});
    };
    vb.getRecorderManager().onTest(() => {
      clearFn();
      console.timeEnd('getRecorderManager');
      resolve(true);
    });
    vb.getRecorderManager().onError(() => {
      clearFn();
      isError = true;
      console.timeEnd('getRecorderManager');
      resolve(false);
    });
    console.time('getRecorderManager');
    vb.getRecorderManager().test({
      duration: 3,
      resourceType: '',
      nsx: false,
    });
    setTimeout(() => {
      if (!isError) {
        vb.getRecorderManager().stop();
      }
    }, 100);
  });
  const [player, recorder] = await Promise.all([playerPromise, recorderPromise]);
  console.timeEnd('checkEarAndMicphoneStatus');
  console.log(`player:${player}`, `recorder:${recorder}`);
  return {
    player,
    recorder,
  };
}

// 注册队列函数
const queuen = (fn = () => {}) => {
  const list = [];
  let running = false;
  return params =>
    new Promise(async resolve => {
      list.push({ resolve, params });
      if (!running) {
        running = true;
        while (list.length > 0) {
          const { resolve: handleResolve, params: handleParams } = list.shift();
          // eslint-disable-next-line no-await-in-loop
          const data = await fn(handleParams);
          handleResolve(data);
        }
        running = false;
      }
    });
};

// 注册设备检测事件
export const checkEarAndMicphoneStatus = queuen(checkEarAndMicphoneStatusPromise);

/**
 * @description: 音频检测
 * @param {type}
 * @return:
 */
export function checkComputeAi() {
  return new Promise(resolve => {
    vb.getRecorderManager().onTestEngine(res => {
      resolve(res.result);
    });
    vb.getRecorderManager().onError(e => {
      console.log(e);
      resolve(false);
    });
    setTimeout(() => {
      vb.getRecorderManager().testEngine();
    }, 1000);
  });
}

/**
 * @description: 定义vbClient 绑定的设置的统一处理模式
 * @param {type}
 * @return:
 */
// @HACK
/* eslint-disable class-methods-use-this */
class Device extends EventEmitter {
  constructor() {
    super();
    // 教师机，没有这些操作
    if (getRoles() !== 101) return;

    // 1、绑定 耳机的掉落的触发事件
    vb.getPlayerManager().onDeviceStateChanged(async () => {
      // 获取当前状态下麦克风，和播放器的状态
      // onDeviceStateChanged 只能监听到耳机的掉落，
      // 而电脑设备如果有扬声器和麦克风一起处理
      const { player, recorder } = await checkEarAndMicphoneStatus();
      const params = {
        state: player && recorder ? 'online' : 'offline',
        data: { player, recorder },
      };
      this.emit('deviceStateChanged', params);
    });
  }

  // 设置静音
  set mute(status = true) {
    vb.getPlayerManager().setMute({ mute: status });
    vb.getRecorderManager().setMute({ mute: status });
  }

  // 获取静音状态
  get mute() {
    const { mute } = vb.getPlayerManager().volume;
    return mute;
  }
}
export const deviceManager = new Device();

/**
 * [archive description]
 * @Author   tina.zhang
 * @DateTime 2018-12-18T15:51:45+0800
 * @param    {[type]}                 options.callback [description]
 * @return   {[type]}                                  [description]
 */
export function archive({ tokenIds, answer, fileName, success, fail }) {
  vb.getFileManager().archive({
    tokenIds,
    answer,
    fileName,
    success: res => {
      console.log(JSON.stringify(res));
      success(res);
    },
    fail: res => {
      console.log(JSON.stringify(res));
      fail(res);
    },
  });
}

/**
 * 导出答卷包
 * @Author   tina.zhang
 * @DateTime 2018-12-20T13:30:35+0800
 * @return   {[type]}                 [description]
 */
export function exportLM({ code, md5, fileName, userData, success, fail }) {
  console.log(userData);
  vb.getFileManager().export({
    code,
    md5,
    fileName,
    userData,
    success: res => {
      success(res);
    },
    fail: res => {
      fail(res);
    },
  });
}

/**
 * @description: 导入答题包
 * @param {Object} params = {
 *  taskId,     // 任务id
 *  studentId,  // 学生id
 *  snapshotId, // 快照id
 *  token,      // token
 *  fileName    // 文件名称
 * }
 * @return:
 */
export function importAnswerPack(params) {
  const { taskId, studentId, snapshotId, token, fileName } = params;
  const url = `${apiUrl['VB-file']}?taskId=${taskId}&studentId=${studentId}&snapshotId=${snapshotId}`;
  const promise = new Promise((resolve, reject) => {
    vb.getFileManager().import({
      url,
      token,
      fileName,
      success: res => {
        console.log('导入成功', res);
        resolve(res);
      },
      fail: res => {
        console.log('导入失败', res);
        reject(res);
      },
      onProgressChanged: res => {
        /* eslint-disable no-underscore-dangle */
        window.g_app._store.dispatch({
          type: 'vbClient/updateProgress',
          payload: {
            studentId,
            snapshotId,
            uploadProcess: res.percentage,
          },
        });
        console.log(res);
      },
    });
  });
  return promise;
}

/**
 * 检测是否连接
 *
 *  @Author: tina.zhang
 * @date 2018-12-26
 * @export
 */
export function checkIsConnect() {
  return vb.getSocketManager().isConnected;
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓事件控制↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// 监听数据的方法
// 经测试onReceive全局只支持一次声明，以最有一起的声明为主
// let receiveEvent = [];
// export function onReceive(fn) {
//   receiveEvent.push(fn);
// }
// export const initOnReceive = ()=>{
//   vb.getSocketManager().onReceive(res => {
//     receiveEvent.forEach(fn=>{
//       if (fn && typeof fn === 'function') {
//         const result = {...res};
//         result.data = JSON.parse(result.data);
//         fn(result);
//       }
//     })
//   });
// };

/**
 * 指令转换
 */
export const orderTran = new Proxy(
  {
    recycle: 'recycle', // 教师--回收试卷--学生
    'recycle:reply': 'recycleReply', // 学生--回收试卷反馈--教师
  },
  {
    get(target, key) {
      if (key in target) {
        return target[key];
      }

      let val = '';
      Object.keys(target).forEach(item => {
        if (key && target[item] === key) {
          val = item;
        }
      });

      return val || key;
    },
  }
);

/**
 * 消息通信事件集合
 */
export const callEvents = {
  list: {},
  add: fn => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    callEvents.list[id] = fn;
    return id;
  },
  remove: id => {
    delete callEvents.list[id];
  },
};

/**
 * @description: 单发消息
 * @param {String} type     : 发送消息的key
 * @param {String} connId   : 发送给指定人的connId
 * @param {Object} data     : 发送的消息集合
 * @param {Boolean} hasBack : 是否有回调消息
 * fals e： 默认没有回调信息
 * true  : 有回掉 通过 callOne().then((res)=>console.log(res)) 通过res获取
 * typeof hasBack === "function" : 要执行的回调方式
 * true 和 "function" 的区别  true : 会有1s时间的超时时间，时候单纯的数据传输， “funciton” ： 适合长期的用户手动操作
 * @return:
 */
export const callOne = ({ type, connId, data, hasBack = false }) => {
  const result = { data };
  result.callType = 'BUSINESS'; // 消息的类型(业务类消息)
  result.callTo = connId; // 要发送给谁
  result.callFrom = ''; // 谁发送的消息

  return new Promise((resolve, reject) => {
    if (!hasBack) {
      sendMS(orderTran[type], result, connId);
      resolve();
    } else if (hasBack && typeof hasBack === 'function') {
      const callbackId = callEvents.add((...opt) => {
        hasBack(...opt);
        callEvents.remove(callbackId);
      });
      result.callbackId = callbackId;
      sendMS(orderTran[type], result, connId);
      resolve();
    } else {
      const callbackId = callEvents.add((...opt) => {
        resolve(...opt);
        callEvents.remove(callbackId);
      });
      // 如果3s没有回调则显示超时
      setTimeout(() => {
        callEvents.remove(callbackId);
        reject(new Error('请求超时'));
      }, 3000);
      result.callbackId = callbackId;
      sendMS(orderTran[type], result, connId);
    }
  });
};

/**
 * @description: 群发消息(群发消息没有回调事件)
 * @param {type}
 * @return:
 */
export const callAll = ({ type, data }) => {
  const result = { data };
  result.callType = 'BUSINESS'; // 消息的类型(业务类消息)
  result.callTo = ''; // 要发送给谁
  result.callFrom = ''; // 谁发送的消息
  return new Promise(resolve => {
    sendM(orderTran[type], result);
    resolve();
  });
};

/**
 * 启用回调事件的集合处理--在vbClient.js中启动
 * 业务类型的消息监听事件
 */
export const businessReceive = dispatch => {
  onReceive(({ command, data = {}, connId = '' }) => {
    // 判断是否是业务逻辑，还是系统逻辑
    if (data && typeof data === 'object' && data.callType === 'BUSINESS') {
      // 业务类型的总体逻辑处理
      const { callbackId, callType, callTo, callFrom, data: dataObj } = data;
      // 判断是回调数据还是非回调数据
      if (command === 'callBack') {
        // 触发本地的回掉事件
        const fn = callEvents.list[dataObj.pop()];
        if (fn && typeof fn === 'function') {
          fn(...dataObj);
        }
      } else {
        // 如果消息中带有callBackId则，生成callBackId方法
        const callBack = !callbackId
          ? ''
          : (...opt) => {
              const result = opt;
              result.push(callbackId);
              callOne({
                type: 'callBack',
                connId,
                data: result,
              });
            };
        // 获取自定的dispatch，事件
        dispatch({
          type: orderTran[command],
          payload: dataObj,
          connId,
          callBack,
          callType,
          callTo,
          callFrom,
        });
      }
    }
  });
};

/**
 * @description: vbClient 的窗口管理对象
 * @param {type}
 * @return:
 */
export const vbClientWin = {
  // 窗口尺寸控制
  // value  minimize 最小化  maximize 最大化
  set size(value) {
    if (value === 'minimize') {
      vb.minimize();
    } else if (value === 'maximize') {
      vb.maximize();
    }
  },

  // 获取当前的尺寸
  get size() {
    return vb.winState.stateName;
  },

  // 关闭vbclient
  close() {
    vb.close();
  },

  // 监听页面尺寸变化
  onSize(fn) {
    window.addEventListener('resize', () => {
      if (fn && typeof fn === 'function') {
        fn();
      }
    });
  },
};

/**
 * 获取版权信息
 */
export const copyRight = () => vb.copyRight;

/**
 * 保存学生机的状态信息
 */
export function storeData(data) {
  const studentInfo = JSON.parse(localStorage.getItem('studentInfo')) || {};
  data.taskId = studentInfo.taskId;
  data.ipAddr = localStorage.getItem('studentIpAddress');
  data.otherInfo = '';
  data.timestamp = new Date().getTime();
  data.netStatus = 'MS_1';

  console.log('======= storeData ========', data);
  vb.getSocketManager().store({
    data: JSON.stringify(data),
  });
}

// 关闭指定学生机
export function closeStudent(connId) {
  vb.getSocketManager().closeClient({ connId });
}

// 关闭所有学生机
export function closeAllStudent() {
  vb.getSocketManager().closeClient();
}

// 开始投屏
export function startCast(elementId) {
  vb.startCast({
    elementId, // 待投屏页面的区域的DIV的elementID
    sizeMode: 'center', // 投屏模式：居中
    success() {
      // 成功回调
      console.log('startCast success');
    },
    fail(res) {
      // 失败回调
      console.log(res);
    },
  });
}

// 结束投屏
export function stopCast() {
  vb.stopCast({
    success() {
      // 成功回调
      console.log('stopCast success');
    },
    fail(res) {
      // 失败回调
      console.log(res);
    },
  });
}

export function playStudentFile({ tokenId, url, success, error }) {
  console.log(tokenId);
  console.log(`${url}.wov`);
  console.log(window.paperUrl);
  vb.getPlayerManager().play({
    tokenId,
    url: `${url}.wov`,
  });

  vb.getPlayerManager().onStop(data => {
    if (success) {
      success(data);
    }
  });

  vb.getPlayerManager().onError(res => {
    if (error) {
      error(res);
    }
  });
}
