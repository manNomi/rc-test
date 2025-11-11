import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect } from "react";

/**
 * ✅ Test Case 1: Simple custom hook with incompatible API
 *
 * Expected: ESLint should warn about useVirtualizer (incompatible-library)
 * Actual: ✅ Warning is shown
 */
export function useIncompatibleMovieList(count: number) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160,
    overscan: 5,
  });

  return { virtualizer, parentRef };
}

interface UseVirtualScrollProps<T> {
  itemList: T[];
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  settedPrevItemLength?: number;
  settedEstimateSize?: number;
}

interface UseVirtualScrollReturn {
  parentRef: React.RefObject<HTMLDivElement | null>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

/**
 * ⚠️ Test Case 2: Complex custom hook with eslint-disable comment
 *
 * 🐛 BUG REPRODUCTION:
 * - Line 47: useVirtualizer should trigger incompatible-library warning
 * - Line 55: eslint-disable-next-line for exhaustive-deps
 *
 * Expected: Line 47 should show warning, line 55 disable should only affect that line
 * Actual: ❌ Line 47 warning is SUPPRESSED due to line 55's eslint-disable comment!
 *
 * This is the bug we're reporting to React team.
 */
export const useVirtualScroll = <T>({
  itemList,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  settedPrevItemLength = 5,
  settedEstimateSize = 60,
}: UseVirtualScrollProps<T>): UseVirtualScrollReturn => {
  // 가상 리스트를 위한 부모 ref
  const parentRef = useRef<HTMLDivElement>(null);

  // 가상 리스트 설정
  const rowVirtualizer = useVirtualizer({
    count: itemList?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => settedEstimateSize, // 각 아이템의 예상 높이 (space-y-3 포함)
    overscan: 5, // 화면 밖 렌더링할 아이템 수
  });

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // 마지막에서 3개 전 아이템이 보이면 다음 페이지 로드
    if (
      lastItem.index >= (itemList?.length ?? 0) - settedPrevItemLength &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemList?.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    parentRef,
    rowVirtualizer,
  };
};
