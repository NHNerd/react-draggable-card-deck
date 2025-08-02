import type { CardType, DragsStatusType } from '../../types/types';

export const nameFromImg = (devDeckVisible: CardType[], i: number) => {
  const cardImgLngth = devDeckVisible[0]?.img.length;
  return devDeckVisible[i]?.img.slice(cardImgLngth - 6, cardImgLngth - 4);
};

export const devChangeStatus = (
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>,
  card: CardType,
  status: 'sleep' | 'drag' | 'fling' | 'backToDeck' | 'comeBack',
  dragCountRef: React.RefObject<number>
) => {
  setDevDragsStatus((prev) => {
    const fresh = [...prev].slice(-dragCountRef.current);

    for (let i = 0; i < dragCountRef.current; i++) {
      if (!prev[i]?.id) {
        if (fresh.findIndex((item) => item?.id === card.id) !== -1) continue;
        fresh.unshift({ id: card.id, dragNum: 0, card: nameFromImg([card], 0), status: 'drag' });
        continue;
      }
      if (prev[i].id === card.id) {
        prev[i].status = status;
        break;
      }
    }
    return fresh;
  });
};

export const devInfoCardOut = (
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>,
  deckRef: React.RefObject<CardType[]>,
  card: CardType,
  dragCountRef: React.RefObject<number>
) => {
  setDevDragsStatus((prev) => {
    const fresh = [];
    let isDel = 1;
    for (let i = 0; i < dragCountRef.current; i++) {
      if (!prev[i]?.id) return prev;
      if (prev[i]?.id === card.id) {
        isDel = 0;
        continue;
      }

      const newIndex = i + isDel;
      fresh[newIndex] = { ...prev[i], dragNum: newIndex };
    }
    //TODO
    const newCard =
      deckRef.current[deckRef.current.length - 1 - Math.min(dragCountRef.current, deckRef.current.length - 1)];
    fresh[0] = { id: newCard.id, dragNum: 0, card: nameFromImg([newCard], 0), status: 'sleep' };
    return fresh;
  });
};
