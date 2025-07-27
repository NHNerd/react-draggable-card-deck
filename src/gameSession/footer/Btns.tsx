import { useEffect, useRef, useState } from 'react';

import BtnsCss from './Btns.module.css';

type BtnsProps = {
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<{ left: boolean; right: boolean; back: boolean; flip: boolean }>>;
};

function Btns({ btns, btnsSet }: BtnsProps) {
  // setBtns({ left: false, right: false, back: false, flip: false });

  return (
    <section className={BtnsCss.footer}>
      <button
        onClick={() => {
          btnsSet({ left: true, right: false, back: false, flip: false });
        }}
        className={BtnsCss.left}
      >
        ⬅️left
      </button>
      <button
        onClick={() => {
          btnsSet({ left: false, right: true, back: false, flip: false });
        }}
        className={BtnsCss.right}
      >
        right➡️
      </button>
      <button
        onClick={() => {
          btnsSet({ left: false, right: false, back: true, flip: false });
        }}
        className={BtnsCss.back}
      >
        back🔙
      </button>
      <button
        onClick={() => {
          btnsSet({ left: false, right: false, back: false, flip: true });
        }}
        className={BtnsCss.flip}
      >
        flip🔄️
      </button>
    </section>
  );
}

export default Btns;
