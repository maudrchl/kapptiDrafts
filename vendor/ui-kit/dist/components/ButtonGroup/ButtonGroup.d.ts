import React from 'react';
/**
 * A component that renders a group of buttons.
 */
type ButtonGroupProps = {
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode[];
};
/**
 * Renders a group of buttons stacked together.
 * @param {ButtonGroupProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
declare const ButtonGroup: ({ style, className, children }: ButtonGroupProps) => JSX.Element;
export default ButtonGroup;
