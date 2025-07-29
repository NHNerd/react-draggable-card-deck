export type XYType = { x: number; y: number };

export type CardType = {
  id: number;
  img: string;
  random?: number;
  btnLR?: 'l' | 'r';
  lastPos?: XYType;
  comeBack?: boolean;
};
export type CardHistoryType = CardType & { lastPos: XYType };

export type BtnType = { left: boolean; right: boolean; back: boolean; flip: boolean };

export type DragsStatusType = {
  id: number;
  dragNum: number;
  card: string;
  status: 'sleep' | 'drag' | 'fling' | 'backToDeck' | 'comeBack';
};
