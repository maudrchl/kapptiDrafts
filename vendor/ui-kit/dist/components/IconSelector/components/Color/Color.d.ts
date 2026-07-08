/// <reference types="react" />
type ColorProps = {
    color: string;
    selected?: boolean;
    onSelect?: () => void;
};
declare const Color: ({ color, selected, onSelect }: ColorProps) => JSX.Element;
export default Color;
