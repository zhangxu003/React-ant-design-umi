import React, { Component } from 'react';
import { Layout, Button, message } from 'antd';
import { formatMessage } from "umi/locale";
import styles from './index.less';
import loadingImg from '@/assets/landing_page_box_bg@2x.png';
import loading from '@/assets/loading.gif';
import serverTimeout from '@/assets/server_timeout_icon@2x.png';
import classNames from 'classnames';
import { proxyStatus } from '@/services/api'
import { getc, sendMS, setc, getCurrentClientIPAddress, lockScreen, updateLocalClock, LockInputMethod, checkIsConnect, storeData } from '@/utils/instructions';
import router from "umi/router";
import { connect } from "dva";
import { isValidIP } from '@/utils/utils';

const { vb } = window;
@connect(({ student, vbClient }) => {
  const { seatNo,examNo } = student;
  const { ipAddress,teacherIpAddress, state } = vbClient;
  return { seatNo,examNo,ipAddress,teacherIpAddress, state };
})
class Ready extends Component {
  /**
   *  showStatus 控制页面显示
   *  0 : 启动后连接中
   *  1 : Proxy连接失败
   *  2 : 服务到期
   *  3 ：连接教师机成功
   *  4 ：连接教师机失败
   *  5 ：输入教师机IP地址
   */
  state = {
    showStatus: 0,
    linkTeacherClientSuccess: false,
    firstConnectErr: false,
    input1Value: '',
    input2Value: '',
    input3Value: '',
    input4Value: '',
  };

