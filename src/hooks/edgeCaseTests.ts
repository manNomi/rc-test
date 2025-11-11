import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect } from "react";

// ============================================================
// Edge Case Tests: Which patterns pass the linter?
// ============================================================

// ✅ Baseline 1: Simplest function declaration
export function useSimplestFunction() {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
}

// ✅ Baseline 2: Simplest arrow function
export const useSimplestArrow = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
};

// 🔍 Test 1: Adding useEffect
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

// 🔍 Test 3: Complex useEffect (using virtualizer)
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

// 🔍 Test 4: Adding generics only
export const useWithGeneric = <T>(items: T[]) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  return { virtualizer, parentRef };
};

// 🔍 Test 5: Generics + useEffect
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

// 🔍 Test 6: Object parameter (destructuring)
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

// 🔍 Test 7: Object parameter + useEffect
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

// 🔍 Test 8: Generics + object parameter
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

// 🔍 Test 9: Generics + object + useEffect (complex logic)
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

// 🔍 Test 10: Multiple parameters (6 params)
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

// 🔍 Test 11: Multiple parameters + complex useEffect
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

// 🔍 Test 12: Using Interface
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

// 🔍 Test 13: Interface + explicit return type
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

// 🔍 Test 14: Different variable name (rowVirtualizer)
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

// 🔍 Test 15: Using optional chaining
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
