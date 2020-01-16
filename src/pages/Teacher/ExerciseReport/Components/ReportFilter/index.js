import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Dimensions from 'react-dimensions';
import { Select, Row, Col, Affix, Icon } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import ReportPanel from '@/frontlib/components/MissionReport/Components/ReportPanel';
import constant from '@/frontlib/components/MissionReport/constant';
import styles from './index.less';

const { Option } = Select;
// const keys
const { FULL_CLALSS_ID, FULL_PAPER_ID } = constant;

/**
 * 考后报告 试卷、班级筛选
 * @author tina.zhang
 * @date   2019-07-03
 * @param {boolean} showFullPaperOption - 试卷必选
 * @param {array} paperList - 试卷列表
 * @param {string} defaultPaperId - 选中试卷ID
 * @param {array} classList - 班级列表
 * @param {boolean} multiple - 班级是否多选
 * @param {function} onPaperChanged(value,item) - 试卷切换
 * @param {function} onClassChanged(value,item) - 班级切换
 */
const ReportFilter = React.forwardRef((props, ref) => {

  const { showFullPaperOption, paperList, defaultPaperId, classList, multiple, onPaperChanged, onClassChanged, transcript } = props;

  const studentAnswerNum = formatMessage({ id: "task.text.exercisereport.reportFilter.studentAnswerNum", defaultMessage: "学生答卷人数" });
  const fullClassName = formatMessage({ id: "task.text.exercisereport.reportFilter.fullClassName", defaultMessage: "全部班级" });
  const classLabel = formatMessage({ id: "task.text.exercisereport.reportFilter.classLabel", defaultMessage: "班级" });

  const [state, setState] = useState({
    affixed: false,
    paperSelectorOpen: false,
    classSelectorOpen: false,
    paperId: defaultPaperId,
    classId: FULL_CLALSS_ID,
    classIdList: []
  });

  useEffect(() => {
    if (!showFullPaperOption && state.paperId === FULL_PAPER_ID) {
      setState({
        ...state,
        paperId: defaultPaperId || paperList[0].paperId// paperList.filter(v => v.examNum > 0)[0].paperId
      })
    }
  }, [showFullPaperOption]);


  const stateRef = useRef();
  stateRef.current = state;

  // #region 事件处理

  // 固钉
  const handlerAffixChange = useCallback((affixed) => {
    setState({
      ...stateRef.current,
      affixed,
      paperSelectorOpen: false,
      classSelectorOpen: false
    })
  }, [])

  // 试卷选择
  const handlePaperChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      paperId: value,
      paperSelectorOpen: false
    })
    if (onPaperChanged && typeof (onPaperChanged) === 'function') {
      onPaperChanged(value, item);
    }
  }, []);

  // 班级选择（多选）
  const handleClassSelect = useCallback((value) => {
    let selectedItems = stateRef.current.classIdList;
    if (value === FULL_CLALSS_ID) {
      selectedItems = [];
    } else {
      const valueIndex = selectedItems.indexOf(value);
      if (valueIndex < 0) {
        selectedItems.push(value);
      } else {
        selectedItems.splice(valueIndex, 1);
      }
    }
    setState({
      ...stateRef.current,
      classIdList: [...selectedItems]
    })
    // change
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, []);

  const handleClassDeselect = useCallback((value) => {
    const selectedItems = stateRef.current.classIdList;
    if (value !== FULL_CLALSS_ID) {
      const valueIndex = selectedItems.indexOf(value);
      selectedItems.splice(valueIndex, 1);
      setState({
        ...stateRef.current,
        classIdList: [...selectedItems]
      })
    }
    // change
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, [])

  // 单班选择
  const handleClassChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      classId: value,
      classSelectorOpen: false
    })
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged(value, item);
    }
  }, [])

  // 窗体滚动，收起下拉列表
  const handleScroll = useCallback(() => {
    if (stateRef.current.paperSelectorOpen || stateRef.current.classSelectorOpen) {
      setState({
        ...stateRef.current,
        paperSelectorOpen: false,
        classSelectorOpen: false
      })
    }
  }, []);

  // 注册窗体滚动监听
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    const popWindow = document.getElementsByClassName('ant-modal-body')[0];
    if (popWindow) {
      popWindow.addEventListener('scroll', handleScroll);
    }
    const drawer = document.getElementsByClassName('ant-drawer-content')[0];
    if (drawer) {
      drawer.addEventListener('scroll', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (popWindow) {
        popWindow.removeEventListener('scroll', handleScroll);
      }
      if (drawer) {
        drawer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 试卷下拉列表改变事件
  const onPaperDropdownVisibleChange = useCallback((open) => {
    setState({
      ...stateRef.current,
      paperSelectorOpen: open
    })
  }, []);

  // 班级下拉列表改变事件
  const onClassDropdownVisibleChange = useCallback((open) => {
    setState({
      ...stateRef.current,
      classSelectorOpen: open
    })
  }, []);

  // 禁止 select 输入
  useEffect(() => {
    if (classList && classList.length > 1 && multiple) {
      const selector = document.getElementsByClassName('readonlySelector');
      if (selector && selector.length > 0) {
        const ipt = selector[0].getElementsByClassName('ant-select-search__field');
        if (ipt && ipt.length > 0) {
          ipt[0].setAttribute('readonly', 'readonly');
        }
      }
    }
  }, [classList, multiple]);
  // #endregion

  // #region styles


  const paperSelectStyle = {
    width: '80%'
  }
  const classSelectStyle = {
    maxWidth: '90%',
    minWidth: '140px',
  }
  // #endregion

  // #region 低分辨率时班级选择框换行设置顶部margin
  // const containerWidth = window.innerWidth;
  const { containerWidth } = props;
  let classColSpan = {};
  if (containerWidth < 1200 && classList && classList.length > 1) {
    classColSpan = {
      marginTop: '10px'
    }
  }

  const domAndTop = useMemo(() => {
    let dom = window;
    let top = 64;
    const affixM = { marginLeft: '-48px', marginRight: '-48px' };

    if (document.getElementById('popWindow')) {
      dom = document.getElementById('popWindow').parentNode;
      top = 0;
      affixM.marginLeft = '-24px';
      affixM.marginRight = '-30px';
    } else if (props.type && props.type === 'exam') {
      dom = document.getElementById('divReportOverview').parentNode.parentNode;
      top = 0;
      affixM.marginLeft = '-54px';
      affixM.marginRight = '-54px';

    }
    // 考中课后训练互动讲评
    else if (document.getElementsByClassName('ant-drawer-content')) {
      dom = document.getElementById('divReportOverview').parentNode.parentNode.parentNode;
      top = 0;
      affixM.marginLeft = '-24px';
      affixM.marginRight = '-24px';
    }

    const affixStyle = {
      zIndex: '9',
      // width: 'calc(100%-200px)',
      ...affixM,
      borderRadius: '0px',
      boxShadow: '0px 4px 3px -2px rgba(0, 0, 0, 0.1)',
    }
    return { dom, top, affixStyle };
  }, [state.affixed]);

  // #endregion

  // #region 学生答卷人数计算，根据当前所选试卷、班级、是否已提交答卷进行筛选
  const getExamNum = useMemo(() => {
    if (!transcript || !transcript.transcriptStatics) {
      return 0;
    }
    const { paperId: curPaperId, classId: curClassId, classIdList: curClassIdList } = state;
    const { snapshotId } = paperList.find(v => v.paperId === curPaperId);
    const { transcriptStatics } = transcript;
    const filterBySnapshotId = transcriptStatics.find(v => v.snapshotId === snapshotId).reportTranscript;
    let filterByClassName = filterBySnapshotId;
    // 成绩单页：根据班级多选框 classListId 筛选，答题详情页：根据班级单选框 classId 筛选
    if (multiple && curClassIdList && curClassIdList.length > 0) {
      const classNames = [];
      classList.forEach(c => {
        if (curClassIdList.indexOf(c.classId) >= 0) {
          classNames.push(c.className)
        }
      })
      if (classNames && classNames.length > 0) {
        filterByClassName = filterBySnapshotId.filter(v => classNames.indexOf(v.className) >= 0);
      }
    } else if (!multiple && curClassId && curClassId !== FULL_CLALSS_ID) {
      const classInfo = classList.find(v => v.classId === curClassId);
      if (classInfo) {
        filterByClassName = filterBySnapshotId.filter(v => v.className === classInfo.className);
      }
    }


    return filterByClassName.filter(v => v.responseQuestionScore != null).length;
  }, [state.paperId, state.classIdList, state.classId, transcript]);
  // #endregion

  // 低分辨率 && 单班，布局恢复默认
  const smCols = { paper: 12, examNum: 12, class: 24 };
  if (classList.length === 1) {
    smCols.examNum = 6;
    smCols.class = 6;
  }

  return (
    <Affix offsetTop={domAndTop.top} onChange={handlerAffixChange} target={() => domAndTop.dom}>
      <div className={styles.reportFilter} ref={ref}>
        <ReportPanel style={state.affixed ? domAndTop.affixStyle : {}}>
          <Row gutter={20} className={styles.filterRow} type="flex" justify="space-around" align="top">
            <Col xl={8} sm={smCols.paper}>
              <div className={styles.selectContainer}>
                <span>{formatMessage({ id: "task.text.exercisereport.reportFilter.paperLabel", defaultMessage: "试卷" })}：</span>
                <Select
                  style={paperSelectStyle}
                  onChange={handlePaperChanged}
                  value={state.paperId}
                  open={state.paperSelectorOpen}
                  onDropdownVisibleChange={onPaperDropdownVisibleChange}
                >
                  {showFullPaperOption &&
                    <Option key={FULL_PAPER_ID} value={FULL_PAPER_ID}>
                      {formatMessage({ id: "task.text.exercisereport.reportFilter.fullPaperName", defaultMessage: "不限" })}
                    </Option>
                  }
                  {paperList && paperList.length > 0 &&
                    paperList.map(item => {
                      let text = `${item.paperName}  |  ${item.mark}`;
                      let disabled = false;
                      if (item.examNum <= 0) {
                        text = `${text}  ${formatMessage({ id: "task.text.exercisereport.reportFilter.noAnswerPaper", defaultMessage: "(无答卷信息)" })}`;
                        disabled = true;
                      }
                      return (
                        <Option key={item.paperId} value={item.paperId} disabled={disabled} title={text}>
                          {text}
                        </Option>
                      )
                    })}
                </Select>
              </div>
            </Col>
            {containerWidth < 1200 && classList.length > 1 &&
              <Col sm={smCols.examNum}>
                <div className={styles.rightContent} style={state.affixed ? { paddingRight: '40px' } : null}>
                  {studentAnswerNum}：<span className={styles.examNum}>{getExamNum}</span>
                </div>
              </Col>
            }
            <Col xl={12} sm={smCols.class} style={classColSpan}>
              {classList && classList.length === 1 &&
                <div className={styles.selectContainer}>
                  <span>{classLabel}：</span>
                  <span className={styles.className}>{classList[0].className}</span>
                </div>
              }
              {classList && classList.length > 1 &&
                <div className={styles.selectContainer}>
                  <span>{classLabel}：</span>
                  {multiple ?
                    <Select
                      className="readonlySelector"
                      style={classSelectStyle}
                      mode="multiple"
                      placeholder={fullClassName}
                      showArrow
                      removeIcon={<Icon type="close" />}
                      onSelect={handleClassSelect}
                      onDeselect={handleClassDeselect}
                      value={state.classIdList}
                      dropdownMatchSelectWidth={false}
                      open={state.classSelectorOpen}
                      onDropdownVisibleChange={onClassDropdownVisibleChange}
                    >
                      <Option key={FULL_CLALSS_ID} value={FULL_CLALSS_ID}>
                        {fullClassName}
                      </Option>
                      {classList.map(item => (
                        <Option key={item.classId} value={item.classId}>
                          {item.className}
                        </Option>
                      ))}
                    </Select>
                    :
                    <Select
                      style={classSelectStyle}
                      placeholder={fullClassName}
                      showArrow
                      onChange={handleClassChanged}
                      value={state.classId}
                      dropdownMatchSelectWidth={false}
                      open={state.classSelectorOpen}
                      onDropdownVisibleChange={onClassDropdownVisibleChange}
                    >
                      <Option key={FULL_CLALSS_ID} value={FULL_CLALSS_ID}>
                        {fullClassName}
                      </Option>
                      {classList.map(item => (
                        <Option key={item.classId} value={item.classId}>
                          {item.className}
                        </Option>
                      ))}
                    </Select>
                  }
                </div>
              }
            </Col>
            {(containerWidth >= 1200 || classList.length === 1) &&
              <Col xl={4} sm={smCols.examNum}>
                <div className={styles.rightContent} style={state.affixed?{paddingRight:'40px'}:null}>
                  {studentAnswerNum}：<span className={styles.examNum}>{getExamNum}</span>
                </div>
              </Col>
            }
          </Row>
        </ReportPanel>
      </div>
    </Affix>
  )
})
export default connect(({ exerciseReport }) => ({
  // 成绩单数据
  transcript: exerciseReport.transcript
}))(Dimensions()(ReportFilter));

// export default ReportFilter;
