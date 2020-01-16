import { Icon, Select } from 'antd';
import React, { Component } from 'react';

class RateButton extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { onRateChange } = this.props;
    return (
      <div className="mediatool-rateButton">
        <Select defaultValue="normal" onChange={onRateChange} showArrow={false}>
          <Select.Option value="normal">原速</Select.Option>
          <Select.Option value="slow">较慢</Select.Option>
          <Select.Option value="slower">慢速</Select.Option>
        </Select>
      </div>
    );
  }
}
export default RateButton;
