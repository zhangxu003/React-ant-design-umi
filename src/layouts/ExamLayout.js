import React from 'react';
import CommandContainer from "./CommandContainer";
import styles from './CheckLayout.less';

class CheckLayout extends React.PureComponent {

  render() {
    const { children } = this.props;
    return (
      <div className={styles.container} style={{ background: '#000',overflow:'hidden',alignItems: "center",justifyContent: 'center'}}>
        <CommandContainer />
        {children}
      </div>
    );
  }
}

export default CheckLayout;
