/// <reference types="vite/client" />

/** Identifiant du build courant, injecté par vite.config (versionPlugin). */
declare const __BUILD_ID__: string

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}
