import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect } from "react";

// ============================================================
// 엣지 케이스 테스트: 어떤 패턴이 린트를 통과하는가?
// ============================================================

// ✅ 베이스라인 1: 가장 간단한 함수 선언
export function useSimplestFunction() {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
}

// ✅ 베이스라인 2: 가장 간단한 화살표 함수
export const useSimplestArrow = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
};

// 🔍 테스트 1: useEffect 추가
export const useWithEffect = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    console.log("effect");
  }, []);

  return { virtualizer, parentRef };
};

// 🔍 테스트 2: useEffect + dependency array
export const useWithEffectDeps = (count: number) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    console.log("effect with deps", count);
  }, [count]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 3: 복잡한 useEffect (virtualizer 사용)
export const useWithComplexEffect = (count: number) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    console.log("items", items);
  }, [virtualizer]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 4: 제네릭만 추가
export const useWithGeneric = <T>(items: T[]) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
};

// 🔍 테스트 5: 제네릭 + useEffect
export const useWithGenericAndEffect = <T>(items: T[]) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    console.log("effect", items.length);
  }, [items.length]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 6: 객체 파라미터 (destructuring)
export const useWithObjectParam = ({
  count,
  enabled,
}: {
  count: number;
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef, enabled };
};

// 🔍 테스트 7: 객체 파라미터 + useEffect
export const useWithObjectParamAndEffect = ({
  count,
  enabled,
}: {
  count: number;
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    if (enabled) {
      console.log("enabled effect");
    }
  }, [enabled]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 8: 제네릭 + 객체 파라미터
export const useWithGenericAndObject = <T>({
  items,
  enabled,
}: {
  items: T[];
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef, enabled };
};

// 🔍 테스트 9: 제네릭 + 객체 + useEffect (복잡한 로직)
export const useWithGenericObjectEffect = <T>({
  items,
  enabled,
}: {
  items: T[];
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (enabled && virtualItems.length > 0) {
      console.log("complex effect", virtualItems);
    }
  }, [enabled, virtualizer]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 10: 다중 파라미터 (6개)
export const useWithManyParams = <T>({
  items,
  enabled,
  hasNextPage,
  isFetching,
  onLoadMore,
  estimateSize = 100,
}: {
  items: T[];
  enabled: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  estimateSize?: number;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
  });
  return {
    virtualizer,
    parentRef,
    enabled,
    hasNextPage,
    isFetching,
    onLoadMore,
  };
};

// 🔍 테스트 11: 다중 파라미터 + 복잡한 useEffect
export const useWithManyParamsAndEffect = <T>({
  items,
  enabled,
  hasNextPage,
  isFetching,
  onLoadMore,
  estimateSize = 100,
}: {
  items: T[];
  enabled: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  estimateSize?: number;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
  });

  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      enabled &&
      lastItem.index >= items.length - 3 &&
      hasNextPage &&
      !isFetching
    ) {
      onLoadMore();
    }
  }, [items.length, hasNextPage, isFetching, onLoadMore, enabled, virtualizer]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 12: Interface 사용
interface VirtualScrollProps<T> {
  items: T[];
  enabled: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  estimateSize?: number;
}

export const useWithInterface = <T>({
  items,
  enabled,
  hasNextPage,
  isFetching,
  onLoadMore,
  estimateSize = 100,
}: VirtualScrollProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
  });

  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      enabled &&
      lastItem.index >= items.length - 3 &&
      hasNextPage &&
      !isFetching
    ) {
      onLoadMore();
    }
  }, [items.length, hasNextPage, isFetching, onLoadMore, enabled, virtualizer]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 13: Interface + 반환 타입 명시
interface VirtualScrollReturn {
  virtualizer: ReturnType<typeof useVirtualizer>;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export const useWithInterfaceAndReturnType = <T>({
  items,
  enabled,
  hasNextPage,
  isFetching,
  onLoadMore,
  estimateSize = 100,
}: VirtualScrollProps<T>): VirtualScrollReturn => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
  });

  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      enabled &&
      lastItem.index >= items.length - 3 &&
      hasNextPage &&
      !isFetching
    ) {
      onLoadMore();
    }
  }, [items.length, hasNextPage, isFetching, onLoadMore, enabled, virtualizer]);

  return { virtualizer, parentRef };
};

// 🔍 테스트 14: 변수명 변경 (rowVirtualizer)
export const useWithDifferentVarName = <T>({
  items,
  enabled,
}: {
  items: T[];
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { rowVirtualizer, parentRef, enabled };
};

// 🔍 테스트 15: Optional chaining 사용
export const useWithOptionalChaining = <T>({
  items,
  enabled,
}: {
  items?: T[];
  enabled: boolean;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef, enabled };
};
