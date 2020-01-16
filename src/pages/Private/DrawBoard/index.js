/**
 * 画板功能测试
 */
import React, { PureComponent } from 'react';
import { Button } from 'antd';
import Draw from './draw';
import styles from './index.less';

class DrawBoard extends PureComponent {
  state = {
    uuiq: 1,
  };

  constructor(props) {
    super(props);
    this.content = React.createRef();
  }

  btn = () => {
    this.content.current.style.height = '100px';
    this.setState({
      uuiq: Date.now(),
    });
  };

  render() {
    const { uuiq } = this.state;
    return (
      <div className={styles.contianer}>
        <Button onClick={this.btn}>测试画板</Button>
        <div className={styles.content}>
          <div className={styles.main} ref={this.content}>
            <Button onClick={this.btn}>测试按钮</Button>
          </div>
        </div>
        <Draw relation={this.content} uuiq={uuiq} />
      </div>
    );
  }
}

export default DrawBoard;
