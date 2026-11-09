import { alt } from './alt'
import { charts } from './charts'
import { flowDoc } from './flow-doc'
import { templateDemo } from './templates'
import { s1 } from './s1'
import { s2 } from './s2'
import { s3 } from './s3'
import { s4 } from './s4'
import { s5 } from './s5'
import { s6 } from './s6'
import { s7 } from './s7'
import { s8 } from './s8'
import type { Slide } from '../types'

/** 本編 8 ページ。PDF に入るのはこれだけ。 */
export const DECK: Slide[] = [s1, s2, s3, s4, s5, s6, s7, s8]

/** 見本ページ。画面では見られるが書き出しには入らない。 */
export const EXTRAS: Slide[] = [charts, alt, flowDoc, ...templateDemo]

export const SLIDES: Slide[] = [...DECK, ...EXTRAS]
