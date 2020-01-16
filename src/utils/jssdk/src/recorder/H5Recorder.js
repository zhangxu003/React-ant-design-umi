//const WORKER_RECORDER_PATH = 'https://10.18.31.20/jssdk/src/recorder/recorderWorker.js';
import socket_VB from '../webSocket/socket_VB';
import Common from '../Common';
//import { record_worker_s } from '../worker/recordWorker';
/**
 * HTML5模式的录音机。
 *
 * 基于navigator.getUserMedia技术设计开发，用于支持HTML5模式的录音, 同时进行在线评测。
 */
class H5Recorder {
  /**
   * 创建一个Html5录音机。
   */
  constructor(options) {
    let x = this;
    this.userAgent = window.navigator.userAgent; //获取用户当前浏览器信息
    this.options = options;
    this.duration = 5000; //初始录音时长5秒
    this.hint = true; //是否播放录音提示音的标志
    this.nsx = null; //降噪开关
    this.list = options.recorderAudioList; //存放临时录音文件
    this.socket = new socket_VB(x);
    //this.encode_worker= new Worker(ENCODE_WORKER_PATH);
    this.spxCodec = new Speex({
      quality: 8,
      mode: 1,
      bits_size: 70,
    });

    //一些回调函数
    this.Callback_onStart = null;
    this.Callback_onStop = null;
    this.Callback_onVolumeMeter = null;
    this.Callback_onEval = null;
    this.Callback_onError = null;

    this.tokenId = null;
    this.core_timeout = 10000; //评分超时时间默认10秒
    this._timer_stop = null; //录音定时机器
    this._timer_wait_res = null; //评分超时定时器

    this.recording = false;
    this.canRecord = false; //是否能录音标志

    this.inputCount = 0;
    this.outputCount = 0;

    navigator.getUserMedia(
      {
        audio: true,
      },
      stream => {
        this._gotStream(stream);
      },
      function(e) {
        if (this.Callback_onError) {
          this.Callback_onError('no audio device!');
        } else {
          console.error('no audio device!');
        }
        this.canRecord = false;
      }
    );
  }
  //录音开始和停止函数
  /*params参数：
   *duration: Int, //录音时长（秒）
   *hint: Bool, //是否播放提示音
   *nsx: Bool, //是否降噪处理（暂不实现）
   *request: Object //语音评测相关传入json
   */
  start(params) {
    this.inputCount = 0;
    this.outputCount = 0;
    let x = this;
    let temp = {
      protocol: 16777216,
      client: {
        version: 16777216,
        sourceType: 'browser',
        userAgent: this.userAgent,
      },
    };
    this.tokenId = Common.getGuid();
    this.socket.tokenId = this.tokenId;
    params.request.tokenId = this.tokenId;
    temp.request = params.request;
    this.duration = params.duration * 1000;
    this.hint = params.hint;
    if (this.recording && this.Callback_onError) {
      this.Callback_onError('please wait the last record end!');
      return;
    }
    if (!this.record_worker && this.Callback_onError) {
      this.Callback_onError('no input device!');
      return;
    }
    console.log(temp);

    //this.encode_worker.postMessage({command: 'init'});
    // this.encode_worker.onmessage = function(e){
    // 	if(e.data.type == "debug"){
    // 		//postMessage({type:"debug", message:e.data.message});
    // 	} else if(e.data.command == "encode") {
    // 		++this.outputCount;
    // 		var buffer = e.data.buffer[0];
    // 		if(buffer.length >0 ) {
    // 			x.socket.send_audio(0, buffer); //只发送编码后有数据的
    // 		}
    // 		if(!this.recording && (this.outputCount == this.inputCount)){         //未录音且编码结束
    // 			//isEnd = true;
    // 			x.socket.send_audio(1, null);
    // 			console.log("stop");
    // 		}
    // 	}
    // };

    this._startRecord(temp);
  }
  stop() {
    let x = this;
    if (!this.recording) return;
    this.recording = false;

    if (this._timer_stop) {
      clearTimeout(this._timer_stop);
      this._timer_stop = null;
    }

    this.socket.send_audio(1, null);
    this._timer_wait_res = setTimeout(function() {
      if (x.Callback_onError) {
        x.Callback_onError('core timeout, and no onScoreError callback.');
      } else {
        console.error('core timeout, and no onScoreError callback.');
      }
    }, this.core_timeout);

    this.socket.Callback_clear_timer = function() {
      clearTimeout(x._timer_wait_res);
    };

    this.record_worker.postMessage({
      command: 'exportAudio',
      type: 'wav',
    });
    if (this.Callback_onStop) {
      this.Callback_onStop({ tokenId: this.tokenId });
    }
  }
  //回调函数设置
  onStart(callback) {
    if (typeof callback == 'function') {
      this.Callback_onStart = callback;
    }
  }
  onStop(callback) {
    if (typeof callback == 'function') {
      this.Callback_onStop = callback;
    }
  }
  onVolumeMeter(callback) {
    if (typeof callback == 'function') {
      this.Callback_onVolumeMeter = callback;
    }
  }
  onEval(callback) {
    if (typeof callback == 'function') {
      this.socket.Callback_onEval = callback;
    }
  }
  onError(callback) {
    if (typeof callback == 'function') {
      this.Callback_onError = function(a) {
        callback({ errId: 10010, error: a });
      };
      this.socket.Callback_onError ==
        function(a) {
          callback({ errId: 10010, error: a });
        };
    }
  }
  canRecord() {
    if (this.canRecord && this.socket.canRecord) {
      return true;
    } else {
      return false;
    }
  }

