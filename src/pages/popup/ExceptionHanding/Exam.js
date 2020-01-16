
import React, { Component } from 'react';
import { Button, Icon, Select, Spin } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { sendMS } from '@/utils/instructions';
import { delay } from "@/utils/utils";

const { Option } = Select;

@connect(({ popup, task, dictionary }) => {
  const { data: sid, status } = popup.examExceptionHandle || {};
  const { EXAMFAILRESON = [] } = dictionary;
  const { examStatus, ipAddress, connId, respondentsStatus, snapshotId } = task.students.find(item => item.studentId === sid) || {};

  // 人工置失败的，原因：仅显示
  // ES_1	缺考
  // ES_2	作弊
  // ES_3	设备异常
  // ES_4	网络问题
  const taskFailStatus = EXAMFAILRESON.filter(item=>['ES_1','ES_2',"ES_3","ES_4"].includes(item.code));
  return {
    examStatus,         // 考试状态
    ipAddress,          // 学生的ip地址
    respondentsStatus,  // 答卷包状态
    connId,             // socket 标记
    sid,                // 学生id
    status,             // 当期的步骤判断是否是考试中 taskIng
    taskFailStatus,     // 人工置失败的，原因
    snapshotId          // 试卷快照id
  };
})
class ExamExceptionHanding extends Component {

  reGetAnswerPackNum = 0;  // 获取答卷包的次数

  state = {
    monitoringDesc   : undefined,    // 考试异常的原因
    noMatch          : false, // 打入答题包不匹配
  };

  componentDidMount() {
    // 页面挂载成功，可以去修改 modal 的 onOk，和onCancel 事件
    const { modal, examStatus, status } = this.props;
    if (modal) {
      // 根据不同的考试结果显示不同的弹框样式
      if (examStatus === 'ES_4' || status === 'taskIng') {
        // 当期考试状态为考试成功的话
        // 没有导入和回收按钮，有确认取消按钮
        modal.update({
          onOk : this.bindOnOk,
          okText : formatMessage({id:"task.button.confirmBtn",defaultMessage:"确认"}),
          okButtonProps: {
            disabled: true,
          }
        });
      } else {
        // 当期考试状态为考试失败的话
        // 只有导入按钮和再次回收答案包的按钮，没有确认取消按钮
        modal.update({
          footer: null,
          destroyOnClose: true, // 关闭后销毁子元素
        });
      }
    }
  }

  componentWillReceiveProps(nextProp) {
    const { sid, dispatch, modal, respondentsStatus, status } = this.props;

    // 如果初始考试状态为考试失败，当最新的答案吧状态为获取成功时，自动设置考试状态为成功，并且关闭弹框
    if( status !== 'taskIng' && respondentsStatus!==nextProp.respondentsStatus && ["RS_1","RS_5","RS_6"].includes( nextProp.respondentsStatus ) ){
      dispatch({
        type: 'task/updateStudentWatchData',
        payload: {
          studentId: sid,
          accessFlag: "manual", // 手动处理的内容
        },
      });
      // 关闭弹出框
      modal.onCancel();
    }
  }

  componentDidUpdate(_,prevState){
    // 判断原因是否已经选中
    const { modal } = this.props;
    const { monitoringDesc : newVal } = this.state;
    const { monitoringDesc : oldVal } = prevState;
    if( !oldVal && newVal ){
      modal.update({
        okButtonProps: {
          disabled: false,
        }
      });
    }
  }

  /**
   * @description: 确认按钮 将当期异常处理的结果保存到缓存中，便于后期提交
   * @param {type}
   * @return:
   */
  bindOnOk = () => {
    const { monitoringDesc } = this.state;
    const { sid, dispatch, modal, status, connId, ipAddress,examStatus } = this.props;

    // 将该监控数据提交后台并且数据保存到state中
    if (status === 'taskIng') {
      // 更新监控数据
      if(examStatus!=='ES_4') {
        sendMS('manualFaile', { ipAddr: ipAddress }, connId);
      }
      dispatch({
        type: 'task/updateStudentWatchData',
        payload: {
          examStatus : "ES_3",
          monitoringStatus : 'MS_12',
          accessFlag: "manual", // 手动处理的内容
          monitoringDesc,
          studentId: sid,
        },
      });

    } else {
      // 更新监控数据,并提交给后台
      dispatch({
        type: 'task/updateTaskWatchResult',
        payload: {
          examStatus : "ES_3",
          monitoringDesc,
          accessFlag: "manual", // 手动处理的内容
          studentId : sid,
        },
      });
    }
    // 关闭弹出框
    modal.onCancel();
  };

