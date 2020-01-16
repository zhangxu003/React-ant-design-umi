import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

class RecyleFail extends Component {
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
    props.callback(false);
    props.onClose();
  };

  onHandleOK = () => {
    const { props } = this;
    this.setState({
      visible: false,
    });
    props.callback(true);
    props.onClose();
  };

  render() {
    const { dataSource } = this.props;
    const students = dataSource.students.filter(vo => vo.monitoringId !== '');
    const waitStudent = students.filter(vo => vo.monitoringStatus === 'MS_8');
    const noStudent = students.filter(
      vo => vo.monitoringStatus === 'MS_14' || vo.monitoringStatus === 'MS_16'
    ).length;
    const { type } = dataSource;
    console.log(noStudent, waitStudent);
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title={formatMessage({ id: 'task.text.Tips', defaultMessage: '提示' })}
        width={480}
        maskClosable={false}
        cancelText={formatMessage({ id: 'task.text.ReceiveAgain', defaultMessage: '再次收取' })}
        okText={formatMessage({
          id: 'task.text.AbandonAndCloseTheExam',
          defaultMessage: '放弃并结束考试',
        })}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose
        closable={false}
        className={styles.attention}
      >
        <div>
          {waitStudent.length > 0 && (
            <p className={styles.warning}>
              <span>!</span>
              {type !== 'TT_2'
                ? formatMessage({
                    id: 'task.text.haveNotyetReceivedSuccessful',
                    defaultMessage:
                      '以下学生尚未收取成功，您可以再次收取，或放弃并结束考试。在结束考试后您还可以单个导入！',
                  })
                : formatMessage({
                    id: 'task.text.haveNotyetReceivedSuccessfulFees',
                    defaultMessage:
                      '以下学生尚未收取成功，您可以再次收取，或放弃并结束练习。在结束练习后您还可以单个导入！',
                  })}
            </p>
          )}
          {waitStudent.length === 0 && (
            <p className={styles.warning}>
              <span>!</span>
              {formatMessage({
                id: 'task.message.receivedNoAnswer',
                defaultMessage: '没有收到答卷！',
              })}
            </p>
          )}
          <div className={styles.studentListRecyle}>
            <ul>
              {waitStudent.map(vo => (
                <li>
                  <span>{vo.identifyCode}</span>
                  {vo.userName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    );
  }
}

export default RecyleFail;
