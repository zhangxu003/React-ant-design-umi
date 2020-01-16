import React, { Component } from 'react';
import { message } from 'antd';
import { connect } from "dva";
import { sendMS,storeData } from '@/utils/instructions';
import { formatMessage } from "umi/locale";
import Exampaper from '@/frontlib';
import { isOpenSwitchTopic} from '@/frontlib/utils/utils';
import listening from '@/assets/ExampaperAttempt/listening.gif';
import preparing from '@/assets/ExampaperAttempt/preparing.gif';
import reading from '@/assets/ExampaperAttempt/reading.gif';
import waiting from '@/assets/ExampaperAttempt/waiting.gif';
import answer from '@/assets/ExampaperAttempt/answer.gif';
import hint from '@/assets/ExampaperAttempt/hint.gif';
import recordFinish from '@/assets/ExampaperAttempt/record_finish.gif';
import record from '@/assets/record.gif';
import saverecord from '@/assets/saverecord.gif';
import tastDoneIcon from '@/assets/tast_done_icon.png';
import { completionInstanceList } from '@/frontlib/utils/utils';

const { ExampaperAttempt } = Exampaper;
const instructions = require('@/utils/instructions');

@connect(({vbClient, student, dictionary})=>{
  const { ipAddress } = vbClient;
  const { PHASE_LABEL } = dictionary;
  const { paperData={}, showData={}, snapshotId, taskId } = student;
  return {
    taskId,             // 任务ID
    ipAddress,          // 学生机的ip
    paperData,          // 试卷信息json
    showData,           // 试卷展示Json
    snapshotId,         // 当前试卷快照
    PHASE_LABEL
  }
})
class ExamPaper extends Component {

  state = {
    isLoad : true,    // 试卷是否在下载中
  }

  /**
   * 下载试卷反馈
   *  @Author: tina.zhang
   * @DateTime 2018-12-15T13:50:11+0800
   * @param    {[type]}                 status    状态
   * @param    {String}                 taskId    任务ID
   * @param    {String}                 paperName 学生机IP，可选
   * @param    {String}                 paperId   试卷ID
   * @return   {[type]}                           [description]
   */
  sendMessage=(status)=>{
    const { ipAddress, paperData, snapshotId, taskId } = this.props;
    const { name, paperInstance = []  } = paperData;
    let studentIpAddress = localStorage.getItem('studentIpAddress');
    if(!studentIpAddress){
      localStorage.setItem('studentIpAddress',ipAddress);
      studentIpAddress = ipAddress;
    }
    const body = {
      taskId,                                        // 任务ID
      ipAddr      : studentIpAddress,                // 学生机IP，可选
      paperId     : snapshotId,                      // 试卷ID
      paperName   : name,                            // 试卷名称
      answerCount : paperInstance.length,            // 题目数量
      instanceList: completionInstanceList(paperData), 
      status
    };
    sendMS('paper:down', body); // 下载试卷反馈
    if(status === "MS_7"){
      // 当下载试卷失败，发送paper:down指令后，调用Shell
      storeData({binessStatus:"MS_7"})
    }else{
      // 当下载试卷成功，发送paper:down指令后，调用Shell
      storeData({binessStatus:"MS_6"})
    }
  }

  /**
   * 下载试卷包
   *  @Author: tina.zhang
   * @DateTime 2018-12-15T11:10:28+0800
   * @return   {[type]}                 [description]
   */
  fileDownLoading=()=>{
    const { dispatch } = this.props;
    this.setState({isLoad:true});
    // 下载试卷
    dispatch({type : "student/downloadPaper"})
    .then(bealoon=>{
      if( bealoon ){
        // 下载成功
        console.log("下载成功");
        this.sendMessage( true );
      }else{
        // 下载失败
        console.log("下载失败");
        message.warn(formatMessage({id:"task.message.download.paper.failed",defaultMessage:"下载试卷失败！"}));
        this.sendMessage( 'MS_7' );
      }
      this.setState({isLoad:false});
    });
  }

  render() {
    const { isLoad } = this.state;
    const { paperData, showData, PHASE_LABEL } = this.props;
    window.ExampaperStatus = "EXAM";
    return (
      <div style={{ backgroundColor: 'rgb(70, 71, 73)' }}>
        <img src={listening} alt="" style={{ display: 'none' }} />
        <img src={preparing} alt="" style={{ display: 'none' }} />
        <img src={reading} alt="" style={{ display: 'none' }} />
        <img src={waiting} alt="" style={{ display: 'none' }} />
        <img src={answer} alt="" style={{ display: 'none' }} />
        <img src={hint} alt="" style={{ display: 'none' }} />
        <img src={recordFinish} alt="" style={{ display: 'none' }} />
        <img src={record} alt="" style={{ display: 'none' }} />
        <img src={saverecord} alt="" style={{ display: 'none' }} />
        <img src={tastDoneIcon} alt="" style={{ display: 'none' }} />
        <div style={{ position: 'absolute' }}>
          <div id="recorder_swf" />
        </div>
        <ExampaperAttempt
          paperData={paperData}
          showData={showData}
          isLoad={isLoad}
          ExampaperStatus="EXAM"
          instructions={instructions}
          dataType={PHASE_LABEL}
          index={this}
          isOpenSwitchTopic={isOpenSwitchTopic('EXAM')}
          callback={this.fileDownLoading}
        />
      </div>
    );
  }
}
export default ExamPaper;
