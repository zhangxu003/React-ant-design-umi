import React, { Component } from 'react';
import { Modal, Button,Icon} from 'antd';
import { formatMessage} from 'umi/locale';
import styles from './index.less';
import UploadFile from '../UpLoadFile';

class ExceptionHanding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      values:'',
      id:'',
      duration:0,
      name:'',
      audioUrl:'',
    };
  }

  componentDidMount() {}

  onHandleCancel = () => {
    const {props} = this
    this.setState({
      visible: false,
    });
    props.onClose();
  };

  onHandleOK = () => {
    const {props} = this
    const {values} = this.state;
    this.setState({
      visible: false,
    });
    props.callback(values)
    props.onClose();
  };

  saveAnswers=(e)=>{
    this.setState({
      values: e.target.value,
    });
  }

  render() {
    const {id,audioUrl,duration,name,visible} = this.state;
    return (
      <Modal
        visible={visible}
        centered="true"
        title={formatMessage({id:"task.title.handle.error",defaultMessage:"异常处理"})}
        closable={false}
        width={501}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={formatMessage({id:"task.button.ok",defaultMessage:"确定"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose="true"
      >
        <div className={styles.exceptionHanding}>
          <Button>
            {formatMessage({id:"task.text.receive.answer.pack",defaultMessage:"重新收取答案包"})}
          </Button>
          <p className={styles.warning}>
            <i className="iconfont icon-info-circle" />
            {formatMessage({id:"task.text.receive.answer.pack.failed",defaultMessage:"连续收取失败，请手动导入答案包！"})}
          </p>
          <div className={styles.importAnswer}>
            <div className={styles.childImport}>
              {formatMessage({id:"task.message.import.answer",defaultMessage:"导入答卷包"})}
            </div>
            <UploadFile
              id={id}
              url={audioUrl}
              duration={duration}
              name={name}
              callback={(e)=>{
                this.setState(e)

              }}
            />

          </div>
          <ul>
            <li>
              <span>{formatMessage({id:"task.text.student.exam.state",defaultMessage:"考生状态"})}</span>
              {formatMessage({id:"task.text.exam.practice",defaultMessage:"考试异常"})}
              <Icon className={styles.icon} type="caret-down" theme="filled" color="#888" />
            </li>
            <li>
              <span>{formatMessage({id:"task.text.reason",defaultMessage:"原因"})}</span>
              {formatMessage({id:"task.text.late",defaultMessage:"迟到"})}
              <Icon className={styles.icon} type="caret-down" theme="filled" color="#888" />
            </li>
          </ul>
        </div>
      </Modal>
    );
  }
}

export default ExceptionHanding;
