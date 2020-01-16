import React, { Component } from 'react';
import {  Table,   Input,Tooltip} from 'antd';
import { formatMessage} from 'umi/locale';
import {connect} from "dva";
import cs from 'classnames';
import {
  studentExerciseStatusLib,    // 学生练习任务状态字典库
  studentExamsStatusLib,       // 学生考试任务状态字典库
} from "@/utils/dictionary";
import {ownSortCode} from '../watching';
import styles from './index.less';


const {Search} = Input;

// 对数据进行预处理
@connect(({ task })=>{
  const { students, taskInfo } = task;
  const { taskPaperIdList, taskStudentRelationVOList, classList, type } = taskInfo;
  // 根据 studentList 和 students 生成任务详情
  const studentArr = taskStudentRelationVOList.map(item=>{
    const student = students.find(obj=>obj.studentId === item.studentId) || {};
    // 判断该学生是否已经连接教师机
    const inTask = !!student.studentId;
    // 考生的状态（对应字典表：练习 studentExerciseStatus, 考试 studentExamsStatus）
    const taskStatus = ( inTask ? student.examStatus : item.examStatus ) || "ES_1";
    // 是否参加了任务
    const taskAble = item.status === "Y";
    return {
      classId           : item.classId,             // 教室id
      className         : item.className,           // 教室名称
      gender            : item.gender || "男",      // 性别（未提供）
      examNo            : item.examNo,              // 考试号
      loading           : item.loading,             // loading状态
      taskAble,                                     // 是否参加了任务
      inTask,                                       // 是否在测试中
      taskStatus        : taskAble?taskStatus:"",   // 学生的状态（对应字典表：练习 studentExerciseStatus, 考试 studentExamsStatus）只有参考才有考试状态
      studentId         : item.studentId,           // 学生的id
      studentName       : item.studentName,         // 学生的名称
      seatNo            : inTask?student.seatNo:item.seatNo,                   // 座位号( 用此判断该学生是否在任务进行中 )
      ipAddress         : inTask?student.ipAddress:item.ipAddress,             // 学生ip
      monitoringDesc    : inTask?student.monitoringDesc:item.monitoringDesc,   // 考试状态异常的原因，老师输入内容（ 考试专用 ）
      paperArr          : student.paperList || [],  // 练习试卷数量（练习专用)
      respondentsStatus : student.respondentsStatus, // 答题包状态（对应字典表：respondentStatus）
      examFlag          :item.examFlag,  // 该学生是补/报
      makeUpCount       :item.makeUpCount  // 补考的次数
    }
  });
  // 暴露给proxy的数据
  return {
    paperList      : taskPaperIdList,   // 试卷列表
    studentList    : studentArr,        // 学生列表
    classList,                       // 教师的列表
    taskType       : type === "TT_2" ? "practice" : "exam",   // 任务类型（practice：练习；exam：考试）
  };

})
class SiderDrawer extends Component {

  // 初始化state
  state = {
    searchKey     : "",  // 搜索关键字
  };

  // 按学生姓名或学号搜索
  searchKey = (key)=>{
    this.setState({
      searchKey : key
    });
  }



