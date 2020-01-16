import { Pagination } from 'antd';
import React, { PureComponent } from 'react';
import styles from './index.less';

/**
 * 分页器
 *
 *  @Author: tina.zhang
 */
export default class OwnPagination extends PureComponent {

 render() {
	return (<Pagination className={styles.own} {...this.props} />);
 }
}
