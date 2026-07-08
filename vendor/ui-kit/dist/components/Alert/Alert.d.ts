import { ReactNode } from 'react';
export interface AlertProps {
    children?: ReactNode;
    open?: boolean;
    title?: string;
    okText?: string;
    cancelText?: string;
    isLoading?: boolean;
    danger?: boolean;
    onOk?: () => void;
    okDisabled?: boolean;
    onCancel?: () => void;
}
/**
 * A small modal with a title, a message, a cancel button and a confirm button.
 * ℹ️For more complex modals, use the Modal component.
 * 💡Please, use the "open" prop to control the visibility of the modal to keep the animations.
 */
declare const Alert: ({ children, open, title, okText, cancelText, isLoading, onOk, onCancel, danger, okDisabled }: AlertProps) => JSX.Element;
export default Alert;
