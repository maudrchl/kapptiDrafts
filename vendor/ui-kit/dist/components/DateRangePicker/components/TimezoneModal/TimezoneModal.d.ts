/// <reference types="react" />
type TimezoneModalProps = {
    isOpen: boolean;
    selectedTimezone: string;
    closeModal: () => void;
    onTimezoneChange: (timezone: string) => void;
};
declare const TimezoneModal: ({ isOpen, selectedTimezone, closeModal, onTimezoneChange }: TimezoneModalProps) => JSX.Element;
export default TimezoneModal;
