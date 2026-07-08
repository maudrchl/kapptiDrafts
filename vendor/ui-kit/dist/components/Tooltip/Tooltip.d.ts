import * as React from 'react';
import { ReactNode } from 'react';
import { TextColor } from 'utils';
import { TooltipPlacement } from 'antd/es/tooltip';
type TooltipProps = {
    children: ReactNode;
    content: ReactNode;
    open?: boolean;
    color?: TextColor;
    placement?: TooltipPlacement;
    active?: boolean;
    destroyTooltipOnHide?: boolean;
    maxWidth?: string;
};
export type TooltipEventProps = {
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
    onPointerEnter?: (event: any) => void;
    onPointerLeave?: (event: any) => void;
    onFocus?: (event: any) => void;
    onClick?: (event: any) => void;
};
export declare const DEFAULT_COLOR: TextColor;
export declare const DEFAULT_PLACEMENT = "top";
export declare const DEFAULT_ACTIVE = true;
export declare const DEFAULT_DESTROY_TOOLTIP_ON_HIDE = false;
declare const _default: React.MemoExoticComponent<({ children, content, open, color, placement, active, destroyTooltipOnHide, maxWidth, }: TooltipProps) => JSX.Element>;
export default _default;
