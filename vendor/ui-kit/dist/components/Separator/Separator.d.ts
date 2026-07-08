/// <reference types="react" />
type SeparatorProps = {
    className?: string;
    type?: 'horizontal' | 'vertical';
};
/**
 * ― An horizontal or vertical grey line.
 */
declare const Separator: ({ className, type }: SeparatorProps) => JSX.Element;
export default Separator;
