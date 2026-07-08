/// <reference types="react" />
import { IconProps } from 'utils';
type IconTimerProps = {
    needleColor?: string;
    opacity?: number;
    fill?: boolean;
};
declare const IconTimer: (props: IconProps & IconTimerProps) => JSX.Element;
export default IconTimer;
