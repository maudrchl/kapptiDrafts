import { ReactNode } from 'react';
type TitleProps = {
    className?: string;
    children: ReactNode;
    size: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    prefixIcon?: any;
    center?: boolean;
    maxLines?: number;
    firstUppercased?: boolean;
};
declare const Title: ({ className, children, size, prefixIcon: PrefixIcon, center, maxLines, firstUppercased, }: TitleProps) => JSX.Element;
export default Title;
