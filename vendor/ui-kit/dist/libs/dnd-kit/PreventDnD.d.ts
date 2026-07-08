import * as React from 'react';
type PreventDndProps = {
    children: React.ReactNode;
    className?: string;
    active?: boolean;
};
declare const PreventDnd: ({ children, className, active }: PreventDndProps) => JSX.Element;
export default PreventDnd;
