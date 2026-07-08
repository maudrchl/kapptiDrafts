import { ReactNode } from 'react';
type ErrorBannerProps = {
    children?: ReactNode;
    title: string;
    subTitle: string;
    checklist: {
        done: boolean;
        title: ReactNode;
    }[];
};
/**
 * A bigger banner than the Banner component with a red header and a checklist 🔴.
 */
declare const ErrorBanner: ({ children, title, subTitle, checklist }: ErrorBannerProps) => JSX.Element;
export default ErrorBanner;
