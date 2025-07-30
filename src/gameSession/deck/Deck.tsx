import React, { useEffect, useRef, useState, type RefObject } from 'react';
import Draggable from '../../components/draggable/Draggable';
import DeckCss from './Deck.module.css';
import type {
  CardType,
  CardHistoryType,
  DragsStatusType,
  DragsStatusStatusType,
  DevSpeedControlType,
} from '../../types/types';
import gameDeck from '../../features/gameDeck';
import { nameFromImg } from '../../dev/debugVisual/features';
import { dragCountUpdate } from '../../components/draggable/features/actions';

type DeckProps = {
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<{ left: boolean; right: boolean; back: boolean; flip: boolean }>>;
  devDeckRestSet: React.Dispatch<React.SetStateAction<number>>;
  devDeckVisibleSet: React.Dispatch<React.SetStateAction<CardType[]>>;
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>;
  devSpeed: React.RefObject<DevSpeedControlType>;
};

function Deck({ btns, btnsSet, devDeckRestSet, devDeckVisibleSet, setDevDragsStatus, devSpeed }: DeckProps) {
  const dragCountLimit = useRef<number>(5);
  const [dragCount, setDragCount] = useState<number>(5);
  const dragCountRef = useRef<number>(5);

  const [deck, setDeck] = useState<CardType[]>([]);
  const deckRef = useRef<CardType[]>(deck);
  const deckHistory = useRef<CardHistoryType[]>([]);
  const deckHistoryTop = useRef<CardHistoryType | null>(null);

  const [deckVisible, setDeckVisible] = useState<CardType[]>([]);

  const draggedId = useRef<Set<number>>(new Set([]));

  useEffect(() => {
    if (deck.length === 0) return;
    const vis = [...deck].slice(-(dragCountLimit.current + 15));
    setDeckVisible(vis);
    devDeckVisibleSet(vis);

    deckRef.current = deck;

    // Dev
    devDeckRestSet(deck.length);
  }, [deck, dragCountLimit.current]);

  // Only first mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    //dev
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
    if (btns.back) {
      btnsSet((prev) => {
        return { ...prev, back: false };
      });

      if (deckHistory.current.length === 0) {
        deckHistoryTop.current = null;
        return;
      }

      dragCountUpdate(draggedId, dragCountLimit, dragCountRef, dragCount, setDragCount);

      deckHistoryTop.current = deckHistory.current.pop() ?? null;
      const comeBackCard = { ...deckHistoryTop.current, comeBack: true };
      const freshDeck = [...deckRef.current, comeBackCard];
      setDeck(freshDeck);

      draggedId.current.add(comeBackCard.id);

      setDevDragsStatus((prev) => {
        const fresh: DragsStatusType[] = freshDeck.slice(-dragCountRef.current).map((card, i) => {
          let status: DragsStatusStatusType = 'sleep';
          if (card.comeBack) status = 'comeBack';
          else if (card.id === prev[i].id) status = prev[i].status;
          return { id: card.id, dragNum: i, card: nameFromImg([card], 0), status };
        });

        return fresh;
      });
    }
  }, [btns.back, dragCount, dragCountLimit.current]);

  useEffect(() => {
    if (!btns.left && !btns.right) return;
    btnsSet((prev) => {
      return { ...prev, left: false, right: false };
    });

    let notRLDraged: number = 0;
    for (let i = 0; i < draggedId.current.size; i++) {
      if (!deckRef.current[deckRef.current.length - 1 - i]?.btnLR) notRLDraged++;
    }

    const indexTop = deckRef.current.length - 1 - (draggedId.current.size - notRLDraged);
    if (deckRef.current[indexTop].btnLR || deckRef.current[indexTop]?.comeBack) return;

    draggedId.current.add(deckRef.current[indexTop].id);
    deckRef.current[indexTop].btnLR = btns.left ? 'l' : 'r';
    setDeck(deckRef.current);

    dragCountUpdate(draggedId, dragCountLimit, dragCountRef, dragCount, setDragCount);
  }, [btns.left, btns.right]);

  return (
    <div className={DeckCss.deck}>
      {deckVisible.map((card, i) => {
        const rotate = (card.random ?? 0) * 14;

        if (i < deckVisible.length - dragCount)
          return (
            <img
              className={DeckCss.card}
              key={card.id}
              src={card.img}
              alt='card'
              loading='lazy'
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = `${import.meta.env.BASE_URL}back.jpg`;
              }}
              style={{ transform: `rotate(${rotate}deg)` }}
            />
          );

        return (
          <Draggable
            key={card.id}
            draggedId={draggedId}
            deck={deck}
            setDeck={setDeck}
            deckRef={deckRef}
            card={card}
            rotateRand={rotate}
            deckHistory={deckHistory}
            deckHistoryTop={deckHistoryTop}
            setDevDragsStatus={setDevDragsStatus}
            dragCountRef={dragCountRef}
            dragCountLimit={dragCountLimit}
            dragCount={dragCount}
            setDragCount={setDragCount}
            devSpeed={devSpeed}
          >
            {
              <img
                className={DeckCss.card}
                src={card.img}
                alt='card'
                loading='lazy'
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = `${import.meta.env.BASE_URL}back.jpg`; // /react-draggable-card-deck/back.jpg - автоматически, если base задан в Vite.
                }}
              />
            }
          </Draggable>
        );
      })}
    </div>
  );
}

export default Deck;
