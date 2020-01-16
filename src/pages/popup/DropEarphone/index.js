import React, { Component } from 'react';
import { Button, message } from 'antd';
import { connect } from "dva";
import { FormattedMessage, formatMessage } from "umi/locale";
import cs from "classnames";
import { sendMS } from '@/utils/instructions';
import styles from './index.less';

@connect(({vbClient,loading})=>({
  player   : vbClient.player,
  recorder : vbClient.recorder,
  loading  : loading.effects['vbClient/getDeviceStatus']
}))
class DropEarphone extends Component {

  /**
   * @description: 重新检测耳机
   * @param {type}
   * @return:
   */
  resetCheck = async ()=>{
    const { dispatch, modal } = this.props;

    await dispatch({
      type : "vbClient/getDeviceStatus"
    });
    const { player, recorder } = this.props;
    // 如果当前的耳机状态可用，则关闭弹框，否则不做任何处理
    if( player && recorder ){
      modal.onCancel();
    }
  }

  /**
   * @description: 发送举手事件
   * @param {type}
   * @return:
   */
  help = () => {
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS("help", { "ipAddr": studentIpAddress })
    message.success(formatMessage({id:"task.message.raise.hands",defaultMessage:"举手成功！"}))
  }


  render() {
    const { player, recorder, loading } = this.props;

    let msg = "";
    let icon = "icon-warning";
    if( !recorder && !player ){
      // 耳机，麦克风都不存在
      msg = formatMessage({id:"app.message.no.earphone.and.microphone",defaultMessage:"未检测到耳机和麦克风，请确认耳机和麦克风都已正确接入！"});
      icon = "icon-warning";
    }else if( !recorder ){
      // 没有麦克风
      msg = formatMessage({id:"app.message.no.check.microphone",defaultMessage:"未检测到麦克风，请确认麦克风已正确接入！"});
      icon = "icon-microphone";
    }else if( !player ){
      // 没有耳机
      msg = formatMessage({id:"app.message.earphone_tip_a",defaultMessage:"未检测到耳机，请确认耳机已正确接入！"});
      icon = "icon-earphone";
    }



    return (
      <div className={styles.tip}>
        <div><span className={cs('iconfont',icon,styles.icon)} /></div>
        <div className={styles.info}>
          {msg}
        </div>
        <div>
          <Button loading={loading} key="submit" className={styles.reset} onClick={this.resetCheck}>
            { formatMessage({id:"task.message.recheck",defaultMessage:"重新检测"}) }
          </Button>
          <div key="hand" className={styles["hand-button"]}>
            <FormattedMessage
              id="task.text.raise.hands.for.help"
              values={{
                hand : <span className={cs("iconfont","icon-raise-hand",styles.hand)} onClick={this.help}>{formatMessage({id:"task.text.raise.hands",defaultMessage:"举手"})}</span>
              }}
              defaultMessage="遇到问题？{hand}等待老师处理"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DropEarphone;