  _gotStream(stream) {
    let x = this;
    let AudioContext =
      window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.msAudioContext;
    this.audioContext = new AudioContext();
    if (!this.audioContext) {
      console.log.onError('no audio context!');
    }

    let bufferLen = Common.getBufferSize();
    let realAudioInput = this.audioContext.createMediaStreamSource(stream);

    this.inputPoint = this.audioContext.createGain();
    this.audioInput = realAudioInput;
    this.audioInput.connect(this.inputPoint);

    this.node = this.audioContext.createScriptProcessor(bufferLen, 1, 1);

    let blob_record_worker = new Blob([record_worker_s], { type: 'text/plain' });
    this.record_worker = new Worker(window.URL.createObjectURL(blob_record_worker));
    //this.record_worker = new Worker(WORKER_RECORDER_PATH);
    this.record_worker.onmessage = e => {
      if (e.data.command == 'blob') {
        x.list[x.tokenId.toString()] = e.data.blob;
      } else if (e.data.command == 'volume') {
        if (x.Callback_onVolumeMeter) {
          x.Callback_onVolumeMeter({
            volume: e.data.volume,
            max: e.data.max,
            min: e.data.min,
          });
        }
      } else {
        let buffer = e.data.buffer;
        let result = new Int16Array(buffer.length);
        let senddata;
        for (let i = 0; i < buffer.length; i++) {
          result[i] = buffer[i];
        }
        senddata = this.spxCodec.encode(result, false);
        //console.log(senddata);
        this.socket.send_audio(0, senddata[0]);
        // if(null != this.encode_worker) {
        // 	this.encode_worker.postMessage({
        // 		command : 'encode',
        // 		pcm : result
        // 	});
        // 	++this.inputCount;
        // } else{
        // 	//x.socket.send_audio(0, result);
        // }
      }
    };

    this.record_worker.postMessage({
      command: 'init',
      config: {
        //compressPath:compressPath,
        sampleRate: this.audioContext.sampleRate, //音频采样率，这个值由浏览器决定，因此需要重采样
        outputBufferLength: bufferLen,
      },
    });
    this.node.onaudioprocess = e => {
      if (!this.recording) return; //录音开始开关
      this.record_worker.postMessage({
        command: 'record',
        buffer: e.inputBuffer.getChannelData(0),
      });
    };
    this.inputPoint.connect(this.node);
    this.node.connect(this.audioContext.destination);
    this.canRecord = true;
  }

  _startRecord(request) {
    //console.log(request);
    let x = this;
    x.recording = true;
    x._timer_stop = setTimeout(() => {
      x.stop();
    }, ~~x.duration);

    x.socket.start_cmd(request);

    if (x.Callback_onStart) {
      //执行开始录音的回调
      x.Callback_onStart();
    }
    if (x.hint) {
      x._playding(); //播放叮声
    } else {
      x.record_worker.postMessage({
        command: 'reset',
      });
    }
  }
  _playding() {
    let x = this;
    let audio = document.createElement('audio');
    audio.src = '../assets/audio/ding.mp3';
    audio.type = 'audio/mpeg';
    audio.loop = false;
    audio.play();
    audio.addEventListener('ended', function() {
      x.record_worker.postMessage({
        command: 'reset',
      });
    });
  }
}

