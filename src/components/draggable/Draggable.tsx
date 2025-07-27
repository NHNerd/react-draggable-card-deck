import React, { useEffect, useRef, useState } from 'react';
import type { XYType, CardType, CardHistoryType, BtnType } from '../../types/types';
import { fling } from './features/calc';
import { cardOutHndlr } from './features/actions.ts';
import type { CardOutHndlrType } from './features/actions.ts';
// import { cardOutHndlr, CardOutHndlrType } from './features/actions.ts';
import DraggableCss from './Draggable.module.css';

type RemoveCardType = (deck: CardType[], lastPos: XYType) => CardType[];

const flingBtnHndlr = (
  isCardOut: boolean,
  cardOutHndlr: CardOutHndlrType,
  cardId: number,
  deckRef: React.RefObject<CardType[]>,
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>,
  xyRef: React.RefObject<XYType>,
  setXy: React.Dispatch<React.SetStateAction<XYType>>,
  xyPrev: React.RefObject<XYType>,
  draggedId: React.RefObject<Set<number>>,
  removeCard: RemoveCardType,
  flingSpeed: React.RefObject<XYType | boolean>,
  cardWidth: React.RefObject<number>,
  btnsRef: React.RefObject<BtnType>
) => {
  if (isCardOut) {
    cardOutHndlr(cardId, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
    console.log(deckRef);
    return;
  }

  setXy((prev) => {
    const speed = (Math.max(window.innerWidth, cardWidth.current * 2) / cardWidth.current) * 3 + 8;
    return { x: prev.x + speed * (btnsRef.current.left ? -1 : 1), y: prev.y };
  });
  xyPrev.current = { ...xyRef.current };
};

type Props = {
  children: React.ReactNode;
  btns: { left: boolean; right: boolean; back: boolean; flip: boolean };
  btnsSet: React.Dispatch<React.SetStateAction<BtnType>>;
  draggedId: React.RefObject<Set<number>>;
  deck: CardType[];
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>;
  deckRef: React.RefObject<CardType[]>;
  cardId: number;
  rotateRand: number;
  deckHistory: React.RefObject<CardHistoryType[]>;
  deckHistoryTop: React.RefObject<CardHistoryType> | React.RefObject<null>;
};

const Draggable = ({
  children,
  btns,
  btnsSet,
  draggedId,
  deck,
  setDeck,
  deckRef,
  cardId,
  rotateRand,
  deckHistory,
  deckHistoryTop,
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

  const btnsRef = useRef<{ left: boolean; right: boolean; back: boolean; flip: boolean }>(btns);

  const comeBack = React.useRef<XYType | boolean>(false);

  const removeCard: RemoveCardType = (deck, lastPos) => {
    return [...deck].filter((card) => {
      if (card.id === cardId) deckHistory.current.push({ ...card, lastPos });
      return card.id !== cardId;
    });
  };

  useEffect(() => {
    xyRef.current = xy;
  }, [xy]);

  useEffect(() => {
    btnsRef.current = btns;

    if (btns.left || btns.right) {
      const topMinusDragged = deckRef.current[deckRef.current.length - 1 - draggedId.current.size].id;
      if (cardId === topMinusDragged) draggedId.current.add(cardId);
    }
  }, [btns.left, btns.right]);

  const isComeBack = useRef<boolean>(false);
  useEffect(() => {
    isComeBack.current = deckRef.current.some((card) => card.id === cardId && card.comeBack === true);
    console.log(xyRef.current.x);
    if (isComeBack.current && xyRef.current.x === 0 && deckHistoryTop.current?.lastPos) {
      setXy(deckHistoryTop.current?.lastPos);
    }
  }, [deck.length]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const isCardOut = Math.abs(xyRef.current.x) > window.innerWidth * 0.5 + cardWidth.current;

      frameId = requestAnimationFrame(animate);

      if (isDraggingRef.current) {
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
          //!
          if (Math.abs(xyRef.current.x) > window.innerWidth * 0.5 - window.innerWidth * 0.1 && !isComeBack) {
            if (isCardOut) {
              cardOutHndlr(cardId, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
              return;
            }
            setXy((prev) => {
              return { x: prev.x + 10 * Math.sign(xyRef.current.x), y: prev.y };
            });
            xyPrev.current = { ...xyRef.current };
          } else {
            //* Return to deck
            setXy((prev) => {
              // чтобы избежать долгого подьезда на милипиксили
              if (Math.abs(prev.x) < 0.5 && Math.abs(prev.y) < 0.5) {
                xyPrev.current = { x: 0, y: 0 };
                draggedId.current.delete(cardId);
                return { x: 0, y: 0 };
              }

              xyPrev.current = { ...xyRef.current };
              // const speed = 0.88;
              const speed = 0.96;
              return { x: prev.x * speed, y: prev.y * speed };
            });
          }
        } else {
          //* Fling
          if (isCardOut) {
            cardOutHndlr(cardId, deckRef, setDeck, xyRef, setXy, draggedId, removeCard, flingSpeed);
            return;
          }
          setXy((prev) => {
            return { x: prev.x + flingSpeed.current.x * 8, y: prev.y + flingSpeed.current.y * 6 };
          });
          xyPrev.current = { ...xyRef.current };
        }
      } else if (
        //* Fling BTN
        // (btnsRef.current.left || btnsRef.current.right) &&
        draggedId.current.has(cardId)
      ) {
        // нужно заблокировать ее для касания

        flingBtnHndlr(
          isCardOut,
          cardOutHndlr,
          cardId,
          deckRef,
          setDeck,
          xyRef,
          setXy,
          xyPrev,
          draggedId,
          removeCard,
          flingSpeed,
          cardWidth,
          btnsRef
        );
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
      const cardIndex = deckRef.current.findIndex((card) => card.id === cardId);
      const topIndex = deckRef.current.length - 1;
      const draggedCount = draggedId.current.size;
      const isDraggable = cardIndex >= topIndex - draggedCount;

      if (!isDraggable) return; // только top card || next card после поднятой || all cards выше поднятой
      if (pointerIdRef.current !== null) return; // уже кто-то тащит

      // stop fling BTN
      if (draggedId.current.delete(cardId)) {
        btnsSet((prev) => {
          return { left: false, right: false, back: false, flip: prev.flip };
        });
      }

      xyStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      isDraggingRef.current = true;
      setIsDragging(true);

      pointerIdRef.current = e.pointerId;

      draggedId.current.add(cardId);

      dragHistory.current = [{ pos: { x: e.clientX, y: e.clientY }, time: performance.now() }];

      // console.log('🍏start');
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

      //* draggedId.current = draggedId.current.filter((i) => i !== cardId);

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
