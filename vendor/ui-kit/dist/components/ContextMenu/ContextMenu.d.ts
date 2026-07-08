import * as React from 'react';
import { Options } from 'components/Dropdown/Dropdown';
type ContextMenuProps = {
    children: React.ReactNode;
    options: Options;
    className?: string;
    active?: boolean;
};
/**
 * A right click that opens a dropdown menu.
 * To add a divider, add an option of type "divider".
 */
declare const ContextMenu: ({ children, className, options, active }: ContextMenuProps) => JSX.Element;
export default ContextMenu;
