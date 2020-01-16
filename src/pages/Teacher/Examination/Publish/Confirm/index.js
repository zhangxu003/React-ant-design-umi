import React, { Component } from 'react';
import { Spin  } from 'antd';
import { connect } from "dva";
import router from "umi/router";
import styles from './index.less';
import StepBottom from '../components/StepBottom';
import TaskDetail from '../components/TaskDetail';

@connect(({ release,loading,dictionary }) =>{
  const { RECTIFYTYPE=[], DIST_TYPE=[], EXAM_TYPE=[] } = dictionary;
  return {
    RECTIFYTYPE,    // 人工纠偏字典库
    DIST_TYPE,      // 分发试卷字典库
    EXAM_TYPE,      // 考试策略字典库
    fetchSaveTasking : loading.effects['release/fetchSaveTask'] || false, // 保存任务进度
    data : release.publishSaveData || {},                        // 要发布的数据
    taskType : release.taskType,
    choosedNum:release.choosedNum
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
class ExamTaskDetail extends Component {

    // 返回上一页
    clickBack = () => {
      router.goBack()
    }

    // 将字典code转换成字典value
    switchType=(keys = "",data)=>{
      const alltypes = keys.split(",");
      const alltypesValue = alltypes.map(item=>{
        const { value } = data.find(tag=>tag.code===item) || {};
        return value || item;
      });
      return alltypesValue.join(" | ")
  }

    // 保存任务
    saveTask = ()=>{
      const { dispatch,data,taskType } = this.props;
      dispatch({
        type: 'release/fetchSaveTask',
        payload: data,
      }).then((e)=>{
        const { responseCode } = e;
        if( responseCode !== "200" ){
          return
        }
        dispatch({
          type: 'release/saveExamSetting',
          distributeType:"DT_1",
          examType:"ET_1",
          rectifyType:"NOTHING",
        })
        // 跳转到列表页面
        router.push(`/teacher/tasklist/${taskType}`)
      });
    }

    render() {
      const { data={}, fetchSaveTasking, RECTIFYTYPE, DIST_TYPE, EXAM_TYPE,choosedNum } = this.props;
      const { name, type, distributeType, examType, rectifyType, teacher, classList=[], paperList=[] } = data;
      // 获取学生列表
      const studentList = classList.reduce((cur,item)=>{
        const { studentList : stuArr=[], className }  = item;
        const list = stuArr.map(sutdent=>({...sutdent,className}));
        return [...cur,...list];
      },[]);

      // 生成预览所用的数据
      const dataProps = {
        ableBack       : false, // 是否能够返回上一页
        name,             // 任务名称
        type,             // 任务类型
        distributeType : this.switchType(distributeType,DIST_TYPE),    // 分发试卷
        examType       : this.switchType(examType,EXAM_TYPE),          // 任务策略
        rectifyType    : this.switchType(rectifyType,RECTIFYTYPE),     // 人工纠偏
        teacher        : teacher && teacher[1],                        // 代课老师
        classList,           // 教室列表
        paperList,           // 试卷列表
        studentList, // 考试列表
        choosedNum,
        showTeacher:false
      }

      return (
        <div className={styles.confirmStep}>
          <Spin delay={500} spinning={fetchSaveTasking}>
            <TaskDetail {...dataProps} />
            <div className="releaseStep">
              <StepBottom
                prevText="上一步"
                nextText="发布任务"
                prev={this.clickBack}
                disabled={fetchSaveTasking}
                next={this.saveTask}
              />
            </div>
          </Spin>
        </div>
      )
    }
}

export default ExamTaskDetail
