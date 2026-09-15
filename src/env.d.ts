// シークレットは wrangler.jsonc に書かないため、型だけここで補う(ローカルは .dev.vars、本番は wrangler secret put)
interface CloudflareBindings {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}
