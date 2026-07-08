import { Size } from 'components/Text/Text';
import { ReactNode } from 'react';
type TooltipTextProps = {
    text: string;
    tooltip?: ReactNode;
    size?: Size;
    active?: boolean;
    onClick?: () => void;
};
/**
 * A Text component with a Tooltip 💬
 */
declare const TooltipText: ({ text, tooltip, size, active, onClick }: TooltipTextProps) => JSX.Element;
export default TooltipText;
