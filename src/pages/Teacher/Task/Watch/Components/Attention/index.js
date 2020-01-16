import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

class Attention extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    };
  }

  componentDidMount() {}

  onHandleCancel = () => {
    const { props } = this;
    this.setState({
      visible: false,
    });
    props.onClose();
  };

  onHandleOK = () => {
    const { props } = this;
    this.setState(
      {
        visible: false,
      },
      () => {
        setTimeout(() => {
          props.callback();
          props.onClose();
        }, 50);
      }
    );
  };

  render() {
    const { dataSource } = this.props;
    const { students } = dataSource;
    const waitStudent = students.filter(vo => vo.monitoringStatus === 'MS_6').length;
    const noStudent = students.filter(vo => vo.monitoringStatus !== 'MS_6').length;
    console.log(noStudent, waitStudent);
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title={formatMessage({ id: 'task.title.Candidates', defaultMessage: '考生情况' })}
        width={500}
        maskClosable={false}
        cancelText={formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' })}
        okText={formatMessage({ id: 'task.button.Starttheexam', defaultMessage: '开始考试' })}
        okButtonProps={{ disabled: waitStudent === 0 }}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose
        className={styles.attention}
      >
        <div>
          {noStudent !== 0 && (
            <p className={styles.warning}>
              <span>!</span>
              {waitStudent === 0
                ? formatMessage({
                    id: 'task.text.noCandidatesAtPresent',
                    defaultMessage: '目前暂无考生准备就绪，无法开始考试！',
                  })
                : `${formatMessage({
                    id: 'task.text.Also',
                    defaultMessage: '还有',
                  })}${noStudent}${formatMessage({
                    id: 'task.text.Therearenocandidatesatpresent',
                    defaultMessage: '名学生未准备就绪，是否开始考试？',
                  })}`}
            </p>
          )}
          <div className={styles.warnList}>
            <div>
              {formatMessage({ id: 'task.text.ThisExam', defaultMessage: '本场考试' })}
              <span>{students.length}</span>
            </div>
            <div>
              {formatMessage({ id: 'task.title.tabwaitstart', defaultMessage: '等待开始' })}
              <span>{waitStudent}</span>
            </div>
            <div>
              {formatMessage({ id: 'task.title.tabnostart', defaultMessage: '未准备就绪' })}
              <span>{noStudent}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default Attention;
