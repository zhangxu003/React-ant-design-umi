import React, { Component } from 'react';
import { Modal,Table,Tooltip } from 'antd';
import { formatMessage} from 'umi/locale';
import styles from './index.less';

class NewAdd extends Component {

  componentDidMount() {}

  render() {
    const {data,visible,EXAMFLAG,hideModalNew} = this.props   
    console.log(visible)
    const columns = [
        {
          title: formatMessage({id:"task.title.sutdent.code",defaultMessage:"考号"}),
          dataIndex: 'examNo',
          key: 'examNo',
          width:'22%',
          render:(text)=>(<div className={styles.examNoWidth}><Tooltip title={text}>{text}</Tooltip></div>)   
        },
        {
          title: formatMessage({id:"task.title.name",defaultMessage:"姓名"}),
          dataIndex: 'studentName',
          key: 'studentName',
          width:'15%',
          render:(text)=>(<div className={styles.examNameWidth}><Tooltip title={text}>{text}</Tooltip></div>)   
        },
        {
          title: formatMessage({id:"task.title.classes",defaultMessage:"班级"}),
          dataIndex: 'className',
          key: 'className',
          width:'18%'
        },
        {
            title: formatMessage({id:"task.text.come.resource",defaultMessage:"来源"}),
            width:'23%',
            render:text=>(text.examFlag==='APPLY'?'--':text.examSource||'--')   
          },         
          {
            title: formatMessage({id:"task.text.new.add.type",defaultMessage:"类型"}),
            dataIndex: 'examFlag',
            key: 'examFlag',
            width:'12%',
            render:(text)=>(text.split(',').length>1?EXAMFLAG.find(vo=>vo.code==='MAKE_UP_EXAM')&&EXAMFLAG.find(vo=>vo.code==='MAKE_UP_EXAM').value:EXAMFLAG.find(vo=>vo.code===text)&&EXAMFLAG.find(vo=>vo.code===text).value)            
          },
          {
            title: formatMessage({id:"task.text.new.add.markup",defaultMessage:"备注"}),
            dataIndex: 'makeUpCount',
            key: 'makeUpCount',
            render:(text)=>(text?`${text}次`:'') 
          },
      ];

    
    return (
      <Modal
        visible={visible}
        centered
        title={formatMessage({id:"task.text.add.new.student.info",defaultMessage:"新增考生通知"})}
        width={880}
        closable={false}      
        okText={formatMessage({id:"task.text.add.new.student.know",defaultMessage:"我知道了"})}
        onOk={hideModalNew}
        className={styles.addNew}
      >
        <div className={styles.infomation}>
          <p className={styles.tips}>{formatMessage({id:"task.text.teacher.task.watch.newadd.foundThatTheFollowingCandidatesInThisBatchvenueForTheExam",defaultMessage:"发现有以下考生在本批次/考场进行考试"})}</p>
          <Table dataSource={data} columns={columns} pagination={false} bordered scroll={{ y: 400 }} />
        </div>
      </Modal>
    );
  }
}

export default NewAdd;
