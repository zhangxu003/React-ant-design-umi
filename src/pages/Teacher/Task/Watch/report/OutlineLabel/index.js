import React, { Component } from 'react';
import { Chart, Tooltip, Geom, Coord, Label, Guide } from 'bizcharts';
import { DataView } from '@antv/data-set';
import classNames from 'classnames';
import ReactFitText from 'react-fittext';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import autoHeight from '@/components/Charts/autoHeight';
import styles from './index.less';

const {Text} = Guide;
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
class OutlineLabel extends Component {
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
    } = this.props;

    const { legendBlock } = this.state;
    const pieClassName = classNames(styles.pie, className, {
      [styles.legendBlock]: legendBlock,
    });

    const {
      data : origanData=[],
      tooltip=true,
      onPlotClick = ()=>{},
      padding = [0, 0, 0, 0]
    } = this.props;

    const data = origanData.filter(item=>item.value>0);

    if( data.length === 0 ){
      return null;
    }


    const scale = {
      type : {
        type  : 'cat',
        range : [0, 1],
        formatter : (val)=>{
          // 根据val获取name
          const obj = data.find(item=>item.type === val);
          return obj.name || val;
        }
      },
      value : {
        min: 0,
      },
    };

    const tooltipFormat = [
      'name*percent',
      (x, p) => ({
        name: x,
        value: handleNumber(p),
      }),
    ];

    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'value',
      dimension: 'type',
      as: 'percent',
    });

    const rotate = 360-dv.rows[0].percent*360/2-90;

    // 判断是否只有一条数据
    const onlyOneData = data.length === 1;

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
              <Coord type="theta" radius={1} rotate={rotate} />
              <Geom
                tooltip={tooltip && tooltipFormat}
                type="intervalStack"
                position="percent"
                color={['color', (color)=>color||null]}
                style={
                  ['shadowColor', {
                    lineWidth,
                    stroke: '#fff',
                    shadowBlur : 30,
                    shadowColor : (shadowColor)=>shadowColor || null
                  }]
                }
                select={false}
              >
                {
                  !onlyOneData && (
                    <Label
                      content="name"
                      autoRotate={false}
                      offset={-30}
                      htmlTemplate={(text,item,index) => {
                        const { color,percent } = item.point;
                        const basic = `width:100px;line-height:30px;border:2px solid transparent;font-size:12px;position:absolute;font-size:14px;color:rgba(51,51,51,1);`;
                        let line = `width:30px;height:30px;border:2px solid transparent;position:absolute;`;
                        let other="";
                        if( index === 0 ){
                          other=`left:-180px;top:-40px;text-align:left;border-bottom-color:${color};`;
                          line=`${line}bottom:0px;right:-30px;border-bottom-color:${color};transform-origin:0% 100%;transform: rotate(45deg)`
                        }else{
                          other=`right:-180px;bottom:-40px;text-align:right;border-top-color:${color};`;
                          line=`${line}top:0px;left:-30px;border-top-color:${color};transform-origin:100% 0%;transform: rotate(45deg)`
                        }

                        return (`
                          <div style="font-size:16px;line-height:26px;color:rgba(255,254,254,1);pointer-events:none;">${Math.round(percent*100).toFixed(1)}%</div>
                          <div style="${basic}${other}">
                            ${text}
                            <div style="${line}">
                          </div>
                        `);
                      }}
                    />
                  )
                }
              </Geom>
              {
                onlyOneData && (
                  <Guide>
                    <Text
                      position={["50%", "50%"]}
                      content="100%"
                      style={{
                        lineHeight: "240px",
                        fontSize: "36",
                        fill: "#ffffff",
                        textAlign: "center"
                      }}
                    />
                  </Guide>
                )
              }

            </Chart>
          </div>
        </ReactFitText>
      </div>
    );
  }
}

export default OutlineLabel;
