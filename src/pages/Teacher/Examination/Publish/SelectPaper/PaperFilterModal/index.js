import React, { Component } from 'react';
import { Modal, List } from 'antd';
import './index.less';
// import { formatMessage } from 'umi/locale';

class PaperFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      grade: props.dataSource.gradeCode,
      years: props.dataSource.yearCode,
      difficulty: props.dataSource.difficultyCode,
      address: props.dataSource.addressCode,
      examtype: props.dataSource.examtypeCode,
    };
  }

  gradeData = name => {
    this.setState({
      grade: name,
    });
  };

  typeData = name => {
    this.setState({
      examtype: name,
    });
  };

  yearsData = name => {
    this.setState({
      years: name,
    });
  };

  difficultyData = name => {
    this.setState({
      difficulty: name,
    });
  };

  addressData = name => {
    this.setState({
      address: name,
    });
  };

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    const { onClose } = this.props;
    onClose();
  };

  onHandleOK = () => {
    this.setState({
      visible: false,
    });
    const { callback, onClose } = this.props;
    const { grade, years, difficulty, address, examtype } = this.state;
    callback(grade, years, difficulty, address, examtype);
    onClose();
  };

  render() {
    const { dataSource } = this.props;
    const { grade, visible, examtype, difficulty, address } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title="试卷筛选"
        closable={false}
        cancelText="取消"
        okText="确定"
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className="PaperFilterModal"
      >
        <div className="labelList">
          <div className="filterLabel">年级</div>
          <div className="gradeList">
            <List
              dataSource={dataSource.grade}
              renderItem={item => (
                <List.Item
                  className={item.grade === grade ? 'selected' : ''}
                  onClick={() => this.gradeData(item.grade)}
                >
                  <span>{item.gradeValue}</span>
                </List.Item>
              )}
            />
          </div>
          <div className="filterLabel">类型</div>
          <div className="gradeList">
            <List
              dataSource={dataSource.type}
              renderItem={item => (
                <List.Item
                  className={item.code === examtype ? 'selected' : ''}
                  onClick={() => this.typeData(item.code)}
                >
                  <span>{item.value}</span>
                </List.Item>
              )}
            />
          </div>
          {/* <div className="filterLabel">
            {formatMessage({ id: 'task.message.year', defaultMessage: '年份' })}
          </div>
          <List
            className="yearsList"
            dataSource={dataSource.years}
            renderItem={item => (
              <List.Item
                className={item.code === years ? 'selected' : ''}
                onClick={() => this.yearsData(item.code)}
              >
                <span>{item.value}</span>
              </List.Item>
            )}
          /> */}
          <div className="filterLabel">难度</div>
          <List
            className="difficultyList"
            dataSource={dataSource.difficulty}
            renderItem={item => (
              <List.Item
                className={item.code === difficulty ? 'selected' : ''}
                onClick={() => this.difficultyData(item.code)}
              >
                <span>{item.value}</span>
              </List.Item>
            )}
          />
          <div className="filterLabel">试卷结构</div>
          <List
            className="addressList"
            dataSource={dataSource.address}
            renderItem={item => (
              <List.Item
                className={item.paperTemplateId === address ? 'selected' : ''}
                onClick={() => this.addressData(item.paperTemplateId)}
              >
                <span>{item.templateName}</span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    );
  }
}
export default PaperFilterModal;
