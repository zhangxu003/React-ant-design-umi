import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage} from 'umi/locale';
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
    const {props} = this;
    this.setState({
      visible: false,
    });
    props.onClose();
  };

  onHandleOK = () => {
    const {props} = this;
    this.setState({
      visible: false,
    });
    props.callback()
    props.onClose();
  };


  render() {  
    const { dataSource } = this.props;
    const students = dataSource.students.filter(vo=>vo.monitoringId!=='')
    const waitStudent = students.filter(vo=>vo.monitoringStatus==='MS_8').length;  
    const noStudent = students.filter(vo=>(vo.monitoringStatus==='MS_14'||vo.monitoringStatus==='MS_16')).length;  
    const {type} = dataSource
    console.log(noStudent,waitStudent) 
    const {visible} = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title={type==='TT_2'?formatMessage({id:"task.text.PracticeState",defaultMessage:"练习情况"}):formatMessage({id:"task.title.Candidates",defaultMessage:"考生情况"})}
        width={500}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={waitStudent===0?type==='TT_2'&&formatMessage({id:"task.text.endPractice",defaultMessage:"结束练习"})||formatMessage({id:"task.text.endTest",defaultMessage:"结束考试"}):formatMessage({id:"task.text.ForcedTermination",defaultMessage:"强制结束"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose
        className={waitStudent===0?styles.stopTo:styles.attention}
      >
        <div>
          {waitStudent>0&&
          <p className={styles.warning}><span>!</span>
            {waitStudent>0?`${formatMessage({id:"task.text.has",defaultMessage:"有"})}${waitStudent}${formatMessage({id:"task.text.AnsweringAQuestion",defaultMessage:"名学生正在答题中"})}，${type==='TT_2'?formatMessage({id:"task.text.finishTheExercise",defaultMessage:"是否结束练习？"}):formatMessage({id:"task.text.IsTheExamOverend",defaultMessage:"结束考试将导致学生终止答题，考试失败！ 是否结束考试？"})}`:''}
          </p>
         }
          <div className={styles.warnList}>
            {type==='TT_2'&&<div>{formatMessage({id:"task.title.MS_16_2",defaultMessage:"练习完成"})}<span>{noStudent}</span></div>}
            {type!=='TT_2'&&<div>{formatMessage({id:"task.text.Examinee",defaultMessage:"本场考生"})}<span>{students.length}</span></div>}
            <div>{formatMessage({id:"task.title.tabanswering",defaultMessage:"答题中"})}<span>{waitStudent}</span></div>
            {type!=='TT_2'&&<div>{formatMessage({id:"task.title.paperSucess",defaultMessage:"交卷成功"})}<span>{noStudent}</span></div>}
          </div> 
        </div>
      </Modal>
    );
  }
}

export default Attention;
