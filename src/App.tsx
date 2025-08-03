import React, { useRef, useState } from 'react';

import Bar from './gameSession/bar/Bar';
import Deck from './gameSession/deck/Deck';
import Btns from './gameSession/footer/Btns';
import About from './about/About';
import DebugVisual from './dev/debugVisual/DebugVisual';
import type { CardType, DragsStatusType, DevSpeedControlType, BtnType } from './types/types';

import './App.css';

function App() {
  const btnHndlr = (action: BtnType): void => {
    deckBtnHndlrRef.current?.(action);
  };

  const deckBtnHndlrRef = useRef<((action: BtnType) => void) | null>(null);

  const [devDeckRest, devDeckRestSet] = useState<number>(0);
  const [devDragsStatus, setDevDragsStatus] = useState<DragsStatusType[]>([]);
  const [devDeckVisible, devDeckVisibleSet] = useState<CardType[]>([]);
  const devSpeed = useRef<DevSpeedControlType>('normal');

  return (
    <>
      <section className='gameContainer'>
        <section className='flexChildren1'>
          <Bar devDeckRest={devDeckRest} />
        </section>
        <section className='flexChildren2'>
          <Deck
            setBtnHndlr={(hndlr) => {
              deckBtnHndlrRef.current = hndlr;
            }}
            devDeckRestSet={devDeckRestSet}
            devDeckVisibleSet={devDeckVisibleSet}
            setDevDragsStatus={setDevDragsStatus}
            devSpeed={devSpeed}
          />
        </section>
        <section className='flexChildren3'>
          <Btns btnHndlr={btnHndlr} />
        </section>
      </section>

      <DebugVisual devDragsStatus={devDragsStatus} devDeckVisible={devDeckVisible} devSpeed={devSpeed} />
      <About />
    </>
  );
}

export default App;
