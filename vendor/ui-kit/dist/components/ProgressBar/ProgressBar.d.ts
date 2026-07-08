/// <reference types="react" />
type CapacityMode = {
    /** Threshold-based coloring: green → yellow → orange → red as value increases */
    mode?: 'capacity';
};
type ProgressMode = {
    /** Single color that stays constant regardless of value */
    mode: 'progress';
    /** Bar fill color. Defaults to accent blue */
    color?: string;
};
type Thickness = 'thin' | 'medium' | 'large';
export type ProgressBarProps = {
    /** Progress value between 0 and 100 */
    value: number;
    /** Bar thickness. Defaults to medium */
    thickness?: Thickness;
} & (CapacityMode | ProgressMode);
declare const ProgressBar: (props: ProgressBarProps) => JSX.Element;
export default ProgressBar;
