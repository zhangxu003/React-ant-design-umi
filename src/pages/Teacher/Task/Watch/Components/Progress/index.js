import React, { Component } from 'react';
import styles from './index.less';

class Progress extends Component {
  componentDidMount() {}

  render() {
    const { tipDecript } = this.props;
    const pro = tipDecript.split('_').join('.');
    console.log(pro);
    return (
      <span className={styles.progressTitle}>{pro}</span>
      // <Tooltip placement="top" title={tipDecript}>
      //   <div className={cn(styles.progressTest, 'progress' + data)}>
      //     {counts.length > 0 &&
      //       counts.map((item, index) => {
      //         if (item !== 'SPLITTER') {
      //           if (data === 'complete') {
      //             return type === 'TT_2' && item === 'RECALL' ? (
      //               ''
      //             ) : (
      //               <span key={item} style={{ background: '#03C46B' }} />
      //             );
      //           }
      //           if (data[index] && data[index] === 'F') {
      //             return type === 'TT_2' && item === 'RECALL' ? (
      //               ''
      //             ) : (
      //               <span key={item} style={{ background: '#03C46B' }} />
      //             );
      //           }
      //           if (data[index] && data[index] === 'S') {
      //             return type === 'TT_2' && item === 'RECALL' ? (
      //               ''
      //             ) : (
      //               <span key={item} style={{ background: 'rgba(255,153,0,1)' }} />
      //             );
      //           }
      //           if (data[index] && data[index] === 'P') {
      //             return type === 'TT_2' && item === 'RECALL' ? (
      //               ''
      //             ) : (
      //               <span key={item} style={{ background: '#B4EDD3' }} />
      //             );
      //           }
      //           return type === 'TT_2' && item === 'RECALL' ? '' : <span key={item} />;
      //         }
      //         return '';
      //       })}
      //   </div>
      // </Tooltip>
    );
  }
}

export default Progress;
