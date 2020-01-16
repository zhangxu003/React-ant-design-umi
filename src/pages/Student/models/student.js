import apiUrl from "@/services/apiUrl";
import qs from "qs";
import { creatToken, fileDownLoad, downloadFromVbclient, downloadShowFromVbclient } from '@/services/api';
import { download, uploadAnswerPack, sendMS } from '@/utils/instructions';
import { delay } from "@/utils/utils";

export default {
  namespace: 'student',
  state: {
    proxyToken  : "",  // 当前学生机的token
    taskId      : "",  // 当前要进行的任务id
    studentName : "",  // 考生的名称
    studentId   : "",  // 考生的学号
    description : "",  // 任务描述
    paperpolicy : "",  // 试卷的发放策略
    examNo      : "",  // 考号
    seatNo      : "",  // 座位号
    paperList   : [],  // 练习试卷
    paperData   : {},  // 试卷JSON
    showData    : {},  // 展示JSON
    loadPaper   : "success",
    isConnect   : true, // 网络是否连接
    paperMd5    : "",   // 当前试卷的md5
    snapshotId  : "",   // 当前试卷的快照
  },

  effects: {
      /**
     * @description: 保存老师发来的练习试卷列表
     * @param {type}
     * @return:
     */
    *setPaperList({ payload }, { put }){
      yield put({
        type : "savePaperList",
        payload
      })
    },

    *updateDownloadPaper({ payload }, { put }){
      yield put({
        type : "saveDownloadPaper",
        payload
      })
    },
    /**
     * @description: 保存试卷信息
     * @param {type}
     * @return:
     */
    *setPaperInfo({ payload }, { put }){
      const {paperData,showData} = payload;
      yield put({
        type : "savePaperInfo",
        payload :{paperData,showData}
      })
    },
    /**
     * @description: 去获取学生对应的token
     * @param {type}
     * @return:
     */
    *creatProxyToken({ payload }, { call, put }) {
      try{
        const response = yield call(creatToken, payload);
        yield put({
          type: 'saveProxyToken',
          payload: response,
        });
        return true;
      }catch(err){
        // 如果是断网情况下，之前结束请求，其他情况下 返回 return false;
        if( err.status === "timeout" || err.status === "brokenNetwork" || err.status === "other" || err.status>=500 ){
          throw err;
        }else{
          if( typeof(err.next) === "function" ){
            err.next();
          }
          // 其它类型错误，直接return false;
          return false;
        }
      }
    },

    /**
     * @description: 设置taskId
     * @param {type}
     * @return:
     */
    *setTaskInfo({ payload }, { put }){
      const {taskId,description,paperpolicy} = payload;
      yield put({
        type : "updateStudentStore",
        payload : { taskId, description, paperpolicy }
      })
    },

    /**
     * @description: 设置学生的信息--主要为考号，座位号
     * @param {type}
     * @return:
     */
    *setTeacherInfo({ payload }, { put,select }){
      const { examNo,seatNo } = payload;
      const { examNo : oldExamNo ,seatNo : oldSeatNo } = yield select(state=>state.student);
      yield put({
        type : "updateStudentStore",
        payload : {
          examNo : examNo || oldExamNo,
          seatNo : seatNo || oldSeatNo
        }
      })
    },

    /**
     * @description:
     * 1、 通过proxy 获取 试卷密钥 和 试卷快照（ 考试需要，练习不需要 ）
     * 2、 将url,密码和快照发送给vbclient，通过vbclient下载试卷到vbclient端
     * 3、 学生机通过vbclient内部的路径，获取试卷的PaperJSON
     * 4、 通过paperJson获取展示showJSON
     * @param {type} payload 通过判断是 考试和练习
     * @return:
     */
    *downloadPaper({payload}, { put,call,select }){

      // 延时500ms 为了有好多加载效果
      yield call( delay, 500 );

      const { ipAddress } = yield select(state=>state.vbClient);
      const { taskId, examNo, seatNo, proxyToken, studentId } = yield select(state=>state.student);
      // 先清除当期的环境里的 showData 和 paperData
      yield put({
        type : "updateStudentStore",
        payload : {
          showData   : {},
          paperData  : {},
          paperMd5   : "",
          snapshotId : ""
        }
      });
      try{
        let paperMd5 = "";
        let snapshotId = "";

        // 如果是考试，则进行 步骤一：
        if( !payload ){
          // 步骤一
          const { data } =  yield call( fileDownLoad, { ipAddress, taskId, examNo, seatNo } );
          ({paperMd5,snapshotId} = data);
        }else{
          ({paperMd5,snapshotId} = payload );
        }

        yield put({
          type : "updateStudentStore",
          payload : {
            paperMd5,
            snapshotId
          }
        });
        localStorage.setItem('paperMd5', paperMd5);
        localStorage.setItem('snapshotId', snapshotId);

        // 步骤二，通知vbClient下载试卷
        const params = {
          taskId,
          snapshotId,
          studentId
        };
        yield call( download,{
          url   : `${apiUrl['VB-file']}?${qs.stringify(params)}`,
          token : proxyToken,
          md5   : paperMd5
        });

        // 步骤三：学生机访问vbclient或 vbclient的试卷JSON
        const paperData = yield call( downloadFromVbclient, paperMd5 );

        // 步骤四：根据试卷JSON 获取展示JSON
        const { paperInstance } = paperData;

        const showData = {};
        const requests = Object.keys( paperInstance ).reduce((current,item)=>{
          const result = paperInstance[item];
          if( result.pattern && result.pattern.questionPatternId ){
            current.push(
              downloadShowFromVbclient(paperMd5,result.pattern.questionPatternId)
              .then(e=>{
                showData[result.pattern.questionPatternId] = e;
              })
            );
          }
          return current;
        },[]);

        const requestAll = ()=>new Promise((resolve,reject)=>{
          Promise.all(requests).then(()=>resolve()).catch(()=>resolve(reject))
        });

        // 批量下载
        yield call(requestAll);
        // 更新数据
        yield put({
          type : "updateStudentStore",
          payload : {
            showData,
            paperData
          }
        });
        return {
          paperMd5,
          snapshotId
        };
      }catch(err){
        return false;
      };
    },


    /**
     * 上传答题包
     * @param {*} param0
     * @param {*} param1
     */
    *uploadPackage({payload}, { put,call,select }){
      // 根据试卷快照id ，获取试卷列表
      const { paperList=[], taskId, studentId } = yield select(state=>state.student);
      const { ipAddress } = yield select(state=>state.vbClient);
      const { packageResult={}, snapshotId } = paperList.find(item=>item.snapshotId === payload) || {};
      const { respondentsObject={} } = packageResult;
      const { respondentsMd5, paperName } = respondentsObject.respondentsObject;

      const handleResult = bool=>{
        respondentsObject.respondentsObject.upLoadStatus = bool?1:0;
        packageResult.result = bool?1:3;
        const body = {
          ipAddr : ipAddress,
          paperid: snapshotId,
          result: bool?1:3,
          respondentsObject
        };
        console.log(`上传试卷包${bool?"成功":"失败"}`,snapshotId);
        sendMS('recycle:reply', body);
      }

      try{
        yield call( uploadAnswerPack,{
          taskId,
          studentId,
          snapshotId,
          fileName : paperName,
          paperMd5 : respondentsMd5
        });
        // 上传成功
        handleResult(true);
      }catch(err){
        // 上传失败
        handleResult(false);
      }

      // 更新学生机modal数据
      yield put({
        type    : "savePaperList",
        payload : paperList.map(item=>{
          if( item.snapshotId === snapshotId ){
            return {
              ...item,
              packageResult
            }
          }
          return {...item};
        })
      });

    }
  },

  reducers: {

    /**
     * @description: 更新modealnamespace为 student 的总体数据
     * @param {type}
     * @return:
     */
    updateStudentStore(state, {payload}){
      return {
        ...state,
        ...payload
      }
    },
    /**
     *
     *  更新下载试卷状态
     *  @Author: tina.zhang
     * @date 2019-03-18
     * @param {*} state
     * @param {*} {payload}
     * @returns
     */
    saveDownloadPaper(state, {payload}){
      return {
        ...state,
        ...payload
      }
    },
      /**
     * @description:试卷的总体数据
     * @param {type}
     * @return:
     */
    savePaperList(state, {payload}){
      return {
        ...state,
        paperList:payload
      }
    },
    /**
     * @description: 保存试卷信息
     * @param {type}
     * @return:
     */
    savePaperInfo(state, {payload}){
      return {
        ...state,
        ...payload
      }
    },

    /**
     * @description: 保存token的值
     * @param {type}
     * @return:
     */
    saveProxyToken(state, {payload}) {
      let token;
      if ( payload.data) {
        token = payload.data.id;
        localStorage.setItem('access_token', token);
      }
      return {
        ...state,
        proxyToken : token
      }

    },
  },


  subscriptions: {

    /**
     * 从localStorage 获取座位号写入teacher中
     * @param {*} param0
     */
    init({ dispatch }) {
      const number = localStorage.getItem('number');
      dispatch({
        type    : 'updateStudentStore',
        payload : {
          seatNo : number
        }
      });
    }
  },

};
