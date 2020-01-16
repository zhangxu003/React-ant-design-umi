/*
 * @Author: tina.zhang
 * @Date: 2018-12-28 17:29:51
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2018-12-28 17:41:19
 * @Description: 带上自定义图标的按钮
 */

import React, { PureComponent } from 'react';
import { Button } from "antd";
import cs from "classnames";
import styles from "./index.less";

class FontButton extends PureComponent {

  render() {
    const { children, fontIcon, loading, ...params } = this.props;
    let fontIconTpl = null;
    if( loading ){
      fontIconTpl = <span className={cs('iconfont',styles.iconfont,"icon-loading",styles["icon-loading"])} />;
    }else if( fontIcon ){
      fontIconTpl = <span className={cs('iconfont',styles.iconfont,fontIcon)} />
    }
    return (
      <Button {...params}>
        {fontIconTpl}
        {children}
      </Button>
    );
  }
}
export default FontButton;
