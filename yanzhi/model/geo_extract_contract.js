// geo_extract_contract.js — frozen 17:26 geometric beauty model feature contract
// Verified: reproduces raw_1_5 ycy-front=2.566, men-test01=3.015, low-b1=1.956 (|err|<0.0003)
// Weights are NOT embedded here; load from model_histgb.js (BASELINE + TREES) and pass to predictFrozen.
;(function (global) {
  var FEATURES = [
    'eye_r_w',
    'eye_l_w',
    'eye_r_h',
    'eye_l_h',
    'eye_r_ratio',
    'eye_l_ratio',
    'eye_w_sym',
    'eye_h_sym',
    'eye_inner',
    'eye_outer',
    'eye_r_slant',
    'eye_l_slant',
    'eye_slant_sym',
    'brow_eye_r',
    'brow_eye_l',
    'brow_r_arch',
    'brow_l_arch',
    'pupil_cx',
    'nose_w',
    'nose_len',
    'nose_chin',
    'nose_bridge',
    'nose_cx',
    'nose_angle',
    'nose_face',
    'mouth_w',
    'mouth_open',
    'up_lip',
    'lo_lip',
    'lip_ratio',
    'mouth_cx',
    'mouth_face',
    'mouth_corner_sym',
    'fw_fh',
    'jaw_w',
    'chin_w',
    'chin_h',
    'fore_h',
    'jaw_a_r',
    'jaw_a_l',
    'jaw_a_sym',
    'face_area',
    'cheek_jaw',
    'sym_mean',
    'sym_max',
    'pose_yaw',
    'pose_pitch',
    'pose_roll',
    'geom_conf',
    'eye_line_c',
    'face_scale',
    'mp_eye_r_hw',
    'mp_eye_l_hw',
    'mp_eye_h_sym',
    'mp_eye_w_sym',
    'mp_iris_r',
    'mp_iris_l',
    'mp_nose_width',
    'mp_nose_tip',
    'mp_mouth_w',
    'mp_mouth_open',
    'mp_upper_lip',
    'mp_lower_lip',
    'mp_lip_ratio',
    'mp_face_w',
    'mp_face_h',
    'mp_wh_ratio',
    'mp_nose_cx',
    'mp_mouth_curve',
    'mp_cheek_r',
    'mp_cheek_l',
    'mp_cheek_sym',
    'mp_jaw_w',
    'mp_chin',
    'mp_brow_r',
    'mp_brow_l',
  ]
  var BASELINE = 3.265614

  function dist(pts, a, b) {
    return Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1])
  }
  function ang(pts, a, b, c) {
    var v1 = [pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]],
      v2 = [pts[c][0] - pts[b][0], pts[c][1] - pts[b][1]]
    var cos =
      (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]) + 1e-9)
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI
  }

  // lm: array of 478 {x,y} normalized landmarks; w,h pixel dims.
  // Returns object keyed by FEATURES names. s = iris IPD px (see scale_def).
  function computeGeoFeats(lm, w, h) {
    var pts = []
    for (var i = 0; i < lm.length; i++) pts.push([lm[i].x * w, lm[i].y * h])
    function p(i) {
      return pts[i]
    }
    var ipd = dist(pts, 468, 473),
      fw = dist(pts, 234, 454),
      fh = dist(pts, 10, 152)
    var s = ipd > 1 ? ipd : fw > 1 ? fw : 1.0
    function nd(a, b) {
      return dist(pts, a, b) / s
    }
    var fcx = (pts[234][0] + pts[454][0]) / 2
    var rew = dist(pts, 33, 133),
      lew = dist(pts, 263, 362)
    var reh = (dist(pts, 159, 145) + dist(pts, 158, 153)) / 2
    var leh = (dist(pts, 386, 374) + dist(pts, 385, 380)) / 2
    var f = {}
    f.eye_r_w = rew / s
    f.eye_l_w = lew / s
    f.eye_r_h = reh / s
    f.eye_l_h = leh / s
    f.eye_r_ratio = rew / (reh + 1e-6)
    f.eye_l_ratio = lew / (leh + 1e-6)
    f.eye_w_sym = Math.abs(rew - lew) / (rew + lew + 1e-6)
    f.eye_h_sym = Math.abs(reh - leh) / (reh + leh + 1e-6)
    f.eye_inner = nd(133, 362)
    f.eye_outer = nd(33, 263)
    function sl(a, b) {
      var dx = p(b)[0] - p(a)[0],
        dy = p(b)[1] - p(a)[1]
      return ((Math.atan2(dy, Math.abs(dx) + 1e-6) * 180) / Math.PI) * -1
    }
    f.eye_r_slant = sl(133, 33)
    f.eye_l_slant = sl(362, 263)
    f.eye_slant_sym = Math.abs(f.eye_r_slant - f.eye_l_slant)
    f.brow_eye_r = nd(55, 159)
    f.brow_eye_l = nd(285, 386)
    f.brow_r_arch = (pts[65][1] - pts[55][1]) / s
    f.brow_l_arch = (pts[295][1] - pts[285][1]) / s
    f.pupil_cx = ((pts[468][0] + pts[473][0]) / 2 - fcx) / s
    f.nose_w = nd(2, 97)
    f.nose_len = nd(6, 1)
    f.nose_chin = nd(1, 152)
    f.nose_bridge = nd(6, 168)
    f.nose_cx = (pts[1][0] - fcx) / s
    f.nose_angle = ang(pts, 6, 1, 152)
    f.nose_face = f.nose_w / (fw / s)
    var mcx = (pts[61][0] + pts[291][0]) / 2,
      mcyu = pts[0][1],
      mcyo = pts[17][1]
    f.mouth_w = nd(61, 291)
    f.mouth_open = nd(13, 14)
    f.up_lip = Math.hypot(pts[0][0] - mcx, pts[0][1] - mcyu) / s
    f.lo_lip = Math.hypot(pts[17][0] - mcx, pts[17][1] - mcyo) / s
    f.lip_ratio = f.up_lip / (f.lo_lip + 1e-6)
    f.mouth_cx = (mcx - fcx) / s
    f.mouth_face = f.mouth_w / (fw / s)
    f.mouth_corner_sym = 0.0
    f.fw_fh = fw / (fh + 1e-6)
    f.jaw_w = nd(172, 397)
    f.chin_w = nd(176, 399)
    f.chin_h = nd(152, 175)
    f.fore_h = nd(10, 151)
    f.jaw_a_r = ang(pts, 234, 172, 152)
    f.jaw_a_l = ang(pts, 454, 397, 152)
    f.jaw_a_sym = Math.abs(f.jaw_a_r - f.jaw_a_l)
    var ar = fw * fh * 0.6
    f.face_area = ar / (s * s)
    f.cheek_jaw = fw / s / (f.jaw_w + 1e-6)
    f.sym_mean = Math.abs(pts[1][0] - fcx) / s
    f.sym_max = f.sym_mean
    f.pose_yaw = (pts[1][0] - fcx) / (fw / 2 + 1e-6)
    var ey = (pts[468][1] + pts[473][1]) / 2
    f.pose_pitch = (ey - pts[10][1]) / (pts[152][1] - ey + 1e-6)
    f.pose_roll =
      (Math.atan2(pts[473][1] - pts[468][1], Math.abs(pts[473][0] - pts[468][0]) + 1e-6) * 180) /
      Math.PI
    f.geom_conf = 1.0 / (f.sym_mean + 0.05)
    f.eye_line_c = ((pts[468][0] + pts[473][0]) / 2 - fcx) / (fw / 2 + 1e-6)
    f.face_scale = s
    // mp_ features (exact 17:26 quirks)
    f.mp_eye_r_hw = reh / (rew + 1e-6)
    f.mp_eye_l_hw = leh / (lew + 1e-6)
    f.mp_eye_h_sym = Math.abs(reh - leh) / (reh + leh + 1e-6)
    f.mp_eye_w_sym = Math.abs(rew - lew) / (rew + lew + 1e-6)
    f.mp_iris_r = dist(pts, 469, 471) / s
    f.mp_iris_l = dist(pts, 474, 476) / s
    f.mp_nose_width = nd(2, 97)
    f.mp_nose_tip = nd(4, 1)
    f.mp_mouth_w = nd(61, 291)
    f.mp_mouth_open = nd(13, 14)
    f.mp_upper_lip = nd(0, 13)
    f.mp_lower_lip = nd(14, 17)
    f.mp_lip_ratio = f.mp_upper_lip / (f.mp_lower_lip + 1e-6)
    f.mp_face_w = fw / s
    f.mp_face_h = fh / s
    f.mp_wh_ratio = f.mp_face_w / (f.mp_face_h + 1e-6)
    f.mp_nose_cx = f.nose_cx
    f.mp_mouth_curve = 0.0
    f.mp_cheek_r = nd(50, 207)
    f.mp_cheek_l = nd(280, 430)
    f.mp_cheek_sym = Math.abs(f.mp_cheek_r - f.mp_cheek_l) / (f.mp_cheek_r + f.mp_cheek_l + 1e-6)
    f.mp_jaw_w = f.jaw_w
    f.mp_chin = nd(152, 175)
    f.mp_brow_r = nd(55, 105)
    f.mp_brow_l = nd(285, 334)
    return f
  }

  function poseGate(f) {
    var g = 1.0,
      warn = []
    if (Math.abs(f.pose_yaw) > 0.15) {
      g *= 0.85
      warn.push('large_yaw')
    }
    if (Math.abs(f.pose_roll) > 10) {
      g *= 0.9
      warn.push('large_roll')
    }
    if (f.geom_conf < 3) {
      g *= 0.9
      warn.push('low_confidence')
    }
    return { gate: g, warn: warn }
  }

  // trees: array of trees from model_histgb.js TREES. Each node {l,f,t,le,ri,v}.
  function predictFrozen(f, trees) {
    var s = BASELINE
    for (var t = 0; t < trees.length; t++) {
      var tree = trees[t],
        ni = 0
      while (!tree[ni].l) {
        var v = f[FEATURES[tree[ni].f]] || 0
        ni = v <= tree[ni].t ? tree[ni].le : tree[ni].ri
      }
      s += tree[ni].v
    }
    return Math.min(5, Math.max(1, s))
  }
  function score(lm, w, h, trees) {
    var f = computeGeoFeats(lm, w, h)
    var raw = predictFrozen(f, trees)
    var g = poseGate(f)
    return {
      raw_1_5: raw,
      gated_1_5: Math.min(5, Math.max(1, 3.0 + (raw - 3.0) * g.gate)),
      gate: g.gate,
      warn: g.warn,
      feats: f,
    }
  }
  global.GeoContract = {
    FEATURES: FEATURES,
    BASELINE: BASELINE,
    computeGeoFeats: computeGeoFeats,
    poseGate: poseGate,
    predictFrozen: predictFrozen,
    score: score,
  }
})(typeof window !== 'undefined' ? window : globalThis)
