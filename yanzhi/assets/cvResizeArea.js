// cvResizeArea.js
// Pure-JS, dependency-free, byte-exact replica of
//   cv2.resize(src, (224,224), interpolation=cv2.INTER_AREA)
// for uint8 RGB8 input (row-major, 3 bytes/pixel).
//
// Verified against three frozen golden crops (ycy-front 429x518, low-b1 744x844,
// men-test01 1739x1967) produced by OpenCV 5.0.0: SHA256 of output matches the
// golden resized224_sha256 bit-for-bit (max per-pixel diff = 0).
//
// Semantics replicated (see _diag_algo.py):
//   * Separable area filter. For output index k (0..223):
//         L = k * scale,  R = (k+1) * scale,   scale = srcLen / 224
//     output pixel averages all source pixels overlapping [L, R), weighted by
//     overlap length. First source index = floor(L), last = floor(R) inclusive;
//     weight for source i = length(intersect([i,i+1), [L,R))).
//   * Horizontal pass produces an unrounded Float64 intermediate; vertical pass
//     accumulates in double (JS Number is IEEE-754 double, matching cv2's
//     double accumulation path — required for wide crops where float32 errs by 1).
//   * Final pixel = saturate_cast<uchar>(v)  ==  clamp[0,255](floor(v + 0.5)).
//
// No retraining, no model change, no formal-page change.

/**
 * Resize uint8 RGB8 to 224x224 with cv2.INTER_AREA semantics.
 * @param {Uint8Array} src   row-major RGB8, length = srcW*srcH*3
 * @param {number} srcW
 * @param {number} srcH
 * @returns {Uint8Array}     224*224*3 row-major RGB8
 */
function resizeArea224(src, srcW, srcH) {
  if (!(src instanceof Uint8Array)) throw new TypeError('src must be Uint8Array')
  if (srcW <= 0 || srcH <= 0) throw new RangeError('bad src dims')
  if (src.length !== srcW * srcH * 3) throw new RangeError('src length mismatch')

  const D = 224
  const out = new Uint8Array(D * D * 3)

  // Precompute 1-D area coefficients for one axis.
  // Returns array of length dstLen; each entry is a flat [i0,w0, i1,w1, ...] list.
  const buildAxis = (srcLen, dstLen) => {
    const scale = srcLen / dstLen
    const coeffs = new Array(dstLen)
    for (let k = 0; k < dstLen; k++) {
      const L = k * scale
      const R = (k + 1) * scale
      const iStart = Math.floor(L)
      const iEnd = Math.floor(R) // inclusive
      const list = []
      for (let i = iStart; i <= iEnd; i++) {
        if (i < 0 || i >= srcLen) continue // zero-weight / out-of-bounds
        const lo = L > i ? L : i
        const hi = R < i + 1 ? R : i + 1
        const w = hi - lo
        if (w > 0) list.push(i, w)
      }
      coeffs[k] = list
    }
    return { scale, coeffs }
  }

  const x = buildAxis(srcW, D)
  const y = buildAxis(srcH, D)

  // Horizontal pass: src (srcH x srcW x 3) -> tmp (srcH x D x 3) Float64.
  const tmp = new Float64Array(srcH * D * 3)
  for (let r = 0; r < srcH; r++) {
    const srcRowOff = r * srcW * 3
    const tmpRowOff = r * D * 3
    for (let dx = 0; dx < D; dx++) {
      const c = x.coeffs[dx]
      let s0 = 0,
        s1 = 0,
        s2 = 0
      for (let p = 0; p < c.length; p += 2) {
        const i = c[p]
        const w = c[p + 1]
        const off = srcRowOff + i * 3
        s0 += w * src[off]
        s1 += w * src[off + 1]
        s2 += w * src[off + 2]
      }
      const o = tmpRowOff + dx * 3
      tmp[o] = s0 / x.scale
      tmp[o + 1] = s1 / x.scale
      tmp[o + 2] = s2 / x.scale
    }
  }

  // Vertical pass: tmp (srcH x D x 3) -> out (D x D x 3) uint8.
  for (let dy = 0; dy < D; dy++) {
    const c = y.coeffs[dy]
    const outRowOff = dy * D * 3
    for (let dx = 0; dx < D; dx++) {
      let s0 = 0,
        s1 = 0,
        s2 = 0
      for (let p = 0; p < c.length; p += 2) {
        const j = c[p]
        const w = c[p + 1]
        const off = j * D * 3 + dx * 3
        s0 += w * tmp[off]
        s1 += w * tmp[off + 1]
        s2 += w * tmp[off + 2]
      }
      const o = outRowOff + dx * 3
      out[o] = clampRound(s0 / y.scale)
      out[o + 1] = clampRound(s1 / y.scale)
      out[o + 2] = clampRound(s2 / y.scale)
    }
  }

  return out
}

// saturate_cast<uchar>: floor(v + 0.5) clamped to [0,255].
function clampRound(v) {
  v = v + 0.5
  v = v > 0 ? Math.floor(v) : 0
  return v > 255 ? 255 : v
}

// Global mount for non-module script tag
window.cvResizeArea = { resizeArea224: resizeArea224 }
