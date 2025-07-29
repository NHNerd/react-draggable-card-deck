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
  const [deck, setDeck] = useState<CardType[]>(gameDeck());
  const deckRef = useRef<CardType[]>(deck);
  const deckHistory = useRef<CardHistoryType[]>([]);
  const deckHistoryTop = useRef<CardHistoryType | null>(null);

  const [deckVisible, setDeckVisible] = useState<CardType[]>([]);

  const [btnsLR, setBtnsLR] = useState<{ l: boolean; r: boolean }[]>([]);

  //TODO change draggedId to set => has (O1)
  const draggedId = useRef<Set<number>>(new Set());
  // const draggedId = useRef<number[]>([]);
  // const randoms = useRef<number[]>(Array.from({ length: deck.length }, () => (Math.random() - 0.5) * 12));

  useEffect(() => {
    const vis = [...deck].slice(-20);
    setDeckVisible(vis);
    devDeckVisibleSet(vis);

    deckRef.current = deck;

    // Dev
    devDeckRestSet(deck.length);
  }, [deck, dragCount]);

  const hasInitialized = useRef(false);
  useEffect(() => {
    //dev
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    for (let i = 0; i < dragCount; i++) {
      const indexTop = deck.length - dragCount + i;
      const cardName = nameFromImg(deck, indexTop);
      setDevDragsStatus((prev) => {
        return [...prev, { id: deck[indexTop].id, dragNum: prev.length, card: cardName, status: 'sleep' }];
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

      deckHistoryTop.current = deckHistory.current.pop() ?? null;
      const comeBackCard = { ...deckHistoryTop.current, comeBack: true };
      setDeck([...deckRef.current, comeBackCard]);

      // DEV
      setDevDragsStatus((prev) => {
        const fresh = [];
        for (let i = 0; i < prev.length; i++) {
          if (i === 0) continue;
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
  }, [btns.back]);

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
            indexTop={i}
            card={card}
            rotateRand={rotate}
            deckHistory={deckHistory}
            deckHistoryTop={deckHistoryTop}
            devDragsStatus={devDragsStatus}
            setDevDragsStatus={setDevDragsStatus}
            dragCount={dragCount}
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
