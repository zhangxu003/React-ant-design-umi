/**
 * 考试设置
 * @author tina
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';

import IconButton from '@/frontlib/components/IconButton';
import TestSetModal from './TestSetModal/main';
import styles from './index.less';

@connect(({ release, dictionary }) => {
  const {
    examType,
    rectifyType,
    distributeType,
    taskType,
    rectify,
    strategy,
    distribution,
  } = release;
  const { DIST_TYPE = [], EXAM_TYPE = [], RECTIFYTYPE = [] } = dictionary;
  return {
    examType,
    rectifyType,
    distributeType,
    taskType,
    rectify,
    strategy,
    distribution,
    DIST_TYPE,
    EXAM_TYPE,
    RECTIFYTYPE,
  };
})
class TestSet extends PureComponent {
  state = {
    distributionName: '',
    strategyName: '',
    rectifyName: '',
  };

  componentDidMount() {
    const {
      dispatch,
      distributeType,
      examType,
      rectifyType,
      DIST_TYPE,
      EXAM_TYPE,
      RECTIFYTYPE,
      taskType,
      setDistd,
      setStrate,
    } = this.props;
    if (taskType && DIST_TYPE.length === 0) {
      /** 获取分发试卷方式字典接口* */

      dispatch({
        type: 'release/saveDistribution',
        payload: DIST_TYPE,
      });
      setDistd(DIST_TYPE && DIST_TYPE[0].code);
      this.setState({
        distributionName: DIST_TYPE && DIST_TYPE[0].value,
      });

      /** 获取策略字典接口* */

      dispatch({
        type: 'release/saveStrategy',
        payload: EXAM_TYPE,
      });
      const ids = (EXAM_TYPE && EXAM_TYPE[0].code) || '';
      // EXAM_TYPE.map(item=>{
      //       ids+=item.code+','
      //   })
      const idNames = (EXAM_TYPE && EXAM_TYPE[0].value) || '';
      // EXAM_TYPE.map((item,index)=>{
      //   if(index === EXAM_TYPE.length-1) {
      //     idNames+=item.value
      //   } else {
      //     if(item && item.value.trim()!=""){
      //       idNames+=item.value+' | '
      //     }
      //   }

      // })
      this.setState({
        strategyName: idNames,
      });
      setStrate(ids);

      /** 人工纠偏* */

      dispatch({
        type: 'release/saveRectify',
        payload: RECTIFYTYPE,
      });

      this.setState({
        rectifyName: RECTIFYTYPE && RECTIFYTYPE[0].value,
      });
    } else {
      const examTypeArr = examType.split(',');
      const setDistribution = DIST_TYPE.filter(x => x.code === distributeType);
      const setRectify = RECTIFYTYPE.filter(x => x.code === rectifyType);
      const setStrategyStr = [];
      EXAM_TYPE.forEach(item => {
        examTypeArr.forEach(vo => {
          if (item.code === vo) {
            setStrategyStr.push(item.value);
          }
        });
      });
      this.setState({
        distributionName: setDistribution[0].value,
        rectifyName: setRectify.length > 0 ? setRectify[0].value : '',
        strategyName: setStrategyStr.join(' | '),
      });
    }
  }

  testPaperSet = () => {
    // 此处获取字典字段
    const { strategy, dispatch, RECTIFYTYPE, EXAM_TYPE, DIST_TYPE } = this.props;
    const { distributionName, strategyName, rectifyName } = this.state;
    const dataSource2 = DIST_TYPE;
    const dataSource1 = EXAM_TYPE;
    TestSetModal({
      dataSource: {
        distribution: DIST_TYPE,
        strategy: EXAM_TYPE,
        rectify: RECTIFYTYPE,
        distributionName,
        strategyName: strategyName.split(' | '),
        rectifyName,
      },
      callback: (dn, str, rec) => {
        let strate = '';
        console.log(str);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < str.length; i++) {
          if (i === str.length - 1) {
            strate += str[i];
          } else if (str[i].trim() !== '') {
            strate += `${str[i]} | `;
          }
        }
        if (dn) {
          this.setState({
            distributionName: dn,
          });
        }
        // if(strate) {
        this.setState({
          strategyName: strate,
        });
        // }

        if (rec) {
          this.setState({
            rectifyName: rec,
          });
        }
        const that = this;
        const setDist = dataSource2.filter(x => {
          const distributions = dn || that.state.distributionName;
          return x.value === distributions;
        });
        const setStrategy = [];
        const stateStr = strate.split(' | ');
        const strates = strategy.length > 0 ? strategy : stateStr;
        dataSource1.forEach(item => {
          strates.forEach(vo => {
            if (item.value === vo) {
              setStrategy.push(item);
            }
          });
        });

        // eslint-disable-next-line vars-on-top
        let ids = '';
        setStrategy.forEach((item, idx) => {
          if (idx === setStrategy.length - 1) {
            ids += item.code;
          } else {
            ids += `${item.code},`;
          }
        });

        const setRectify = RECTIFYTYPE.filter(x => {
          const rectifys = rec || that.state.rectifyName;
          return x.value === rectifys;
        });
        console.log(setDist, setRectify);

        dispatch({
          type: 'release/saveExamSetting',
          distributeType: setDist[0].code,
          examType: ids,
          rectifyType: setRectify[0].code,
        });

        // this.props.setDistd(setDist[0].code);
        // this.props.setStrate(ids);

        // 确定设置条件
      },
    });
  };

  render() {
    const { distributionName, strategyName, rectifyName } = this.state;
    return (
      <div className="setPaper">
        <h2>考试设置</h2>
        <div className="setResult">
          <div className={styles.sate}>
            分发试卷方式：<span>{distributionName}</span>
            考试策略：<span>{strategyName || '无'}</span>
            人工纠偏：<span>{rectifyName}</span>
          </div>
          <IconButton
            onClick={this.testPaperSet}
            text="修改"
            iconName="iconfont icon-set"
            className="iconButton"
            textColor="textColor"
          />
        </div>
      </div>
    );
  }
}

export default TestSet;
