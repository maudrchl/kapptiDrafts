import { ReactNode } from 'react';
type NoContentProps = {
    children?: ReactNode;
    title: string;
    description: string;
    noPadding?: boolean;
    icon?: ReactNode;
    /**
     * To display Call To Action buttons in the bottom without having to specify the wrapper.
     */
    CTAs?: ReactNode;
};
declare const NoContent: ({ children, title, noPadding, description, icon, CTAs }: NoContentProps) => JSX.Element;
export default NoContent;
