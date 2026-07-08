import * as React from 'react';
type EmptyProps = {
    icon?: any;
    title: string;
    description?: string;
    children?: React.ReactNode;
};
declare const Empty: ({ icon: Icon, title, description, children }: EmptyProps) => JSX.Element;
export default Empty;
