/// <reference types="react" />
type TrendTagVariant = 'positive' | 'negative' | 'equal';
type TrendTagProps = {
    /**
     * This prop is used to display the current value.
     */
    current: number;
    /**
     * This prop is used to calculate the trend between the current and the previous value
     */
    previous?: number;
    /**
     * This prop is used to force the variant of the tag
     */
    variant?: TrendTagVariant;
    /**
     * This prop is used to invert the color of the tag to give a different sense of the trend.
     */
    invertColor?: boolean;
};
/**
 * TrendTag is a component that displays a trend between two values.
 * @param current The current value to display
 * @param previous The previous value to compare with the current value
 * @param variant The variant of the tag. If not provided, the component will detect the variant based on the current and previous values
 * @param invertColor Invert the color of the tag to give a different sense of the trend
 */
declare const TrendTag: ({ current, previous, variant, invertColor }: TrendTagProps) => JSX.Element;
export default TrendTag;
