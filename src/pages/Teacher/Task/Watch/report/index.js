/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 一键检测报告--主要用于切换 概要报告 和 详细报告
 * @Date: 2019-03-05 09:46:27
 * @LastEditTime: 2019-04-12 18:54:41
 */
import React, { Component } from 'react';
import { connect } from "dva";
import { Icon } from "antd";
import DetailReport from "./DetailReport";
import OutlineReport from "./OutlineReport";
import styles from './index.less';

@connect(()=>({}))
class Report extends Component {

  state = {
    reportType : "outline" // 报告的模式  outline : 概要模式； detail : 详细报告模式
  }

  componentDidMount(){
    // 默认任务只要打开了一键检测报告的话，就是任务结束
    const {dispatch} = this.props;
    // 保存结束考试时的时间戳
    dispatch({
      type: 'task/saveEndTime',
      payload: {
          endTime: Date.now()
      }
    });

    // 固化监考数据
    dispatch({ type: 'task/copyTaskWathData' });
  }

  /**
   * @description: 切换到报告的模式
   * @param {type}
   * @return:
   */
  toggleReportType = ()=>{
    const {reportType} = this.state;
    this.setState({
      reportType : reportType === "outline"?"detail":"outline"
    });
  }

  render() {
    const { onClose } = this.props;
    const { reportType } = this.state;
    return (
      <div className={styles.report}>
        <div className={styles.close} onClick={onClose}>
          { reportType === "outline" && <Icon type="close" /> }
        </div>
        { reportType === "outline" ?
          <OutlineReport toggleReport={this.toggleReportType} /> :
          <DetailReport toggleReport={this.toggleReportType}  /> }
      </div>
    );
  }
}
export default Report;
