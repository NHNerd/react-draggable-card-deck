import React from 'react';
import type { DevSpeedControlType } from '../../../../types/types';
import type { DevSpeedHndlrType } from '../../types';
import { selectJSX } from './pices';

const devSpeedHndlr: DevSpeedHndlrType = (devSpeed, select) => {
  devSpeed.current = select;
};

type Props = {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>>;
  setContainerRowsStyle: React.Dispatch<React.SetStateAction<{ scale: string; opacity: number }>>;
  DebugVisualCss: Record<string, string>;
  devSpeed: React.RefObject<DevSpeedControlType>;
};

const OptionsMemo: React.FC<Props> = React.memo(
  ({ isShow, setIsShow, setContainerRowsStyle, DebugVisualCss, devSpeed }) => {
    return (
      // <div>TEST</div>
      <div className={DebugVisualCss.optionsWrap}>
        <div className={DebugVisualCss.debugInfoWrap}>
          <input
            onChange={(e) => {
              setIsShow(!isShow);
              setContainerRowsStyle(isShow ? { scale: '1 0.02', opacity: 0 } : { scale: '1', opacity: 1 });
            }}
            className={DebugVisualCss.checkBox}
            type='checkbox'
            id='vehicle1'
            name='vehicle1'
            defaultChecked={true}
          />
          <label htmlFor='vehicle1'>Debug info</label>
        </div>

        <div>⨯</div>

        {selectJSX(
          'Deck',
          'deck',
          ['poker 52', 'Anime 10', 'nums 9999'],
          devSpeedHndlr,
          devSpeed,
          DebugVisualCss
        )}

        <div>⨯</div>

        {selectJSX(
          'Cards Speed',
          'devSpeed',
          ['normal', 'slow', 'very-slow'],
          devSpeedHndlr,
          devSpeed,
          DebugVisualCss
        )}
      </div>
    );
  }
);

export default OptionsMemo;
