import React, { useState, Fragment } from 'react';
import { nameFromImg } from './features';
import type { CardType, DragsStatusType, DevSpeedControlType } from '../../types/types';
import OptionsMemo from './components/options/Options';
import DebugVisualCss from './DebugVisual.module.css';

type DebugVisualProps = {
  devDragsStatus: DragsStatusType[];
  devDeckVisible: CardType[];
  devSpeed: React.RefObject<DevSpeedControlType>;
};

const DebugVisual = ({ devDragsStatus, devDeckVisible, devSpeed }: DebugVisualProps) => {
  const [isShow, setIsShow] = useState<boolean>(true);
  const [containerRowsStyle, setContainerRowsStyle] = useState<{ scale: string; opacity: number }>({
    scale: '1',
    opacity: 1,
  });

  return (
    <section className={DebugVisualCss.container}>
      <OptionsMemo
        isShow={isShow}
        setIsShow={setIsShow}
        setContainerRowsStyle={setContainerRowsStyle}
        DebugVisualCss={DebugVisualCss}
        devSpeed={devSpeed}
      />

      <div className={DebugVisualCss.containerRows} style={containerRowsStyle}>
        <div className={DebugVisualCss.textFlexRow}>
          <div className={DebugVisualCss.draggableCardsTitle}>Draggable Cards&nbsp;</div>
          <div className={DebugVisualCss.draggableCardsTitle} style={{ color: 'yellow' }}>
            ({devDragsStatus.length})
          </div>
        </div>

        {devDragsStatus.map((drag, i) => {
          const total = devDragsStatus.length;
          const hue = Math.round((i / total) * 360);
          const color = `hsl(${hue}, 100%, 70%)`;

          if (!drag) return <div style={{ color }}>null</div>;

          const debugFields = [
            { text: 'dragNum', val: drag.dragNum },
            { text: 'card', val: drag.card },
            { text: 'status', val: drag.status },
          ];

          return (
            <div key={i} className={DebugVisualCss.textFlexRow}>
              {debugFields.map((item, j) => {
                return (
                  <Fragment key={j}>
                    <div className={DebugVisualCss.text}>{item.text}:&nbsp;</div>
                    <div className={DebugVisualCss.value} style={{ color }}>
                      {item.val}
                    </div>
                    {j < debugFields.length - 1 && <div className={DebugVisualCss.text}>&nbsp;→&nbsp;</div>}
                  </Fragment>
                );
              })}
            </div>
          );
        })}
        <div className={DebugVisualCss.textFlexRow}>
          <div className={DebugVisualCss.visibleCardsTitle}>Visible Cards&nbsp;</div>
          <div className={DebugVisualCss.visibleCardsTitle} style={{ color: 'yellow' }}>
            ({devDeckVisible.length})
          </div>
        </div>

        <div className={DebugVisualCss.textFlexRow}>
          <div className={DebugVisualCss.text}>count:&nbsp;</div>
          <div style={{ color: 'yellow' }}>
            [ {nameFromImg(devDeckVisible, 0)}, ... , {nameFromImg(devDeckVisible, devDeckVisible.length - 2)},{' '}
            {nameFromImg(devDeckVisible, devDeckVisible.length - 1)} ]
          </div>
        </div>
      </div>
    </section>
  );
};

export default DebugVisual;
