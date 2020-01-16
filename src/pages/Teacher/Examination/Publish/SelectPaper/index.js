import React from 'react';
import { connect } from 'dva';
import { Spin, Pagination, message } from 'antd';
import { formatMessage } from 'umi/locale';
import Dimensions from 'react-dimensions';
import IconButton from '@/components/IconButton';

import router from 'umi/router';
import StepBottom from '../components/StepBottom';

import PaperDetail from './PaperDetail';

import ShopCart from './ShopCart';
import PaperList from './PaperList';
import { parabola } from './parabola';
import styles from './index.less';

@connect(({ dict, release, loading, teacher }) => ({
  paperSelected: release.paperSelected,
  taskType: release.taskType,
  classList: release.classList,
  teacherId: teacher.userInfo.teacherId,
  release,
  dict,
  fetchPaperDetailing: loading.effects['release/fetchPaperDetail'] || false,
  fetchPaperListing: loading.effects['release/fetchPaper'],
  gradeIndex: release.gradeIndex,
}))
class Step extends React.PureComponent {
  state = {
    examtype: '',
    pageIndex: 1,
    paperType: '1', // 1样本资源  2我的试卷 暂定
    shopCartShow: false,
    grade: '', // 筛选条件 年级
    annual: '', // 筛选条件 年度
    difficultLevel: '', // 筛选条件 难度
    templateId: '', // 筛选条件 试卷结构
    addCartStatus: false,
    visible: true,
    pageMyIndex: 1,
    isVisible: false,
  };

  componentDidMount() {
    window.ExampaperStatus = 'PREVIEW';
    const { match } = this.props;
    const { taskType } = match.params;
    const { dispatch, classList } = this.props;
    const falg = localStorage.getItem('publishReload');
    if (!falg) {
      if (classList.length === 0) {
        router.push(`/teacher/examination/publish/${taskType}/configuration`);
      } else {
        dispatch({
          type: 'release/changeTaskType',
          taskType,
        });
        dispatch({
          type: 'release/fetchPaperTemplates',
          payload: { campusId: localStorage.getItem('campusId') },
        });
        const { pageIndex } = this.state;
        // const date = new Date();
        // const year = date.getFullYear();
        this.getPaperList('', '', '', '', '', pageIndex);
      }
    }

    localStorage.removeItem('publishReload');
  }

  // 获取试卷列表接口
  getPaperList = (
    paperType,
    grade,
    annual,
    difficultLevel,
    templateId,
    pageIndex,
    examtype = ''
  ) => {
    const campusId = localStorage.getItem('campusId');
    // eslint-disable-next-line no-unused-vars
    const { dispatch, teacherId } = this.props;
    /*
     *获取试卷列表接口*
     */
    const params = {
      grade,
      annual,
      difficultLevel,
      paperTemplateId: templateId,
      campusId,
      pageIndex,
      pageSize: '10',
      paperScope: '',
      unitId: '',
      unitType: '',
    };

    if (examtype === 'SCOPE_P2J,SCOPE_J2S,SCOPE_S2U') {
      params.paperScope = examtype;
    } else if (examtype === 'MID_TERM,MID_TERM_FIRST,MID_TERM_SECOND') {
      params.unitId = examtype;
    } else if (examtype === 'END_TERM,END_TERM_FIRST,END_TERM_SECOND') {
      params.unitId = examtype;
    } else if (examtype === 'UNIT') {
      params.unitType = examtype;
    } else if (examtype === 'COMPREHENSIVE') {
      params.unitId = examtype;
    }

    // dispatch({
    //   type: 'release/initData',
    //   payload: {},
    // });
    dispatch({
      type: 'release/fetchPaper',
      payload: params,
    });
  };

  getPaperDetail = (id, papType) => {
    const { dispatch } = this.props;
    const { paperType } = this.state;
    /*
     *获取试卷详情接口*
     */
    const params = {
      paperId: id,
      paperType: papType || paperType,
    };
    const { paperSelected } = this.props;
    dispatch({
      type: 'release/fetchPaperDetail',
      payload: params,
    }).then(() => {
      this.paperStatus(paperSelected);
    });
  };

  getMyPaperList = pageIndex => {
    const { dispatch, teacherId } = this.props;
    dispatch({
      type: 'release/fetchMyPaper',
      payload: {
        teacherId,
        keyword: '',
        paperScope: '',
        grade: '',
        pageIndex,
        pageSize: '10',
      },
    });
  };

  // 我的资源分页
  onChangeMyList = page => {
    this.setState({
      pageMyIndex: page,
    });
    this.getMyPaperList(page);
  };

  onChangeList = page => {
    const { paperType, grade, annual, difficultLevel, templateId, examtype } = this.state;
    this.setState({
      pageIndex: page,
    });
    this.getPaperList(paperType, grade, annual, difficultLevel, templateId, page, examtype);
  };

