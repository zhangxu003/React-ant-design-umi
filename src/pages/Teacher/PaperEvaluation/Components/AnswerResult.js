/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import { Chart, Geom, Axis, Coord, Label } from 'bizcharts';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import DataSet from '@antv/data-set';

import Styles from './index.less';

const myColor = '#03C46B'; // 绿色
const warnColor = '#FF6E4A'; // 橙色

@connect(({ paperEvaluation }) => ({
  masterData: paperEvaluation.masterData,
  answerStatics: paperEvaluation.answerStatics,
}))
class AnswerResult extends Component {
  componentWillMount() {}

  switchType = key => {
    switch (key) {
      case '1.0':
        return formatMessage({ id: 'task.text.bad', defaultMessage: '差' });
      case '2.0':
        return formatMessage({ id: 'task.text.middle', defaultMessage: '中' });
      case '3.0':
        return formatMessage({ id: 'task.text.liang', defaultMessage: '良' });
      case '4.0':
        return formatMessage({ id: 'task.text.good', defaultMessage: '优' });
      default:
        break;
    }
  };

  remakeData = data => {
    console.log(data);
    if (data && data.length > 0) {
      data.forEach(e => {
        e.K = this.switchType(e.K);
      });
      return data;
    }
    return data;
  };

  // 选择题过滤数据
  fliter = (data, dataSource) => {
    dataSource.forEach(element => {
      if (element.K === 'A') {
        data.forEach(item => {
          if (item.K === 'A') {
            item.V = element.V;
          }
        });
      }
      if (element.K === 'B') {
        data.forEach(item => {
          if (item.K === 'B') {
            item.V = element.V;
          }
        });
      }
      if (element.K === 'C') {
        data.forEach(item => {
          if (item.K === 'C') {
            item.V = element.V;
          }
        });
      }
      if (element.K === 'D') {
        data.forEach(item => {
          if (item.K === 'D') {
            item.V = element.V;
          }
        });
      }

      if (element.K === 'server.wzd') {
        data.forEach(item => {
          if (item.K === 'server.wzd') {
            item.K = '未答题';
            item.V = element.V;
          }
        });
      }
    });
    const newData = [];
    Object.keys(data).forEach(key => {
      if (data[key].V !== 0) {
        newData.push(data[key]);
      }
    });

    console.log(newData);

    return newData;
  };

  // 口语题过滤数据
  fliter3 = dataSource => {
    const data1 = [
      {
        K: '1.0',
        V: 0,
      },
      {
        K: '2.0',
        V: 0,
      },
      {
        K: '3.0',
        V: 0,
      },
      {
        K: '4.0',
        V: 0,
      },
    ];
    if (dataSource) {
      dataSource.forEach(element => {
        if (element.K === '1.0') {
          data1.forEach(item => {
            if (item.K === '1.0') {
              item.V = element.V;
            }
          });
          data1.V = element.V;
        }
        if (element.K === '2.0') {
          data1.forEach(item => {
            if (item.K === '2.0') {
              item.V = element.V;
            }
          });
        }
        if (element.K === '3.0') {
          data1.forEach(item => {
            if (item.K === '3.0') {
              item.V = element.V;
            }
          });
        }
        if (element.K === '4.0') {
          data1.forEach(item => {
            if (item.K === '4.0') {
              item.V = element.V;
            }
          });
        }
      });
    }

    return data1;
  };

  createData = () => {
    const { answerStatics } = this.props;
    const answerDetail = answerStatics[0].answersDetail[0];
    let ds;
    let dv;

    if (answerDetail.answerType === 'CHOICE') {
      this.rightAnswers = answerDetail.rightAnswers;
      let data = [
        {
          K: 'D',
          V: 0,
        },
        {
          K: 'C',
          V: 0,
        },
        {
          K: 'B',
          V: 0,
        },
        {
          K: 'A',
          V: 0,
        },
      ];
      const answerStatis = JSON.parse(answerDetail.answerStatis);
      data = this.fliter(data, answerStatis);
      ds = new DataSet();
      dv = ds.createView().source(data);
      return dv;
    }
    if (answerDetail.answerType === 'GAP_FILLING') {
      return [];
    }

    const pronunciationStatis =
      (answerDetail.pronunciationStatis && JSON.parse(answerDetail.pronunciationStatis)) || [];
    const integrityStatis =
      (answerDetail.integrityStatis && JSON.parse(answerDetail.integrityStatis)) || [];
    const fluencyStatis =
      (answerDetail.fluencyStatis && JSON.parse(answerDetail.fluencyStatis)) || [];

    ds = new DataSet();
    const dv1 = ds.createView().source(this.remakeData(this.fliter3(pronunciationStatis)));
    const dv2 = ds.createView().source(this.remakeData(this.fliter3(integrityStatis)));
    const dv3 = ds.createView().source(this.remakeData(this.fliter3(fluencyStatis)));
    return [dv1, dv2, dv3];
  };

