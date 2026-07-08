/// <reference types="react" />
type MultiSelectionButtonProps = {
    active: boolean;
    setActive: (active: boolean) => void;
    onClick?: () => void;
};
/**
 * 🖱️A button used to activate or deactivate the multi selection mode.
 */
declare const MultiSelectionButton: ({ active, setActive, onClick }: MultiSelectionButtonProps) => JSX.Element;
export default MultiSelectionButton;
