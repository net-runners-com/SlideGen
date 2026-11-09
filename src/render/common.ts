/** 描画まわりで共有する小物。

 *  DECOR は「選択も編集もさせない飾り」。文字だけを編集可能に保つため、
 *  背景・罫・紋章・図版にはこれを必ず付ける。 */
export const DECOR = { selectable: false, evented: false, objectCaching: false } as const