  renderChart = (dv, answerType) => {
    if (answerType === 'CHOICE') {
      return (
        <div style={{ margin: '0px 15px', marginBottom: 40 }}>
          <Chart
            data={dv}
            height={dv.rows.length * 60}
            forceFit
            padding={[10, 40, 20, 0]}
            style={{ fontSize: '12', color: 'rgba(216,216,216,1)', fill: 'rgba(216,216,216,1)' }}
          >
            <Coord transpose />
            <Axis
              name="K"
              label={{
                offsetX: 20,
                offsetY: -20,
                textStyle: {
                  textAlign: 'start',
                  fill: 'rgba(216,216,216,1)', // 文本的颜色
                },
              }}
              tickLine={null}
              line={null}
            />
            <Axis name="V" visible={false} />
            <Geom
              type="interval"
              color={[
                'K*V',
                K => {
                  if (K === this.rightAnswers) {
                    return myColor;
                  }
                  return warnColor;
                },
              ]}
              position="K*V"
              size={20}
            >
              <Label
                content={['K*V', (K, V) => `${V}人`]}
                offset="30"
                textStyle={{
                  textAlign: 'end', // 文本对齐方向，可取值为： start middle end
                  fill: 'rgba(216,216,216,1)', // 文本的颜色
                  fontSize: '12', // 文本大小
                }}
              />
            </Geom>
          </Chart>
        </div>
      );
    }

    const { answerStatics } = this.props;
    const answerDetail = answerStatics[0].answersDetail[0];

    if (answerType === 'GAP_FILLING') {
      if (answerDetail.answerStatis === '') {
        return (
          <div className={Styles.none}>
            <i className="iconfont icon-tip" />
            <div>
              {formatMessage({
                id: 'task.text.noanswer',
                defaultMessage: '本题无代表性的错误答案！',
              })}
            </div>
          </div>
        );
      }
      answerDetail.answerStatis = answerDetail.answerStatis.replace(/server.wzd/g, '未答题');
      const answerStatis = JSON.parse(answerDetail.answerStatis);

      const ds = new DataSet();
      dv = ds.createView().source(answerStatis);

      return (
        <div style={{ margin: '0px 15px', marginBottom: 40 }}>
          <Chart
            // width={150}
            data={dv}
            height={dv.rows.length * 60}
            forceFit
            padding={[10, 40, 20, 0]}
            style={{ fontSize: '12', color: 'rgba(216,216,216,1)', fill: 'rgba(216,216,216,1)' }}
          >
            <Coord transpose />
            <Axis
              name="K"
              // position="top"
              label={{
                offsetX: 20,
                offsetY: -20,
                textStyle: {
                  textAlign: 'start',
                  fill: 'rgba(216,216,216,1)', // 文本的颜色
                },
              }}
              tickLine={null}
              line={null}
            />
            <Axis name="V" visible={false} />
            <Geom type="interval" color={['K*V', () => warnColor]} position="K*V" size={20}>
              <Label
                content={['K*V', (K, V) => `${V}人`]}
                offset="18"
                textStyle={{
                  textAlign: 'center', // 文本对齐方向，可取值为： start middle end
                  fill: 'rgba(216,216,216,1)', // 文本的颜色
                  fontSize: '12', // 文本大小
                }}
              />
            </Geom>
          </Chart>
        </div>
      );
    }

    const pronunciationStatis = answerDetail.pronunciationStatis;
    const integrityStatis = answerDetail.integrityStatis;
    const fluencyStatis = answerDetail.fluencyStatis;
    return (
      <div className={Styles.rightcontent}>
        {pronunciationStatis && (
          <div>
            <div className={Styles.title}>
              {formatMessage({ id: 'task.text.pronunciationStatis', defaultMessage: '发音' })}
            </div>
            <div style={{ width: '100%' }}>
              <Chart
                data={dv[0]}
                height={200}
                forceFit
                padding={[10, 40, 20, 0]}
                style={{
                  fontSize: '12',
                  color: 'rgba(216,216,216,1)',
                  fill: 'rgba(216,216,216,1)',
                }}
              >
                <Coord transpose />
                <Axis
                  name="K"
                  label={{
                    offsetX: 20,
                    offsetY: -20,
                    textStyle: {
                      textAlign: 'start',
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                    },
                  }}
                  tickLine={null}
                  line={null}
                />
                <Axis name="V" visible={false} />
                <Geom type="interval" color={['K*V', () => myColor]} position="K*V" size={20}>
                  <Label
                    content={['K*V', (K, V) => `${V}人`]}
                    offset="32"
                    textStyle={{
                      textAlign: 'end', // 文本对齐方向，可取值为： start middle end
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                      fontSize: '12', // 文本大小
                    }}
                  />
                </Geom>
              </Chart>
            </div>
          </div>
        )}
        {integrityStatis && (
          <div>
            <div className={Styles.title}>
              {formatMessage({ id: 'task.text.integrityStatis', defaultMessage: '完整度' })}
            </div>
            <div style={{ width: '100%' }}>
              <Chart
                data={dv[1]}
                height={200}
                forceFit
                padding={[10, 40, 20, 0]}
                style={{
                  fontSize: '12',
                  color: 'rgba(216,216,216,1)',
                  fill: 'rgba(216,216,216,1)',
                }}
              >
                <Coord transpose />
                <Axis
                  name="K"
                  label={{
                    offsetX: 20,
                    offsetY: -20,
                    textStyle: {
                      textAlign: 'start',
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                    },
                  }}
                  tickLine={null}
                  line={null}
                />
                <Axis name="V" visible={false} />
                <Geom type="interval" color={['K*V', () => myColor]} position="K*V" size={20}>
                  <Label
                    content={['K*V', (K, V) => `${V}人`]}
                    offset="32"
                    textStyle={{
                      textAlign: 'end', // 文本对齐方向，可取值为： start middle end
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                      fontSize: '12', // 文本大小
                    }}
                  />
                </Geom>
              </Chart>
            </div>
          </div>
        )}
        {fluencyStatis && (
          <div>
            <div className={Styles.title}>
              {formatMessage({ id: 'task.text.fluencyStatis', defaultMessage: '流利度' })}
            </div>
            <div style={{ width: '100%' }}>
              <Chart
                data={dv[2]}
                height={200}
                forceFit
                padding={[10, 40, 20, 0]}
                style={{
                  fontSize: '12',
                  color: 'rgba(216,216,216,1)',
                  fill: 'rgba(216,216,216,1)',
                }}
              >
                <Coord transpose />
                <Axis
                  name="K"
                  label={{
                    offsetX: 20,
                    offsetY: -20,
                    textStyle: {
                      textAlign: 'start',
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                    },
                  }}
                  tickLine={null}
                  line={null}
                />
                <Axis name="V" visible={false} />
                <Geom type="interval" color={['K*V', () => myColor]} position="K*V" size={20}>
                  <Label
                    content={['K*V', (K, V) => `${V}人`]}
                    offset="32"
                    textStyle={{
                      textAlign: 'end', // 文本对齐方向，可取值为： start middle end
                      fill: 'rgba(216,216,216,1)', // 文本的颜色
                      fontSize: '12', // 文本大小
                    }}
                  />
                </Geom>
              </Chart>
            </div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { answerStatics } = this.props;
    let answerDetail = {};
    let dv = null;
    if (answerStatics && answerStatics[0]) {
      answerDetail = answerStatics[0].answersDetail[0];
      dv = this.createData();
    } else {
      return (
        <div className={Styles.none}>
          <i className="iconfont icon-tip" />
          <div className={Styles.noneTips}>
            {formatMessage({ id: 'task.title.nodata', defaultMessage: '暂无数据' })}
          </div>
        </div>
      );
    }

    return (
      <div className={Styles.bizcharts}>
        <div className={Styles.top}>
          <div className={Styles.topcontent}>
            <div>{formatMessage({ id: 'task.text.scoreRate', defaultMessage: '得分率' })}</div>
            <div>{`${Number(answerDetail.scoreRate * 100).toFixed(1)}%`}</div>
          </div>
          <div>|</div>
          {answerDetail.answerType !== 'CHOICE' && answerDetail.answerType !== 'GAP_FILLING' ? (
            <div className={Styles.topcontent}>
              <div>{formatMessage({ id: 'task.text.avgScore', defaultMessage: '平均分' })}</div>
              <div>{answerDetail.avgScore}</div>
            </div>
          ) : (
            <div className={Styles.topcontent}>
              <div>{formatMessage({ id: 'task.text.markNum', defaultMessage: '正确人数' })}</div>
              <div>
                {answerDetail.markNum}
                {formatMessage({ id: 'task.text.people', defaultMessage: '人' })}
              </div>
            </div>
          )}
        </div>

        {dv && this.renderChart(dv, answerDetail.answerType)}
      </div>
    );
  }
}

export default AnswerResult;
