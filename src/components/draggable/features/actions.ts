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
) => void;

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
  //   setXy(xyRef.current);
  setDeck(removeCard(deckRef.current, xyRef.current));
  draggedId.current.delete(cardId);
  flingSpeed.current = false;
};

// export const flingBTN = (
//   cardId: number,
//   cardWidth: React.RefObject<number>,
//   setDeck: React.Dispatch<React.SetStateAction<CardType[]>>,
//   setXy: React.Dispatch<React.SetStateAction<XYType>>,
//   xyRef: React.RefObject<XYType>,
//   xyPrev: React.RefObject<XYType>,
//   draggedId: React.RefObject<Set<number>>,
//   isCardOut: boolean,
//   removeCard: RemoveCard,
//   deckRef: React.RefObject<CardType[]>,
//   btnsRef: React.RefObject<BtnType>,
//   flingSpeed: React.RefObject<XYType | boolean>
// ) => {
//   if (isCardOut) {
//     cardOutHndlr(cardId, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
//     return;
//   }

//   setXy((prev) => {
//     const speed = (Math.max(window.innerWidth, cardWidth.current * 2) / cardWidth.current) * 3 + 8;
//     return { x: prev.x + speed * (btnsRef.current.left ? -1 : 1), y: prev.y };
//   });
//   xyPrev.current = { ...xyRef.current };
// };
