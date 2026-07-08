/// <reference types="react" />
import { Popover as AntdPopover } from 'antd';
type PopoverProps = {
    children: React.ReactNode;
    content: React.ReactNode;
    trigger?: 'click' | 'hover';
    open?: boolean;
    setOpen?: (open: boolean) => void;
    placement?: React.ComponentProps<typeof AntdPopover>['placement'];
    arrow?: boolean;
    noPadding?: boolean;
    active?: boolean;
    zIndex?: number;
};
declare const Popover: ({ children, content, trigger, open, setOpen, placement, arrow, noPadding, active, zIndex, }: PopoverProps) => JSX.Element;
export default Popover;
