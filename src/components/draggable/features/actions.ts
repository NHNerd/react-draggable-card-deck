import type { CardType, XYType, BtnType } from '../../../types/types';

type RemoveCard = (deck: CardType[], lastPos: XYType) => CardType[];

export type CardOutHndlrType = (
  cardId: number,
  deckRef: React.RefObject<CardType[]>,
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>,
  xyRef: React.RefObject<XYType>,
  setXy: React.Dispatch<React.SetStateAction<XYType>>,
  draggedId: React.RefObject<Set<number>>,
  removeCard: RemoveCard,
  flingSpeed: React.RefObject<XYType | boolean>
) => CardType[];

export const cardOutHndlr: CardOutHndlrType = (
  cardId,
  deckRef,
  setDeck,
  xyRef,
  setXy,
  draggedId,
  removeCard,
  flingSpeed
) => {
  const zeroTrshHld = 5;
  const deckFresh = removeCard(deckRef.current, {
    x: xyRef.current.x,
    y: Math.abs(xyRef.current.y) < zeroTrshHld ? zeroTrshHld : xyRef.current.y,
  });
  setDeck(deckFresh);
  draggedId.current.delete(cardId);
  flingSpeed.current = false;
  return deckFresh;
};
