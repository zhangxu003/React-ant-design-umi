/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 教师机--一键检测中点击图表弹出的table框
 * @Date: 2019-02-18 17:31:11
 * @LastEditTime: 2019-02-26 10:56:58
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import { connect } from "dva";

// 对数据进行预处理
@connect(({ popup })=>{
  const {title,columns,data} = popup.report.data || {};
  return {title,columns,data};
})
class Report extends Component {

  // 初始化state
  state = {};

  // 更新modal
  componentDidMount(){
    const { modal,title } = this.props;
    modal.update({
      title
    });
  }


  /**
   * render
   */
  render() {
    const {
      columns,
      data
    } = this.props;

    return (
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        pagination={{defaultPageSize:6}}
      />
    );
  }
}
export default Report;
