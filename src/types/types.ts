export type XYType = { x: number; y: number };

export type CardType = {
  id: number;
  img: string;
  random?: number;
  btnLR?: 'l' | 'r';
  lastPos?: XYType;
};
export type CardHistoryType = CardType & { lastPos: XYType };

export type BtnType = 'left' | 'right' | 'back' | 'flip';

export type DragsStatusStatusType = 'sleep' | 'drag' | 'fling' | 'backToDeck' | 'comeBack';
export type DragsStatusType = {
  id: number;
  dragNum: number;
  card: string;
  status: DragsStatusStatusType;
};

export type DevSpeedControlType = 'normal' | 'slow' | 'very-slow';
