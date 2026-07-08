import { ComponentProps } from 'react';
import Input from '../Input/Input';
type PhoneNumberInputProps = {
    value?: string;
    onChange?: (value: string, countryCode: string, countryName?: string) => void;
    /** 🌍 Show country selector for international phone numbers */
    international?: boolean;
} & Omit<ComponentProps<typeof Input>, 'value' | 'onChange'>;
/**
 * 📞 Phone number input with country code selector
 */
declare const PhoneNumberInput: ({ className, placeholder, size, value: controlledValue, onChange, international, ...inputProps }: PhoneNumberInputProps) => JSX.Element;
export default PhoneNumberInput;
