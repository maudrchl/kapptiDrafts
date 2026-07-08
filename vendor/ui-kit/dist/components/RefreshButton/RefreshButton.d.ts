/// <reference types="react" />
type RefreshButtonInterval = '10s' | '30s' | '1min' | '2min' | '3min' | '4min' | '5min' | '10min';
type RefreshButtonProps = {
    /**
     * Interval of the countdown
     */
    interval?: RefreshButtonInterval;
    /**
     * Function being called when countdown reaches 0
     */
    handleRefresh: () => void;
    /**
     * If true, the play/stop button shows only the icon (no label).
     */
    iconOnly?: boolean;
};
/**
 *
 * @param interval Interval of the countdown
 * @param handleRefresh Function being called when countdown reaches 0
 */
declare const RefreshButton: ({ interval, handleRefresh, iconOnly }: RefreshButtonProps) => JSX.Element;
export default RefreshButton;
