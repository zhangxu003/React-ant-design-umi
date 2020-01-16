class audioPlayer {
  constructor(options) {
    this.audio = document.createElement('audio');
    this.list = options.recorderAudioList; //存放临时录音文件
    this.Callback_onPlay = null;
    this.Callback_onStop = null;
    this.Callback_onError = null;
  }
  //回调函数设置
  onPlay(callback) {
    if (typeof callback == 'function') {
      this.Callback_onPlay = callback;
    }
  }
  onStop(callback) {
    if (typeof callback == 'function') {
      this.Callback_onStop = callback;
    }
  }
  onError(callback) {
    if (typeof callback == 'function') {
      this.Callback_onError = function(a) {
        callback({ errId: 10010, error: a });
      };
    }
  }
  play(params) {
    if (!this.audio) {
      this.audio = document.createElement('audio');
    }
    if (params.tokenId) {
      try {
        let fileReader = new FileReader();
        fileReader.onload = event => {
          if (!this.audio) {
            this.audio = document.createElement('audio');
          }
          this.audio.type = 'audio/wav';
          this.audio.loop = false;
          this.audio.src = event.currentTarget.result;
          this.audio.play();
        };
        fileReader.readAsDataURL(this.list[params.tokenId]);
      } catch (err) {
        console.warn(err);
      }
    } else if (params.audioUrl) {
      this.audio.src = params.audioUrl;
      this.audio.type = 'audio/mpeg';
      this.audio.play();
    } else {
      if (this.Callback_onError) {
        this.Callback_onError('no audioUrl or no tokenId!');
        return;
      }
    }
    if (this.Callback_onPlay) {
      this.Callback_onPlay();
    }
    if (this.Callback_onStop) {
      this.audio.addEventListener('ended', this.Callback_onStop());
      this.audio = null;
    }
  }
  stop() {
    this.audio.pause();
    if (this.Callback_onStop) {
      this.Callback_onStop();
      this.audio = null;
    }
  }
  setVolume(value) {
    this.setVolume = value;
  }
}
export default audioPlayer;
