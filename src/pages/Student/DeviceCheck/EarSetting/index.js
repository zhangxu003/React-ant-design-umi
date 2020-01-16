/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 耳麦的设置组件
 * @Date: 2019-02-25 18:19:14
 * @LastEditTime: 2019-04-29 17:01:56
 */

import React,{Component} from "react";
import {connect} from "dva";
import {Icon,Card} from "antd";
import { formatMessage } from "umi/locale";
import cs from "classnames";
import ScaleSlider from "@/pages/components/ScaleSlider";
import {setEarphoneVolume} from "@/utils/instructions";

@connect(({vbClient})=>{
  const {
    micphoneVolume,
    earphoneVolume
  } = vbClient;
  return {
    micphoneVolume,    // 麦克风的音量
    earphoneVolume     // 耳机的音量
  }
})
class EarSetting extends Component{

  /**
   * @description: 改变耳机音量的值
   * @param {type}
   * @return:
   */
  changeEarVal = (val)=>{
    const { dispatch } = this.props;
    dispatch({
      type    : "vbClient/setEarphoneVolume",
      payload : val
    });
    this.playing = true;
  }

  /**
   * @description: 改变麦克风的音量
   * @param {type}
   * @return:
   */
  changeMicroVal = (val)=>{
    const { dispatch } = this.props;
    dispatch({
      type    : "vbClient/setMicphoneVolume",
      payload : val
    });
  }

  /**
   * @description: 关闭功能
   * @param {type}
   * @return:
   */
  onClose = ()=>{
    const { onClose=()=>{} } = this.props;
    if( onClose && typeof(onClose) === "function" ){
      onClose(false);
    }
  }

  /**
   * 播放叮
   */
  playVolume = (val)=>{
    if( this.playing ){
      // playType("TYPE_01");
      setEarphoneVolume(val,true)
      this.playing = false;
    }
  }

  render(){
    const {
      micphoneVolume,
      earphoneVolume,
    } = this.props;
    const defultParam = {
      step : 1,
      min  : 0,
      max  : 100
    };

    return (
      <Card
        title={formatMessage({id:"app.title.earphone.config",defaultMessage:"耳麦调整"})}
        headStyle={{fontSize:"14px",color:"rgba(51,51,51,1)"}}
        extra={<span style={{cursor:"pointer"}} onClick={this.onClose}><Icon type="close" /></span>}
        size="small"
        bordered={false}
        style={{ width: 230 }}
      >
        <ScaleSlider
          ref={ref => {this.sacle = ref }}
          style={{borderBottom:"rgba(229,229,229,1) 1px solid",marginBottom:"15px"}}
          icon={<span className={cs('iconfont',"icon-earphone")} />}
          title={formatMessage({id:"app.text.earphonevoice",defaultMessage:"耳机音量"})}
          value={earphoneVolume}
          marks={{
            0   : formatMessage({id:"app.text.little",defaultMessage:"小"}),
            60  : formatMessage({id:"app.text.recommend",defaultMessage:"推荐"}),
            100 : formatMessage({id:"app.text.big",defaultMessage:"大"})
          }}
          onChange={this.changeEarVal}
          onAfterChange={this.playVolume}
          {...defultParam}
        />
        <ScaleSlider
          icon={<span className={cs('iconfont',"icon-microphone")} />}
          title={formatMessage({id:"app.text.microphonevoice",defaultMessage:"麦克风音量"})}
          value={micphoneVolume}
          marks={{
            0   : formatMessage({id:"app.text.little",defaultMessage:"小"}),
            60  : formatMessage({id:"app.text.recommend",defaultMessage:"推荐"}),
            100 : formatMessage({id:"app.text.big",defaultMessage:"大"})
          }}
          onChange={this.changeMicroVal}
          {...defultParam}
        />
      </Card>
    );
  }

}

export default EarSetting;

