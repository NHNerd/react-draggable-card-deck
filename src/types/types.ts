export type XYType = { x: number; y: number };

export type CardType = { id: number; img: string; random?: number };
export type CardHistoryType = CardType & { lastPos: XYType };

export type BtnType = { left: boolean; right: boolean; back: boolean; flip: boolean };
