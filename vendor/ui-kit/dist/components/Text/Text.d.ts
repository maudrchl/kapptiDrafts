import { CSSProperties, FC, HTMLAttributes, PropsWithChildren } from 'react';
import { TextColor } from 'utils';
/**
 * - `xxs` — ~9px
 * - `xs` — ~11px
 * - `s` — ~12px
 * - `sm` — ~13px
 * - `base` — 14px
 * - `lg` — ~15px
 */
export type Size = 'xxs' | 'xs' | 's' | 'sm' | 'base' | 'lg';
/**
 * - `thin` — 100
 * - `extralight` — 200
 * - `light` — 300
 * - `normal` — 400
 * - `medium` — 500
 * - `semibold` — 600
 * - `bold` — 700
 * - `extrabold` — 800
 * - `black` — 900
 */
export type Weight = 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
/**
 * - `primary` — #24292f
 * - `secondary` — #667085
 * - `third` — #c5c5c9
 * - `white` — #ffffff
 * - `success` — #12b76a
 * - `error` — #e45b52
 * - `brown` — #646052
 * - `dark-green` — #1C4A47
 * - `orange` — #ED7846
 * - `pink` — #fa54cb
 * - `purple` — #cb4df7
 * - `blue` — #0577ff
 * - `dark-blue` — #1916d0
 * - `yellow` — #F4BF00
 */
export type Color = TextColor | 'brown' | 'dark-green' | 'orange' | 'pink' | 'purple' | 'blue' | 'dark-blue' | 'yellow' | 'third';
export type TextProps = {
    className?: string;
    /** xxs: ~9px, xs: ~11px, s: ~12px, sm: ~13px, base: 14px, lg: ~15px */
    size?: Size;
    /** thin: 100, extralight: 200, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 */
    weight?: Weight;
    mono?: boolean;
    /** primary: --color-text-primary #24292f, secondary: --color-text-secondary #667085, third: --color-text-third #c5c5c9, white: #ffffff, success: --color-accent-green #12b76a, error: --color-text-danger #e45b52, brown: --color-accent-brown #646052, dark-green: --color-accent-dark-green #1C4A47, orange: --color-accent-orange #ED7846, pink: --color-accent-pink #fa54cb, purple: --color-accent-purple #cb4df7, blue: --color-accent-blue #0577ff, dark-blue: --color-accent-dark-blue #1916d0, yellow: --color-accent-yellow #F4BF00 */
    color?: Color;
    opacity?: number;
    /** @deprecated truncate prop is deprecated, use lines instead */
    truncate?: boolean;
    lines?: number;
    maxLength?: number;
    inline?: boolean;
    transform?: CSSProperties['textTransform'];
    center?: boolean;
    noTooltip?: boolean;
    firstLetterUppercase?: boolean;
    canSelect?: boolean;
    style?: CSSProperties;
};
type SpanProps = Pick<HTMLAttributes<HTMLSpanElement>, 'onMouseEnter' | 'onMouseLeave' | 'onPointerEnter' | 'onPointerLeave' | 'onFocus' | 'onClick'>;
type Props = PropsWithChildren<TextProps> & SpanProps;
export declare const DEFAULT_SIZE = "base";
export declare const DEFAULT_WEIGHT = "normal";
export declare const DEFAULT_MONO = false;
export declare const DEFAULT_COLOR = "primary";
export declare const DEFAULT_TRUNCATE = false;
export declare const DEFAULT_INLINE = false;
export declare const DEFAULT_NO_TOOLTIP = false;
export declare const DEFAULT_FIRST_LETTER_UPPERCASE = false;
export declare const DEFAULT_CAN_SELECT = true;
declare const Text: FC<Props>;
export default Text;
