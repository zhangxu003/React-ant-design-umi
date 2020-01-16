import React, { Component } from 'react';
import { Divider, Button } from 'antd';
import { formatMessage} from 'umi/locale';
import cs from "classnames";
import { connect } from "dva";
import { formatDate } from "@/utils/utils";
import OutlineLabel from './OutlineLabel';
import styles from './index.less';
import titleLineBg from "./assets/title_line_bg.png";

@connect(( {task} )=>{
  const { taskInfo, copyStudents:students } = task;
  const { startTime, endTime=0 } = taskInfo;
  const totalTime = endTime>startTime?(endTime - startTime):0;
  const diffTime  = Math.ceil(totalTime/(60*1000));
  // 考试成功
  const taskSuccess = students.filter(item=>item.examStatus==="ES_4");
  // 考试失败
  const taskFail = students.filter(item=>item.examStatus==="ES_3");

  return {
    beginTime   : formatDate("yyyy-MM-dd hh:mm",startTime),    // 开始时间
    endTime     : formatDate("yyyy-MM-dd hh:mm",endTime),      // 结束时间
    totalTime   : diffTime,                                    // 共计时长
    taskCount   : students.length || 0,                        // 设备总数
    taskSuccess : taskSuccess.length || 0,                     // 考试成功
    taskFail    : taskFail.length || 0                         // 考试失败
  };
})
class OutlineReport extends Component {

  render() {
    const { beginTime, endTime, totalTime, taskCount, taskSuccess, taskFail, toggleReport } = this.props;

    // 生成图片所需的数据结构
    const recordData = [                                            // 录音音量的数据统计
      {
        type  : 'taskSuccess',
        value : taskSuccess,
        name  : formatMessage({id:"task.text.normal",defaultMessage:"正常"}),
        color : "rgba(3,196,107,1)",
        shadowColor : "rgba(3, 196, 107, 0.5)"
      },
      {
        type  : 'taskFail',
        value : taskFail,
        name  : formatMessage({id:"task.title.abnormal",defaultMessage:"异常"}),
        color : "rgba(255,110,74,1)",
        shadowColor : "rgba(255, 110, 74, 0.5)"
      },
    ];


    return (
      <div className={styles.outline}>

        <div className={styles.title} style={{backgroundImage:`url(${titleLineBg})`}}>
          {formatMessage({id:"task.title.classroom.device.check.report",defaultMessage:"考场设备检测报告"})}
        </div>

        <div className={styles.chart}>
          {
            taskCount === 0 ? (
              <div className={styles.empty}>
                <div className={cs("iconfont","icon-computer",styles["empty-icon"])} />
                <div className={styles["empty-msg"]}>
                  {formatMessage({id:"task.text.classroom.device.number.is.zero",defaultMessage:"本次考场设备检测数为0"})}
                </div>
              </div>
            ) : (
              <OutlineLabel
                className={styles['error-img']}
                data={recordData}
                onPlotClick={this.recordPlotClick}
                padding={[20,0,20,0]}
                layout="vertical"
              />
            )
          }
        </div>

        <div className={styles.nums}>
          <div>
            <div className={cs(styles.num)}>{taskCount}</div>
            <div>{formatMessage({id:"task.text.device.total",defaultMessage:"设备总数"})}</div>
          </div>
          <Divider className={styles.divider} type="vertical" />
          <div>
            <div className={cs(styles.num,styles['color-success'])}>{taskSuccess}</div>
            <div>{formatMessage({id:"task.text.normal",defaultMessage:"正常"})}</div>
          </div>
          <Divider className={styles.divider} type="vertical" />
          <div>
            <div className={cs(styles.num,styles['color-error'])}>{taskFail}</div>
            <div>{formatMessage({id:"task.title.abnormal",defaultMessage:"异常"})}</div>
          </div>
        </div>

        <div className={styles.notice}>
          <span>
            {formatMessage({id:"task.text.begin.time.to.end.time",defaultMessage:"时间：{beginTime} 至 {endTime}"},{"beginTime":beginTime,"endTime":endTime})}
          </span>
          <br />
          <span>
            {formatMessage({id:"task.text.record.total.time",defaultMessage:"总计时长：{totalTime}分钟"},{"totalTime":totalTime})}
          </span>
        </div>

        <Button className={styles["into-detail"]} onClick={toggleReport}>
          {formatMessage({id:"task.button.detail.report",defaultMessage:"报告详情"})}
        </Button>

      </div>
    );
  }
}
export default OutlineReport;
