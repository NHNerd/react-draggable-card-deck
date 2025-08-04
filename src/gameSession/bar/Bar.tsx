import { useRef, memo } from 'react';

import BarCss from './Bar.module.css';

const createMaxClosure = () => {
  let max = -Infinity;

  return (num: number) => {
    if (num > max) max = num;
    return max;
  };
};

type BarProps = {
  devDeckRest: number;
};

const BarMemo = memo(({ devDeckRest }: BarProps) => {
  const maxClosure = useRef(createMaxClosure());

  return (
    <section className={BarCss.header}>
      <div
        className={BarCss.bar}
        style={{
          transform: `scaleX(${
            (100 / maxClosure.current(devDeckRest)) * (maxClosure.current(devDeckRest) - devDeckRest)
          }%)`,
        }}
      ></div>
      <div className={BarCss.text}>
        {devDeckRest}/{maxClosure.current(devDeckRest)}
      </div>
    </section>
  );
});

export default BarMemo;
