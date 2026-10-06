#!/usr/bin/env python3
"""MatMath oracle: parameter sets + an independent python implementation of
the mat geometry. Every border, window and cut mark is recomputed here."""
import json, os

IN = 25.4
def to_mm(v, u): return v * IN if u == 'in' else v
def from_mm(v, u): return v / IN if u == 'in' else v

CASES = [
    {'name': 'a4-print-8x10-frame', 'unit': 'in',
     'frameW': 10, 'frameH': 8, 'printW': 8.27, 'printH': 11.69/2,
     'overlap': 0.125, 'mode': 'even'},
    {'name': 'square-optical', 'unit': 'mm',
     'frameW': 400, 'frameH': 400, 'printW': 200, 'printH': 200,
     'overlap': 3, 'mode': 'optical', 'weight': 0.15},
    {'name': 'pano-mm-optical', 'unit': 'mm',
     'frameW': 700, 'frameH': 300, 'printW': 600, 'printH': 200,
     'overlap': 5, 'mode': 'optical', 'weight': 0.2},
    {'name': 'print-too-big', 'unit': 'in',
     'frameW': 8, 'frameH': 10, 'printW': 9, 'printH': 12,
     'overlap': 0.125, 'mode': 'even'},
    {'name': 'overlap-eats-print', 'unit': 'mm',
     'frameW': 300, 'frameH': 300, 'printW': 8, 'printH': 8,
     'overlap': 5, 'mode': 'even'},
    {'name': 'thin-border', 'unit': 'in',
     'frameW': 8.5, 'frameH': 11, 'printW': 8, 'printH': 10.5,
     'overlap': 0.125, 'mode': 'even', 'minBorder': 1.0},
]

def oracle(o):
    u = o['unit']
    fw, fh = to_mm(o['frameW'], u), to_mm(o['frameH'], u)
    pw, ph = to_mm(o['printW'], u), to_mm(o['printH'], u)
    ov = to_mm(o['overlap'], u)
    weight = o.get('weight', 0.15)
    min_b = to_mm(o.get('minBorder', 25), u)
    warns = []
    win_w, win_h = pw - 2*ov, ph - 2*ov
    if win_w <= 0 or win_h <= 0:
        warns.append('window-not-positive')
    bw, bh = (fw - win_w)/2, (fh - win_h)/2
    left = right = bw
    if o['mode'] == 'optical':
        top, bottom = bh*(1-weight), bh*(1+weight)
    else:
        top = bottom = bh
    if pw > fw or ph > fh:
        warns.append('print-too-big')
    for b in (left, right, top, bottom):
        if b < 0:
            warns.append('negative-border')
        elif b < min_b:
            warns.append('thin-border')
    return {
        'window_w': win_w, 'window_h': win_h,
        'left': left, 'right': right, 'top': top, 'bottom': bottom,
        'cut_left': left, 'cut_right': left + win_w,
        'cut_top': top, 'cut_bottom': top + win_h,
        'warnings': sorted(set(warns)),
    }

items = []
for c in CASES:
    r = oracle(c)
    items.append({'name': c['name'], 'input': c, 'oracle': r})

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expected.json')
with open(out, 'w') as f:
    json.dump({'items': items}, f)
print('cases:', len(items))
