import React, { PureComponent, Fragment } from 'react';
import NavLink from 'umi/navlink';
import { Divider } from 'antd';

class Private extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <Fragment>
        <h1>新功能的测试与研究：</h1>
        <ul>
          <li>
            <NavLink to="/private/importfile">
              1、测试proxy环境下，试卷所需要预览或显示的图片和音频
            </NavLink>
          </li>
          <li>
            <NavLink to="/private/drawBoard">2、画板功能</NavLink>
          </li>
        </ul>
        <Divider />
        {children}
      </Fragment>
    );
  }
}

export default Private;
