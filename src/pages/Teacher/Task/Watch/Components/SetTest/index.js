import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage} from 'umi/locale';
import {queryDistribution} from '@/services/teacher';
import styles from './index.less';

class SetTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      values:'',
      distribution:'',
      strategy:''
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    const distributeType=dataSource.distributeType.split(',')
    const examType=dataSource.examType.split(',');
    let dist = '';
    let exam = ''
    queryDistribution({codeType:'DIST_TYPE'}).then((res)=>{
      res.data.forEach((item)=>{
        distributeType.forEach((vo,index)=>{
          if(item.code===vo) {
            if(index===distributeType.length-1) {
              dist+=item.value
            }
            else{
              dist+=item.value.concat(',')
            }
            

          }
        })
      })
      this.setState({
        distribution:dist
      })

    })
    queryDistribution({codeType:'EXAM_TYPE'}).then((res)=>{
      res.data.forEach((item)=>{
        examType.forEach((vo,index)=>{
          if(item.code===vo) {
            if(index===examType.length-1){
              exam+=item.value
            }
            else {
              exam+=item.value.concat(',')
            }
            
            console.log(item.value)
          }
        })
      })
      this.setState({
        strategy:exam
      })

    })

    console.log(distributeType)
    console.log(examType)
  }

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
    const {distribution,strategy,visible} = this.state
    return (
      <Modal
        visible={visible}
        centered="true"
        title={formatMessage({id:"task.text.ExaminationSettingsInformation",defaultMessage:"考试设置信息"})}
        closable={false}
        width={501}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={formatMessage({id:"task.button.close",defaultMessage:"关闭"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose="true"
        className="setTestInfo"
      >
        <div>
          <div className={styles.seat}>
            <span>{formatMessage({id:"task.text.distributeExaminationPapers",defaultMessage:"分发试卷方式"})}</span>{distribution}
          </div>
          <div className={styles.seat}>
            <span>{formatMessage({id:"task.text.ExaminationStrategy",defaultMessage:"考试策略"})||formatMessage({id:"task.text.no",defaultMessage:"无"})}</span> {strategy}
          </div>
        </div>

      </Modal>
    );
  }
}

export default SetTest;
