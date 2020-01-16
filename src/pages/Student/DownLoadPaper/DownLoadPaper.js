/*
 * @Author: tina
 * @Date: 2019-02-26 09:13:40
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-09 17:39:14
 * @Description: 学生机--练习试卷下载
 * 根据试卷列表选择不同的试卷
 * 练习 ：practice
 */
import React, { PureComponent } from 'react';
import { List, Modal, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import loadingLogo from '@/assets/download.gif';
import { sendMS, storeData } from '@/utils/instructions';
import router from 'umi/router';
import DownLoadCard from './DownLoadCard';
import PaperCard from '@/frontlib/components/ExampaperProduct/Components/ResultExamModal/Card';
import { completionInstanceList } from '@/frontlib/utils/utils';
// let paperData = {};
@connect(({ vbClient, student, loading }) => {
  const { ipAddress } = vbClient;
  const { paperData = {}, paperList, loadPaper, showData = {}, snapshotId, taskId } = student;
  return {
    taskId, // 任务ID
    ipAddress, // 学生机的ip
    paperList,
    loadPaper,
    paperData, // 试卷信息json
    showData, // 试卷展示Json
    snapshotId, // 当前试卷快照
    isLoad: loading.effects['student/downloadPaper'], // 试卷下载中
  };
})
class DownLoadPaper extends PureComponent {
  state = {
    currentPage: 1, // 当前页
    currentPage2: 1, // 当前页
  };

  // 下一页
  nextPage = count => {
    const { currentPage } = this.state;
    if (currentPage < count + 1 && count !== 1) {
      this.setState({
        currentPage: currentPage + 1,
      });
    }
  };

  // 上一页
  prePage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      this.setState({
        currentPage: currentPage - 1,
      });
    }
  };

  // 下一页
  nextPage2 = count => {
    const { currentPage2 } = this.state;
    if (currentPage2 < count + 1 && count !== 1) {
      this.setState({
        currentPage2: currentPage2 + 1,
      });
    }
  };

  // 上一页
  prePage2 = () => {
    const { currentPage2 } = this.state;
    if (currentPage2 > 1) {
      this.setState({
        currentPage2: currentPage2 - 1,
      });
    }
  };

  /**
   * 下载试卷反馈
   * @param    {[type]}                 status    状态
   * @param    {String}                 taskId    任务ID
   * @param    {String}                 paperName 学生机IP，可选
   * @param    {String}                 paperId   试卷ID
   * @return   {[type]}                           [description]
   */
  sendMessage = status => {
    const { ipAddress, paperData, snapshotId, taskId } = this.props;
    const { name, paperInstance = [] } = paperData;
    let studentIpAddress = localStorage.getItem('studentIpAddress');
    if (!studentIpAddress) {
      localStorage.setItem('studentIpAddress', ipAddress);
      studentIpAddress = ipAddress;
    }
    const body = {
      taskId, // 任务ID
      ipAddr: studentIpAddress, // 学生机IP，可选
      paperId: snapshotId, // 试卷ID
      paperName: name, // 试卷名称
      answerCount: paperInstance.length, // 题目数量
      instanceList: completionInstanceList(paperData),
      status,
    };
    sendMS('paper:down', body); // 下载试卷反馈
    if (status === 'MS_7') {
      // 当下载试卷失败，发送paper:down指令后，调用Shell
      storeData({ binessStatus: 'MS_7' });
    } else {
      // 当下载试卷成功，发送paper:down指令后，调用Shell
      storeData({ binessStatus: 'MS_6' });
    }
  };

  // 下载试卷
  setPractice = vo => {
    const { dispatch } = this.props;
    const { paperMd5, snapshotId } = vo;
    // 下载试卷
    dispatch({
      type: 'student/downloadPaper',
      payload: { paperMd5, snapshotId },
    }).then(bealoon => {
      if (bealoon) {
        this.sendMessage(true);
        router.push('/student/exercise');
      } else {
        this.sendMessage('MS_7');
        message.warn(
          formatMessage({
            id: 'task.message.download.paper.failed',
            defaultMessage: '下载试卷失败！',
          })
        );
        dispatch({
          type: 'student/updateDownloadPaper',
          payload: { loadPaper: 'fail' },
        });
      }
    });
  };

  render() {
    const { paperList, isLoad } = this.props;

    const newPaperList = Object.keys(paperList).reduce((current, item) => {
      const data = paperList[item];
      if (data.packageResult === undefined) {
        current.push(data);
      }
      return current;
    }, []);

    const finishedPaperList = Object.keys(paperList).reduce((current, item) => {
      const data = paperList[item];
      if (data.packageResult) {
        current.push(data);
      }
      return current;
    }, []);

    if (finishedPaperList.length === 0) {
      const pageWidth = Math.ceil(paperList.length / 2);
      const pageCount = Math.ceil(paperList.length / 6);
      const { currentPage } = this.state;
      const arr = [];
      for (let i = 1; i < pageCount + 1; i++) {
        arr.push(i);
      }

      let autoWidth = '';
      if (pageWidth < 4) {
        autoWidth = '800px';
      } else if (pageWidth < 5) {
        autoWidth = `${800 + (pageWidth * 2 - 6) * 264}px`;
      } else if (pageWidth < 7) {
        autoWidth = `1600px`;
      } else {
        autoWidth = `${pageWidth * 264}px`;
      }
      const pageStyle = {
        width: autoWidth,
        left: `-${(currentPage - 1) * 800}px`,
        transition: 'left 0.5s ease 0.1s',
      };
      return (
        <div className="paperList">
          <div className="paperTitle">
            {formatMessage({
              id: 'task.title.select.practice.paper',
              defaultMessage: '选择练习试卷',
            })}
          </div>
          <div className="downList" style={{ height: '400px' }}>
            <div
              className="iconfont icon-link-arrow-left"
              style={
                currentPage === 1 ? { color: '#dcdcdc', pointerEvents: 'none' } : { color: '#333' }
              }
              onClick={this.prePage}
            />
            <div
              className="iconfont icon-link-arrow"
              style={
                pageCount !== '1' && currentPage === pageCount
                  ? { color: '#dcdcdc', pointerEvents: 'none' }
                  : { color: '#333' }
              }
              onClick={() => this.nextPage(pageCount)}
            />
            <div className="pageNumber">
              <List
                dataSource={newPaperList}
                style={pageStyle}
                renderItem={item => (
                  <List.Item className="ant-list-item-content">
                    <div className="overDiv">
                      <div
                        className="oper"
                        onClick={() => {
                          this.setPractice(item);
                        }}
                      >
                        <div className="iconfont icon-computer-play" />
                        <div className="practiceTo">
                          {formatMessage({
                            id: 'task.text.entry.practice',
                            defaultMessage: '进入练习',
                          })}
                        </div>
                      </div>
                    </div>
                    <DownLoadCard item={item} />
                  </List.Item>
                )}
              />
            </div>
            <div className="dots">
              {arr.map(item => {
                if (item === currentPage) {
                  return <span className="checking-process" key={item} />;
                }
                return <span key={item} />;
              })}
            </div>
          </div>

          <Modal
            visible={isLoad}
            closable={false}
            width={340}
            height={300}
            className="loadingPaper"
          >
            <div className="loading">
              <div style={{ textAlign: 'center' }}>
                <img src={loadingLogo} alt="logo" />
                <div className="loadingText">
                  {formatMessage({
                    id: 'task.message.wait.for.download.paper',
                    defaultMessage: '正在下载试卷...请耐心等待',
                  })}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      );
    }

    const pageWidth = Math.ceil(newPaperList.length);
    const pageCount = Math.ceil(newPaperList.length / 3);
    const { currentPage, currentPage2 } = this.state;
    const arr = [];
    for (let i = 1; i < pageCount + 1; i++) {
      arr.push(i);
    }
    const pageStyle = {
      width: pageWidth < 3 ? '800px' : `${pageWidth * 264}px`,
      left: `-${(currentPage - 1) * 800}px`,
      transition: 'left 0.5s ease 0.1s',
    };

    const pageWidth2 = Math.ceil(finishedPaperList.length);
    const pageCount2 = Math.ceil(finishedPaperList.length / 3);
    const arr2 = [];
    for (let i = 1; i < pageCount2 + 1; i++) {
      arr2.push(i);
    }
    const pageStyle2 = {
      width: pageWidth2 < 3 ? '800px' : `${pageWidth2 * 264}px`,
      left: `-${(currentPage2 - 1) * 800}px`,
      transition: 'left 0.5s ease 0.1s',
    };
    return (
      <div className="paperList">
        <div className="paperTitle" style={{ marginBottom: '10px' }}>
          {formatMessage({ id: 'task.title.no.practice.paper', defaultMessage: '未练习试卷' })}
        </div>
        <div className="downList" style={{ height: '200px' }}>
          <div
            className="iconfont icon-link-arrow-left"
            style={currentPage === 1 ? { color: '#dcdcdc' } : { color: '#333' }}
            onClick={this.prePage}
          />
          <div
            className="iconfont icon-link-arrow"
            style={
              pageCount !== '1' && currentPage === pageCount
                ? { color: '#dcdcdc' }
                : { color: '#333' }
            }
            onClick={() => {
              if (arr.length <= currentPage) {
                return;
              }
              this.nextPage(pageCount);
            }}
          />
          <div className="pageNumber">
            <List
              dataSource={newPaperList}
              style={pageStyle}
              renderItem={item => (
                <List.Item className="ant-list-item-content">
                  <div className="overDiv">
                    <div
                      className="oper"
                      onClick={() => {
                        this.setPractice(item);
                      }}
                    >
                      <div className="iconfont icon-computer-play" />
                      <div className="practiceTo">
                        {formatMessage({
                          id: 'task.text.entry.practice',
                          defaultMessage: '进入练习',
                        })}
                      </div>
                    </div>
                  </div>
                  <DownLoadCard item={item} />
                </List.Item>
              )}
            />
          </div>
          <div className="dots">
            {arr.map(item => {
              if (item === currentPage) {
                return <span className="checking-process" key={item} />;
              }
              return <span key={item} />;
            })}
          </div>
        </div>
        <div className="paperTitle" style={{ marginBottom: '10px', marginTop: '25px' }}>
          {formatMessage({ id: 'task.title.has,practice.paper', defaultMessage: '已练习试卷' })}
        </div>
        <div className="downList" style={{ height: '250px' }}>
          <div
            className="iconfont icon-link-arrow-left"
            style={currentPage2 === 1 ? { color: '#dcdcdc' } : { color: '#333' }}
            onClick={this.prePage2}
          />
          <div
            className="iconfont icon-link-arrow"
            style={
              pageCount2 !== '1' && currentPage2 === pageCount2
                ? { color: '#dcdcdc' }
                : { color: '#333' }
            }
            onClick={() => {
              if (arr2.length <= currentPage2) {
                return;
              }
              this.nextPage2(pageCount2);
            }}
          />
          <div className="pageNumber">
            <List
              dataSource={finishedPaperList}
              style={pageStyle2}
              renderItem={item => (
                <List.Item className="ant-list-item-content">
                  <PaperCard item={item} index={this} />
                </List.Item>
              )}
            />
          </div>
          <div className="dots">
            {arr2.map(item => {
              if (item === currentPage2) {
                return <span className="checking-process" key={item} />;
              }
              return <span key={item} />;
            })}
          </div>
        </div>
        <Modal visible={isLoad} closable={false} width={340} height={300} className="loadingPaper">
          <div className="loading">
            <div style={{ textAlign: 'center' }}>
              <img src={loadingLogo} alt="logo" />
              <div className="loadingText">
                {formatMessage({
                  id: 'task.message.wait.for.download.paper',
                  defaultMessage: '正在下载试卷...请耐心等待',
                })}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default DownLoadPaper;
