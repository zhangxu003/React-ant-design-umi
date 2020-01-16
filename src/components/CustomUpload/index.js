import React, { Component } from 'react';
import { message, Progress } from 'antd';
import './index.less';

/**
 *
 *
 * @class CustomUpload
 *
 *  output:
 *  onSuccess(id,path,fileName)  //fileId(文件id),url（文件url）,fileName（文件名）
 */
class CustomUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false, //上传中
      failUpload: false,
      successUpload: false,
      name: '',
      path: '',
      preview: null,
      data: null,
      progress: 0,
      fileId: '',
    };
  }

  //选择文件
  changePath = e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    let src,
      preview,
      type = file.type;
    // console.log(this.props.accept)
    // 匹配类型为image/开头的字符串
    if (/^image\/\S+$/.test(type) && this.props.accept.indexOf('image') > -1) {
      src = URL.createObjectURL(file);
      preview = <img src={src} alt="" />;
    }
    // 匹配类型为audio/开头的字符串
    else if (/^audio\/\S+$/.test(type) && this.props.accept.indexOf('audio') > -1) {
      if (type.indexOf('mp3') < 0) {
        message.warn('选择mp3格式文件！');
        return;
      }
    }
    // 匹配类型为video/开头的字符串
    else if (/^video\/\S+$/.test(type) && this.props.accept.indexOf('video') > -1) {
      src = URL.createObjectURL(file);
      preview = <video src={src} autoPlay loop controls />;
    }
    // 匹配类型为text/开头的字符串
    else if (/^text\/\S+$/.test(type) && this.props.accept.indexOf('text') > -1) {
      const self = this;
      const reader = new FileReader();
      reader.readAsText(file);
      //注：onload是异步函数，此处需独立处理
      reader.onload = function(e) {
        preview = <textarea value={this.result} readOnly />;
        self.setState({ path: file.name, data: file, preview: preview });
      };
      return;
    } else {
      message.warn('选择正确格式文件！');
      return;
    }

    this.setState({ path: file.name, data: file, preview: preview });

    this.upload(file);
  };

  // 上传文件
  upload = data => {
    // const data = this.state.data;
    if (!data) {
      console.log('未选择文件');
      return;
    }

    //此处的url应该是服务端提供的上传文件api
    //const protocol = window.location.protocol;
    const origin = window.location.origin;
    const url = origin + '/api/file/file';
    const form = new FormData();

    //此处的file字段由上传的api决定，可以是其它值
    form.append('file', data);

    const xhr = new XMLHttpRequest();

    this.xhr = xhr;
    xhr.upload.addEventListener('progress', this.uploadProgress, false); // 第三个参数为useCapture?，是否使用事件捕获/冒泡

    xhr.onreadystatechange = this.uploadStateChange; //上传状态变化
    xhr.onerror = this.uploadFail; //上传失败
    xhr.onload = this.uploadComplete; //上传完成

    xhr.open('POST', url, true); // 第三个参数为async?，异步/同步

    var taken = localStorage.getItem('access_token');
    xhr.setRequestHeader('Authorization', taken); //setRequestHeader必须写在open之后

    xhr.send(form);

    this.setState({
      uploading: true,
    });
  };
  uploadStateChange = () => {
    console.log(this.xhr);
  };

  uploadProgress = e => {
    console.log(e);

    if (e.lengthComputable) {
      const progress = Math.round((e.loaded / e.total) * 100);
      this.setState({ progress: progress });
    }
  };
  uploadFail = e => {
    console.log('上传失败');

    this.setState({
      failUpload: true,
      uploading: false,
    });
  };
  //上传完成
  uploadComplete = e => {
    console.log(e);
    if (e.target.readyState == 4 && e.target.status == 200) {
      const response = this.xhr.response;
      const resJson = JSON.parse(response);
      if (resJson.responseCode == '200') {
        this.state.fileId = resJson.data.id;
        this.props.onSuccess(resJson.data.id, resJson.data.path, this.state.path);
        this.setState({
          successUpload: true,
          uploading: false,
        });
      } else {
        message.warning('上传失败');
        this.setState({
          failUpload: true,
          uploading: false,
        });
      }
    } else {
      message.warning('上传失败');
      this.setState({
        failUpload: true,
        uploading: false,
      });
    }
  };

  componentWillUnmount() {
    if (this.xhr) {
      this.xhr.upload.removeEventListener('progress', this.uploadProgress, false);
    }
  }

  render() {
    const { accept } = this.props;
    return (
      <div>
        <div className="upload-box">
          <i className="iconfont icon-upload" />
          {/*<input type='file' className="file-btn" accept='video/*,image/*,text/plain' onChange={this.changePath} /> 选择文件*/}
          <input type="file" className="file-btn" onChange={this.changePath} accept={accept} />{' '}
          选择文件
        </div>
        <div
          style={{
            display: this.state.path == '' ? 'none' : 'block',
            padding: '10px 0px',
            margin: 0,
          }}
        >
          {this.state.path}
        </div>
        <div className="progressWrap">
          {this.state.uploading && (
            <Progress percent={this.state.progress} status={this.uploading ? 'active' : 'normal'} />
          )}
          {this.state.failUpload && <p style={{ padding: '10px 0px', margin: 0 }}>上传失败</p>}
          {this.state.successUpload && <p style={{ padding: '10px 0px', margin: 0 }}>上传成功</p>}
        </div>
      </div>
    );
  }
}

export default CustomUpload;
