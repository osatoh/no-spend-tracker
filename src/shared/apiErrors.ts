// API が返すエラーコード。文言はクライアント側で表示言語に合わせて翻訳する
export type ApiErrorCode =
  | 'invalid_body'
  | 'invalid_date'
  | 'date_before_tracking_start'
  | 'date_in_future'
  | 'invalid_amount'
  | 'invalid_note'
  | 'note_too_long'
  | 'not_found'
  | 'request_failed'
