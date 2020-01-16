import React, { Component } from 'react';
import { connect } from "dva";
import TaskDetail from '../components/TaskDetail';
import styles from './index.less';

@connect(({dictionary, teacher:{ taskData:{records=[]} } },{match={}}) =>{
  const {taskId} = match.params || {};
  const { RECTIFYTYPE=[], DIST_TYPE=[], EXAM_TYPE=[] } = dictionary;
  const data = records.find(item=>item.taskId === taskId) || {};
  return {
    RECTIFYTYPE,    // 人工纠偏字典库
    DIST_TYPE,      // 分发试卷字典库
    EXAM_TYPE,      // 考试策略字典库
    ...data,
    examType : data.examStatus, // 考试策略
    taskId
  };
})
/**
 *  type: public(发布)、inspect(检查)
 *
 *  @Author: tina.zhang
 * @date 2019-04-18
 * @class ExamTaskDetail
 * @extends {Component}
 */
class ShowTask extends Component {

  // 初始化
  componentDidMount(){
    // 判断当前的数据中，是否有学生列表
    const { studentList, dispatch, taskId } = this.props;
    if( !studentList ){
      dispatch({
        type : "teacher/getTaskStudentList",
        payload : taskId
      })
    }
  }

  // 将字典code转换成字典value
  switchType=(keys = "",data)=>{
    if( !keys ) return "";

    const alltypes = keys.split(",");
    const alltypesValue = alltypes.map(item=>{
      const { value } = data.find(tag=>tag.code===item) || {};
      return value || item;
    });
    return alltypesValue.join(" | ")
  }

  render() {
    const { RECTIFYTYPE, DIST_TYPE, EXAM_TYPE } = this.props;
    const { name, type, distributeType, examType, rectifyType, teacher,teacherName, classList=[], paperList=[], studentList=[] } = this.props;

    // 生成预览所用的数据
    const dataProps = {
      ableBack       : true, // 是否能够返回上一页
      name,             // 任务名称
      type,             // 任务类型
      distributeType : this.switchType(distributeType,DIST_TYPE),    // 分发试卷
      examType       : this.switchType(examType,EXAM_TYPE),          // 任务策略
      rectifyType    : rectifyType === 'CURRENT_TEACHER'?teacherName:this.switchType(rectifyType,RECTIFYTYPE),     // 人工纠偏
      teacher,                        // 代课老师
      classList,         // 教室列表
      paperList,         // 试卷列表
      studentList,       // 考试列表
      showPaper : true,   // 能否试卷预览
      choosedNum : studentList.filter(item=>item.status==="Y").length,
      showTeacher:true
    }

    return (
      <div className={styles.confirmStep}>
        <TaskDetail {...dataProps} />
      </div>
    )
  }
}

export default ShowTask
