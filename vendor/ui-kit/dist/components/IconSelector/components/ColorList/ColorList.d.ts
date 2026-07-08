/// <reference types="react" />
export declare enum Color {
    Grey = "var(--color-grey-800)",
    Yellow = "var(--color-accent-yellow)",
    Pink = "var(--color-accent-pink)",
    Purple = "var(--color-accent-purple)",
    DarkBlue = "var(--color-accent-dark-blue)",
    Blue = "var(--color-accent-blue)",
    Green = "var(--color-accent-green)",
    Brown = "var(--color-accent-brown)",
    Orange = "var(--color-accent-orange)",
    DarkGreen = "var(--color-accent-dark-green)"
}
export declare const colorNameToCSSVar: (color: string) => Color;
type ColorListProps = {
    value?: Color;
    onSelect?: (color: string) => void;
};
declare const ColorList: ({ value, onSelect }: ColorListProps) => JSX.Element;
export default ColorList;
