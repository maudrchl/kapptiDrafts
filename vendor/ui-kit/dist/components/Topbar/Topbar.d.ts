import { ReactNode } from 'react';
type TopbarProps = {
    children: ReactNode;
    /**
     * Fix the topbar at the top of the page.
     */
    sticky?: boolean;
    aside?: ReactNode;
};
declare const Topbar: ({ children, sticky, aside }: TopbarProps) => JSX.Element;
export default Topbar;
