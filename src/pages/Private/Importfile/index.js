/* eslint-disable react/jsx-no-comment-textnodes */
import React, { PureComponent, Fragment } from 'react';
import { connect } from "dva";
import request from '@/utils/request';

@connect()
class ImportFile extends PureComponent {

  state = {
    videoUrl : ""
  }

  componentDidMount(){
    setTimeout(()=>{
      this.setState({
        videoUrl : `/proxyapi/proxy/file/assets?id=43658871918559232&key=${localStorage.getItem("access_token")}`
        // videoUrl : `http://video.699pic.com/videos/04/55/96/a_c4nDGhsUYvsm1547045597.mp4`
      });
    },400);
  }


  handle = (e)=>{
    // 默认图片
    e.target.src="http://pic9.nipic.com/20100827/5252423_161258496483_2.jpg";
    e.target.onerror = null;
  }

  onClick= async ()=>{
    console.log("1111111111111111");


    const data = await request( "/proxyapi/proxy/proxy-token/delete", {
      method: "post",
    });
    console.log(data);

    // const { dispatch } = this.props;
    // dispatch({
    //   type : "login/logout"
    // })
  }

  render(){
    const imgUrl = `/proxyapi/proxy/file/assets?id=48951355032731659&key=${localStorage.getItem("access_token")}`;
    const audioUrl = `/proxyapi/proxy/file/assets?id=421d5f86b1a94de2b4c6fa881d8e0852&key=${localStorage.getItem("access_token")}`;
    const {videoUrl} = this.state;
    return (
      <Fragment>
        <h2>测试proxy环境下，试卷所需要预览或显示的图片和音频</h2>
        <h6> 10.17.9.21       /proxy/file/assets?id=48944999554875403   用戶 18662173716 /123456     这个文件的音频 48951355032731659  这个文件是图片 </h6>
        <div>
          <i>图片测试：</i>
          <img width="250" src={imgUrl} alt="" onError={(e)=>this.handle(e)} />
        </div>
        <div>
          <i>音频测试：</i>
          <audio controls width="500" src={audioUrl}><track kind="captions" /></audio>
        </div>
        <div>
          <i>视频测试：</i>
          <video controls width="500" src={videoUrl} controlsList="nofullscreen nodownload noremoteplayback"></video>
        </div>
        <button onClick={this.onClick}>测试按钮</button>
       </Fragment>
    )
  }
}

export default ImportFile;
