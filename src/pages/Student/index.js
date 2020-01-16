/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 学生机入口
 * @Date: 2019-03-25 15:27:29
 * @LastEditTime: 2019-03-29 14:06:07
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from "dva";

@connect()
class Student extends PureComponent {

  componentDidMount(){
    const { dispatch } = this.props;
     // 学生启动学生端后--部分锁
    dispatch({
      type    : "vbClient/setKeyLocked",
      payload : "special"
    });
  }

  render(){
    const { children } = this.props;
    return (
      <Fragment>
        {children}
      </Fragment>
    )
  }
}

export default Student;
