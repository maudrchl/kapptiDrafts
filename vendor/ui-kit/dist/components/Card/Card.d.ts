import * as React from 'react';
import { ReactNode } from 'react';
type CardProps = {
    className?: string;
    children: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};
declare const Card: {
    ({ className, children, onClick }: CardProps): JSX.Element;
    Header: ({ icon: Icon, title, asideContent, className }: {
        icon?: React.ComponentType<import("../../utils").IconProps> | undefined;
        title: string;
        asideContent?: React.ReactNode;
        className?: string | undefined;
    }) => JSX.Element;
    Content: ({ title, description, children, asideContent, className, compact }: {
        title?: string | undefined;
        description?: string | undefined;
        children?: React.ReactNode;
        asideContent?: React.ReactNode;
        className?: string | undefined;
        compact?: boolean | undefined;
    }) => JSX.Element;
    Footer: ({ children }: {
        children: React.ReactNode;
    }) => JSX.Element;
};
export default Card;
