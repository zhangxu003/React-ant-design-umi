import React, { Component } from 'react';
import Avatar from '@/assets/class/avarta_teacher.png';
import { fetchPaperFileUrl } from '@/services/api';

/**
 * 代课教师头像卡片
 */
class Teacher extends Component {
  state = {
    teacherAvatar:""
  }

  componentDidMount() {
    let self = this;
    const { selectedTeacher } = this.props;
    if(selectedTeacher.avatar){
      fetchPaperFileUrl({
        fileId: selectedTeacher.avatar,
      }).then(e => {
        if (e.data) {
          self.setState({
            teacherAvatar: e.data.path,
          });
        }
      });
    }
  }


  render() {
    const { selectedTeacher,onDel,noclosed,style } = this.props;
    const {teacherAvatar} = this.state;
    return (
      <div className={"studentAvatar"} style={style}>
        <img src={teacherAvatar ? teacherAvatar : Avatar} />
        <div className={"userName"}>{selectedTeacher.teacherName}</div>
        {!noclosed && <i className={"iconfont icon-close"} style={{marginLeft:10}} onClick={(e)=>{onDel()}}/>}
      </div>
    );
  }
}

export default Teacher;
