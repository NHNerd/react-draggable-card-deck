import React, { useEffect, useRef, useState } from 'react';
import type { XYType, CardType, CardHistoryType, BtnType, DragsStatusType } from '../../types/types';
import { fling } from './features/calc';
import { cardOutHndlr } from './features/actions.ts';
// import { cardOutHndlr, CardOutHndlrType } from './features/actions.ts';
import { nameFromImg, devChangeStatus, devInfoCardOut } from '../../dev/debugVisual/features.ts';
import DraggableCss from './Draggable.module.css';

type RemoveCardType = (deck: CardType[], lastPos: XYType) => CardType[];

type Props = {
  children: React.ReactNode;
  draggedId: React.RefObject<Set<number>>;
  deck: CardType[];
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>;
  deckRef: React.RefObject<CardType[]>;
  index: number;
  card: CardType;
  rotateRand: number;
  deckHistory: React.RefObject<CardHistoryType[]>;
  deckHistoryTop: React.RefObject<CardHistoryType> | React.RefObject<null>;
  devDragsStatus: DragsStatusType[];
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>;
  dragCount: number;
};

const Draggable = ({
  children,
  draggedId,
  deck,
  setDeck,
  deckRef,
  index,
  card,
  rotateRand,
  deckHistory,
  deckHistoryTop,
  devDragsStatus,
  setDevDragsStatus,
  dragCount,
}: Props) => {
  const pointerIdRef = useRef<number | null>(null); //* Multi-touch

  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardWidth = useRef<number>(100);

  const isDraggingRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const xyStart = useRef<XYType>({ x: 0, y: 0 });
  const xyMove = useRef<XYType>({ x: 0, y: 0 });
  const xyPrev = useRef<XYType>({ x: 0, y: 0 });

  const [xy, setXy] = useState<XYType>({ x: 0, y: 0 });
  const xyRef = useRef(xy);

  const dragHistory = React.useRef<{ pos: XYType; time: number }[]>([]);
  const flingSpeed = React.useRef<XYType | boolean>(false);

  const comeToDeck50TrshHld = React.useRef<XYType | boolean>(false);

  const removeCard: RemoveCardType = (deck, lastPos) => {
    return [...deck].filter((cardItem) => {
      if (cardItem.id === card.id) {
        delete cardItem.btnLR;
        deckHistory.current.push({ ...cardItem, lastPos });
      }
      return cardItem.id !== card.id;
    });
  };

  useEffect(() => {
    xyRef.current = xy;
  }, [xy]);

  const isComeBack = useRef<boolean>(false);
  useEffect(() => {
    isComeBack.current = deckRef.current.some(
      (cardItem) => cardItem.id === card.id && cardItem?.comeBack === true
    );

    if (isComeBack.current && xyRef.current.x === 0 && deckHistoryTop.current?.lastPos) {
      setXy(deckHistoryTop.current?.lastPos);
    }
  }, [deck.length]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const isCardOut = Math.abs(xyRef.current.x) > window.innerWidth * 0.5 + cardWidth.current;

      frameId = requestAnimationFrame(animate);

      //!--------------------------------------------------------------
      if (
        //* Fling BTN
        draggedId.current.has(card.id) &&
        card?.btnLR
      ) {
        if (isCardOut) {
          cardOutHndlr(card.id, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
          // DEV
          devInfoCardOut(setDevDragsStatus, deckRef.current, card, dragCount);
          return;
        }

        setXy((prev) => {
          const speedX = (Math.max(window.innerWidth, cardWidth.current * 2) / cardWidth.current) * 3 + 8;
          const speedY = 0.93 + speedX / 1600;
          return { x: prev.x + speedX * (card.btnLR === 'l' ? -1 : 1), y: prev.y * speedY };
        });
        xyPrev.current = { ...xyRef.current };

        // DEV
        devChangeStatus(setDevDragsStatus, card, 'fling');
      }
      //!--------------------------------------------------------------
      else if (isDraggingRef.current) {
        //* Drag
        if (xyMove.current.x || xyMove.current.y) {
          const dx = xyMove.current.x - xyStart.current.x;
          const dy = xyMove.current.y - xyStart.current.y;
          setXy({
            x: xyPrev.current.x + dx,
            y: xyPrev.current.y + dy,
          });
        }
      } else if (xyRef.current.x !== 0 && xyRef.current.y !== 0) {
        if (!flingSpeed.current) {
          //* Fling Edge
          if (
            Math.abs(xyRef.current.x) > window.innerWidth * 0.5 - window.innerWidth * 0.1 &&
            !card?.btnLR &&
            !card?.comeBack
          ) {
            if (isCardOut) {
              cardOutHndlr(card.id, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
              // DEV
              devInfoCardOut(setDevDragsStatus, deckRef.current, card, dragCount);

              return;
            }
            setXy((prev) => {
              return { x: prev.x + 10 * Math.sign(xyRef.current.x), y: prev.y };
            });
            xyPrev.current = { ...xyRef.current };
          } else {
            //* Return to deck
            if (Math.abs(xyRef.current.x) < 0.5 && Math.abs(xyRef.current.y) < 0.5) {
              xyPrev.current = { x: 0, y: 0 };
              draggedId.current.delete(card.id);
              setXy({ x: 0, y: 0 });
              setDeck((prev) => {
                const fresh = [...prev];
                for (let i = 0; i < fresh.length; i++) {
                  if (fresh[i].id === card.id) {
                    delete fresh[i]?.comeBack;
                    delete fresh[i]?.btnLR;
                  }
                }
                comeToDeck50TrshHld.current = false;
                return fresh;
              });

              // DEV
              setDevDragsStatus((prev) => {
                const fresh = [...prev];
                for (let i = 0; i < prev.length; i++) {
                  if (prev[i].id === card.id) {
                    fresh[i].status = 'sleep';
                    break;
                  }
                }
                return fresh;
              });
              return;
            }

            // Clear cards props for the back btn come active
            if (Math.abs(xyRef.current.x) < window.innerWidth * 0.2 && !comeToDeck50TrshHld.current) {
              comeToDeck50TrshHld.current = true;
              setDeck((prev) => {
                const fresh = [...prev];
                for (let i = 0; i < fresh.length; i++) {
                  if (fresh[i].id === card.id) {
                    delete fresh[i]?.comeBack;
                    delete fresh[i]?.btnLR;
                  }
                }
                return fresh;
              });
            }

            setXy((prev) => {
              xyPrev.current = { ...xyRef.current };
              // const speed = 0.88;
              const speed = 0.96;
              return { x: prev.x * speed, y: prev.y * speed };
            });

            //Dev
            devChangeStatus(setDevDragsStatus, card, 'backToDeck');
          }
        } else {
          //* Fling
          if (isCardOut) {
            const deckFresh = cardOutHndlr(
              card.id,
              deckRef,
              setDeck,
              xyRef,
              setXy,
              draggedId,
              removeCard,
              flingSpeed
            );
            // DEV
            devInfoCardOut(setDevDragsStatus, deckRef.current, card, dragCount);
            return;
          }

          setXy((prev) => {
            const speed = flingSpeed.current as XYType;
            return { x: prev.x + speed.x * 8, y: prev.y + speed.y * 6 };
          });
          xyPrev.current = { ...xyRef.current };
          // DEV
          devChangeStatus(setDevDragsStatus, card, 'fling');
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    console.log('initialisation eventListners');
    if (!cardRef.current) return;
    const rect = cardRef.current?.getBoundingClientRect();
    cardWidth.current = rect.width;

    const hndlrStart = (e: PointerEvent) => {
      e.preventDefault();

      if (isDraggingRef.current) return;
      //TODO
      const cardIndex = deckRef.current.findIndex((cardItem) => cardItem.id === card.id);
      const topIndex = deckRef.current.length - 1;
      const draggedCount = draggedId.current.size;
      const isDraggable = cardIndex >= topIndex - draggedCount;

      if (!isDraggable) return; // только top card || next card после поднятой || all cards выше поднятой
      if (pointerIdRef.current !== null) return; // уже кто-то тащит

      delete deckRef.current[cardIndex]?.btnLR;
      delete deckRef.current[cardIndex]?.lastPos;
      delete deckRef.current[cardIndex]?.comeBack;
      setDeck(deckRef.current);

      comeToDeck50TrshHld.current = false;

      xyStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      isDraggingRef.current = true;
      setIsDragging(true);

      pointerIdRef.current = e.pointerId;

      draggedId.current.add(card.id);

      dragHistory.current = [{ pos: { x: e.clientX, y: e.clientY }, time: performance.now() }];

      // console.log('🍏start');

      // dev
      //TODO DEV

      devChangeStatus(setDevDragsStatus, card, 'drag');
    };

    const hndlrMove = (e: PointerEvent) => {
      e.preventDefault();
      if (e.pointerId !== pointerIdRef.current) return;

      if (!isDraggingRef.current) return;
      xyMove.current = {
        x: e.clientX,
        y: e.clientY,
      };

      dragHistory.current.push({ pos: { x: e.clientX, y: e.clientY }, time: performance.now() });
      // оставляем только последние 5 точек
      if (dragHistory.current.length > 5) dragHistory.current = dragHistory.current.slice(-5);

      // console.log('🍇move');
    };

    const hndlrEnd = (e: PointerEvent) => {
      e.preventDefault();
      if (e.pointerId !== pointerIdRef.current) return;

      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsDragging(false);

      xyPrev.current = { ...xyRef.current };

      // console.log('🍅end');
      //Clear
      xyMove.current = { x: 0, y: 0 };
      pointerIdRef.current = null;

      flingSpeed.current = fling(dragHistory);
      dragHistory.current = [];
    };

    cardRef.current.addEventListener('pointerdown', hndlrStart);
    window.addEventListener('pointermove', hndlrMove);
    window.addEventListener('pointerup', hndlrEnd);
    window.addEventListener('pointerleave', hndlrEnd);
    window.addEventListener('pointercancel', hndlrEnd);
    return () => {
      cardRef?.current?.removeEventListener('pointerdown', hndlrStart);
      window.removeEventListener('pointermove', hndlrMove);
      window.removeEventListener('pointerup', hndlrEnd);
      window.removeEventListener('pointerleave', hndlrEnd);
      window.removeEventListener('pointercancel', hndlrEnd);
    };
  }, []); // слушатель создаётся ОДИН раз

  return (
    <div
      ref={cardRef}
      className={DraggableCss.pos}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        transform: `translate(${xy.x}px, ${xy.y}px) rotate(${rotateRand}deg)`,
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <div className={DraggableCss.scale} style={{ scale: `${isDragging ? 1.2 : 1}` }}>
        {children}
      </div>
    </div>
  );
};

export default Draggable;
// {/* rotate(${(cardRandom ?? 0) * 14 * 4}deg */}
