/**
 * 客户端检测页面
 */
import React, { Component } from 'react';
import { Layout, Spin, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import loadingImg from '@/assets/landing_page_box_bg@2x.png';
import serverTimeout from '@/assets/server_timeout_icon@2x.png';
import {proxyStatus} from '@/services/api'
import {getc,sendMS} from '@/utils/instructions';
import router from "umi/router";
import styles from './index.less';

const {vb} = window;

class ClientCheck extends Component {
  state = {
		showStatus:0
  };

  componentDidMount() {
    const that = this;
      vb.getSocketManager().onReceive((res)=>{
        console.log('client',res);
        if(res&&res.data) {
          const student = res.data
          const connID = student.connId
          that.setState({
            connID,
            ipAddr:res.ipAddr})
          const timeStart = new Date().getTime();
          if(res&&res.command==='connect') {
            console.log("=================connect==================");
            // 发送给学生时间同步
            const data = {
              "timestamp":timeStart
            }
            sendMS('time:global',data,connID);
          }
          if(res&&res.command==='disconnect') {
            // 学生关闭客户端或断开连接响应
            // 此时判断是哪个IP对应修改该学生的状态
          }
        }
      })

      this.teacherStart()
    }

  // 教师机启动
  teacherStart=()=>{
    // 进行Proxy连接检测
    const params ={
      teacherIp:'',
      studentIp:'',
      connID:'',
      ipAddr:''
    }
    proxyStatus(params).then((res)=>{
      if( res && res.data===1 ) {
        // Proxy连接检测成功
        // 自检配置信息
        const status =getc()
        if(status.state===119) {
          // 检测通过 过期检测也通过 直接跳登录页
          router.push('/teacher/login');
        } else if(status.state===120) {
          // 显示过期
          this.setState({
            showStatus:2
          })
        }
      } else {
        // Proxy连接检测失败
        this.setState({
          showStatus:1
        })

      }
    })
  }

	reConnent=()=>{
		this.teacherStart()
  }

  render() {
		const {showStatus} = this.state
    return (
      <Layout className={styles.teacher_page}>
        <div className={styles.checkStatus}>
          <img src='http://res.gaocloud.local/logos/logo_landing_page@2x.png' width="540" height="50" alt="logo" />
          <div className={styles.loadingTeacher} style={{ backgroundImage: `url(${loadingImg})` }}>
            {
              // 启动后连接
            }
            <div style={{ display:showStatus===0?'block':'none' }}>
              <Spin className={styles.loadingStatus} />
              {formatMessage({id:"task.text.waiting.connect",defaultMessage:"正在连接...请稍候"})}
            </div>
            {
              // Agent过期
            }
            <div style={{ display:showStatus===2?'block':'none' }}>
              <div className={styles.timeout}><img src={serverTimeout} width="70" height="62" alt="" /></div>
              {formatMessage({id:"task.text.service.has.expired",defaultMessage:"服务已到期，暂时无法使用！"})}
            </div>
            {
              // 连接失败
            }
            <div className={styles.connectFailure} style={{display:showStatus===1?'block':'none'}}>
              <div className={styles.linkFailure}>
                <span>*</span>{formatMessage({id:"task.text.web.connect.state",defaultMessage:"网络状态："})}
                <span>{formatMessage({id:"task.text.connect.failed",defaultMessage:"连接失败"})}</span>
              </div>
              <Button onClick={this.reConnent}>
                {formatMessage({id:"task.button.reconnection",defaultMessage:"重新连接"})}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}


export default ClientCheck;
