import React from 'react';
import { connect } from 'dva';
import { Tag } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import CommandContainer from './CommandContainer';
import styles from './CheckLayout.less';
import bg from '@/assets/landing_page_bg@2x.png';

@connect(({ vbClient, permission }) => ({
  copyRight: vbClient.copyRight,
  subAuthType: permission.copyRight,
  tenantAuthorizeMode: permission.tenantAuthorizeMode,
  role: vbClient.role,
}))
class CheckLayout extends React.PureComponent {
  // 版本的显示
  authTypeRender = () => {
    const { subAuthType, tenantAuthorizeMode } = this.props;
    let color;
    let text;
    if (tenantAuthorizeMode === 'VOL' || subAuthType === 'PROFESSIONAL') {
      color = '#FF852B';
      text = '专业版';
    } else if (subAuthType === 'STANDARD') {
      color = '#959595';
      text = '标准版';
    }

    if (!text) return null;

    return (
      <Tag style={{ marginLeft: '10px', border: 'none', lineHeight: '24px' }} color={color}>
        {text}
      </Tag>
    );
  };

  render() {
    const { children, copyRight, role } = this.props;
    const copyright = (
      <div className={styles.copyright}>
        {copyRight}
        {role === 'teacher' ? this.authTypeRender() : null}
      </div>
    );
    return (
      // @TODO <DocumentTitle title={this.getPageTitle()}>
      <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
        <CommandContainer />
        <div className={styles.children}>{children}</div>
        <GlobalFooter copyright={copyright} />
      </div>
    );
  }
}

export default CheckLayout;
