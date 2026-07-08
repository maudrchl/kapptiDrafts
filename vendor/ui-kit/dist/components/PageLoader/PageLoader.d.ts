/// <reference types="react" />
type PageLoaderProps = {
    horizontal?: 'center' | 'unset';
    vertical?: 'center' | 'unset';
};
/**
 * 🔄 A utility component showing a loading state on the whole page.
 */
declare const PageLoader: ({ horizontal, vertical }: PageLoaderProps) => JSX.Element;
export default PageLoader;
