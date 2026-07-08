import { ReactNode } from 'react';
type BreadcrumbsProps = {
    children: ReactNode | ReactNode[];
    sticky?: boolean;
    aside?: ReactNode;
};
/**
 * @deprecated Please use `Breadcrumb` (without the `s`) instead.
 */
declare const Breadcrumbs: ({ children, sticky, aside }: BreadcrumbsProps) => JSX.Element;
export default Breadcrumbs;
