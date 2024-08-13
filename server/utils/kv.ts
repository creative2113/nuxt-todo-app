export const useKv = async () => {
  if (globalThis.Deno) {
    return globalThis.Deno.openKv()
  }
  if (process.dev) {
    const OpenKV = () => import('@deno/kv')
    const { openKv } = await OpenKV()
    return openKv('kv.db')
  }
  throw createError({
    statusCode: 500,
    message: 'Could not find a Deno KV for production, make sure to deploy on Deno Deploy.'
  })
}