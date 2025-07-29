import React, { useState, useRef, useEffect, type JSX, Fragment } from 'react';
import { nameFromImg } from './features';
import type { CardType, DragsStatusType } from '../../types/types';
import DebugVisualCss from './DebugVisual.module.css';

type DebugVisualProps = {
  devDragsStatus: DragsStatusType[];
  devDeckVisible: CardType[];
};

function DebugVisual({ devDragsStatus, devDeckVisible }: DebugVisualProps) {
  const [isShow, setIsShow] = useState<boolean>(true);
  const [containerRowsStyle, setContainerRowsStyle] = useState<{ scale: string; opacity: number }>({
    scale: '1',
    opacity: 1,
  });

  return (
    <section className={DebugVisualCss.container}>
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
}

export default DebugVisual;
