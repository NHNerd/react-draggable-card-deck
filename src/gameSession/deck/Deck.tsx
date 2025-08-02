import React, { useEffect, useRef, useState } from 'react';
import Draggable from '../../components/draggable/Draggable';
import DeckCss from './Deck.module.css';
import type {
  CardType,
  CardHistoryType,
  DragsStatusType,
  DragsStatusStatusType,
  DevSpeedControlType,
  XYType,
} from '../../types/types';
import gameDeck from '../../features/gameDeck';
import { nameFromImg, devChangeStatus } from '../../dev/debugVisual/features';
import { dragCountUpdate } from '../../components/draggable/features/actions';

type DeckProps = {
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<{ left: boolean; right: boolean; back: boolean; flip: boolean }>>;
  devDeckRestSet: React.Dispatch<React.SetStateAction<number>>;
  devDeckVisibleSet: React.Dispatch<React.SetStateAction<CardType[]>>;
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>;
  devSpeed: React.RefObject<DevSpeedControlType>;
};

const Deck = ({ btns, btnsSet, devDeckRestSet, devDeckVisibleSet, setDevDragsStatus, devSpeed }: DeckProps) => {
  const dragCountLimit = useRef<number>(5);
  const [dragCount, setDragCount] = useState<number>(5);
  const dragCountRef = useRef<number>(5);

  const [deck, setDeck] = useState<CardType[]>([]);
  const deckRef = useRef<CardType[]>(deck);
  const deckHistory = useRef<CardHistoryType[]>([]);
  const deckHistoryTop = useRef<CardHistoryType | null>(null);

  const [deckVisible, setDeckVisible] = useState<CardType[]>([]);

  const draggedId = useRef<Set<number>>(new Set([]));

  // Я могу вынести glow(right/wrong) на урвовень deck и управлять им by max и min value of xyDragged(всех карт в !== sleep)
  const xyDragged = useRef<XYType[]>([]);

  // Удаление карточки:
  //* I. Clear
  // 0. Add field lastPos
  // 1. Remove field btnLR;
  // 2. draggedId
  // 3. flingSpeed
  //* II. Set
  // 0. Remove card from deck
  // 1. Add to deckHistory
  const closure = () => {
    let result = 0;
    return (n: number = 1) => (result += n);
  };
  const counter1Ref: React.RefObject<(n?: number) => number> = useRef(closure());
  const counter2Ref: React.RefObject<(n?: number) => number> = useRef(closure());

  // console.log('🍒', counter2Ref.current(), 'Deck Re-Render');
  const cardOutHndlr = (cardId: number, direction: 'string', lastPos: XYType, codePoint: string) => {
    // console.log(
    //   `⭕${counter1Ref.current()}`,
    //   cardId,
    //   direction,
    //   `(${Math.floor(lastPos.x)}|${Math.floor(lastPos.y)})`,
    //   codePoint,
    //   draggedId.current
    // );

    setDeck((prevDeck) => {
      let index = -1;
      for (let i = deckRef.current.length - 1; i >= 0; i--) {
        if (deckRef.current[i].id === cardId) {
          index = i;
          break;
        }
      }

      if (index === -1) return prevDeck;

      const removedCard = prevDeck[index];
      const updatedDeck = [...prevDeck.slice(0, index), ...prevDeck.slice(index + 1)];

      delete removedCard.btnLR;

      const zeroTrshld = 5;
      deckHistory.current.push({
        ...removedCard,
        lastPos: { x: lastPos.x, y: Math.abs(lastPos.y) > zeroTrshld ? lastPos.y : zeroTrshld },
      });

      deckRef.current = updatedDeck;
      draggedId.current.delete(cardId);
      dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);

      setDevDragsStatus((prevJ) => {
        const fresh: DragsStatusType[] = updatedDeck.slice(-dragCountRef.current).map((card, i) => {
          const prevStatus = prevJ.find((j) => j.id === card.id)?.status;

          let status: DragsStatusStatusType = 'sleep';
          if (card.comeBack) status = 'comeBack';
          else if (prevStatus) status = prevStatus;
          return { id: card.id, dragNum: i, card: nameFromImg([card], 0), status };
        });
        return fresh;
      });
      return updatedDeck;
    });
  };

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const deckFirst = gameDeck();
    setDeck(deckFirst);

    for (let i = 0; i < dragCountLimit.current; i++) {
      const indexTop = deckFirst.length - dragCountLimit.current + i;
      const cardName = nameFromImg(deckFirst, indexTop);
      setDevDragsStatus((prev) => {
        return [...prev, { id: deckFirst[indexTop].id, dragNum: prev.length, card: cardName, status: 'sleep' }];
      });
    }
  }, []);

  useEffect(() => {
    if (deck.length === 0) return;
    const vis = deck.slice(-(dragCountLimit.current + 15));

    setDeckVisible(vis);
    devDeckVisibleSet(vis);

    deckRef.current = deck;

    // Dev
    devDeckRestSet(deck.length);
  }, [deck, dragCountLimit.current]);

  useEffect(() => {
    if (!btns.back) return;

    if (deckHistory.current.length === 0) {
      deckHistoryTop.current = null;
      return;
    }
    if (deckRef.current.some((card) => card.id === deckHistory.current[deckHistory.current.length - 1].id)) {
      console.warn('🔁 Карта уже в колоде, повторное добавление пропущено');
      return;
    }
    if (draggedId.current.size >= dragCountLimit.current) return;

    deckHistoryTop.current = deckHistory.current.pop() ?? null;
    const comeBackCard = { ...deckHistoryTop.current, comeBack: true };

    setDeck((prev) => {
      const freshDeck = [...prev, comeBackCard];
      deckRef.current = freshDeck;

      draggedId.current.add(comeBackCard.id);
      dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);

      setDevDragsStatus((prevJ) => {
        const fresh: DragsStatusType[] = freshDeck.slice(-dragCountRef.current).map((card, i) => {
          const prevStatus = prevJ.find((j) => j.id === card.id)?.status;

          let status: DragsStatusStatusType = 'sleep';
          if (card.comeBack) status = 'comeBack';
          else if (prevStatus) status = prevStatus;
          return { id: card.id, dragNum: i, card: nameFromImg([card], 0), status };
        });
        return fresh;
      });

      return freshDeck;
    });

    btnsSet((prev) => ({ ...prev, back: false }));
  }, [btns.back]);

  useEffect(() => {
    if (!btns.left && !btns.right) return;
    btnsSet((prev) => ({ ...prev, left: false, right: false }));

    let notRLDraged: number = 0;

    for (let i = 0; i < draggedId.current.size; i++) {
      if (!deckRef.current[deckRef.current.length - 1 - i]?.btnLR) notRLDraged++;
    }

    const indexTop = deckRef.current.length - 1 - (draggedId.current.size - notRLDraged);
    const topCard = deckRef.current[indexTop];

    if (!topCard || topCard?.btnLR || topCard?.comeBack) return;

    draggedId.current.add(topCard.id);
    topCard.btnLR = btns.left ? 'l' : 'r';
    setDeck(deckRef.current);

    dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);

    //? DEV
    setDevDragsStatus((prevJ) => {
      const fresh: DragsStatusType[] = deckRef.current.slice(-dragCountRef.current).map((card, i) => {
        const prevStatus = prevJ.find((j) => j.id === card.id)?.status;

        let status: DragsStatusStatusType = 'sleep';
        if (card.comeBack) status = 'comeBack';
        else if (card.id === topCard.id) status = 'fling';
        else if (prevStatus) status = prevStatus;
        return { id: card.id, dragNum: i, card: nameFromImg([card], 0), status };
      });
      return fresh;
    });
  }, [btns.left, btns.right]);

  const [imgHasError, setImgHasError] = useState(false);

  return (
    <div className={DeckCss.deck}>
      {deckVisible.map((card, i) => {
        const rotate = (card.random ?? 0) * 14;

        const src = imgHasError ? `${import.meta.env.BASE_URL}/anime.png` : card.img;

        //TODO сейчас если в режиме very-slow накликать быстро btn.r | l,
        //TODO тогда почему-то не хватает иногда dragCount для рендера всех карт в движении
        const buffer = 0;
        if (i < deckVisible.length - dragCount - buffer)
          return (
            <img
              className={DeckCss.card}
              key={card.id}
              src={src}
              alt='card'
              loading='lazy'
              onError={() => setImgHasError(true)}
              style={{ transform: `rotate(${rotate}deg)` }}
            />
          );

        return (
          <Draggable
            key={card.id}
            draggedId={draggedId}
            setDeck={setDeck}
            deckRef={deckRef}
            card={card}
            rotateRand={rotate}
            setDevDragsStatus={setDevDragsStatus}
            dragCountRef={dragCountRef}
            dragCountLimit={dragCountLimit}
            setDragCount={setDragCount}
            devSpeed={devSpeed}
            cardOutHndlr={cardOutHndlr}
          >
            {
              <img
                className={DeckCss.card}
                src={src}
                alt='card'
                loading='lazy'
                onError={() => setImgHasError(true)}
              />
            }
          </Draggable>
        );
      })}
    </div>
  );
};

export default Deck;
