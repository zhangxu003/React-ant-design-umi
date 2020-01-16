import React, { Component } from 'react';
import { connect } from 'dva';
import { message, Layout,Button,Divider  } from 'antd';
import { formatMessage } from "umi/locale";
import cs from "classnames";
import router from "umi/router";
import showEditSeatNumberModal from '../Components/EditSeatNumberModal/api';
import {sendM,setc,storeData} from '@/utils/instructions';
import { delay } from '@/utils/utils';
import Modal from "@/components/Modal";
import DownCount from "@/pages/Student/Components/DownCount";
import styles from './index.less';

const { vb } = window;

@connect(({ student, vbClient, loading }) => {
  const { taskId, examNo, seatNo } = student;
  const { ipAddress } = vbClient;
  return {
    taskId,
    examNo,
    seatNo,
    ipAddress,
    sureLoading : loading.effects['student/creatProxyToken'] // 确认的加载状态
  };
})
class LoginPage extends Component {

  state = {
    number     : 0,     // 座位号
    testNumber : '',     // 考号
    name       : '',     // 姓名
    disabled   : true,
    studentLoginSuccess : false,
    inLogin     : false,  // 是否正在登录中
  }

  componentDidMount() {
    // 初始化
    const { taskId, examNo, seatNo, ipAddress, dispatch  } = this.props;
    sendM("watchStatus",{ status:"MS_1", "ipAddr": ipAddress });
    // 接收到”connect”回调时，调用Shell
    storeData({binessStatus:"MS_1"})
    // 设置当期的座位号
    if( seatNo ){
      this.setState({
        number : Number(seatNo)
      });
    }

    // 判断是否是自动检测，并且考号存在
    if( taskId === "autoCheck" && examNo ){
      this.autoCheck();
    }

    // 注册指令发送回调
    const that = this;
    vb.getSocketManager().onReceive( (res)=> {
      if(res&&res.command==='login:allow') {
        // 登录超时不做处理
        const { inLogin } = this.state;
        if( !inLogin ) return;
        // 接收到教师端发来的登录成功
        const jsonDataStr = res.data;
        const jsonData = JSON.parse(jsonDataStr);
        localStorage.setItem('number',jsonData.number);
        localStorage.setItem('studentInfo',jsonDataStr);

        // 接收到“login:allow”指令时，调用Shell
        storeData({binessStatus:"MS_2"})

        that.setState({
            number:jsonData.number?jsonData.number:0,
            name:jsonData.name,
            testNumber:jsonData.id,
            studentLoginSuccess:true,
            taskType : jsonData.taskType,
        });

        // 更新必要的数据到 modal student中
        dispatch({
          type : "student/updateStudentStore",
          payload : {
            studentName : jsonData.name,
            studentId   : jsonData.stuid
          }
        });

        this.doLogin("end");

        if( taskId === "autoCheck" ){
          setTimeout(()=>{
            const { studentLoginSuccess } = this.state;
            if( studentLoginSuccess ){
              this.confirmStudentInfo();
            }
          },2000);
        }
      }
      if(res&&res.command==='login:denied') {
        // 登录超时不做处理
        const { inLogin } = this.state;
        if( !inLogin ) return;
        // 接收到教师端发来的登录失败
        const info = JSON.parse(res.data).error;
        message.warning(info);
        this.doLogin("end");
      }
      if (res&&res.command==='close') {
        // vb.close();
      }
      if (res&&res.command==='exit') {
        vb.close();
      }
      if (res&&res.command==='clean') {
        // 获取的清屏操作的时候，默认直接刷新页面到教师机，防止上次考试的影响带入此次考试中
        window.location.href="/student";
        // console.log('登录页面中收到清屏操作')
        // router.push('/student');
      }
      if (res&&res.command==='modify:number') {
        // 老师端修改座位号回掉
        const {number} = JSON.parse(res.data);
        that.setState({number: number || 0});
        localStorage.setItem('number', number);
        const teacherIpAddress = localStorage.getItem('teacherIpAddress');
        const params = { number,teacherIpAddress };
        // ** 更新学生机的AGENT配置信息 **/
        setc({
          params,
          sucessCallback:()=>{},
          failCallback:()=>{}
        });

        dispatch({
          type: "student/setTeacherInfo",
          payload: { "seatNo":number },
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

    })
  }

  componentWillUnmount(){
    this.doLogin("end");
  }


  /**
   * 一键检测操作
   */
  autoCheck = async ()=>{
    const { examNo } = this.props;

    // 1、自动输入考号
    const arr = examNo.split("");
    await Promise.all(arr.map((item,index)=>(
      delay(800*(index+1),()=>{
        const { testNumber } = this.state;
        this.setState({
          testNumber : `${testNumber}${item}`
        });
      })
    )));
    this.setState({
      disabled : false,
    });

    // 2、 确认登录，进入账号预览页面
    await delay(1000);
    this.studentLogin();
  }


  /**
   * 修改座位号
   */
  showEditNumber = () => {
    const {number,testNumber} = this.state;
    const { dispatch } = this.props;
    showEditSeatNumberModal({
        dataSource:{
            title:formatMessage({id:"task.text.editSeatNo",defaultMessage:"修改座位号"}),
            number
        },
        callback:(value) => {
          // 修改 angent 服务器上的座位号，
          setc({
            params : {
              number : Number(value),
              teacherIpAddress : localStorage.getItem('teacherIpAddress')
            },
            sucessCallback : ()=>{
              localStorage.setItem('number', Number(value));
              this.setState({
                number: Number(value),
                disabled: testNumber===""
              });
              dispatch({
                type: "student/setTeacherInfo",
                payload: { "seatNo":Number(value) },
              });
            },
            failCallback : (e)=>{
              console.log(e);
              message.warning(formatMessage({id:"task.message.edit.seatNo.failed",defaultMessage:"修改座位号失败！"}));
            }
          });
        }
    })
  }

  // 学生登录
  studentLogin = () => {
    const { ipAddress } = this.props;
    const { number, testNumber } = this.state;
    const currentClientIP = localStorage.getItem('studentIpAddress');
    // 座位号为空，获取一键检测模式，不能手动登录
    if( testNumber==="" ){
      return;
    }

    // 学生端发送登录指令
    const data = {
        number,
        id     : testNumber,
        ipAddr : ipAddress || currentClientIP
    }
    sendM('login',data);
    this.doLogin("begin");
  }

  // 确认按钮的loading事件
  doLogin = (status)=>{
    // 开始开启登录状态
    if( status === "begin" ){
      this.setState({inLogin:true});
      this.inLogin = setTimeout(()=>{
        // 提示超时了
        if( vb.getSocketManager().isConnected ){
          message.error(formatMessage({id:"task.message.none.task.please.connect.teacher",defaultMessage:"当前没有考试/练习，请联系老师!"}));
        }else{
          message.error(formatMessage({id:"task.message.lose.connect",defaultMessage:"网络连接断开！"}));
        }
        this.inLogin = "";
        this.setState({inLogin:false});
      },20000);
    }else if( status === "end" ){
      clearTimeout(this.inLogin);
      this.inLogin="";
      this.setState({inLogin:false})
    }
  }

  // 学生信息确认返回
  confirmBack = () => {
    this.canConfirm = false;
    const currentClientIP = localStorage.getItem('studentIpAddress');
    const {testNumber,number,name} = this.state;
    // 发送身份确认指令
    const data = {
      id     : testNumber,      // 考号
      number,                   // 座位号
      name,                     // 姓名
      ipAddr : currentClientIP, // 学生机IP
      verification :'0'         // 确认：1，不确认：0
    }

    sendM('verification',data);

    // 当身份确认失败，发送verification指令后，调用Shell
    storeData({binessStatus:"MS_2"})

    this.setState({
      studentLoginSuccess:false
    });

    // 取消请求
    this.doLogin("end");
  }

  // 学生信息确认
  confirmStudentInfo = async () => {
    this.canConfirm = true;

    // 1.获取token 存储token的字段名：TOKEN
    const { dispatch,taskId } = this.props;
    const { taskType,testNumber,number,name } = this.state;
    const currentClientIP = localStorage.getItem('studentIpAddress');
    const params1 = {
        ipAddress : `student_${currentClientIP}`, // ip地址
        examNo    :  testNumber,   // 考号
        teacher   : 0,     // 是否是老师
        taskId
    }

    const result = await dispatch({
      type: 'student/creatProxyToken',
      payload: params1,
    });

    // 如果当前又不允许登录则，不做任何操作
    if( !this.canConfirm ) return;

    // 更新必要的数据到 modal student中
    dispatch({
      type : "student/updateStudentStore",
      payload : {
        examNo : testNumber,
      }
    });

    // 如果token前期失败不做处理
    if( !result ){
      // 页面再次回到登录页面
      this.setState({
        testNumber : '',     // 考号
        name       : '',     // 姓名
        disabled   : true,
        studentLoginSuccess : false,
      });
      return;
    }

    // 2.发送身份确认指令
    const info = {
        id     : testNumber,      // 考号
        number,                   // 座位号
        name,                     // 姓名
        ipAddr : currentClientIP, // 学生机IP
        verification : '1'        // 确认：1，不确认：0
    }
    sendM('verification',info);

    // 当身份确认成功，发送verification指令后，调用Shell
    storeData({binessStatus:"MS_3"})

    // 成功后跳转到考前检测
    if( taskType === "exam" ){
      router.push('/student/exam');
    }else{
      router.push('/student/deviceCheck');
    }

  }

  // 点击触发举手事件
  help = () => {
    const { ipAddress } = this.props;
    sendM("help", { "ipAddr": ipAddress })
    message.success(formatMessage({id:"task.message.raise.hands",defaultMessage:"举手成功！"}))
  }

  // 修改名称
  changeValue =(e)=>{
    const { number } = this.state;
    const newValue = e.target.value.replace(/[^\d]/g,'');
    if( newValue==="" ) {
        this.setState({
            disabled:true,
            testNumber:''
        })
    }else {
        if( number === '' ) {
            this.setState({
                disabled:true
            })
        }else {
            this.setState({
                disabled:false
            })
        }

        if (newValue.length>20) {
            message.warning(formatMessage({id:"task.message.task.id.max.length.20",defaultMessage:"考号长度不能超过20位"}));
        }else {
            this.setState({
                testNumber:newValue
            })
        }
    }
  }

  /**
   * 连接设置页面
   * 跳转到配置设置
   */
  reconnect = ()=>{
    const { taskId } = this.props;
    if( taskId === "autoCheck" ) return;
    router.push('/student/ready/changeip');
  }


  render() {
    const { taskId, sureLoading } = this.props;
    const { number,disabled,studentLoginSuccess,name,testNumber,inLogin } = this.state;
    return (
      <Layout className={styles.teacher_page}>
        <div className="login-box">
          <div className={styles.checkStatus}>
            <img src='http://res.gaocloud.local/logos/login_page_logo@2x.png' alt="" width="540" height="50" />
          </div>
          {
            !studentLoginSuccess && (
              <>
                <div className="studentLogin">
                  <div className="seatNumber">
                    <div className="unfocus">
                      <div className="number">{number}</div>
                      <div className="tip">{formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})}</div>
                    </div>
                    <div className="focus">
                      <div className="number">{number}</div>
                      <div className="tip">{formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})}</div>
                      <div className="edit">
                        <div className="edit-icon" onClick={this.showEditNumber}><i className="iconfont icon-edit" /></div>
                        <div className="text">{formatMessage({id:"task.text.change",defaultMessage:"修改"})}</div>
                      </div>
                    </div>
                  </div>
                  <div className="input">
                    <input
                      placeholder={formatMessage({id:"task.placeholder.input.task.id",defaultMessage:"请输入你的考号"})}
                      type="text"
                      value={testNumber}
                      autoComplete="off"
                      onKeyDown={(e)=>{
                        if( taskId === "autoCheck" ){
                          return;
                        }
                        if( e.key === "Enter" || e.keyCode === 13 ){
                          this.studentLogin();
                        }
                      }}
                      disabled={taskId === "autoCheck"}
                      onChange={this.changeValue}
                    />
                  </div>
                </div>
                <Button className="login" onClick={this.studentLogin} loading={inLogin} disabled={disabled || taskId === "autoCheck"}>
                  {formatMessage({id:"task.button.login",defaultMessage:"登录"})}
                </Button>
                <div className="options">
                  <div className={cs(styles.hand,{[styles.disabled]:taskId === "autoCheck"})} onClick={this.reconnect}>
                    <div>{formatMessage({id:"task.text.connect.teacher.config",defaultMessage:"连接教师机设置"})}</div>
                  </div>
                  <Divider type="vertical" style={{margin:"0px 20px"}} />
                  <div className={cs("iconfont","icon-raise-hand",styles.hand)} onClick={this.help}>
                    <div>{formatMessage({id:"task.text.raise.hands",defaultMessage:"举手"})}</div>
                  </div>
                </div>
              </>
            )
          }
        </div>
        {
          studentLoginSuccess && (
            <div className="confirm-box">
              <div className="topCard" />
              <div className="top">
                <div className="item">
                  <div className="tit">{formatMessage({id:"task.text.FullName",defaultMessage:"姓名"})}</div>
                  <div className="content">{name}</div>
                </div>
                <Divider type="vertical" />
                <div className="item">
                  <div className="tit">{formatMessage({id:"task.text.studentCode",defaultMessage:"考号"})}</div>
                  <div className="content">{testNumber}</div>
                </div>
                <Divider type="vertical" />
                <div className="item">
                  <div className="tit">{formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})}</div>
                  <div className="content">{number}</div>
                </div>
              </div>
              <div className="btns">
                <Button className="btn" onClick={this.confirmBack} disabled={taskId === "autoCheck"}>
                  {formatMessage({id:"task.button.back",defaultMessage:"返回"})}
                </Button>
                <Button className="btn link" loading={sureLoading} disabled={taskId === "autoCheck"} onClick={this.confirmStudentInfo}>
                  {formatMessage({id:"task.button.confirmBtn",defaultMessage:"确认"})}
                </Button>
              </div>
              <div className={cs("iconfont","icon-raise-hand",styles.hand)} style={{marginTop:"50px"}} onClick={this.help}>
                <div>{formatMessage({id:"task.text.raise.hands",defaultMessage:"举手"})}</div>
              </div>
            </div>
          )
        }

      </Layout>
    );
  }
}

export default LoginPage;
