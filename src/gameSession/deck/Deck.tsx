import { useEffect, useRef, useState } from 'react';
import Draggable from '../../components/draggable/Draggable';
import DeckCss from './Deck.module.css';
import type { CardType, CardHistoryType, DragsStatusType } from '../../types/types';
import gameDeck from '../../features/gameDeck';
import { nameFromImg } from '../../dev/debugVisual/features';

type DeckProps = {
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<{ left: boolean; right: boolean; back: boolean; flip: boolean }>>;
  devDeckRestSet: React.Dispatch<React.SetStateAction<number>>;
  devDeckVisibleSet: React.Dispatch<React.SetStateAction<CardType[]>>;
  devDragsStatus: DragsStatusType[];
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>;
};

function Deck({
  btns,
  btnsSet,
  devDeckRestSet,
  devDeckVisibleSet,
  devDragsStatus,
  setDevDragsStatus,
}: DeckProps) {
  const [dragCount, setDragCount] = useState<number>(5);
  const dragCountRef = useRef<number>(5);
  const devForCount = useRef<number>(5);

  const [deck, setDeck] = useState<CardType[]>([]);
  const deckRef = useRef<CardType[]>(deck);
  const deckHistory = useRef<CardHistoryType[]>([]);
  const deckHistoryTop = useRef<CardHistoryType | null>(null);

  const [deckVisible, setDeckVisible] = useState<CardType[]>([]);

  const draggedId = useRef<Set<number>>(new Set([]));

  useEffect(() => {
    if (deck.length === 0) return;
    const vis = [...deck].slice(-20);
    setDeckVisible(vis);
    devDeckVisibleSet(vis);

    deckRef.current = deck;

    // Dev
    devDeckRestSet(deck.length);
  }, [deck, dragCount]);

  // Only first mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    //dev
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const deckFirst = gameDeck();
    setDeck(deckFirst);

    for (let i = 0; i < dragCount; i++) {
      const indexTop = deckFirst.length - dragCount + i;
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

      const size1 = 5;
      const size2 = 15;
      const draggedIdSize = draggedId.current.size;
      if (draggedIdSize >= dragCount) {
        setDragCount(size2);
        dragCountRef.current = size2;
        return;
      } else if (dragCount === size2) {
        setDragCount(size1);
        dragCountRef.current = size1;
      }

      deckHistoryTop.current = deckHistory.current.pop() ?? null;
      const comeBackCard = { ...deckHistoryTop.current, comeBack: true };
      setDeck([...deckRef.current, comeBackCard]);

      draggedId.current.add(comeBackCard.id);

      // DEV
      //TODO
      devForCount.current = Math.max(size1, Math.min(dragCount, draggedIdSize));

      setDevDragsStatus((prev) => {
        const fresh = [];
        // console.log('🍒', devForCount.current);
        for (let i = 0; i < devForCount.current; i++) {
          if (i === 0) continue;
          if (!prev[i]) {
            fresh[i - 1] = null;
            continue;
          }
          fresh[i - 1] = { ...prev[i], dragNum: prev[i].dragNum - 1 };
        }
        const maxI = dragCount - 1;
        fresh[maxI] = {
          id: comeBackCard.id,
          dragNum: maxI,
          card: nameFromImg([comeBackCard], 0),
          status: 'comeBack',
        };
        return fresh;
      });
    }
  }, [btns.back, dragCount]);

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
    // console.log(deckRef.current[indexTop]);
    if (deckRef.current[indexTop].btnLR || deckRef.current[indexTop]?.comeBack) return;

    draggedId.current.add(deckRef.current[indexTop].id);
    deckRef.current[indexTop].btnLR = btns.left ? 'l' : 'r';
    setDeck(deckRef.current);
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
                target.src = '/back.jpg';
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
            devForCount={devForCount}
          >
            {
              <img
                className={DeckCss.card}
                src={card.img}
                alt='card'
                loading='lazy'
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/back.jpg';
                }}
                // style={{ transform: rotate }}
              />
            }
          </Draggable>
        );
      })}
    </div>
  );
}

export default Deck;
