import React, { Component } from 'react';
import './index.less';
import { Button } from 'antd';

/**
 * 带图标的按钮组件
 * onClick 	点击事件
 * text 	按钮文字
 * iconName 图标
 *
 *  @Author: tina.zhang
 */
class IconButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { iconName, onClick, text, style, className, type ,isNotext } = this.props;
    if (type == 'button') {
      return (
        <div className={'button '+className} onClick={onClick} style={style}>
          <i className={'iconfont ' + iconName} />
          {isNotext ? null :<span className="icontext">{text}</span>}
        </div>
      );
    } else {
      return (
        <div className={'icon-btn '+className} onClick={onClick} style={style}>
          <i className={'iconfont ' + iconName} />
          <span className="icontext">{text}</span>
        </div>
      );
    }
  }
}

export default IconButton;
