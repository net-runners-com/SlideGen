"""文字見本表（1マス1文字の格子）から字形を切り出す。

元スライドのような「文章として組まれた画像」と違い、見本表は格子が明示されている。
罫線の位置をそのまま読めばよいので、1em 格子を推定する必要がない。
画像生成に見本表を描かせて、ここから採るほうが取りこぼしが少ない。

    python3 tools/assets/sheet.py sheet.png "0123456789ABC..." 10 4 out/
"""
from __future__ import annotations

import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_glyph import iou as glyph_iou  # noqa: E402

#: 罫線とみなす行・列の黒比率
LINE_RATIO = 0.55
#: これ以下の黒は紙のムラとみなす
INK = 128


def ink_mask(img: np.ndarray) -> np.ndarray:
    return img.mean(2) < INK if img.ndim == 3 else img < INK


def grid_lines(mask: np.ndarray, axis: int, want: int) -> list[int]:
    """罫線の位置を返す。見つからなければ等分で代用する。"""
    ratio = mask.mean(axis=1 - axis)
    hits = np.where(ratio > LINE_RATIO)[0]
    runs: list[int] = []
    if len(hits):
        start = prev = hits[0]
        for v in hits[1:]:
            if v - prev > 3:
                runs.append(int((start + prev) // 2))
                start = v
            prev = v
        runs.append(int((start + prev) // 2))
    if len(runs) == want + 1:
        return runs
    n = mask.shape[axis]
    return [round(n * i / want) for i in range(want + 1)]


def drop_edge_rules(cell: np.ndarray) -> np.ndarray:
    """マスの縁に残った罫線を落とす。

    罫線が 1px でも残ると字面の外接矩形がマス一杯に広がり、正規化で字が縮んで
    一致度が崩れる（「1」が 0.034 まで落ちた）。端に寄った、細くて長い墨だけを消す。
    """
    out = cell.copy()
    h, w = out.shape
    edge_w = max(2, int(w * 0.06))
    edge_h = max(2, int(h * 0.06))
    for c in list(range(edge_w)) + list(range(w - edge_w, w)):
        if out[:, c].mean() > 0.5:
            out[:, c] = False
    for r in list(range(edge_h)) + list(range(h - edge_h, h)):
        if out[r, :].mean() > 0.5:
            out[r, :] = False

    # 端に触れている小さな塊も落とす。罫線の切れ端が 1 つ残るだけで
    # 字面の外接矩形がずれ、正規化後に字が片側へ寄って一致度が崩れる。
    lab, n = ndimage.label(out)
    if n > 1:
        total = out.sum()
        for k in range(1, n + 1):
            blob = lab == k
            if blob.sum() > total * 0.03:
                continue
            ys, xs = np.where(blob)
            if ys.min() == 0 or xs.min() == 0 or ys.max() == h - 1 or xs.max() == w - 1:
                out[blob] = False
    return out


def cut(path: str, chars: str, cols: int, rows: int, out_dir: str, style: str = 'mincho') -> None:
    img = np.array(Image.open(path).convert('RGB'))
    mask = ink_mask(img)
    ys = grid_lines(mask, 0, rows)
    xs = grid_lines(mask, 1, cols)
    print(f'格子: 横 {len(xs) - 1} 列 / 縦 {len(ys) - 1} 行 '
          f'({"罫線から" if len(xs) == cols + 1 else "等分で代用"})')
    os.makedirs(out_dir, exist_ok=True)
    ok = 0
    for i, ch in enumerate(chars):
        r, c = divmod(i, cols)
        if r >= rows:
            break
        # 罫線そのものを含めないよう内側へ寄せる
        pad = 4
        cell = drop_edge_rules(mask[ys[r] + pad:ys[r + 1] - pad, xs[c] + pad:xs[c + 1] - pad])
        if not cell.any():
            print(f'  {ch}: 空のマス')
            continue
        score = glyph_iou(cell, ch, style)
        name = 'U+%04X' % ord(ch)
        Image.fromarray((cell * 255).astype(np.uint8)).save(f'{out_dir}/{name}.png')
        flag = '' if score >= 0.40 else '   <= 要確認'
        print(f'  {ch} {name}  IoU {score:.3f}  {cell.shape[1]}x{cell.shape[0]}px{flag}')
        ok += 1
    print(f'{ok}/{len(chars)} 字を書き出した → {out_dir}')


if __name__ == '__main__':
    cut(sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]),
        sys.argv[5], sys.argv[6] if len(sys.argv) > 6 else 'mincho')