const record_worker_s = `
var sampleRate,outputBufferLength,compressPath;

var DEFAULT_MAX_VOLUME_LEVEL = 6;

var recBuffers  = [];
var pcmCache = [];
var pcmLength = 0;
var _maxValue=0;
var _minValue=0;
var _count=0

 
this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
	case 'reset':
	  reset();
	  break;
	case 'exportAudio':
	  exportAudio(e.data.type);
	  break;
  }
};
 
function init(config){
  sampleRate = config.sampleRate; 
  outputBufferLength = config.outputBufferLength;
  //compressPath = config.compressPath;
}
function reset(){
    recBuffers = [];
	pcmCache = [];
	pcmLength = 0;
}

function record(inputBuffer){

	var rss = new Resampler(sampleRate, 16000, 1, outputBufferLength, true);

	var tempArray = [];
	for (var i = 0 ; i < inputBuffer.length ; i++) {
        tempArray.push(inputBuffer[i]);
	}
	var l = rss.resampler(tempArray);//重采样：下采样成16khz，单声道

	var outputBuffer = new Float32Array(l);
	for(var i = 0; i < l; i++){
		outputBuffer[i] = rss.outputBuffer[i];
		//用于画波形图
		_maxValue = Math.max(_maxValue, outputBuffer[i]);
		_minValue = Math.min(_minValue, outputBuffer[i]);
		_count++;
		//频率为10Hz返回录音音量
		if(_count>1600){
			let v=Math.max(Math.abs(_maxValue),Math.abs(_minValue))
			this.postMessage({'command':'volume',
							  'volume' :v, 
							  'max': _maxValue ,
							  'min': _minValue
							});
			_maxValue=0;
			_minValue=0;
			_count=0;
		}
	}
	var data = floatTo16BitPCM(outputBuffer);//采样深度从32bit，降低到16bit

	pcmCache.push(outputBuffer);
	pcmLength += outputBuffer.length;
	
	for (var i = 0 ; i < data.length ; i++) {
        recBuffers.push(data[i]);
	}

	while(recBuffers.length > 320)//每0.02提供一次音频流
	{
		var items = recBuffers.splice(0, 320);
		var result = new Int16Array(320);
		for(var i = 0; i < 320; i++)
		{
			result[i] = items[i];
		}
		this.postMessage({'buffer' : result});

	}
}

function exportAudio(type)
{
	var dataview = null;
	//var pa = new Int16Array(pcmLength);
	var pa = new Float32Array(pcmLength);
	var offset = 0;
	for(var i = 0; i < pcmCache.length; ++i) {
		pa.set(pcmCache[i], offset);
		offset += pcmCache[i].length;
	}
	
	if(type == "wav") {
		dataview = encodeWAV(pa);
	}

	var audioBlob = new Blob([dataview], {type: "audio/wav"});
	this.postMessage({command: 'blob', blob: audioBlob});
}

function ProcessBufferEx(buffer)
        {
            for (var index = 0; index < buffer.length; index += 2)
            {
                var sample = (short) ((buffer[index + 1] << 8) | buffer[index + 0]);
                var sample32 = sample / 0x8000;
                Add(sample32);
            }
        }

//音量大小计算
function compute(pcmData)
{
	if(pcmData == null || pcmData.byteLength <= 0)
	{
		return 0;
	}
		
	var audioLevel = 0;
	var sampleCount = pcmData.byteLength / 2;// 16位转成8位，长度变成2倍，因此要除以2
	var fEnergy = getCalEnergy(pcmData);
	fEnergy = 10.0 *  Math.log(fEnergy / sampleCount);//分贝：10lg功率
	if(fEnergy < 100)
	{
		audioLevel = 0;
	}
	else if(fEnergy > 200)
	{
		audioLevel = DEFAULT_MAX_VOLUME_LEVEL;
	}
	else
	{
		audioLevel = parseInt((fEnergy - 100) * (DEFAULT_MAX_VOLUME_LEVEL) / 100);
	}
	return audioLevel;
}
	
function getCalEnergy(pcmData) //求方差
{
	var fDirectOffset = 0;
	var sampleCount = pcmData.byteLength / 128;
	var data = new Int16Array(pcmData);

	for(var i = 0; i < data.length; i ++)
	{
	    fDirectOffset += data[i];
	}
	
	fDirectOffset /= sampleCount;
	var fEnergy = 0;
	for(var i = 0; i < data.length; i ++)
	{
		fEnergy += (data[i] - fDirectOffset) * (data[i] - fDirectOffset);
	}
	fEnergy += 400000;
	return fEnergy;
}

function floatTo16BitPCM(input)
{
    var output = new Int16Array(input.length);
    for (var i = 0; i < input.length; i++){
		var s = Math.max(-1, Math.min(1, input[i]));
		if(s < 0)
			output[i] = s * 0x8000;
		else
			output[i] = s * 0x7FFF; //二进制小数向右移动15位，相当于扩大2^15倍
	}
	return output;
}

function writeString(view, offset, string){                                     
	for (var i = 0; i < string.length; i++){
		view.setUint8(offset + i, string.charCodeAt(i));                            
	}                                                                             
}
function floatTo16BitPCM2(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function encodeWAV(samples){
  var buffer = new ArrayBuffer(44 + samples.length*2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length*2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, 16000, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, 16000 * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length*2, true);

  //view.setInt16(44, samples, true);
  floatTo16BitPCM2(view, 44, samples);

  return view;
}

function Resampler(fromSampleRate, toSampleRate, channels, outputBufferSize, noReturn) {
	this.fromSampleRate = fromSampleRate;
	this.toSampleRate = toSampleRate;
	this.channels = channels | 0;
	this.outputBufferSize = outputBufferSize;
	this.noReturn = !!noReturn;
	this.initialize();
}
Resampler.prototype.initialize = function () {
	//Perform some checks:
	if (this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0) {
		if (this.fromSampleRate == this.toSampleRate) {
			//Setup a resampler bypass:
			this.resampler = this.bypassResampler;		//Resampler just returns what was passed through.
			this.ratioWeight = 1;
		}
		else {
			if (this.fromSampleRate < this.toSampleRate) {
				/*
					Use generic linear interpolation if upsampling,
					as linear interpolation produces a gradient that we want
					and works fine with two input sample points per output in this case.
				*/
				this.compileLinearInterpolationFunction();
				this.lastWeight = 1;
			}
			else {
				/*
					Custom resampler I wrote that doesn't skip samples
					like standard linear interpolation in high downsampling.
					This is more accurate than linear interpolation on downsampling.
				*/
				this.compileMultiTapFunction();
				this.tailExists = false;
				this.lastWeight = 0;
			}
			this.ratioWeight = this.fromSampleRate / this.toSampleRate;
			this.initializeBuffers();
		}
	}
	else {
		throw(new Error("Invalid settings specified for the resampler."));
	}
}

Resampler.prototype.compileLinearInterpolationFunction = function () {
	var toCompile = "var bufferLength = buffer.length;\
	var outLength = this.outputBufferSize;\
	if ((bufferLength % " + this.channels + ") == 0) {\
		if (bufferLength > 0) {\
			var ratioWeight = this.ratioWeight;\
			var weight = this.lastWeight;\
			var firstWeight = 0;\
			var secondWeight = 0;\
			var sourceOffset = 0;\
			var outputOffset = 0;\
			var outputBuffer = this.outputBuffer;\
			for (; weight < 1; weight += ratioWeight) {\
				secondWeight = weight % 1;\
				firstWeight = 1 - secondWeight;";
	for (var channel = 0; channel < this.channels; ++channel) {
		toCompile += "outputBuffer[outputOffset++] = (this.lastOutput[" + channel + "] * firstWeight) + (buffer[" + channel + "] * secondWeight);";
	}
	toCompile += "}\
			weight -= 1;\
			for (bufferLength -= " + this.channels + ", sourceOffset = Math.floor(weight) * " + this.channels + "; outputOffset < outLength && sourceOffset < bufferLength;) {\
				secondWeight = weight % 1;\
				firstWeight = 1 - secondWeight;";
	for (var channel = 0; channel < this.channels; ++channel) {
		toCompile += "outputBuffer[outputOffset++] = (buffer[sourceOffset" + ((channel > 0) ? (" + " + channel) : "") + "] * firstWeight) + (buffer[sourceOffset + " + (this.channels + channel) + "] * secondWeight);";
	}
	toCompile += "weight += ratioWeight;\
				sourceOffset = Math.floor(weight) * " + this.channels + ";\
			}";
	for (var channel = 0; channel < this.channels; ++channel) {
		toCompile += "this.lastOutput[" + channel + "] = buffer[sourceOffset++];";
	}
	toCompile += 'this.lastWeight = weight % 1;\
			return this.bufferSlice(outputOffset);\
		}\
		else {\
			return (this.noReturn) ? 0 : [];\
		}\
	}\
	else {\
		throw(new Error(\"Buffer was of incorrect sample length.\"));\
	}';
	this.resampler = Function("buffer", toCompile);
}

Resampler.prototype.compileMultiTapFunction = function () {
	var toCompile = "var bufferLength = buffer.length;\
	var outLength = this.outputBufferSize;\
	if ((bufferLength % " + this.channels + ") == 0) {\
		if (bufferLength > 0) {\
			var ratioWeight = this.ratioWeight;\
			var weight = 0;";
	for (var channel = 0; channel < this.channels; ++channel) {
		toCompile += "var output" + channel + " = 0;"
	}
	toCompile += "var actualPosition = 0;\
			var amountToNext = 0;\
			var alreadyProcessedTail = !this.tailExists;\
			this.tailExists = false;\
			var outputBuffer = this.outputBuffer;\
			var outputOffset = 0;\
			var currentPosition = 0;\
			do {\
				if (alreadyProcessedTail) {\
					weight = ratioWeight;";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "output" + channel + " = 0;"
	}
	toCompile += "}\
				else {\
					weight = this.lastWeight;";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "output" + channel + " = this.lastOutput[" + channel + "];"
	}
	toCompile += "alreadyProcessedTail = true;\
				}\
				while (weight > 0 && actualPosition < bufferLength) {\
					amountToNext = 1 + actualPosition - currentPosition;\
					if (weight >= amountToNext) {";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "output" + channel + " += buffer[actualPosition++] * amountToNext;"
	}
	toCompile += "currentPosition = actualPosition;\
						weight -= amountToNext;\
					}\
					else {";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "output" + channel + " += buffer[actualPosition" + ((channel > 0) ? (" + " + channel) : "") + "] * weight;"
	}
	toCompile += "currentPosition += weight;\
						weight = 0;\
						break;\
					}\
				}\
				if (weight == 0) {";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "outputBuffer[outputOffset++] = output" + channel + " / ratioWeight;"
	}
	toCompile += "}\
				else {\
					this.lastWeight = weight;";
	for (channel = 0; channel < this.channels; ++channel) {
		toCompile += "this.lastOutput[" + channel + "] = output" + channel + ";"
	}
	toCompile += 'this.tailExists = true;\
					break;\
				}\
			} while (actualPosition < bufferLength && outputOffset < outLength);\
			return this.bufferSlice(outputOffset);\
		}\
		else {\
			return (this.noReturn) ? 0 : [];\
		}\
	}\
	else {\
		throw(new Error(\"Buffer was of incorrect sample length.\"));\
	}';
	this.resampler = Function("buffer", toCompile);
}

Resampler.prototype.bypassResampler = function (buffer) {
	if (this.noReturn) {
		//Set the buffer passed as our own, as we don't need to resample it:
		this.outputBuffer = buffer;
		return buffer.length;
	}
	else {
		//Just return the buffer passsed:
		return buffer;
	}
}

Resampler.prototype.bufferSlice = function (sliceAmount) {
	if (this.noReturn) {
		//If we're going to access the properties directly from this object:
		return sliceAmount;
	}
	else {
		//Typed array and normal array buffer section referencing:
		try {
			return this.outputBuffer.subarray(0, sliceAmount);
		}
		catch (error) {
			try {
				//Regular array pass:
				this.outputBuffer.length = sliceAmount;
				return this.outputBuffer;
			}
			catch (error) {
				//Nightly Firefox 4 used to have the subarray function named as slice:
				return this.outputBuffer.slice(0, sliceAmount);
			}
		}
	}
}

Resampler.prototype.initializeBuffers = function () {
	//Initialize the internal buffer:
	try {
		this.outputBuffer = new Float32Array(this.outputBufferSize);
		this.lastOutput = new Float32Array(this.channels);
	}
	catch (error) {
		this.outputBuffer = [];
		this.lastOutput = [];
	}
}

`;
export default H5Recorder;
