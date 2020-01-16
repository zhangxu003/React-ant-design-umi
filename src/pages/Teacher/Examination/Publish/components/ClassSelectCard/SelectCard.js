/**
 * 选择班级卡片
 *  @Author: tina.zhang
 */
import React, { PureComponent } from 'react';
import { Checkbox, Divider } from 'antd';

import styles from './index.less';

export default class SelectCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { checked, dataSource, choosedNum, total, update, showModal } = this.props;

    const teacherId = localStorage.getItem('teacherId');
    const teacherName = teacherId === dataSource.teacherId ? '我' : dataSource.teacherName;

    return (
      <div className={checked ? 'classCard_checked' : 'classCard'}>
        <div className="cardflex cardbetween">
          <div className="class">{dataSource.className || dataSource.name}</div>
          <Checkbox
            className={styles.checkbox}
            checked={checked}
            disabled={total === 0}
            onChange={e => {
              dataSource.isChoosed = e.target.checked;
              update(e.target.checked);
            }}
          />
        </div>
        <div className="cardflex">
          <div
            className={styles.teacherName}
            title={teacherName && teacherName.length > 4 ? teacherName : ''}
          >
            教师：{teacherName}
          </div>
          <Divider type="vertical" />
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              showModal(dataSource);
            }}
          >
            <span>已选:</span>
            <span>
              {choosedNum}/{total}名学生
            </span>
            <i className="iconfont icon-link-arrow-down" />
          </div>
        </div>
      </div>
    );
  }
}
