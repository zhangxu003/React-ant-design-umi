import React, { Component } from 'react';
import {  Icon,Button } from 'antd';
import { formatMessage} from 'umi/locale';
import styles from './index.less';

class RaiseHands extends Component {


componentDidMount() {}

removeCurrent=(id)=>{
  console.log(id)
  const {props} = this;
  if(id!=='all') {
    props.removeCurrentStudent(id)
  }
  else {
    props.removeAll()
  }
}

 render() {
   const {raiseData} = this.props
    return (

      <div className={styles.raise} style={{ display:(raiseData.length>0?'block':'none') }}>
        <div className={styles.navTop}>
          <Icon className={styles.icon} type="caret-down" theme="filled" color="#000000" />
          <span className={styles.userUp}>{formatMessage({id:"task.text.StudentsRaiseTheirHands",defaultMessage:"学生举手"})}({raiseData.length})</span><span className={styles.fr} onClick={()=>this.removeCurrent('all')}>清空</span>
        </div>
        <ul>
          {
            raiseData.map((item)=>
              <li key={item.identifyCode}>
                <i className="iconfont icon-raise-hand" />

                {
                  item.identifyCode ? (
                    <>
                      {item.userName}
                      <span className="pd20">{formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})} {item.seatNo}</span>
                      {formatMessage({id:"task.text.studentCode",defaultMessage:"考号"})} {item.identifyCode}
                    </>
                  ) : (<>{formatMessage({id:"task.text.IPAddress",defaultMessage:"IP地址"})} {item.ipAddress}</>)
                }
                <Button className={styles.fr} onClick={()=>this.removeCurrent(item.identifyCode)}>{formatMessage({id:"task.text.ToDealWith",defaultMessage:"去处理"})}</Button>
              </li>
           )
          }

        </ul>
      </div>

    );
  }
}

export default RaiseHands;
