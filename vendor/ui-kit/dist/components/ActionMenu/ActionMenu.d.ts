/// <reference types="react" />
import { Options } from 'components/Dropdown/Dropdown';
type ActionMenuProps = {
    className?: string;
    options: Options;
    onClick?: (key: string) => void;
    icon?: any;
    trigger?: 'click' | 'hover';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
/**
 * An icon that opens a dropdown menu.
 * To add a divider, add an option of type "divider".
 */
declare const ActionMenu: ({ className, options, onClick, icon: MenuIcon, trigger, open, onOpenChange, }: ActionMenuProps) => JSX.Element;
export default ActionMenu;
