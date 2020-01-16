import React, { Component } from 'react';
import { connect } from 'dva';
import { Breadcrumb,Icon } from 'antd';
import Link from 'umi/link';
import { formatMessage} from 'umi/locale';
import styles from './index.less';
import TeacherReport from '@/frontlib/components/MissionReport/TeacherReport';


@connect(({ dictionary,vbClient }) => ({
  TASK_TYPE: dictionary.TASK_TYPE||[],
  role:vbClient.role
}))
class Report extends Component {

  constructor(props) {
    super(props);

    const identity = props.role === 'teacher' ? 'ID_TEACHER' : 'ID_STUDENT';
    localStorage.setItem('identityCode',identity);
  }

  state = {}

  componentDidMount() {

  }


  render() {
    const { match,TASK_TYPE } = this.props;
    const { taskType, taskId,stage } = match.params;
    const {value} = TASK_TYPE.find(vo=>vo.code===taskType) || {};
    return (
      <div className={styles.report}>
        <div className={styles.top}>
          <Breadcrumb separator=">" className={styles.breadcrumb}>
            <Breadcrumb.Item>
              <Link to="/teacher">
                <Icon type="home" />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/teacher/tasklist/${taskType}`}>
                {value}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {
                stage === 'score'?
                  formatMessage({id:"task.button.show.score.result",defaultMessage:"评分结果"}):
                  formatMessage({id:"task.button.show.analysis.report",defaultMessage:"分析报告"})
              }
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {/* 报告 */}
        <TeacherReport taskId={taskId} type="exam" />
      </div>
    );
  }
}

export default Report;

