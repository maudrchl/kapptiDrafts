/// <reference types="react" />
import { Spacing } from '../../utils';
type FlexSpecificProps = {
    /**
     * The space between the children.
     * (1: 4px, 2: 6px, 3: 8px, 4: 12px, 5: 16px, 6: 24px, 7: 32px, 8: 40px, 9: 48px, 10: 64px)
     * You can also use a tuple to specify a different value for vertical and horizontal gap.
     */
    gap?: Spacing | [Spacing, Spacing];
    align?: 'center' | 'start' | 'end' | 'baseline' | 'stretch';
    justify?: 'center' | 'start' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
    vertical?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    wrap?: boolean;
    id?: string;
};
type FlexProps = FlexSpecificProps & React.HTMLAttributes<HTMLDivElement>;
/**
 * A flexible container component that arranges its children in a flex layout.
 * @param props - The props for the Flex component.
 * @param props.gap - (1: 4px, 2: 6px, 3: 8px, 4: 12px, 5: 16px, 6: 24px, 7: 32px, 8: 40px, 9: 48px, 10: 64px)
 * @returns The rendered Flex component.
 */
declare const Flex: ({ children, vertical, gap, align, justify, style, className, onClick, wrap, id, ...rest }: FlexProps) => JSX.Element;
export default Flex;
