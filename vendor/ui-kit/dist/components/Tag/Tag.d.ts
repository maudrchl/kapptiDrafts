import * as React from 'react';
import { FocusEventHandler, MouseEventHandler, PointerEventHandler, ReactNode } from 'react';
import { Color as TextColor } from 'components/Text/Text';
import { Size } from '../Text/Text';
import { Spacing } from 'utils';
export declare const DEFAULT_COLOR = "black";
export declare const DEFAULT_UPPERCASE = false;
export declare const DEFAULT_WEIGHT = "normal";
export declare const DEFAULT_MONO = false;
export declare const DEFAULT_ICON_RIGHT = false;
export declare const DEFAULT_ICON_SIZE = 12;
export declare const DEFAULT_SIZE = "sm";
export declare const DEFAULT_SMALL_PADDING = false;
export declare const DEFAULT_BORDER = "solid";
type Color = 'black' | 'red' | 'grey' | 'brown' | 'dark-green' | 'green' | 'yellow' | 'orange' | 'pink' | 'purple' | 'blue' | 'dark-blue';
type TagProps = {
    className?: string;
    children?: ReactNode;
    color?: Color;
    textColor?: TextColor;
    icon?: any;
    iconColor?: string;
    uppercase?: boolean;
    /** medium: 500, normal: 400, semibold: 600 */
    weight?: 'normal' | 'medium' | 'semibold';
    /** Renders the label with the monospace font. */
    mono?: boolean;
    iconRight?: boolean;
    maxLen?: number;
    size?: Size;
    tagSize?: Size;
    smallPadding?: boolean;
    border?: 'solid' | 'dashed';
    /**
     * Margin between tags.
     */
    marginInlineEnd?: Spacing | 0;
    style?: React.CSSProperties;
    onClick?: MouseEventHandler<HTMLSpanElement>;
    onMouseEnter?: MouseEventHandler<HTMLSpanElement>;
    onMouseLeave?: MouseEventHandler<HTMLSpanElement>;
    onPointerEnter?: PointerEventHandler<HTMLSpanElement>;
    onPointerLeave?: PointerEventHandler<HTMLSpanElement>;
    onFocus?: FocusEventHandler<HTMLSpanElement>;
};
declare const Tag: ({ className, children, color, textColor, icon: Icon, iconColor, uppercase, weight, mono, iconRight, maxLen, size, tagSize, smallPadding, border, marginInlineEnd, style, onClick, onMouseEnter, onMouseLeave, onPointerEnter, onPointerLeave, onFocus, }: TagProps) => JSX.Element;
export default Tag;
