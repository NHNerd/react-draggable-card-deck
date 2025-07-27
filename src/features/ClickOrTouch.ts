import type { XYType } from '../types/types';

const ClickOrTouch = (e: MouseEvent | TouchEvent | PointerEvent): XYType => {
  if ('touches' in e && e.touches.length > 0) {
    const touch = e.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  // PointerEvent, MouseEvent, fallback
  return {
    x: (e as MouseEvent | PointerEvent).clientX,
    y: (e as MouseEvent | PointerEvent).clientY,
  };
};

export default ClickOrTouch;
