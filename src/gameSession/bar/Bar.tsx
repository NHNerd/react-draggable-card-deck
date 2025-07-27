import { useEffect, useRef, useState } from 'react';

import BarCss from './Bar.module.css';

function Bar() {
  return (
    <section className={BarCss.header}>
      <div className={BarCss.bar}>BAR</div>
    </section>
  );
}

export default Bar;
