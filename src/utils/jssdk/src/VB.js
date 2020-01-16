import H5Recorder from './recorder/H5Recorder';
import common from './Common';
import flashRecorder from './recorder/flashRecorder';
import audioPlayer from './player/audioPlayer';

class VB {
  constructor() {
    let x = this;
    let version = 'v0.2.1';
    this.recorderAudioList = []; //存放临时录音文件
    this.H5params = {
      appKey: '',
      alg: 'sha1',
      sigurl: '',
      userId: '',
      duration: 100000,
      H5: 0,
      encode: 'speex', //编码类型，raw：不压缩， speex：speex压缩
    };
    this.Flashparams = {
      recorderid: 'recorder_swf',
    };
    this.relPlayer = null;
    this.flashplayer = {
      play: function(params) {
        x.relPlayer.startReplay(params);
      },
      stop: function() {
        x.relPlayer.stopReplay();
      },
      onPlay: function(params) {
        x.relPlayer.onReplayStart(params);
      },
      onStop: function(params) {
        x.relPlayer.onReplayStop(params);
      },
      onError: function(params) {
        x.relPlayer.onReplayError(params);
      },
    };

    /*
     *对象赋值
     */
    // if (typeof options != "undefined") {
    //     for (var i in options) {
    //         if (x.params.hasOwnProperty(i)) {
    //             x.params[i] = options[i];
    //         } else {
    //             console.log("Engine: unknown param: " + i);
    //             continue;
    //         }
    //     }
    // }

    x.H5params.H5 = common.support_h5() ? 1 : 0;
    console.log('jssdk-' + version);
    if (x.H5params.H5) {
      x.recorder = new H5Recorder(x);
      console.log('created H5 Recorder success!');
    } else {
      x.recorder = new flashRecorder(x.Flashparams);
      x.relPlayer = x.recorder;
      console.log('created Flash Recorder success!');
    }
    //delete x.options;
    x.player = new audioPlayer(x);
  }
  getRecorderManager() {
    return this.recorder;
  }
  getPlayerManager() {
    let x = this;
    if (x.H5params.H5) {
      return x.player;
    } else {
      return x.flashplayer; //在flash模式下回放也是通过flash实现
    }
  }
}
//window.vb=new VB();
export default VB;
