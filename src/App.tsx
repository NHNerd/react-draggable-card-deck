import React, { useRef, useState } from 'react';

import Bar from './gameSession/bar/Bar';
import Deck from './gameSession/deck/Deck';
import Btns from './gameSession/footer/Btns';
import DebugVisual from './dev/debugVisual/DebugVisual';
import type { CardType, DragsStatusType } from './types/types';

import './App.css';

function App() {
  const [btns, btnsSet] = useState<{ left: boolean; right: boolean; back: boolean; flip: boolean }>({
    left: false,
    right: false,
    back: false,
    flip: false,
  });
  const [devDeckRest, devDeckRestSet] = useState<number>(0);
  const [devDragsStatus, setDevDragsStatus] = useState<DragsStatusType[]>([]);
  const [devDeckVisible, devDeckVisibleSet] = useState<CardType[]>([]);

  return (
    <>
      <section className='gameContainer'>
        <section className='flexChildren1'>
          <Bar devDeckRest={devDeckRest} />
        </section>
        <section className='flexChildren2'>
          <Deck
            btns={btns}
            btnsSet={btnsSet}
            devDeckRestSet={devDeckRestSet}
            devDeckVisibleSet={devDeckVisibleSet}
            devDragsStatus={devDragsStatus}
            setDevDragsStatus={setDevDragsStatus}
          />
        </section>
        <section className='flexChildren3'>
          <Btns btns={btns} btnsSet={btnsSet} />
        </section>
      </section>

      <DebugVisual devDragsStatus={devDragsStatus} devDeckVisible={devDeckVisible} />
    </>
  );
}

export default App;
