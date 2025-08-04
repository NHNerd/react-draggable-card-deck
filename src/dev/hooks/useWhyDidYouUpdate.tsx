import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate<T extends Record<string, any>>(name: string, props: T) {
  const prevProps = useRef<T>(null);

  useEffect(() => {
    if (!prevProps.current) {
      prevProps.current = props;
      return;
    }

    const allKeys = Object.keys({ ...prevProps.current, ...props });
    const changesObj: Partial<Record<keyof T, { from: any; to: any }>> = {};

    allKeys.forEach((key) => {
      if (prevProps.current?.[key] !== props[key]) {
        changesObj[key as keyof T] = {
          from: prevProps.current?.[key],
          to: props[key],
        };
      }
    });

    if (Object.keys(changesObj).length > 0) {
      console.log(`[why component - '${name}' update]`, changesObj);
    }

    prevProps.current = props;
  });
}
