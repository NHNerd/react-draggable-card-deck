import React, { useEffect, useRef, useState } from 'react';
import type { XYType, CardType, DragsStatusType, DevSpeedControlType } from '../../types/types';
import { fling } from './features/calc';
import { dragCountUpdate } from './features/actions.ts';
// import { cardOutHndlr, CardOutHndlrType } from './features/actions.ts';
import { devChangeStatus } from '../../dev/debugVisual/features.ts';
import DraggableCss from './Draggable.module.css';

type Props = {
  children: React.ReactNode;
  draggedId: React.RefObject<Set<number>>;
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>;
  deckRef: React.RefObject<CardType[]>;
  card: CardType;
  rotateRand: number;
  setDevDragsStatus: React.Dispatch<React.SetStateAction<DragsStatusType[]>>;
  dragCountRef: React.RefObject<number>;
  dragCountLimit: React.RefObject<number>;
  setDragCount: React.Dispatch<React.SetStateAction<number>>;
  devSpeed: React.RefObject<DevSpeedControlType>;
  cardOutHndlr: any;
};

const flingAddRL = (
  card: CardType,
  deckRef: React.RefObject<CardType[]>,
  flingOrXY: XYType,
  setDeck: React.Dispatch<React.SetStateAction<CardType[]>>
) => {
  const deckFresh = [...deckRef.current];
  for (let i = deckFresh.length - 1; i >= 0; i--) {
    if (deckFresh[i].id === card.id) {
      deckFresh[i].btnLR = flingOrXY.x < 0 ? 'l' : 'r';
      break;
    }
  }
  setDeck(deckFresh);
};

