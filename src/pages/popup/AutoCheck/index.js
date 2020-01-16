/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 一键检测环境测试弹框
 * @Date: 2019-02-20 14:22:33
 * @LastEditTime: 2019-02-20 16:12:25
 */

import React, { Component } from 'react';
import { connect } from "dva";
import cs from "classnames";
import { formatMessage } from "umi/locale";
import styles from './index.less';

@connect(( {popup} )=>{
  const { data } = popup.autoCheck;
  return { data };
})
class AutoCheck extends Component {

  componentDidMount(){
    const {modal} = this.props;
    modal.update({
      wrapClassName : styles.downloading,
    });
  }

  render() {
    const { data } = this.props;
    let msg = "";
    if( data === "downloading" ){
      msg = formatMessage({id:"task.message.download.newset.test.package",defaultMessage:"下载最新的测试包...请耐心等待"});
    }else{
      msg = formatMessage({id:"task.message.setting.env.config",defaultMessage:"正在配置检测环境...请耐心等待"});
    }

    return (
      <>
        <span className={cs('iconfont','icon-loading',styles['icon-loading'])} />
        <div className={styles['loading-info']}>{msg}</div>
      </>
    );
  }
}

export default AutoCheck;
