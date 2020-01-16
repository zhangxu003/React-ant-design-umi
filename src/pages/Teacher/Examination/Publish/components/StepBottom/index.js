/**
 * 创建任务底部按钮
 *  @Author: tina.zhang
 */
import React, { PureComponent } from 'react';


export default class StepBottom extends PureComponent {


  render() {
    const {prev,next,prevText,nextText,disabled,nextStyle} = this.props;
    return (
      <div className="lastFormSubmit">
        {prevText&&
        <div className="pre" onClick={()=>{prev()}}>
          {prevText}
        </div>}
        <div className={disabled?"next disabled":"next"} style={nextStyle} onClick={()=>{if(!disabled){next()}}}>
          {nextText}
        </div>
      </div>
    );
  }
}
