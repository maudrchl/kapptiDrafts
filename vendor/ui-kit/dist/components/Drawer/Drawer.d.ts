import * as React from 'react';
import { ReactNode } from 'react';
type DrawerProps = {
    children?: ReactNode;
    title?: string | ReactNode;
    /**
     * Use this to handle the opening of the drawer instead of juste not rendering it,
     * otherwise we will lose the closing animation.
     */
    open?: boolean;
    onClose?: () => void;
    width?: number;
    /**
     * To add extra content inside the header of the drawer (to the right of the close button).
     */
    extra?: ReactNode;
    /**
     * If the Drawer should be closable by clicking outside it.
     */
    maskClosable?: boolean;
    /**
     * Additional class name to apply to the Drawer.
     */
    className?: string;
    /**
     * The z-index of the Drawer.
     * Defaults to 1000, which is higher than the default Antd modal z-index.
     */
    zIndex?: number;
    /**
     * If the Drawer should be resizable.
     * Defaults to false.
     */
    resizable?: boolean;
};
/**
 * A sliding panel made with Antd that can be opened and closed.
 * Be sure to open and close it using the open prop instead of just not rendering it. If you don't, you will lose the closing animation.
 */
declare const Drawer: {
    ({ children, title, open, onClose, width, extra, maskClosable, className, zIndex, resizable, }: DrawerProps): JSX.Element;
    Empty: ({ icon: Icon, title, description, children }: {
        icon?: any;
        title: string;
        description?: string | undefined;
        children?: React.ReactNode;
    }) => JSX.Element;
};
export default Drawer;
