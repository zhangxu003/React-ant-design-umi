/*
 * @Author: tina.zhang
 * @Date: 2019-01-05 11:46:40
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-02-26 16:00:42
 * @Description: 学生机--设备检测页面
 * 根据不同的任务类型，选择不同的组件
 * 测试 ：exam   （ 暂时无 ）
 * 练习 ：practice
 */
import React, { PureComponent } from "react";
import DownLoadPaper from "./DownLoadPaper";
import ResultPaper from "./ResultPaper";


export default class TaskCheck extends PureComponent {

  render() {
    const { match } = this.props;
    let { taskType } = match.params;
    taskType = taskType === "result" ? "result" : "practice";

    return taskType === "result" ? <ResultPaper  /> : <DownLoadPaper />;
  }
}
