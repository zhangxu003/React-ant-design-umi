import React, { Component } from 'react';
import { Tooltip } from 'antd';
class IconTips extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { text, iconName, onClick } = this.props;
    return (
      <Tooltip placement="top" title={text}>
        <i className={'iconfont ' + iconName} onClick={onClick} />
      </Tooltip>
    );
  }
}
export default IconTips;
