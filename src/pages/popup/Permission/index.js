/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 教师机--一键检测中点击图表弹出的table框
 * @Date: 2019-02-18 17:31:11
 * @LastEditTime: 2019-02-26 10:56:58
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import cs from 'classnames';
import pic0 from './assets/V_SINGLE_CLASS_EXAM.png';
import pic1 from './assets/V_MULTI_CLASS_EXAM.png';
import pic2 from './assets/V_CLASSROOM_EXERCISES.png';
import pic3 from './assets/V_CLASS_AFTER_TRAINING.png';
import pic4 from './assets/V_UNITED_EXAM.png';
import pic5 from './assets/V_CLASSROOM_REVIEW.png';
import pic6 from './assets/V_CUSTOM_PAPER.png';
import pic7 from './assets/V_ANSWER_ANALYSIS.png';
import masonry from './assets/masonry.png';
import masonryLight from './assets/masonryLight.png';
import styles from './index.less';

const list = [
  {
    title: '本班考试',
    code: 'V_SINGLE_CLASS_EXAM',
    subTitle: '教师组织自己任教班级的学生，进行符合本地听说考试流程的考试',
    pic: pic0,
    standard: true,
    major: true,
  },
  {
    title: '多班联考',
    code: 'V_MULTI_CLASS_EXAM',
    subTitle: '协调和组织与非自己任教班级的学生一起进行小规模校内联考',
    pic: pic1,
    standard: false,
    major: true,
  },
  {
    title: '课堂练习',
    code: 'V_CLASSROOM_EXERCISES',
    subTitle: '学生在机房环境中自主控制答题过程，系统实时出具评测结果和分析报告',
    pic: pic2,
    standard: true,
    major: true,
  },
  {
    title: '课后训练',
    code: 'V_CLASS_AFTER_TRAINING',
    subTitle: '支持学生脱离机房环境进行听说模拟仿真训练',
    pic: pic3,
    standard: false,
    major: true,
  },
  {
    title: '区校统考',
    code: 'V_UNITED_EXAM',
    subTitle: '可组织大规模学校间的统一联考，如期中、期末、模考',
    pic: pic4,
    standard: true,
    major: true,
  },
  {
    title: '互动讲评',
    code: 'V_CLASSROOM_REVIEW',
    subTitle: '双屏实时互动，进行卷面讲评，支持电子白板标记效果',
    pic: pic5,
    standard: false,
    major: true,
  },
  {
    title: '自由组卷',
    code: 'V_CUSTOM_PAPER',
    subTitle: '教师根据自己个性化的教学需求进行组卷，并用此试卷组织考试或练习',
    pic: pic6,
    standard: false,
    major: true,
  },
  {
    title: '答卷解析',
    code: 'V_ANSWER_ANALYSIS',
    subTitle: '提供基于考点和知识点的专家点拨，并提供基于AI技术的多维度分析',
    pic: pic7,
    standard: true,
    major: true,
  },
];

// 对数据进行预处理
@connect(({ popup, permission }) => ({
  type: popup.permission.data,
  standardList: permission.standardList,
  professionalList: permission.professionalList,
}))
class Permission extends Component {
  // 初始化state
  state = {
    select: 'V_SINGLE_CLASS_EXAM',
  };

  componentDidMount() {
    const { type = 'V_SINGLE_CLASS_EXAM' } = this.props;
    const obj = list.find(item => item.code === type);
    this.setState({ select: obj ? obj.code : 'V_SINGLE_CLASS_EXAM' });
  }

  // 显示权限的标签
  tagRender = bool => {
    const classVal = cs(
      'iconfont',
      styles.iconfont,
      { true: ['icon-success', styles['has-power']], false: ['icon-error', styles['no-power']] }[
        bool
      ]
    );
    return <span className={classVal} />;
  };

  // 选中内容
  onClick = select => {
    this.setState({ select });
  };

  /**
   * render
   */
  render() {
    const { select } = this.state;
    const { standardList, professionalList } = this.props;

    const permissionList = list.map(item => ({
      ...item,
      standard: standardList[item.code] === undefined ? item.standard : standardList[item.code],
      major: professionalList[item.code] === undefined ? item.major : professionalList[item.code],
    }));

    const currItem = permissionList.find(item => item.code === select) || permissionList[0];

    return (
      <div className={styles.container}>
        <div className={styles.tip}>
          <Icon type="exclamation-circle" style={{ color: '#ff6e4a', marginRight: '5px' }} />
          当前版本不支持该功能，如需升级请联系经销商
        </div>
        <div className={styles.content}>
          <div className={styles['content-header']}>
            <div className={styles['content-header-title']}>{currItem.title}</div>
            <div className={styles['content-header-subtitle']}>{currItem.subTitle}</div>
          </div>
          <div
            className={styles['content-show']}
            style={{ backgroundImage: `url(${currItem.pic})` }}
          />
        </div>
        <div className={styles.silder}>
          <div className={styles['silder-line']}>
            <div />
            <div>
              <img src={masonry} alt="" />
            </div>
            <div>
              <img src={masonryLight} alt="" />
            </div>
          </div>

          <div className={cs(styles['silder-line'])}>
            <div className={cs(styles['silder-line-title'])}>功能特权</div>
            <div className={cs(styles['silder-line-standard'])}>标准版</div>
            <div className={cs(styles['silder-line-major'])}>专业版</div>
          </div>

          {permissionList.map(item => (
            <div
              key={item.code}
              className={cs(styles['silder-line'], styles['silder-menu'], {
                [styles['silder-menu-select']]: item.code === select,
              })}
            >
              <div
                className={cs(styles['silder-menu-title'])}
                onClick={() => this.onClick(item.code)}
              >
                {item.title}
              </div>
              <div>{this.tagRender(item.standard)}</div>
              <div>{this.tagRender(item.major)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Permission;
