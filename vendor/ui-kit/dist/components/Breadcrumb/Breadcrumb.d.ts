import * as React from 'react';
import { ReactNode } from 'react';
import { Breadcrumb as AntdBreadCrumb } from 'antd';
type Items = React.ComponentProps<typeof AntdBreadCrumb>['items'];
type BreadcrumbsProps = {
    items: Items;
    icon?: ReactNode;
    maxLength?: number;
};
/**
 * Breadcrumbs are a secondary navigation aid that helps users understand where they are in the application.
 */
declare const Breadcrumb: ({ items, icon: Icon, maxLength }: BreadcrumbsProps) => JSX.Element;
export default Breadcrumb;