  /**
   * @description: 点击重新收取答案包
   * @param {type}
   * @return:
   */
  reGetAnswerPack = () => {
    this.setState({ noMatch : false });
    const { connId, dispatch, sid } = this.props;
    dispatch({
      type: 'task/updateStudentWatchData',
      payload: {
        studentId: sid,
        respondentsStatus: 'loading',
      },
    });
    sendMS('recycle', {}, connId);
    this.reGetAnswerPackNum += 1;

    // 十秒以后再次进行判断，如果respondentsStatus === "loading" 则改为 RS_2
    setTimeout(() => {
      const { respondentsStatus } = this.props;
      if (respondentsStatus === 'loading') {
        dispatch({
          type: 'task/updateStudentWatchData',
          payload: {
            studentId: sid,
            respondentsStatus: 'RS_2',
          },
        });
      }
    }, 10000);
  };

  /**
   * @description: 导入答案包
   * @param {type}
   * @return:
   */
  importAnswerPack = async () => {
    await this.setState({ noMatch : false });
    await delay(50);
    const { sid, dispatch, snapshotId } = this.props;
    const result = await dispatch({
      type    : 'vbClient/importAnswerPack',
      payload : {
        sid,
        snapshotId
      }
    });
    if( result && result.error === "FileNotMatch" ){
      // 如果是选择的试卷不匹配，则提示 导入的答卷包非当前学生，请选择正确的答卷包
      this.setState({ noMatch : true });
    }
  };

  /**
   * @description: 修改考试异常的原因
   * @param {type}
   * @return:
   */
  changeMonitoringDesc = val => {
    this.setState({ monitoringDesc: val });
  };

  render() {
    const { monitoringDesc, noMatch } = this.state;
    const { respondentsStatus, status, examStatus, taskFailStatus } = this.props;
    let tpl = null;
    if( examStatus === 'ES_4' || status === 'taskIng' ) {
      // 考试成功显示的内容
      tpl = (
        <ul className={styles["exam-list"]}>
          <li className={styles.warn}>
            <i className="iconfont icon-warning" />
            {
              status === "taskIng" ?
                formatMessage({id:"task.text.warn.if.set.exam.failed.will.lose.student.data.in.task",defaultMessage:"标记为考试失败后，考生将终止答题，考生已经产生的考试数据将 丢失！"})
                :
                formatMessage({id:"task.text..warn.if.set.exam.failed.will.lose.student.data.after.task",defaultMessage:"标记为考试失败后，考生已经产生的考试数据将失效！"})
            }
          </li>
          <li>
            <span className={styles.label}>
              {formatMessage({id:"task.text.student.exam.state",defaultMessage:"考生状态"})}
            </span>
            <span className={styles['exam-lose']}>
              {formatMessage({id:"task.text.testFailure",defaultMessage:"考试失败"})}
            </span>
          </li>
          <li>
            <span className={styles.label}>
              {formatMessage({id:"task.text.reason",defaultMessage:"原因"})}
            </span>
            <Select
              className={styles.select}
              value={monitoringDesc}
              placeholder={formatMessage({id:"task.placeholder.please.select",defaultMessage:"请选择"})}
              onSelect={this.changeMonitoringDesc}
              suffixIcon={<Icon className={styles.icon} type="caret-down" theme="filled" color="#888" />}
            >
              {taskFailStatus.map(item=><Option key={item.code} value={item.code}>{item.value}</Option>)}
            </Select>
          </li>
        </ul>
      );
    } else {
      // 考试失败显示的内容
      tpl = (
        <Spin spinning={respondentsStatus === 'loading'} tip={formatMessage({id:"task.message.push.answers",defaultMessage:"答卷包收取中..."})}>
          <>
            <Button className={styles.big} onClick={this.reGetAnswerPack}>
              {formatMessage({id:"task.button.push.paper.again",defaultMessage:"重新交卷"})}
            </Button>
            { ( this.reGetAnswerPackNum > 3 || (this.reGetAnswerPackNum === 3 && respondentsStatus !== 'loading' ) )? (
              <p className={styles.warning}>
                <i className="iconfont icon-warning" />
                {
                  formatMessage({id:"task.text.manual.import.answer",defaultMessage:"已连续三次收取失败，建议手动导入答卷包！"})
                }
              </p>
            ) : null}
            <Button className={styles.big} onClick={this.importAnswerPack}>
              {formatMessage({id:"task.button.import.answer",defaultMessage:"导入答卷包"})}
            </Button>
            { noMatch ? (
              <p className={styles.warning}>
                <i className="iconfont icon-warning" />
                {formatMessage({id:"task.text.answer.package.is.error",defaultMessage:"你导入的答卷包非当前学生，请选择正确的答卷包！"})}
              </p>
            ) : null}
          </>
        </Spin>
      );
    }

    return <div className={styles.exceptionHanding}>{tpl}</div>;
  }
}

export default ExamExceptionHanding;
