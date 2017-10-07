﻿/*jslint node: true */
"use strict";
var Gravatar = {

    imageSize: 36,

    getimageUrl: function (email) {
        if (email === undefined || email === "") {
            return "images/anonymous.png";
        }
        return "https://www.gravatar.com/avatar/" + this.MD5(email) + ".png?size=" + this.imageSize;
    },

    getProfileData: function (email) {
        var profileUrl = "https://www.gravatar.com/" + this.MD5(email) + ".json";
    },

    MD5: function (r) { function n(r, n) { return r << n | r >>> 32 - n;} function t(r, n) { var t, o, e, u, f; return e = 2147483648 & r, u = 2147483648 & n, t = 1073741824 & r, o = 1073741824 & n, f = (1073741823 & r) + (1073741823 & n), t & o ? 2147483648 ^ f ^ e ^ u : t | o ? 1073741824 & f ? 3221225472 ^ f ^ e ^ u : 1073741824 ^ f ^ e ^ u : f ^ e ^ u;} function o(r, n, t) { return r & n | ~r & t;} function e(r, n, t) { return r & t | n & ~t;} function u(r, n, t) { return r ^ n ^ t;} function f(r, n, t) { return n ^ (r | ~t);} function i(r, e, u, f, i, a, c) { return r = t(r, t(t(o(e, u, f), i), c)), t(n(r, a), e);} function a(r, o, u, f, i, a, c) { return r = t(r, t(t(e(o, u, f), i), c)), t(n(r, a), o);} function c(r, o, e, f, i, a, c) { return r = t(r, t(t(u(o, e, f), i), c)), t(n(r, a), o);} function C(r, o, e, u, i, a, c) { return r = t(r, t(t(f(o, e, u), i), c)), t(n(r, a), o);} function g(r) { for (var n, t = r.length, o = t + 8, e = (o - o % 64) / 64, u = 16 * (e + 1), f = Array(u - 1), i = 0, a = 0; t > a;)n = (a - a % 4) / 4, i = a % 4 * 8, f[n] = f[n] | r.charCodeAt(a) << i, a++; return n = (a - a % 4) / 4, i = a % 4 * 8, f[n] = f[n] | 128 << i, f[u - 2] = t << 3, f[u - 1] = t >>> 29, f;} function h(r) { var n, t, o = "", e = ""; for (t = 0; 3 >= t; t++)n = r >>> 8 * t & 255, e = "0" + n.toString(16), o += e.substr(e.length - 2, 2); return o;} function d(r) { r = r.replace(/\r\n/g, "\n"); for (var n = "", t = 0; t < r.length; t++) { var o = r.charCodeAt(t); 128 > o ? n += String.fromCharCode(o) : o > 127 && 2048 > o ? (n += String.fromCharCode(o >> 6 | 192), n += String.fromCharCode(63 & o | 128)) : (n += String.fromCharCode(o >> 12 | 224), n += String.fromCharCode(o >> 6 & 63 | 128), n += String.fromCharCode(63 & o | 128));} return n;} var v, m, S, l, s, A, w, y, L, b = Array(), p = 7, D = 12, M = 17, j = 22, k = 5, q = 9, x = 14, z = 20, B = 4, E = 11, F = 16, G = 23, H = 6, I = 10, J = 15, K = 21; for (r = r.trim().toLowerCase(), r = d(r), b = g(r), A = 1732584193, w = 4023233417, y = 2562383102, L = 271733878, v = 0; v < b.length; v += 16)m = A, S = w, l = y, s = L, A = i(A, w, y, L, b[v + 0], p, 3614090360), L = i(L, A, w, y, b[v + 1], D, 3905402710), y = i(y, L, A, w, b[v + 2], M, 606105819), w = i(w, y, L, A, b[v + 3], j, 3250441966), A = i(A, w, y, L, b[v + 4], p, 4118548399), L = i(L, A, w, y, b[v + 5], D, 1200080426), y = i(y, L, A, w, b[v + 6], M, 2821735955), w = i(w, y, L, A, b[v + 7], j, 4249261313), A = i(A, w, y, L, b[v + 8], p, 1770035416), L = i(L, A, w, y, b[v + 9], D, 2336552879), y = i(y, L, A, w, b[v + 10], M, 4294925233), w = i(w, y, L, A, b[v + 11], j, 2304563134), A = i(A, w, y, L, b[v + 12], p, 1804603682), L = i(L, A, w, y, b[v + 13], D, 4254626195), y = i(y, L, A, w, b[v + 14], M, 2792965006), w = i(w, y, L, A, b[v + 15], j, 1236535329), A = a(A, w, y, L, b[v + 1], k, 4129170786), L = a(L, A, w, y, b[v + 6], q, 3225465664), y = a(y, L, A, w, b[v + 11], x, 643717713), w = a(w, y, L, A, b[v + 0], z, 3921069994), A = a(A, w, y, L, b[v + 5], k, 3593408605), L = a(L, A, w, y, b[v + 10], q, 38016083), y = a(y, L, A, w, b[v + 15], x, 3634488961), w = a(w, y, L, A, b[v + 4], z, 3889429448), A = a(A, w, y, L, b[v + 9], k, 568446438), L = a(L, A, w, y, b[v + 14], q, 3275163606), y = a(y, L, A, w, b[v + 3], x, 4107603335), w = a(w, y, L, A, b[v + 8], z, 1163531501), A = a(A, w, y, L, b[v + 13], k, 2850285829), L = a(L, A, w, y, b[v + 2], q, 4243563512), y = a(y, L, A, w, b[v + 7], x, 1735328473), w = a(w, y, L, A, b[v + 12], z, 2368359562), A = c(A, w, y, L, b[v + 5], B, 4294588738), L = c(L, A, w, y, b[v + 8], E, 2272392833), y = c(y, L, A, w, b[v + 11], F, 1839030562), w = c(w, y, L, A, b[v + 14], G, 4259657740), A = c(A, w, y, L, b[v + 1], B, 2763975236), L = c(L, A, w, y, b[v + 4], E, 1272893353), y = c(y, L, A, w, b[v + 7], F, 4139469664), w = c(w, y, L, A, b[v + 10], G, 3200236656), A = c(A, w, y, L, b[v + 13], B, 681279174), L = c(L, A, w, y, b[v + 0], E, 3936430074), y = c(y, L, A, w, b[v + 3], F, 3572445317), w = c(w, y, L, A, b[v + 6], G, 76029189), A = c(A, w, y, L, b[v + 9], B, 3654602809), L = c(L, A, w, y, b[v + 12], E, 3873151461), y = c(y, L, A, w, b[v + 15], F, 530742520), w = c(w, y, L, A, b[v + 2], G, 3299628645), A = C(A, w, y, L, b[v + 0], H, 4096336452), L = C(L, A, w, y, b[v + 7], I, 1126891415), y = C(y, L, A, w, b[v + 14], J, 2878612391), w = C(w, y, L, A, b[v + 5], K, 4237533241), A = C(A, w, y, L, b[v + 12], H, 1700485571), L = C(L, A, w, y, b[v + 3], I, 2399980690), y = C(y, L, A, w, b[v + 10], J, 4293915773), w = C(w, y, L, A, b[v + 1], K, 2240044497), A = C(A, w, y, L, b[v + 8], H, 1873313359), L = C(L, A, w, y, b[v + 15], I, 4264355552), y = C(y, L, A, w, b[v + 6], J, 2734768916), w = C(w, y, L, A, b[v + 13], K, 1309151649), A = C(A, w, y, L, b[v + 4], H, 4149444226), L = C(L, A, w, y, b[v + 11], I, 3174756917), y = C(y, L, A, w, b[v + 2], J, 718787259), w = C(w, y, L, A, b[v + 9], K, 3951481745), A = t(A, m), w = t(w, S), y = t(y, l), L = t(L, s); var N = h(A) + h(w) + h(y) + h(L); return N.toLowerCase();}
};

module.exports = Gravatar;