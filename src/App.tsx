import React, { useRef, useState } from 'react';

import Bar from './gameSession/bar/Bar';
import Deck from './gameSession/deck/deck';
import Btns from './gameSession/footer/Btns';

import './App.css';

function App() {
  const [btns, btnsSet] = useState<{ left: boolean; right: boolean; back: boolean; flip: boolean }>({
    left: false,
    right: false,
    back: false,
    flip: false,
  });

  return (
    <>
      <section className='gameContainer'>
        <section className='flexChildren1'>
          <Bar />
        </section>
        <section className='flexChildren2'>
          <Deck btns={btns} btnsSet={btnsSet} />
        </section>
        <section className='flexChildren3'>
          <Btns btns={btns} btnsSet={btnsSet} />
        </section>
      </section>
    </>
  );
}

export default App;
