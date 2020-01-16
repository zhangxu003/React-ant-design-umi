/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 添加刻度拖动条的基础功能样式
 * @Date: 2019-02-25 17:32:01
 * @LastEditTime: 2019-04-24 14:51:29
 */
import React, { PureComponent } from 'react';
import { Slider } from 'antd';
import cs from "classnames";
import styles from './index.less';

export default class SacleSilder extends PureComponent {

  onChangeFn =( val )=>{
    const { onChange } = this.props;
    this.change = true;
    if( onChange ){
      onChange(val);
    }
  }

  onAfterChangeFn=(val)=>{
    const { onAfterChange } = this.props;
    // 此操作防止 tooltip 二次触发onAfterChangeFn
    if( this.change && onAfterChange ){
      onAfterChange(val);
      this.change = false;
    }
  }

  render() {
    const {
      style,
      icon,
      className,
      title,
      onChange,
      onAfterChange,
      ...sliderParams
    } = this.props;

    return (
      <div style={style} className={cs(styles.sacle,className)}>
        <div className={styles.title}>
          {icon}
          {title}
        </div>
        <div className={styles.box}>
          <Slider {...sliderParams} onChange={this.onChangeFn} onAfterChange={this.onAfterChangeFn} />
        </div>
      </div>
    );
  }
}
