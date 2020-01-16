/*
 * @Author: tina.zhang
 * @Date: 2019-01-07 13:11:58
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-01-08 11:05:13
 * @Description: 波浪图的生成组件
 */

 import React from "react";

 export default class WaveImage extends React.Component{

    componentDidMount(){
      const { props, refs } = this;
      const { loading } = props;
      const { canvas } = refs;
      // 绘制图形
      this.ctx = canvas.getContext("2d");
      this.height = canvas.height;
      this.width = canvas.width;
      this.step = 0;
      this.drawCircle(loading);
    }

    componentDidUpdate(prevProps){
      const { loading : preLoading } = prevProps;
      const { loading } = this.props;
      if( preLoading === loading ) return;
      if( loading ){
        // 继续动画
        window.requestAnimFrame(this.drawCircle);
      }else{
        // 取消动画
        window.cancelAnimationFrame(this.loading);
      }
    }

    drawCircle = (loading)=>{
      const { ctx,width,height,draw,step,drawCircle } = this;
      ctx.lineJoin = 'round';
      const lines = ["rgba(247,207,47,0.3)", "rgba(247,207,47,0.3)"];
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      lines.forEach((item,index)=>{
        draw( item, index );
      });
      this.step = step+1;
      if( loading ){
        this.loading = window.requestAnimFrame(drawCircle);
      }
    }

    draw = (fillStyle,index)=>{
      const { ctx,width,height,step } = this;
      const yAxis = Math.floor(this.height *3/5);
      // 设置颜色
      ctx.save();
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      for ( let i = 0; i <= width; i += 5 ) {
        const x =  i;
        const y = 50*Math.sin((x+step*(0.2*index+0.5))/20+index*Math.PI/6)/6+yAxis;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.lineTo(0, 50*Math.sin(index*Math.PI/6)/6+yAxis);
      ctx.closePath();
      ctx.fill();
    }

    render(){
      const ref = "canvas";
      const {className} = this.props;
      return <canvas key="canvas" className={className} ref={ref} width="100%" height="100%" />
   }
 }
