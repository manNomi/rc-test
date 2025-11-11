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
 * ⚠️ Test Case 2: Complex custom hook with eslint-disable-next-line comment
 *
 * 🐛 BUG REPRODUCTION:
 * This demonstrates a critical bug where `eslint-disable-next-line` comment
 * unintentionally suppresses React Compiler warnings.
 *
 * PROBLEM:
 * - Line 47: useVirtualizer (incompatible API) should trigger warning
 * - Line 55: eslint-disable-next-line react-hooks/exhaustive-deps
 *
 * EXPECTED BEHAVIOR:
 * - Line 47: Should show "incompatible-library" warning from React Compiler ESLint
 * - Line 55: eslint-disable should ONLY affect exhaustive-deps rule on that specific line
 *
 * ACTUAL BEHAVIOR:
 * ❌ Line 47's incompatible-library warning is INCORRECTLY SUPPRESSED!
 *
 * IMPACT ON USERS:
 * 1. When custom hook uses incompatible API -> Component memoization works fine
 * 2. But custom hook itself is NOT memoized -> needs "use no memo" directive
 * 3. Without warning, users have NO WAY to know this
 * 4. This creates silent performance issues and confusion
 *
 * WHY THIS IS CRITICAL:
 * Users expect warnings when using incompatible APIs in custom hooks.
 * The eslint-disable-next-line comment should NOT suppress unrelated React Compiler warnings.
 * This breaks the entire purpose of the incompatible-library warning system.
 */
export const useVirtualScroll = <T>({
  itemList,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  settedPrevItemLength = 5,
  settedEstimateSize = 60,
}: UseVirtualScrollProps<T>): UseVirtualScrollReturn => {
  // Parent ref for virtual list
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual list configuration
  const rowVirtualizer = useVirtualizer({
    count: itemList?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => settedEstimateSize, // Estimated height of each item
    overscan: 5, // Number of items to render outside viewport
  });

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // Load next page when approaching the end
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
