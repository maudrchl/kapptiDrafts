/// <reference types="react" />
import { IconProps } from 'utils';
export type IconSimProps = IconProps & {
    opacity?: number;
};
declare const IconSim: (props: IconProps & IconSimProps) => JSX.Element;
export default IconSim;
