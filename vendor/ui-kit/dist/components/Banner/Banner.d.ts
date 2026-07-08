import { ReactNode } from 'react';
type BannerProps = {
    className?: string;
    variant: 'primary' | 'secondary' | 'success' | 'error' | 'invisible' | 'danger' | 'warning';
    description: ReactNode;
    subDescription?: ReactNode;
    icon?: ReactNode;
    cross?: 'top' | 'bottom';
    aside?: ReactNode;
};
declare const Banner: ({ className, variant, description, subDescription, icon, cross, aside }: BannerProps) => JSX.Element;
export default Banner;
