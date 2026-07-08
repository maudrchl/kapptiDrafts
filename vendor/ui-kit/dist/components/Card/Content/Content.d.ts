import { ReactNode } from 'react';
type ContentProps = {
    title?: string;
    description?: string;
    children?: ReactNode;
    asideContent?: ReactNode;
    className?: string;
    compact?: boolean;
};
declare const Content: ({ title, description, children, asideContent, className, compact }: ContentProps) => JSX.Element;
export default Content;
