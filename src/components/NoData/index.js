import React, { Component } from 'react';
import './index.less';
import {Spin} from 'antd';
class NoData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="noData">       
        {this.props.onLoad&&<Spin size="large" />}
        {!this.props.onLoad&&<img src={this.props.noneIcon} />}
        <p>{this.props.tip}</p>
      </div>
    );
  }
}

export default NoData;
