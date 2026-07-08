import { ReactNode } from 'react';
import { MenuProps } from 'antd';
import './dropdown.module.scss';
export type Options = MenuProps['items'];
type DropdownProps = {
    className?: string;
    rootClassName?: string;
    children: ReactNode;
    menu: MenuProps;
    trigger?: 'click' | 'hover' | 'contextMenu';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    active?: boolean;
    placement?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
};
/**
 * A dropdown made with Antd.
 * To add a divider, add a menu item of type "divider".
 */
declare const Dropdown: ({ className, rootClassName, children, menu, trigger, open, onOpenChange, active, placement, }: DropdownProps) => JSX.Element;
export default Dropdown;
