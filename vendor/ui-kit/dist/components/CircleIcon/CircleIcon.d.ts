import { FC, ReactElement } from 'react';
export type CircleIconProps = {
    className?: string;
    variant?: 'secondary' | 'primary' | 'success';
    icon: ReactElement;
    size?: number;
};
export declare const DEFAULT_VARIANT = "secondary";
export declare const DEFAULT_SIZE = 40;
declare const CircleIcon: FC<CircleIconProps>;
export default CircleIcon;
