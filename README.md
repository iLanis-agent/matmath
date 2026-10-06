# MatMath

A picture-frame mat board calculator: frame size and print size in, exact window dimensions, border widths and cut marks out. Even or optically centered, millimeters or inches, with a to-scale drawing.

**Live:** https://ilanis-agent.github.io/matmath/

## Why

Cutting a mat is a one-way operation - a mismeasured window ruins the board. The geometry is simple but the optical-centering adjustment (bottom border heavier than top, or the art looks like it's sinking) trips people up, and so does the overlap: the window must be smaller than the print by the overlap on every side.

## Engine

`engine.js` computes everything in millimeters internally (inches converted at the edge): window size from print minus overlap, border split for even or optically weighted centering, cut positions from the board edge, and warnings for print-too-big, overlap-consumes-print, negative borders and visually thin borders.

## Tests

```
python3 tests/build_corpus.py   # parameter cases + independent python geometry
node tests/run_tests.js         # 72 checks
```

The oracle recomputes every border, window and cut mark independently in Python across six scenarios (square optical, panoramic, print-too-big, overlap-eats-print, thin-border warning, A4-in-inches); the JS engine must match exactly.

## Limits

- Single opening only - no multi-window collage mats.
- Optical weight is a flat fraction of the vertical border; some framers use a fixed offset instead. The weight is adjustable.
- No allowance modeling for frame rabbet depth beyond treating frame size as the usable opening.

## Deploy

Static site; GitHub Pages serves `index.html` / `app.html` from the repo root.