  componentDidMount() {

    const { dispatch, ipAddress, teacherIpAddress, match } = this.props;
    const { changeip } = match.params;
    storeData({binessStatus:"MS_1"})
    // 如果是明确的changeip及（ 学生登录页面 进行连接设置 ）
    if( changeip === "changeip" ){
      // 跳转设置页面
      this.setState({
        showStatus: 5
      })
    }else{
      // 启动学生机
      this.studentStart();
    }



    // 获取本机ip
    if( ipAddress ){
      localStorage.setItem('studentIpAddress', ipAddress);
    }

    // 初始化输入框内容
    const teacherIpList = teacherIpAddress.split(".") || [];
    console.log(teacherIpList);
    this.setState({
      input1Value: Number(teacherIpList[0]),
      input2Value: Number(teacherIpList[1]),
      input3Value: Number(teacherIpList[2]),
      input4Value: Number(teacherIpList[3])
    })

    // 注册指令发送回调
    const that = this;
    vb.getSocketManager().onReceive((res) => {
      const { state } = this.props;
      if ( state === 119 ) {
        that.state.firstConnectErr = false;
        that.state.linkTeacherClientSuccess = true;

        if (res && res.command === 'connect') {
          console.log("=================connect==================");
          const currentIpAddr = getCurrentClientIPAddress();
          localStorage.setItem('studentIpAddress',currentIpAddr);
          dispatch({
            type : "vbClient/setVbClientConfig",
            payload : { ipAddress: currentIpAddr }
          })

          // 教师端指令状态  连接成功后问教师机现在是在哪一步
          const data = {
            "ipAddr": currentIpAddr
          }
          sendMS('commandstatus', data, '');
          that.setState({
            showStatus: 3
          });
          // 输入法限制前段做了
        }


        if (res && res.command === 'time:global') {
          // 连接成功并获取到老师端的时间戳
          const result = JSON.parse(res.data);
          console.log(result.timestamp);
          that.updateLocalTime(result.timestamp);
          that.setState({
            showStatus: 3
          });
        }

        if (res && res.command === 'open') {
          // 缓存任务信息
          const { taskId, description, paperpolicy } = JSON.parse(res.data);

          localStorage.setItem("paperpolicy",paperpolicy)
          dispatch({
            type: "student/setTaskInfo",
            payload: { taskId, description, paperpolicy },
          });

          window.TASKINFO = { taskId };

          // 接收到老师端发送的允许登录指令
          router.push('/student/login');
        }

        if (res && res.command === 'commandstatus:return') {
          that.setState({
            showStatus: 3
          })
          // 接收到教师端发来的数据指令
          const data = JSON.parse(res.data)
          console.log(data);
          const { taskId, description, paperpolicy, commandOperationFlag:commandCode } = data
          localStorage.setItem("paperpolicy",paperpolicy)
          dispatch({
            type: "student/setTaskInfo",
            payload: { taskId, description, paperpolicy  },
          });
          // "01" //登录
          // "02" //身份确认
          // "03" //放录音检测
          // "04" //练习/考试开始
          // "05" //练习/考试结束
          if (commandCode) {
            if (commandCode === '01' || commandCode === '03') {
              // 登录页
              router.push('/student/login');
              // 检测通过 过期检测也通过
            }
          } else {
            // 老师端还没发出过指令
            that.setState({
              showStatus: 4
            })
          }

        }
        if (res && res.command === 'close') {
          // vb.close();
        }
        if (res && res.command === 'exit') {
          vb.close();
        }
        if (res && res.command === 'clean') {
          // 获取的清屏操作的时候，默认直接刷新页面到教师机，防止上次考试的影响带入此次考试中
          // window.location.href="/student";
          // 接受到清屏操作 显示登录前的登录页面
          that.setState({
            showStatus: 3
          })
        }
        if (res && res.command === 'modify:number') {
          console.log(res.data);
          // 老师端修改座位号回掉
          const { number } = JSON.parse(res.data);
          localStorage.setItem('number', number);
          const params = {
            number,
            teacherIpAddress : localStorage.getItem('teacherIpAddress')
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
              message.warning(formatMessage({id:"task.text.connected.teacher.fail",defaultMessage:"连接教师机失败"}));
            }
          })
        }

        // 允许登录进行一键检测
        if (res && res.command === "openauto") {
          // 缓存任务信息
          const { taskId, description, paperpolicy, id, number } = JSON.parse(res.data);
          localStorage.setItem("paperpolicy",paperpolicy)
          dispatch({
            type: "student/setTaskInfo",
            payload: { taskId, description, paperpolicy },
          });
          // 缓存学生信息
          dispatch({
            type: "student/setTeacherInfo",
            payload: {
              examNo: id,
              seatNo: number
            },
          });
          // 为了学生端进行硬件检测而作特殊处理（后期需要在硬件检测从插件中独立处理）
          window.TASKINFO = { taskId };

          router.push('/student/login');
        }
      }
    });

    vb.onError((err) => {
      console.log(err);
      if (err.errId === 72147) {
        if (!that.state.firstConnectErr) {
          that.setState({
            showStatus: 4
          })
          that.state.firstConnectErr = true;
        }
      }
    })
  }

  /**
   * @description:
   * @param {type} 学生机初始化
   * @return:
   */
  studentStart = () => {
    const { dispatch } = this.props;
    // 1.进行Proxy连接检测
    const params = {
      teacherIp: '',
      studentIp: ''
    }
    proxyStatus(params).then((res) => {
      console.log(res);
      if (res && res.data === 1) {
        // Proxy连接检测成功
        // 2.自检配置信息
        const status = getc();
        // 老师机ip
        const { teacherIpAddress, number } = status;
        localStorage.setItem('teacherIpAddress', teacherIpAddress);
        // 学生座位号
        localStorage.setItem('number', number);

        // 缓存学生信息
        dispatch({
          type: "student/setTeacherInfo",
          payload: {
            seatNo: number
          },
        });

        // 119--正常   120--过期   121--锁定
        if (status.state === 119) {
          const isConnect = checkIsConnect();
          if (isConnect) {
            console.log('已连接')
            this.setState({
              showStatus: 3
            })
            // 教师端指令状态  连接成功后问教师机现在是在哪一步
            const currentIpAddr = getCurrentClientIPAddress();
            const data = {
              "ipAddr": currentIpAddr
            }
            sendMS('commandstatus', data, '');
          } else {
            // 未连接
            console.log('未连接')
          }

        } else {
          // 显示过期
          this.setState({
            showStatus: 2
          });
          // 锁屏
          this.lockScreen();
        }
      } else {
        // Proxy连接检测失败
        this.setState({
          showStatus: 1
        })
      }
    }).catch(() => {
      this.setState({
        showStatus: 1
      })
    })
  }

  // 锁屏操作 **/
  lockScreen = () => {
    lockScreen();
  }

  //* 键盘输入法 **/
  LockInputMethod = () => {
    LockInputMethod();
  }

  // 更新时钟 **/
  updateLocalTime = (timestamp) => {
    updateLocalClock(timestamp);
  }

  // 连接设置
  handelLinkSetting = () => {
    this.setState({
      showStatus: 5
    })
  }

  /**
   * 链接老师端
   */
  linkTeacherC = () => {
    const { input1Value, input2Value, input3Value, input4Value } = this.state;
    const { teacherIpAddress : oldTeacherIpAddress, dispatch, match } = this.props;
    const number = localStorage.getItem('number');
    const teacherIpAddress = `${input1Value}.${input2Value}.${input3Value}.${input4Value}`;

    if (!isValidIP(teacherIpAddress)) {
      message.warning(formatMessage({id:"task.text.input.ip.is.error",defaultMessage:"IP地址输入错误，请重新输入！"}));
      this.input1.focus();
      return;
    }

    // 判断教师机的ip地址是否改变
    if( oldTeacherIpAddress === teacherIpAddress && vb.getSocketManager().isConnected ){
      // 跳转到等待页面
      this.setState({
        showStatus: 3
      });
      // 如果是 changeip 页面则，重新加载
      if( match.params.changeip === "changeip" ){
        router.push("/");
      }
      return;
    }

    // 其它情况
    dispatch({
      type : "vbClient/setVbClientConfig",
      payload : {
        teacherIpAddress
      }
    });

    localStorage.setItem('teacherIpAddress', teacherIpAddress);

    const params = {
      number,
      teacherIpAddress
    }

    setc({
      params,
      sucessCallback: ()=>{},
      failCallback: ()=> {}
    })

    this.setState({
      showStatus: 0,
      firstConnectErr: false
    });

  }

  // 取消连接老师端
  cancelLinkTeacherC = () => {
    const { match } = this.props;
    // 判断连接情况
    let showStatus = 4;
    if( vb.getSocketManager().isConnected ){
      showStatus = 3;
      // 如果是 changeip 页面则，重新加载
      if( match.params.changeip === "changeip" ){
        router.push("/");
      }
    }
    this.setState({
      showStatus
    })
  }

  // ** 重新连接proxy  **/
  reconnectProxy = () => {
    this.studentStart();
  }

  // ** 重新连接教师机 **/
  reconnectTeacherC = () => {
    this.setState({
      showStatus: 0,
      firstConnectErr: false
    })
  }

  // 按钮联动处理
  keyDownHandle=(e,index)=>{
    const inputObj = this[`input${index}`];

    if( e.keyCode === 8 && inputObj.selectionStart === 0 && index > 1 ){
      // backSpace 功能
      this[`input${index-1}`].focus();
      this[`input${index-1}`].selectionStart = this[`input${index-1}`].value.length;
      this[`input${index-1}`].selectionEnd=this[`input${index-1}`].value.length;
      e.returnValue = false
      e.preventDefault();
    }else if( e.keyCode === 46 && inputObj.selectionEnd === inputObj.value.length && index < 4 ){
      // delete 功能
      this[`input${index+1}`].focus();
      this[`input${index+1}`].selectionStart = 0;
      this[`input${index+1}`].selectionEnd=0;
      e.returnValue = false
      e.preventDefault();
    }else if( e.keyCode === 37 && inputObj.selectionStart === 0 && index > 1 ){
      // ArrowLeft 功能
      this[`input${index-1}`].focus();
      this[`input${index-1}`].selectionStart = this[`input${index-1}`].value.length;
      this[`input${index-1}`].selectionEnd=this[`input${index-1}`].value.length;
      e.returnValue = false
      e.preventDefault();
    }else if( e.keyCode === 39 && inputObj.selectionEnd === inputObj.value.length && index < 4 ){
      // ArrowRight  功能
      this[`input${index+1}`].focus();
      this[`input${index+1}`].selectionStart = 0;
      this[`input${index+1}`].selectionEnd=0;
      e.returnValue = false
      e.preventDefault();
    }
  }

  // onchange
  changeVal = (e,index)=>{
    const value = e.target.value.trim().replace(/[^0-9]+/g, '').substring(0,3);
    if( e.target.value.substring(0,3) !== value ){
      if( e.target.value.includes(".") || e.target.value.includes("。") ){
        e.target.blur();
        e.returnValue = false;
        e.preventDefault();
        if( index < 4 ){
          setTimeout(()=>{
            this[`input${index+1}`].focus();
            this[`input${index+1}`].selectionStart = 0;
            this[`input${index+1}`].selectionEnd=this[`input${index+1}`].value.length;
          },0);
        }
      }
      return;
    }

    if(value.length === 3) {
      setTimeout(()=>{
        if( index === 4 ) return;
        this[`input${index+1}`].focus();
      },0);
    }
    // 修改值
    this.setState({
      [`input${index}Value`]:value
    });
  }

  // 按钮输入值

  render() {
    const { showStatus, input1Value, input2Value, input3Value, input4Value } = this.state;
    const sureDisabled = ( input1Value === '' || input2Value === '' || input3Value === '' || input4Value === '' );
    return (
      <Layout className={styles.teacher_page}>
        <div className={styles.checkStatus}>
          <img src='http://res.gaocloud.local/logos/logo_landing_page@2x.png' alt="" width="540" height="50" />
          <div className={styles.loadingTeacher} style={{ backgroundImage: `url(${loadingImg})` }}>

            {/* 启动后连接 */}
            <div className={styles.loading} style={{ display:showStatus===0?'block':'none' }}>
              <img src={loading} width="48" height="48" alt="" />
              <div className={styles.tip}>{formatMessage({id:"task.text.waiting.connect",defaultMessage:"正在连接...请稍候"})}</div>
            </div>

            {/* 连接成功 */}
            <div className={styles.connectSucess} style={{ display:showStatus===3?'block':'none' }}>
              <div className={styles.linksucess}>
                <span>*</span>
                {formatMessage({id:"task.text.web.connect.state",defaultMessage:"网络状态："})}
                <span>{formatMessage({id:"task.text.connect.success",defaultMessage:"连接成功"})}</span>
              </div>
              <div className={styles.begining}>{formatMessage({id:"task.text.waiting.task.start",defaultMessage:"考试训练即将开始"})}</div>
              <p>{formatMessage({id:"task.text.waiting.task.order",defaultMessage:"请保持安静等待考试指令"})}</p>
            </div>

            {/* proxy连接失败 不带“连接设置” */}
            <div className={styles.connectFailure} style={{display:showStatus===1?'block':'none'}}>
              <div className={styles.linkFailure}>
                <span>*</span>
                {formatMessage({id:"task.text.web.connect.state",defaultMessage:"网络状态："})}
                <span>{formatMessage({id:"task.text.connected.teacher.fail",defaultMessage:"连接教师机失败"})}</span>
              </div>
              <Button onClick={this.reconnectProxy}>
                {formatMessage({id:"task.button.reconnection",defaultMessage:"重新连接"})}
              </Button>
              <div className={styles.setting} onClick={this.handelLinkSetting}>
                <a>{formatMessage({id:"task.text.connect.teacher.config",defaultMessage:"连接教师机设置"})}</a>
              </div>
            </div>

            {/* 服务到期 */}
            <div style={{ display:showStatus===2?'block':'none' }}>
              <div className={styles.timeout}><img src={serverTimeout} width="70" height="62" alt="" /></div>
              {formatMessage({id:"task.text.service.has.expired",defaultMessage:"服务已到期，暂时无法使用！"})}
            </div>

            {/* 连接失败 */}
            <div className={styles.connectFailure} style={{display:showStatus===4?'block':'none'}}>
              <div className={styles.linkFailure}>
                <span>*</span>
                {formatMessage({id:"task.text.web.connect.state",defaultMessage:"网络状态："})}
                <span>{formatMessage({id:"task.text.connected.teacher.fail",defaultMessage:"连接教师机失败"})}</span>
              </div>
              <Button onClick={this.reconnectTeacherC}>
                {formatMessage({id:"task.button.reconnection",defaultMessage:"重新连接"})}
              </Button>
              <div className={styles.setting} onClick={this.handelLinkSetting}>
                <a>{formatMessage({id:"task.text.connect.teacher.config",defaultMessage:"连接教师机设置"})}</a>
              </div>
            </div>

            {/* 输入教师机IP地址 */}
            {
              showStatus === 5 &&
              <div className={styles.teacherIP}>
                <div className={classNames(styles.title,styles.pt)}>
                  {formatMessage({id:"task.text.input.teacher.ip.address",defaultMessage:"输入教师机IP地址"})}
                </div>
                <div className={styles.IPInput}>
                  <input
                    key="input1"
                    type="text"
                    value={input1Value}
                    onKeyDown={(e)=>this.keyDownHandle(e,1)}
                    ref={input1 => {this.input1 = input1}}
                    onChange={(e)=>{this.changeVal(e,1)}}
                  />
                  <span>.</span>
                  <input
                    key="input2"
                    value={input2Value}
                    onKeyDown={(e)=>this.keyDownHandle(e,2)}
                    ref={input2 => {this.input2 = input2}}
                    type="text"
                    onChange={(e)=>{this.changeVal(e,2)}}
                  />
                  <span>.</span>
                  <input
                    type="text"
                    key="input3"
                    value={input3Value}
                    onKeyDown={(e)=>this.keyDownHandle(e,3)}
                    ref={input3 => {this.input3 = input3}}
                    onChange={(e)=>{this.changeVal(e,3)}}
                  />
                  <span>.</span>
                  <input
                    type="text"
                    key="input4"
                    value={input4Value}
                    onKeyDown={(e)=>this.keyDownHandle(e,4)}
                    ref={input4 => {this.input4 = input4}}
                    onChange={(e)=>{this.changeVal(e,4)}}
                  />
                </div>
                <div className={styles.btns}>
                  <Button className={styles.btn} onClick={this.cancelLinkTeacherC}>
                    {formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
                  </Button>
                  <Button className={sureDisabled?classNames(styles.btn,styles.unlink):classNames(styles.btn,styles.link)} disabled={sureDisabled} onClick={this.linkTeacherC}>
                    {formatMessage({id:"task.button.connect",defaultMessage:"连接"})}
                  </Button>
                </div>
              </div>
            }
            {
              // 正在连接页、连接成功页
              ( showStatus === 0 || showStatus === 3 ) && (
                <div className={styles['setting-btn']} onClick={this.handelLinkSetting}>
                  <a>{formatMessage({id:"task.text.connect.teacher.config",defaultMessage:"连接教师机设置"})}</a>
                </div>
              )
            }
          </div>
        </div>
      </Layout>
    );
  }
}
export default Ready;
