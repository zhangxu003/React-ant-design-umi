import React, { useState } from 'react';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import constant from '@/frontlib/components/MissionReport/constant';
import iconPro from '@/assets/icon_pro.png';
import styles from './index.less';

// const keys
const { REPORT_TAB_KEY } = constant;

/**
 * 考后报告 切换tab
 * @author tina.zhang
 * @date   2019-07-03
 * @param {function} onChange - tab切换事件
 * @param {function} defaultActiveTabKey - 默认选中tab
 */
function ReportTab(props) {
  const { onChange, defaultActiveTabKey, permission } = props;

  const [activeTabKey, setActiveTabKey] = useState(
    defaultActiveTabKey || REPORT_TAB_KEY.transcript
  );

  // Tab 切换
  const handleLink = key => {
    setActiveTabKey(key);
    if (onChange && typeof onChange === 'function') {
      onChange(key);
    }
  };

  return (
    <div className={styles.reportTabs}>
      <span
        key={REPORT_TAB_KEY.transcript}
        className={classnames(
          styles.tabItem,
          activeTabKey === REPORT_TAB_KEY.transcript ? styles.active : ''
        )}
        onClick={() => {
          handleLink(REPORT_TAB_KEY.transcript);
        }}
      >
        {formatMessage({
          id: 'task.text.exercisereport.reportTab.transcript',
          defaultMessage: '成绩单',
        })}
      </span>
      <span
        key={REPORT_TAB_KEY.paperreport}
        className={classnames(
          styles.tabItem,
          activeTabKey === REPORT_TAB_KEY.paperreport ? styles.active : ''
        )}
        onClick={() => handleLink(REPORT_TAB_KEY.paperreport)}
      >
        {permission && !permission.V_ANSWER_DETAIL && <img src={iconPro} alt="" />}
        {formatMessage({
          id: 'task.text.exercisereport.reportTab.paperreport',
          defaultMessage: '答题详情',
        })}
      </span>
    </div>
  );
}

export default ReportTab;
