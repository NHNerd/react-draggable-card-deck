import React, { memo } from 'react';

import type { BtnType } from '../../types/types';
import BtnsCss from './Btns.module.css';

type BtnsProps = {
  btnHndlr: (btn: BtnType) => void;
};

const BtnsMemo = memo(({ btnHndlr }: BtnsProps) => {
  return (
    <section className={BtnsCss.footer}>
      <button
        onClick={() => {
          btnHndlr('left');
        }}
        className={BtnsCss.left}
      >
        ⬅️left
      </button>
      <button
        onClick={() => {
          btnHndlr('right');
        }}
        className={BtnsCss.right}
      >
        right➡️
      </button>
      <button
        onClick={() => {
          btnHndlr('back');
        }}
        className={BtnsCss.back}
      >
        back🔙
      </button>
      <button
        onClick={() => {
          btnHndlr('flip');
        }}
        className={BtnsCss.flip}
      >
        flip🔄️
      </button>
    </section>
  );
});

export default BtnsMemo;
