import { alt } from './alt'
import { charts } from './charts'
import { flowDoc } from './flow-doc'
import { templateDemo } from './templates'
import type { Slide } from '../../types'

/** 本編ではない見本ページ。画面では見られるが PDF に入らない（extra: true）。 */
export const EXTRAS: Slide[] = [charts, alt, flowDoc, ...templateDemo]
