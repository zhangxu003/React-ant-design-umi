
import React, { PureComponent } from "react";
import { formatMessage } from "umi/locale";
import styles from "../index.less";
import SecretKeyModal from '@/frontlib/components/ExampaperAttempt/Components/SecretKeyModal/api';
import { message } from 'antd';
import IconTips from '@/frontlib/components/IconTips';
import showExampaperReport from '@/frontlib/components/ExampaperReport/api';
import { showTime } from "@/utils/timeHandle";



export default class Card extends PureComponent {


  /**
   * 将时间 s 转换成  ××分××秒格式
   */
  formatSeconds=(value)=>showTime(value,"s")

  goToReport=(item)=>{
    localStorage.setItem('report_paperMd5',item.paperMd5);
    showExampaperReport({
      dataSource: {
        paperData:item.paperData,
        showData:item.showData,
        allTime:item.finishTime,
      },
      callback: () => {
        localStorage.removeItem('report_paperMd5');

      },
    })
  }

  renderFooter=(data)=>{
      const instructions = require('@/utils/instructions');
      if(data.packageResult){
        const type = data.packageResult.result;
        switch(type){
          case 1: // 上传成功
            return (
              <div className={styles.footer}>
                <div>
                  <span className={styles.normal}>
                    {formatMessage({id:"task.title.answer.package",defaultMessage:"答案包："})}
                  </span>
                  <span className={styles.green}>
                    {formatMessage({id:"task.text.normal",defaultMessage:"正常"})}
                  </span>
                </div>
                <div>
                  <IconTips
                    iconName="icon-file"
                    text={formatMessage({id:"task.button.detail",defaultMessage:"详情"})}
                    onClick={()=>this.goToReport(data)}
                  />
                </div>
              </div>
            );
          case 2:// 打包失败
            return  (
              <div className={styles.footer}>
                <div>
                  <span className={styles.normal}>
                    {formatMessage({id:"task.title.answer.package",defaultMessage:"答案包："})}
                  </span>
                  <span className={styles.warning}>
                    {formatMessage({id:"task.text.packing.failed",defaultMessage:"打包失败"})}
                  </span>
                </div>
                <div>
                  <IconTips
                    iconName="icon-file"
                    text={formatMessage({id:"task.button.detail",defaultMessage:"详情"})}
                    onClick={()=>this.goToReport(data)}
                  />
                </div>
              </div>
            )
          case 3: // 上传失败
            return (
              <div className={styles.footer}>
                <div>
                  <span className={styles.normal}>
                    {formatMessage({id:"task.title.answer.package",defaultMessage:"答案包："})}
                  </span>
                  <span className={styles.warning}>
                    {formatMessage({id:"task.text.upload.failed",defaultMessage:"上传失败"})}
                  </span>
                </div>
                <div style={{display:'flex'}}>
                  <IconTips
                    iconName="icon-upload"
                    text={formatMessage({id:"task.text.export",defaultMessage:"导出"})}
                    onClick={()=>{
                      SecretKeyModal({
                        dataSource: instructions,
                        item:data,
                        callback: () => {
                          message.success(formatMessage({id:"task.message.export.success",defaultMessage:"导出成功！"}));
                          // this.exportBack(tag);
                        },
                      });
                    }}
                  />
                  <div style={{width:20,height:20}} />
                  <IconTips
                    iconName="icon-file"
                    text={formatMessage({id:"task.button.detail",defaultMessage:"详情"})}
                    onClick={()=>this.goToReport(data)}
                  />
                </div>
              </div>
            )
          default : return null;
        }
      }
      return null;
  }

  render() {
    const { item } = this.props;
    let cardstyle = styles.card;
    if(item.packageResult.result == 3){
      cardstyle = styles.card_red;
    }
    return (
      <div className={cardstyle}>
        <div className={styles.card_title}>{item.name}</div>
        <div className={styles.main}>
          <div>
            <span className={styles.normal}>{formatMessage({id:"task.title.use.time",defaultMessage:"用时"})}</span>
            <span className={styles.black}>&nbsp;{this.formatSeconds(item.finishTime)}</span>
          </div>
          <div />
        </div>
        {this.renderFooter(item)}
      </div>
    );
  }
}
