import React, { ReactNode } from 'react';
type ModalContentProps = {
    children: ReactNode;
    height?: React.CSSProperties['height'];
    maxHeight?: React.CSSProperties['maxHeight'];
    hasPadding?: boolean;
    overflow?: React.CSSProperties['overflow'];
};
declare const Content: ({ children, height, maxHeight, hasPadding, overflow }: ModalContentProps) => JSX.Element;
export default Content;
