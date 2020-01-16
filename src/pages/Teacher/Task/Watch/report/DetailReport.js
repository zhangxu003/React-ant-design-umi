import React, { Component } from 'react';
import { Card, Icon, Divider, Table, Steps, Tooltip, Avatar } from 'antd';
import { formatMessage } from 'umi/locale';
import cs from "classnames";
import { connect } from "dva";
import { formatDate } from "@/utils/utils";
import InnerLabel from './InnerLabel';
import styles from './index.less';

const {Step} = Steps;

// 对数据进行预处理
@connect(( {task} )=>{
  const { taskInfo, copyStudents : testStudent = [] } = task;
  const { startTime, endTime=0 } = taskInfo;
  const totalTime = endTime>startTime?(endTime - startTime):0;
  const diffTime  = Math.ceil(totalTime/(60*1000));

  const students = [
    ...testStudent,
  ]

  // ====================== 检测部署的数据测试=======================
  // 1、 学生登录步骤
  const studentLoginStep = [];
  // 2、 放音录音测试
  const deviceCheckStep = [];
  // 3、 下载试卷步骤
  const downloadPaperStep = [];
  // 4、 考试步骤
  const examStep = [];
  // 5、上传答卷步骤
  const uploadPackageStep = [];
  // 循环数组
  students.forEach(tag=>{
    const item = tag;
    switch( item.monitoringStatus ){

      // 1、 学生登录步骤
      case "MS_1" :
      case "MS_2" : item.step="studentLogin"; studentLoginStep.push(item); break;

      // 2、 放音录音测试
      case "MS_3" :
      case "MS_5" : item.step="deviceCheck"; deviceCheckStep.push(item); break;

      // 3、 下载试卷步骤
      case "MS_4" :
      case "MS_7" : item.step="downloadPaper"; downloadPaperStep.push(item); break;

      // 4、考试步骤
      case "MS_6"  :
      case "MS_8"  :
      case "MS_9"  :
      case "MS_12" :
      case "MS_10" : item.step="exam";  examStep.push(item); break;
      case "MS_14" :
        if( item.respondentsStatus !== "RS_1" ){
          item.step="exam";
          examStep.push(item);
        }
        break;

      // 5、上传答卷步骤
      case "MS_13" :
      case "MS_11" :
      case "MS_15" : item.step="uploadPackage"; uploadPackageStep.push(item); break;

      default : break;
    }
  });

  const checkStepData= [
    {
      type   : "openStudent",
      title  : formatMessage({id:"task.title.start.student.device",defaultMessage:"开启学生机"}),
      status : students.length > 0?"success" : "none",
      number : 0
    },{
      type   : "studentLogin",
      title  : formatMessage({id:"task.title.student.login",defaultMessage:"学生登录"}),
      status : studentLoginStep.length>0?"fail":"success",
      number : studentLoginStep.length
    },{
      type   : "deviceCheck",
      title  : formatMessage({id:"task.title.check.audioinput.and.audiooutput",defaultMessage:"放录音测试"}),
      status : deviceCheckStep.length>0?"fail":"success",
      number : deviceCheckStep.length
    },{
      type   : "downloadPaper",
      title  : formatMessage({id:"task.title.download.paper",defaultMessage:"下载试卷"}),
      status : downloadPaperStep.length>0?"fail":"success",
      number : downloadPaperStep.length
    },{
      type   : "exam",
      title  : formatMessage({id:"task.text.testExam",defaultMessage:"考试"}),
      status : examStep.length>0?"fail":"success",
      number : examStep.length
    },{
      type   : "uploadPackage",
      title  : formatMessage({id:"task.title.upload.answer",defaultMessage:"上传答案"}),
      status : uploadPackageStep.length>0?"fail":"success",
      number : uploadPackageStep.length
    }
  ];

  // 判断是否是未检测的状态
  checkStepData.reduce((total,item)=>{
    const obj = item;
    if( total >= students.length ){
      obj.status = "none";
    }
    return total + item.number;
  },0)


  // ====================== 异常统计数据=======================
  // 1、 通信异常
  const connectError = [];
  // 2、 耳机异常
  const earError = [];
  // 3、 其它
  const otherError = [];

  // 循环数组
  students.forEach(tag=>{
    const item = tag;
    switch( item.monitoringStatus ){

      // 1、 通信异常
      case "MS_4" :
      case "MS_7" :
      case "MS_10" :
      case "MS_13" :
      case "MS_11" : item.errorType = "connectError"; connectError.push(item); break;

      // 2、 耳机异常
      case "MS_5" : item.errorType = "earError"; earError.push(item); break;

      // 3、 其它
      case "MS_3" :
      case "MS_1" :
      case "MS_2" :
      case "MS_6" :
      case "MS_8" :
      case "MS_9" :
      case "MS_12" :
      case "MS_15" : item.errorType = "otherError"; otherError.push(item); break;

      default : break;
    }
  });

  // 异常数据统计
  const errorData = [
    {
      type  : 'connectError',
      value : connectError.length,
      name  : formatMessage({id:"task.title.connect.abnormal",defaultMessage:"通信异常"}),
      color : "rgba(255, 110, 74, 1)",
      data  : connectError
    }, {
      type  : 'earError',
      value : earError.length,
      name  : formatMessage({id:"task.title.earphone.abnormal",defaultMessage:"耳机异常"}),
      color : "rgba(197, 84, 244, 1)",
      data  : earError
    }, {
      type  : 'otherError',
      value : otherError.length,
      name  : formatMessage({id:"task.title.otherTab",defaultMessage:"其它"}),
      color : "rgba(136, 136, 136, 1)",
      data  : otherError
    }
  ];

  return {
    beginTime     : formatDate("yyyy-MM-dd hh:mm",startTime),    // 开始时间
    endTime       : formatDate("yyyy-MM-dd hh:mm",endTime),      // 结束时间
    totalTime     : diffTime,                                    // 共计时长
    checkStepData : JSON.stringify(checkStepData),               // 检测步骤的数据
    hasError      : students.length>0 && students.some(item=>item.monitoringStatus!=="MS_14"), // 是否有异常数据
    errorData     : JSON.stringify(errorData),                  // 异常数据统计
    checkAll      : students.length,                            // 检测的总数
    errorAll      : students.filter(item=>item.monitoringStatus!=="MS_14").length, // 异常的总数
    students      : JSON.stringify(students)                    // 学生详情列表
  };
})
class DetailReport extends Component {

