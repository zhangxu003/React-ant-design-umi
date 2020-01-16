/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';

import ClassSelect from './ClassSelect';
import PaperDetail from './PaperDetail';
import TestSet from './TestSet';
import { MatchUnitType } from '@/frontlib/utils/utils';
// eslint-disable-next-line camelcase
import task_icon_1 from '@/assets/examination/task_icon_1.png';
import task_icon_2 from '@/assets/examination/task_icon_2.png';
import task_icon_3 from '@/assets/examination/task_icon_3.png';
import StepBottom from '../components/StepBottom';
import styles from './style.less';

class Step extends React.PureComponent {
  state = {
    isLoad: false,
  };

  componentDidMount() {
    const {
      match: {
        params: { taskType },
      },
    } = this.props;
    console.log(taskType);
    const { dispatch } = this.props;

    this.setState({
      isLoad: true,
    });

    window.ClassSelectCard = '0';
    window.gradeIndex = '0';
    dispatch({
      type: 'release/fetchClass',
      payload: {
        status: taskType === 'TT_3' ? 'Y' : 'N',
        a: '',
      },
    }).then(() => {
      dispatch({
        type: 'release/changeTaskType',
        taskType,
      });
    });
  }

  getNowFormatDate = () => {
    const date = new Date();
    const seperator1 = '';
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    const H = date.getHours();
    const I = date.getMinutes();
    const S = date.getSeconds();
    if (month >= 1 && month <= 9) {
      month = `0${month}`;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = `0${strDate}`;
    }
    const currentdate = year + seperator1 + month + seperator1 + strDate + H + I + S;
    return currentdate;
  };

  checkType = type => {
    switch (type) {
      case 'TT_1':
        return '考试';
      case 'TT_3':
        return '联考';
      case 'TT_2':
        return '练习';
      default:
        return '';
    }
  };

  // 整合选择班级的数据
  filterData = () => {
    const {
      distributeType,
      dispatch,
      paperSelected,
      classType,
      selectedTeacher,
      rectifyType,
      examType,
      match: {
        params: { taskType },
      },
      classList,
    } = this.props;
    let arrList = [];
    if (window.ClassSelectCard === '2') {
      arrList = classList.learningGroup;
    } else if (window.ClassSelectCard === '1') {
      arrList = classList.teachingClass;
    } else if (window.ClassSelectCard === '0') {
      arrList = classList.naturalClass;
    }

    console.log(arrList);

    const selectedClass = [];
    const selectedGroup = [];
    let gradeIndex = '';
    let gradeValue = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const i in arrList) {
      if (arrList[i].isChoosed) {
        gradeIndex = arrList[i].grade;
        // eslint-disable-next-line prefer-destructuring
        gradeValue = arrList[i].gradeValue;
        // eslint-disable-next-line no-restricted-syntax
        for (const n in arrList[i].classList) {
          if (arrList[i].classList[n].isChoosed) {
            selectedClass.push(arrList[i].classList[n]);
          }
        }
      }
    }

    if (window.ClassSelectCard === '2' && selectedClass && selectedClass.length >= 1) {
      for (const j in selectedClass) {
        for (const i in selectedClass[j].learningGroupList) {
          if (selectedClass[j].learningGroupList[i].isChoosed) {
            selectedGroup.push(selectedClass[j].learningGroupList[i]);
          }
        }
      }
    }

    const params = {
      type: 'release/saveSelectedClass',
      payload: window.ClassSelectCard === '2' ? selectedGroup : selectedClass,
      gradeIndex,
      gradeValue,
    };

    dispatch(params);
    // router.push(`/teacher/examination/publish/${taskType}/selectpaper/`);
    // 发布需要的数据

    const classListSelect = window.ClassSelectCard === '2' ? selectedGroup : selectedClass;
    const paperList = [];
    for (const i in paperSelected) {
      paperList.push({
        paperId: paperSelected[i].id,
        name: paperSelected[i].name,
        gradeValue: paperSelected[i].gradeValue,
        paperTime: paperSelected[i].paperTime,
        fullMark: paperSelected[i].fullMark,
        paperName: paperSelected[i].paperName,
        templateName: paperSelected[i].templateName,
        paperScopeValue: paperSelected[i].paperScopeValue,
        unitId: paperSelected[i].unitId,
        paperType: paperSelected[i].paperType,
        scopeName: MatchUnitType(paperSelected[i]),
      });
    }

    let str = '';
    if (classListSelect.length === 1) {
      str = classListSelect[0].className || classListSelect[0].name;
    } else if (classListSelect[0].classType === 'LEARNING_GROUP') {
      str = `${classListSelect[0].name}等${classListSelect.length}个组`;
    } else {
      str = `${classListSelect[0].className}等${classListSelect.length}个班`;
    }

    // eslint-disable-next-line default-case
    switch (taskType) {
      case 'TT_1':
        str += '模考';
        break;
      case 'TT_2':
        str += '训练';
        break;
      case 'TT_3':
        str += '联考';
        break;
    }

    const myDate = new Date();

