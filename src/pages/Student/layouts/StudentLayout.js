/*
 * @Author: tina.zhang
 * @Date: 2019-01-05 14:17:30
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-04-23 11:17:35
 * @Description: 学生机基本layout
 */

import React from 'react';
import { connect } from "dva";
import { message, Modal } from "antd";
import { formatMessage, FormattedMessage } from "umi/locale";
import cs from "classnames";
import CommandContainer from "@/layouts/CommandContainer";
import { sendMS,setc } from "@/utils/instructions";
import router from 'umi/router';
import styles from './StudentLayout.less';
import { completionStatistics,completionInstanceList } from '@/frontlib/utils/utils';
import DownCount from "@/pages/Student/Components/DownCount";

const { vb } = window;
@connect(({ student, vbClient }) => {
  const { paperList,loadPaper } = student;
  const { computerAi, earphone, microphone, deviceState,ipAddress } = vbClient;
  // 判断当期设备检测的状态
  const checkError = computerAi === "fail" || earphone === "fail" || microphone === "fail" || deviceState === "offline";
  return {
    paperList,
    loadPaper,
    checkError,
    ipAddress
  }
})
class CheckLayout extends React.PureComponent {

  componentDidMount() {
    const { dispatch, paperList,ipAddress } = this.props;
    const self = this;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    if(studentIpAddress == ""){
      localStorage.setItem('studentIpAddress',ipAddress);
    }
    vb.getSocketManager().onReceive((res) => {
      console.log(res);
      if (res && res.command === 'stop:manual') {
        router.push('/student/download/paper/result');
      }
      if (res&&res.command==='clean') {
        // 获取的清屏操作的时候，默认直接刷新页面到教师机，防止上次考试的影响带入此次考试中
        window.location.href="/student";
        // console.log('页面中收到清屏操作')
        // router.push('/student');
      }
      if (res && res.command === 'close') {
        // vb.close();
      }
      if (res && res.command === 'paperused:return') {
        // 教师端发送的练习试卷列表
        // 接收到教师端发来的数据指令
        const data = JSON.parse(res.data)
        dispatch({
          type: "student/setPaperList",
          payload: data,
        });
      }

      if (res && res.command === 'modify:number') {
        console.log(res.data);
        // 老师端修改座位号回掉
        const { number } = JSON.parse(res.data);
        localStorage.setItem('number', number);
        const teacherIpAddress = localStorage.getItem('teacherIpAddress');

        const params = {
          number,
          teacherIpAddress
        }

        dispatch({
          type: "student/setTeacherInfo",
          payload: { "seatNo":number },
        });

        // ** 更新学生机的AGENT配置信息 **/
        setc({
          params,
          sucessCallback: () => {},
          failCallback: (e) => {
            console.log(e);
            message.warning(formatMessage({id:"task.message.connect.failed",defaultMessage:"连接失败"}));
          }
        })
      }

      if (res && res.command === 'student:getstatus') {
        const { paperList: list = [], match: propsMatch, location: { pathname }, checkError } = this.props;
        const newPaperList = list.map(tag => tag.packageResult).filter(tag => !!tag);
        const { taskType } = propsMatch.params;

        // 判断是否在设备检测中
        if (pathname.includes("deviceCheck")) {
          sendMS("student:status", {
            ipAddr: localStorage.getItem('studentIpAddress'),
            monitorStatus: checkError ? "MS_5" : "MS_3",
            answerNum: [],
            instanceList: [], 
            answerCount: 0,
            respondentsObject: []
          });
        } else {
          const paperId = localStorage.getItem('paperId');
          let getMonitorStatus = "";
          let masterData = {};
          let paperData = {};
          for (let i in paperList) {
            if (paperList[i].packageResult) {
              if (paperList[i].paperId == paperId) {
                masterData = paperList[i].masterData;
                paperData = paperList[i].paperData;
                if(paperList[i].packageResult.result == 1){
                  getMonitorStatus = "MS_16";//练习完成
                }

                if(paperList[i].packageResult.result == 2){
                  getMonitorStatus = "MS_15";//未检测到答案包
                }

                if(paperList[i].packageResult.result == 3){
                  getMonitorStatus = "MS_13";//答卷缺失
                }
              }
            }
          }
          // 将当期的信息状态返回给教师机
          sendMS("student:status", {
            ipAddr: localStorage.getItem('studentIpAddress'),
            monitorStatus: (taskType === "result" || getMonitorStatus === "MS_13" || getMonitorStatus === "MS_15") ? getMonitorStatus : "MS_4",
            answerNum: completionStatistics(masterData),
            instanceList: completionInstanceList(paperData), 
            answerCount: masterData &&masterData.mains&& masterData.mains.length - 1 || 0,
            respondentsObject: newPaperList
          });
        }
      }

      if (res && res.command === 'connect') {
        console.log("=================connect==================");
        // 教师端指令状态  连接成功后问教师机现在是在哪一步
        console.log("重新连接上。")
        const data = {
          "ipAddr": localStorage.getItem('studentIpAddress')
        };

        sendMS('commandstatus', data, '');
        const paperId = localStorage.getItem('paperId');
        const newPaperList = [];
        let monitorStatus = "MS_13";
        let masterData = {};
        let paperData = {};
        for (let i in paperList) {
          if (paperList[i].packageResult) {
            if (paperList[i].paperId == paperId) {
              masterData = paperList[i].masterData;
              paperData = paperList[i].paperData;
              if(paperList[i].packageResult.result == 1){
                monitorStatus = "MS_16";
              }

              if(paperList[i].packageResult.result == 2){
                monitorStatus = "MS_15";
              }
            }
            newPaperList.push(paperList[i].packageResult);
          }
        }

        if(newPaperList.length == 0 ){
          monitorStatus = "MS_4";
        }
        if(self.props.loadPaper === "fail"){
          monitorStatus = "MS_7";
        }

        dispatch({
          type: "student/updateDownloadPaper",
          payload: { loadPaper : "" , isConnect:true },
        });
        // 将当期的信息状态返回给教师机
        sendMS("student:status", {
          ipAddr: localStorage.getItem('studentIpAddress'),
          monitorStatus,
          answerNum: completionStatistics(masterData),
          instanceList: completionInstanceList(paperData), 
          answerCount: masterData && masterData.mains && masterData.mains.length - 1 || 0,
          respondentsObject: newPaperList
        });
      }

      if (res && res.command === 'disconnect') {
          console.log("断开连接")
          dispatch({
            type: "student/updateDownloadPaper",
            payload: { isConnect:false },
          });
      }


      if( res && res.command === "taskStop" ){
        const resJson = JSON.parse(res.data)
        console.log("================taskStop=================");
        // 弹框提示“任务被XX教师终止”，5S后自动转到考试训练等待页
        Modal.info({
          title : formatMessage({id:"task.title.tips",defaultMessage:"提示"}),
          icon : null,
          centered : true,
          width: 500,
          content : <DownCount teacherName={resJson.msgInfo} />,
          okButtonProps : {style:{display:"none"}}
        });
      }


      if( res && res.command === "recycle" ){
        // 重新交卷( 批量处理 )
        paperList.forEach(item=>{
          if( item.packageResult && item.packageResult.result === 3 ){
            // 对交卷失败的试卷，再次交卷
            dispatch({
              type    : "student/uploadPackage",
              payload : item.snapshotId
            });
          }
        });

      }


    })
  }

  // 点击触发举手事件
  help = () => {
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS("help", { "ipAddr": studentIpAddress })
    message.success(formatMessage({id:"task.message.raise.hands",defaultMessage:"举手成功！"}))
  }

  render() {
    const { children } = this.props;
    return (
      <div className={styles.container}>
        <CommandContainer />
        <div className={styles.body}>
          {/* 头部 */}
          <header>
            <div className={styles.top} />
            <img src="http://res.gaocloud.local/logos/logo_top_bar@2x.png" alt="" />
          </header>
          {/* 内容部分 */}
          <main>
            {children}
          </main>
          <footer>
            <FormattedMessage
              id="task.text.raise.hands.for.help"
              defaultMessage="遇到问题？{hand}等待老师处理"
              values={{
                hand : (
                  <span className={cs("iconfont","icon-raise-hand",styles.hand)} onClick={this.help}>
                    {formatMessage({id:"task.text.raise.hands",defaultMessage:"举手"})}
                  </span>
                )
              }}
            />
          </footer>
        </div>
      </div>
    );
  }
}

export default CheckLayout;
