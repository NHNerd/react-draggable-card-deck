import React, { useEffect, useRef, useState } from 'react';
import type {
  XYType,
  CardType,
  CardHistoryType,
  BtnType,
  DragsStatusType,
  DevSpeedControlType,
} from '../../../types/types';

import SideGlowCss from './SideGlow.module.css';

type Props = {
  xyRef: React.RefObject<XYType>;
};

const SideGlow = ({ xyRef }: Props) => {
  const halfScreen = window.innerWidth * 0.5;
  const fit = (halfScreen - xyRef.current.x) / halfScreen;

  const center0Offset = (val: number, offset: number): number => {
    return Math.max(0, Math.min((val - offset) * (1 / (1 - offset)), 1));
  };

  const left = center0Offset(fit - 1, 0.15);
  const right = center0Offset(1 - fit, 0.15);

  // TODO сейчас  с исчезновением карты резко пропадает glow

  // TODO все такие нужно полумать как вынести этот элемент на уровень Deck
  return (
    <>
      <div className={SideGlowCss.wrong} style={{ opacity: left }}></div>
      <div className={SideGlowCss.right} style={{ opacity: right }}></div>
    </>
  );
};

export default SideGlow;
