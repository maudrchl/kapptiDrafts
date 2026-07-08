import { ReactNode } from 'react';
type FormLayoutProps = {
    children: ReactNode;
    title: string;
    icon?: ReactNode;
};
/**
 * A container for forms containing multiple panels.
 */
declare const FormLayout: ({ children, title, icon }: FormLayoutProps) => JSX.Element;
export default FormLayout;
