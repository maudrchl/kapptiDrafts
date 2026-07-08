/// <reference types="react" />
import 'brace/mode/yaml';
import 'brace/mode/sh';
import './kapptivateDarkTheme';
type CodeBlockProps = {
    code: string;
    language?: 'yaml' | 'sh';
    /** Caps the rendered height; content beyond this many lines scrolls. */
    maxLines?: number;
    className?: string;
    copyLabel?: string;
    copiedLabel?: string;
    /** Called when writing to the clipboard fails (e.g. permission denied). */
    onCopyError?: () => void;
};
declare const CodeBlock: ({ code, language, maxLines, className, copyLabel, copiedLabel, onCopyError, }: CodeBlockProps) => JSX.Element;
export default CodeBlock;
