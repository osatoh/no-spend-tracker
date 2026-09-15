// リクエスト本文を JSON として読む。壊れた JSON は null として検証側で invalid_body にする
export async function readJson(req: Request): Promise<unknown> {
  return req.json().catch(() => null)
}