  state = {
    errorType : "connectError",
  }

  componentDidMount(){
    // 获取有值得iptype
    const {errorData} = this.props;
    const list = JSON.parse(errorData);
    const {type} = list.find(tag=>tag.value>0) || {};
    this.setState({
      errorType : type || "connectError"
    });
  }

  /**
   * 异常统计中要显示那种异常ip
   */
  recordPlotClick = ( ev )=>{
    const { data } = ev || {};
    const origin = "_origin";
    if(  data && (data.point || data[origin]) ){
      const { type } = (data.point || data[origin]) || {};
      this.setState({
        errorType : type || "connectError"
      });
    }
  }



  /**
   * 检验步骤生存render
   */
  renderCheckSteps = ()=>{
    const { checkStepData } = this.props;
    const list = JSON.parse(checkStepData);

    // 添加Tooltip
    const progressDot = (_, {index})=>{
      const {
        status="none",
        number=0
      } = list[index];
      const params = {
        "success" : {
          title   : formatMessage({id:"task.title.no.abnormal",defaultMessage:"无异常"}),
          content : <Icon type="check" />
        },
        "none"    : {
          title   : formatMessage({id:"task.title.unfinish.check",defaultMessage:"未检测"}),
          content : <Icon type="exclamation" />
        },
        "fail"    : {
          title   : formatMessage({id:"task.title.abnormal.num",defaultMessage:"异常：{num}"},{"num":number}),
          content : number
        }
      }[status];
      return (
        <Tooltip title={params.title}>
          <div className={cs(styles.dot,styles[status])}>{params.content}</div>
        </Tooltip>
      )
    }

    return (
      <Steps progressDot={progressDot} current={0} className={styles.steps}>
        {
          list.map(item=><Step status={item.status} key={item.type} title={item.title} />)
        }
      </Steps>
    );
  }


