"""パーツ見本表（1マス1図形）を、背景を抜いた個別 PNG に切り出す。

画像生成に作らせた素材をそのまま貼ると白地が残る。マスごとに切って、
白を透明にし、必要なら単色へ塗り替える。色は版面側で決めたいので、
インクの濃さをそのまま不透明度にして、色は引数で差し替える。

    python3 tools/parts.py sheet.png 4 3 public/parts "bracket-tl,scale,marker,bars,..." "#C9452F"
"""
from __future__ import annotations

import os
import sys

import numpy as np
from PIL import Image

#: 罫線とみなす行・列の墨比率
LINE_RATIO = 0.55
#: これより明るい画素は地とみなす
PAPER = 235


def grid(mask: np.ndarray, axis: int, want: int) -> list[int]:
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


def main(path: str, cols: int, rows: int, out_dir: str,
         names: str, color: str = '#C9452F') -> None:
    img = np.array(Image.open(path).convert('RGB')).astype(int)
    ink = img.mean(2) < PAPER
    ys = grid(ink, 0, rows)
    xs = grid(ink, 1, cols)
    rgb = tuple(int(color.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    os.makedirs(out_dir, exist_ok=True)
    labels = [s.strip() for s in names.split(',') if s.strip()]
    n = 0
    for i in range(cols * rows):
        r, c = divmod(i, cols)
        if r >= rows or i >= len(labels):
            break
        pad = 6
        cell = img[ys[r] + pad:ys[r + 1] - pad, xs[c] + pad:xs[c + 1] - pad]
        if cell.size == 0:
            continue
        # 地は白。暗いほど濃い図形とみなして不透明度にする。
        lum = cell.mean(2)
        alpha = np.clip((PAPER - lum) / PAPER * 1.6, 0, 1)
        if alpha.max() < 0.15:
            print(f'  {labels[i]}: 空のマス')
            continue
        # 余白を落とす
        yy, xx = np.where(alpha > 0.2)
        a = alpha[yy.min():yy.max() + 1, xx.min():xx.max() + 1]
        h, w = a.shape
        out = np.zeros((h, w, 4), np.uint8)
        out[..., 0], out[..., 1], out[..., 2] = rgb
        out[..., 3] = (a * 255).astype(np.uint8)
        Image.fromarray(out).save(f'{out_dir}/{labels[i]}.png')
        print(f'  {labels[i]}: {w}x{h}px')
        n += 1
    print(f'{n} 個を書き出した → {out_dir}')


if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4],
         sys.argv[5], sys.argv[6] if len(sys.argv) > 6 else '#C9452F')
