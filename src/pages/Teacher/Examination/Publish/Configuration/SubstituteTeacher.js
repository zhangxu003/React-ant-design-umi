/**
 * 代理教师选择
 * @author tina
 */
import React, { PureComponent } from 'react';
import {Input,Avatar} from 'antd';
import styles from './index.less';
import IconButton from '@/frontlib/components/IconButton'
import { connect } from 'dva';
import TeacherAvatar from '../components/TeacherAvatar';

@connect(({ release,dict }) => ({
  taskType:release.taskType,
  selectedTeacher:release.selectedTeacher
}))
export default class TestSet extends PureComponent {
  state={
      distributionName:'',
      strategyName:'',
      rectifyName:'',
      visibleAddModal:false
  }
  componentDidMount() {
   
  }

    render() {
      const {visibleAddModal} = this.state;
      const {selectedTeacher,dispatch} = this.props;
      return (
        <div className="setPaper">
            <h2>代课教师</h2>
            <div className="setResult">
              {selectedTeacher.teacherName ? 
                <div className={"teacherAvatar"}>
                  <TeacherAvatar 
                    selectedTeacher={selectedTeacher}
                    key = {selectedTeacher.teacherId}
                    onDel = {(e)=>{
                      dispatch({
                        type: 'release/saveTeacherInfo',
                        payload: {} 
                      })
                    }}
                  />
                  <div className="rechoose"
                    onClick = {(e)=>{
                      this.setState({visibleAddModal:true})
                    }}
                  >重新选择</div>
                </div>  
              :
                <div>
                  <IconButton
                      text = "选择教师"
                      iconName = "iconfont icon-user"
                      className="iconButton"
                      textColor= "textColor"
                      onClick={(e)=>{
                        this.setState({visibleAddModal:true})
                      }}
                  />
                </div>
              }
       
            </div>
          </div>
      );
    }
  }