    str =
      str +
      myDate.getFullYear() +
      `0${myDate.getMonth() + 1}`.slice(-2) +
      `0${myDate.getDate()}`.slice(-2) +
      `0${myDate.getHours()}`.slice(-2) +
      `0${myDate.getMinutes()}`.slice(-2);

    const saveData = {
      name: str,
      campusId: localStorage.getItem('campusId'),
      type: taskType,
      classType,
      classList: classListSelect,
      paperList,
      distributeType,
      rectifyType,
      examType,
    };

    let teacherArr = [
      {
        teacherId: localStorage.getItem('teacherId'),
        campusId: localStorage.getItem('campusId'),
        teacherName: localStorage.getItem('teacherName'),
        type: 'MASTER',
      },
    ];
    // eslint-disable-next-line no-unused-vars
    let suTeacherId = '';
    if (selectedTeacher && selectedTeacher.campusId) {
      suTeacherId = selectedTeacher.teacherId;
      teacherArr.push({ ...selectedTeacher, type: 'SUB' });
    }

    if (taskType === 'TT_3') {
      const newArr = [];
      for (const i in classListSelect) {
        newArr.push({
          teacherId: classListSelect[i].teacherId,
          campusId: classListSelect[i].campusId,
          teacherName: classListSelect[i].teacherName,
          type: 'TEACHER',
        });
      }

      const result = newArr.reduce((init, current) => {
        const maxCode = current.teacherId;
        const index = `${maxCode}`;
        if (init.length === 0 || !init[index]) {
          // eslint-disable-next-line no-param-reassign
          init[index] = current;
        }
        return init;
      }, []);

      const teacherArr2 = [];
      // eslint-disable-next-line guard-for-in
      for (const i in result) {
        teacherArr2.push(result[i]);
      }

      teacherArr = teacherArr.concat(teacherArr2);
      console.log(teacherArr);
    }
    saveData.teacher = teacherArr;

    if (taskType !== 'TT_2') {
      saveData.distributeType = distributeType;
      saveData.examType = examType;
      saveData.rectifyType = rectifyType;
    }
    console.log(saveData, classType);

    // 确认发布
    dispatch({
      type: 'release/fetchSaveTask',
      payload: saveData,
    }).then(e => {
      const { responseCode } = e;
      if (responseCode !== '200') {
        return;
      }
      dispatch({
        type: 'release/saveExamSetting',
        distributeType: 'DT_1',
        examType: 'ET_1',
        rectifyType: 'NOTHING',
      });
      // 跳转到列表页面
      router.push(`/teacher/tasklist/${taskType}`);
    });
  };

  renderTop = taskType => {
    const { title } = this.props;
    console.log(title);
    let pic = '';
    // eslint-disable-next-line default-case
    switch (taskType) {
      case 'TT_1':
        // eslint-disable-next-line camelcase
        pic = task_icon_1;
        break;
      case 'TT_2':
        // eslint-disable-next-line camelcase
        pic = task_icon_3;
        break;
      case 'TT_3':
        // eslint-disable-next-line camelcase
        pic = task_icon_2;
        break;
    }

    return (
      <div className="testTitle">
        <img src={pic} className="title_img" alt="" />
        <div className="title">{title.value}</div>
      </div>
    );
  };

  onFinish = () => {
    const {
      match: {
        params: { taskType },
      },
    } = this.props;

    router.push(`/teacher/examination/publish/${taskType}/selectpaper`);
  };

  render() {
    const {
      classList,
      mystudentListNum,
      TASK_TYPE,
      paperSelected,
      publishData,
      match: {
        params: { taskType },
      },
    } = this.props;
    const { isLoad } = this.state;
    if (taskType) {
      return (
        <div className="releaseStep">
          <PaperDetail paperList={paperSelected} />
          {/* 考试设置 */}
          {taskType !== 'TT_2' && TASK_TYPE.length > 0 && isLoad && (
            <TestSet setStrate={ids => this.setStrate(ids)} setDistd={id => this.setDistd(id)} />
          )}

          {/* 班级选择 */}
          {isLoad && (
            <ClassSelect
              classList={classList}
              taskType={taskType}
              ClassactiveKey={window.ClassSelectCard || '0'}
            />
          )}

          <StepBottom
            prevText="上一步"
            nextText="确认发布"
            prev={this.onFinish}
            className={styles.btns}
            disabled={mystudentListNum === 0 || publishData}
            next={() => {
              this.filterData();
            }}
          />
        </div>
      );
    }
    return null;
  }
}

export default connect(({ dictionary, release, loading }, props) => {
  const {
    classList,
    choosedNum,
    mystudentListNum,
    paperSelected,
    distributeType,
    examType,
    rectifyType,
    classType,
  } = release;
  const { taskType } = props.match.params;
  const { TASK_TYPE = [] } = dictionary;
  const publishData = loading.effects['release/fetchSaveTask'] || false;
  const title = TASK_TYPE.find(vo => vo.code === taskType) || {};
  console.log(title);
  return {
    classType,
    taskType,
    classList,
    choosedNum,
    mystudentListNum,
    TASK_TYPE,
    title,
    paperSelected,
    distributeType,
    examType,
    rectifyType,
    publishData,
  };
})(Step);
