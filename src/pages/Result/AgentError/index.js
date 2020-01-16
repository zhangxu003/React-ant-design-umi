/*
 * @Author: tina.zhang
 * @Date: 2019-01-03 11:32:23
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-08 17:22:50
 * @Description:
 * vb.getConfigurationManager().get()
 * angent 发生错误112，或为null的时候显示
 */
import React, { PureComponent } from 'react';
import CommandContainer from "@/layouts/CommandContainer";
import { formatMessage } from 'umi/locale';
import { getc, reAent } from "@/utils/instructions";
import { delay } from '@/utils/utils';
import { Card, Button } from "antd";
import bg from "./proxy_erro_page_pic.png";
import styles from "./index.less"

const { Meta } = Card;

class AgentError extends PureComponent {

  state = {
    loading : false
  }

  // 错误的相关参数
  handleObj = {
    // agent 错误
    ERROR_AGENT : {
      title : formatMessage({id:"task.title.what.happen",defaultMessage:"咦？出错了！"}),
      msg   : formatMessage({id:"task.message.lose.connect.and.check.it",defaultMessage:"连接服务器失败，请检查您的网络连接"}),
      buttonText  : formatMessage({id:"task.button.retry",defaultMessage:"重试"}),
      buttonClick : ()=>{
        this.refresh();
      }
    },
    // 服务器报 500
    // ERROR_500 : {
    //   title : "500！",
    //   msg   : "系统异常，请联系我们！",
    //   buttonText  : "联系我们",
    //   buttonClick : ()=>{
    //     window.location.href="/";
    //   }
    // },
    // 服务器报 400
    // ERROR_400 : {
    //   title : "400！",
    //   msg   : "系统类型错误，请联系我们！",
    //   buttonText  : "联系我们",
    //   buttonClick : ()=>{
    //     window.location.href="/";
    //   }
    // }
    ERROR_400 : {
      title : formatMessage({id:"task.title.what.happen",defaultMessage:"咦？出错了！"}),
      msg   : formatMessage({id:"task.message.system.type.error",defaultMessage:"系统类型错误！"}),
      buttonText  : formatMessage({id:"task.button.retry",defaultMessage:"重试"}),
      buttonClick : ()=>{
        this.refresh();
      }
    }
  }

  refresh = async ()=>{
    this.setState({loading:true})
    // 判断获取最新的vbClient 如果是 121 则 重新连接2s 然后再刷新页面
    const { state } = getc();
    // 如果是加密狗丢失,则重连
    if( state === 121 ){
      reAent();
      await delay(2000);
    }
    window.location.href="/";
  }

  render(){
    const {match} = this.props;
    const {loading} = this.state;
    const {type} = match.params;
    const obj = this.handleObj[type||"ERROR_AGENT"];

    return (
      <div className={styles.content}>
        <CommandContainer />
        <Card className={styles.card}>
          <Meta
            avatar={<img src={bg} alt="" />}
            description={
              <div className={styles.info}>
                <div className={styles.title}>{obj.title}</div>
                <div className={styles.msg}>{obj.msg}</div>
                { obj.buttonClick && typeof(obj.buttonClick) === "function" ? <Button loading={loading} className={styles.button} onClick={obj.buttonClick}>{obj.buttonText}</Button> : null }
              </div>
            }
          />
        </Card>
      </div>
    );

  }
}

export default AgentError;
