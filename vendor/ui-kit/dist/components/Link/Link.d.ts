import { AnchorHTMLAttributes, FC, PropsWithChildren } from 'react';
type HtmlAnchorProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'onFocus' | 'onPointerEnter' | 'onPointerLeave' | 'onMouseEnter' | 'onMouseLeave'>;
type LinkProps = HtmlAnchorProps & {
    className?: string;
    to?: string;
    newTab?: boolean;
    /** If you want you can directly use the onClick prop instead of the to prop and the newTab prop. For exemple to use "navigate". */
    onClick?: () => void;
};
export type Props = PropsWithChildren<LinkProps>;
declare const Link: FC<Props>;
export default Link;