  /**
   * @description: 根据异常统计的数据，生成图形
   * @param {type}
   * @return:
   */
  renderErrorCountImg = ()=>{

    const { hasError, errorData, checkAll, errorAll } = this.props;
    const { errorType } = this.state;
    const recordData = JSON.parse(errorData);
    const ipList = recordData.find(item=>item.type === errorType);

    return (
      <div className={cs(styles.inner,styles['error-count'])}>
        {
          hasError ? (
            <>
              <div className={styles.half} style={{minWidth:"430px"}}>
                <div className={styles['error-show']}>
                  {
                    <InnerLabel
                      className={styles['error-img']}
                      data={recordData}
                      height={190}
                      onPlotClick={this.recordPlotClick}
                      padding={[20,130,20,20]}
                      layout="vertical"
                    />
                  }
                  <div className={styles['error-content']}>
                    <div>
                      <span className={styles.long}>
                        <span>{formatMessage({id:"task.title.check.total.label",defaultMessage:"检测总数："})}</span>
                        <span className={styles.number}>{checkAll}</span>
                      </span>
                      <span>
                        <span>{formatMessage({id:"task.title.abnormal.label",defaultMessage:"异常："})}</span>
                        <span className={cs(styles.number,styles.warn)}>{errorAll}</span>
                      </span>
                    </div>
                    <Divider style={{margin:"5px 0px"}} />
                  </div>
                </div>
              </div>
              <div className={styles.half} style={{flex:1}}>
                <div className={styles['ip-type']}>{ipList.name}IP</div>
                <ul className={styles['ip-list']}>
                  {ipList.data.map(item=><li key={item.studentId}>{item.ipAddress}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <Avatar size={80} style={{background:"rgba(230,230,230,1)"}}>
                <span style={{fontSize:"36px",color:"rgba(136,136,136,1)"}} className={cs("iconfont","icon-computer-ai")} />
              </Avatar>
              <div style={{marginTop:"20px"}}>
                {formatMessage({id:"task.text.all.device.clear",defaultMessage:"本次考场设备检测无异常"})}
              </div>
            </div>
          )
        }
      </div>
    )
  }

  // 字符串比较
  localeCompare = (a="",b="")=>a.localeCompare(b)

  /**
   * @description: 检测详情的列表显示内容
   * @param {type}
   * @return:
   */
  renderCheckDetailTable = ()=>{
    const { students, checkStepData, errorData } = this.props;
    const list      = JSON.parse(students);
    const stepList  = JSON.parse(checkStepData);
    const errorList = JSON.parse(errorData);

    const columns = [{
      title: 'IP',
      dataIndex: 'ipAddress',
      width: "25%",
      sorter : (a,b)=>this.localeCompare(a.ipAddress,b.ipAddress)
    }, {
      title: formatMessage({id:"task.title.sutdent.code",defaultMessage:"考号"}),
      dataIndex: 'identifyCode',
      width: "15%",
      sorter : (a,b)=>this.localeCompare(a.identifyCode,b.identifyCode)
    }, {
      title: formatMessage({id:"task.title.name",defaultMessage:"姓名"}),
      dataIndex: 'userName',
      width: "15%",
      sorter : (a,b)=>this.localeCompare(a.userName,b.userName)
    }, {
      title: formatMessage({id:"task.title.check.result",defaultMessage:"检测结果"}),
      dataIndex: 'examStatus',
      width: "15%",
      sorter : (a,b)=>this.localeCompare(a.examStatus,b.examStatus),
      render : (tag)=>(tag=== "ES_4"? "正常":<span className={styles["color-error"]}>异常</span>)
    }, {
      title: formatMessage({id:"task.title.normal.step",defaultMessage:"异常步骤"}),
      dataIndex: 'step',
      width: "15%",
      sorter : (a,b)=>this.localeCompare(a.step,b.step),
      render : (tag)=><span className={styles["color-error"]}>{(stepList.find(obj=>obj.type===tag)||{}).title}</span>
    }, {
      title: formatMessage({id:"task.title.abnormal.reason ",defaultMessage:"异常原因"}),
      dataIndex: 'errorType',
      width: "15%",
      textAlign : "center",
      sorter : (a,b)=>this.localeCompare(a.errorType,b.errorType),
      render : (tag, item)=>{
        const errorObj = errorList.find(obj=>obj.type===tag);
        if( !errorObj )
          return "";
        return <span className={styles["color-error"]}>{errorObj.name}{tag==="otherError"&&`(${item.monitoringStatus})`}</span>;
      }
    }];

    return (
      <Table
        pagination={false}
        rowKey="studentId"
        scroll={{ y: 400 }}
        columns={columns}
        dataSource={list}
        rowClassName={styles.white}
      />
    )
  }


  /**
   * @description: 组件主体文本内容
   * @param {type}
   * @return:
   */
  render() {
    const {
      beginTime = 0,
      endTime = 0,
      totalTime = 0,
      toggleReport
    } = this.props;
    const cardBodyStyle = {padding: '0px 15px 8px 15px'};
    const headStyle = { border : "none", background : "transparent" };
    const renderCardTitle = (tag)=><div className={styles['card-head']}>{tag}</div>;

    return (
      <div className={styles.detail}>
        <Card
          title={
            <div>
              <Icon type="left" style={{fontSize:"14px"}} className={styles["back-btn"]} onClick={toggleReport} />
              <Divider type="vertical" style={{margin:"0px 10px"}} />
              <span>{formatMessage({id:"task.button.detail.report",defaultMessage:"报告详情"})}</span>
            </div>
          }
          bodyStyle={{padding:"0px 0px 20px 0px"}}
        >
          {/* 统计功能 */}
          <div className={styles['count-list']}>
            <div>{formatMessage({id:"task.title.begin.time.lable",defaultMessage:"开始时间："})}{ beginTime }</div>
            <Divider className={styles.divider} type="vertical" />
            <div>{formatMessage({id:"task.title.end.time.lable",defaultMessage:"完成时间："})}{ endTime }</div>
            <Divider className={styles.divider} type="vertical" />
            <div>{formatMessage({id:"task.text.record.total.time",defaultMessage:"总计时长：{totalTime}分钟"},{"totalTime":totalTime})}</div>
          </div>

          <div className={styles.cards}>

            {/* 检测步骤 */}
            <Card className={styles.card} title={renderCardTitle("检测步骤")} type="inner" bodyStyle={cardBodyStyle} headStyle={headStyle}>
              <div className={cs(styles.inner,styles['check-step'])}>
                {this.renderCheckSteps()}
                <ul className={styles.tooltip}>
                  <li className={styles.success}>{formatMessage({id:"task.title.no.abnormal",defaultMessage:"无异常"})}</li>
                  <li className={styles.fail}>{formatMessage({id:"task.title.has.abnormal",defaultMessage:"有异常"})}</li>
                  <li className={styles.none}>{formatMessage({id:"task.title.unfinish.check",defaultMessage:"未检测"})}</li>
                </ul>
              </div>
            </Card>

            {/* 异常统计 */}
            <Card
              className={styles.card}
              title={renderCardTitle(formatMessage({id:"task.title.abnormal.total",defaultMessage:"异常统计"}))}
              type="inner"
              bodyStyle={cardBodyStyle}
              headStyle={headStyle}
            >
              {this.renderErrorCountImg()}
            </Card>

            {/* 检测详情 */}
            <Card
              className={styles.card}
              title={renderCardTitle(formatMessage({id:"task.title.check.detail",defaultMessage:"检测详情"}))}
              type="inner"
              bodyStyle={cardBodyStyle}
              headStyle={headStyle}
            >
              {this.renderCheckDetailTable()}
            </Card>

          </div>
        </Card>
      </div>
    );
  }
}
export default DetailReport;
