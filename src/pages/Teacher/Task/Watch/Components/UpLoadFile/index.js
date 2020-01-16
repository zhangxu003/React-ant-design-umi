import React, { Component } from 'react';
import styles from './index.less';
import CustomUpload from '@/components/CustomUpload';
import IconButton from '@/components/IconButton';
import { showTime } from "@/utils/timeHandle";

/**
 * 音频上传组件
 * url          音频路径
 * duration     音频时长
 * name         音频名称
 */
class UploadFile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id:'',//音频id
      duration:0,//音频时长
      audioData:null,
      name:'',//音频名称
      audioUrl:"",//音频路径
      isPlay:false
    };
  }

  componentDidMount(){
    const{url,duration,name,id} = this.props;
    if(url){
      this.setState({
        audioUrl:url,
        duration:duration,
        name:name,
        id:id
      })
    }


  }



  setStatePromise(updator) {
    return new Promise( function (resolve,reject){
      this.setState(updator,resolve);
    }.bind(this))
  }

  /**
   * 上传
   */
  handleSuccess = (id,path,name) => {
    let self = this;
    let value = {
      upLoadSuccess:true,
      id:id,
      name:name,
      audioUrl:path,
    }
    let audioData = this.audioValue;
    console.log(audioData)
    this.setStatePromise(value).then(() => {
        // self.start()
    });
    let myVid=document.getElementById("audio"+path);
    myVid.onloadeddata=function(){
        self.start()
    }

  }

  start(){

    let self = this;
    // setTimeout(function(){
      self.setState({
        duration:self.audioValue.duration
      })
      self.props.callback(self.state)
    // },500)

    let audioContext = null;

    try {
        audioContext = new AudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

  }

  playSound(){

    let audioData = this.audioValue;
    // sourceNode.buffer = this.audioValue;
    audioData.play(0);    // Play the sound now

    this.setState({
      isPlay:true
    })

  }


  pauseSound(){
    let audioData = this.audioValue;
    // sourceNode.buffer = this.audioValue;
    audioData.pause();    // Play the sound now

    this.setState({
      isPlay:false
    })
  }

  delSound(){
    let audioData = this.audioValue;
    audioData.pause();    // Play the sound now
    this.setState({
      upLoadSuccess:false,
      id:"",
      name:"",
      audioUrl:"",
      duration:0,
      audioData:null,
      isPlay:false
    })

    this.audioValue = null;
    this.props.callback({
      upLoadSuccess:false,
      id:"",
      name:"",
      audioUrl:"",
      duration:0,
      audioData:null,
      isPlay:false
    })

  }

  render() {
    const {upLoadSuccess,name,audioUrl,isPlay,duration} = this.state;
    return (
        <div style={this.props.style}>
            <audio
                className={styles.audioHide}
                ref={(audio) => { this.audioValue = audio; }}
                src={audioUrl}
                id = {"audio"+audioUrl}
            />
        {
          audioUrl ? <div className="uploadFiles">
                            <div className="uploadSingle" >

                              <IconButton iconName="icon-wave" type="" className="textNone" style={{display: "inline-block"}}/>
                              {name}<span className="waveInfo">{showTime(duration,"s")}</span>

                              <IconButton iconName="icon-detele" type="" className="textNone r" onClick={this.delSound.bind(this)}/>
                              {isPlay?
                                <IconButton iconName="icon-v-pause" type="" className="textNone r" onClick={this.pauseSound.bind(this)}/>
                                :
                                <IconButton iconName="icon-v-play" type="" className="textNone r" onClick={this.playSound.bind(this)}/>
                              }
                            </div>
                          </div>
                          :
                          <CustomUpload onSuccess={this.handleSuccess} accept='video/*,audio/mp3'/>
        }



      </div>
    );
  }
}

export default UploadFile;
