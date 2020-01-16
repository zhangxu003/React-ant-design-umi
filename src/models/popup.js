/*
 * @Author: tina.zhang
 * @Date: 2018-12-19 13:08:40
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-15 18:59:59
 * @Description:  弹出层modals集合
 */

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export default {
  namespace: 'popup',

  state: {
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓教师机 begin↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

    // 教师机--任务监听页面--异常处理【学生id】（考试的异常处理）
    examExceptionHandle : {
      visible : false,
      data    : "",    // connId  学生的座位号信息
    },

    // 教师机--任务监听页面--异常处理【学生id】（练习的异常处理）
    practiceExceptionHandle : {
      visible : false,
      data    : "",    // connId  学生的座位号信息
    },


    // 文件传输中的状态（任务列表--上传答案包|下载试卷包 loading ）
    transLoading : {
      visible : false,
      data    : ""  // 任务的id
    },

    // 文件传输中的状态（任务列表--上传答案包|下载试卷包 loading ）
    transFail : {
      visible : false,
      data    : "",   // 任务的id
    },

    // 文件传输中的状态（任务列表--上传答案包|下载试卷吧 10s后提示 网络不稳定 ）
    transWarn : {
      visible : false,
      data    : ""   // 任务的id
    },

    // 一键检测报告中，选中以后的弹框
    report : {
      visible : false,
      data    : {
        title   : "",
        data    : [],
        columns : []
      },
    },

    // 一键检测的状态进度展示
    autoCheck : {
      visible : false,
      data    : "",    // checking 环境检测中  downloading 测试包下载中
    },

    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑教师机 end↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓学生机 begin↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

    // 耳机掉落的弹出框
    dropEarphone : { visible : false },

    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑学生机 end↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  },

  effects: {

    // 打开弹出框
    *open({payload,...data},{put}){
      // 判断是否是字符串
      yield put({
        type : "toggle",
        payload : {
          key : payload,
          visible : true,
          ...data
        }
      });
    },

    // 关闭弹出框
    *close({payload},{call,put,select}){
      const popup = yield select(state=>state.popup);
      const obj = popup[payload];
      // 关闭弹框，分两步
      // 1 : visible 设为false
      yield put({
        type : "toggle",
        payload : {
          ...obj,
          key : payload,
          visible : false,
        }
      });

      // 2 : 等待400ms
      yield call(delay,300);

      // 3 : 删除数据
      yield put({
        type : "toggle",
        payload : {
          key : payload,
          visible : false,
        }
      });
    },
  },

  reducers: {

    /**
     * @description: 修改数据
     * @param {type}
     * @return:
     */
    toggle( state,{payload} ){
      const { key,...params } = payload
      return {
        ...state,
        [key] : params
      }
    }


  },

  subscriptions: {
    // 模拟测试数据
    test(){
      // 开发环境下存在，为了方便系统调试
      if( process.env.NODE_ENV === "development" ){
        const {_store:store} = window.g_app;
        window.Dispatch = store.dispatch;
        window.GetState = ()=>store.getState();
      }
    }
  }
};