const Draggable = ({
  children,
  draggedId,
  setDeck,
  deckRef,
  card,
  rotateRand,
  setDevDragsStatus,
  dragCountRef,
  dragCountLimit,
  setDragCount,
  devSpeed,
  cardOutHndlr,
}: Props) => {
  const pointerIdRef = useRef<number | null>(null); //* Multi-touch

  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardWidth = useRef<number>(100);

  const isDraggingRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const xyStart = useRef<XYType>({ x: 0, y: 0 });
  const xyMove = useRef<XYType>({ x: 0, y: 0 });
  const xyPrev = useRef<XYType>({ x: 0, y: 0 });

  const [xy, setXy] = useState<XYType>(card.comeBack ? card.lastPos : { x: 0, y: 0 });
  const xyRef = useRef(xy);

  const dragHistory = React.useRef<{ pos: XYType; time: number }[]>([]);
  const flingSpeed = React.useRef<XYType | boolean>(false);

  const comeBackToComeToDeckFlag = React.useRef<boolean>(false);
  const comeBackFlag = React.useRef<boolean>(true);
  const flingFlag = React.useRef<boolean>(true);
  const outFlag = React.useRef<boolean>(false);

  useEffect(() => {
    xyRef.current = xy;
  }, [xy]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const isCardOut = Math.abs(xyRef.current.x) > window.innerWidth * 0.5 + cardWidth.current;

      frameId = requestAnimationFrame(animate);

      // Не уверен что это хорошо все время обьвлять функцию, но лучше так чем в 3 местах одинаковый код
      const flingHndlr = (codePoint: string) => {
        cardOutHndlr(card.id, Math.max(Math.sign(xyPrev.current.x), 0) ? 'r' : 'l', xyPrev.current, codePoint);

        flingFlag.current = true;
        outFlag.current = true;
      };

      if (
        //* Fling BTN
        draggedId.current.has(card.id) &&
        card?.btnLR &&
        !flingSpeed.current
      ) {
        if (isCardOut) {
          if (outFlag.current) return;
          flingHndlr('fling BTN');
          return;
        }

        setXy((prev) => {
          let speedX = (Math.max(window.innerWidth, cardWidth.current * 2) / cardWidth.current) * 3 + 8;
          let speedY = 0.92 + speedX / 1600;
          if (devSpeed.current === 'slow') {
            speedX *= 0.16;
            speedY += (1 - speedY) * 0.85;
          } else if (devSpeed.current === 'very-slow') {
            speedX *= 0.02;
            speedY += (1 - speedY) * 0.988;
          }

          return { x: prev.x + speedX * (card.btnLR === 'l' ? -1 : 1), y: prev.y * speedY };
        });
        xyPrev.current = { ...xyRef.current };

        // if (flingFlag.current) {
        //   //? DEV
        //   // devChangeStatus(setDevDragsStatus, card, 'fling', dragCountRef);
        //   flingFlag.current = false;
        // }
      } else if (isDraggingRef.current) {
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
              if (outFlag.current) return;
              flingHndlr('fling Edge');
              return;
            }
            let devSpeedControl = 1;
            if (devSpeed.current === 'slow') devSpeedControl = 0.4;
            else if (devSpeed.current === 'very-slow') devSpeedControl = 0.04;

            setXy((prev) => {
              return { x: prev.x + 10 * Math.sign(xyRef.current.x) * devSpeedControl, y: prev.y };
            });
            xyPrev.current = { ...xyRef.current };

            if (flingFlag.current) {
              flingAddRL(card, deckRef, xyRef.current, setDeck);
              flingFlag.current = false;

              //? DEV
              devChangeStatus(setDevDragsStatus, card, 'fling', dragCountRef);
            }
          } else {
            //* Return to deck
            //Sleep
            if (Math.abs(xyRef.current.x) < 0.5 && Math.abs(xyRef.current.y) < 0.5) {
              draggedId.current.delete(card.id);

              xyPrev.current = { x: 0, y: 0 };
              setXy({ x: 0, y: 0 });
              setDeck((prev) => {
                const fresh = [...prev];
                for (let i = 0; i < fresh.length; i++) {
                  if (fresh[i].id === card.id) {
                    delete fresh[i]?.comeBack;
                    delete fresh[i]?.btnLR;
                  }
                }
                comeBackToComeToDeckFlag.current = false;

                return fresh;
              });

              //? DEV
              setDevDragsStatus((prev) => {
                const fresh = [...prev];
                const index = fresh.findIndex((item) => item?.id === card.id);
                if (index !== -1) {
                  fresh[index] = { ...fresh[index], status: 'sleep' };
                }
                return fresh;
              });
              comeBackFlag.current = true;

              dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);
              return;
            }

            // Clearing cards props for the back btn comes active
            if (Math.abs(xyRef.current.x) < window.innerWidth * 0.2 && !comeBackToComeToDeckFlag.current) {
              comeBackToComeToDeckFlag.current = true;
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
              let speed = 0.88;
              if (devSpeed.current === 'slow') speed = 0.98;
              else if (devSpeed.current === 'very-slow') speed = 0.9992;
              return { x: prev.x * speed, y: prev.y * speed };
            });

            if (comeBackFlag.current && !card?.comeBack) {
              //? DEV
              devChangeStatus(setDevDragsStatus, card, 'backToDeck', dragCountRef);

              outFlag.current = false;
              comeBackFlag.current = false;
            }
          }
        } else {
          //* Fling
          if (isCardOut) {
            if (outFlag.current) return;
            flingHndlr('fling');
            return;
          }

          setXy((prev) => {
            const speed = flingSpeed.current as XYType;
            let devSpeedControl = 1;
            if (devSpeed.current === 'slow') devSpeedControl = 0.4;
            else if (devSpeed.current === 'very-slow') devSpeedControl = 0.04;

            return {
              x: prev.x + speed.x * 8 * devSpeedControl,
              y: prev.y + speed.y * 6 * devSpeedControl,
            };
          });
          xyPrev.current = { ...xyRef.current };

          if (flingFlag.current) {
            const speed = flingSpeed.current as XYType;
            flingAddRL(card, deckRef, speed, setDeck);

            //? DEV
            devChangeStatus(setDevDragsStatus, card, 'fling', dragCountRef);
            flingFlag.current = false;
          }
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current?.getBoundingClientRect();
    cardWidth.current = rect.width;

    const hndlrStart = (e: PointerEvent) => {
      e.preventDefault();
      if (isDraggingRef.current) return;
      //TODO     //TODO     //TODO     //TODO     //TODO     //TODO     //TODO     //TODO
      const cardIndex = deckRef.current.findIndex((cardItem) => cardItem.id === card.id);
      const topIndex = deckRef.current.length - 1;
      const draggedCount = draggedId.current.size;
      const isDraggable = cardIndex >= topIndex - draggedCount;

      if (!isDraggable) return; // только top card || next card после поднятой || all cards выше поднятой
      if (pointerIdRef.current !== null) return; // уже кто-то тащит

      delete deckRef.current[cardIndex]?.btnLR;
      delete deckRef.current[cardIndex]?.lastPos;
      delete deckRef.current[cardIndex]?.comeBack;

      const pickedToTop = () => {
        const deck = deckRef.current;
        let index = -1;

        for (let i = deck.length - 1; i >= 0; i--) {
          if (deck[i].id === card.id) {
            index = i;
            break;
          }
        }

        if (index === -1) return;

        const thisCard = deck[index];
        const newDeck = [...deck.slice(0, index), ...deck.slice(index + 1), thisCard];

        deckRef.current = newDeck;
        setDeck(newDeck);
      };
      pickedToTop();

      // setDeck(deckRef.current);

      comeBackToComeToDeckFlag.current = false;

      xyStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      isDraggingRef.current = true;
      setIsDragging(true);

      pointerIdRef.current = e.pointerId;

      draggedId.current.add(card.id);
      dragHistory.current = [{ pos: { x: e.clientX, y: e.clientY }, time: performance.now() }];

      dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);
      // console.log('🍏start');

      // dev
      //TODO DEV
      devChangeStatus(setDevDragsStatus, card, 'drag', dragCountRef);
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
      // seve last 5 frames
      if (dragHistory.current.length > 5) dragHistory.current = dragHistory.current.slice(-5);

      // console.log('🍇move');
    };

    const hndlrEnd = (e: PointerEvent) => {
      e.preventDefault();
      if (e.pointerId !== pointerIdRef.current) return;
      if (!isDraggingRef.current) return;
      if (xyRef.current.x === 0 && xyRef.current.x === 0) draggedId.current.delete(card.id);

      isDraggingRef.current = false;
      setIsDragging(false);

      xyPrev.current = { ...xyRef.current };

      // console.log('🍅end');
      //Clear
      xyMove.current = { x: 0, y: 0 };
      pointerIdRef.current = null;

      flingSpeed.current = fling(dragHistory);
      dragHistory.current = [];

      comeBackFlag.current = true;
      flingFlag.current = true;

      dragCountUpdate(draggedId, dragCountLimit, dragCountRef, setDragCount);
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
  }, []);

  return (
    <>
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
    </>
  );
};

export default Draggable;
