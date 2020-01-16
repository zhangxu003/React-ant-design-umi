import React, { Component } from 'react';
import { Modal, List } from 'antd';
import IconTips from '@/components/IconTips';
import './index.less';

class StudentListModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      students: [],
    };
  }

  componentDidMount() {
    const { students } = this.props;
    this.setState({ students: JSON.parse(JSON.stringify(students)) });
  }

  onHandleCancel = () => {
    const { onClose } = this.props;
    onClose();
  };

  onHandleOK = () => {
    const { onClose, update } = this.props;
    const { students } = this.state;
    update(true, students);
    onClose();
  };

  StudentData = item => {
    const { students } = this.state;
    if (item.status) {
      if (item.status === 'Y') {
        // eslint-disable-next-line no-param-reassign
        item.status = 'N';
      } else {
        // eslint-disable-next-line no-param-reassign
        item.status = 'Y';
      }
    } else {
      // eslint-disable-next-line no-param-reassign
      item.status = 'N';
    }

    const newList = JSON.parse(JSON.stringify(students));
    this.setState({ students: newList });
  };

  render() {
    const { visible, classTitle } = this.props;
    const { students } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title={classTitle}
        closable={false}
        cancelText="取消"
        okText="确定"
        onCancel={this.onHandleCancel}
        destroyOnClose
        onOk={this.onHandleOK}
        className="TestStudentModal"
      >
        <div className="infoTips" style={{ paddingTop: '0px' }} />
        <List
          grid={{
            gutter: 16,
            xs: 4,
            sm: 4,
            md: 4,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          className="StudentSetList"
          dataSource={students}
          renderItem={item => (
            <List.Item>
              <div
                className={item.status === 'N' ? 'item underLine' : 'item'}
                onClick={() => {
                  this.StudentData(item);
                }}
              >
                <div>{item.studentClassCode}</div>
                <div className="studentName">{item.studentName}</div>
                {/* {item.gender === 'FEMALE' ? (
                  <i className="iconfont icon-sex-lady lady" />
                ) : (
                  <i className="iconfont icon-sex-man sexman" />
                )} */}
                {item.isTransient === 'Y' ? <span className="isTransienttag">借读</span> : null}
              </div>
            </List.Item>
          )}
        />
        <div className="infoTips">
          <IconTips text="" iconName="icon-info" />
          点击学生姓名可取消选择
        </div>
      </Modal>
    );
  }
}
export default StudentListModal;
