import * as React from 'react';
type DraggableProps = {
    children: React.ReactNode;
    id: string | number;
    disabled?: boolean;
};
declare const Draggable: ({ children, id, disabled }: DraggableProps) => JSX.Element;
export default Draggable;
