import * as React from 'react';
type DragAndDropProps<T> = {
    children: React.ReactNode;
    items: T[];
    itemsIds: string[] | number[];
    onDragEnd: (sortedItems: T[]) => void;
    restrictTo?: Modifiers[];
    sortingStrategy?: 'vertical' | 'horizontal';
};
declare const modifiersMap: {
    verticalAxis: import("@dnd-kit/core").Modifier;
    windowEdges: import("@dnd-kit/core").Modifier;
    horizontalAxis: import("@dnd-kit/core").Modifier;
    parentElement: import("@dnd-kit/core").Modifier;
};
type Modifiers = keyof typeof modifiersMap;
declare const DragAndDrop: <T>({ children, onDragEnd, items, itemsIds, restrictTo, sortingStrategy, }: DragAndDropProps<T>) => JSX.Element;
export default DragAndDrop;
