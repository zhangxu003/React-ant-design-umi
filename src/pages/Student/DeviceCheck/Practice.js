/*
 * @Author: tina.zhang
 * @Date: 2019-01-05 11:47:08
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-03-28 18:06:00
 * @Description: 任务类型为练习的时候进行设备自检
 */
import React,{Component} from "react";
import {connect} from "dva";
import { formatMessage } from "umi/locale";
import {Button,Icon} from "antd";
import cs from "classnames";
import WaveImage from "../Components/Wave";
import PopEarSetting from "./EarSetting/PopEarSetting";
import styles from "./index.less";
import router from 'umi/router';
import { sendMS, deviceManager } from '@/utils/instructions';

@connect(({vbClient,loading})=>{
  const {
    computerAi,
    earphone,
    microphone,
    micphoneVolume,
    earphoneVolume,
    deviceState,
    ipAddress
  } = vbClient;
  return {
    checking : loading.effects['vbClient/studentDeviceCheck'],  //  检测的状态
    computerAi,        // ai 设备检测状态
    earphone,          // 耳机的检测状态
    microphone,        // 麦克风的检测状态
    micphoneVolume,    // 麦克风的音量
    earphoneVolume,    // 耳机的音量
    deviceState,       // 耳机的是否掉落的状态，用于判断是否需要重新检查的功能
    ipAddress          // 学生机的ip
  }
})
class PracticeCheck extends Component{

  // 麦克风音量（初始时候的值）
  micphoneVolume = "";

  // 耳机音量（初始时候的值）
  earphoneVolume = "";

  async componentDidMount(){
    const { dispatch } = this.props;

    // 判断耳机是否是掉落状态
    await dispatch({
      type : "vbClient/getDeviceStatus"
    });

    const { deviceState } = this.props;
    if( deviceState === "offline" ){
      // 打开弹框
      dispatch({
        type    : "popup/open",
        payload : "dropEarphone"
      });
      //  发送检测失败
      this.sendCheckResult(false);
    }else{
      this.beginCheck();
    }
  }

  componentDidUpdate( preProps ){
    const { deviceState, dispatch } = this.props;
    const { deviceState : preDeviceState  } = preProps;
    // 耳机断开重连的话，默认进行重连
    if( preDeviceState !== deviceState ){
      if( deviceState === "offline" ){
        dispatch({
          type    : "popup/open",
          payload : "dropEarphone"
        });
        //  发送检测失败
        this.sendCheckResult(false);
      }else if( preDeviceState === "offline" && deviceState === "online" ){
        dispatch({
          type    : "popup/close",
          payload : "dropEarphone"
        });
        this.beginCheck();
      }
    }
  }

  componentWillUnmount(){
    const { dispatch } = this.props;
    dispatch({
      type : "vbClient/setVbClientConfig",
      payload : {
        computerAi : "",
        earphone   : "",
        microphone : "",
      }
    });
  }


  /**
   * @description: 开始设备检测
   * @param {type}
   * @return:
   */
  beginCheck = async ()=>{
    const { dispatch, taskType, micphoneVolume, earphoneVolume, ipAddress, checking } = this.props;
    // 取消静音
    deviceManager.mute = false;

    if( checking ) return;
    // 状态设为设备检测中
    sendMS("student:status", {
      ipAddr : ipAddress,
      monitorStatus : "MS_3",
    });

    // 开始进行设备检查
    const result = await dispatch({
      type    : "vbClient/studentDeviceCheck",
      payload : taskType
    });

    // 保存检测的结果值,如果检测通过
    if( result ){
      if( parseFloat(this.micphoneVolume).toString() === "NaN" ) this.micphoneVolume = micphoneVolume;
      if( parseFloat(this.earphoneVolume).toString() === "NaN" ) this.earphoneVolume = earphoneVolume;
    }else{
      //  发送检测失败
      this.sendCheckResult(false);
    }
  }

  /**
   * @description: 发送检测结果
   * @param {Boolean}
   * @return:
   */
  sendCheckResult = bool =>{
    const {ipAddress} = this.props;
    const data = {
      result        : 1,
      ipAddr        : ipAddress,
      playVolume   : this.earphoneVolume || 0,    // 耳机音量
      recordVolume : this.micphoneVolume || 0,    // mic音量
    };
    if( !bool ){
      // 检测失败
      data.result = 2;
    }
    // 放音检测
    sendMS('check:waveout', data);
    // 录音检测
    sendMS('check:wavein', data);
  }




  /**
   * 进入练习事件
   */
  enterPractice = ()=>{
    // 见耳机麦克风的音量发送个教师机（ 非实时，产品要求，作用未知 ）
    // 发送请求试卷列表指令
    // 获取本机ip
    const { ipAddress } = this.props;
    //  发送检测成功
    this.sendCheckResult(true);
    // 发送请求试卷列表指令
    sendMS('paperused', {ipAddr: ipAddress,});
    // 跳转到练习下载试卷列表页面
    router.push('/student/download/paper');
  }


