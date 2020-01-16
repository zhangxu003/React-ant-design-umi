import React, { Component } from 'react';
import { Chart, Tooltip, Geom, Coord, Label, Legend } from 'bizcharts';
import { DataView } from '@antv/data-set';
import classNames from 'classnames';
import ReactFitText from 'react-fittext';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import autoHeight from '@/components/Charts/autoHeight';

import styles from './index.less';

/**
 * 默认保留一位小数，如果是空，返回null，如果是100 返回100%
 * @param {*} tag
 */
const handleNumber = (tag)=>{
  if( !tag ){
    return tag;
  }
  if( tag === 1 ){
    return `100%`;
  }
  return `${(tag * 100).toFixed(1)}%`;
}

/* eslint react/no-danger:0 */
@autoHeight()
class InnerLabel extends Component {
  state = {
    legendBlock: false,
  };

  componentDidMount() {
    window.addEventListener(
      'resize',
      () => {
        this.requestRef = requestAnimationFrame(() => this.resize());
      },
      { passive: true }
    );
  }

  shouldComponentUpdate(nextProps,nextState){
    const { data } = this.props;
    const { legendBlock } = this.state;
    if( JSON.stringify(data) !== JSON.stringify(nextProps.data) || legendBlock !== nextState.legendBlock   ){
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.requestRef);
    window.removeEventListener('resize', this.resize);
    this.resize.cancel();
  }

  getG2Instance = chart => {
    this.chart = chart;
    requestAnimationFrame(() => {
      this.resize();
    });
  };


  handleRoot = n => {
    this.root = n;
  };

  /**
   * 根据type获取color
   */
  getColorByType = ( type )=>{
    const { data = [] } = this.props;
    const obj = data.find(item=>item.type===type) || {};
    return obj.color || null;
  }

  // for window resize auto responsive legend
  @Bind()
  @Debounce(300)
  resize() {
    const { hasLegend } = this.props;
    const { legendBlock } = this.state;
    if (!hasLegend || !this.root) {
      window.removeEventListener('resize', this.resize);
      return;
    }
    if (this.root.parentNode.clientWidth <= 380) {
      if (!legendBlock) {
        this.setState({
          legendBlock: true,
        });
      }
    } else if (legendBlock) {
      this.setState({
        legendBlock: false,
      });
    }
  }

  render() {
    const {
      className,
      style,
      height,
      lineWidth = 1,
      legend = true,
    } = this.props;

    const { legendBlock } = this.state;
    const pieClassName = classNames(styles.pie, className, {
      [styles.legendBlock]: legendBlock,
    });

    const {
      data=[],
      tooltip=true,
      onPlotClick = ()=>{},
      select=true,
      padding = [0, 0, 0, 0],
      layout = "horizontal",
    } = this.props;


    const scale = {
      type : {
        type  : 'cat',
        range : [0, 1],
        formatter : (val)=>{
          // 根据val获取name
          const obj = data.find(item=>item.type === val);
          let name = "";
          if( obj ){
            name = `${obj.name}：${obj.value}`;
          }
          return name || val;
        }
      },
      value : {
        min: 0,
      },
    };

    const tooltipFormat = [
      'name*percent',
      (x, p) => ({
        name  : x,
        value : handleNumber(p)
      })
    ];

    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'value',
      dimension: 'type',
      as: 'percent',
    });

    // 判断是否只有一个有值
    const onlyOneData = dv.rows.filter(tag=>tag.percent!==0).length<=1;

    return (
      <div ref={this.handleRoot} className={pieClassName} style={style}>
        <ReactFitText maxFontSize={25}>
          <div className={styles.chart}>
            <Chart
              scale={scale}
              height={height}
              forceFit
              data={dv}
              padding={padding}
              onGetG2Instance={this.getG2Instance}
              onPlotClick={onPlotClick}
            >
              {!!tooltip && <Tooltip showTitle={false} />}
              <Coord type="theta" radius={1} />
              <Legend
                marker="square"
                layout={layout}
                clickable={false}
                visible={legend}
                position="right-center"
                offsetY={-20}
                offsetX={20}
                textStyle={{
                  fill: 'rgba(136,136,136,1)', // 文本的颜色
                  fontSize: '12',              // 文本大小
                  textBaseline: 'middle'       // 文本基准线，可取 top middle bottom，默认为middle
                }}
              />
              <Geom
                opacity={['value', (count)=>{ // 回调函数
                  if(count === 0)
                    return 0.001;
                  return 1;
                }]}
                style={{ lineWidth, stroke: '#fff' }}
                tooltip={tooltip && tooltipFormat}
                type="intervalStack"
                position="percent"
                color={['type', (type)=>this.getColorByType(type)]}
                select={[onlyOneData?false:select, {
                  mode: 'single', // 选中模式，单选、多选
                  style: { },     // 选中后 shape 的样式
                  cancelable: false, // 选中之后是否允许取消选中，默认允许取消选中
                }]}
                shape="circle"
              >
                <Label
                  content="percent"
                  offset={-30}
                  autoRotate={false}
                  htmlTemplate={(text) => {
                    const value = Number(text);
                    const tag = handleNumber(value);
                    let textStyle = "color:#ffffff;font-size:12px;width:0px;height:0px;position:relative;";
                    let textStyle2 = "position:absolute;top:0px;left:0px;transform: translate(-50%,-50%);"
                    if( value === 0 ){
                      textStyle = `${textStyle}display:none;`;
                    }else if( value === 1 ){
                      textStyle = `${textStyle}font-size:36px;color:#ffffff;`;
                      textStyle2 = `${textStyle2}font-size:36px;color:#ffffff;top:-45px;`;
                    }
                    return `<div style="${textStyle}">
                              <div style="${textStyle2}">${tag}<div>
                            </div>`;
                  }}
                />
              </Geom>
            </Chart>
          </div>
        </ReactFitText>
      </div>
    );
  }
}

export default InnerLabel;
