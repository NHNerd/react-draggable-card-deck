export const dragCountUpdate = (
  draggedId: React.RefObject<Set<number>>,
  dragCountLimit: React.RefObject<number>,
  dragCountRef: React.RefObject<number>,
  setDragCount: React.Dispatch<React.SetStateAction<number>>
) => {
  const count1 = 5;
  const count2 = 20;
  const count3 = 30;

  const draggedIdSize = draggedId.current.size;
  if (draggedIdSize >= count1 - 1 && dragCountLimit.current === count1) {
    dragCountLimit.current = count2;
  } else if (draggedIdSize <= count1 - 1 && dragCountLimit.current === count2) {
    dragCountLimit.current = count1;
  }

  const countFresh = Math.max(count1, Math.min(draggedIdSize + 1, dragCountLimit.current));
  setDragCount(countFresh);
  dragCountRef.current = countFresh;
};
