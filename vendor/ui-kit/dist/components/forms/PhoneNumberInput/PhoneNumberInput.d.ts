/// <reference types="react" />
import { Size } from 'utils';
type PhoneNumberInputProps = {
    disabled?: boolean;
    fullWidth?: boolean;
    label?: string;
    name: string;
    placeholder?: string;
    size?: Size;
    onChange?: (value: string, countryCode: string, countryName?: string) => void;
    international?: boolean;
};
/**
 * 📞 A phone number input made to be used in a Formik form
 */
declare const PhoneNumberInput: (props: PhoneNumberInputProps) => JSX.Element;
export default PhoneNumberInput;
