import React, { Component } from 'react';
import { connect } from "dva";
import { formatMessage } from 'umi/locale';
import { Divider, Table, Radio } from "antd";
import taskType from "@/pages/Teacher/taskType";
import styles from './index.less';

const RadioGroup = Radio.Group;

@connect(({ dictionary }) =>{
  const { TASK_STATUS=[], TASK_QUERY_DATE=[], CLASSTYPE= [] } = dictionary;
  return {
    TASK_STATUS,
    TASK_QUERY_DATE,
    CLASSTYPE
  }
})
class BatchesStudentCount extends Component {

  state = {
    studentExamInfo : []   // 未处理的学生
  }

  // 表单信息
  columns = [
    {
      title: formatMessage({id:"task.text.studentCode",defaultMessage:"考号"}),
      dataIndex: 'examNo',
      key: 'examNo',
      width: 200
    },{
      title: formatMessage({id:"task.text.FullName",defaultMessage:"姓名"}),
      dataIndex: 'studentName',
      key: 'studentName',
    },{
      title: formatMessage({id:"task.text.set.tag.as",defaultMessage:"标记为..."}),
      dataIndex: 'examStatus',
      key: 'examStatus',
      width: 180,
      render : (examStatus,record)=>(
        <RadioGroup onChange={(e)=>this.onChange(e,record.studentId)} value={examStatus}>
          <Radio className={styles.success} value="ES_4">
            {formatMessage({id:"task.text.effective",defaultMessage:"有效"})}
          </Radio>
          <Radio className={styles.error} value="ES_3">
            {formatMessage({id:"task.text.cheat",defaultMessage:"作弊"})}
          </Radio>
        </RadioGroup>
      )
    }
  ]

  constructor(props){
    super(props);
    const { modal, type } = this.props;
    const copyWriting = taskType(type);
    modal.update({
      className : styles.confirm,
      onOk : this.handleOk,
      okText : copyWriting.type === "exam" ? formatMessage({id:"task.text.endTest",defaultMessage:"结束考试"}) : formatMessage({id:"task.text.endPractice",defaultMessage:"结束练习"})
    });
  }

  componentDidMount(){
    const { studentExamInfo } = this.props;
    // 获取考试失败的数组
    this.examStatusES_3 = studentExamInfo.filter(item=>item.examStatus==="ES_3");

    // 默认将数据设置未有效
    const list = studentExamInfo.filter(item=>item.examStatus!=="ES_3").map(item=>{
      // 答题包状态设置为成功
      const snapshotInfo = item.snapshotInfo.map(info=>({
        ...info,
        respondentsStatus : "RS_1"
      }));
      const obj = {
        ...item,
        examStatus : "ES_4",
        monitoringDesc : "",
        snapshotInfo
      };
      return obj;
    });

    this.setState({
      studentExamInfo : list
    });
  }


  // 处理 点击 确认的事件
  handleOk = ()=>{
    const { studentExamInfo } = this.state;
    const { endTask } = this.props;
    endTask([...studentExamInfo,...this.examStatusES_3]);
  }


  // radio 改变
  onChange = (e,studentId)=>{
    const { value } =  e.target;
    const { studentExamInfo } = this.state;

    // 默认将数据设置未有效
    const list = studentExamInfo.map(item=>{
      const obj = { ...item };
      if( item.studentId === studentId ){
        obj.examStatus = value;
        obj.monitoringDesc = value === "ES_3" ? "ES_2":"";
      }
      return obj;
    });

    this.setState({
      studentExamInfo : list,
    });
  }


  render() {
    const { noExamStudentCount, batchInfo, type } = this.props;
    const { studentExamInfo : list } = this.state;
    const copyWriting = taskType(type);
    // {
    //   name         : "考试"
    //   ctualAttend  : "实考",
    //   shouldAttend : "应考",
    //   Invigilate   : "监考中"
    // }

    return (
      <div className={styles.count}>
        {
          batchInfo.length>0 && (
            <div>
              <div className={styles.title}>
                {formatMessage({id:"task.text.other.class.runing.task",defaultMessage:"尚有以下场次正在进行{type}"},{"type":copyWriting.name})}
              </div>
              <ul className={styles.ul}>
                {
                  batchInfo.map(item=>(
                    <li className={styles.list} key={item.teacherId}>
                      <span className={styles.name}>{item.teacherName}</span>
                      <span className={styles.status}>{formatMessage({id:"task.text.inspection",defaultMessage:"监考中"})}</span>
                    </li>
                  ))
                }
              </ul>
              { list.length > 0 && copyWriting.type === "exam"  && (
                <div>
                  <span className={styles.label}>
                    {formatMessage({id:"task.text.sure.answers.is.effective",defaultMessage:"已收到正在考试场次的学生答案，请确认答卷是否有效"})}
                  </span>
                  <Table
                    className={styles.table}
                    rowKey="studentId"
                    columns={this.columns}
                    dataSource={list}
                    pagination={false}
                    size="middle"
                  />
                </div>
              )}
            </div>
          )
        }
        { batchInfo.length>0 && noExamStudentCount>0 && <Divider /> }

        {
          noExamStudentCount>0 && (
            copyWriting.type === "exam" ?
            (
              <div className={styles.title}>
                {formatMessage({id:"task.text.some.student.unfinished.exam",defaultMessage:"尚有{num}名学生未考试"},{"num":noExamStudentCount})}
                <span className={styles.info}>
                  {formatMessage({id:"task.text.set.unfinished.as.miss.task",defaultMessage:"结束考试，未考学生将标记为缺考"})}
                </span>
              </div>
            ):(
              <div className={styles.title}>
                {formatMessage({id:"task.text.some.student.unfinished.practice",defaultMessage:"尚有{num}名学生未练"},{"num":noExamStudentCount})}
              </div>
            )
          )
        }
      </div>
    );
  }
}
export default BatchesStudentCount;
