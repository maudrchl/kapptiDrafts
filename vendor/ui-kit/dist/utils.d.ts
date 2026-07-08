/**
 *  Stuff re-used in multiple components
 */
export type Size = 's' | 'm' | 'l';
/**
 * - `primary` — --color-text-primary #24292f
 * - `secondary` — --color-text-secondary #667085
 * - `third` — --color-text-third #c5c5c9
 * - `white` — #ffffff
 * - `success` — --color-accent-green #12b76a
 * - `error` — --color-text-danger #e45b52
 */
export type TextColor = 'primary' | 'secondary' | 'third' | 'white' | 'success' | 'error' | 'inherit';
export type IconProps = {
    className?: string;
    size?: IconSize;
    color?: string;
    fill?: string;
    stroke?: string;
    filled?: boolean;
};
export type PNGIconProps = {
    size?: IconSize;
};
type IconSize = 10 | 12 | 16 | 18 | 24;
export declare const ICON_DEFAULT_SIZE = 16;
export declare const ICON_STROKE_WIDTH = 1.25;
export declare const ICON_ABSOLUTE_STROKE_WIDTH = true;
export declare const ILLUSTRATION_DEFAULT_SIZE = 75;
export type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
/**
 * Retrieve the value of a css variable
 */
export declare const getCssVar: (name: string) => string;
/**
 * 📏 Get the value of a spacing css variable :
 *   (1: 4px, 2: 6px, 3: 8px, 4: 12px, 5: 16px, 6: 24px, 7: 32px, 8: 40px, 9: 48px, 10: 64px)
 */
export declare const getSpacing: (spacingNumber: Spacing) => number;
export declare const sleep: (ms: number) => Promise<unknown>;
/**
 * Converts an array of objects to a CSV string
 */
export declare const convertToCSV: (data: any[], fields: string[]) => string;
/**
 * Create a CSV blob from an array of objects
 */
export declare const createCSVBlob: (data: any[], fields: string[]) => Blob;
export declare const downloadBlob: (blob: any, fileName: string) => void;
export declare const getScrollableAncestor: (element: HTMLElement | null) => HTMLElement;
export declare const getRelativeURL: (url: string | undefined) => string | undefined;
export {};