  /**
   * @description: 显示不同的检测模块的具体逻辑样式
   * @param {type}
   * @return:
   */
  renderCheckStatus = ()=>{
    const { computerAi, earphone, microphone } = this.props;
    const modals = [
      {
        type   : "computerAi",
        title  : formatMessage({id:"app.assessment.engine",defaultMessage:"评分引擎"}),
        avator : "icon-computer-ai",
        status : computerAi
      },{
        type   : "earphone",
        title  : formatMessage({id:"app.text.earphone",defaultMessage:"耳机"}),
        avator : "icon-earphone",
        status : earphone
      },{
        type   : "microphone",
        title  : formatMessage({id:"app.text.microphone",defaultMessage:"麦克风"}),
        avator : "icon-microphone",
        status : microphone
      }
    ];
    const statusObj = {
      checking : {
        title : formatMessage({id:"app.text.device.checking",defaultMessage:"检测中"}),
        icon : "loading",
        color : "checking-color",
        mainClass : "avator-checking"
      },
      success  : {
        title : formatMessage({id:"app.text.device.check.success",defaultMessage:"通过检测"}),
        icon : "check-circle",
        color : "success-color",
        mainClass : "avator-success"
      },
      fail  : {
        title : formatMessage({id:"app.text.device.check.failed",defaultMessage:"未通过检测"}),
        icon : "info-circle",
        color : "fail-color",
        mainClass : "avator-fail"
      },
    };
    return modals.map(item=>{
      const { type,title,avator,status } = item;
      const obj = statusObj[status||"checking"];
      const classnames = cs(
        styles['avator-img'],
        'iconfont',
        avator,
        styles[obj.mainClass]
      );
      const avatorClass = cs(
        styles.avator,
        { [styles.checking] : status==="checking" }
      );

      return (
        <div key={type} className={styles.content}>
          <div className={avatorClass}>
            <span className={classnames} />
          </div>
          <div className={styles.title}>{title}</div>
          <div className={cs(styles.status,styles[obj.color])}>
            <Icon type={obj.icon} />{obj.title}
          </div>
        </div>
      );
    });
  }

  /**
   * @description: 检测的进度及三个进度点的样式
   * @param {type}
   * @return:
   */
  renderCheckProcess = ()=>{
    const { computerAi, earphone, microphone } = this.props;
    const status = {
      checking : styles["checking-process"],
      success  : styles["checking-success"],
      fail     : styles["checking-fail"]
    }
    return (
      <div className={styles.dots}>
        <span className={status[computerAi]} />
        <span className={computerAi==="checking"?"":status[earphone]} />
        <span className={computerAi==="checking"|| earphone==="checking"?"":status[microphone]} />
      </div>
    )
  }


  render(){
    const {computerAi,earphone,microphone,checking} = this.props;

    // 根据数据，判断当期正在检测的页面
    const stepStyle = {
      left       : "0px",
      transition : "left 0.5s ease 0s"
    };
    if( !computerAi || computerAi === "checking" || computerAi === "fail" ){
      stepStyle.left = "0px";
      stepStyle.transition = "left 0.5s ease 0s"
    }else if( !earphone ||  earphone === "checking" || earphone === "fail" ){
      stepStyle.left = "-490px";
      stepStyle.transition = "left 0.5s ease 0.5s"
    }else{
      stepStyle.left = "-980px";
      stepStyle.transition = "left 0.5s ease 0.5s"
    }

    // 当全部通过检测，或者有一个错误的时候，波浪图停止
    let waveLoading = true;
    if( computerAi === "fail" ||  earphone === "fail" ||  microphone === "fail" ){
      waveLoading = false;
    }else if( computerAi === "success" && earphone === "success" &&  microphone === "success" ){
      waveLoading = false;
    }

    // 进入练习按钮是否可用
    const canEnterPracticeBtn = computerAi === "success" && earphone === "success" &&  microphone === "success" && !checking;

    return (
      <div className={styles['practice-container']}>
        <div className={styles.main}>
          <WaveImage key="WaveImage" className={styles.wave} loading={waveLoading} />
          <div className={styles.lamp} style={stepStyle}>
            { this.renderCheckStatus() }
          </div>
          {/* 进度点 */}
          { this.renderCheckProcess() }
        </div>
        {/* 按钮事件 */}
        <div className={styles.footer}>
          <PopEarSetting>
            <Button className={cs(styles.btn,styles.setting)}>
              <span className="iconfont icon-set" />
              <span className={styles.text}>
                {formatMessage({id:"app.button.earphone.config",defaultMessage:"耳机设置"})}
              </span>
            </Button>
          </PopEarSetting>
          <Button className={cs(styles.btn,styles.enter)} onClick={this.enterPractice} disabled={!canEnterPracticeBtn}>
            {formatMessage({id:"app.button.into.task",defaultMessage:"进入练习"})}
          </Button>
          <Button className={cs(styles.btn,styles.reset)} onClick={this.beginCheck} loading={checking}>
            <span style={{display:checking?"none":"inline"}} className="iconfont icon-reset" />
            <span className={styles.text}>
              { checking?formatMessage({id:"app.text.device.checking",defaultMessage:"检测中"}):formatMessage({id:"app.text.retest",defaultMessage:"重新检测"})}
            </span>
          </Button>
        </div>
      </div>
    );
  }
}


export default PracticeCheck;

