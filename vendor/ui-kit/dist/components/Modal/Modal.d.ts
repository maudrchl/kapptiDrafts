import React, { ReactNode } from 'react';
export declare const DEFAULT_WIDTH = 600;
type HeadlessModalProps = {
    mode?: 'headless';
};
type HeadFullModalProps = {
    mode?: 'default';
    title: string | ReactNode;
    extraHeaderRight?: ReactNode;
};
export type ModalProps = {
    className?: string;
    children?: ReactNode;
    open?: boolean;
    /**
     * If the Modal should be closable by clicking outside it.
     */
    maskClosable?: boolean;
    width?: string | number;
    onCancel?: () => void;
    focusInput?: boolean;
    zIndex?: number;
} & (HeadlessModalProps | HeadFullModalProps);
/**
 * A more complex and customizable modal.
 * ℹ️For a simpler modal, use the Alert component.
 * 💡Please, use the "open" prop to control the visibility of the modal to keep the animations.
 */
declare const Modal: {
    ({ className, children, open, maskClosable, width, onCancel, focusInput, zIndex, mode, ...props }: ModalProps): JSX.Element;
    Content: ({ children, height, maxHeight, hasPadding, overflow }: {
        children: React.ReactNode;
        height?: import("csstype").Property.Height<string | number> | undefined;
        maxHeight?: import("csstype").Property.MaxHeight<string | number> | undefined;
        hasPadding?: boolean | undefined;
        overflow?: import("csstype").Property.Overflow | undefined;
    }) => JSX.Element;
    Footer: ({ children }: {
        children: React.ReactNode;
    }) => JSX.Element;
};
export default Modal;
