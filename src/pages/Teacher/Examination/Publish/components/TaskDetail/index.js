import React, { Component } from 'react';
import { Table, Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import Modal from '@/components/Modal';
import router from 'umi/router';
import cs from 'classnames';
import styles from './index.less';
import { MatchUnitType } from '@/frontlib/utils/utils';
import TeacherAvatar from '../TeacherAvatar';
import ShowPaper from './ShowPaper/index';
import { showTime } from '@/utils/timeHandle';

const messages = defineMessages({
  backBtnTit: { id: 'task.examination.inspect.task.detail.back.btn.title', defaultMessage: '返回' },
  setting: {
    id: 'task.examination.inspect.task.detail.exam.setting.title',
    defaultMessage: '考试设置',
  },
  teacher: {
    id: 'task.examination.inspect.task.detail.exam.teacher.title',
    defaultMessage: '代课教师',
  },
  examClass: {
    id: 'task.examination.inspect.task.detail.exam.class.title',
    defaultMessage: '考试班级',
  },
  examPaper: {
    id: 'task.examination.inspect.task.detail.exam.paper.title',
    defaultMessage: '考试试卷',
  },
  examClassPractice: {
    id: 'task.examination.inspect.task.detail.exam.class.Practice',
    defaultMessage: '练习班级',
  },
  examPaperPractice: {
    id: 'task.examination.inspect.task.detail.exam.paper.Practice',
    defaultMessage: '练习试卷',
  },
  distModeTit: {
    id: 'task.examination.inspect.task.detail.dist.mode.title',
    defaultMessage: '分发试卷方式：',
  },
  examStrategy: {
    id: 'task.examination.inspect.task.detail.exam.strategy.title',
    defaultMessage: '考试策略：',
  },
  manualRectification: {
    id: 'task.examination.inspect.task.detail.manual.rectification.title',
    defaultMessage: '人工纠偏：',
  },
  checkBtnTit: {
    id: 'task.examination.inspect.task.detail.check.btn.title',
    defaultMessage: '查看参加考试学生',
  },
  checkBtnTitPractice: {
    id: 'task.examination.inspect.task.detail.check.btn.title.practice',
    defaultMessage: '查看参加练习学生',
  },
  checkBtnTit1: {
    id: 'task.examination.inspect.task.detail.check.btn.title1',
    defaultMessage: '收起',
  },
  grade: { id: 'task.grade', defaultMessage: '适用范围' },
  time: { id: 'task.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'task.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'task.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  studentCode: { id: 'task.examination.inspect.task.detail.student.code', defaultMessage: '考号' },
  classNum: { id: 'task.examination.inspect.task.detail.class.number', defaultMessage: '班序' },
  classInCode: {
    id: 'task.examination.inspect.task.detail.class.in.code',
    defaultMessage: '班内学号',
  },
  name: { id: 'task.examination.inspect.task.detail.student.name', defaultMessage: '姓名' },
  gender: { id: 'task.examination.inspect.task.detail.student.gender', defaultMessage: '性别' },
  className: { id: 'task.examination.inspect.task.detail.class.name', defaultMessage: '班级' },
  borrowing: {
    id: 'task.examination.inspect.task.detail.student.borrowing',
    defaultMessage: '是否借读',
  },
  examPersonNum: {
    id: 'task.examination.inspect.task.detail.student.exam.number',
    defaultMessage: '应考人数',
  },
  practivePersonNum: {
    id: 'task.examination.practice.inspect.task.detail.student.exam.number',
    defaultMessage: '应练人数',
  },
  preview: { id: 'task.examination.inspect.task.detail.preview', defaultMessage: '预览' },
  minute: { id: 'task.examination.inspect.paper.minute', defaultMessage: '分钟' },
  mark: { id: 'task.examination.inspect.paper.mark', defaultMessage: '分' },
});

/**
 * 任务详情的显示组件（展示）
 *  @Author: tina.zhang
 * @date 2019-04-18
 * @class ExamTaskDetail
 * @extends {Component}
 */
class TaskDetail extends Component {
  columns = [
    {
      title: (
        <span className={styles.studentCode}>
          {formatMessage(messages.studentCode)}
          <Tooltip
            title={`${formatMessage(messages.classNum)}+${formatMessage(messages.classInCode)}`}
          >
            <i className="iconfont icon-info" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'examNo',
      key: 'examNo',
      width: '17%',
    },
    {
      title: formatMessage(messages.name),
      dataIndex: 'studentName',
      key: 'studentName',
      width: '17%',
      render: item => (
        <div title={item.length > 4 && item} className={styles.studentName}>
          {item}
        </div>
      ),
    },
    // {
    //   title: formatMessage(messages.gender),
    //   dataIndex: 'gender',
    //   key: 'gender',
    //   width: '17%',
    //   render: item => <div>{item === 'MALE' ? '男' : '女'}</div>,
    // },
    {
      title: formatMessage(messages.className),
      dataIndex: 'className',
      key: 'className',
      width: '17%',
      render: item => (
        <div title={item.length > 7 && item} className={styles.studentName}>
          {item}
        </div>
      ),
    },
    {
      title: formatMessage(messages.borrowing),
      dataIndex: 'isTransient',
      key: 'isTransient',
      width: '17%',
      render: item => <div>{item === 'Y' ? '借读' : ''}</div>,
    },
    {
      title: false,
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: item => <div>{item === 'Y' ? '参加' : '不参加'}</div>,
    },
  ];

  state = {
    collapse: true, // 是否收起参考学生列表
  };

  // 返回上一页
  clickBack = () => {
    router.goBack();
  };

  // 查看学生
  checkStudent = () => {
    const { collapse } = this.state;
    this.setState({
      collapse: !collapse,
    });
  };

  // 查看试卷
  showPaper = (paperId, paperType) => {
    window.ExampaperStatus = 'PREVIEW';
    Modal.info({
      width: 950,
      centered: true,
      className: styles.confirm,
      title: null,
      content: <ShowPaper paperId={paperId} paperType={paperType} />,
      icon: null,
    });
  };

  render() {
    const { collapse } = this.state;
    const {
      ableBack, // 是否能够返回上一页
      name, // 任务名称
      type, // 任务类型
      distributeType, // 分发试卷
      examType, // 任务策略
      rectifyType, // 人工纠偏
      teacher, // 代课老师
      classList = [], // 教室列表
      paperList = [], // 试卷列表
      studentList = [], // 考试列表
      showPaper = false, // 是否能够试卷预览
      choosedNum,
      showTeacher,
    } = this.props;
    console.log(this.props);

    // 查看学生按钮的文案
    let btnText = null;
    if (collapse) {
      if (type === 'TT_2') {
        btnText = formatMessage(messages.checkBtnTitPractice);
      } else {
        btnText = formatMessage(messages.checkBtnTit);
      }
    } else {
      btnText = formatMessage(messages.checkBtnTit1);
    }

    return (
      <div className={styles.detailCont}>
        {/* 返回 */}
        {ableBack && (
          <div className={styles.backBtn} onClick={this.clickBack}>
            <span className="iconfont icon-link-arrow-left" />
            {formatMessage(messages.backBtnTit)}
          </div>
        )}

        {/* 标题 */}
        <div className={styles.title}>{name}</div>
        {/* 考试设置 练习模式下不显示 */}
        {type !== 'TT_2' && (
          <div className={styles.item}>
            <div className={styles.itemTit}>{formatMessage(messages.setting)}</div>
            <div className={cs(styles.itemContent, styles.examSetting)}>
              <div className={styles.settingItem}>
                <span className={styles.setTit}>{formatMessage(messages.distModeTit)}</span>
                <span className={styles.setCont}>{distributeType}</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.setTit}>{formatMessage(messages.examStrategy)}</span>
                <span className={styles.setCont}>{examType || '无'}</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.setTit}>{formatMessage(messages.manualRectification)}</span>
                <span className={styles.setCont}>{rectifyType}</span>
              </div>
            </div>
          </div>
        )}

        {/* 代课老师 */}
        {teacher && showTeacher && (
          <div className={styles.item}>
            <div className={styles.itemTit}>{formatMessage(messages.teacher)}</div>
            <div className={cs(styles.itemContent, styles.examSetting)}>
              <div className="teacherAvatar">
                <TeacherAvatar
                  selectedTeacher={teacher}
                  noclosed
                  style={{ border: 'none', background: 'transparent' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 考试班级 */}
        <div className={styles.item}>
          <div className={styles.itemTit}>
            {type !== 'TT_2'
              ? formatMessage(messages.examClass)
              : formatMessage(messages.examClassPractice)}
          </div>
          <div className={cs(styles.itemContent, styles.examClass)}>
            <div className={styles.classList}>
              {classList.map(it => (
                <span style={{ paddingRight: '20px' }} key={it.classId}>
                  {it.className || it.name}
                </span>
              ))}
            </div>
            <div className={styles.checkStudent}>
              <div className={styles.checkBtn} onClick={this.checkStudent}>
                {btnText}
              </div>
            </div>
          </div>
        </div>
        {/* 考试学生 */}
        {collapse ? null : (
          <div className={styles.studentTable}>
            <Table
              columns={this.columns}
              dataSource={studentList.filter(vo => vo.status === 'Y')}
              bordered
              pagination={{ defaultPageSize: 20 }}
            />
            <div className={styles.bottom}>
              <div>
                <span className={styles.setTit}>
                  {type === 'TT_2'
                    ? formatMessage(messages.practivePersonNum)
                    : formatMessage(messages.examPersonNum)}
                  ：
                </span>
                <span className={styles.setCont}>{choosedNum}</span>
              </div>
            </div>
          </div>
        )}

        {/* 考试试卷 */}
        <div className={styles.item}>
          <div className={styles.itemTit}>
            {type !== 'TT_2'
              ? formatMessage(messages.examPaper)
              : formatMessage(messages.examPaperPractice)}
          </div>
          <div className={styles.itemContent} style={{ height: 'auto' }}>
            {paperList.map(item => (
              <div className={styles.paper} key={item.paperId}>
                <div className={cs(styles.left, styles.setTit)}>
                  {item.name}
                  {showPaper && (
                    <span
                      className={styles.preview}
                      onClick={() => this.showPaper(item.paperId, item.paperType)}
                    >
                      <i className="iconfont icon-eye" />
                      <span style={{ paddingLeft: '6px' }}>{formatMessage(messages.preview)}</span>
                    </span>
                  )}
                </div>
                <div className={styles.right}>
                  <div className={styles.rightItem}>
                    <span className={styles.setTit}>{formatMessage(messages.fullmark)}：</span>
                    <span className={styles.setCont}>
                      {`${item.fullMark}${formatMessage(messages.mark)}`}
                    </span>
                  </div>
                  <div className={styles.rightItem}>
                    <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                    <span className={styles.setCont}>{showTime(item.paperTime, 's')}</span>
                  </div>
                  <div className={styles.rightItem}>
                    <span className={styles.setTit}>{formatMessage(messages.grade)}：</span>
                    <span className={styles.setCont}>{MatchUnitType(item)}</span>
                  </div>
                  <div>
                    <span className={styles.setTit}>{formatMessage(messages.paperTemplate)}：</span>
                    <span className={styles.setCont}>{item.templateName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default TaskDetail;
