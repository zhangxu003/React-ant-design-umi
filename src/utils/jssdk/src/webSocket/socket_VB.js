class socket_VB {
  constructor(options) {
    this._websocket = null;
    this._buf_cmd_data = []; //评分命令和音频数据缓存
    this._buf_rec = [];
    this._cnt = 0;
    this.canRecord = false; //是否可以录音标志
    this.Callback_onError = null;
    this.Callback_onEval = null;
    this.tokenId = null;
    this.Callback_clear_timer = null;
  }

  _connect(request) {
    let access_token = null;
    let x = this;
    let url = 'ws://111.231.208.195:8080';
    //let url = "ws://10.17.9.99:8080";
    if (localStorage.hasOwnProperty('access_token')) {
      access_token = localStorage.access_token;
      console.log('access_token:' + access_token);
    }
    this._websocket = new WebSocket(url, 'browser.' + access_token);
    this._websocket.onopen = e => {
      let data = JSON.stringify(request);
      x.canRecord = true;
      x._websocket.send(data);
      for (var i = 0; i < x._buf_cmd_data.length; i++) {
        x._websocket.send(x._buf_cmd_data[i]);
      }
      x._buf_cmd_data = [];
    };
    this._websocket.onclose = () => {
      x.canRecord = false;
    };
    this._websocket.onmessage = e => {
      if (x.Callback_clear_timer) {
        x.Callback_clear_timer();
      }
      //let json = JSON.parse(e.data);
      if (x.Callback_onEval) {
        x.Callback_onEval(e.data);
      } else {
        console.log('result:' + e.data);
      }
    };

    this._websocket.onerror = e => {
      if (x.Callback_onError) {
        x.Callback_onError('websocket error.');
      } else {
        console.log('websocket error.');
      }
      x.canRecord = false;
    };
  }
  disconnect(params) {
    this._websocket.close();
    this._websocket = null;
  }

  start_cmd(request) {
    if (this._websocket == null || this._websocket.readyState != WebSocket.OPEN) {
      this._connect(request);
    } else if (this._websocket.readyState == WebSocket.OPEN) {
      console.log(request);
      this._websocket.send(request);
    }
  }
  send_audio(state, data) {
    this._cnt = this._cnt + 1; //send data when _cnt == 6
    if (1 != state) this._buf_rec.push(data);

    if (1 == state || 6 === this._cnt) {
      if (this._buf_rec.length > 0) {
        let output = this._buf_rec.splice(0, this._buf_rec.length);

        let outputArray;
        // outputArray = new Int16Array(output.length * 320);
        // for (let i = 0; i < output.length; i++){
        //     outputArray.set(output[i], i * 320);
        // }
        outputArray = new Uint8Array(output.length * 70);
        for (let i = 0; i < output.length; i++) {
          outputArray.set(output[i], i * 70);
        }

        if (this._websocket && this._websocket.readyState == WebSocket.OPEN) {
          // console.log(outputArray.buffer);
          this._websocket.send(outputArray.buffer);
        } else {
          console.log('websocket error');
          this._buf_cmd_data.push(outputArray.buffer);
        }
      }
      this._cnt = 0;
      if (state == 1) {
        if (this._websocket && this._websocket.readyState == WebSocket.OPEN) {
          this._websocket.send(new ArrayBuffer(0));
          console.log('send stop');
        }
      }
    }
  }
}

export default socket_VB;
