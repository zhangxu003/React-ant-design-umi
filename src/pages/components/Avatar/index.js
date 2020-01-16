/**
 * 头像的统一显示
 */
import React, { PureComponent } from 'react';
import { Avatar } from 'antd';

export default class ShowAvatar extends PureComponent {

  // 当期的头像id
  accountId = "";

  // 头像在服务器上的地址
  state = {
    url : ""
  }

  componentDidMount(){
    const { accountId } = this.props;
    this.getImgUrl(accountId);
  }

  componentDidUpdate(){
    const { accountId } = this.props;
    this.getImgUrl(accountId);
  }


  // 通过接口获取实际的头像
  getImgUrl = ()=>{
    const { accountId } = this.props;
    const token = localStorage.getItem("access_token");
    if( accountId !== this.accountId && token ){
      this.accountId = accountId;
      if( !accountId ){
        this.setState({url:""});
      }else{
        this.setState({url:`/proxyapi/proxy/file/assets?id=${this.accountId}&key=${token}`});
        // this.setState({url:"http://pic9.nipic.com/20100827/5252423_161258496483_2.jpg"});
      }

    }
  }

  // 图片加载失败
  onError = ()=>{
    const { src } = this.props;
    if( src ){
      this.setState({url : src});
    }
  }

  render() {
    const { url } = this.state;
    const {
      accountId,
      src,
      ...opts
    } = this.props;
    return (
      <Avatar {...opts} src={url} onError={this.onError} />
    );
  }
}
