import * as React from 'react';
type ManagementSidebarProps = {
    children: React.ReactNode;
    footer?: React.ReactNode;
};
declare const ManagementSidebar: {
    ({ children, footer }: ManagementSidebarProps): JSX.Element;
    Section: ({ title, children }: {
        title: string;
        children: React.ReactNode;
    }) => JSX.Element;
    Item: ({ label, external }: import("./components/Item/Item").ItemProps) => JSX.Element;
};
export default ManagementSidebar;
