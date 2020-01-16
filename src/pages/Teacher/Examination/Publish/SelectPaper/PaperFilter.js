/**
 * 试卷筛选
 * @author tina
 */
import React, { PureComponent } from 'react';
// import { formatMessage } from 'umi/locale';
import IconButton from '@/components/IconButton';
import { connect } from 'dva';
import paperFilterModal from './PaperFilterModal/main';

import styles from './index.less';

@connect(({ release, dictionary }) => ({
  grade: release.grade,
  years: dictionary.ANNUAL,
  difficulty: dictionary.DIFFICULT_LVL,
  templates: release.templates,
  gradeIndex: release.gradeIndex,
  gradeValue: release.gradeValue,
}))
class PaperFilter extends PureComponent {
  state = {
    gradeName: '不限',
    // yearName: '不限',
    difficulty: '不限',
    address: '不限',
    examtype: '不限',
    gradeCode: '',
    yearCode: '',
    difficultyCode: '',
    addressCode: '',
    examtypeCode: '',
  };

  componentDidMount() {
    // const date = new Date();
    // const year = date.getFullYear();
    // this.setState({
    //     yearName:year+"-" +(year + 1),
    //     yearCode:year
    // })
  }

  paperFilterData = () => {
    let dataSource4 = '';
    let dataSource1 = '';
    let dataSource2 = '';
    let dataSource3 = '';
    const dataSource5 = [
      { code: '', value: '不限' },
      { code: 'SCOPE_P2J,SCOPE_J2S,SCOPE_S2U', value: '升学考试卷' },
      { code: 'MID_TERM,MID_TERM_FIRST,MID_TERM_SECOND', value: '期中' },
      { code: 'END_TERM,END_TERM_FIRST,END_TERM_SECOND', value: '期末' },
      { code: 'UNIT', value: '单元' },
      { code: 'COMPREHENSIVE', value: '单元综合' },
    ];
    const { dispatch, templates, years, difficulty, filterPaper } = this.props;

    dataSource3 = [{ paperTemplateId: '', templateName: '不限' }].concat(templates);

    // dataSource4=[{code:'',value:'不限'}].concat(this.props.grade);

    dataSource1 = [{ code: '', value: '不限' }].concat(years);

    dataSource2 = [{ code: '', value: '不限' }].concat(difficulty);
    const { gradeCode, yearCode, difficultyCode, addressCode, examtypeCode } = this.state;
    dispatch({
      type: 'release/fetchGrade',
      callback: data => {
        dataSource4 = [{ grade: '', gradeValue: '不限' }].concat(data);
        paperFilterModal({
          dataSource: {
            grade: dataSource4,
            years: dataSource1,
            difficulty: dataSource2,
            address: dataSource3,
            type: dataSource5,
            gradeCode,
            yearCode,
            difficultyCode,
            addressCode,
            examtypeCode,
          },
          callback: (grade, year, difficult, address, examtype) => {
            dataSource4.forEach(item => {
              if (item.grade === grade) {
                this.setState({
                  gradeName: item.gradeValue,
                  gradeCode: grade,
                });
              }
            });
            dataSource1.forEach(item => {
              if (item.code === year) {
                this.setState({
                  // yearName: item.value,
                  yearCode: year,
                });
              }
            });
            dataSource2.forEach(item => {
              if (item.code === difficult) {
                this.setState({
                  difficulty: item.value,
                  difficultyCode: difficult,
                });
              }
            });
            dataSource3.forEach(item => {
              if (item.paperTemplateId === address) {
                this.setState({
                  address: item.templateName,
                  addressCode: address,
                });
              }
            });

            dataSource5.forEach(item => {
              if (item.code === examtype) {
                this.setState({
                  examtype: item.value,
                  examtypeCode: examtype,
                });
              }
            });
            // 确定筛选条件
            filterPaper(grade, year, difficult, address, examtype);
          },
        });
      },
    });
  };

  render() {
    const { address, gradeName, difficulty, examtype } = this.state;
    return (
      <div className="testFilter">
        <div className="lefttop">
          <IconButton
            text="筛选"
            iconName="icon-funnel"
            onClick={this.paperFilterData}
            className={styles.filterP}
          />
        </div>
        <div className="leftInfo">
          <div className="leftInfocontent">
            <div className="infoCard">
              <span className="label">年级：</span>
              <span className="labelinfo">{gradeName}</span>
            </div>
            <div className="infoCard">
              <span className="label">类型：</span>
              <span className="labelinfo">{examtype}</span>
            </div>
          </div>
          <div className="leftInfocontent">
            {/* <div className="infoCard">
              <span className="label">
                {formatMessage({ id: 'task.message.year', defaultMessage: '年份' })}：
              </span>
              <span className="labelinfo">{yearName}</span>
            </div> */}
            <div className="infoCard">
              <span className="label">难易度：</span>
              <span className="labelinfo">{difficulty}</span>
            </div>
          </div>
          <div className="leftInfocontent">
            <div className="infoCard" style={{ display: 'flex' }}>
              <div className="label" style={{ width: '70px' }}>
                试卷结构：
              </div>
              <div className="labelinfo">{address}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default PaperFilter;
