/*
 * @Author: tina
 * @Date: 2019-02-26 09:13:40
 * @LastEditors: tina
 * @LastEditTime: 2019-02-26 19:44:37
 * @Description: 学生机--练习试卷下载
 * 根据试卷列表选择不同的试卷
 * 练习 ：practice
 */
import React, { PureComponent } from "react";
import { List } from 'antd';
import { connect } from "dva";
import { formatMessage } from "umi/locale";
import styles from "./index.less";
import { sendMS } from '@/utils/instructions';
import competeIcon from '@/assets/tast_done_icon.png';
import PaperCard from '@/frontlib/components/ExampaperProduct/Components/ResultExamModal/Card';
import { completionInstanceList } from '@/frontlib/utils/utils';

const instructions = require('@/utils/instructions');

const paperData = {};

@connect(({ student }) => {
  const { paperList } = student;
  return { paperList }
})
class ResultPaper extends PureComponent {

  state = {
    currentPage: 1, // /当前页
  };

  // 下一页
  nextPage = (count) => {
    const { currentPage } = this.state;
    console.log(count)
    if (currentPage < count + 1 && count !== 1) {
      const current = currentPage + 1
      this.setState({
        currentPage: current
      })
    }
  }

  // 上一页
  prePage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      const current = currentPage - 1
      this.setState({
        currentPage: current
      })
    }
  }

  /**
   * 下载试卷反馈
   * @param    {[type]}                 status    状态
   * @param    {String}                 taskId    任务ID
   * @param    {String}                 paperName 学生机IP，可选
   * @param    {String}                 paperId   试卷ID
   * @return   {[type]}                           [description]
   */
  sendMessage=(status, taskId = '', paperName = '', paperId = '')=>{
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    const body = {
      taskId, // 任务ID
      ipAddr: studentIpAddress, // 学生机IP，可选
      paperId, // 试卷ID
      paperName, // 试卷名称
      answerCount: (paperData && paperData.paperInstance && paperData.paperInstance.length) || 0,
      instanceList: completionInstanceList(paperData), 
      status,
    };
    // console.log("body",body)
    sendMS('paper:down', body); // 下载试卷反馈
  }

  render() {
    const { paperList } = this.props
    const pageWidth = Math.ceil(paperList.length)
    const pageCount = Math.ceil(paperList.length / 3)
    const { currentPage } = this.state;
    const arr = []
    for (let i = 1; i < pageCount + 1; i++) {
      arr.push(i)
    }
    const pageStyle = {
      width: pageWidth < 3 ? "800px" : `${pageWidth * 264}px`,
      left: `-${(currentPage - 1) * 800}px`,
      transition: "left 0.5s ease 0.1s"
    };

    const newPaperList = paperList.filter(item=>item.packageResult);
    console.log("newPaperList", newPaperList)

    return (
      <div className="paperList">
        <div style={{ textAlign: 'center' }}>
          <img src={competeIcon} alt="logo" style={{width: "140px",marginTop: "44px"}} />
          <div className={styles.completeText}>{formatMessage({id:"task.text.finish.practice",defaultMessage:"练习完成"})}</div>
          <div className={styles.loadingText}>
            {formatMessage({id:"task.text.keep.quiet.wait.order",defaultMessage:"请保持安静，等待指令"})}
          </div>
        </div>
        <div className="paperTitle" style={{marginBottom:'10px'}}>
          {formatMessage({id:"task.title.has,practice.paper",defaultMessage:"已练习试卷"})}
        </div>
        <div className="downList">
          <div className="iconfont icon-link-arrow-left" style={currentPage===1?{color:"#dcdcdc",pointerEvents:"none"}:{color:"#333"}} onClick={this.prePage} />
          <div
            className="iconfont icon-link-arrow"
            style={pageCount!=="1"&&currentPage===pageCount?{color:"#dcdcdc",pointerEvents:"none"}:{color:"#333"}}
            onClick={()=>{
              if(arr.length <= currentPage){
                return
              }
              this.nextPage(pageCount)
            }}
          />
          <div className="pageNumber">
            <List
              dataSource={newPaperList}
              style={pageStyle}
              renderItem={item => (
                <List.Item>
                  <PaperCard item={item} instructions={instructions} />
                </List.Item>
              )}
            />
          </div>
          <div className="dots">
            {
              arr.map((item)=>{
                if(item === currentPage) {
                  return <span className="checking-process" key={item} />
                }
                return <span key={item} />
              })
            }
          </div>
        </div>
      </div>
    );
  }
}


export default ResultPaper;
