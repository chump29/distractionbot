declare module "bun" {
  interface Env {
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    DEBUG_SQL: string
    IS_DEBUG: string
    LOGO_URL: string
    NAME: string
    npm_package_version: string
    TOKEN: string
  }
}