  // 添加购物车
  addPaperCart = item => {
    const { paperSelected, dispatch, taskType } = this.props;
    const { paperType } = this.state;
    if (
      paperSelected.filter(vo => vo.templateId !== item.templateId).length > 0 &&
      taskType !== 'TT_2'
    ) {
      message.error(
        formatMessage({
          id: 'task.message.pleaseSelectTheSameTestPaperExaminationPaperStructure',
          defaultMessage: '请选择试卷结构相同的试卷',
        })
      );
      return;
    }
    this.onAnimate().then(() => {
      const shopCart = [];
      console.log(paperSelected, item);
      const current = paperSelected.filter(vo => vo.id === item.id);
      const { addCartStatus } = this.state;
      let papers = [];
      if (current.length > 0) {
        papers = paperSelected.filter(vo => vo.id !== item.id);
      } else {
        const baz = item;
        baz.paperType = paperType !== '2' ? 'STANDARD_PAPER' : 'CUSTOM_PAPER';
        shopCart.push(baz);
        papers = shopCart.concat(paperSelected);
      }

      dispatch({
        type: 'release/fetchPaperSelected',
        payload: {
          selectedPaper: papers,
        },
      });
      this.setState({
        addCartStatus: !addCartStatus,
      });
    });
  };

  // 判断当前试卷是否被选中
  paperStatus = paperlist => {
    const { props } = this;
    const current = props.release.currentPaperDetail;
    const paper = paperlist.filter(x => x.id !== current.id);
    if (paper.length < paperlist.length) {
      this.setState({
        addCartStatus: true,
      });
    } else {
      this.setState({
        addCartStatus: false,
      });
    }
  };

  // 点击已选试卷显示列表
  showPaperCart = () => {
    const { shopCartShow } = this.state;
    this.setState({
      shopCartShow: !shopCartShow,
    });
  };

  // 筛选当前试卷列表
  filterPaperList = (paper, years, difficulty, address, examtype) => {
    const { paperType } = this.state;
    console.log(paperType === 1);
    this.setState({
      grade: paper, // 筛选条件 年级
      annual: years, // 筛选条件 年度
      difficultLevel: difficulty, // 筛选条件 难度
      templateId: address, // 筛选条件 试卷结构
      examtype,
      pageIndex: 1,
    });
    if (paperType !== 2 || paperType !== '2') {
      this.getPaperList(paperType, paper, years, difficulty, address, '1', examtype);
    } else {
      // this.getMyPaperList(paperType,paper,years,difficulty,address,pageIndex)
    }
  };

  // 删除该试卷
  deletePaperCurrent = id => {
    const { paperSelected, dispatch } = this.props;
    const paper = paperSelected.filter(x => x.id !== id);
    dispatch({
      type: 'release/fetchPaperSelected',
      payload: {
        selectedPaper: paper,
      },
    });
    this.paperStatus(paper);
  };

