import * as React from 'react';
import { ReactNode } from 'react';
type PanelProps = {
    title: string;
    children: ReactNode;
    asideTitle?: ReactNode;
    description?: string;
    compact?: boolean;
};
declare const Panel: {
    ({ title, children, asideTitle, description, compact }: PanelProps): JSX.Element;
    Content: ({ children }: {
        children: React.ReactNode;
    }) => JSX.Element;
    Footer: ({ children }: {
        children: React.ReactNode;
    }) => JSX.Element;
};
export default Panel;
