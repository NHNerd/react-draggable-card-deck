import { useEffect, useRef, useState } from 'react';
import Draggable from '../../components/draggable/Draggable';
import DeckCss from './Deck.module.css';
import type { CardType, CardHistoryType } from '../../types/types';
import gameDeck from '../../features/gameDeck';

type DeckProps = {
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<{ left: boolean; right: boolean; back: boolean; flip: boolean }>>;
};

function Deck({ btns, btnsSet }: DeckProps) {
  const [deck, setDeck] = useState<CardType[]>(gameDeck());
  const deckRef = useRef<CardType[]>(deck);
  const deckHistory = useRef<CardHistoryType[]>([]);
  const deckHistoryTop = useRef<CardHistoryType | null>(null);

  const [deckVisible, setDeckVisible] = useState<CardType[]>([]);

  //TODO change draggedId to set => has (O1)
  const draggedId = useRef<Set<number>>(new Set());
  // const draggedId = useRef<number[]>([]);
  // const randoms = useRef<number[]>(Array.from({ length: deck.length }, () => (Math.random() - 0.5) * 12));

  useEffect(() => {
    setDeckVisible(deck.slice(-20));
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    if (btns.back) {
      if (deckHistory.current.length === 0) {
        deckHistoryTop.current = null;
        return;
      }

      deckHistoryTop.current = deckHistory.current.pop() ?? null;
      const comeBackCard = { ...deckHistoryTop.current, comeBack: true };
      setDeck([...deckRef.current, comeBackCard]);
      btnsSet((prev) => {
        return { left: prev.left, right: prev.right, back: false, flip: prev.flip };
      });
    }
  }, [btns]);

  return (
    <div className={DeckCss.deck}>
      {deckVisible.map((card, i) => {
        const rotate = (card.random ?? 0) * 14;

        if (i < deckVisible.length - 5)
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
            btns={btns}
            btnsSet={btnsSet}
            draggedId={draggedId}
            deck={deck}
            setDeck={setDeck}
            deckRef={deckRef}
            cardId={card.id}
            rotateRand={rotate}
            deckHistory={deckHistory}
            deckHistoryTop={deckHistoryTop}
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