  /**
   * render
   */
  render() {
    const {  searchKey } = this.state;
    const {  studentList,  taskType } = this.props;
    // 判断当前任务是练习还是考试，并提供可配项( 默认考试 )
    let config = {
      taskStatus : studentExamsStatusLib,    // 考试状态字典
      title      : formatMessage({id:"task.text.testExam",defaultMessage:"考试"}),
      unTask     : formatMessage({id:"task.text.NoReference",defaultMessage:"不参考"}),
    };
    if( taskType === "practice" ){    // 练习的配置项
      config = {
        taskStatus : studentExerciseStatusLib,
        title      : formatMessage({id:"task.text.Practicing",defaultMessage:"练习"}),
        unTask     : formatMessage({id:"task.text.NotPracticing",defaultMessage:"不参练"}),
      }
    }
    const students = studentList.filter(item=>{
      let isShow = true;
      // 按学生姓名搜索
      if( searchKey !== "" ){
        const { studentName,examNo } = item;
        let tag = false;
        if( studentName && studentName.indexOf(searchKey) !== -1 ){
          tag = true;
        }else if( examNo && examNo.indexOf(searchKey) !== -1 ){
          tag = true;
        }
        if( !tag ){
          isShow = false;
        }
      }
      return isShow;
    });

    // 过滤要显示的学生数组信息
    const es1 = students.filter(item=>item.taskStatus==='ES_1').sort(ownSortCode)
    console.log(es1)
    const es2 = students.filter(item=>item.taskStatus==='ES_2').sort(ownSortCode)
    const es3 = students.filter(item=>item.taskStatus==='ES_3').sort(ownSortCode)
    const es4 = students.filter(item=>item.taskStatus==='ES_4').sort(ownSortCode)
    const showStudent = es1.concat(es2).concat(es4).concat(es3)
    const studentArr = showStudent.filter(item=>{
      let isShow = true;
      // 通过学生的任务状态过滤数据
      if(item.taskAble===false ){
        isShow = false;
      }
      return isShow;
    });
    // table标签数组
    const columns = [

      { title: formatMessage({id:"task.text.studentCode",defaultMessage:"考号"})  ,dataIndex: 'examNo',width:200},
      { title: formatMessage({id:"task.text.FullName",defaultMessage:"姓名"})  ,dataIndex: 'studentName', render    : (_,record) =>
        <div>
          <Tooltip title={record.studentName}><div className={styles.userNameLength}>{record.studentName}</div></Tooltip>{record.examFlag&&
          <span>
            {record.examFlag.split(',').map(vo=>vo==='APPLY'?
              <Tooltip title={formatMessage({id:"task.text.on.site.registration",defaultMessage:"现场报名"})} className={styles.news}>
                {formatMessage({id:"task.text.text.on.site.newspaper",defaultMessage:"报"})}
              </Tooltip>:
              vo==='MAKE_UP_EXAM'&&
              <Tooltip title={`${formatMessage({id:"task.text.Make.up.Examination",defaultMessage:"已补考"})}${record.makeUpCount||0}${formatMessage({id:"task.text.exam.second.count",defaultMessage:"次"})}`} className={styles.makeup}>
                {formatMessage({id:"task.text.repair",defaultMessage:"补"})}
              </Tooltip> )
            }
          </span>
          }
        </div>
      },
      {
        title     : `${config.title}${formatMessage({id:"task.text.state",defaultMessage:"状态"})}`,
        dataIndex : 'taskStatus',
        render    : (_,record) => {
          const { taskStatus,taskAble } = record;
          // 判断是否参加考试，或练习
          if( !taskAble )
            return <span>{ config.unTask }</span>
          // 任务进行中
          if( taskStatus === 'ES_2' ){
            return <span style={{color:"rgba(3, 196, 107, 1)"}}>{config.taskStatus[taskStatus]}</span>
          }
          // 任务失败
          if( taskStatus === 'ES_3' ){
            return <span style={taskType === "practice"?{color:"#03C46B"}:{color:"rgba(255, 110, 74, 1)"}}>{taskType === "practice"?formatMessage({id:"task.title.examStatusPracticed",defaultMessage:"已练习"}):config.taskStatus[taskStatus]}</span>
          }
          if( taskStatus === 'ES_4'&&taskType === "practice"){
            return <span style={{color:"#03C46B"}}>{formatMessage({id:"task.title.examStatusPracticed",defaultMessage:"已练习"})}</span>
          }
          return <span>{config.taskStatus[taskStatus]}</span>
        }
      },

    ]

    return (
      <div className={styles.contect}>
        {/* 检索及列表功能 */}
        <div className={styles['content-list']}>

          {/* 按班级检索 */}
          <div className={styles['filter-list']}>

            {/* 按学生姓名或学号搜索 */}
            <div className={styles['filter-search']}>
              <Search
                placeholder={formatMessage({id:"task.placeholder.SearchbyStudent ",defaultMessage:"按学生姓名/考号搜索"})}
                maxLength={30}
                onSearch={this.searchKey}
                enterButton
              />
            </div>
          </div>
          {/* 学生检索结果 */}
          <Table
            rowKey="studentId"
            className={cs(styles.table)}
            columns={columns}
            dataSource={studentArr}
            pagination={false}
            onChange={this.tableChange}
            size="small"
          />
        </div>
      </div>
    );
  }
}
export default SiderDrawer;
