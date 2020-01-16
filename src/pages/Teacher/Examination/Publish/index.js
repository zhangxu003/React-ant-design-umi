import React, { Component } from 'react';
import { Breadcrumb, Steps, Icon } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';
// eslint-disable-next-line no-unused-vars
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

// eslint-disable-next-line no-unused-vars
const { Step } = Steps;

// eslint-disable-next-line no-unused-vars
const messages = defineMessages({
  class: { id: 'task.examination.publish.class', defaultMessage: '班级' },
  paper: { id: 'task.examination.publish.paper', defaultMessage: '试卷' },
  publish: { id: 'task.examination.publish.publish', defaultMessage: '发布' },
});

@connect(({ dictionary }) => ({
  TASK_TYPE: dictionary.TASK_TYPE || [],
}))
class inspect extends Component {
  componentWillMount() {
    this.getCurrentStep();
  }

  getCurrentStep() {
    const { match } = this.props;
    const { step } = match.params;
    switch (step) {
      case 'configuration':
        return 0;
      case 'selectpaper':
        return 1;
      case 'confirm':
        return 2;
      default:
        return 0;
    }
  }

  render() {
    const { match, TASK_TYPE, children } = this.props;
    const { taskType, step } = match.params;
    const { value } = TASK_TYPE.find(vo => vo.code === taskType) || {};

    // eslint-disable-next-line no-unused-vars
    let stepKey = 0;
    if (step !== 'showTask') {
      stepKey = this.getCurrentStep();
    }

    return (
      <div className="examination">
        <div className="top">
          <Breadcrumb separator=">" className={styles.breadcrumb}>
            <Breadcrumb.Item>
              <Link to="/teacher">
                <Icon type="home" />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/teacher/tasklist/${taskType}`}>{value}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{step === 'showTask' ? '任务详情' : '发布'}</Breadcrumb.Item>
          </Breadcrumb>

          {/* {step !== "showTask"? null :
          <Steps current={stepKey} className={styles.steps}>
            <Step title={formatMessage(messages.class)} />
            <Step title={formatMessage(messages.paper)} />
            <Step title={formatMessage(messages.publish)} />
          </Steps>} */}
        </div>
        {children}
      </div>
    );
  }
}

export default inspect;