  // 清空已选试卷
  deleteSelectedAll = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'release/fetchPaperSelected',
      payload: {
        selectedPaper: [],
      },
    });
    this.setState({
      addCartStatus: false,
    });
  };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onChangeLeft = () => {
    const { visible } = this.state;

    this.setState({
      visible: !visible,
    });
  };

  changeType = key => {
    if (key === '1') {
      const { paperType, grade, annual, difficultLevel, templateId, examtype } = this.state;

      this.getPaperList(paperType, grade, annual, difficultLevel, templateId, 1, examtype);
    }
    this.setState({
      paperType: key,
      pageIndex: 1,
      pageMyIndex: 1,
    });
  };

  onAnimate = () =>
    new Promise(resolve => {
      function animationDone() {
        this.setState({
          isVisible: false,
        });
        resolve();
      }
      const config = {
        ballWrapper: this.$wrapper,
        origin: this.$origin,
        target: this.$target,
        time: 500,
        a: 0.0006,
        callback: this.updateLocation,
        finish: animationDone.bind(this),
        offset: 8,
      };
      parabola(config);
    });

  updateLocation = (x, y) => {
    console.log(x, y);
    this.setState({
      x,
      y,
      isVisible: true,
    });
  };

  renderLeft() {
    const { fetchPaperListing, release } = this.props;
    const { pageIndex, paperType, visible, pageMyIndex } = this.state;

    if (visible) {
      return (
        <div className="selectpaperDrawer">
          {/* <PaperFilter filterPaper={(paper,years,difficulty,address,examtype)=>this.filterPaperList(paper,years,difficulty,address,examtype)} /> */}
          <Spin delay={500} spinning={fetchPaperListing}>
            <PaperList
              currentPaperId={id => {
                this.getPaperDetail(id);
              }}
              filterPaperLists={(paper, years, difficulty, address, examtype) =>
                this.filterPaperList(paper, years, difficulty, address, examtype)
              }
              changePaperType={key => this.changeType(key)}
            />
          </Spin>
          <div className="pages">
            <Pagination
              showLessItems
              current={paperType !== '2' ? pageIndex : pageMyIndex}
              pageSize={10}
              total={
                paperType !== '2'
                  ? release.paperList && release.paperList.total
                  : release.myPaperList && release.myPaperList.total
              }
              onChange={paperType !== '2' ? this.onChangeList : this.onChangeMyList}
            />
          </div>
          <div className="tag" onClick={this.onChangeLeft}>
            <div>
              <div>
                <i className="iconfont icon-link-arrow-left" />
              </div>
              <div className="text">收起</div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="selectpaperDraweropen">
        <div className="tag" onClick={this.onChangeLeft}>
          <div>
            <div>
              <i className="iconfont icon-link-arrow" />
            </div>
            <div className="text">展开</div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      taskType,
      fetchPaperListing,
      fetchPaperDetailing,
      release,
      containerWidth,
    } = this.props;
    const { shopCartShow, pageIndex, paperType, pageMyIndex, isVisible, x, y } = this.state;
    const { paperSelected } = release;
    const current = release.currentPaperDetail;
    console.log(paperType);
    const animateStyle = {
      transform: `translate(${x}px, ${y}px)`,
      // transition : "transform 0.5s ease 0s",
      // '-webkit-transform'       : `translate(${this.state.x}px, ${this.state.y}px)`,
      // '-webkit-transition' : "transform 0.5s ease 0s",
      opacity: isVisible ? 1 : 0,
    };

    if (taskType) {
      return (
        <div className="releaseStep selectpaper App">
          {containerWidth <= 1366 ? (
            this.renderLeft()
          ) : (
            <div className="left" ref={this.saveContainer}>
              {/* <PaperFilter filterPaper={(paper,years,difficulty,address,examtype)=>this.filterPaperList(paper,years,difficulty,address,examtype)} /> */}
              <Spin delay={500} spinning={fetchPaperListing}>
                <PaperList
                  currentPaperId={id => {
                    this.getPaperDetail(id);
                  }}
                  filterPaperLists={(paper, years, difficulty, address, examtype) =>
                    this.filterPaperList(paper, years, difficulty, address, examtype)
                  }
                  changePaperType={key => this.changeType(key)}
                />
              </Spin>
              <div className="pages">
                <Pagination
                  showLessItems
                  current={paperType !== '2' ? pageIndex : pageMyIndex}
                  pageSize={10}
                  total={
                    paperType !== '2'
                      ? release.paperList && release.paperList.total
                      : release.myPaperList && release.myPaperList.total
                  }
                  onChange={paperType !== '2' ? this.onChangeList : this.onChangeMyList}
                />
              </div>
            </div>
          )}

          <div
            className="right"
            ref={dom => {
              this.$wrapper = dom;
            }}
          >
            <div
              className="origin"
              ref={dom => {
                this.$origin = dom;
              }}
            />
            <Spin delay={500} spinning={fetchPaperDetailing} className={styles.spinStyle}>
              <PaperDetail
                addPaperCart={item => this.addPaperCart(item)}
                addCartStatus={paperSelected.filter(vo => vo.id === current.id).length > 0 || false}
              />
            </Spin>

            <div
              className="target"
              ref={dom => {
                this.$target = dom;
              }}
            />
            <div className="selectedPaper">
              <div className="showPaperList" onClick={this.showPaperCart}>
                <div className="selectedCount">
                  <IconButton text="" iconName="iconfont icon-paper" />
                  {paperSelected.length > 0 && (
                    <span className="counts">{paperSelected.length}</span>
                  )}
                </div>
                已选试卷
                {shopCartShow ? (
                  <IconButton text="" iconName="iconfont icon-link-arrow-down" />
                ) : (
                  <IconButton text="" iconName="iconfont icon-link-arrow-up" />
                )}
              </div>

              <div className="r">
                <StepBottom
                  nextText="确认试卷"
                  disabled={paperSelected.length === 0}
                  nextStyle={
                    paperSelected.length === 0
                      ? {}
                      : {
                          background: 'rgba(3,196,107,1)',
                          boxShadow: '0px 2px 5px 0px rgba(3,196,107,0.5)',
                        }
                  }
                  prev={() => {
                    router.push(`/teacher/tasklist/${taskType}`);
                  }}
                  next={() => {
                    localStorage.setItem('publishReload', 'false');
                    // dispatch({
                    //   type: 'release/savePublishTaskData',
                    // })
                    if (paperSelected.length > 0) {
                      router.push(`/teacher/examination/publish/${taskType}/configuration`);
                    }
                  }}
                />
              </div>
            </div>
            <div className="ball" style={animateStyle} />
            {/* 购物车 */}
            {shopCartShow && (
              <div className="shopCart">
                <ShopCart
                  currentId={current.id}
                  selectedPaperList={paperSelected}
                  hideSelectedPaper={this.showPaperCart}
                  deletePaperCurrent={id => this.deletePaperCurrent(id)}
                  deleteSelectedAll={this.deleteSelectedAll}
                  currentPaperId={(id, papType) => {
                    this.getPaperDetail(id, papType);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }
}

export default Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})(Step);
