import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import Modal from "@/components/Modal";
import cs from 'classnames';
import styles from './index.less';
import {MatchUnitType} from '@/frontlib/utils/utils';
import ShowPaper from "../components/TaskDetail/ShowPaper/index";
import { showTime } from "@/utils/timeHandle";

const messages = defineMessages({
    backBtnTit:{id:'task.examination.inspect.task.detail.back.btn.title',defaultMessage:'返回'},
    setting:{id:'task.examination.inspect.task.detail.exam.setting.title',defaultMessage:'考试设置'},
    teacher:{id:'task.examination.inspect.task.detail.exam.teacher.title',defaultMessage:'代课教师'},
    examClass:{id:'task.examination.inspect.task.detail.exam.class.title',defaultMessage:'考试班级'},
    examPaper:{id:'task.examination.inspect.task.detail.exam.paper.title',defaultMessage:'考试试卷'},
    examClassPractice:{id:'task.examination.inspect.task.detail.exam.class.Practice',defaultMessage:'练习班级'},
    examPaperPractice:{id:'task.examination.inspect.task.detail.exam.paper.Practice',defaultMessage:'练习试卷'},
    distModeTit:{id:'task.examination.inspect.task.detail.dist.mode.title',defaultMessage:'分发试卷方式：'},
    examStrategy:{id:'task.examination.inspect.task.detail.exam.strategy.title',defaultMessage:'考试策略：'},
    manualRectification:{id:'task.examination.inspect.task.detail.manual.rectification.title',defaultMessage:'人工纠偏：'},
    checkBtnTit:{id:'task.examination.inspect.task.detail.check.btn.title',defaultMessage:"查看参加考试学生"},
    checkBtnTitPractice:{id:'task.examination.inspect.task.detail.check.btn.title.practice',defaultMessage:"查看参加练习学生"},
    checkBtnTit1:{id:'task.examination.inspect.task.detail.check.btn.title1',defaultMessage:"收起"},
    grade:{id:'task.grade',defaultMessage:"适用范围"},
    time:{id:'task.examination.inspect.task.detail.time',defaultMessage:"时长"},
    fullmark:{id:'task.examination.inspect.task.detail.full.mark',defaultMessage:"总分"},
    paperTemplate:{id:'task.examination.inspect.task.detail.paper.template',defaultMessage:"试卷结构"},
    studentCode:{id:'task.examination.inspect.task.detail.student.code',defaultMessage:"考号"},
    classNum:{id:'task.examination.inspect.task.detail.class.number',defaultMessage:"班序"},
    classInCode:{id:'task.examination.inspect.task.detail.class.in.code',defaultMessage:"班内学号"},
    name:{id:'task.examination.inspect.task.detail.student.name',defaultMessage:"姓名"},
    gender:{id:'task.examination.inspect.task.detail.student.gender',defaultMessage:"性别"},
    className:{id:'task.examination.inspect.task.detail.class.name',defaultMessage:"班级"},
    borrowing:{id:'task.examination.inspect.task.detail.student.borrowing',defaultMessage:"是否借读"},
    examPersonNum:{id:'task.examination.inspect.task.detail.student.exam.number',defaultMessage:'应考人数'},
    practivePersonNum:{id:'task.examination.practice.inspect.task.detail.student.exam.number',defaultMessage:'应练人数'},
    preview:{id:'task.examination.inspect.task.detail.preview',defaultMessage:"预览"},
    minute:{id:'task.examination.inspect.paper.minute',defaultMessage:"分钟"},
    mark:{id:'task.examination.inspect.paper.mark',defaultMessage:"分"},
});

/**
 * 已选试卷的显示组件（展示）
 *  @Author: tina.zhang
 * @date 2019-04-18
 * @class ExamTaskDetail
 * @extends {Component}
 */
class PaperDetail extends Component {



    state = {
    };


    // 查看试卷
    showPaper = ( paperId )=>{
      window.ExampaperStatus = "PREVIEW";
      Modal.info({
        width : 950,
        centered : true,
        className: styles.confirm,
        title: null,
        content: <ShowPaper paperId={paperId} />,
        icon: null
      });
    }

    render() {
        const {
         
          paperList =[],    // 试卷列表
         
        } = this.props;

      

        return (
          <div className={styles.detailCont}>
            

            {/* 考试试卷 */}
            <div className={styles.item}>
              <div className={styles.itemTit}>{formatMessage({id:"task.examination.publish.selectedpaper",defaultMessage:"已选试卷"})}</div>
              <div className={styles.itemContent} style={{height:"auto"}}>
                {
                    paperList.map(item => (
                      <div className={styles.paper} key={item.paperId}>
                        <div className={cs(styles.left,styles.setTit)}>
                          {item.name}
                          
                          {/* <span className={styles.preview} onClick={()=>this.showPaper(item.paperId)}>
                            <i className="iconfont icon-eye" />
                            <span style={{paddingLeft:'6px'}}>{formatMessage(messages.preview)}</span>
                          </span> */}
                          

                        </div>
                        <div className={styles.right}>

                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>{formatMessage(messages.fullmark)}：</span>
                            <span className={styles.setCont}>{`${item.fullMark}${formatMessage(messages.mark)}`}</span>
                          </div>
                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                            <span className={styles.setCont}>{showTime(item.paperTime,"s")}</span>
                          </div>
                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>{formatMessage(messages.grade)}：</span>
                            <span className={styles.setCont}>{MatchUnitType(item)}</span>
                          </div>
                          <div>
                            <span className={styles.setTit}>{formatMessage(messages.paperTemplate)}：</span>
                            <span className={styles.setCont}>{item.templateName}</span>
                          </div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        )
    }
}

export default PaperDetail;
