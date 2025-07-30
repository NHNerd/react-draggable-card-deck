export const fling = (
  dragHistory: React.RefObject<{ pos: { x: number; y: number }; time: number }[]>
): { x: number; y: number } | boolean => {
  const history = dragHistory.current;
  if (!history || history.length < 5) return false;

  const first = history[0];
  const last = history[history.length - 1];

  const dx = last.pos.x - first.pos.x;
  const dy = last.pos.y - first.pos.y;
  const dt = last.time - first.time;

  const speedX = Math.abs(dx) / dt; // px per ms
  const speedY = Math.abs(dy) / dt; // px per ms

  //TODO сдеалать адаптивным к screen width - чем шире тем больше
  const SPEED_THRESHOLD = 0.6;

  // Проверим, не тормознул ли пользователь резко в конце:
  const secondLast = history[history.length - 2];
  const dLast = Math.abs(last.pos.x - secondLast.pos.x);
  const dtLast = last.time - secondLast.time;
  const lastSpeed = dLast / dtLast;

  const STOPPED = lastSpeed < 0.1; // пользователь замедлил движение в самом конце

  if (speedX > SPEED_THRESHOLD && !STOPPED) {
    return { x: speedX * Math.sign(dx), y: speedY * Math.sign(dy) };
  } else {
    // console.log('🧊 No fling');
    return false;
  }
};
