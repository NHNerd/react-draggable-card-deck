import type { CardType, DragsStatusType } from '../../types/types';

export const nameFromImg = (devDeckVisible: CardType[], i: number) => {
  const cardImgLngth = devDeckVisible[0]?.img.length;
  return devDeckVisible[i]?.img.slice(cardImgLngth - 6, cardImgLngth - 4);
};

export const devChangeStatus = (
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>,
  card: CardType,
  status: 'sleep' | 'drag' | 'fling' | 'backToDeck' | 'comeBack'
) => {
  setDevDragsStatus((prev) => {
    const fresh = [...prev];
    for (let i = 0; i < prev.length; i++) {
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
  deck: CardType[],
  card: CardType,
  dragCount: number
) => {
  setDevDragsStatus((prev) => {
    const fresh = [];
    let isDel = 1;
    for (let i = 0; i < prev.length; i++) {
      if (prev[i]?.id === card.id) {
        isDel = 0;
        continue;
      }

      const newIndex = i + isDel;
      fresh[newIndex] = { ...prev[i], dragNum: newIndex };
    }
    //TODO
    const newCard = deck[deck.length - 1 - Math.min(dragCount, deck.length - 1)];
    // console.log(deck.length - 1 - Math.min(dragCount, deck.length - 1));
    // console.log(newCard);
    fresh[0] = { id: newCard.id, dragNum: 0, card: nameFromImg([newCard], 0), status: 'sleep' };
    return fresh;
  });
};
