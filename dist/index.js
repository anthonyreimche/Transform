//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/transform.ts
function r(e, t) {
	let n = Array(9);
	for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) n[r * 3 + i] = e[r * 3 + 0] * t[0 + i] + e[r * 3 + 1] * t[3 + i] + e[r * 3 + 2] * t[6 + i];
	return n;
}
function i(e, t, n) {
	let r = e[0] * t + e[1] * n + e[2], i = e[3] * t + e[4] * n + e[5], a = e[6] * t + e[7] * n + e[8], o = a === 0 ? 1e-6 : a;
	return {
		x: r / o,
		y: i / o
	};
}
function a(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return [
		t,
		-n,
		0,
		n,
		t,
		0,
		0,
		0,
		1
	];
}
function o(e, t) {
	return [
		e,
		0,
		0,
		0,
		t,
		0,
		0,
		0,
		1
	];
}
function s(e, t) {
	return [
		1,
		0,
		e,
		0,
		1,
		t,
		0,
		0,
		1
	];
}
function c(e) {
	return [[
		e,
		0,
		-.5 * e,
		0,
		1,
		-.5,
		0,
		0,
		1
	], [
		1 / e,
		0,
		.5,
		0,
		1,
		.5,
		0,
		0,
		1
	]];
}
function l(e, t, n) {
	return {
		theta: e * Math.PI / 180,
		gh: t.perspectiveH / 100 * .6,
		gv: t.perspectiveV / 100 * .6,
		as: 1.5 ** (t.aspect / 100),
		s: 2 ** ((t.scale - 100) / 200),
		tx: t.offsetX / 100 * .5 * n,
		ty: t.offsetY / 100 * .5,
		fh: t.flipH ? -1 : 1,
		fv: t.flipV ? -1 : 1
	};
}
function u(e, t, n) {
	let { theta: i, gh: u, gv: d, as: f, s: p, tx: m, ty: h, fh: g, fv: _ } = l(e, t, n), [v, y] = c(n), b = o(g, _), x = [
		1,
		0,
		0,
		0,
		1,
		0,
		-u,
		-d,
		1
	], S = o(1 / f, f), C = o(1 / p, 1 / p), w = s(-m, -h), T = r(a(i), b);
	return T = r(T, x), T = r(T, S), T = r(T, C), T = r(T, w), r(y, r(T, v));
}
function d(e, t, n) {
	let { theta: i, gh: u, gv: d, as: f, s: p, tx: m, ty: h, fh: g, fv: _ } = l(e, t, n), [v, y] = c(n), b = [
		1,
		0,
		0,
		0,
		1,
		0,
		u,
		d,
		1
	], x = o(g, _), S = r(s(m, h), o(p, p));
	return S = r(S, o(f, 1 / f)), S = r(S, b), S = r(S, x), S = r(S, a(-i)), r(y, r(S, v));
}
//#endregion
//#region src/crop-maths.ts
function f(e, t) {
	let n = e.x - .5, r = e.y - .5, i = .5 * Math.sqrt(t.aspect * t.aspect + 1), a = Math.hypot(n * t.aspect, r) / i, o = a * a, s = 1;
	t.model === 1 ? s = 1 - t.b + t.b * o : t.model === 2 ? s = 1 + t.b * o + t.a * o * o : t.model === 3 && (s = t.a * o * a + t.b * o + t.c * a + (1 - t.a - t.b - t.c)), Math.abs(t.manual) > .001 && (s += t.manual * 3e-4 * o);
	let c = .5 + n * s, l = .5 + r * s;
	return t.autoCropScale > 1.001 && (c = .5 + (c - .5) / t.autoCropScale, l = .5 + (l - .5) / t.autoCropScale), {
		x: c,
		y: l
	};
}
function p(e, t) {
	let n = e / t, r, i;
	return n >= 1 ? (r = 1, i = 1 / n) : (i = 1, r = n), {
		x: (1 - r) / 2,
		y: (1 - i) / 2,
		width: r,
		height: i
	};
}
function m(e, t, n) {
	let r = i(t, e.x, e.y);
	return n && (r = f(r, n)), r.x >= -1e-7 && r.x <= 1.0000001 && r.y >= -1e-7 && r.y <= 1.0000001;
}
function h(e, t, n) {
	let r = e.x + e.width, i = e.y + e.height;
	if (!m({
		x: e.x,
		y: e.y
	}, t, n) || !m({
		x: r,
		y: e.y
	}, t, n) || !m({
		x: e.x,
		y: i
	}, t, n) || !m({
		x: r,
		y: i
	}, t, n)) return !1;
	if (!n) return !0;
	for (let a = 1; a < 4; a++) {
		let o = a / 4, s = e.x + o * e.width, c = e.y + o * e.height;
		if (!m({
			x: s,
			y: e.y
		}, t, n) || !m({
			x: s,
			y: i
		}, t, n) || !m({
			x: e.x,
			y: c
		}, t, n) || !m({
			x: r,
			y: c
		}, t, n)) return !1;
	}
	return !0;
}
function g(e, t, n) {
	if (h(e, t, n)) return e;
	let r = e.x + e.width / 2, i = e.y + e.height / 2, a = 0, o = 1;
	for (let s = 0; s < 24; s++) {
		let s = (a + o) / 2, c = e.width * s, l = e.height * s;
		h({
			x: r - c / 2,
			y: i - l / 2,
			width: c,
			height: l
		}, t, n) ? a = s : o = s;
	}
	let s = e.width * a, c = e.height * a;
	return {
		x: r - s / 2,
		y: i - c / 2,
		width: s,
		height: c
	};
}
function _(e, t, n, r) {
	let i = t > 0 ? p(t, n) : {
		x: 0,
		y: 0,
		width: 1,
		height: 1
	};
	return g({
		x: .5 - i.width / 2,
		y: .5 - i.height / 2,
		width: i.width,
		height: i.height
	}, e, r);
}
//#endregion
//#region src/upright.ts
function v(e, t, n) {
	let r = new Float32Array(t * n);
	for (let i = 0; i < t * n; i++) {
		let t = e[i * 4], n = e[i * 4 + 1], a = e[i * 4 + 2];
		r[i] = .2126 * t + .7152 * n + .0722 * a;
	}
	return r;
}
function y(e, t, n) {
	let r = new Float32Array(t * n), i = [
		1,
		2,
		1,
		2,
		4,
		2,
		1,
		2,
		1
	];
	for (let a = 1; a < n - 1; a++) for (let n = 1; n < t - 1; n++) {
		let o = 0;
		for (let r = -1; r <= 1; r++) for (let s = -1; s <= 1; s++) o += e[(a + r) * t + (n + s)] * i[(r + 1) * 3 + (s + 1)];
		r[a * t + n] = o / 16;
	}
	return r;
}
function b(e, t, n) {
	let r = new Float32Array(t * n), i = new Float32Array(t * n);
	for (let a = 1; a < n - 1; a++) for (let n = 1; n < t - 1; n++) {
		let o = e[(a - 1) * t + (n - 1)], s = e[(a - 1) * t + n], c = e[(a - 1) * t + (n + 1)], l = e[a * t + (n - 1)], u = e[a * t + (n + 1)], d = e[(a + 1) * t + (n - 1)], f = e[(a + 1) * t + n], p = e[(a + 1) * t + (n + 1)], m = -o + c - 2 * l + 2 * u - d + p, h = -o - 2 * s - c + d + 2 * f + p;
		r[a * t + n] = Math.sqrt(m * m + h * h), i[a * t + n] = Math.atan2(h, m);
	}
	return {
		magnitude: r,
		angle: i,
		w: t,
		h: n
	};
}
function x(e) {
	let { magnitude: t, angle: n, w: r, h: i } = e, a = new Float32Array(r * i);
	for (let e = 1; e < i - 1; e++) for (let i = 1; i < r - 1; i++) {
		let o = e * r + i, s = t[o];
		if (s === 0) continue;
		let c = n[o];
		c < 0 && (c += Math.PI);
		let l, u;
		c < Math.PI / 8 || c >= 7 * Math.PI / 8 ? (l = t[e * r + (i - 1)], u = t[e * r + (i + 1)]) : c < 3 * Math.PI / 8 ? (l = t[(e - 1) * r + (i + 1)], u = t[(e + 1) * r + (i - 1)]) : c < 5 * Math.PI / 8 ? (l = t[(e - 1) * r + i], u = t[(e + 1) * r + i]) : (l = t[(e - 1) * r + (i - 1)], u = t[(e + 1) * r + (i + 1)]), a[o] = s >= l && s >= u ? s : 0;
	}
	return a;
}
function S(e, t, n) {
	let r = 0;
	for (let t = 0; t < e.length; t++) e[t] > r && (r = e[t]);
	let i = r * .1, a = i * .3, o = new Uint8Array(t * n);
	for (let t = 0; t < e.length; t++) o[t] = e[t] >= i ? 2 : +(e[t] >= a);
	let s = !0;
	for (; s;) {
		s = !1;
		for (let e = 1; e < n - 1; e++) for (let n = 1; n < t - 1; n++) {
			let r = e * t + n;
			if (o[r] === 1) for (let i = -1; i <= 1; i++) {
				for (let a = -1; a <= 1; a++) if (o[(e + i) * t + (n + a)] === 2) {
					o[r] = 2, s = !0;
					break;
				}
				if (o[r] === 2) break;
			}
		}
	}
	for (let e = 0; e < o.length; e++) o[e] = +(o[e] === 2);
	return o;
}
var C = Math.PI / 180 * .5, w = Math.ceil(Math.PI / C);
function T(e, t, n, r) {
	let i = Math.sqrt(t * t + n * n), a = Math.ceil(i), o = 2 * a + 1, s = new Float32Array(w), c = new Float32Array(w);
	for (let e = 0; e < w; e++) {
		let t = e * C;
		s[e] = Math.sin(t), c[e] = Math.cos(t);
	}
	let l = new Int32Array(o * w);
	for (let r = 0; r < n; r++) for (let n = 0; n < t; n++) if (e[r * t + n]) for (let e = 0; e < w; e++) {
		let t = Math.round(n * c[e] + r * s[e]) + a;
		l[t * w + e]++;
	}
	let u = [];
	for (let e = 0; e < r; e++) {
		let e = 0, r = 0, i = 0;
		for (let t = 0; t < o; t++) for (let n = 0; n < w; n++) l[t * w + n] > e && (e = l[t * w + n], r = t, i = n);
		let s = Math.max(10, Math.round(Math.sqrt(t * n) * .03));
		if (e < s) break;
		let c = (e, t, n) => {
			let r = e - 2 * t + n;
			return r === 0 ? 0 : Math.max(-.5, Math.min(.5, .5 * (e - n) / r));
		}, d = 0;
		i > 0 && i < w - 1 && (d = c(l[r * w + i - 1], e, l[r * w + i + 1]));
		let f = 0;
		r > 0 && r < o - 1 && (f = c(l[(r - 1) * w + i], e, l[(r + 1) * w + i])), u.push({
			rho: r + f - a,
			theta: (i + d) * C,
			votes: e
		});
		for (let e = Math.max(0, r - 10); e <= Math.min(o - 1, r + 10); e++) for (let t = Math.max(0, i - 10); t <= Math.min(w - 1, i + 10); t++) l[e * w + t] = 0;
	}
	return u;
}
function ee(e, t, n) {
	return T(S(x(b(y(v(e, t, n), t, n), t, n)), t, n), t, n, 40);
}
function te(e, t, n) {
	if (e.length === 0) return {
		horizontal: [],
		vertical: []
	};
	let r = Math.max(...e.map((e) => e.votes)) * .15, i = e.filter((e) => e.votes >= r), a = Math.PI / 180 * 30, o = Math.PI / 180 * 30, s = Math.max(3, t * .02), c = Math.max(3, n * .02), l = [], u = [];
	for (let e of i) {
		let r = e.theta, i = Math.sin(r), d = Math.cos(r);
		if (Math.abs(r - Math.PI / 2) < a) {
			let r = (e.rho - t / 2 * d) / i;
			if (r < c || r > n - c) continue;
			l.push(e);
		} else if (r < o || r > Math.PI - o) {
			let r = (e.rho - n / 2 * i) / d;
			if (r < s || r > t - s) continue;
			u.push(e);
		}
	}
	return {
		horizontal: l,
		vertical: u
	};
}
function E(e, t, n) {
	let r = Math.cos(e.theta), i = Math.sin(e.theta), a = e.rho * r, o = e.rho * i, s = -i, c = r, l = Math.hypot(t, n);
	return {
		x1: (a - l * s) / t,
		y1: (o - l * c) / n,
		x2: (a + l * s) / t,
		y2: (o + l * c) / n
	};
}
function D(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) for (let r = n + 1; r < e.length; r++) {
		let i = e[r].x - e[n].x;
		Math.abs(i) < 1e-6 || t.push((e[r].y - e[n].y) / i);
	}
	if (t.length === 0) return null;
	t.sort((e, t) => e - t);
	let n = Math.floor(t.length / 2);
	return t.length % 2 ? t[n] : (t[n - 1] + t[n]) / 2;
}
function O(e, t) {
	let n = [];
	for (let r of e) {
		let e = r.x2 - r.x1, i = r.y2 - r.y1;
		if (t === "x") {
			if (Math.abs(e) < 1e-9) continue;
			n.push({
				x: r.y1 + i * (.5 - r.x1) / e,
				y: i / e
			});
		} else {
			if (Math.abs(i) < 1e-9) continue;
			n.push({
				x: r.x1 + e * (.5 - r.y1) / i,
				y: e / i
			});
		}
	}
	return n.length === 0 ? null : D(n);
}
function k(e, t, n) {
	let r = (e) => Math.max(-100, Math.min(100, e)), i = 0, a = 0, o = null, s = null;
	if (e.length >= 1) {
		let t = 0;
		for (let r of e) {
			let e = (r.x2 - r.x1) * n, i = r.y2 - r.y1;
			e < 0 && (e = -e, i = -i), t += Math.atan2(i, e);
		}
		o = t / e.length * 180 / Math.PI;
	}
	if (t.length >= 1) {
		let e = 0;
		for (let r of t) {
			let t = (r.x2 - r.x1) * n, i = r.y2 - r.y1;
			i > 0 && (t = -t, i = -i), e += Math.atan2(t, -i);
		}
		s = e / t.length * 180 / Math.PI;
	}
	let c = 0;
	if (o !== null && s !== null ? c = (o + s) / 2 : o === null ? s !== null && (c = s) : c = o, t.length >= 2) {
		let e = O(t, "y");
		e !== null && (i = r(e / .6 * 100));
	}
	if (e.length >= 2) {
		let t = O(e, "x");
		t !== null && (a = r(t / n / .6 * 100));
	}
	return {
		straighten: Math.max(-45, Math.min(45, c)),
		perspectiveV: i,
		perspectiveH: a
	};
}
function ne(e, t, n, r) {
	let { horizontal: i, vertical: a } = te(e, n, r), o = n / r, s = (e) => [...e].sort((e, t) => t.votes - e.votes).slice(0, 8), c = s(i).map((e) => E(e, n, r)), l = s(a).map((e) => E(e, n, r)), u = (e) => Math.max(-20, Math.min(20, e)), d = (e) => Math.max(-100, Math.min(100, e));
	switch (t) {
		case "level": return {
			straighten: u(k(c, [], o).straighten),
			perspectiveV: 0,
			perspectiveH: 0
		};
		case "vertical": {
			let e = k([], l, o);
			return {
				straighten: u(e.straighten),
				perspectiveV: d(e.perspectiveV),
				perspectiveH: 0
			};
		}
		case "auto": {
			let e = k(c, l, o);
			return {
				straighten: u(e.straighten),
				perspectiveV: d(e.perspectiveV),
				perspectiveH: d(e.perspectiveH)
			};
		}
		case "full": {
			let e = k(c, l, o), t = d(e.perspectiveV), n = d(e.perspectiveH), r = t / 100 * .6, i = n / 100 * .6, a = 1 / (1 - .25 * r * r) / (1 / (1 - .25 * i * i)), s = 100 * Math.log(1 / a) / Math.log(1.5);
			return {
				straighten: u(e.straighten),
				perspectiveV: t,
				perspectiveH: n,
				aspect: d(s)
			};
		}
		default: return {
			straighten: 0,
			perspectiveV: 0,
			perspectiveH: 0
		};
	}
}
function re(e, t) {
	if (e.length === 0) return {
		straighten: 0,
		perspectiveV: 0,
		perspectiveH: 0
	};
	let n = Math.PI / 4, r = [], i = [];
	for (let a of e) {
		let e = (a.x2 - a.x1) * t, o = a.y2 - a.y1, s = Math.abs(Math.atan2(o, e));
		s < n || s > Math.PI - n ? r.push(a) : i.push(a);
	}
	return k(r, i, t);
}
//#endregion
//#region src/state.ts
var A = !1, j = /* @__PURE__ */ new Set(), M = () => A;
function N(e) {
	if (e !== A) {
		A = e;
		for (let e of j) e();
	}
}
var P = (e) => (j.add(e), () => void j.delete(e)), ie = () => e.useSyncExternalStore(P, M), F = "safelight.crop.options", I = {
	constrain: !0,
	aspect: -1
};
function L() {
	t.variables.register(F, {
		initial: I,
		description: "Crop & Straighten: whether a crop keeps inside the image, and its aspect lock."
	});
}
var R = () => t.variables.get("safelight.crop.options")?.value ?? I, ae = (e) => void t.variables.update(F, (t) => ({
	...t,
	...e
}));
function oe() {
	let [n, r] = e.useState(R);
	return e.useEffect(() => t.variables.subscribe(F, (e) => r(e.value)), []), n;
}
function z() {
	let { sourceSize: e } = t.stores.useDevelopStore.getState();
	if (e.width > 0 && e.height > 0) return e.width / e.height;
	let { photos: n, activePhotoId: r } = t.stores.useCatalogStore.getState(), i = n.find((e) => e.id === r);
	return i && i.width > 0 && i.height > 0 ? i.width / i.height : 1;
}
//#endregion
//#region src/apply.ts
function B(e, n) {
	let { constrain: r, aspect: i } = R();
	if (!r) return;
	let a = z(), o = u(e, n, a);
	t.stores.useDevelopStore.getState().setParam("crop", _(o, i === -1 ? a : i, a));
}
function V(e) {
	let { params: n, setParam: r } = t.stores.useDevelopStore.getState(), i = {
		...n.transform,
		perspectiveV: Math.round(e.perspectiveV),
		perspectiveH: Math.round(e.perspectiveH),
		...e.aspect == null ? {} : { aspect: Math.round(e.aspect) }
	};
	r("straighten", e.straighten), r("transform", i), B(e.straighten, i);
}
function H() {
	let { guidedLines: e } = t.stores.useDevelopStore.getState().params, { straighten: n, perspectiveV: r, perspectiveH: i } = re(e, z());
	V({
		straighten: n,
		perspectiveV: r,
		perspectiveH: i
	});
}
async function se(e) {
	let n = await t.develop.readDevelopedPixels(256);
	return n ? ne(ee(n.data, n.width, n.height), e, n.width, n.height) : {
		straighten: 0,
		perspectiveV: 0,
		perspectiveH: 0
	};
}
//#endregion
//#region src/GuidedLines.tsx
function U(e, n, r) {
	let i = t.stores.useSettings.getState().uiScale || 1;
	return {
		x: (n - e.left) / i,
		y: (r - e.top) / i
	};
}
var W = (e) => t.cursors.resolve(e), G = 14, ce = "rgba(255,255,255,0.85)", K = "#ffffff";
function q(e, t, n, r, a) {
	let o = i(n, e, t), s = (o.x - a.x) / a.width, c = (o.y - a.y) / a.height;
	return {
		sx: r.x + s * r.w,
		sy: r.y + c * r.h
	};
}
function J(e, t, n, r, a) {
	let o = (e - r.x) / r.w, s = (t - r.y) / r.h, c = i(n, a.x + o * a.width, a.y + s * a.height);
	return {
		nx: Math.max(0, Math.min(1, c.x)),
		ny: Math.max(0, Math.min(1, c.y))
	};
}
function le({ rect: t, forward: n, inv: r, crop: i, lines: a, onChange: o, onCommit: s }) {
	let c = e.useRef(null), l = e.useRef(null), u = e.useCallback((e) => {
		let t = l.current;
		if (t) {
			let n = U(t.svgRect, e.clientX, e.clientY);
			return {
				sx: n.x,
				sy: n.y
			};
		}
		let n = c.current;
		if (!n) return {
			sx: 0,
			sy: 0
		};
		let r = U(n.getBoundingClientRect(), e.clientX, e.clientY);
		return {
			sx: r.x,
			sy: r.y
		};
	}, []), d = e.useCallback((e, r) => {
		for (let o = 0; o < a.length; o++) {
			let s = a[o], c = q(s.x1, s.y1, n, t, i), l = q(s.x2, s.y2, n, t, i);
			if (Math.hypot(e - c.sx, r - c.sy) < G) return {
				lineIdx: o,
				endpoint: "p1"
			};
			if (Math.hypot(e - l.sx, r - l.sy) < G) return {
				lineIdx: o,
				endpoint: "p2"
			};
		}
		return null;
	}, [
		a,
		n,
		t,
		i
	]), f = e.useCallback((e) => {
		e.preventDefault(), e.stopPropagation(), e.target.setPointerCapture(e.pointerId);
		let n = c.current;
		if (!n) return;
		let s = n.getBoundingClientRect(), { x: u, y: f } = U(s, e.clientX, e.clientY), p = d(u, f);
		if (p) {
			let e = a[p.lineIdx];
			l.current = {
				lineIdx: p.lineIdx,
				endpoint: p.endpoint,
				svgRect: s,
				origLine: { ...e }
			};
		} else {
			let e = J(u, f, r, t, i), n = {
				x1: e.nx,
				y1: e.ny,
				x2: e.nx,
				y2: e.ny
			}, c = [...a, n];
			o(c), l.current = {
				lineIdx: c.length - 1,
				endpoint: "p2",
				svgRect: s,
				origLine: n
			};
		}
	}, [
		a,
		t,
		r,
		i,
		d,
		o
	]), p = e.useCallback((e) => {
		if (!l.current) return;
		e.preventDefault();
		let { lineIdx: n, endpoint: s } = l.current, { sx: c, sy: d } = u(e), f = J(c, d, r, t, i), p = [...a], m = { ...p[n] };
		s === "p1" ? (m.x1 = f.nx, m.y1 = f.ny) : (m.x2 = f.nx, m.y2 = f.ny), p[n] = m, o(p);
	}, [
		a,
		t,
		r,
		i,
		o,
		u
	]), m = e.useCallback((e) => {
		if (!l.current) return;
		e.target.releasePointerCapture(e.pointerId);
		let { lineIdx: r } = l.current, c = a[r];
		if (c) {
			let e = q(c.x1, c.y1, n, t, i), s = q(c.x2, c.y2, n, t, i);
			Math.hypot(s.sx - e.sx, s.sy - e.sy) < 10 && o(a.filter((e, t) => t !== r));
		}
		l.current = null, s();
	}, [
		a,
		n,
		t,
		i,
		o,
		s
	]), h = e.useCallback((e) => {
		o(a.filter((t, n) => n !== e)), s();
	}, [
		a,
		o,
		s
	]);
	return /* @__PURE__ */ e.createElement("svg", {
		ref: c,
		style: {
			position: "absolute",
			left: 0,
			top: 0,
			width: "100%",
			height: "100%",
			pointerEvents: "all",
			cursor: W("crosshair")
		},
		onPointerDown: f,
		onPointerMove: p,
		onPointerUp: m
	}, a.map((r, a) => {
		let o = q(r.x1, r.y1, n, t, i), s = q(r.x2, r.y2, n, t, i), c = (o.sx + s.sx) / 2, l = (o.sy + s.sy) / 2;
		return /* @__PURE__ */ e.createElement("g", { key: a }, /* @__PURE__ */ e.createElement("line", {
			x1: o.sx,
			y1: o.sy,
			x2: s.sx,
			y2: s.sy,
			stroke: ce,
			strokeWidth: 2,
			strokeLinecap: "round",
			style: { pointerEvents: "none" }
		}), /* @__PURE__ */ e.createElement("circle", {
			cx: o.sx,
			cy: o.sy,
			r: 6,
			fill: K,
			stroke: "rgba(0,0,0,0.4)",
			strokeWidth: 1.5,
			style: {
				cursor: W("pan"),
				pointerEvents: "all"
			}
		}), /* @__PURE__ */ e.createElement("circle", {
			cx: s.sx,
			cy: s.sy,
			r: 6,
			fill: K,
			stroke: "rgba(0,0,0,0.4)",
			strokeWidth: 1.5,
			style: {
				cursor: W("pan"),
				pointerEvents: "all"
			}
		}), /* @__PURE__ */ e.createElement("g", {
			style: { cursor: W("pointer") },
			onClick: (e) => {
				e.stopPropagation(), h(a);
			},
			onPointerDown: (e) => e.stopPropagation()
		}, /* @__PURE__ */ e.createElement("circle", {
			cx: c,
			cy: l - 14,
			r: 7,
			fill: "rgba(0,0,0,0.6)",
			stroke: "white",
			strokeWidth: .5
		}), /* @__PURE__ */ e.createElement("text", {
			x: c,
			y: l - 10.5,
			textAnchor: "middle",
			fill: "white",
			fontSize: 10,
			fontWeight: 500,
			style: {
				pointerEvents: "none",
				userSelect: "none"
			}
		}, "×")));
	}), a.length === 0 && /* @__PURE__ */ e.createElement("text", {
		x: t.x + t.w / 2,
		y: t.y + t.h / 2,
		textAnchor: "middle",
		fill: "rgba(255,255,255,0.6)",
		fontSize: 12,
		style: {
			pointerEvents: "none",
			userSelect: "none"
		}
	}, "Click and drag to draw guide lines"));
}
//#endregion
//#region src/GuidedCanvas.tsx
function ue({ rect: n }) {
	let r = t.stores.useDevelopStore, i = r((e) => e.params.guidedLines), a = r((e) => e.params.straighten), o = r((e) => e.params.transform), s = r((e) => e.params.crop), c = r((e) => e.setParam), l = r((e) => e.commitEdit), f = r((e) => !!e.bypassedPanels["core.transform"]), { region: p, imageAspect: m } = t.develop.useDevelopOverlay();
	return f ? null : /* @__PURE__ */ e.createElement(le, {
		rect: n,
		forward: d(a, o, m),
		inv: u(a, o, m),
		crop: p ?? s,
		lines: i,
		onChange: (e) => c("guidedLines", e),
		onCommit: () => {
			H(), l("Guided Upright");
		}
	});
}
var de = {
	overlay: ue,
	zoomable: !1,
	onEscape: () => N(!1)
}, Y = "safelight-transform", X = {
	panel: `${Y}-panel`,
	modes: `${Y}-modes`,
	mode: `${Y}-mode`,
	active: `${Y}-active`,
	check: `${Y}-check`
};
function fe(e) {
	return `
:where(.${X.panel} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${X.modes}) { display: flex; gap: 0.125rem; margin-bottom: 0.25rem; }
:where(.${X.mode}) { flex: 1 1 0%; border-radius: 0.25rem; padding: 0.125rem 0.25rem; font-size: 10px; background-color: ${e.surface2}; color: ${e.textSecondary}; }
:where(.${X.mode}:hover) { background-color: ${e.surface3}; color: ${e.textPrimary}; }
:where(.${X.mode}.${X.active}) { background-color: ${e.accent}; color: ${e.textPrimary}; }
:where(.${X.check}) { display: flex; align-items: center; gap: 0.375rem; padding-top: 0.25rem; font-size: 11px; color: ${e.textSecondary}; }
:where(.${X.check} input) { accent-color: ${e.sliderFill}; }
html.sl-larger-text .${X.mode} { font-size: 12px !important; }
`;
}
//#endregion
//#region src/TransformPanel.tsx
var pe = [
	{
		mode: "off",
		label: "Off"
	},
	{
		mode: "level",
		label: "Level"
	},
	{
		mode: "vertical",
		label: "Vert"
	},
	{
		mode: "auto",
		label: "Auto"
	},
	{
		mode: "full",
		label: "Full"
	},
	{
		mode: "guided",
		label: "Guided"
	}
], me = [
	{
		key: "perspectiveV",
		label: "Vertical"
	},
	{
		key: "perspectiveH",
		label: "Horizontal"
	},
	{
		key: "aspect",
		label: "Aspect"
	}
];
function he() {
	let { Panel: n, Slider: r } = t.components, i = t.stores.useDevelopStore, a = i((e) => e.params.transform), o = i((e) => e.params.uprightMode), s = i((e) => e.setParam), c = i((e) => e.commitEdit), l = ie(), { constrain: u } = oe(), [d, f] = e.useState(!1), p = (e, t) => {
		let { params: n } = i.getState(), r = {
			...n.transform,
			[e]: t
		};
		s("transform", r), B(n.straighten, r);
	}, m = async (e) => {
		if (e === "off") {
			N(!1), s("uprightMode", "off"), V({
				straighten: 0,
				perspectiveV: 0,
				perspectiveH: 0,
				aspect: 0
			}), c("Upright off");
			return;
		}
		if (e === "guided") {
			let e = o === "guided" && l;
			s("uprightMode", "guided"), N(!e), H(), c("Guided Upright");
			return;
		}
		let t = o;
		N(!1), s("uprightMode", e), f(!0);
		try {
			V(await se(e)), c(`Upright ${e}`);
		} catch (e) {
			s("uprightMode", t), console.error("[upright]", e);
		} finally {
			f(!1);
		}
	};
	return /* @__PURE__ */ e.createElement(n, {
		title: "Transform",
		defaultOpen: !1
	}, /* @__PURE__ */ e.createElement("div", { className: X.panel }, /* @__PURE__ */ e.createElement("div", { className: X.modes }, pe.map((t) => {
		let n = o === t.mode, r = t.mode === "guided" && n && l ? "Done" : t.label;
		return /* @__PURE__ */ e.createElement("button", {
			key: t.mode,
			type: "button",
			disabled: d,
			onClick: () => void m(t.mode),
			"aria-pressed": n,
			className: `${X.mode}${n ? ` ${X.active}` : ""}`
		}, r);
	})), me.map((t) => /* @__PURE__ */ e.createElement(r, {
		key: t.key,
		label: t.label,
		value: a[t.key],
		min: -100,
		max: 100,
		step: 1,
		onChange: (e) => p(t.key, e),
		onCommit: () => void c("Transform")
	})), /* @__PURE__ */ e.createElement("label", { className: X.check }, /* @__PURE__ */ e.createElement("input", {
		type: "checkbox",
		checked: u,
		onChange: (e) => {
			let t = e.target.checked;
			if (ae({ constrain: t }), t) {
				let { params: e } = i.getState();
				B(e.straighten, e.transform), c("Constrain crop");
			}
		}
	}), "Constrain crop")));
}
//#endregion
//#region src/index.tsx
var Z = "core.transform", Q = "safelight.transform.styles", $ = [];
function ge(e) {
	n(e), N(!1), L(), e.registerStylesheet({
		id: Q,
		css: fe(e.ui.tokens)
	}), e.registerPanel({
		id: Z,
		title: "Transform",
		component: he,
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 2,
			width: 280,
			height: 320
		},
		onReset: () => {
			N(!1), e.stores.useDevelopStore.getState().resetParams([
				"transform",
				"straighten",
				"uprightMode",
				"guidedLines"
			], "Reset Transform");
		}
	});
	for (let e of $) e();
	$ = [P(() => e.develop.setCanvasTool(M() ? de : null)), e.stores.useDevelopStore.subscribe((e) => {
		M() && e.params.uprightMode !== "guided" && N(!1);
	})];
	let t = (t, n) => () => {
		let { params: r, setParam: i, commitEdit: a } = e.stores.useDevelopStore.getState();
		i("transform", {
			...r.transform,
			[t]: !r.transform[t]
		}), a(n);
	};
	e.registerKeybinding({
		id: "photo.flipH",
		label: "Flip horizontal",
		category: "Develop",
		defaultCombo: "",
		handler: t("flipH", "Flip horizontal")
	}), e.registerKeybinding({
		id: "photo.flipV",
		label: "Flip vertical",
		category: "Develop",
		defaultCombo: "",
		handler: t("flipV", "Flip vertical")
	});
}
function _e() {
	for (let e of $) e();
	$ = [], N(!1);
}
//#endregion
export { Z as PANEL_ID, Q as STYLESHEET_ID, ge as activate, _e as deactivate };

//# sourceMappingURL=index.js.map