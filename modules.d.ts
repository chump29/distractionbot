declare module "bun" {
  interface Env {
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    IS_DEBUG: string
    LOGO_PORT: string
    LOGO_SERVER: string
    LOGO_URL: string
    NAME: string
    npm_package_version: string
    RATE: string
    TOKEN: string
  }
}
