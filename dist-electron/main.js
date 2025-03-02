var _o = Object.defineProperty;
var is = (e) => {
  throw TypeError(e);
};
var Eo = (e, t, r) => t in e ? _o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ot = (e, t, r) => Eo(e, typeof t != "symbol" ? t + "" : t, r), os = (e, t, r) => t.has(e) || is("Cannot " + r);
var ae = (e, t, r) => (os(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ct = (e, t, r) => t.has(e) ? is("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ut = (e, t, r, n) => (os(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import wr, { app as Xe, ipcMain as Ne, BrowserWindow as Gi, dialog as mt } from "electron";
import Se from "path";
import Ie from "fs";
import { fileURLToPath as wo } from "url";
import ce from "node:process";
import se from "node:path";
import { promisify as de, isDeepStrictEqual as So } from "node:util";
import Y from "node:fs";
import lt from "node:crypto";
import bo from "node:assert";
import Sr from "node:os";
const Je = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Lr = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Ro = new Set("0123456789");
function br(e) {
  const t = [];
  let r = "", n = "start", o = !1;
  for (const s of e)
    switch (s) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        o && (r += s), n = "property", o = !o;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (o) {
          o = !1, r += s;
          break;
        }
        if (Lr.has(r))
          return [];
        t.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (o) {
          o = !1, r += s;
          break;
        }
        if (n === "property") {
          if (Lr.has(r))
            return [];
          t.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          t.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !Ro.has(s))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), o && (o = !1, r += "\\"), r += s;
      }
    }
  switch (o && (r += "\\"), n) {
    case "property": {
      if (Lr.has(r))
        return [];
      t.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function Xn(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Ki(e, t) {
  if (Xn(e, t))
    throw new Error("Cannot use string index");
}
function Po(e, t, r) {
  if (!Je(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = br(t);
  if (n.length === 0)
    return r;
  for (let o = 0; o < n.length; o++) {
    const s = n[o];
    if (Xn(e, s) ? e = o === n.length - 1 ? void 0 : null : e = e[s], e == null) {
      if (o !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function cs(e, t, r) {
  if (!Je(e) || typeof t != "string")
    return e;
  const n = e, o = br(t);
  for (let s = 0; s < o.length; s++) {
    const c = o[s];
    Ki(e, c), s === o.length - 1 ? e[c] = r : Je(e[c]) || (e[c] = typeof o[s + 1] == "number" ? [] : {}), e = e[c];
  }
  return n;
}
function Io(e, t) {
  if (!Je(e) || typeof t != "string")
    return !1;
  const r = br(t);
  for (let n = 0; n < r.length; n++) {
    const o = r[n];
    if (Ki(e, o), n === r.length - 1)
      return delete e[o], !0;
    if (e = e[o], !Je(e))
      return !1;
  }
}
function No(e, t) {
  if (!Je(e) || typeof t != "string")
    return !1;
  const r = br(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Je(e) || !(n in e) || Xn(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Ke = Sr.homedir(), Bn = Sr.tmpdir(), { env: st } = ce, Oo = (e) => {
  const t = se.join(Ke, "Library");
  return {
    data: se.join(t, "Application Support", e),
    config: se.join(t, "Preferences", e),
    cache: se.join(t, "Caches", e),
    log: se.join(t, "Logs", e),
    temp: se.join(Bn, e)
  };
}, To = (e) => {
  const t = st.APPDATA || se.join(Ke, "AppData", "Roaming"), r = st.LOCALAPPDATA || se.join(Ke, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: se.join(r, e, "Data"),
    config: se.join(t, e, "Config"),
    cache: se.join(r, e, "Cache"),
    log: se.join(r, e, "Log"),
    temp: se.join(Bn, e)
  };
}, jo = (e) => {
  const t = se.basename(Ke);
  return {
    data: se.join(st.XDG_DATA_HOME || se.join(Ke, ".local", "share"), e),
    config: se.join(st.XDG_CONFIG_HOME || se.join(Ke, ".config"), e),
    cache: se.join(st.XDG_CACHE_HOME || se.join(Ke, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: se.join(st.XDG_STATE_HOME || se.join(Ke, ".local", "state"), e),
    temp: se.join(Bn, t, e)
  };
};
function Ao(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ce.platform === "darwin" ? Oo(e) : ce.platform === "win32" ? To(e) : jo(e);
}
const Fe = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, qe = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (o) {
    return t(o);
  }
}, qo = ce.getuid ? !ce.getuid() : !1, Co = 1e4, ve = () => {
}, ie = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ie.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !qo && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ie.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ie.isNodeError(e))
      throw e;
    if (!ie.isChangeErrorOk(e))
      throw e;
  }
};
class ko {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Co, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (t) => {
      this.queueWaiting.add(t), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (t) => {
      this.queueWaiting.delete(t), this.queueActive.delete(t);
    }, this.schedule = () => new Promise((t) => {
      const r = () => this.remove(n), n = () => t(r);
      this.add(n);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const t of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(t), this.queueActive.add(t), t();
        }
      }
    };
  }
}
const Do = new ko(), ze = (e, t) => function(n) {
  return function o(...s) {
    return Do.schedule().then((c) => {
      const l = (m) => (c(), m), u = (m) => {
        if (c(), Date.now() >= n)
          throw m;
        if (t(m)) {
          const i = Math.round(100 * Math.random());
          return new Promise(($) => setTimeout($, i)).then(() => o.apply(void 0, s));
        }
        throw m;
      };
      return e.apply(void 0, s).then(l, u);
    });
  };
}, Ue = (e, t) => function(n) {
  return function o(...s) {
    try {
      return e.apply(void 0, s);
    } catch (c) {
      if (Date.now() > n)
        throw c;
      if (t(c))
        return o.apply(void 0, s);
      throw c;
    }
  };
}, he = {
  attempt: {
    /* ASYNC */
    chmod: Fe(de(Y.chmod), ie.onChangeError),
    chown: Fe(de(Y.chown), ie.onChangeError),
    close: Fe(de(Y.close), ve),
    fsync: Fe(de(Y.fsync), ve),
    mkdir: Fe(de(Y.mkdir), ve),
    realpath: Fe(de(Y.realpath), ve),
    stat: Fe(de(Y.stat), ve),
    unlink: Fe(de(Y.unlink), ve),
    /* SYNC */
    chmodSync: qe(Y.chmodSync, ie.onChangeError),
    chownSync: qe(Y.chownSync, ie.onChangeError),
    closeSync: qe(Y.closeSync, ve),
    existsSync: qe(Y.existsSync, ve),
    fsyncSync: qe(Y.fsync, ve),
    mkdirSync: qe(Y.mkdirSync, ve),
    realpathSync: qe(Y.realpathSync, ve),
    statSync: qe(Y.statSync, ve),
    unlinkSync: qe(Y.unlinkSync, ve)
  },
  retry: {
    /* ASYNC */
    close: ze(de(Y.close), ie.isRetriableError),
    fsync: ze(de(Y.fsync), ie.isRetriableError),
    open: ze(de(Y.open), ie.isRetriableError),
    readFile: ze(de(Y.readFile), ie.isRetriableError),
    rename: ze(de(Y.rename), ie.isRetriableError),
    stat: ze(de(Y.stat), ie.isRetriableError),
    write: ze(de(Y.write), ie.isRetriableError),
    writeFile: ze(de(Y.writeFile), ie.isRetriableError),
    /* SYNC */
    closeSync: Ue(Y.closeSync, ie.isRetriableError),
    fsyncSync: Ue(Y.fsyncSync, ie.isRetriableError),
    openSync: Ue(Y.openSync, ie.isRetriableError),
    readFileSync: Ue(Y.readFileSync, ie.isRetriableError),
    renameSync: Ue(Y.renameSync, ie.isRetriableError),
    statSync: Ue(Y.statSync, ie.isRetriableError),
    writeSync: Ue(Y.writeSync, ie.isRetriableError),
    writeFileSync: Ue(Y.writeFileSync, ie.isRetriableError)
  }
}, Lo = "utf8", us = 438, Mo = 511, Vo = {}, Fo = Sr.userInfo().uid, zo = Sr.userInfo().gid, Uo = 1e3, Go = !!ce.getuid;
ce.getuid && ce.getuid();
const ls = 128, Ko = (e) => e instanceof Error && "code" in e, fs = (e) => typeof e == "string", Mr = (e) => e === void 0, Ho = ce.platform === "linux", Hi = ce.platform === "win32", Wn = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Hi || Wn.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Ho && Wn.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Xo {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Hi && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ce.kill(ce.pid, "SIGTERM") : ce.kill(ce.pid, t));
      }
    }, this.hook = () => {
      ce.once("exit", () => this.exit());
      for (const t of Wn)
        try {
          ce.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Bo = new Xo(), Wo = Bo.register, me = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), o = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${o}`;
  },
  get: (e, t, r = !0) => {
    const n = me.truncate(t(e));
    return n in me.store ? me.get(e, t, r) : (me.store[n] = r, [n, () => delete me.store[n]]);
  },
  purge: (e) => {
    me.store[e] && (delete me.store[e], he.attempt.unlink(e));
  },
  purgeSync: (e) => {
    me.store[e] && (delete me.store[e], he.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in me.store)
      me.purgeSync(e);
  },
  truncate: (e) => {
    const t = se.basename(e);
    if (t.length <= ls)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ls;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Wo(me.purgeSyncAll);
function Xi(e, t, r = Vo) {
  if (fs(r))
    return Xi(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Uo) || -1);
  let o = null, s = null, c = null;
  try {
    const l = he.attempt.realpathSync(e), u = !!l;
    e = l || e, [s, o] = me.get(e, r.tmpCreate || me.create, r.tmpPurge !== !1);
    const m = Go && Mr(r.chown), i = Mr(r.mode);
    if (u && (m || i)) {
      const p = he.attempt.statSync(e);
      p && (r = { ...r }, m && (r.chown = { uid: p.uid, gid: p.gid }), i && (r.mode = p.mode));
    }
    if (!u) {
      const p = se.dirname(e);
      he.attempt.mkdirSync(p, {
        mode: Mo,
        recursive: !0
      });
    }
    c = he.retry.openSync(n)(s, "w", r.mode || us), r.tmpCreated && r.tmpCreated(s), fs(t) ? he.retry.writeSync(n)(c, t, 0, r.encoding || Lo) : Mr(t) || he.retry.writeSync(n)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? he.retry.fsyncSync(n)(c) : he.attempt.fsync(c)), he.retry.closeSync(n)(c), c = null, r.chown && (r.chown.uid !== Fo || r.chown.gid !== zo) && he.attempt.chownSync(s, r.chown.uid, r.chown.gid), r.mode && r.mode !== us && he.attempt.chmodSync(s, r.mode);
    try {
      he.retry.renameSync(n)(s, e);
    } catch (p) {
      if (!Ko(p) || p.code !== "ENAMETOOLONG")
        throw p;
      he.retry.renameSync(n)(s, me.truncate(e));
    }
    o(), s = null;
  } finally {
    c && he.attempt.closeSync(c), s && me.purge(s);
  }
}
function Bi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var gt = { exports: {} }, Vr = {}, Ce = {}, Be = {}, Fr = {}, zr = {}, Ur = {}, ds;
function _r() {
  return ds || (ds = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends t {
      constructor(a) {
        if (super(), !e.IDENTIFIER.test(a))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = r;
    class n extends t {
      constructor(a) {
        super(), this._items = typeof a == "string" ? [a] : a;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const a = this._items[0];
        return a === "" || a === '""';
      }
      get str() {
        var a;
        return (a = this._str) !== null && a !== void 0 ? a : this._str = this._items.reduce((d, v) => `${d}${v}`, "");
      }
      get names() {
        var a;
        return (a = this._names) !== null && a !== void 0 ? a : this._names = this._items.reduce((d, v) => (v instanceof r && (d[v.str] = (d[v.str] || 0) + 1), d), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function o(h, ...a) {
      const d = [h[0]];
      let v = 0;
      for (; v < a.length; )
        l(d, a[v]), d.push(h[++v]);
      return new n(d);
    }
    e._ = o;
    const s = new n("+");
    function c(h, ...a) {
      const d = [_(h[0])];
      let v = 0;
      for (; v < a.length; )
        d.push(s), l(d, a[v]), d.push(s, _(h[++v]));
      return u(d), new n(d);
    }
    e.str = c;
    function l(h, a) {
      a instanceof n ? h.push(...a._items) : a instanceof r ? h.push(a) : h.push(p(a));
    }
    e.addCodeArg = l;
    function u(h) {
      let a = 1;
      for (; a < h.length - 1; ) {
        if (h[a] === s) {
          const d = m(h[a - 1], h[a + 1]);
          if (d !== void 0) {
            h.splice(a - 1, 3, d);
            continue;
          }
          h[a++] = "+";
        }
        a++;
      }
    }
    function m(h, a) {
      if (a === '""')
        return h;
      if (h === '""')
        return a;
      if (typeof h == "string")
        return a instanceof r || h[h.length - 1] !== '"' ? void 0 : typeof a != "string" ? `${h.slice(0, -1)}${a}"` : a[0] === '"' ? h.slice(0, -1) + a.slice(1) : void 0;
      if (typeof a == "string" && a[0] === '"' && !(h instanceof r))
        return `"${h}${a.slice(1)}`;
    }
    function i(h, a) {
      return a.emptyStr() ? h : h.emptyStr() ? a : c`${h}${a}`;
    }
    e.strConcat = i;
    function p(h) {
      return typeof h == "number" || typeof h == "boolean" || h === null ? h : _(Array.isArray(h) ? h.join(",") : h);
    }
    function $(h) {
      return new n(_(h));
    }
    e.stringify = $;
    function _(h) {
      return JSON.stringify(h).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = _;
    function S(h) {
      return typeof h == "string" && e.IDENTIFIER.test(h) ? new n(`.${h}`) : o`[${h}]`;
    }
    e.getProperty = S;
    function y(h) {
      if (typeof h == "string" && e.IDENTIFIER.test(h))
        return new n(`${h}`);
      throw new Error(`CodeGen: invalid export name: ${h}, use explicit $id name mapping`);
    }
    e.getEsmExportName = y;
    function f(h) {
      return new n(h.toString());
    }
    e.regexpCode = f;
  }(Ur)), Ur;
}
var Gr = {}, hs;
function ms() {
  return hs || (hs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = _r();
    class r extends Error {
      constructor(m) {
        super(`CodeGen: "code" for ${m} not defined`), this.value = m.value;
      }
    }
    var n;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class o {
      constructor({ prefixes: m, parent: i } = {}) {
        this._names = {}, this._prefixes = m, this._parent = i;
      }
      toName(m) {
        return m instanceof t.Name ? m : this.name(m);
      }
      name(m) {
        return new t.Name(this._newName(m));
      }
      _newName(m) {
        const i = this._names[m] || this._nameGroup(m);
        return `${m}${i.index++}`;
      }
      _nameGroup(m) {
        var i, p;
        if (!((p = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || p === void 0) && p.has(m) || this._prefixes && !this._prefixes.has(m))
          throw new Error(`CodeGen: prefix "${m}" is not allowed in this scope`);
        return this._names[m] = { prefix: m, index: 0 };
      }
    }
    e.Scope = o;
    class s extends t.Name {
      constructor(m, i) {
        super(i), this.prefix = m;
      }
      setValue(m, { property: i, itemIndex: p }) {
        this.value = m, this.scopePath = (0, t._)`.${new t.Name(i)}[${p}]`;
      }
    }
    e.ValueScopeName = s;
    const c = (0, t._)`\n`;
    class l extends o {
      constructor(m) {
        super(m), this._values = {}, this._scope = m.scope, this.opts = { ...m, _n: m.lines ? c : t.nil };
      }
      get() {
        return this._scope;
      }
      name(m) {
        return new s(m, this._newName(m));
      }
      value(m, i) {
        var p;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const $ = this.toName(m), { prefix: _ } = $, S = (p = i.key) !== null && p !== void 0 ? p : i.ref;
        let y = this._values[_];
        if (y) {
          const a = y.get(S);
          if (a)
            return a;
        } else
          y = this._values[_] = /* @__PURE__ */ new Map();
        y.set(S, $);
        const f = this._scope[_] || (this._scope[_] = []), h = f.length;
        return f[h] = i.ref, $.setValue(i, { property: _, itemIndex: h }), $;
      }
      getValue(m, i) {
        const p = this._values[m];
        if (p)
          return p.get(i);
      }
      scopeRefs(m, i = this._values) {
        return this._reduceValues(i, (p) => {
          if (p.scopePath === void 0)
            throw new Error(`CodeGen: name "${p}" has no value`);
          return (0, t._)`${m}${p.scopePath}`;
        });
      }
      scopeCode(m = this._values, i, p) {
        return this._reduceValues(m, ($) => {
          if ($.value === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return $.value.code;
        }, i, p);
      }
      _reduceValues(m, i, p = {}, $) {
        let _ = t.nil;
        for (const S in m) {
          const y = m[S];
          if (!y)
            continue;
          const f = p[S] = p[S] || /* @__PURE__ */ new Map();
          y.forEach((h) => {
            if (f.has(h))
              return;
            f.set(h, n.Started);
            let a = i(h);
            if (a) {
              const d = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              _ = (0, t._)`${_}${d} ${h} = ${a};${this.opts._n}`;
            } else if (a = $ == null ? void 0 : $(h))
              _ = (0, t._)`${_}${a}${this.opts._n}`;
            else
              throw new r(h);
            f.set(h, n.Completed);
          });
        }
        return _;
      }
    }
    e.ValueScope = l;
  }(Gr)), Gr;
}
var ps;
function J() {
  return ps || (ps = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = _r(), r = ms();
    var n = _r();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var o = ms();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return o.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return o.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return o.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return o.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames(g, R) {
        return this;
      }
    }
    class c extends s {
      constructor(g, R, C) {
        super(), this.varKind = g, this.name = R, this.rhs = C;
      }
      render({ es5: g, _n: R }) {
        const C = g ? r.varKinds.var : this.varKind, B = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${C} ${this.name}${B};` + R;
      }
      optimizeNames(g, R) {
        if (g[this.name.str])
          return this.rhs && (this.rhs = q(this.rhs, g, R)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class l extends s {
      constructor(g, R, C) {
        super(), this.lhs = g, this.rhs = R, this.sideEffects = C;
      }
      render({ _n: g }) {
        return `${this.lhs} = ${this.rhs};` + g;
      }
      optimizeNames(g, R) {
        if (!(this.lhs instanceof t.Name && !g[this.lhs.str] && !this.sideEffects))
          return this.rhs = q(this.rhs, g, R), this;
      }
      get names() {
        const g = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return U(g, this.rhs);
      }
    }
    class u extends l {
      constructor(g, R, C, B) {
        super(g, C, B), this.op = R;
      }
      render({ _n: g }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + g;
      }
    }
    class m extends s {
      constructor(g) {
        super(), this.label = g, this.names = {};
      }
      render({ _n: g }) {
        return `${this.label}:` + g;
      }
    }
    class i extends s {
      constructor(g) {
        super(), this.label = g, this.names = {};
      }
      render({ _n: g }) {
        return `break${this.label ? ` ${this.label}` : ""};` + g;
      }
    }
    class p extends s {
      constructor(g) {
        super(), this.error = g;
      }
      render({ _n: g }) {
        return `throw ${this.error};` + g;
      }
      get names() {
        return this.error.names;
      }
    }
    class $ extends s {
      constructor(g) {
        super(), this.code = g;
      }
      render({ _n: g }) {
        return `${this.code};` + g;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(g, R) {
        return this.code = q(this.code, g, R), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class _ extends s {
      constructor(g = []) {
        super(), this.nodes = g;
      }
      render(g) {
        return this.nodes.reduce((R, C) => R + C.render(g), "");
      }
      optimizeNodes() {
        const { nodes: g } = this;
        let R = g.length;
        for (; R--; ) {
          const C = g[R].optimizeNodes();
          Array.isArray(C) ? g.splice(R, 1, ...C) : C ? g[R] = C : g.splice(R, 1);
        }
        return g.length > 0 ? this : void 0;
      }
      optimizeNames(g, R) {
        const { nodes: C } = this;
        let B = C.length;
        for (; B--; ) {
          const x = C[B];
          x.optimizeNames(g, R) || (D(g, x.names), C.splice(B, 1));
        }
        return C.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((g, R) => F(g, R.names), {});
      }
    }
    class S extends _ {
      render(g) {
        return "{" + g._n + super.render(g) + "}" + g._n;
      }
    }
    class y extends _ {
    }
    class f extends S {
    }
    f.kind = "else";
    class h extends S {
      constructor(g, R) {
        super(R), this.condition = g;
      }
      render(g) {
        let R = `if(${this.condition})` + super.render(g);
        return this.else && (R += "else " + this.else.render(g)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const g = this.condition;
        if (g === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const C = R.optimizeNodes();
          R = this.else = Array.isArray(C) ? new f(C) : C;
        }
        if (R)
          return g === !1 ? R instanceof h ? R : R.nodes : this.nodes.length ? this : new h(X(g), R instanceof h ? [R] : R.nodes);
        if (!(g === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(g, R) {
        var C;
        if (this.else = (C = this.else) === null || C === void 0 ? void 0 : C.optimizeNames(g, R), !!(super.optimizeNames(g, R) || this.else))
          return this.condition = q(this.condition, g, R), this;
      }
      get names() {
        const g = super.names;
        return U(g, this.condition), this.else && F(g, this.else.names), g;
      }
    }
    h.kind = "if";
    class a extends S {
    }
    a.kind = "for";
    class d extends a {
      constructor(g) {
        super(), this.iteration = g;
      }
      render(g) {
        return `for(${this.iteration})` + super.render(g);
      }
      optimizeNames(g, R) {
        if (super.optimizeNames(g, R))
          return this.iteration = q(this.iteration, g, R), this;
      }
      get names() {
        return F(super.names, this.iteration.names);
      }
    }
    class v extends a {
      constructor(g, R, C, B) {
        super(), this.varKind = g, this.name = R, this.from = C, this.to = B;
      }
      render(g) {
        const R = g.es5 ? r.varKinds.var : this.varKind, { name: C, from: B, to: x } = this;
        return `for(${R} ${C}=${B}; ${C}<${x}; ${C}++)` + super.render(g);
      }
      get names() {
        const g = U(super.names, this.from);
        return U(g, this.to);
      }
    }
    class w extends a {
      constructor(g, R, C, B) {
        super(), this.loop = g, this.varKind = R, this.name = C, this.iterable = B;
      }
      render(g) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(g);
      }
      optimizeNames(g, R) {
        if (super.optimizeNames(g, R))
          return this.iterable = q(this.iterable, g, R), this;
      }
      get names() {
        return F(super.names, this.iterable.names);
      }
    }
    class E extends S {
      constructor(g, R, C) {
        super(), this.name = g, this.args = R, this.async = C;
      }
      render(g) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(g);
      }
    }
    E.kind = "func";
    class b extends _ {
      render(g) {
        return "return " + super.render(g);
      }
    }
    b.kind = "return";
    class I extends S {
      render(g) {
        let R = "try" + super.render(g);
        return this.catch && (R += this.catch.render(g)), this.finally && (R += this.finally.render(g)), R;
      }
      optimizeNodes() {
        var g, R;
        return super.optimizeNodes(), (g = this.catch) === null || g === void 0 || g.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames(g, R) {
        var C, B;
        return super.optimizeNames(g, R), (C = this.catch) === null || C === void 0 || C.optimizeNames(g, R), (B = this.finally) === null || B === void 0 || B.optimizeNames(g, R), this;
      }
      get names() {
        const g = super.names;
        return this.catch && F(g, this.catch.names), this.finally && F(g, this.finally.names), g;
      }
    }
    class M extends S {
      constructor(g) {
        super(), this.error = g;
      }
      render(g) {
        return `catch(${this.error})` + super.render(g);
      }
    }
    M.kind = "catch";
    class K extends S {
      render(g) {
        return "finally" + super.render(g);
      }
    }
    K.kind = "finally";
    class k {
      constructor(g, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = g, this._scope = new r.Scope({ parent: g }), this._nodes = [new y()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(g) {
        return this._scope.name(g);
      }
      // reserves unique name in the external scope
      scopeName(g) {
        return this._extScope.name(g);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(g, R) {
        const C = this._extScope.value(g, R);
        return (this._values[C.prefix] || (this._values[C.prefix] = /* @__PURE__ */ new Set())).add(C), C;
      }
      getScopeValue(g, R) {
        return this._extScope.getValue(g, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(g) {
        return this._extScope.scopeRefs(g, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(g, R, C, B) {
        const x = this._scope.toName(R);
        return C !== void 0 && B && (this._constants[x.str] = C), this._leafNode(new c(g, x, C)), x;
      }
      // `const` declaration (`var` in es5 mode)
      const(g, R, C) {
        return this._def(r.varKinds.const, g, R, C);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(g, R, C) {
        return this._def(r.varKinds.let, g, R, C);
      }
      // `var` declaration with optional assignment
      var(g, R, C) {
        return this._def(r.varKinds.var, g, R, C);
      }
      // assignment code
      assign(g, R, C) {
        return this._leafNode(new l(g, R, C));
      }
      // `+=` code
      add(g, R) {
        return this._leafNode(new u(g, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code(g) {
        return typeof g == "function" ? g() : g !== t.nil && this._leafNode(new $(g)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...g) {
        const R = ["{"];
        for (const [C, B] of g)
          R.length > 1 && R.push(","), R.push(C), (C !== B || this.opts.es5) && (R.push(":"), (0, t.addCodeArg)(R, B));
        return R.push("}"), new t._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(g, R, C) {
        if (this._blockNode(new h(g)), R && C)
          this.code(R).else().code(C).endIf();
        else if (R)
          this.code(R).endIf();
        else if (C)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(g) {
        return this._elseNode(new h(g));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(h, f);
      }
      _for(g, R) {
        return this._blockNode(g), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(g, R) {
        return this._for(new d(g), R);
      }
      // `for` statement for a range of values
      forRange(g, R, C, B, x = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const re = this._scope.toName(g);
        return this._for(new v(x, re, R, C), () => B(re));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(g, R, C, B = r.varKinds.const) {
        const x = this._scope.toName(g);
        if (this.opts.es5) {
          const re = R instanceof t.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, t._)`${re}.length`, (te) => {
            this.var(x, (0, t._)`${re}[${te}]`), C(x);
          });
        }
        return this._for(new w("of", B, x, R), () => C(x));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(g, R, C, B = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(g, (0, t._)`Object.keys(${R})`, C);
        const x = this._scope.toName(g);
        return this._for(new w("in", B, x, R), () => C(x));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(a);
      }
      // `label` statement
      label(g) {
        return this._leafNode(new m(g));
      }
      // `break` statement
      break(g) {
        return this._leafNode(new i(g));
      }
      // `return` statement
      return(g) {
        const R = new b();
        if (this._blockNode(R), this.code(g), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try(g, R, C) {
        if (!R && !C)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const B = new I();
        if (this._blockNode(B), this.code(g), R) {
          const x = this.name("e");
          this._currNode = B.catch = new M(x), R(x);
        }
        return C && (this._currNode = B.finally = new K(), this.code(C)), this._endBlockNode(M, K);
      }
      // `throw` statement
      throw(g) {
        return this._leafNode(new p(g));
      }
      // start self-balancing block
      block(g, R) {
        return this._blockStarts.push(this._nodes.length), g && this.code(g).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock(g) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const C = this._nodes.length - R;
        if (C < 0 || g !== void 0 && C !== g)
          throw new Error(`CodeGen: wrong number of nodes: ${C} vs ${g} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(g, R = t.nil, C, B) {
        return this._blockNode(new E(g, R, C)), B && this.code(B).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(E);
      }
      optimize(g = 1) {
        for (; g-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(g) {
        return this._currNode.nodes.push(g), this;
      }
      _blockNode(g) {
        this._currNode.nodes.push(g), this._nodes.push(g);
      }
      _endBlockNode(g, R) {
        const C = this._currNode;
        if (C instanceof g || R && C instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${g.kind}/${R.kind}` : g.kind}"`);
      }
      _elseNode(g) {
        const R = this._currNode;
        if (!(R instanceof h))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = g, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const g = this._nodes;
        return g[g.length - 1];
      }
      set _currNode(g) {
        const R = this._nodes;
        R[R.length - 1] = g;
      }
    }
    e.CodeGen = k;
    function F(N, g) {
      for (const R in g)
        N[R] = (N[R] || 0) + (g[R] || 0);
      return N;
    }
    function U(N, g) {
      return g instanceof t._CodeOrName ? F(N, g.names) : N;
    }
    function q(N, g, R) {
      if (N instanceof t.Name)
        return C(N);
      if (!B(N))
        return N;
      return new t._Code(N._items.reduce((x, re) => (re instanceof t.Name && (re = C(re)), re instanceof t._Code ? x.push(...re._items) : x.push(re), x), []));
      function C(x) {
        const re = R[x.str];
        return re === void 0 || g[x.str] !== 1 ? x : (delete g[x.str], re);
      }
      function B(x) {
        return x instanceof t._Code && x._items.some((re) => re instanceof t.Name && g[re.str] === 1 && R[re.str] !== void 0);
      }
    }
    function D(N, g) {
      for (const R in g)
        N[R] = (N[R] || 0) - (g[R] || 0);
    }
    function X(N) {
      return typeof N == "boolean" || typeof N == "number" || N === null ? !N : (0, t._)`!${j(N)}`;
    }
    e.not = X;
    const G = P(e.operators.AND);
    function z(...N) {
      return N.reduce(G);
    }
    e.and = z;
    const H = P(e.operators.OR);
    function A(...N) {
      return N.reduce(H);
    }
    e.or = A;
    function P(N) {
      return (g, R) => g === t.nil ? R : R === t.nil ? g : (0, t._)`${j(g)} ${N} ${j(R)}`;
    }
    function j(N) {
      return N instanceof t.Name ? N : (0, t._)`(${N})`;
    }
  }(zr)), zr;
}
var Z = {}, ys;
function ee() {
  if (ys) return Z;
  ys = 1, Object.defineProperty(Z, "__esModule", { value: !0 }), Z.checkStrictMode = Z.getErrorPath = Z.Type = Z.useFunc = Z.setEvaluated = Z.evaluatedPropsToName = Z.mergeEvaluated = Z.eachItem = Z.unescapeJsonPointer = Z.escapeJsonPointer = Z.escapeFragment = Z.unescapeFragment = Z.schemaRefOrVal = Z.schemaHasRulesButRef = Z.schemaHasRules = Z.checkUnknownRules = Z.alwaysValidSchema = Z.toHash = void 0;
  const e = J(), t = _r();
  function r(w) {
    const E = {};
    for (const b of w)
      E[b] = !0;
    return E;
  }
  Z.toHash = r;
  function n(w, E) {
    return typeof E == "boolean" ? E : Object.keys(E).length === 0 ? !0 : (o(w, E), !s(E, w.self.RULES.all));
  }
  Z.alwaysValidSchema = n;
  function o(w, E = w.schema) {
    const { opts: b, self: I } = w;
    if (!b.strictSchema || typeof E == "boolean")
      return;
    const M = I.RULES.keywords;
    for (const K in E)
      M[K] || v(w, `unknown keyword: "${K}"`);
  }
  Z.checkUnknownRules = o;
  function s(w, E) {
    if (typeof w == "boolean")
      return !w;
    for (const b in w)
      if (E[b])
        return !0;
    return !1;
  }
  Z.schemaHasRules = s;
  function c(w, E) {
    if (typeof w == "boolean")
      return !w;
    for (const b in w)
      if (b !== "$ref" && E.all[b])
        return !0;
    return !1;
  }
  Z.schemaHasRulesButRef = c;
  function l({ topSchemaRef: w, schemaPath: E }, b, I, M) {
    if (!M) {
      if (typeof b == "number" || typeof b == "boolean")
        return b;
      if (typeof b == "string")
        return (0, e._)`${b}`;
    }
    return (0, e._)`${w}${E}${(0, e.getProperty)(I)}`;
  }
  Z.schemaRefOrVal = l;
  function u(w) {
    return p(decodeURIComponent(w));
  }
  Z.unescapeFragment = u;
  function m(w) {
    return encodeURIComponent(i(w));
  }
  Z.escapeFragment = m;
  function i(w) {
    return typeof w == "number" ? `${w}` : w.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Z.escapeJsonPointer = i;
  function p(w) {
    return w.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Z.unescapeJsonPointer = p;
  function $(w, E) {
    if (Array.isArray(w))
      for (const b of w)
        E(b);
    else
      E(w);
  }
  Z.eachItem = $;
  function _({ mergeNames: w, mergeToName: E, mergeValues: b, resultToName: I }) {
    return (M, K, k, F) => {
      const U = k === void 0 ? K : k instanceof e.Name ? (K instanceof e.Name ? w(M, K, k) : E(M, K, k), k) : K instanceof e.Name ? (E(M, k, K), K) : b(K, k);
      return F === e.Name && !(U instanceof e.Name) ? I(M, U) : U;
    };
  }
  Z.mergeEvaluated = {
    props: _({
      mergeNames: (w, E, b) => w.if((0, e._)`${b} !== true && ${E} !== undefined`, () => {
        w.if((0, e._)`${E} === true`, () => w.assign(b, !0), () => w.assign(b, (0, e._)`${b} || {}`).code((0, e._)`Object.assign(${b}, ${E})`));
      }),
      mergeToName: (w, E, b) => w.if((0, e._)`${b} !== true`, () => {
        E === !0 ? w.assign(b, !0) : (w.assign(b, (0, e._)`${b} || {}`), y(w, b, E));
      }),
      mergeValues: (w, E) => w === !0 ? !0 : { ...w, ...E },
      resultToName: S
    }),
    items: _({
      mergeNames: (w, E, b) => w.if((0, e._)`${b} !== true && ${E} !== undefined`, () => w.assign(b, (0, e._)`${E} === true ? true : ${b} > ${E} ? ${b} : ${E}`)),
      mergeToName: (w, E, b) => w.if((0, e._)`${b} !== true`, () => w.assign(b, E === !0 ? !0 : (0, e._)`${b} > ${E} ? ${b} : ${E}`)),
      mergeValues: (w, E) => w === !0 ? !0 : Math.max(w, E),
      resultToName: (w, E) => w.var("items", E)
    })
  };
  function S(w, E) {
    if (E === !0)
      return w.var("props", !0);
    const b = w.var("props", (0, e._)`{}`);
    return E !== void 0 && y(w, b, E), b;
  }
  Z.evaluatedPropsToName = S;
  function y(w, E, b) {
    Object.keys(b).forEach((I) => w.assign((0, e._)`${E}${(0, e.getProperty)(I)}`, !0));
  }
  Z.setEvaluated = y;
  const f = {};
  function h(w, E) {
    return w.scopeValue("func", {
      ref: E,
      code: f[E.code] || (f[E.code] = new t._Code(E.code))
    });
  }
  Z.useFunc = h;
  var a;
  (function(w) {
    w[w.Num = 0] = "Num", w[w.Str = 1] = "Str";
  })(a || (Z.Type = a = {}));
  function d(w, E, b) {
    if (w instanceof e.Name) {
      const I = E === a.Num;
      return b ? I ? (0, e._)`"[" + ${w} + "]"` : (0, e._)`"['" + ${w} + "']"` : I ? (0, e._)`"/" + ${w}` : (0, e._)`"/" + ${w}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return b ? (0, e.getProperty)(w).toString() : "/" + i(w);
  }
  Z.getErrorPath = d;
  function v(w, E, b = w.opts.strictSchema) {
    if (b) {
      if (E = `strict mode: ${E}`, b === !0)
        throw new Error(E);
      w.self.logger.warn(E);
    }
  }
  return Z.checkStrictMode = v, Z;
}
var vt = {}, $s;
function Oe() {
  if ($s) return vt;
  $s = 1, Object.defineProperty(vt, "__esModule", { value: !0 });
  const e = J(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return vt.default = t, vt;
}
var gs;
function Rr() {
  return gs || (gs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = J(), r = ee(), n = Oe();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: h }) => h ? (0, t.str)`"${f}" keyword must be ${h} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function o(f, h = e.keywordError, a, d) {
      const { it: v } = f, { gen: w, compositeRule: E, allErrors: b } = v, I = p(f, h, a);
      d ?? (E || b) ? u(w, I) : m(v, (0, t._)`[${I}]`);
    }
    e.reportError = o;
    function s(f, h = e.keywordError, a) {
      const { it: d } = f, { gen: v, compositeRule: w, allErrors: E } = d, b = p(f, h, a);
      u(v, b), w || E || m(d, n.default.vErrors);
    }
    e.reportExtraError = s;
    function c(f, h) {
      f.assign(n.default.errors, h), f.if((0, t._)`${n.default.vErrors} !== null`, () => f.if(h, () => f.assign((0, t._)`${n.default.vErrors}.length`, h), () => f.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = c;
    function l({ gen: f, keyword: h, schemaValue: a, data: d, errsCount: v, it: w }) {
      if (v === void 0)
        throw new Error("ajv implementation error");
      const E = f.name("err");
      f.forRange("i", v, n.default.errors, (b) => {
        f.const(E, (0, t._)`${n.default.vErrors}[${b}]`), f.if((0, t._)`${E}.instancePath === undefined`, () => f.assign((0, t._)`${E}.instancePath`, (0, t.strConcat)(n.default.instancePath, w.errorPath))), f.assign((0, t._)`${E}.schemaPath`, (0, t.str)`${w.errSchemaPath}/${h}`), w.opts.verbose && (f.assign((0, t._)`${E}.schema`, a), f.assign((0, t._)`${E}.data`, d));
      });
    }
    e.extendErrors = l;
    function u(f, h) {
      const a = f.const("err", h);
      f.if((0, t._)`${n.default.vErrors} === null`, () => f.assign(n.default.vErrors, (0, t._)`[${a}]`), (0, t._)`${n.default.vErrors}.push(${a})`), f.code((0, t._)`${n.default.errors}++`);
    }
    function m(f, h) {
      const { gen: a, validateName: d, schemaEnv: v } = f;
      v.$async ? a.throw((0, t._)`new ${f.ValidationError}(${h})`) : (a.assign((0, t._)`${d}.errors`, h), a.return(!1));
    }
    const i = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function p(f, h, a) {
      const { createErrors: d } = f.it;
      return d === !1 ? (0, t._)`{}` : $(f, h, a);
    }
    function $(f, h, a = {}) {
      const { gen: d, it: v } = f, w = [
        _(v, a),
        S(f, a)
      ];
      return y(f, h, w), d.object(...w);
    }
    function _({ errorPath: f }, { instancePath: h }) {
      const a = h ? (0, t.str)`${f}${(0, r.getErrorPath)(h, r.Type.Str)}` : f;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, a)];
    }
    function S({ keyword: f, it: { errSchemaPath: h } }, { schemaPath: a, parentSchema: d }) {
      let v = d ? h : (0, t.str)`${h}/${f}`;
      return a && (v = (0, t.str)`${v}${(0, r.getErrorPath)(a, r.Type.Str)}`), [i.schemaPath, v];
    }
    function y(f, { params: h, message: a }, d) {
      const { keyword: v, data: w, schemaValue: E, it: b } = f, { opts: I, propertyName: M, topSchemaRef: K, schemaPath: k } = b;
      d.push([i.keyword, v], [i.params, typeof h == "function" ? h(f) : h || (0, t._)`{}`]), I.messages && d.push([i.message, typeof a == "function" ? a(f) : a]), I.verbose && d.push([i.schema, E], [i.parentSchema, (0, t._)`${K}${k}`], [n.default.data, w]), M && d.push([i.propertyName, M]);
    }
  }(Fr)), Fr;
}
var vs;
function xo() {
  if (vs) return Be;
  vs = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.boolOrEmptySchema = Be.topBoolOrEmptySchema = void 0;
  const e = Rr(), t = J(), r = Oe(), n = {
    message: "boolean schema is false"
  };
  function o(l) {
    const { gen: u, schema: m, validateName: i } = l;
    m === !1 ? c(l, !1) : typeof m == "object" && m.$async === !0 ? u.return(r.default.data) : (u.assign((0, t._)`${i}.errors`, null), u.return(!0));
  }
  Be.topBoolOrEmptySchema = o;
  function s(l, u) {
    const { gen: m, schema: i } = l;
    i === !1 ? (m.var(u, !1), c(l)) : m.var(u, !0);
  }
  Be.boolOrEmptySchema = s;
  function c(l, u) {
    const { gen: m, data: i } = l, p = {
      gen: m,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: l
    };
    (0, e.reportError)(p, n, void 0, u);
  }
  return Be;
}
var fe = {}, We = {}, _s;
function Wi() {
  if (_s) return We;
  _s = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.getRules = We.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function r(o) {
    return typeof o == "string" && t.has(o);
  }
  We.isJSONType = r;
  function n() {
    const o = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...o, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, o.number, o.string, o.array, o.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return We.getRules = n, We;
}
var ke = {}, Es;
function xi() {
  if (Es) return ke;
  Es = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.shouldUseRule = ke.shouldUseGroup = ke.schemaHasRulesForType = void 0;
  function e({ schema: n, self: o }, s) {
    const c = o.RULES.types[s];
    return c && c !== !0 && t(n, c);
  }
  ke.schemaHasRulesForType = e;
  function t(n, o) {
    return o.rules.some((s) => r(n, s));
  }
  ke.shouldUseGroup = t;
  function r(n, o) {
    var s;
    return n[o.keyword] !== void 0 || ((s = o.definition.implements) === null || s === void 0 ? void 0 : s.some((c) => n[c] !== void 0));
  }
  return ke.shouldUseRule = r, ke;
}
var ws;
function Er() {
  if (ws) return fe;
  ws = 1, Object.defineProperty(fe, "__esModule", { value: !0 }), fe.reportTypeError = fe.checkDataTypes = fe.checkDataType = fe.coerceAndCheckDataType = fe.getJSONTypes = fe.getSchemaTypes = fe.DataType = void 0;
  const e = Wi(), t = xi(), r = Rr(), n = J(), o = ee();
  var s;
  (function(a) {
    a[a.Correct = 0] = "Correct", a[a.Wrong = 1] = "Wrong";
  })(s || (fe.DataType = s = {}));
  function c(a) {
    const d = l(a.type);
    if (d.includes("null")) {
      if (a.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!d.length && a.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      a.nullable === !0 && d.push("null");
    }
    return d;
  }
  fe.getSchemaTypes = c;
  function l(a) {
    const d = Array.isArray(a) ? a : a ? [a] : [];
    if (d.every(e.isJSONType))
      return d;
    throw new Error("type must be JSONType or JSONType[]: " + d.join(","));
  }
  fe.getJSONTypes = l;
  function u(a, d) {
    const { gen: v, data: w, opts: E } = a, b = i(d, E.coerceTypes), I = d.length > 0 && !(b.length === 0 && d.length === 1 && (0, t.schemaHasRulesForType)(a, d[0]));
    if (I) {
      const M = S(d, w, E.strictNumbers, s.Wrong);
      v.if(M, () => {
        b.length ? p(a, d, b) : f(a);
      });
    }
    return I;
  }
  fe.coerceAndCheckDataType = u;
  const m = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(a, d) {
    return d ? a.filter((v) => m.has(v) || d === "array" && v === "array") : [];
  }
  function p(a, d, v) {
    const { gen: w, data: E, opts: b } = a, I = w.let("dataType", (0, n._)`typeof ${E}`), M = w.let("coerced", (0, n._)`undefined`);
    b.coerceTypes === "array" && w.if((0, n._)`${I} == 'object' && Array.isArray(${E}) && ${E}.length == 1`, () => w.assign(E, (0, n._)`${E}[0]`).assign(I, (0, n._)`typeof ${E}`).if(S(d, E, b.strictNumbers), () => w.assign(M, E))), w.if((0, n._)`${M} !== undefined`);
    for (const k of v)
      (m.has(k) || k === "array" && b.coerceTypes === "array") && K(k);
    w.else(), f(a), w.endIf(), w.if((0, n._)`${M} !== undefined`, () => {
      w.assign(E, M), $(a, M);
    });
    function K(k) {
      switch (k) {
        case "string":
          w.elseIf((0, n._)`${I} == "number" || ${I} == "boolean"`).assign(M, (0, n._)`"" + ${E}`).elseIf((0, n._)`${E} === null`).assign(M, (0, n._)`""`);
          return;
        case "number":
          w.elseIf((0, n._)`${I} == "boolean" || ${E} === null
              || (${I} == "string" && ${E} && ${E} == +${E})`).assign(M, (0, n._)`+${E}`);
          return;
        case "integer":
          w.elseIf((0, n._)`${I} === "boolean" || ${E} === null
              || (${I} === "string" && ${E} && ${E} == +${E} && !(${E} % 1))`).assign(M, (0, n._)`+${E}`);
          return;
        case "boolean":
          w.elseIf((0, n._)`${E} === "false" || ${E} === 0 || ${E} === null`).assign(M, !1).elseIf((0, n._)`${E} === "true" || ${E} === 1`).assign(M, !0);
          return;
        case "null":
          w.elseIf((0, n._)`${E} === "" || ${E} === 0 || ${E} === false`), w.assign(M, null);
          return;
        case "array":
          w.elseIf((0, n._)`${I} === "string" || ${I} === "number"
              || ${I} === "boolean" || ${E} === null`).assign(M, (0, n._)`[${E}]`);
      }
    }
  }
  function $({ gen: a, parentData: d, parentDataProperty: v }, w) {
    a.if((0, n._)`${d} !== undefined`, () => a.assign((0, n._)`${d}[${v}]`, w));
  }
  function _(a, d, v, w = s.Correct) {
    const E = w === s.Correct ? n.operators.EQ : n.operators.NEQ;
    let b;
    switch (a) {
      case "null":
        return (0, n._)`${d} ${E} null`;
      case "array":
        b = (0, n._)`Array.isArray(${d})`;
        break;
      case "object":
        b = (0, n._)`${d} && typeof ${d} == "object" && !Array.isArray(${d})`;
        break;
      case "integer":
        b = I((0, n._)`!(${d} % 1) && !isNaN(${d})`);
        break;
      case "number":
        b = I();
        break;
      default:
        return (0, n._)`typeof ${d} ${E} ${a}`;
    }
    return w === s.Correct ? b : (0, n.not)(b);
    function I(M = n.nil) {
      return (0, n.and)((0, n._)`typeof ${d} == "number"`, M, v ? (0, n._)`isFinite(${d})` : n.nil);
    }
  }
  fe.checkDataType = _;
  function S(a, d, v, w) {
    if (a.length === 1)
      return _(a[0], d, v, w);
    let E;
    const b = (0, o.toHash)(a);
    if (b.array && b.object) {
      const I = (0, n._)`typeof ${d} != "object"`;
      E = b.null ? I : (0, n._)`!${d} || ${I}`, delete b.null, delete b.array, delete b.object;
    } else
      E = n.nil;
    b.number && delete b.integer;
    for (const I in b)
      E = (0, n.and)(E, _(I, d, v, w));
    return E;
  }
  fe.checkDataTypes = S;
  const y = {
    message: ({ schema: a }) => `must be ${a}`,
    params: ({ schema: a, schemaValue: d }) => typeof a == "string" ? (0, n._)`{type: ${a}}` : (0, n._)`{type: ${d}}`
  };
  function f(a) {
    const d = h(a);
    (0, r.reportError)(d, y);
  }
  fe.reportTypeError = f;
  function h(a) {
    const { gen: d, data: v, schema: w } = a, E = (0, o.schemaRefOrVal)(a, w, "type");
    return {
      gen: d,
      keyword: "type",
      data: v,
      schema: w.type,
      schemaCode: E,
      schemaValue: E,
      parentSchema: w,
      params: {},
      it: a
    };
  }
  return fe;
}
var ft = {}, Ss;
function Jo() {
  if (Ss) return ft;
  Ss = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.assignDefaults = void 0;
  const e = J(), t = ee();
  function r(o, s) {
    const { properties: c, items: l } = o.schema;
    if (s === "object" && c)
      for (const u in c)
        n(o, u, c[u].default);
    else s === "array" && Array.isArray(l) && l.forEach((u, m) => n(o, m, u.default));
  }
  ft.assignDefaults = r;
  function n(o, s, c) {
    const { gen: l, compositeRule: u, data: m, opts: i } = o;
    if (c === void 0)
      return;
    const p = (0, e._)`${m}${(0, e.getProperty)(s)}`;
    if (u) {
      (0, t.checkStrictMode)(o, `default is ignored for: ${p}`);
      return;
    }
    let $ = (0, e._)`${p} === undefined`;
    i.useDefaults === "empty" && ($ = (0, e._)`${$} || ${p} === null || ${p} === ""`), l.if($, (0, e._)`${p} = ${(0, e.stringify)(c)}`);
  }
  return ft;
}
var Pe = {}, ne = {}, bs;
function Te() {
  if (bs) return ne;
  bs = 1, Object.defineProperty(ne, "__esModule", { value: !0 }), ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
  const e = J(), t = ee(), r = Oe(), n = ee();
  function o(a, d) {
    const { gen: v, data: w, it: E } = a;
    v.if(i(v, w, d, E.opts.ownProperties), () => {
      a.setParams({ missingProperty: (0, e._)`${d}` }, !0), a.error();
    });
  }
  ne.checkReportMissingProp = o;
  function s({ gen: a, data: d, it: { opts: v } }, w, E) {
    return (0, e.or)(...w.map((b) => (0, e.and)(i(a, d, b, v.ownProperties), (0, e._)`${E} = ${b}`)));
  }
  ne.checkMissingProp = s;
  function c(a, d) {
    a.setParams({ missingProperty: d }, !0), a.error();
  }
  ne.reportMissingProp = c;
  function l(a) {
    return a.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  ne.hasPropFunc = l;
  function u(a, d, v) {
    return (0, e._)`${l(a)}.call(${d}, ${v})`;
  }
  ne.isOwnProperty = u;
  function m(a, d, v, w) {
    const E = (0, e._)`${d}${(0, e.getProperty)(v)} !== undefined`;
    return w ? (0, e._)`${E} && ${u(a, d, v)}` : E;
  }
  ne.propertyInData = m;
  function i(a, d, v, w) {
    const E = (0, e._)`${d}${(0, e.getProperty)(v)} === undefined`;
    return w ? (0, e.or)(E, (0, e.not)(u(a, d, v))) : E;
  }
  ne.noPropertyInData = i;
  function p(a) {
    return a ? Object.keys(a).filter((d) => d !== "__proto__") : [];
  }
  ne.allSchemaProperties = p;
  function $(a, d) {
    return p(d).filter((v) => !(0, t.alwaysValidSchema)(a, d[v]));
  }
  ne.schemaProperties = $;
  function _({ schemaCode: a, data: d, it: { gen: v, topSchemaRef: w, schemaPath: E, errorPath: b }, it: I }, M, K, k) {
    const F = k ? (0, e._)`${a}, ${d}, ${w}${E}` : d, U = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, b)],
      [r.default.parentData, I.parentData],
      [r.default.parentDataProperty, I.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    I.opts.dynamicRef && U.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const q = (0, e._)`${F}, ${v.object(...U)}`;
    return K !== e.nil ? (0, e._)`${M}.call(${K}, ${q})` : (0, e._)`${M}(${q})`;
  }
  ne.callValidateCode = _;
  const S = (0, e._)`new RegExp`;
  function y({ gen: a, it: { opts: d } }, v) {
    const w = d.unicodeRegExp ? "u" : "", { regExp: E } = d.code, b = E(v, w);
    return a.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${E.code === "new RegExp" ? S : (0, n.useFunc)(a, E)}(${v}, ${w})`
    });
  }
  ne.usePattern = y;
  function f(a) {
    const { gen: d, data: v, keyword: w, it: E } = a, b = d.name("valid");
    if (E.allErrors) {
      const M = d.let("valid", !0);
      return I(() => d.assign(M, !1)), M;
    }
    return d.var(b, !0), I(() => d.break()), b;
    function I(M) {
      const K = d.const("len", (0, e._)`${v}.length`);
      d.forRange("i", 0, K, (k) => {
        a.subschema({
          keyword: w,
          dataProp: k,
          dataPropType: t.Type.Num
        }, b), d.if((0, e.not)(b), M);
      });
    }
  }
  ne.validateArray = f;
  function h(a) {
    const { gen: d, schema: v, keyword: w, it: E } = a;
    if (!Array.isArray(v))
      throw new Error("ajv implementation error");
    if (v.some((K) => (0, t.alwaysValidSchema)(E, K)) && !E.opts.unevaluated)
      return;
    const I = d.let("valid", !1), M = d.name("_valid");
    d.block(() => v.forEach((K, k) => {
      const F = a.subschema({
        keyword: w,
        schemaProp: k,
        compositeRule: !0
      }, M);
      d.assign(I, (0, e._)`${I} || ${M}`), a.mergeValidEvaluated(F, M) || d.if((0, e.not)(I));
    })), a.result(I, () => a.reset(), () => a.error(!0));
  }
  return ne.validateUnion = h, ne;
}
var Rs;
function Yo() {
  if (Rs) return Pe;
  Rs = 1, Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.validateKeywordUsage = Pe.validSchemaType = Pe.funcKeywordCode = Pe.macroKeywordCode = void 0;
  const e = J(), t = Oe(), r = Te(), n = Rr();
  function o($, _) {
    const { gen: S, keyword: y, schema: f, parentSchema: h, it: a } = $, d = _.macro.call(a.self, f, h, a), v = m(S, y, d);
    a.opts.validateSchema !== !1 && a.self.validateSchema(d, !0);
    const w = S.name("valid");
    $.subschema({
      schema: d,
      schemaPath: e.nil,
      errSchemaPath: `${a.errSchemaPath}/${y}`,
      topSchemaRef: v,
      compositeRule: !0
    }, w), $.pass(w, () => $.error(!0));
  }
  Pe.macroKeywordCode = o;
  function s($, _) {
    var S;
    const { gen: y, keyword: f, schema: h, parentSchema: a, $data: d, it: v } = $;
    u(v, _);
    const w = !d && _.compile ? _.compile.call(v.self, h, a, v) : _.validate, E = m(y, f, w), b = y.let("valid");
    $.block$data(b, I), $.ok((S = _.valid) !== null && S !== void 0 ? S : b);
    function I() {
      if (_.errors === !1)
        k(), _.modifying && c($), F(() => $.error());
      else {
        const U = _.async ? M() : K();
        _.modifying && c($), F(() => l($, U));
      }
    }
    function M() {
      const U = y.let("ruleErrs", null);
      return y.try(() => k((0, e._)`await `), (q) => y.assign(b, !1).if((0, e._)`${q} instanceof ${v.ValidationError}`, () => y.assign(U, (0, e._)`${q}.errors`), () => y.throw(q))), U;
    }
    function K() {
      const U = (0, e._)`${E}.errors`;
      return y.assign(U, null), k(e.nil), U;
    }
    function k(U = _.async ? (0, e._)`await ` : e.nil) {
      const q = v.opts.passContext ? t.default.this : t.default.self, D = !("compile" in _ && !d || _.schema === !1);
      y.assign(b, (0, e._)`${U}${(0, r.callValidateCode)($, E, q, D)}`, _.modifying);
    }
    function F(U) {
      var q;
      y.if((0, e.not)((q = _.valid) !== null && q !== void 0 ? q : b), U);
    }
  }
  Pe.funcKeywordCode = s;
  function c($) {
    const { gen: _, data: S, it: y } = $;
    _.if(y.parentData, () => _.assign(S, (0, e._)`${y.parentData}[${y.parentDataProperty}]`));
  }
  function l($, _) {
    const { gen: S } = $;
    S.if((0, e._)`Array.isArray(${_})`, () => {
      S.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${_} : ${t.default.vErrors}.concat(${_})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)($);
    }, () => $.error());
  }
  function u({ schemaEnv: $ }, _) {
    if (_.async && !$.$async)
      throw new Error("async keyword in sync schema");
  }
  function m($, _, S) {
    if (S === void 0)
      throw new Error(`keyword "${_}" failed to compile`);
    return $.scopeValue("keyword", typeof S == "function" ? { ref: S } : { ref: S, code: (0, e.stringify)(S) });
  }
  function i($, _, S = !1) {
    return !_.length || _.some((y) => y === "array" ? Array.isArray($) : y === "object" ? $ && typeof $ == "object" && !Array.isArray($) : typeof $ == y || S && typeof $ > "u");
  }
  Pe.validSchemaType = i;
  function p({ schema: $, opts: _, self: S, errSchemaPath: y }, f, h) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(h) : f.keyword !== h)
      throw new Error("ajv implementation error");
    const a = f.dependencies;
    if (a != null && a.some((d) => !Object.prototype.hasOwnProperty.call($, d)))
      throw new Error(`parent schema must have dependencies of ${h}: ${a.join(",")}`);
    if (f.validateSchema && !f.validateSchema($[h])) {
      const v = `keyword "${h}" value is invalid at path "${y}": ` + S.errorsText(f.validateSchema.errors);
      if (_.validateSchema === "log")
        S.logger.error(v);
      else
        throw new Error(v);
    }
  }
  return Pe.validateKeywordUsage = p, Pe;
}
var De = {}, Ps;
function Zo() {
  if (Ps) return De;
  Ps = 1, Object.defineProperty(De, "__esModule", { value: !0 }), De.extendSubschemaMode = De.extendSubschemaData = De.getSubschema = void 0;
  const e = J(), t = ee();
  function r(s, { keyword: c, schemaProp: l, schema: u, schemaPath: m, errSchemaPath: i, topSchemaRef: p }) {
    if (c !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (c !== void 0) {
      const $ = s.schema[c];
      return l === void 0 ? {
        schema: $,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${c}`
      } : {
        schema: $[l],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(c)}${(0, e.getProperty)(l)}`,
        errSchemaPath: `${s.errSchemaPath}/${c}/${(0, t.escapeFragment)(l)}`
      };
    }
    if (u !== void 0) {
      if (m === void 0 || i === void 0 || p === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: m,
        topSchemaRef: p,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  De.getSubschema = r;
  function n(s, c, { dataProp: l, dataPropType: u, data: m, dataTypes: i, propertyName: p }) {
    if (m !== void 0 && l !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: $ } = c;
    if (l !== void 0) {
      const { errorPath: S, dataPathArr: y, opts: f } = c, h = $.let("data", (0, e._)`${c.data}${(0, e.getProperty)(l)}`, !0);
      _(h), s.errorPath = (0, e.str)`${S}${(0, t.getErrorPath)(l, u, f.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${l}`, s.dataPathArr = [...y, s.parentDataProperty];
    }
    if (m !== void 0) {
      const S = m instanceof e.Name ? m : $.let("data", m, !0);
      _(S), p !== void 0 && (s.propertyName = p);
    }
    i && (s.dataTypes = i);
    function _(S) {
      s.data = S, s.dataLevel = c.dataLevel + 1, s.dataTypes = [], c.definedProperties = /* @__PURE__ */ new Set(), s.parentData = c.data, s.dataNames = [...c.dataNames, S];
    }
  }
  De.extendSubschemaData = n;
  function o(s, { jtdDiscriminator: c, jtdMetadata: l, compositeRule: u, createErrors: m, allErrors: i }) {
    u !== void 0 && (s.compositeRule = u), m !== void 0 && (s.createErrors = m), i !== void 0 && (s.allErrors = i), s.jtdDiscriminator = c, s.jtdMetadata = l;
  }
  return De.extendSubschemaMode = o, De;
}
var pe = {}, Kr, Is;
function Ji() {
  return Is || (Is = 1, Kr = function e(t, r) {
    if (t === r) return !0;
    if (t && r && typeof t == "object" && typeof r == "object") {
      if (t.constructor !== r.constructor) return !1;
      var n, o, s;
      if (Array.isArray(t)) {
        if (n = t.length, n != r.length) return !1;
        for (o = n; o-- !== 0; )
          if (!e(t[o], r[o])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
      if (s = Object.keys(t), n = s.length, n !== Object.keys(r).length) return !1;
      for (o = n; o-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, s[o])) return !1;
      for (o = n; o-- !== 0; ) {
        var c = s[o];
        if (!e(t[c], r[c])) return !1;
      }
      return !0;
    }
    return t !== t && r !== r;
  }), Kr;
}
var Hr = { exports: {} }, Ns;
function Qo() {
  if (Ns) return Hr.exports;
  Ns = 1;
  var e = Hr.exports = function(n, o, s) {
    typeof o == "function" && (s = o, o = {}), s = o.cb || s;
    var c = typeof s == "function" ? s : s.pre || function() {
    }, l = s.post || function() {
    };
    t(o, c, l, n, "", n);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(n, o, s, c, l, u, m, i, p, $) {
    if (c && typeof c == "object" && !Array.isArray(c)) {
      o(c, l, u, m, i, p, $);
      for (var _ in c) {
        var S = c[_];
        if (Array.isArray(S)) {
          if (_ in e.arrayKeywords)
            for (var y = 0; y < S.length; y++)
              t(n, o, s, S[y], l + "/" + _ + "/" + y, u, l, _, c, y);
        } else if (_ in e.propsKeywords) {
          if (S && typeof S == "object")
            for (var f in S)
              t(n, o, s, S[f], l + "/" + _ + "/" + r(f), u, l, _, c, f);
        } else (_ in e.keywords || n.allKeys && !(_ in e.skipKeywords)) && t(n, o, s, S, l + "/" + _, u, l, _, c);
      }
      s(c, l, u, m, i, p, $);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Hr.exports;
}
var Os;
function Pr() {
  if (Os) return pe;
  Os = 1, Object.defineProperty(pe, "__esModule", { value: !0 }), pe.getSchemaRefs = pe.resolveUrl = pe.normalizeId = pe._getFullPath = pe.getFullPath = pe.inlineRef = void 0;
  const e = ee(), t = Ji(), r = Qo(), n = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function o(y, f = !0) {
    return typeof y == "boolean" ? !0 : f === !0 ? !c(y) : f ? l(y) <= f : !1;
  }
  pe.inlineRef = o;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function c(y) {
    for (const f in y) {
      if (s.has(f))
        return !0;
      const h = y[f];
      if (Array.isArray(h) && h.some(c) || typeof h == "object" && c(h))
        return !0;
    }
    return !1;
  }
  function l(y) {
    let f = 0;
    for (const h in y) {
      if (h === "$ref")
        return 1 / 0;
      if (f++, !n.has(h) && (typeof y[h] == "object" && (0, e.eachItem)(y[h], (a) => f += l(a)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function u(y, f = "", h) {
    h !== !1 && (f = p(f));
    const a = y.parse(f);
    return m(y, a);
  }
  pe.getFullPath = u;
  function m(y, f) {
    return y.serialize(f).split("#")[0] + "#";
  }
  pe._getFullPath = m;
  const i = /#\/?$/;
  function p(y) {
    return y ? y.replace(i, "") : "";
  }
  pe.normalizeId = p;
  function $(y, f, h) {
    return h = p(h), y.resolve(f, h);
  }
  pe.resolveUrl = $;
  const _ = /^[a-z_][-a-z0-9._]*$/i;
  function S(y, f) {
    if (typeof y == "boolean")
      return {};
    const { schemaId: h, uriResolver: a } = this.opts, d = p(y[h] || f), v = { "": d }, w = u(a, d, !1), E = {}, b = /* @__PURE__ */ new Set();
    return r(y, { allKeys: !0 }, (K, k, F, U) => {
      if (U === void 0)
        return;
      const q = w + k;
      let D = v[U];
      typeof K[h] == "string" && (D = X.call(this, K[h])), G.call(this, K.$anchor), G.call(this, K.$dynamicAnchor), v[k] = D;
      function X(z) {
        const H = this.opts.uriResolver.resolve;
        if (z = p(D ? H(D, z) : z), b.has(z))
          throw M(z);
        b.add(z);
        let A = this.refs[z];
        return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? I(K, A.schema, z) : z !== p(q) && (z[0] === "#" ? (I(K, E[z], z), E[z] = K) : this.refs[z] = q), z;
      }
      function G(z) {
        if (typeof z == "string") {
          if (!_.test(z))
            throw new Error(`invalid anchor "${z}"`);
          X.call(this, `#${z}`);
        }
      }
    }), E;
    function I(K, k, F) {
      if (k !== void 0 && !t(K, k))
        throw M(F);
    }
    function M(K) {
      return new Error(`reference "${K}" resolves to more than one schema`);
    }
  }
  return pe.getSchemaRefs = S, pe;
}
var Ts;
function pt() {
  if (Ts) return Ce;
  Ts = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.getData = Ce.KeywordCxt = Ce.validateFunctionCode = void 0;
  const e = xo(), t = Er(), r = xi(), n = Er(), o = Jo(), s = Yo(), c = Zo(), l = J(), u = Oe(), m = Pr(), i = ee(), p = Rr();
  function $(O) {
    if (w(O) && (b(O), v(O))) {
      f(O);
      return;
    }
    _(O, () => (0, e.topBoolOrEmptySchema)(O));
  }
  Ce.validateFunctionCode = $;
  function _({ gen: O, validateName: T, schema: L, schemaEnv: V, opts: W }, Q) {
    W.code.es5 ? O.func(T, (0, l._)`${u.default.data}, ${u.default.valCxt}`, V.$async, () => {
      O.code((0, l._)`"use strict"; ${a(L, W)}`), y(O, W), O.code(Q);
    }) : O.func(T, (0, l._)`${u.default.data}, ${S(W)}`, V.$async, () => O.code(a(L, W)).code(Q));
  }
  function S(O) {
    return (0, l._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${O.dynamicRef ? (0, l._)`, ${u.default.dynamicAnchors}={}` : l.nil}}={}`;
  }
  function y(O, T) {
    O.if(u.default.valCxt, () => {
      O.var(u.default.instancePath, (0, l._)`${u.default.valCxt}.${u.default.instancePath}`), O.var(u.default.parentData, (0, l._)`${u.default.valCxt}.${u.default.parentData}`), O.var(u.default.parentDataProperty, (0, l._)`${u.default.valCxt}.${u.default.parentDataProperty}`), O.var(u.default.rootData, (0, l._)`${u.default.valCxt}.${u.default.rootData}`), T.dynamicRef && O.var(u.default.dynamicAnchors, (0, l._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      O.var(u.default.instancePath, (0, l._)`""`), O.var(u.default.parentData, (0, l._)`undefined`), O.var(u.default.parentDataProperty, (0, l._)`undefined`), O.var(u.default.rootData, u.default.data), T.dynamicRef && O.var(u.default.dynamicAnchors, (0, l._)`{}`);
    });
  }
  function f(O) {
    const { schema: T, opts: L, gen: V } = O;
    _(O, () => {
      L.$comment && T.$comment && U(O), K(O), V.let(u.default.vErrors, null), V.let(u.default.errors, 0), L.unevaluated && h(O), I(O), q(O);
    });
  }
  function h(O) {
    const { gen: T, validateName: L } = O;
    O.evaluated = T.const("evaluated", (0, l._)`${L}.evaluated`), T.if((0, l._)`${O.evaluated}.dynamicProps`, () => T.assign((0, l._)`${O.evaluated}.props`, (0, l._)`undefined`)), T.if((0, l._)`${O.evaluated}.dynamicItems`, () => T.assign((0, l._)`${O.evaluated}.items`, (0, l._)`undefined`));
  }
  function a(O, T) {
    const L = typeof O == "object" && O[T.schemaId];
    return L && (T.code.source || T.code.process) ? (0, l._)`/*# sourceURL=${L} */` : l.nil;
  }
  function d(O, T) {
    if (w(O) && (b(O), v(O))) {
      E(O, T);
      return;
    }
    (0, e.boolOrEmptySchema)(O, T);
  }
  function v({ schema: O, self: T }) {
    if (typeof O == "boolean")
      return !O;
    for (const L in O)
      if (T.RULES.all[L])
        return !0;
    return !1;
  }
  function w(O) {
    return typeof O.schema != "boolean";
  }
  function E(O, T) {
    const { schema: L, gen: V, opts: W } = O;
    W.$comment && L.$comment && U(O), k(O), F(O);
    const Q = V.const("_errs", u.default.errors);
    I(O, Q), V.var(T, (0, l._)`${Q} === ${u.default.errors}`);
  }
  function b(O) {
    (0, i.checkUnknownRules)(O), M(O);
  }
  function I(O, T) {
    if (O.opts.jtd)
      return X(O, [], !1, T);
    const L = (0, t.getSchemaTypes)(O.schema), V = (0, t.coerceAndCheckDataType)(O, L);
    X(O, L, !V, T);
  }
  function M(O) {
    const { schema: T, errSchemaPath: L, opts: V, self: W } = O;
    T.$ref && V.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(T, W.RULES) && W.logger.warn(`$ref: keywords ignored in schema at path "${L}"`);
  }
  function K(O) {
    const { schema: T, opts: L } = O;
    T.default !== void 0 && L.useDefaults && L.strictSchema && (0, i.checkStrictMode)(O, "default is ignored in the schema root");
  }
  function k(O) {
    const T = O.schema[O.opts.schemaId];
    T && (O.baseId = (0, m.resolveUrl)(O.opts.uriResolver, O.baseId, T));
  }
  function F(O) {
    if (O.schema.$async && !O.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function U({ gen: O, schemaEnv: T, schema: L, errSchemaPath: V, opts: W }) {
    const Q = L.$comment;
    if (W.$comment === !0)
      O.code((0, l._)`${u.default.self}.logger.log(${Q})`);
    else if (typeof W.$comment == "function") {
      const ue = (0, l.str)`${V}/$comment`, Re = O.scopeValue("root", { ref: T.root });
      O.code((0, l._)`${u.default.self}.opts.$comment(${Q}, ${ue}, ${Re}.schema)`);
    }
  }
  function q(O) {
    const { gen: T, schemaEnv: L, validateName: V, ValidationError: W, opts: Q } = O;
    L.$async ? T.if((0, l._)`${u.default.errors} === 0`, () => T.return(u.default.data), () => T.throw((0, l._)`new ${W}(${u.default.vErrors})`)) : (T.assign((0, l._)`${V}.errors`, u.default.vErrors), Q.unevaluated && D(O), T.return((0, l._)`${u.default.errors} === 0`));
  }
  function D({ gen: O, evaluated: T, props: L, items: V }) {
    L instanceof l.Name && O.assign((0, l._)`${T}.props`, L), V instanceof l.Name && O.assign((0, l._)`${T}.items`, V);
  }
  function X(O, T, L, V) {
    const { gen: W, schema: Q, data: ue, allErrors: Re, opts: $e, self: ge } = O, { RULES: le } = ge;
    if (Q.$ref && ($e.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(Q, le))) {
      W.block(() => B(O, "$ref", le.all.$ref.definition));
      return;
    }
    $e.jtd || z(O, T), W.block(() => {
      for (const be of le.rules)
        Ye(be);
      Ye(le.post);
    });
    function Ye(be) {
      (0, r.shouldUseGroup)(Q, be) && (be.type ? (W.if((0, n.checkDataType)(be.type, ue, $e.strictNumbers)), G(O, be), T.length === 1 && T[0] === be.type && L && (W.else(), (0, n.reportTypeError)(O)), W.endIf()) : G(O, be), Re || W.if((0, l._)`${u.default.errors} === ${V || 0}`));
    }
  }
  function G(O, T) {
    const { gen: L, schema: V, opts: { useDefaults: W } } = O;
    W && (0, o.assignDefaults)(O, T.type), L.block(() => {
      for (const Q of T.rules)
        (0, r.shouldUseRule)(V, Q) && B(O, Q.keyword, Q.definition, T.type);
    });
  }
  function z(O, T) {
    O.schemaEnv.meta || !O.opts.strictTypes || (H(O, T), O.opts.allowUnionTypes || A(O, T), P(O, O.dataTypes));
  }
  function H(O, T) {
    if (T.length) {
      if (!O.dataTypes.length) {
        O.dataTypes = T;
        return;
      }
      T.forEach((L) => {
        N(O.dataTypes, L) || R(O, `type "${L}" not allowed by context "${O.dataTypes.join(",")}"`);
      }), g(O, T);
    }
  }
  function A(O, T) {
    T.length > 1 && !(T.length === 2 && T.includes("null")) && R(O, "use allowUnionTypes to allow union type keyword");
  }
  function P(O, T) {
    const L = O.self.RULES.all;
    for (const V in L) {
      const W = L[V];
      if (typeof W == "object" && (0, r.shouldUseRule)(O.schema, W)) {
        const { type: Q } = W.definition;
        Q.length && !Q.some((ue) => j(T, ue)) && R(O, `missing type "${Q.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function j(O, T) {
    return O.includes(T) || T === "number" && O.includes("integer");
  }
  function N(O, T) {
    return O.includes(T) || T === "integer" && O.includes("number");
  }
  function g(O, T) {
    const L = [];
    for (const V of O.dataTypes)
      N(T, V) ? L.push(V) : T.includes("integer") && V === "number" && L.push("integer");
    O.dataTypes = L;
  }
  function R(O, T) {
    const L = O.schemaEnv.baseId + O.errSchemaPath;
    T += ` at "${L}" (strictTypes)`, (0, i.checkStrictMode)(O, T, O.opts.strictTypes);
  }
  class C {
    constructor(T, L, V) {
      if ((0, s.validateKeywordUsage)(T, L, V), this.gen = T.gen, this.allErrors = T.allErrors, this.keyword = V, this.data = T.data, this.schema = T.schema[V], this.$data = L.$data && T.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(T, this.schema, V, this.$data), this.schemaType = L.schemaType, this.parentSchema = T.schema, this.params = {}, this.it = T, this.def = L, this.$data)
        this.schemaCode = T.gen.const("vSchema", te(this.$data, T));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, L.schemaType, L.allowUndefined))
        throw new Error(`${V} value must be ${JSON.stringify(L.schemaType)}`);
      ("code" in L ? L.trackErrors : L.errors !== !1) && (this.errsCount = T.gen.const("_errs", u.default.errors));
    }
    result(T, L, V) {
      this.failResult((0, l.not)(T), L, V);
    }
    failResult(T, L, V) {
      this.gen.if(T), V ? V() : this.error(), L ? (this.gen.else(), L(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(T, L) {
      this.failResult((0, l.not)(T), void 0, L);
    }
    fail(T) {
      if (T === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(T), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(T) {
      if (!this.$data)
        return this.fail(T);
      const { schemaCode: L } = this;
      this.fail((0, l._)`${L} !== undefined && (${(0, l.or)(this.invalid$data(), T)})`);
    }
    error(T, L, V) {
      if (L) {
        this.setParams(L), this._error(T, V), this.setParams({});
        return;
      }
      this._error(T, V);
    }
    _error(T, L) {
      (T ? p.reportExtraError : p.reportError)(this, this.def.error, L);
    }
    $dataError() {
      (0, p.reportError)(this, this.def.$dataError || p.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, p.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(T) {
      this.allErrors || this.gen.if(T);
    }
    setParams(T, L) {
      L ? Object.assign(this.params, T) : this.params = T;
    }
    block$data(T, L, V = l.nil) {
      this.gen.block(() => {
        this.check$data(T, V), L();
      });
    }
    check$data(T = l.nil, L = l.nil) {
      if (!this.$data)
        return;
      const { gen: V, schemaCode: W, schemaType: Q, def: ue } = this;
      V.if((0, l.or)((0, l._)`${W} === undefined`, L)), T !== l.nil && V.assign(T, !0), (Q.length || ue.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), T !== l.nil && V.assign(T, !1)), V.else();
    }
    invalid$data() {
      const { gen: T, schemaCode: L, schemaType: V, def: W, it: Q } = this;
      return (0, l.or)(ue(), Re());
      function ue() {
        if (V.length) {
          if (!(L instanceof l.Name))
            throw new Error("ajv implementation error");
          const $e = Array.isArray(V) ? V : [V];
          return (0, l._)`${(0, n.checkDataTypes)($e, L, Q.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return l.nil;
      }
      function Re() {
        if (W.validateSchema) {
          const $e = T.scopeValue("validate$data", { ref: W.validateSchema });
          return (0, l._)`!${$e}(${L})`;
        }
        return l.nil;
      }
    }
    subschema(T, L) {
      const V = (0, c.getSubschema)(this.it, T);
      (0, c.extendSubschemaData)(V, this.it, T), (0, c.extendSubschemaMode)(V, T);
      const W = { ...this.it, ...V, items: void 0, props: void 0 };
      return d(W, L), W;
    }
    mergeEvaluated(T, L) {
      const { it: V, gen: W } = this;
      V.opts.unevaluated && (V.props !== !0 && T.props !== void 0 && (V.props = i.mergeEvaluated.props(W, T.props, V.props, L)), V.items !== !0 && T.items !== void 0 && (V.items = i.mergeEvaluated.items(W, T.items, V.items, L)));
    }
    mergeValidEvaluated(T, L) {
      const { it: V, gen: W } = this;
      if (V.opts.unevaluated && (V.props !== !0 || V.items !== !0))
        return W.if(L, () => this.mergeEvaluated(T, l.Name)), !0;
    }
  }
  Ce.KeywordCxt = C;
  function B(O, T, L, V) {
    const W = new C(O, L, T);
    "code" in L ? L.code(W, V) : W.$data && L.validate ? (0, s.funcKeywordCode)(W, L) : "macro" in L ? (0, s.macroKeywordCode)(W, L) : (L.compile || L.validate) && (0, s.funcKeywordCode)(W, L);
  }
  const x = /^\/(?:[^~]|~0|~1)*$/, re = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function te(O, { dataLevel: T, dataNames: L, dataPathArr: V }) {
    let W, Q;
    if (O === "")
      return u.default.rootData;
    if (O[0] === "/") {
      if (!x.test(O))
        throw new Error(`Invalid JSON-pointer: ${O}`);
      W = O, Q = u.default.rootData;
    } else {
      const ge = re.exec(O);
      if (!ge)
        throw new Error(`Invalid JSON-pointer: ${O}`);
      const le = +ge[1];
      if (W = ge[2], W === "#") {
        if (le >= T)
          throw new Error($e("property/index", le));
        return V[T - le];
      }
      if (le > T)
        throw new Error($e("data", le));
      if (Q = L[T - le], !W)
        return Q;
    }
    let ue = Q;
    const Re = W.split("/");
    for (const ge of Re)
      ge && (Q = (0, l._)`${Q}${(0, l.getProperty)((0, i.unescapeJsonPointer)(ge))}`, ue = (0, l._)`${ue} && ${Q}`);
    return ue;
    function $e(ge, le) {
      return `Cannot access ${ge} ${le} levels up, current level is ${T}`;
    }
  }
  return Ce.getData = te, Ce;
}
var _t = {}, js;
function Ir() {
  if (js) return _t;
  js = 1, Object.defineProperty(_t, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return _t.default = e, _t;
}
var Et = {}, As;
function yt() {
  if (As) return Et;
  As = 1, Object.defineProperty(Et, "__esModule", { value: !0 });
  const e = Pr();
  class t extends Error {
    constructor(n, o, s, c) {
      super(c || `can't resolve reference ${s} from id ${o}`), this.missingRef = (0, e.resolveUrl)(n, o, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return Et.default = t, Et;
}
var _e = {}, qs;
function Nr() {
  if (qs) return _e;
  qs = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.resolveSchema = _e.getCompilingSchema = _e.resolveRef = _e.compileSchema = _e.SchemaEnv = void 0;
  const e = J(), t = Ir(), r = Oe(), n = Pr(), o = ee(), s = pt();
  class c {
    constructor(h) {
      var a;
      this.refs = {}, this.dynamicAnchors = {};
      let d;
      typeof h.schema == "object" && (d = h.schema), this.schema = h.schema, this.schemaId = h.schemaId, this.root = h.root || this, this.baseId = (a = h.baseId) !== null && a !== void 0 ? a : (0, n.normalizeId)(d == null ? void 0 : d[h.schemaId || "$id"]), this.schemaPath = h.schemaPath, this.localRefs = h.localRefs, this.meta = h.meta, this.$async = d == null ? void 0 : d.$async, this.refs = {};
    }
  }
  _e.SchemaEnv = c;
  function l(f) {
    const h = i.call(this, f);
    if (h)
      return h;
    const a = (0, n.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: d, lines: v } = this.opts.code, { ownProperties: w } = this.opts, E = new e.CodeGen(this.scope, { es5: d, lines: v, ownProperties: w });
    let b;
    f.$async && (b = E.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const I = E.scopeName("validate");
    f.validateName = I;
    const M = {
      gen: E,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: E.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: I,
      ValidationError: b,
      schema: f.schema,
      schemaEnv: f,
      rootId: a,
      baseId: f.baseId || a,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let K;
    try {
      this._compilations.add(f), (0, s.validateFunctionCode)(M), E.optimize(this.opts.code.optimize);
      const k = E.toString();
      K = `${E.scopeRefs(r.default.scope)}return ${k}`, this.opts.code.process && (K = this.opts.code.process(K, f));
      const U = new Function(`${r.default.self}`, `${r.default.scope}`, K)(this, this.scope.get());
      if (this.scope.value(I, { ref: U }), U.errors = null, U.schema = f.schema, U.schemaEnv = f, f.$async && (U.$async = !0), this.opts.code.source === !0 && (U.source = { validateName: I, validateCode: k, scopeValues: E._values }), this.opts.unevaluated) {
        const { props: q, items: D } = M;
        U.evaluated = {
          props: q instanceof e.Name ? void 0 : q,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: q instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, U.source && (U.source.evaluated = (0, e.stringify)(U.evaluated));
      }
      return f.validate = U, f;
    } catch (k) {
      throw delete f.validate, delete f.validateName, K && this.logger.error("Error compiling schema, function code:", K), k;
    } finally {
      this._compilations.delete(f);
    }
  }
  _e.compileSchema = l;
  function u(f, h, a) {
    var d;
    a = (0, n.resolveUrl)(this.opts.uriResolver, h, a);
    const v = f.refs[a];
    if (v)
      return v;
    let w = $.call(this, f, a);
    if (w === void 0) {
      const E = (d = f.localRefs) === null || d === void 0 ? void 0 : d[a], { schemaId: b } = this.opts;
      E && (w = new c({ schema: E, schemaId: b, root: f, baseId: h }));
    }
    if (w !== void 0)
      return f.refs[a] = m.call(this, w);
  }
  _e.resolveRef = u;
  function m(f) {
    return (0, n.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : l.call(this, f);
  }
  function i(f) {
    for (const h of this._compilations)
      if (p(h, f))
        return h;
  }
  _e.getCompilingSchema = i;
  function p(f, h) {
    return f.schema === h.schema && f.root === h.root && f.baseId === h.baseId;
  }
  function $(f, h) {
    let a;
    for (; typeof (a = this.refs[h]) == "string"; )
      h = a;
    return a || this.schemas[h] || _.call(this, f, h);
  }
  function _(f, h) {
    const a = this.opts.uriResolver.parse(h), d = (0, n._getFullPath)(this.opts.uriResolver, a);
    let v = (0, n.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && d === v)
      return y.call(this, a, f);
    const w = (0, n.normalizeId)(d), E = this.refs[w] || this.schemas[w];
    if (typeof E == "string") {
      const b = _.call(this, f, E);
      return typeof (b == null ? void 0 : b.schema) != "object" ? void 0 : y.call(this, a, b);
    }
    if (typeof (E == null ? void 0 : E.schema) == "object") {
      if (E.validate || l.call(this, E), w === (0, n.normalizeId)(h)) {
        const { schema: b } = E, { schemaId: I } = this.opts, M = b[I];
        return M && (v = (0, n.resolveUrl)(this.opts.uriResolver, v, M)), new c({ schema: b, schemaId: I, root: f, baseId: v });
      }
      return y.call(this, a, E);
    }
  }
  _e.resolveSchema = _;
  const S = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function y(f, { baseId: h, schema: a, root: d }) {
    var v;
    if (((v = f.fragment) === null || v === void 0 ? void 0 : v[0]) !== "/")
      return;
    for (const b of f.fragment.slice(1).split("/")) {
      if (typeof a == "boolean")
        return;
      const I = a[(0, o.unescapeFragment)(b)];
      if (I === void 0)
        return;
      a = I;
      const M = typeof a == "object" && a[this.opts.schemaId];
      !S.has(b) && M && (h = (0, n.resolveUrl)(this.opts.uriResolver, h, M));
    }
    let w;
    if (typeof a != "boolean" && a.$ref && !(0, o.schemaHasRulesButRef)(a, this.RULES)) {
      const b = (0, n.resolveUrl)(this.opts.uriResolver, h, a.$ref);
      w = _.call(this, d, b);
    }
    const { schemaId: E } = this.opts;
    if (w = w || new c({ schema: a, schemaId: E, root: d, baseId: h }), w.schema !== w.root.schema)
      return w;
  }
  return _e;
}
const ec = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", tc = "Meta-schema for $data reference (JSON AnySchema extension proposal)", rc = "object", nc = ["$data"], sc = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, ac = !1, ic = {
  $id: ec,
  description: tc,
  type: rc,
  required: nc,
  properties: sc,
  additionalProperties: ac
};
var wt = {}, dt = { exports: {} }, Xr, Cs;
function oc() {
  return Cs || (Cs = 1, Xr = {
    HEX: {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      a: 10,
      A: 10,
      b: 11,
      B: 11,
      c: 12,
      C: 12,
      d: 13,
      D: 13,
      e: 14,
      E: 14,
      f: 15,
      F: 15
    }
  }), Xr;
}
var Br, ks;
function cc() {
  if (ks) return Br;
  ks = 1;
  const { HEX: e } = oc(), t = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u;
  function r(y) {
    if (l(y, ".") < 3)
      return { host: y, isIPV4: !1 };
    const f = y.match(t) || [], [h] = f;
    return h ? { host: c(h, "."), isIPV4: !0 } : { host: y, isIPV4: !1 };
  }
  function n(y, f = !1) {
    let h = "", a = !0;
    for (const d of y) {
      if (e[d] === void 0) return;
      d !== "0" && a === !0 && (a = !1), a || (h += d);
    }
    return f && h.length === 0 && (h = "0"), h;
  }
  function o(y) {
    let f = 0;
    const h = { error: !1, address: "", zone: "" }, a = [], d = [];
    let v = !1, w = !1, E = !1;
    function b() {
      if (d.length) {
        if (v === !1) {
          const I = n(d);
          if (I !== void 0)
            a.push(I);
          else
            return h.error = !0, !1;
        }
        d.length = 0;
      }
      return !0;
    }
    for (let I = 0; I < y.length; I++) {
      const M = y[I];
      if (!(M === "[" || M === "]"))
        if (M === ":") {
          if (w === !0 && (E = !0), !b())
            break;
          if (f++, a.push(":"), f > 7) {
            h.error = !0;
            break;
          }
          I - 1 >= 0 && y[I - 1] === ":" && (w = !0);
          continue;
        } else if (M === "%") {
          if (!b())
            break;
          v = !0;
        } else {
          d.push(M);
          continue;
        }
    }
    return d.length && (v ? h.zone = d.join("") : E ? a.push(d.join("")) : a.push(n(d))), h.address = a.join(""), h;
  }
  function s(y) {
    if (l(y, ":") < 2)
      return { host: y, isIPV6: !1 };
    const f = o(y);
    if (f.error)
      return { host: y, isIPV6: !1 };
    {
      let h = f.address, a = f.address;
      return f.zone && (h += "%" + f.zone, a += "%25" + f.zone), { host: h, escapedHost: a, isIPV6: !0 };
    }
  }
  function c(y, f) {
    let h = "", a = !0;
    const d = y.length;
    for (let v = 0; v < d; v++) {
      const w = y[v];
      w === "0" && a ? (v + 1 <= d && y[v + 1] === f || v + 1 === d) && (h += w, a = !1) : (w === f ? a = !0 : a = !1, h += w);
    }
    return h;
  }
  function l(y, f) {
    let h = 0;
    for (let a = 0; a < y.length; a++)
      y[a] === f && h++;
    return h;
  }
  const u = /^\.\.?\//u, m = /^\/\.(?:\/|$)/u, i = /^\/\.\.(?:\/|$)/u, p = /^\/?(?:.|\n)*?(?=\/|$)/u;
  function $(y) {
    const f = [];
    for (; y.length; )
      if (y.match(u))
        y = y.replace(u, "");
      else if (y.match(m))
        y = y.replace(m, "/");
      else if (y.match(i))
        y = y.replace(i, "/"), f.pop();
      else if (y === "." || y === "..")
        y = "";
      else {
        const h = y.match(p);
        if (h) {
          const a = h[0];
          y = y.slice(a.length), f.push(a);
        } else
          throw new Error("Unexpected dot segment condition");
      }
    return f.join("");
  }
  function _(y, f) {
    const h = f !== !0 ? escape : unescape;
    return y.scheme !== void 0 && (y.scheme = h(y.scheme)), y.userinfo !== void 0 && (y.userinfo = h(y.userinfo)), y.host !== void 0 && (y.host = h(y.host)), y.path !== void 0 && (y.path = h(y.path)), y.query !== void 0 && (y.query = h(y.query)), y.fragment !== void 0 && (y.fragment = h(y.fragment)), y;
  }
  function S(y) {
    const f = [];
    if (y.userinfo !== void 0 && (f.push(y.userinfo), f.push("@")), y.host !== void 0) {
      let h = unescape(y.host);
      const a = r(h);
      if (a.isIPV4)
        h = a.host;
      else {
        const d = s(a.host);
        d.isIPV6 === !0 ? h = `[${d.escapedHost}]` : h = y.host;
      }
      f.push(h);
    }
    return (typeof y.port == "number" || typeof y.port == "string") && (f.push(":"), f.push(String(y.port))), f.length ? f.join("") : void 0;
  }
  return Br = {
    recomposeAuthority: S,
    normalizeComponentEncoding: _,
    removeDotSegments: $,
    normalizeIPv4: r,
    normalizeIPv6: s,
    stringArrayToHexStripped: n
  }, Br;
}
var Wr, Ds;
function uc() {
  if (Ds) return Wr;
  Ds = 1;
  const e = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu, t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
  function r(a) {
    return typeof a.secure == "boolean" ? a.secure : String(a.scheme).toLowerCase() === "wss";
  }
  function n(a) {
    return a.host || (a.error = a.error || "HTTP URIs must have a host."), a;
  }
  function o(a) {
    const d = String(a.scheme).toLowerCase() === "https";
    return (a.port === (d ? 443 : 80) || a.port === "") && (a.port = void 0), a.path || (a.path = "/"), a;
  }
  function s(a) {
    return a.secure = r(a), a.resourceName = (a.path || "/") + (a.query ? "?" + a.query : ""), a.path = void 0, a.query = void 0, a;
  }
  function c(a) {
    if ((a.port === (r(a) ? 443 : 80) || a.port === "") && (a.port = void 0), typeof a.secure == "boolean" && (a.scheme = a.secure ? "wss" : "ws", a.secure = void 0), a.resourceName) {
      const [d, v] = a.resourceName.split("?");
      a.path = d && d !== "/" ? d : void 0, a.query = v, a.resourceName = void 0;
    }
    return a.fragment = void 0, a;
  }
  function l(a, d) {
    if (!a.path)
      return a.error = "URN can not be parsed", a;
    const v = a.path.match(t);
    if (v) {
      const w = d.scheme || a.scheme || "urn";
      a.nid = v[1].toLowerCase(), a.nss = v[2];
      const E = `${w}:${d.nid || a.nid}`, b = h[E];
      a.path = void 0, b && (a = b.parse(a, d));
    } else
      a.error = a.error || "URN can not be parsed.";
    return a;
  }
  function u(a, d) {
    const v = d.scheme || a.scheme || "urn", w = a.nid.toLowerCase(), E = `${v}:${d.nid || w}`, b = h[E];
    b && (a = b.serialize(a, d));
    const I = a, M = a.nss;
    return I.path = `${w || d.nid}:${M}`, d.skipEscape = !0, I;
  }
  function m(a, d) {
    const v = a;
    return v.uuid = v.nss, v.nss = void 0, !d.tolerant && (!v.uuid || !e.test(v.uuid)) && (v.error = v.error || "UUID is not valid."), v;
  }
  function i(a) {
    const d = a;
    return d.nss = (a.uuid || "").toLowerCase(), d;
  }
  const p = {
    scheme: "http",
    domainHost: !0,
    parse: n,
    serialize: o
  }, $ = {
    scheme: "https",
    domainHost: p.domainHost,
    parse: n,
    serialize: o
  }, _ = {
    scheme: "ws",
    domainHost: !0,
    parse: s,
    serialize: c
  }, S = {
    scheme: "wss",
    domainHost: _.domainHost,
    parse: _.parse,
    serialize: _.serialize
  }, h = {
    http: p,
    https: $,
    ws: _,
    wss: S,
    urn: {
      scheme: "urn",
      parse: l,
      serialize: u,
      skipNormalize: !0
    },
    "urn:uuid": {
      scheme: "urn:uuid",
      parse: m,
      serialize: i,
      skipNormalize: !0
    }
  };
  return Wr = h, Wr;
}
var Ls;
function lc() {
  if (Ls) return dt.exports;
  Ls = 1;
  const { normalizeIPv6: e, normalizeIPv4: t, removeDotSegments: r, recomposeAuthority: n, normalizeComponentEncoding: o } = cc(), s = uc();
  function c(f, h) {
    return typeof f == "string" ? f = i(S(f, h), h) : typeof f == "object" && (f = S(i(f, h), h)), f;
  }
  function l(f, h, a) {
    const d = Object.assign({ scheme: "null" }, a), v = u(S(f, d), S(h, d), d, !0);
    return i(v, { ...d, skipEscape: !0 });
  }
  function u(f, h, a, d) {
    const v = {};
    return d || (f = S(i(f, a), a), h = S(i(h, a), a)), a = a || {}, !a.tolerant && h.scheme ? (v.scheme = h.scheme, v.userinfo = h.userinfo, v.host = h.host, v.port = h.port, v.path = r(h.path || ""), v.query = h.query) : (h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0 ? (v.userinfo = h.userinfo, v.host = h.host, v.port = h.port, v.path = r(h.path || ""), v.query = h.query) : (h.path ? (h.path.charAt(0) === "/" ? v.path = r(h.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? v.path = "/" + h.path : f.path ? v.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + h.path : v.path = h.path, v.path = r(v.path)), v.query = h.query) : (v.path = f.path, h.query !== void 0 ? v.query = h.query : v.query = f.query), v.userinfo = f.userinfo, v.host = f.host, v.port = f.port), v.scheme = f.scheme), v.fragment = h.fragment, v;
  }
  function m(f, h, a) {
    return typeof f == "string" ? (f = unescape(f), f = i(o(S(f, a), !0), { ...a, skipEscape: !0 })) : typeof f == "object" && (f = i(o(f, !0), { ...a, skipEscape: !0 })), typeof h == "string" ? (h = unescape(h), h = i(o(S(h, a), !0), { ...a, skipEscape: !0 })) : typeof h == "object" && (h = i(o(h, !0), { ...a, skipEscape: !0 })), f.toLowerCase() === h.toLowerCase();
  }
  function i(f, h) {
    const a = {
      host: f.host,
      scheme: f.scheme,
      userinfo: f.userinfo,
      port: f.port,
      path: f.path,
      query: f.query,
      nid: f.nid,
      nss: f.nss,
      uuid: f.uuid,
      fragment: f.fragment,
      reference: f.reference,
      resourceName: f.resourceName,
      secure: f.secure,
      error: ""
    }, d = Object.assign({}, h), v = [], w = s[(d.scheme || a.scheme || "").toLowerCase()];
    w && w.serialize && w.serialize(a, d), a.path !== void 0 && (d.skipEscape ? a.path = unescape(a.path) : (a.path = escape(a.path), a.scheme !== void 0 && (a.path = a.path.split("%3A").join(":")))), d.reference !== "suffix" && a.scheme && v.push(a.scheme, ":");
    const E = n(a);
    if (E !== void 0 && (d.reference !== "suffix" && v.push("//"), v.push(E), a.path && a.path.charAt(0) !== "/" && v.push("/")), a.path !== void 0) {
      let b = a.path;
      !d.absolutePath && (!w || !w.absolutePath) && (b = r(b)), E === void 0 && (b = b.replace(/^\/\//u, "/%2F")), v.push(b);
    }
    return a.query !== void 0 && v.push("?", a.query), a.fragment !== void 0 && v.push("#", a.fragment), v.join("");
  }
  const p = Array.from({ length: 127 }, (f, h) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(h)));
  function $(f) {
    let h = 0;
    for (let a = 0, d = f.length; a < d; ++a)
      if (h = f.charCodeAt(a), h > 126 || p[h])
        return !0;
    return !1;
  }
  const _ = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function S(f, h) {
    const a = Object.assign({}, h), d = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    }, v = f.indexOf("%") !== -1;
    let w = !1;
    a.reference === "suffix" && (f = (a.scheme ? a.scheme + ":" : "") + "//" + f);
    const E = f.match(_);
    if (E) {
      if (d.scheme = E[1], d.userinfo = E[3], d.host = E[4], d.port = parseInt(E[5], 10), d.path = E[6] || "", d.query = E[7], d.fragment = E[8], isNaN(d.port) && (d.port = E[5]), d.host) {
        const I = t(d.host);
        if (I.isIPV4 === !1) {
          const M = e(I.host);
          d.host = M.host.toLowerCase(), w = M.isIPV6;
        } else
          d.host = I.host, w = !0;
      }
      d.scheme === void 0 && d.userinfo === void 0 && d.host === void 0 && d.port === void 0 && d.query === void 0 && !d.path ? d.reference = "same-document" : d.scheme === void 0 ? d.reference = "relative" : d.fragment === void 0 ? d.reference = "absolute" : d.reference = "uri", a.reference && a.reference !== "suffix" && a.reference !== d.reference && (d.error = d.error || "URI is not a " + a.reference + " reference.");
      const b = s[(a.scheme || d.scheme || "").toLowerCase()];
      if (!a.unicodeSupport && (!b || !b.unicodeSupport) && d.host && (a.domainHost || b && b.domainHost) && w === !1 && $(d.host))
        try {
          d.host = URL.domainToASCII(d.host.toLowerCase());
        } catch (I) {
          d.error = d.error || "Host's domain name can not be converted to ASCII: " + I;
        }
      (!b || b && !b.skipNormalize) && (v && d.scheme !== void 0 && (d.scheme = unescape(d.scheme)), v && d.host !== void 0 && (d.host = unescape(d.host)), d.path && (d.path = escape(unescape(d.path))), d.fragment && (d.fragment = encodeURI(decodeURIComponent(d.fragment)))), b && b.parse && b.parse(d, a);
    } else
      d.error = d.error || "URI can not be parsed.";
    return d;
  }
  const y = {
    SCHEMES: s,
    normalize: c,
    resolve: l,
    resolveComponents: u,
    equal: m,
    serialize: i,
    parse: S
  };
  return dt.exports = y, dt.exports.default = y, dt.exports.fastUri = y, dt.exports;
}
var Ms;
function fc() {
  if (Ms) return wt;
  Ms = 1, Object.defineProperty(wt, "__esModule", { value: !0 });
  const e = lc();
  return e.code = 'require("ajv/dist/runtime/uri").default', wt.default = e, wt;
}
var Vs;
function Yi() {
  return Vs || (Vs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = pt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var r = J();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const n = Ir(), o = yt(), s = Wi(), c = Nr(), l = J(), u = Pr(), m = Er(), i = ee(), p = ic, $ = fc(), _ = (A, P) => new RegExp(A, P);
    _.code = "new RegExp";
    const S = ["removeAdditional", "useDefaults", "coerceTypes"], y = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, h = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, a = 200;
    function d(A) {
      var P, j, N, g, R, C, B, x, re, te, O, T, L, V, W, Q, ue, Re, $e, ge, le, Ye, be, Cr, kr;
      const it = A.strict, Dr = (P = A.code) === null || P === void 0 ? void 0 : P.optimize, ss = Dr === !0 || Dr === void 0 ? 1 : Dr || 0, as = (N = (j = A.code) === null || j === void 0 ? void 0 : j.regExp) !== null && N !== void 0 ? N : _, vo = (g = A.uriResolver) !== null && g !== void 0 ? g : $.default;
      return {
        strictSchema: (C = (R = A.strictSchema) !== null && R !== void 0 ? R : it) !== null && C !== void 0 ? C : !0,
        strictNumbers: (x = (B = A.strictNumbers) !== null && B !== void 0 ? B : it) !== null && x !== void 0 ? x : !0,
        strictTypes: (te = (re = A.strictTypes) !== null && re !== void 0 ? re : it) !== null && te !== void 0 ? te : "log",
        strictTuples: (T = (O = A.strictTuples) !== null && O !== void 0 ? O : it) !== null && T !== void 0 ? T : "log",
        strictRequired: (V = (L = A.strictRequired) !== null && L !== void 0 ? L : it) !== null && V !== void 0 ? V : !1,
        code: A.code ? { ...A.code, optimize: ss, regExp: as } : { optimize: ss, regExp: as },
        loopRequired: (W = A.loopRequired) !== null && W !== void 0 ? W : a,
        loopEnum: (Q = A.loopEnum) !== null && Q !== void 0 ? Q : a,
        meta: (ue = A.meta) !== null && ue !== void 0 ? ue : !0,
        messages: (Re = A.messages) !== null && Re !== void 0 ? Re : !0,
        inlineRefs: ($e = A.inlineRefs) !== null && $e !== void 0 ? $e : !0,
        schemaId: (ge = A.schemaId) !== null && ge !== void 0 ? ge : "$id",
        addUsedSchema: (le = A.addUsedSchema) !== null && le !== void 0 ? le : !0,
        validateSchema: (Ye = A.validateSchema) !== null && Ye !== void 0 ? Ye : !0,
        validateFormats: (be = A.validateFormats) !== null && be !== void 0 ? be : !0,
        unicodeRegExp: (Cr = A.unicodeRegExp) !== null && Cr !== void 0 ? Cr : !0,
        int32range: (kr = A.int32range) !== null && kr !== void 0 ? kr : !0,
        uriResolver: vo
      };
    }
    class v {
      constructor(P = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...d(P) };
        const { es5: j, lines: N } = this.opts.code;
        this.scope = new l.ValueScope({ scope: {}, prefixes: y, es5: j, lines: N }), this.logger = F(P.logger);
        const g = P.validateFormats;
        P.validateFormats = !1, this.RULES = (0, s.getRules)(), w.call(this, f, P, "NOT SUPPORTED"), w.call(this, h, P, "DEPRECATED", "warn"), this._metaOpts = K.call(this), P.formats && I.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && M.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), b.call(this), P.validateFormats = g;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: P, meta: j, schemaId: N } = this.opts;
        let g = p;
        N === "id" && (g = { ...p }, g.id = g.$id, delete g.$id), j && P && this.addMetaSchema(g, g[N], !1);
      }
      defaultMeta() {
        const { meta: P, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof P == "object" ? P[j] || P : void 0;
      }
      validate(P, j) {
        let N;
        if (typeof P == "string") {
          if (N = this.getSchema(P), !N)
            throw new Error(`no schema with key or ref "${P}"`);
        } else
          N = this.compile(P);
        const g = N(j);
        return "$async" in N || (this.errors = N.errors), g;
      }
      compile(P, j) {
        const N = this._addSchema(P, j);
        return N.validate || this._compileSchemaEnv(N);
      }
      compileAsync(P, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: N } = this.opts;
        return g.call(this, P, j);
        async function g(te, O) {
          await R.call(this, te.$schema);
          const T = this._addSchema(te, O);
          return T.validate || C.call(this, T);
        }
        async function R(te) {
          te && !this.getSchema(te) && await g.call(this, { $ref: te }, !0);
        }
        async function C(te) {
          try {
            return this._compileSchemaEnv(te);
          } catch (O) {
            if (!(O instanceof o.default))
              throw O;
            return B.call(this, O), await x.call(this, O.missingSchema), C.call(this, te);
          }
        }
        function B({ missingSchema: te, missingRef: O }) {
          if (this.refs[te])
            throw new Error(`AnySchema ${te} is loaded but ${O} cannot be resolved`);
        }
        async function x(te) {
          const O = await re.call(this, te);
          this.refs[te] || await R.call(this, O.$schema), this.refs[te] || this.addSchema(O, te, j);
        }
        async function re(te) {
          const O = this._loading[te];
          if (O)
            return O;
          try {
            return await (this._loading[te] = N(te));
          } finally {
            delete this._loading[te];
          }
        }
      }
      // Adds schema to the instance
      addSchema(P, j, N, g = this.opts.validateSchema) {
        if (Array.isArray(P)) {
          for (const C of P)
            this.addSchema(C, void 0, N, g);
          return this;
        }
        let R;
        if (typeof P == "object") {
          const { schemaId: C } = this.opts;
          if (R = P[C], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${C} must be string`);
        }
        return j = (0, u.normalizeId)(j || R), this._checkUnique(j), this.schemas[j] = this._addSchema(P, N, j, g, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(P, j, N = this.opts.validateSchema) {
        return this.addSchema(P, j, !0, N), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(P, j) {
        if (typeof P == "boolean")
          return !0;
        let N;
        if (N = P.$schema, N !== void 0 && typeof N != "string")
          throw new Error("$schema must be a string");
        if (N = N || this.opts.defaultMeta || this.defaultMeta(), !N)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const g = this.validate(N, P);
        if (!g && j) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return g;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(P) {
        let j;
        for (; typeof (j = E.call(this, P)) == "string"; )
          P = j;
        if (j === void 0) {
          const { schemaId: N } = this.opts, g = new c.SchemaEnv({ schema: {}, schemaId: N });
          if (j = c.resolveSchema.call(this, g, P), !j)
            return;
          this.refs[P] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(P) {
        if (P instanceof RegExp)
          return this._removeAllSchemas(this.schemas, P), this._removeAllSchemas(this.refs, P), this;
        switch (typeof P) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = E.call(this, P);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[P], delete this.refs[P], this;
          }
          case "object": {
            const j = P;
            this._cache.delete(j);
            let N = P[this.opts.schemaId];
            return N && (N = (0, u.normalizeId)(N), delete this.schemas[N], delete this.refs[N]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(P) {
        for (const j of P)
          this.addKeyword(j);
        return this;
      }
      addKeyword(P, j) {
        let N;
        if (typeof P == "string")
          N = P, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = N);
        else if (typeof P == "object" && j === void 0) {
          if (j = P, N = j.keyword, Array.isArray(N) && !N.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (q.call(this, N, j), !j)
          return (0, i.eachItem)(N, (R) => D.call(this, R)), this;
        G.call(this, j);
        const g = {
          ...j,
          type: (0, m.getJSONTypes)(j.type),
          schemaType: (0, m.getJSONTypes)(j.schemaType)
        };
        return (0, i.eachItem)(N, g.type.length === 0 ? (R) => D.call(this, R, g) : (R) => g.type.forEach((C) => D.call(this, R, g, C))), this;
      }
      getKeyword(P) {
        const j = this.RULES.all[P];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(P) {
        const { RULES: j } = this;
        delete j.keywords[P], delete j.all[P];
        for (const N of j.rules) {
          const g = N.rules.findIndex((R) => R.keyword === P);
          g >= 0 && N.rules.splice(g, 1);
        }
        return this;
      }
      // Add format
      addFormat(P, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[P] = j, this;
      }
      errorsText(P = this.errors, { separator: j = ", ", dataVar: N = "data" } = {}) {
        return !P || P.length === 0 ? "No errors" : P.map((g) => `${N}${g.instancePath} ${g.message}`).reduce((g, R) => g + j + R);
      }
      $dataMetaSchema(P, j) {
        const N = this.RULES.all;
        P = JSON.parse(JSON.stringify(P));
        for (const g of j) {
          const R = g.split("/").slice(1);
          let C = P;
          for (const B of R)
            C = C[B];
          for (const B in N) {
            const x = N[B];
            if (typeof x != "object")
              continue;
            const { $data: re } = x.definition, te = C[B];
            re && te && (C[B] = H(te));
          }
        }
        return P;
      }
      _removeAllSchemas(P, j) {
        for (const N in P) {
          const g = P[N];
          (!j || j.test(N)) && (typeof g == "string" ? delete P[N] : g && !g.meta && (this._cache.delete(g.schema), delete P[N]));
        }
      }
      _addSchema(P, j, N, g = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let C;
        const { schemaId: B } = this.opts;
        if (typeof P == "object")
          C = P[B];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof P != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let x = this._cache.get(P);
        if (x !== void 0)
          return x;
        N = (0, u.normalizeId)(C || N);
        const re = u.getSchemaRefs.call(this, P, N);
        return x = new c.SchemaEnv({ schema: P, schemaId: B, meta: j, baseId: N, localRefs: re }), this._cache.set(x.schema, x), R && !N.startsWith("#") && (N && this._checkUnique(N), this.refs[N] = x), g && this.validateSchema(P, !0), x;
      }
      _checkUnique(P) {
        if (this.schemas[P] || this.refs[P])
          throw new Error(`schema with key or id "${P}" already exists`);
      }
      _compileSchemaEnv(P) {
        if (P.meta ? this._compileMetaSchema(P) : c.compileSchema.call(this, P), !P.validate)
          throw new Error("ajv implementation error");
        return P.validate;
      }
      _compileMetaSchema(P) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          c.compileSchema.call(this, P);
        } finally {
          this.opts = j;
        }
      }
    }
    v.ValidationError = n.default, v.MissingRefError = o.default, e.default = v;
    function w(A, P, j, N = "error") {
      for (const g in A) {
        const R = g;
        R in P && this.logger[N](`${j}: option ${g}. ${A[R]}`);
      }
    }
    function E(A) {
      return A = (0, u.normalizeId)(A), this.schemas[A] || this.refs[A];
    }
    function b() {
      const A = this.opts.schemas;
      if (A)
        if (Array.isArray(A))
          this.addSchema(A);
        else
          for (const P in A)
            this.addSchema(A[P], P);
    }
    function I() {
      for (const A in this.opts.formats) {
        const P = this.opts.formats[A];
        P && this.addFormat(A, P);
      }
    }
    function M(A) {
      if (Array.isArray(A)) {
        this.addVocabulary(A);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const P in A) {
        const j = A[P];
        j.keyword || (j.keyword = P), this.addKeyword(j);
      }
    }
    function K() {
      const A = { ...this.opts };
      for (const P of S)
        delete A[P];
      return A;
    }
    const k = { log() {
    }, warn() {
    }, error() {
    } };
    function F(A) {
      if (A === !1)
        return k;
      if (A === void 0)
        return console;
      if (A.log && A.warn && A.error)
        return A;
      throw new Error("logger must implement log, warn and error methods");
    }
    const U = /^[a-z_$][a-z0-9_$:-]*$/i;
    function q(A, P) {
      const { RULES: j } = this;
      if ((0, i.eachItem)(A, (N) => {
        if (j.keywords[N])
          throw new Error(`Keyword ${N} is already defined`);
        if (!U.test(N))
          throw new Error(`Keyword ${N} has invalid name`);
      }), !!P && P.$data && !("code" in P || "validate" in P))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(A, P, j) {
      var N;
      const g = P == null ? void 0 : P.post;
      if (j && g)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let C = g ? R.post : R.rules.find(({ type: x }) => x === j);
      if (C || (C = { type: j, rules: [] }, R.rules.push(C)), R.keywords[A] = !0, !P)
        return;
      const B = {
        keyword: A,
        definition: {
          ...P,
          type: (0, m.getJSONTypes)(P.type),
          schemaType: (0, m.getJSONTypes)(P.schemaType)
        }
      };
      P.before ? X.call(this, C, B, P.before) : C.rules.push(B), R.all[A] = B, (N = P.implements) === null || N === void 0 || N.forEach((x) => this.addKeyword(x));
    }
    function X(A, P, j) {
      const N = A.rules.findIndex((g) => g.keyword === j);
      N >= 0 ? A.rules.splice(N, 0, P) : (A.rules.push(P), this.logger.warn(`rule ${j} is not defined`));
    }
    function G(A) {
      let { metaSchema: P } = A;
      P !== void 0 && (A.$data && this.opts.$data && (P = H(P)), A.validateSchema = this.compile(P, !0));
    }
    const z = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function H(A) {
      return { anyOf: [A, z] };
    }
  }(Vr)), Vr;
}
var St = {}, bt = {}, Rt = {}, Fs;
function dc() {
  if (Fs) return Rt;
  Fs = 1, Object.defineProperty(Rt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Rt.default = e, Rt;
}
var Ge = {}, zs;
function xn() {
  if (zs) return Ge;
  zs = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.callRef = Ge.getValidate = void 0;
  const e = yt(), t = Te(), r = J(), n = Oe(), o = Nr(), s = ee(), c = {
    keyword: "$ref",
    schemaType: "string",
    code(m) {
      const { gen: i, schema: p, it: $ } = m, { baseId: _, schemaEnv: S, validateName: y, opts: f, self: h } = $, { root: a } = S;
      if ((p === "#" || p === "#/") && _ === a.baseId)
        return v();
      const d = o.resolveRef.call(h, a, _, p);
      if (d === void 0)
        throw new e.default($.opts.uriResolver, _, p);
      if (d instanceof o.SchemaEnv)
        return w(d);
      return E(d);
      function v() {
        if (S === a)
          return u(m, y, S, S.$async);
        const b = i.scopeValue("root", { ref: a });
        return u(m, (0, r._)`${b}.validate`, a, a.$async);
      }
      function w(b) {
        const I = l(m, b);
        u(m, I, b, b.$async);
      }
      function E(b) {
        const I = i.scopeValue("schema", f.code.source === !0 ? { ref: b, code: (0, r.stringify)(b) } : { ref: b }), M = i.name("valid"), K = m.subschema({
          schema: b,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: I,
          errSchemaPath: p
        }, M);
        m.mergeEvaluated(K), m.ok(M);
      }
    }
  };
  function l(m, i) {
    const { gen: p } = m;
    return i.validate ? p.scopeValue("validate", { ref: i.validate }) : (0, r._)`${p.scopeValue("wrapper", { ref: i })}.validate`;
  }
  Ge.getValidate = l;
  function u(m, i, p, $) {
    const { gen: _, it: S } = m, { allErrors: y, schemaEnv: f, opts: h } = S, a = h.passContext ? n.default.this : r.nil;
    $ ? d() : v();
    function d() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const b = _.let("valid");
      _.try(() => {
        _.code((0, r._)`await ${(0, t.callValidateCode)(m, i, a)}`), E(i), y || _.assign(b, !0);
      }, (I) => {
        _.if((0, r._)`!(${I} instanceof ${S.ValidationError})`, () => _.throw(I)), w(I), y || _.assign(b, !1);
      }), m.ok(b);
    }
    function v() {
      m.result((0, t.callValidateCode)(m, i, a), () => E(i), () => w(i));
    }
    function w(b) {
      const I = (0, r._)`${b}.errors`;
      _.assign(n.default.vErrors, (0, r._)`${n.default.vErrors} === null ? ${I} : ${n.default.vErrors}.concat(${I})`), _.assign(n.default.errors, (0, r._)`${n.default.vErrors}.length`);
    }
    function E(b) {
      var I;
      if (!S.opts.unevaluated)
        return;
      const M = (I = p == null ? void 0 : p.validate) === null || I === void 0 ? void 0 : I.evaluated;
      if (S.props !== !0)
        if (M && !M.dynamicProps)
          M.props !== void 0 && (S.props = s.mergeEvaluated.props(_, M.props, S.props));
        else {
          const K = _.var("props", (0, r._)`${b}.evaluated.props`);
          S.props = s.mergeEvaluated.props(_, K, S.props, r.Name);
        }
      if (S.items !== !0)
        if (M && !M.dynamicItems)
          M.items !== void 0 && (S.items = s.mergeEvaluated.items(_, M.items, S.items));
        else {
          const K = _.var("items", (0, r._)`${b}.evaluated.items`);
          S.items = s.mergeEvaluated.items(_, K, S.items, r.Name);
        }
    }
  }
  return Ge.callRef = u, Ge.default = c, Ge;
}
var Us;
function Zi() {
  if (Us) return bt;
  Us = 1, Object.defineProperty(bt, "__esModule", { value: !0 });
  const e = dc(), t = xn(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return bt.default = r, bt;
}
var Pt = {}, It = {}, Gs;
function hc() {
  if (Gs) return It;
  Gs = 1, Object.defineProperty(It, "__esModule", { value: !0 });
  const e = J(), t = e.operators, r = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: s, schemaCode: c }) => (0, e.str)`must be ${r[s].okStr} ${c}`,
    params: ({ keyword: s, schemaCode: c }) => (0, e._)`{comparison: ${r[s].okStr}, limit: ${c}}`
  }, o = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(s) {
      const { keyword: c, data: l, schemaCode: u } = s;
      s.fail$data((0, e._)`${l} ${r[c].fail} ${u} || isNaN(${l})`);
    }
  };
  return It.default = o, It;
}
var Nt = {}, Ks;
function mc() {
  if (Ks) return Nt;
  Ks = 1, Object.defineProperty(Nt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: o, data: s, schemaCode: c, it: l } = n, u = l.opts.multipleOfPrecision, m = o.let("res"), i = u ? (0, e._)`Math.abs(Math.round(${m}) - ${m}) > 1e-${u}` : (0, e._)`${m} !== parseInt(${m})`;
      n.fail$data((0, e._)`(${c} === 0 || (${m} = ${s}/${c}, ${i}))`);
    }
  };
  return Nt.default = r, Nt;
}
var Ot = {}, Tt = {}, Hs;
function pc() {
  if (Hs) return Tt;
  Hs = 1, Object.defineProperty(Tt, "__esModule", { value: !0 });
  function e(t) {
    const r = t.length;
    let n = 0, o = 0, s;
    for (; o < r; )
      n++, s = t.charCodeAt(o++), s >= 55296 && s <= 56319 && o < r && (s = t.charCodeAt(o), (s & 64512) === 56320 && o++);
    return n;
  }
  return Tt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Tt;
}
var Xs;
function yc() {
  if (Xs) return Ot;
  Xs = 1, Object.defineProperty(Ot, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = pc(), o = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: c }) {
        const l = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${l} than ${c} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: c, data: l, schemaCode: u, it: m } = s, i = c === "maxLength" ? e.operators.GT : e.operators.LT, p = m.opts.unicode === !1 ? (0, e._)`${l}.length` : (0, e._)`${(0, t.useFunc)(s.gen, r.default)}(${l})`;
      s.fail$data((0, e._)`${p} ${i} ${u}`);
    }
  };
  return Ot.default = o, Ot;
}
var jt = {}, Bs;
function $c() {
  if (Bs) return jt;
  Bs = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
  const e = Te(), t = J(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: o }) => (0, t.str)`must match pattern "${o}"`,
      params: ({ schemaCode: o }) => (0, t._)`{pattern: ${o}}`
    },
    code(o) {
      const { data: s, $data: c, schema: l, schemaCode: u, it: m } = o, i = m.opts.unicodeRegExp ? "u" : "", p = c ? (0, t._)`(new RegExp(${u}, ${i}))` : (0, e.usePattern)(o, l);
      o.fail$data((0, t._)`!${p}.test(${s})`);
    }
  };
  return jt.default = n, jt;
}
var At = {}, Ws;
function gc() {
  if (Ws) return At;
  Ws = 1, Object.defineProperty(At, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: o }) {
        const s = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${o} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: o, data: s, schemaCode: c } = n, l = o === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${s}).length ${l} ${c}`);
    }
  };
  return At.default = r, At;
}
var qt = {}, xs;
function vc() {
  if (xs) return qt;
  xs = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  const e = Te(), t = J(), r = ee(), o = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: c, schema: l, schemaCode: u, data: m, $data: i, it: p } = s, { opts: $ } = p;
      if (!i && l.length === 0)
        return;
      const _ = l.length >= $.loopRequired;
      if (p.allErrors ? S() : y(), $.strictRequired) {
        const a = s.parentSchema.properties, { definedProperties: d } = s.it;
        for (const v of l)
          if ((a == null ? void 0 : a[v]) === void 0 && !d.has(v)) {
            const w = p.schemaEnv.baseId + p.errSchemaPath, E = `required property "${v}" is not defined at "${w}" (strictRequired)`;
            (0, r.checkStrictMode)(p, E, p.opts.strictRequired);
          }
      }
      function S() {
        if (_ || i)
          s.block$data(t.nil, f);
        else
          for (const a of l)
            (0, e.checkReportMissingProp)(s, a);
      }
      function y() {
        const a = c.let("missing");
        if (_ || i) {
          const d = c.let("valid", !0);
          s.block$data(d, () => h(a, d)), s.ok(d);
        } else
          c.if((0, e.checkMissingProp)(s, l, a)), (0, e.reportMissingProp)(s, a), c.else();
      }
      function f() {
        c.forOf("prop", u, (a) => {
          s.setParams({ missingProperty: a }), c.if((0, e.noPropertyInData)(c, m, a, $.ownProperties), () => s.error());
        });
      }
      function h(a, d) {
        s.setParams({ missingProperty: a }), c.forOf(a, u, () => {
          c.assign(d, (0, e.propertyInData)(c, m, a, $.ownProperties)), c.if((0, t.not)(d), () => {
            s.error(), c.break();
          });
        }, t.nil);
      }
    }
  };
  return qt.default = o, qt;
}
var Ct = {}, Js;
function _c() {
  if (Js) return Ct;
  Js = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: o }) {
        const s = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${o} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: o, data: s, schemaCode: c } = n, l = o === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${s}.length ${l} ${c}`);
    }
  };
  return Ct.default = r, Ct;
}
var kt = {}, Dt = {}, Ys;
function Jn() {
  if (Ys) return Dt;
  Ys = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const e = Ji();
  return e.code = 'require("ajv/dist/runtime/equal").default', Dt.default = e, Dt;
}
var Zs;
function Ec() {
  if (Zs) return kt;
  Zs = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  const e = Er(), t = J(), r = ee(), n = Jn(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: c, j: l } }) => (0, t.str)`must NOT have duplicate items (items ## ${l} and ${c} are identical)`,
      params: ({ params: { i: c, j: l } }) => (0, t._)`{i: ${c}, j: ${l}}`
    },
    code(c) {
      const { gen: l, data: u, $data: m, schema: i, parentSchema: p, schemaCode: $, it: _ } = c;
      if (!m && !i)
        return;
      const S = l.let("valid"), y = p.items ? (0, e.getSchemaTypes)(p.items) : [];
      c.block$data(S, f, (0, t._)`${$} === false`), c.ok(S);
      function f() {
        const v = l.let("i", (0, t._)`${u}.length`), w = l.let("j");
        c.setParams({ i: v, j: w }), l.assign(S, !0), l.if((0, t._)`${v} > 1`, () => (h() ? a : d)(v, w));
      }
      function h() {
        return y.length > 0 && !y.some((v) => v === "object" || v === "array");
      }
      function a(v, w) {
        const E = l.name("item"), b = (0, e.checkDataTypes)(y, E, _.opts.strictNumbers, e.DataType.Wrong), I = l.const("indices", (0, t._)`{}`);
        l.for((0, t._)`;${v}--;`, () => {
          l.let(E, (0, t._)`${u}[${v}]`), l.if(b, (0, t._)`continue`), y.length > 1 && l.if((0, t._)`typeof ${E} == "string"`, (0, t._)`${E} += "_"`), l.if((0, t._)`typeof ${I}[${E}] == "number"`, () => {
            l.assign(w, (0, t._)`${I}[${E}]`), c.error(), l.assign(S, !1).break();
          }).code((0, t._)`${I}[${E}] = ${v}`);
        });
      }
      function d(v, w) {
        const E = (0, r.useFunc)(l, n.default), b = l.name("outer");
        l.label(b).for((0, t._)`;${v}--;`, () => l.for((0, t._)`${w} = ${v}; ${w}--;`, () => l.if((0, t._)`${E}(${u}[${v}], ${u}[${w}])`, () => {
          c.error(), l.assign(S, !1).break(b);
        })));
      }
    }
  };
  return kt.default = s, kt;
}
var Lt = {}, Qs;
function wc() {
  if (Qs) return Lt;
  Qs = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Jn(), o = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: c, data: l, $data: u, schemaCode: m, schema: i } = s;
      u || i && typeof i == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(c, r.default)}(${l}, ${m})`) : s.fail((0, e._)`${i} !== ${l}`);
    }
  };
  return Lt.default = o, Lt;
}
var Mt = {}, ea;
function Sc() {
  if (ea) return Mt;
  ea = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Jn(), o = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: c, data: l, $data: u, schema: m, schemaCode: i, it: p } = s;
      if (!u && m.length === 0)
        throw new Error("enum must have non-empty array");
      const $ = m.length >= p.opts.loopEnum;
      let _;
      const S = () => _ ?? (_ = (0, t.useFunc)(c, r.default));
      let y;
      if ($ || u)
        y = c.let("valid"), s.block$data(y, f);
      else {
        if (!Array.isArray(m))
          throw new Error("ajv implementation error");
        const a = c.const("vSchema", i);
        y = (0, e.or)(...m.map((d, v) => h(a, v)));
      }
      s.pass(y);
      function f() {
        c.assign(y, !1), c.forOf("v", i, (a) => c.if((0, e._)`${S()}(${l}, ${a})`, () => c.assign(y, !0).break()));
      }
      function h(a, d) {
        const v = m[d];
        return typeof v == "object" && v !== null ? (0, e._)`${S()}(${l}, ${a}[${d}])` : (0, e._)`${l} === ${v}`;
      }
    }
  };
  return Mt.default = o, Mt;
}
var ta;
function Qi() {
  if (ta) return Pt;
  ta = 1, Object.defineProperty(Pt, "__esModule", { value: !0 });
  const e = hc(), t = mc(), r = yc(), n = $c(), o = gc(), s = vc(), c = _c(), l = Ec(), u = wc(), m = Sc(), i = [
    // number
    e.default,
    t.default,
    // string
    r.default,
    n.default,
    // object
    o.default,
    s.default,
    // array
    c.default,
    l.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    m.default
  ];
  return Pt.default = i, Pt;
}
var Vt = {}, Ze = {}, ra;
function eo() {
  if (ra) return Ze;
  ra = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.validateAdditionalItems = void 0;
  const e = J(), t = ee(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: c, it: l } = s, { items: u } = c;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(l, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      o(s, u);
    }
  };
  function o(s, c) {
    const { gen: l, schema: u, data: m, keyword: i, it: p } = s;
    p.items = !0;
    const $ = l.const("len", (0, e._)`${m}.length`);
    if (u === !1)
      s.setParams({ len: c.length }), s.pass((0, e._)`${$} <= ${c.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(p, u)) {
      const S = l.var("valid", (0, e._)`${$} <= ${c.length}`);
      l.if((0, e.not)(S), () => _(S)), s.ok(S);
    }
    function _(S) {
      l.forRange("i", c.length, $, (y) => {
        s.subschema({ keyword: i, dataProp: y, dataPropType: t.Type.Num }, S), p.allErrors || l.if((0, e.not)(S), () => l.break());
      });
    }
  }
  return Ze.validateAdditionalItems = o, Ze.default = n, Ze;
}
var Ft = {}, Qe = {}, na;
function to() {
  if (na) return Qe;
  na = 1, Object.defineProperty(Qe, "__esModule", { value: !0 }), Qe.validateTuple = void 0;
  const e = J(), t = ee(), r = Te(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: c, it: l } = s;
      if (Array.isArray(c))
        return o(s, "additionalItems", c);
      l.items = !0, !(0, t.alwaysValidSchema)(l, c) && s.ok((0, r.validateArray)(s));
    }
  };
  function o(s, c, l = s.schema) {
    const { gen: u, parentSchema: m, data: i, keyword: p, it: $ } = s;
    y(m), $.opts.unevaluated && l.length && $.items !== !0 && ($.items = t.mergeEvaluated.items(u, l.length, $.items));
    const _ = u.name("valid"), S = u.const("len", (0, e._)`${i}.length`);
    l.forEach((f, h) => {
      (0, t.alwaysValidSchema)($, f) || (u.if((0, e._)`${S} > ${h}`, () => s.subschema({
        keyword: p,
        schemaProp: h,
        dataProp: h
      }, _)), s.ok(_));
    });
    function y(f) {
      const { opts: h, errSchemaPath: a } = $, d = l.length, v = d === f.minItems && (d === f.maxItems || f[c] === !1);
      if (h.strictTuples && !v) {
        const w = `"${p}" is ${d}-tuple, but minItems or maxItems/${c} are not specified or different at path "${a}"`;
        (0, t.checkStrictMode)($, w, h.strictTuples);
      }
    }
  }
  return Qe.validateTuple = o, Qe.default = n, Qe;
}
var sa;
function bc() {
  if (sa) return Ft;
  sa = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = to(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, e.validateTuple)(r, "items")
  };
  return Ft.default = t, Ft;
}
var zt = {}, aa;
function Rc() {
  if (aa) return zt;
  aa = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Te(), n = eo(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: c } }) => (0, e.str)`must NOT have more than ${c} items`,
      params: ({ params: { len: c } }) => (0, e._)`{limit: ${c}}`
    },
    code(c) {
      const { schema: l, parentSchema: u, it: m } = c, { prefixItems: i } = u;
      m.items = !0, !(0, t.alwaysValidSchema)(m, l) && (i ? (0, n.validateAdditionalItems)(c, i) : c.ok((0, r.validateArray)(c)));
    }
  };
  return zt.default = s, zt;
}
var Ut = {}, ia;
function Pc() {
  if (ia) return Ut;
  ia = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: o, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${o} valid item(s)` : (0, e.str)`must contain at least ${o} and no more than ${s} valid item(s)`,
      params: ({ params: { min: o, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${o}}` : (0, e._)`{minContains: ${o}, maxContains: ${s}}`
    },
    code(o) {
      const { gen: s, schema: c, parentSchema: l, data: u, it: m } = o;
      let i, p;
      const { minContains: $, maxContains: _ } = l;
      m.opts.next ? (i = $ === void 0 ? 1 : $, p = _) : i = 1;
      const S = s.const("len", (0, e._)`${u}.length`);
      if (o.setParams({ min: i, max: p }), p === void 0 && i === 0) {
        (0, t.checkStrictMode)(m, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (p !== void 0 && i > p) {
        (0, t.checkStrictMode)(m, '"minContains" > "maxContains" is always invalid'), o.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(m, c)) {
        let d = (0, e._)`${S} >= ${i}`;
        p !== void 0 && (d = (0, e._)`${d} && ${S} <= ${p}`), o.pass(d);
        return;
      }
      m.items = !0;
      const y = s.name("valid");
      p === void 0 && i === 1 ? h(y, () => s.if(y, () => s.break())) : i === 0 ? (s.let(y, !0), p !== void 0 && s.if((0, e._)`${u}.length > 0`, f)) : (s.let(y, !1), f()), o.result(y, () => o.reset());
      function f() {
        const d = s.name("_valid"), v = s.let("count", 0);
        h(d, () => s.if(d, () => a(v)));
      }
      function h(d, v) {
        s.forRange("i", 0, S, (w) => {
          o.subschema({
            keyword: "contains",
            dataProp: w,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, d), v();
        });
      }
      function a(d) {
        s.code((0, e._)`${d}++`), p === void 0 ? s.if((0, e._)`${d} >= ${i}`, () => s.assign(y, !0).break()) : (s.if((0, e._)`${d} > ${p}`, () => s.assign(y, !1).break()), i === 1 ? s.assign(y, !0) : s.if((0, e._)`${d} >= ${i}`, () => s.assign(y, !0)));
      }
    }
  };
  return Ut.default = n, Ut;
}
var xr = {}, oa;
function Yn() {
  return oa || (oa = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = J(), r = ee(), n = Te();
    e.error = {
      message: ({ params: { property: u, depsCount: m, deps: i } }) => {
        const p = m === 1 ? "property" : "properties";
        return (0, t.str)`must have ${p} ${i} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: m, deps: i, missingProperty: p } }) => (0, t._)`{property: ${u},
    missingProperty: ${p},
    depsCount: ${m},
    deps: ${i}}`
      // TODO change to reference
    };
    const o = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [m, i] = s(u);
        c(u, m), l(u, i);
      }
    };
    function s({ schema: u }) {
      const m = {}, i = {};
      for (const p in u) {
        if (p === "__proto__")
          continue;
        const $ = Array.isArray(u[p]) ? m : i;
        $[p] = u[p];
      }
      return [m, i];
    }
    function c(u, m = u.schema) {
      const { gen: i, data: p, it: $ } = u;
      if (Object.keys(m).length === 0)
        return;
      const _ = i.let("missing");
      for (const S in m) {
        const y = m[S];
        if (y.length === 0)
          continue;
        const f = (0, n.propertyInData)(i, p, S, $.opts.ownProperties);
        u.setParams({
          property: S,
          depsCount: y.length,
          deps: y.join(", ")
        }), $.allErrors ? i.if(f, () => {
          for (const h of y)
            (0, n.checkReportMissingProp)(u, h);
        }) : (i.if((0, t._)`${f} && (${(0, n.checkMissingProp)(u, y, _)})`), (0, n.reportMissingProp)(u, _), i.else());
      }
    }
    e.validatePropertyDeps = c;
    function l(u, m = u.schema) {
      const { gen: i, data: p, keyword: $, it: _ } = u, S = i.name("valid");
      for (const y in m)
        (0, r.alwaysValidSchema)(_, m[y]) || (i.if(
          (0, n.propertyInData)(i, p, y, _.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: $, schemaProp: y }, S);
            u.mergeValidEvaluated(f, S);
          },
          () => i.var(S, !0)
          // TODO var
        ), u.ok(S));
    }
    e.validateSchemaDeps = l, e.default = o;
  }(xr)), xr;
}
var Gt = {}, ca;
function Ic() {
  if (ca) return Gt;
  ca = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: o }) => (0, e._)`{propertyName: ${o.propertyName}}`
    },
    code(o) {
      const { gen: s, schema: c, data: l, it: u } = o;
      if ((0, t.alwaysValidSchema)(u, c))
        return;
      const m = s.name("valid");
      s.forIn("key", l, (i) => {
        o.setParams({ propertyName: i }), o.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, m), s.if((0, e.not)(m), () => {
          o.error(!0), u.allErrors || s.break();
        });
      }), o.ok(m);
    }
  };
  return Gt.default = n, Gt;
}
var Kt = {}, ua;
function ro() {
  if (ua) return Kt;
  ua = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = Te(), t = J(), r = Oe(), n = ee(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: c }) => (0, t._)`{additionalProperty: ${c.additionalProperty}}`
    },
    code(c) {
      const { gen: l, schema: u, parentSchema: m, data: i, errsCount: p, it: $ } = c;
      if (!p)
        throw new Error("ajv implementation error");
      const { allErrors: _, opts: S } = $;
      if ($.props = !0, S.removeAdditional !== "all" && (0, n.alwaysValidSchema)($, u))
        return;
      const y = (0, e.allSchemaProperties)(m.properties), f = (0, e.allSchemaProperties)(m.patternProperties);
      h(), c.ok((0, t._)`${p} === ${r.default.errors}`);
      function h() {
        l.forIn("key", i, (E) => {
          !y.length && !f.length ? v(E) : l.if(a(E), () => v(E));
        });
      }
      function a(E) {
        let b;
        if (y.length > 8) {
          const I = (0, n.schemaRefOrVal)($, m.properties, "properties");
          b = (0, e.isOwnProperty)(l, I, E);
        } else y.length ? b = (0, t.or)(...y.map((I) => (0, t._)`${E} === ${I}`)) : b = t.nil;
        return f.length && (b = (0, t.or)(b, ...f.map((I) => (0, t._)`${(0, e.usePattern)(c, I)}.test(${E})`))), (0, t.not)(b);
      }
      function d(E) {
        l.code((0, t._)`delete ${i}[${E}]`);
      }
      function v(E) {
        if (S.removeAdditional === "all" || S.removeAdditional && u === !1) {
          d(E);
          return;
        }
        if (u === !1) {
          c.setParams({ additionalProperty: E }), c.error(), _ || l.break();
          return;
        }
        if (typeof u == "object" && !(0, n.alwaysValidSchema)($, u)) {
          const b = l.name("valid");
          S.removeAdditional === "failing" ? (w(E, b, !1), l.if((0, t.not)(b), () => {
            c.reset(), d(E);
          })) : (w(E, b), _ || l.if((0, t.not)(b), () => l.break()));
        }
      }
      function w(E, b, I) {
        const M = {
          keyword: "additionalProperties",
          dataProp: E,
          dataPropType: n.Type.Str
        };
        I === !1 && Object.assign(M, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), c.subschema(M, b);
      }
    }
  };
  return Kt.default = s, Kt;
}
var Ht = {}, la;
function Nc() {
  if (la) return Ht;
  la = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = pt(), t = Te(), r = ee(), n = ro(), o = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: c, schema: l, parentSchema: u, data: m, it: i } = s;
      i.opts.removeAdditional === "all" && u.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(i, n.default, "additionalProperties"));
      const p = (0, t.allSchemaProperties)(l);
      for (const f of p)
        i.definedProperties.add(f);
      i.opts.unevaluated && p.length && i.props !== !0 && (i.props = r.mergeEvaluated.props(c, (0, r.toHash)(p), i.props));
      const $ = p.filter((f) => !(0, r.alwaysValidSchema)(i, l[f]));
      if ($.length === 0)
        return;
      const _ = c.name("valid");
      for (const f of $)
        S(f) ? y(f) : (c.if((0, t.propertyInData)(c, m, f, i.opts.ownProperties)), y(f), i.allErrors || c.else().var(_, !0), c.endIf()), s.it.definedProperties.add(f), s.ok(_);
      function S(f) {
        return i.opts.useDefaults && !i.compositeRule && l[f].default !== void 0;
      }
      function y(f) {
        s.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, _);
      }
    }
  };
  return Ht.default = o, Ht;
}
var Xt = {}, fa;
function Oc() {
  if (fa) return Xt;
  fa = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = Te(), t = J(), r = ee(), n = ee(), o = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: c, schema: l, data: u, parentSchema: m, it: i } = s, { opts: p } = i, $ = (0, e.allSchemaProperties)(l), _ = $.filter((v) => (0, r.alwaysValidSchema)(i, l[v]));
      if ($.length === 0 || _.length === $.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const S = p.strictSchema && !p.allowMatchingProperties && m.properties, y = c.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, n.evaluatedPropsToName)(c, i.props));
      const { props: f } = i;
      h();
      function h() {
        for (const v of $)
          S && a(v), i.allErrors ? d(v) : (c.var(y, !0), d(v), c.if(y));
      }
      function a(v) {
        for (const w in S)
          new RegExp(v).test(w) && (0, r.checkStrictMode)(i, `property ${w} matches pattern ${v} (use allowMatchingProperties)`);
      }
      function d(v) {
        c.forIn("key", u, (w) => {
          c.if((0, t._)`${(0, e.usePattern)(s, v)}.test(${w})`, () => {
            const E = _.includes(v);
            E || s.subschema({
              keyword: "patternProperties",
              schemaProp: v,
              dataProp: w,
              dataPropType: n.Type.Str
            }, y), i.opts.unevaluated && f !== !0 ? c.assign((0, t._)`${f}[${w}]`, !0) : !E && !i.allErrors && c.if((0, t.not)(y), () => c.break());
          });
        });
      }
    }
  };
  return Xt.default = o, Xt;
}
var Bt = {}, da;
function Tc() {
  if (da) return Bt;
  da = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: n, schema: o, it: s } = r;
      if ((0, e.alwaysValidSchema)(s, o)) {
        r.fail();
        return;
      }
      const c = n.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c), r.failResult(c, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Bt.default = t, Bt;
}
var Wt = {}, ha;
function jc() {
  if (ha) return Wt;
  ha = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Te().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Wt.default = t, Wt;
}
var xt = {}, ma;
function Ac() {
  if (ma) return xt;
  ma = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: o }) => (0, e._)`{passingSchemas: ${o.passing}}`
    },
    code(o) {
      const { gen: s, schema: c, parentSchema: l, it: u } = o;
      if (!Array.isArray(c))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && l.discriminator)
        return;
      const m = c, i = s.let("valid", !1), p = s.let("passing", null), $ = s.name("_valid");
      o.setParams({ passing: p }), s.block(_), o.result(i, () => o.reset(), () => o.error(!0));
      function _() {
        m.forEach((S, y) => {
          let f;
          (0, t.alwaysValidSchema)(u, S) ? s.var($, !0) : f = o.subschema({
            keyword: "oneOf",
            schemaProp: y,
            compositeRule: !0
          }, $), y > 0 && s.if((0, e._)`${$} && ${i}`).assign(i, !1).assign(p, (0, e._)`[${p}, ${y}]`).else(), s.if($, () => {
            s.assign(i, !0), s.assign(p, y), f && o.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return xt.default = n, xt;
}
var Jt = {}, pa;
function qc() {
  if (pa) return Jt;
  pa = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: n, schema: o, it: s } = r;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      const c = n.name("valid");
      o.forEach((l, u) => {
        if ((0, e.alwaysValidSchema)(s, l))
          return;
        const m = r.subschema({ keyword: "allOf", schemaProp: u }, c);
        r.ok(c), r.mergeEvaluated(m);
      });
    }
  };
  return Jt.default = t, Jt;
}
var Yt = {}, ya;
function Cc() {
  if (ya) return Yt;
  ya = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: c, parentSchema: l, it: u } = s;
      l.then === void 0 && l.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const m = o(u, "then"), i = o(u, "else");
      if (!m && !i)
        return;
      const p = c.let("valid", !0), $ = c.name("_valid");
      if (_(), s.reset(), m && i) {
        const y = c.let("ifClause");
        s.setParams({ ifClause: y }), c.if($, S("then", y), S("else", y));
      } else m ? c.if($, S("then")) : c.if((0, e.not)($), S("else"));
      s.pass(p, () => s.error(!0));
      function _() {
        const y = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, $);
        s.mergeEvaluated(y);
      }
      function S(y, f) {
        return () => {
          const h = s.subschema({ keyword: y }, $);
          c.assign(p, $), s.mergeValidEvaluated(h, p), f ? c.assign(f, (0, e._)`${y}`) : s.setParams({ ifClause: y });
        };
      }
    }
  };
  function o(s, c) {
    const l = s.schema[c];
    return l !== void 0 && !(0, t.alwaysValidSchema)(s, l);
  }
  return Yt.default = n, Yt;
}
var Zt = {}, $a;
function kc() {
  if ($a) return Zt;
  $a = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: o }) {
      n.if === void 0 && (0, e.checkStrictMode)(o, `"${r}" without "if" is ignored`);
    }
  };
  return Zt.default = t, Zt;
}
var ga;
function no() {
  if (ga) return Vt;
  ga = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = eo(), t = bc(), r = to(), n = Rc(), o = Pc(), s = Yn(), c = Ic(), l = ro(), u = Nc(), m = Oc(), i = Tc(), p = jc(), $ = Ac(), _ = qc(), S = Cc(), y = kc();
  function f(h = !1) {
    const a = [
      // any
      i.default,
      p.default,
      $.default,
      _.default,
      S.default,
      y.default,
      // object
      c.default,
      l.default,
      s.default,
      u.default,
      m.default
    ];
    return h ? a.push(t.default, n.default) : a.push(e.default, r.default), a.push(o.default), a;
  }
  return Vt.default = f, Vt;
}
var Qt = {}, et = {}, va;
function so() {
  if (va) return et;
  va = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.dynamicAnchor = void 0;
  const e = J(), t = Oe(), r = Nr(), n = xn(), o = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (l) => s(l, l.schema)
  };
  function s(l, u) {
    const { gen: m, it: i } = l;
    i.schemaEnv.root.dynamicAnchors[u] = !0;
    const p = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, $ = i.errSchemaPath === "#" ? i.validateName : c(l);
    m.if((0, e._)`!${p}`, () => m.assign(p, $));
  }
  et.dynamicAnchor = s;
  function c(l) {
    const { schemaEnv: u, schema: m, self: i } = l.it, { root: p, baseId: $, localRefs: _, meta: S } = u.root, { schemaId: y } = i.opts, f = new r.SchemaEnv({ schema: m, schemaId: y, root: p, baseId: $, localRefs: _, meta: S });
    return r.compileSchema.call(i, f), (0, n.getValidate)(l, f);
  }
  return et.default = o, et;
}
var tt = {}, _a;
function ao() {
  if (_a) return tt;
  _a = 1, Object.defineProperty(tt, "__esModule", { value: !0 }), tt.dynamicRef = void 0;
  const e = J(), t = Oe(), r = xn(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (s) => o(s, s.schema)
  };
  function o(s, c) {
    const { gen: l, keyword: u, it: m } = s;
    if (c[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const i = c.slice(1);
    if (m.allErrors)
      p();
    else {
      const _ = l.let("valid", !1);
      p(_), s.ok(_);
    }
    function p(_) {
      if (m.schemaEnv.root.dynamicAnchors[i]) {
        const S = l.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(i)}`);
        l.if(S, $(S, _), $(m.validateName, _));
      } else
        $(m.validateName, _)();
    }
    function $(_, S) {
      return S ? () => l.block(() => {
        (0, r.callRef)(s, _), l.let(S, !0);
      }) : () => (0, r.callRef)(s, _);
    }
  }
  return tt.dynamicRef = o, tt.default = n, tt;
}
var er = {}, Ea;
function Dc() {
  if (Ea) return er;
  Ea = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = so(), t = ee(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return er.default = r, er;
}
var tr = {}, wa;
function Lc() {
  if (wa) return tr;
  wa = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = ao(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, e.dynamicRef)(r, r.schema)
  };
  return tr.default = t, tr;
}
var Sa;
function Mc() {
  if (Sa) return Qt;
  Sa = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = so(), t = ao(), r = Dc(), n = Lc(), o = [e.default, t.default, r.default, n.default];
  return Qt.default = o, Qt;
}
var rr = {}, nr = {}, ba;
function Vc() {
  if (ba) return nr;
  ba = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Yn(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (r) => (0, e.validatePropertyDeps)(r)
  };
  return nr.default = t, nr;
}
var sr = {}, Ra;
function Fc() {
  if (Ra) return sr;
  Ra = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = Yn(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, e.validateSchemaDeps)(r)
  };
  return sr.default = t, sr;
}
var ar = {}, Pa;
function zc() {
  if (Pa) return ar;
  Pa = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: o }) {
      n.contains === void 0 && (0, e.checkStrictMode)(o, `"${r}" without "contains" is ignored`);
    }
  };
  return ar.default = t, ar;
}
var Ia;
function Uc() {
  if (Ia) return rr;
  Ia = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = Vc(), t = Fc(), r = zc(), n = [e.default, t.default, r.default];
  return rr.default = n, rr;
}
var ir = {}, or = {}, Na;
function Gc() {
  if (Na) return or;
  Na = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Oe(), o = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: s }) => (0, e._)`{unevaluatedProperty: ${s.unevaluatedProperty}}`
    },
    code(s) {
      const { gen: c, schema: l, data: u, errsCount: m, it: i } = s;
      if (!m)
        throw new Error("ajv implementation error");
      const { allErrors: p, props: $ } = i;
      $ instanceof e.Name ? c.if((0, e._)`${$} !== true`, () => c.forIn("key", u, (f) => c.if(S($, f), () => _(f)))) : $ !== !0 && c.forIn("key", u, (f) => $ === void 0 ? _(f) : c.if(y($, f), () => _(f))), i.props = !0, s.ok((0, e._)`${m} === ${r.default.errors}`);
      function _(f) {
        if (l === !1) {
          s.setParams({ unevaluatedProperty: f }), s.error(), p || c.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(i, l)) {
          const h = c.name("valid");
          s.subschema({
            keyword: "unevaluatedProperties",
            dataProp: f,
            dataPropType: t.Type.Str
          }, h), p || c.if((0, e.not)(h), () => c.break());
        }
      }
      function S(f, h) {
        return (0, e._)`!${f} || !${f}[${h}]`;
      }
      function y(f, h) {
        const a = [];
        for (const d in f)
          f[d] === !0 && a.push((0, e._)`${h} !== ${d}`);
        return (0, e.and)(...a);
      }
    }
  };
  return or.default = o, or;
}
var cr = {}, Oa;
function Kc() {
  if (Oa) return cr;
  Oa = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { gen: s, schema: c, data: l, it: u } = o, m = u.items || 0;
      if (m === !0)
        return;
      const i = s.const("len", (0, e._)`${l}.length`);
      if (c === !1)
        o.setParams({ len: m }), o.fail((0, e._)`${i} > ${m}`);
      else if (typeof c == "object" && !(0, t.alwaysValidSchema)(u, c)) {
        const $ = s.var("valid", (0, e._)`${i} <= ${m}`);
        s.if((0, e.not)($), () => p($, m)), o.ok($);
      }
      u.items = !0;
      function p($, _) {
        s.forRange("i", _, i, (S) => {
          o.subschema({ keyword: "unevaluatedItems", dataProp: S, dataPropType: t.Type.Num }, $), u.allErrors || s.if((0, e.not)($), () => s.break());
        });
      }
    }
  };
  return cr.default = n, cr;
}
var Ta;
function Hc() {
  if (Ta) return ir;
  Ta = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = Gc(), t = Kc(), r = [e.default, t.default];
  return ir.default = r, ir;
}
var ur = {}, lr = {}, ja;
function Xc() {
  if (ja) return lr;
  ja = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, o) {
      const { gen: s, data: c, $data: l, schema: u, schemaCode: m, it: i } = n, { opts: p, errSchemaPath: $, schemaEnv: _, self: S } = i;
      if (!p.validateFormats)
        return;
      l ? y() : f();
      function y() {
        const h = s.scopeValue("formats", {
          ref: S.formats,
          code: p.code.formats
        }), a = s.const("fDef", (0, e._)`${h}[${m}]`), d = s.let("fType"), v = s.let("format");
        s.if((0, e._)`typeof ${a} == "object" && !(${a} instanceof RegExp)`, () => s.assign(d, (0, e._)`${a}.type || "string"`).assign(v, (0, e._)`${a}.validate`), () => s.assign(d, (0, e._)`"string"`).assign(v, a)), n.fail$data((0, e.or)(w(), E()));
        function w() {
          return p.strictSchema === !1 ? e.nil : (0, e._)`${m} && !${v}`;
        }
        function E() {
          const b = _.$async ? (0, e._)`(${a}.async ? await ${v}(${c}) : ${v}(${c}))` : (0, e._)`${v}(${c})`, I = (0, e._)`(typeof ${v} == "function" ? ${b} : ${v}.test(${c}))`;
          return (0, e._)`${v} && ${v} !== true && ${d} === ${o} && !${I}`;
        }
      }
      function f() {
        const h = S.formats[u];
        if (!h) {
          w();
          return;
        }
        if (h === !0)
          return;
        const [a, d, v] = E(h);
        a === o && n.pass(b());
        function w() {
          if (p.strictSchema === !1) {
            S.logger.warn(I());
            return;
          }
          throw new Error(I());
          function I() {
            return `unknown format "${u}" ignored in schema at path "${$}"`;
          }
        }
        function E(I) {
          const M = I instanceof RegExp ? (0, e.regexpCode)(I) : p.code.formats ? (0, e._)`${p.code.formats}${(0, e.getProperty)(u)}` : void 0, K = s.scopeValue("formats", { key: u, ref: I, code: M });
          return typeof I == "object" && !(I instanceof RegExp) ? [I.type || "string", I.validate, (0, e._)`${K}.validate`] : ["string", I, K];
        }
        function b() {
          if (typeof h == "object" && !(h instanceof RegExp) && h.async) {
            if (!_.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${v}(${c})`;
          }
          return typeof d == "function" ? (0, e._)`${v}(${c})` : (0, e._)`${v}.test(${c})`;
        }
      }
    }
  };
  return lr.default = r, lr;
}
var Aa;
function io() {
  if (Aa) return ur;
  Aa = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const t = [Xc().default];
  return ur.default = t, ur;
}
var xe = {}, qa;
function oo() {
  return qa || (qa = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.contentVocabulary = xe.metadataVocabulary = void 0, xe.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], xe.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), xe;
}
var Ca;
function Bc() {
  if (Ca) return St;
  Ca = 1, Object.defineProperty(St, "__esModule", { value: !0 });
  const e = Zi(), t = Qi(), r = no(), n = Mc(), o = Uc(), s = Hc(), c = io(), l = oo(), u = [
    n.default,
    e.default,
    t.default,
    (0, r.default)(!0),
    c.default,
    l.metadataVocabulary,
    l.contentVocabulary,
    o.default,
    s.default
  ];
  return St.default = u, St;
}
var fr = {}, ht = {}, ka;
function Wc() {
  if (ka) return ht;
  ka = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.DiscrError = void 0;
  var e;
  return function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  }(e || (ht.DiscrError = e = {})), ht;
}
var Da;
function co() {
  if (Da) return fr;
  Da = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = J(), t = Wc(), r = Nr(), n = yt(), o = ee(), c = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: l, tagName: u } }) => l === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: l, tag: u, tagName: m } }) => (0, e._)`{error: ${l}, tag: ${m}, tagValue: ${u}}`
    },
    code(l) {
      const { gen: u, data: m, schema: i, parentSchema: p, it: $ } = l, { oneOf: _ } = p;
      if (!$.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const S = i.propertyName;
      if (typeof S != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!_)
        throw new Error("discriminator: requires oneOf keyword");
      const y = u.let("valid", !1), f = u.const("tag", (0, e._)`${m}${(0, e.getProperty)(S)}`);
      u.if((0, e._)`typeof ${f} == "string"`, () => h(), () => l.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: S })), l.ok(y);
      function h() {
        const v = d();
        u.if(!1);
        for (const w in v)
          u.elseIf((0, e._)`${f} === ${w}`), u.assign(y, a(v[w]));
        u.else(), l.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: S }), u.endIf();
      }
      function a(v) {
        const w = u.name("valid"), E = l.subschema({ keyword: "oneOf", schemaProp: v }, w);
        return l.mergeEvaluated(E, e.Name), w;
      }
      function d() {
        var v;
        const w = {}, E = I(p);
        let b = !0;
        for (let k = 0; k < _.length; k++) {
          let F = _[k];
          if (F != null && F.$ref && !(0, o.schemaHasRulesButRef)(F, $.self.RULES)) {
            const q = F.$ref;
            if (F = r.resolveRef.call($.self, $.schemaEnv.root, $.baseId, q), F instanceof r.SchemaEnv && (F = F.schema), F === void 0)
              throw new n.default($.opts.uriResolver, $.baseId, q);
          }
          const U = (v = F == null ? void 0 : F.properties) === null || v === void 0 ? void 0 : v[S];
          if (typeof U != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${S}"`);
          b = b && (E || I(F)), M(U, k);
        }
        if (!b)
          throw new Error(`discriminator: "${S}" must be required`);
        return w;
        function I({ required: k }) {
          return Array.isArray(k) && k.includes(S);
        }
        function M(k, F) {
          if (k.const)
            K(k.const, F);
          else if (k.enum)
            for (const U of k.enum)
              K(U, F);
          else
            throw new Error(`discriminator: "properties/${S}" must have "const" or "enum"`);
        }
        function K(k, F) {
          if (typeof k != "string" || k in w)
            throw new Error(`discriminator: "${S}" values must be unique strings`);
          w[k] = F;
        }
      }
    }
  };
  return fr.default = c, fr;
}
var dr = {};
const xc = "https://json-schema.org/draft/2020-12/schema", Jc = "https://json-schema.org/draft/2020-12/schema", Yc = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Zc = "meta", Qc = "Core and Validation specifications meta-schema", eu = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], tu = ["object", "boolean"], ru = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", nu = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, su = {
  $schema: xc,
  $id: Jc,
  $vocabulary: Yc,
  $dynamicAnchor: Zc,
  title: Qc,
  allOf: eu,
  type: tu,
  $comment: ru,
  properties: nu
}, au = "https://json-schema.org/draft/2020-12/schema", iu = "https://json-schema.org/draft/2020-12/meta/applicator", ou = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, cu = "meta", uu = "Applicator vocabulary meta-schema", lu = ["object", "boolean"], fu = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, du = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, hu = {
  $schema: au,
  $id: iu,
  $vocabulary: ou,
  $dynamicAnchor: cu,
  title: uu,
  type: lu,
  properties: fu,
  $defs: du
}, mu = "https://json-schema.org/draft/2020-12/schema", pu = "https://json-schema.org/draft/2020-12/meta/unevaluated", yu = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, $u = "meta", gu = "Unevaluated applicator vocabulary meta-schema", vu = ["object", "boolean"], _u = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Eu = {
  $schema: mu,
  $id: pu,
  $vocabulary: yu,
  $dynamicAnchor: $u,
  title: gu,
  type: vu,
  properties: _u
}, wu = "https://json-schema.org/draft/2020-12/schema", Su = "https://json-schema.org/draft/2020-12/meta/content", bu = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Ru = "meta", Pu = "Content vocabulary meta-schema", Iu = ["object", "boolean"], Nu = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Ou = {
  $schema: wu,
  $id: Su,
  $vocabulary: bu,
  $dynamicAnchor: Ru,
  title: Pu,
  type: Iu,
  properties: Nu
}, Tu = "https://json-schema.org/draft/2020-12/schema", ju = "https://json-schema.org/draft/2020-12/meta/core", Au = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, qu = "meta", Cu = "Core vocabulary meta-schema", ku = ["object", "boolean"], Du = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, Lu = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Mu = {
  $schema: Tu,
  $id: ju,
  $vocabulary: Au,
  $dynamicAnchor: qu,
  title: Cu,
  type: ku,
  properties: Du,
  $defs: Lu
}, Vu = "https://json-schema.org/draft/2020-12/schema", Fu = "https://json-schema.org/draft/2020-12/meta/format-annotation", zu = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, Uu = "meta", Gu = "Format vocabulary meta-schema for annotation results", Ku = ["object", "boolean"], Hu = { format: { type: "string" } }, Xu = {
  $schema: Vu,
  $id: Fu,
  $vocabulary: zu,
  $dynamicAnchor: Uu,
  title: Gu,
  type: Ku,
  properties: Hu
}, Bu = "https://json-schema.org/draft/2020-12/schema", Wu = "https://json-schema.org/draft/2020-12/meta/meta-data", xu = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Ju = "meta", Yu = "Meta-data vocabulary meta-schema", Zu = ["object", "boolean"], Qu = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, el = {
  $schema: Bu,
  $id: Wu,
  $vocabulary: xu,
  $dynamicAnchor: Ju,
  title: Yu,
  type: Zu,
  properties: Qu
}, tl = "https://json-schema.org/draft/2020-12/schema", rl = "https://json-schema.org/draft/2020-12/meta/validation", nl = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, sl = "meta", al = "Validation vocabulary meta-schema", il = ["object", "boolean"], ol = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, cl = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, ul = {
  $schema: tl,
  $id: rl,
  $vocabulary: nl,
  $dynamicAnchor: sl,
  title: al,
  type: il,
  properties: ol,
  $defs: cl
};
var La;
function ll() {
  if (La) return dr;
  La = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = su, t = hu, r = Eu, n = Ou, o = Mu, s = Xu, c = el, l = ul, u = ["/properties"];
  function m(i) {
    return [
      e,
      t,
      r,
      n,
      o,
      p(this, s),
      c,
      p(this, l)
    ].forEach(($) => this.addMetaSchema($, void 0, !1)), this;
    function p($, _) {
      return i ? $.$dataMetaSchema(_, u) : _;
    }
  }
  return dr.default = m, dr;
}
var Ma;
function fl() {
  return Ma || (Ma = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const r = Yi(), n = Bc(), o = co(), s = ll(), c = "https://json-schema.org/draft/2020-12/schema";
    class l extends r.default {
      constructor(_ = {}) {
        super({
          ..._,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((_) => this.addVocabulary(_)), this.opts.discriminator && this.addKeyword(o.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: _, meta: S } = this.opts;
        S && (s.default.call(this, _), this.refs["http://json-schema.org/schema"] = c);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
      }
    }
    t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
    var u = pt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var m = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return m._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return m.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return m.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return m.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return m.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return m.CodeGen;
    } });
    var i = Ir();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return i.default;
    } });
    var p = yt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return p.default;
    } });
  }(gt, gt.exports)), gt.exports;
}
var dl = fl(), hr = { exports: {} }, Jr = {}, Va;
function hl() {
  return Va || (Va = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(k, F) {
      return { validate: k, compare: F };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(s, c),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), m),
      "date-time": t($(!0), _),
      "iso-time": t(u(), i),
      "iso-date-time": t($(), S),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: h,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: K,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: d,
      // signed 32 bit integer
      int32: { type: "number", validate: E },
      // signed 64 bit integer
      int64: { type: "number", validate: b },
      // C-type float
      float: { type: "number", validate: I },
      // C-type double
      double: { type: "number", validate: I },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, c),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, m),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, _),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, i),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, S),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function r(k) {
      return k % 4 === 0 && (k % 100 !== 0 || k % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, o = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(k) {
      const F = n.exec(k);
      if (!F)
        return !1;
      const U = +F[1], q = +F[2], D = +F[3];
      return q >= 1 && q <= 12 && D >= 1 && D <= (q === 2 && r(U) ? 29 : o[q]);
    }
    function c(k, F) {
      if (k && F)
        return k > F ? 1 : k < F ? -1 : 0;
    }
    const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(k) {
      return function(U) {
        const q = l.exec(U);
        if (!q)
          return !1;
        const D = +q[1], X = +q[2], G = +q[3], z = q[4], H = q[5] === "-" ? -1 : 1, A = +(q[6] || 0), P = +(q[7] || 0);
        if (A > 23 || P > 59 || k && !z)
          return !1;
        if (D <= 23 && X <= 59 && G < 60)
          return !0;
        const j = X - P * H, N = D - A * H - (j < 0 ? 1 : 0);
        return (N === 23 || N === -1) && (j === 59 || j === -1) && G < 61;
      };
    }
    function m(k, F) {
      if (!(k && F))
        return;
      const U = (/* @__PURE__ */ new Date("2020-01-01T" + k)).valueOf(), q = (/* @__PURE__ */ new Date("2020-01-01T" + F)).valueOf();
      if (U && q)
        return U - q;
    }
    function i(k, F) {
      if (!(k && F))
        return;
      const U = l.exec(k), q = l.exec(F);
      if (U && q)
        return k = U[1] + U[2] + U[3], F = q[1] + q[2] + q[3], k > F ? 1 : k < F ? -1 : 0;
    }
    const p = /t|\s/i;
    function $(k) {
      const F = u(k);
      return function(q) {
        const D = q.split(p);
        return D.length === 2 && s(D[0]) && F(D[1]);
      };
    }
    function _(k, F) {
      if (!(k && F))
        return;
      const U = new Date(k).valueOf(), q = new Date(F).valueOf();
      if (U && q)
        return U - q;
    }
    function S(k, F) {
      if (!(k && F))
        return;
      const [U, q] = k.split(p), [D, X] = F.split(p), G = c(U, D);
      if (G !== void 0)
        return G || m(q, X);
    }
    const y = /\/|:/, f = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function h(k) {
      return y.test(k) && f.test(k);
    }
    const a = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function d(k) {
      return a.lastIndex = 0, a.test(k);
    }
    const v = -2147483648, w = 2 ** 31 - 1;
    function E(k) {
      return Number.isInteger(k) && k <= w && k >= v;
    }
    function b(k) {
      return Number.isInteger(k);
    }
    function I() {
      return !0;
    }
    const M = /[^\\]\\Z/;
    function K(k) {
      if (M.test(k))
        return !1;
      try {
        return new RegExp(k), !0;
      } catch {
        return !1;
      }
    }
  }(Jr)), Jr;
}
var Yr = {}, mr = { exports: {} }, pr = {}, Fa;
function ml() {
  if (Fa) return pr;
  Fa = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = Zi(), t = Qi(), r = no(), n = io(), o = oo(), s = [
    e.default,
    t.default,
    (0, r.default)(),
    n.default,
    o.metadataVocabulary,
    o.contentVocabulary
  ];
  return pr.default = s, pr;
}
const pl = "http://json-schema.org/draft-07/schema#", yl = "http://json-schema.org/draft-07/schema#", $l = "Core schema meta-schema", gl = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, vl = ["object", "boolean"], _l = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, El = {
  $schema: pl,
  $id: yl,
  title: $l,
  definitions: gl,
  type: vl,
  properties: _l,
  default: !0
};
var za;
function wl() {
  return za || (za = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const r = Yi(), n = ml(), o = co(), s = El, c = ["/properties"], l = "http://json-schema.org/draft-07/schema";
    class u extends r.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((S) => this.addVocabulary(S)), this.opts.discriminator && this.addKeyword(o.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const S = this.opts.$data ? this.$dataMetaSchema(s, c) : s;
        this.addMetaSchema(S, l, !1), this.refs["http://json-schema.org/schema"] = l;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var m = pt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return m.KeywordCxt;
    } });
    var i = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var p = Ir();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return p.default;
    } });
    var $ = yt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return $.default;
    } });
  }(mr, mr.exports)), mr.exports;
}
var Ua;
function Sl() {
  return Ua || (Ua = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = wl(), r = J(), n = r.operators, o = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, s = {
      message: ({ keyword: l, schemaCode: u }) => (0, r.str)`should be ${o[l].okStr} ${u}`,
      params: ({ keyword: l, schemaCode: u }) => (0, r._)`{comparison: ${o[l].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(o),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(l) {
        const { gen: u, data: m, schemaCode: i, keyword: p, it: $ } = l, { opts: _, self: S } = $;
        if (!_.validateFormats)
          return;
        const y = new t.KeywordCxt($, S.RULES.all.format.definition, "format");
        y.$data ? f() : h();
        function f() {
          const d = u.scopeValue("formats", {
            ref: S.formats,
            code: _.code.formats
          }), v = u.const("fmt", (0, r._)`${d}[${y.schemaCode}]`);
          l.fail$data((0, r.or)((0, r._)`typeof ${v} != "object"`, (0, r._)`${v} instanceof RegExp`, (0, r._)`typeof ${v}.compare != "function"`, a(v)));
        }
        function h() {
          const d = y.schema, v = S.formats[d];
          if (!v || v === !0)
            return;
          if (typeof v != "object" || v instanceof RegExp || typeof v.compare != "function")
            throw new Error(`"${p}": format "${d}" does not define "compare" function`);
          const w = u.scopeValue("formats", {
            key: d,
            ref: v,
            code: _.code.formats ? (0, r._)`${_.code.formats}${(0, r.getProperty)(d)}` : void 0
          });
          l.fail$data(a(w));
        }
        function a(d) {
          return (0, r._)`${d}.compare(${m}, ${i}) ${o[p].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const c = (l) => (l.addKeyword(e.formatLimitDefinition), l);
    e.default = c;
  }(Yr)), Yr;
}
var Ga;
function bl() {
  return Ga || (Ga = 1, function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = hl(), n = Sl(), o = J(), s = new o.Name("fullFormats"), c = new o.Name("fastFormats"), l = (m, i = { keywords: !0 }) => {
      if (Array.isArray(i))
        return u(m, i, r.fullFormats, s), m;
      const [p, $] = i.mode === "fast" ? [r.fastFormats, c] : [r.fullFormats, s], _ = i.formats || r.formatNames;
      return u(m, _, p, $), i.keywords && (0, n.default)(m), m;
    };
    l.get = (m, i = "full") => {
      const $ = (i === "fast" ? r.fastFormats : r.fullFormats)[m];
      if (!$)
        throw new Error(`Unknown format "${m}"`);
      return $;
    };
    function u(m, i, p, $) {
      var _, S;
      (_ = (S = m.opts.code).formats) !== null && _ !== void 0 || (S.formats = (0, o._)`require("ajv-formats/dist/formats").${$}`);
      for (const y of i)
        m.addFormat(y, p[y]);
    }
    e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  }(hr, hr.exports)), hr.exports;
}
var Rl = bl();
const Pl = /* @__PURE__ */ Bi(Rl), Il = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const o = Object.getOwnPropertyDescriptor(e, r), s = Object.getOwnPropertyDescriptor(t, r);
  !Nl(o, s) && n || Object.defineProperty(e, r, s);
}, Nl = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Ol = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Tl = (e, t) => `/* Wrapped ${e}*/
${t}`, jl = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Al = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), ql = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, o = Tl.bind(null, n, t.toString());
  Object.defineProperty(o, "name", Al);
  const { writable: s, enumerable: c, configurable: l } = jl;
  Object.defineProperty(e, "toString", { value: o, writable: s, enumerable: c, configurable: l });
};
function Cl(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const o of Reflect.ownKeys(t))
    Il(e, t, o, r);
  return Ol(e, t), ql(e, t, n), e;
}
const Ka = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: o = !1,
    after: s = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!o && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let c, l, u;
  const m = function(...i) {
    const p = this, $ = () => {
      c = void 0, l && (clearTimeout(l), l = void 0), s && (u = e.apply(p, i));
    }, _ = () => {
      l = void 0, c && (clearTimeout(c), c = void 0), s && (u = e.apply(p, i));
    }, S = o && !c;
    return clearTimeout(c), c = setTimeout($, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(_, n)), S && (u = e.apply(p, i)), u;
  };
  return Cl(m, e), m.cancel = () => {
    c && (clearTimeout(c), c = void 0), l && (clearTimeout(l), l = void 0);
  }, m;
};
var yr = { exports: {} }, Zr, Ha;
function Or() {
  if (Ha) return Zr;
  Ha = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, o = t - 6;
  return Zr = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: o,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Zr;
}
var Qr, Xa;
function Tr() {
  return Xa || (Xa = 1, Qr = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Qr;
}
var Ba;
function $t() {
  return Ba || (Ba = 1, function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: o
    } = Or(), s = Tr();
    t = e.exports = {};
    const c = t.re = [], l = t.safeRe = [], u = t.src = [], m = t.safeSrc = [], i = t.t = {};
    let p = 0;
    const $ = "[a-zA-Z0-9-]", _ = [
      ["\\s", 1],
      ["\\d", o],
      [$, n]
    ], S = (f) => {
      for (const [h, a] of _)
        f = f.split(`${h}*`).join(`${h}{0,${a}}`).split(`${h}+`).join(`${h}{1,${a}}`);
      return f;
    }, y = (f, h, a) => {
      const d = S(h), v = p++;
      s(f, v, h), i[f] = v, u[v] = h, m[v] = d, c[v] = new RegExp(h, a ? "g" : void 0), l[v] = new RegExp(d, a ? "g" : void 0);
    };
    y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${$}*`), y("MAINVERSION", `(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${u[i.NUMERICIDENTIFIER]}|${u[i.NONNUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${u[i.NUMERICIDENTIFIERLOOSE]}|${u[i.NONNUMERICIDENTIFIER]})`), y("PRERELEASE", `(?:-(${u[i.PRERELEASEIDENTIFIER]}(?:\\.${u[i.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${u[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[i.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${$}+`), y("BUILD", `(?:\\+(${u[i.BUILDIDENTIFIER]}(?:\\.${u[i.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${u[i.MAINVERSION]}${u[i.PRERELEASE]}?${u[i.BUILD]}?`), y("FULL", `^${u[i.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${u[i.MAINVERSIONLOOSE]}${u[i.PRERELEASELOOSE]}?${u[i.BUILD]}?`), y("LOOSE", `^${u[i.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${u[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${u[i.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:${u[i.PRERELEASE]})?${u[i.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:${u[i.PRERELEASELOOSE]})?${u[i.BUILD]}?)?)?`), y("XRANGE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${u[i.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", u[i.COERCEPLAIN] + `(?:${u[i.PRERELEASE]})?(?:${u[i.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", u[i.COERCE], !0), y("COERCERTLFULL", u[i.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${u[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${u[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${u[i.LONECARET]}${u[i.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${u[i.LONECARET]}${u[i.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${u[i.GTLT]}\\s*(${u[i.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]}|${u[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${u[i.XRANGEPLAIN]})\\s+-\\s+(${u[i.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${u[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[i.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(yr, yr.exports)), yr.exports;
}
var en, Wa;
function Zn() {
  if (Wa) return en;
  Wa = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return en = (n) => n ? typeof n != "object" ? e : n : t, en;
}
var tn, xa;
function uo() {
  if (xa) return tn;
  xa = 1;
  const e = /^[0-9]+$/, t = (n, o) => {
    const s = e.test(n), c = e.test(o);
    return s && c && (n = +n, o = +o), n === o ? 0 : s && !c ? -1 : c && !s ? 1 : n < o ? -1 : 1;
  };
  return tn = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, o) => t(o, n)
  }, tn;
}
var rn, Ja;
function ye() {
  if (Ja) return rn;
  Ja = 1;
  const e = Tr(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = Or(), { safeRe: n, safeSrc: o, t: s } = $t(), c = Zn(), { compareIdentifiers: l } = uo();
  class u {
    constructor(i, p) {
      if (p = c(p), i instanceof u) {
        if (i.loose === !!p.loose && i.includePrerelease === !!p.includePrerelease)
          return i;
        i = i.version;
      } else if (typeof i != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof i}".`);
      if (i.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", i, p), this.options = p, this.loose = !!p.loose, this.includePrerelease = !!p.includePrerelease;
      const $ = i.trim().match(p.loose ? n[s.LOOSE] : n[s.FULL]);
      if (!$)
        throw new TypeError(`Invalid Version: ${i}`);
      if (this.raw = i, this.major = +$[1], this.minor = +$[2], this.patch = +$[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      $[4] ? this.prerelease = $[4].split(".").map((_) => {
        if (/^[0-9]+$/.test(_)) {
          const S = +_;
          if (S >= 0 && S < r)
            return S;
        }
        return _;
      }) : this.prerelease = [], this.build = $[5] ? $[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(i) {
      if (e("SemVer.compare", this.version, this.options, i), !(i instanceof u)) {
        if (typeof i == "string" && i === this.version)
          return 0;
        i = new u(i, this.options);
      }
      return i.version === this.version ? 0 : this.compareMain(i) || this.comparePre(i);
    }
    compareMain(i) {
      return i instanceof u || (i = new u(i, this.options)), l(this.major, i.major) || l(this.minor, i.minor) || l(this.patch, i.patch);
    }
    comparePre(i) {
      if (i instanceof u || (i = new u(i, this.options)), this.prerelease.length && !i.prerelease.length)
        return -1;
      if (!this.prerelease.length && i.prerelease.length)
        return 1;
      if (!this.prerelease.length && !i.prerelease.length)
        return 0;
      let p = 0;
      do {
        const $ = this.prerelease[p], _ = i.prerelease[p];
        if (e("prerelease compare", p, $, _), $ === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === _)
          continue;
        return l($, _);
      } while (++p);
    }
    compareBuild(i) {
      i instanceof u || (i = new u(i, this.options));
      let p = 0;
      do {
        const $ = this.build[p], _ = i.build[p];
        if (e("build compare", p, $, _), $ === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === _)
          continue;
        return l($, _);
      } while (++p);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(i, p, $) {
      if (i.startsWith("pre")) {
        if (!p && $ === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (p) {
          const _ = new RegExp(`^${this.options.loose ? o[s.PRERELEASELOOSE] : o[s.PRERELEASE]}$`), S = `-${p}`.match(_);
          if (!S || S[1] !== p)
            throw new Error(`invalid identifier: ${p}`);
        }
      }
      switch (i) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", p, $);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", p, $);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", p, $), this.inc("pre", p, $);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", p, $), this.inc("pre", p, $);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const _ = Number($) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [_];
          else {
            let S = this.prerelease.length;
            for (; --S >= 0; )
              typeof this.prerelease[S] == "number" && (this.prerelease[S]++, S = -2);
            if (S === -1) {
              if (p === this.prerelease.join(".") && $ === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(_);
            }
          }
          if (p) {
            let S = [p, _];
            $ === !1 && (S = [p]), l(this.prerelease[0], p) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = S) : this.prerelease = S;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${i}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return rn = u, rn;
}
var nn, Ya;
function at() {
  if (Ya) return nn;
  Ya = 1;
  const e = ye();
  return nn = (r, n, o = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, n);
    } catch (s) {
      if (!o)
        return null;
      throw s;
    }
  }, nn;
}
var sn, Za;
function kl() {
  if (Za) return sn;
  Za = 1;
  const e = at();
  return sn = (r, n) => {
    const o = e(r, n);
    return o ? o.version : null;
  }, sn;
}
var an, Qa;
function Dl() {
  if (Qa) return an;
  Qa = 1;
  const e = at();
  return an = (r, n) => {
    const o = e(r.trim().replace(/^[=v]+/, ""), n);
    return o ? o.version : null;
  }, an;
}
var on, ei;
function Ll() {
  if (ei) return on;
  ei = 1;
  const e = ye();
  return on = (r, n, o, s, c) => {
    typeof o == "string" && (c = s, s = o, o = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        o
      ).inc(n, s, c).version;
    } catch {
      return null;
    }
  }, on;
}
var cn, ti;
function Ml() {
  if (ti) return cn;
  ti = 1;
  const e = at();
  return cn = (r, n) => {
    const o = e(r, null, !0), s = e(n, null, !0), c = o.compare(s);
    if (c === 0)
      return null;
    const l = c > 0, u = l ? o : s, m = l ? s : o, i = !!u.prerelease.length;
    if (!!m.prerelease.length && !i) {
      if (!m.patch && !m.minor)
        return "major";
      if (m.compareMain(u) === 0)
        return m.minor && !m.patch ? "minor" : "patch";
    }
    const $ = i ? "pre" : "";
    return o.major !== s.major ? $ + "major" : o.minor !== s.minor ? $ + "minor" : o.patch !== s.patch ? $ + "patch" : "prerelease";
  }, cn;
}
var un, ri;
function Vl() {
  if (ri) return un;
  ri = 1;
  const e = ye();
  return un = (r, n) => new e(r, n).major, un;
}
var ln, ni;
function Fl() {
  if (ni) return ln;
  ni = 1;
  const e = ye();
  return ln = (r, n) => new e(r, n).minor, ln;
}
var fn, si;
function zl() {
  if (si) return fn;
  si = 1;
  const e = ye();
  return fn = (r, n) => new e(r, n).patch, fn;
}
var dn, ai;
function Ul() {
  if (ai) return dn;
  ai = 1;
  const e = at();
  return dn = (r, n) => {
    const o = e(r, n);
    return o && o.prerelease.length ? o.prerelease : null;
  }, dn;
}
var hn, ii;
function je() {
  if (ii) return hn;
  ii = 1;
  const e = ye();
  return hn = (r, n, o) => new e(r, o).compare(new e(n, o)), hn;
}
var mn, oi;
function Gl() {
  if (oi) return mn;
  oi = 1;
  const e = je();
  return mn = (r, n, o) => e(n, r, o), mn;
}
var pn, ci;
function Kl() {
  if (ci) return pn;
  ci = 1;
  const e = je();
  return pn = (r, n) => e(r, n, !0), pn;
}
var yn, ui;
function Qn() {
  if (ui) return yn;
  ui = 1;
  const e = ye();
  return yn = (r, n, o) => {
    const s = new e(r, o), c = new e(n, o);
    return s.compare(c) || s.compareBuild(c);
  }, yn;
}
var $n, li;
function Hl() {
  if (li) return $n;
  li = 1;
  const e = Qn();
  return $n = (r, n) => r.sort((o, s) => e(o, s, n)), $n;
}
var gn, fi;
function Xl() {
  if (fi) return gn;
  fi = 1;
  const e = Qn();
  return gn = (r, n) => r.sort((o, s) => e(s, o, n)), gn;
}
var vn, di;
function jr() {
  if (di) return vn;
  di = 1;
  const e = je();
  return vn = (r, n, o) => e(r, n, o) > 0, vn;
}
var _n, hi;
function es() {
  if (hi) return _n;
  hi = 1;
  const e = je();
  return _n = (r, n, o) => e(r, n, o) < 0, _n;
}
var En, mi;
function lo() {
  if (mi) return En;
  mi = 1;
  const e = je();
  return En = (r, n, o) => e(r, n, o) === 0, En;
}
var wn, pi;
function fo() {
  if (pi) return wn;
  pi = 1;
  const e = je();
  return wn = (r, n, o) => e(r, n, o) !== 0, wn;
}
var Sn, yi;
function ts() {
  if (yi) return Sn;
  yi = 1;
  const e = je();
  return Sn = (r, n, o) => e(r, n, o) >= 0, Sn;
}
var bn, $i;
function rs() {
  if ($i) return bn;
  $i = 1;
  const e = je();
  return bn = (r, n, o) => e(r, n, o) <= 0, bn;
}
var Rn, gi;
function ho() {
  if (gi) return Rn;
  gi = 1;
  const e = lo(), t = fo(), r = jr(), n = ts(), o = es(), s = rs();
  return Rn = (l, u, m, i) => {
    switch (u) {
      case "===":
        return typeof l == "object" && (l = l.version), typeof m == "object" && (m = m.version), l === m;
      case "!==":
        return typeof l == "object" && (l = l.version), typeof m == "object" && (m = m.version), l !== m;
      case "":
      case "=":
      case "==":
        return e(l, m, i);
      case "!=":
        return t(l, m, i);
      case ">":
        return r(l, m, i);
      case ">=":
        return n(l, m, i);
      case "<":
        return o(l, m, i);
      case "<=":
        return s(l, m, i);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, Rn;
}
var Pn, vi;
function Bl() {
  if (vi) return Pn;
  vi = 1;
  const e = ye(), t = at(), { safeRe: r, t: n } = $t();
  return Pn = (s, c) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    c = c || {};
    let l = null;
    if (!c.rtl)
      l = s.match(c.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const _ = c.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let S;
      for (; (S = _.exec(s)) && (!l || l.index + l[0].length !== s.length); )
        (!l || S.index + S[0].length !== l.index + l[0].length) && (l = S), _.lastIndex = S.index + S[1].length + S[2].length;
      _.lastIndex = -1;
    }
    if (l === null)
      return null;
    const u = l[2], m = l[3] || "0", i = l[4] || "0", p = c.includePrerelease && l[5] ? `-${l[5]}` : "", $ = c.includePrerelease && l[6] ? `+${l[6]}` : "";
    return t(`${u}.${m}.${i}${p}${$}`, c);
  }, Pn;
}
var In, _i;
function Wl() {
  if (_i) return In;
  _i = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return In = e, In;
}
var Nn, Ei;
function Ae() {
  if (Ei) return Nn;
  Ei = 1;
  const e = /\s+/g;
  class t {
    constructor(D, X) {
      if (X = o(X), D instanceof t)
        return D.loose === !!X.loose && D.includePrerelease === !!X.includePrerelease ? D : new t(D.raw, X);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = X, this.loose = !!X.loose, this.includePrerelease = !!X.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((G) => this.parseRange(G.trim())).filter((G) => G.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const G = this.set[0];
        if (this.set = this.set.filter((z) => !y(z[0])), this.set.length === 0)
          this.set = [G];
        else if (this.set.length > 1) {
          for (const z of this.set)
            if (z.length === 1 && f(z[0])) {
              this.set = [z];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const X = this.set[D];
          for (let G = 0; G < X.length; G++)
            G > 0 && (this.formatted += " "), this.formatted += X[G].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(D) {
      const G = ((this.options.includePrerelease && _) | (this.options.loose && S)) + ":" + D, z = n.get(G);
      if (z)
        return z;
      const H = this.options.loose, A = H ? u[m.HYPHENRANGELOOSE] : u[m.HYPHENRANGE];
      D = D.replace(A, F(this.options.includePrerelease)), c("hyphen replace", D), D = D.replace(u[m.COMPARATORTRIM], i), c("comparator trim", D), D = D.replace(u[m.TILDETRIM], p), c("tilde trim", D), D = D.replace(u[m.CARETTRIM], $), c("caret trim", D);
      let P = D.split(" ").map((R) => a(R, this.options)).join(" ").split(/\s+/).map((R) => k(R, this.options));
      H && (P = P.filter((R) => (c("loose invalid filter", R, this.options), !!R.match(u[m.COMPARATORLOOSE])))), c("range list", P);
      const j = /* @__PURE__ */ new Map(), N = P.map((R) => new s(R, this.options));
      for (const R of N) {
        if (y(R))
          return [R];
        j.set(R.value, R);
      }
      j.size > 1 && j.has("") && j.delete("");
      const g = [...j.values()];
      return n.set(G, g), g;
    }
    intersects(D, X) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((G) => h(G, X) && D.set.some((z) => h(z, X) && G.every((H) => z.every((A) => H.intersects(A, X)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new l(D, this.options);
        } catch {
          return !1;
        }
      for (let X = 0; X < this.set.length; X++)
        if (U(this.set[X], D, this.options))
          return !0;
      return !1;
    }
  }
  Nn = t;
  const r = Wl(), n = new r(), o = Zn(), s = Ar(), c = Tr(), l = ye(), {
    safeRe: u,
    t: m,
    comparatorTrimReplace: i,
    tildeTrimReplace: p,
    caretTrimReplace: $
  } = $t(), { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: S } = Or(), y = (q) => q.value === "<0.0.0-0", f = (q) => q.value === "", h = (q, D) => {
    let X = !0;
    const G = q.slice();
    let z = G.pop();
    for (; X && G.length; )
      X = G.every((H) => z.intersects(H, D)), z = G.pop();
    return X;
  }, a = (q, D) => (c("comp", q, D), q = E(q, D), c("caret", q), q = v(q, D), c("tildes", q), q = I(q, D), c("xrange", q), q = K(q, D), c("stars", q), q), d = (q) => !q || q.toLowerCase() === "x" || q === "*", v = (q, D) => q.trim().split(/\s+/).map((X) => w(X, D)).join(" "), w = (q, D) => {
    const X = D.loose ? u[m.TILDELOOSE] : u[m.TILDE];
    return q.replace(X, (G, z, H, A, P) => {
      c("tilde", q, G, z, H, A, P);
      let j;
      return d(z) ? j = "" : d(H) ? j = `>=${z}.0.0 <${+z + 1}.0.0-0` : d(A) ? j = `>=${z}.${H}.0 <${z}.${+H + 1}.0-0` : P ? (c("replaceTilde pr", P), j = `>=${z}.${H}.${A}-${P} <${z}.${+H + 1}.0-0`) : j = `>=${z}.${H}.${A} <${z}.${+H + 1}.0-0`, c("tilde return", j), j;
    });
  }, E = (q, D) => q.trim().split(/\s+/).map((X) => b(X, D)).join(" "), b = (q, D) => {
    c("caret", q, D);
    const X = D.loose ? u[m.CARETLOOSE] : u[m.CARET], G = D.includePrerelease ? "-0" : "";
    return q.replace(X, (z, H, A, P, j) => {
      c("caret", q, z, H, A, P, j);
      let N;
      return d(H) ? N = "" : d(A) ? N = `>=${H}.0.0${G} <${+H + 1}.0.0-0` : d(P) ? H === "0" ? N = `>=${H}.${A}.0${G} <${H}.${+A + 1}.0-0` : N = `>=${H}.${A}.0${G} <${+H + 1}.0.0-0` : j ? (c("replaceCaret pr", j), H === "0" ? A === "0" ? N = `>=${H}.${A}.${P}-${j} <${H}.${A}.${+P + 1}-0` : N = `>=${H}.${A}.${P}-${j} <${H}.${+A + 1}.0-0` : N = `>=${H}.${A}.${P}-${j} <${+H + 1}.0.0-0`) : (c("no pr"), H === "0" ? A === "0" ? N = `>=${H}.${A}.${P}${G} <${H}.${A}.${+P + 1}-0` : N = `>=${H}.${A}.${P}${G} <${H}.${+A + 1}.0-0` : N = `>=${H}.${A}.${P} <${+H + 1}.0.0-0`), c("caret return", N), N;
    });
  }, I = (q, D) => (c("replaceXRanges", q, D), q.split(/\s+/).map((X) => M(X, D)).join(" ")), M = (q, D) => {
    q = q.trim();
    const X = D.loose ? u[m.XRANGELOOSE] : u[m.XRANGE];
    return q.replace(X, (G, z, H, A, P, j) => {
      c("xRange", q, G, z, H, A, P, j);
      const N = d(H), g = N || d(A), R = g || d(P), C = R;
      return z === "=" && C && (z = ""), j = D.includePrerelease ? "-0" : "", N ? z === ">" || z === "<" ? G = "<0.0.0-0" : G = "*" : z && C ? (g && (A = 0), P = 0, z === ">" ? (z = ">=", g ? (H = +H + 1, A = 0, P = 0) : (A = +A + 1, P = 0)) : z === "<=" && (z = "<", g ? H = +H + 1 : A = +A + 1), z === "<" && (j = "-0"), G = `${z + H}.${A}.${P}${j}`) : g ? G = `>=${H}.0.0${j} <${+H + 1}.0.0-0` : R && (G = `>=${H}.${A}.0${j} <${H}.${+A + 1}.0-0`), c("xRange return", G), G;
    });
  }, K = (q, D) => (c("replaceStars", q, D), q.trim().replace(u[m.STAR], "")), k = (q, D) => (c("replaceGTE0", q, D), q.trim().replace(u[D.includePrerelease ? m.GTE0PRE : m.GTE0], "")), F = (q) => (D, X, G, z, H, A, P, j, N, g, R, C) => (d(G) ? X = "" : d(z) ? X = `>=${G}.0.0${q ? "-0" : ""}` : d(H) ? X = `>=${G}.${z}.0${q ? "-0" : ""}` : A ? X = `>=${X}` : X = `>=${X}${q ? "-0" : ""}`, d(N) ? j = "" : d(g) ? j = `<${+N + 1}.0.0-0` : d(R) ? j = `<${N}.${+g + 1}.0-0` : C ? j = `<=${N}.${g}.${R}-${C}` : q ? j = `<${N}.${g}.${+R + 1}-0` : j = `<=${j}`, `${X} ${j}`.trim()), U = (q, D, X) => {
    for (let G = 0; G < q.length; G++)
      if (!q[G].test(D))
        return !1;
    if (D.prerelease.length && !X.includePrerelease) {
      for (let G = 0; G < q.length; G++)
        if (c(q[G].semver), q[G].semver !== s.ANY && q[G].semver.prerelease.length > 0) {
          const z = q[G].semver;
          if (z.major === D.major && z.minor === D.minor && z.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Nn;
}
var On, wi;
function Ar() {
  if (wi) return On;
  wi = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(i, p) {
      if (p = r(p), i instanceof t) {
        if (i.loose === !!p.loose)
          return i;
        i = i.value;
      }
      i = i.trim().split(/\s+/).join(" "), c("comparator", i, p), this.options = p, this.loose = !!p.loose, this.parse(i), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, c("comp", this);
    }
    parse(i) {
      const p = this.options.loose ? n[o.COMPARATORLOOSE] : n[o.COMPARATOR], $ = i.match(p);
      if (!$)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = $[1] !== void 0 ? $[1] : "", this.operator === "=" && (this.operator = ""), $[2] ? this.semver = new l($[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(i) {
      if (c("Comparator.test", i, this.options.loose), this.semver === e || i === e)
        return !0;
      if (typeof i == "string")
        try {
          i = new l(i, this.options);
        } catch {
          return !1;
        }
      return s(i, this.operator, this.semver, this.options);
    }
    intersects(i, p) {
      if (!(i instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(i.value, p).test(this.value) : i.operator === "" ? i.value === "" ? !0 : new u(this.value, p).test(i.semver) : (p = r(p), p.includePrerelease && (this.value === "<0.0.0-0" || i.value === "<0.0.0-0") || !p.includePrerelease && (this.value.startsWith("<0.0.0") || i.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && i.operator.startsWith(">") || this.operator.startsWith("<") && i.operator.startsWith("<") || this.semver.version === i.semver.version && this.operator.includes("=") && i.operator.includes("=") || s(this.semver, "<", i.semver, p) && this.operator.startsWith(">") && i.operator.startsWith("<") || s(this.semver, ">", i.semver, p) && this.operator.startsWith("<") && i.operator.startsWith(">")));
    }
  }
  On = t;
  const r = Zn(), { safeRe: n, t: o } = $t(), s = ho(), c = Tr(), l = ye(), u = Ae();
  return On;
}
var Tn, Si;
function qr() {
  if (Si) return Tn;
  Si = 1;
  const e = Ae();
  return Tn = (r, n, o) => {
    try {
      n = new e(n, o);
    } catch {
      return !1;
    }
    return n.test(r);
  }, Tn;
}
var jn, bi;
function xl() {
  if (bi) return jn;
  bi = 1;
  const e = Ae();
  return jn = (r, n) => new e(r, n).set.map((o) => o.map((s) => s.value).join(" ").trim().split(" ")), jn;
}
var An, Ri;
function Jl() {
  if (Ri) return An;
  Ri = 1;
  const e = ye(), t = Ae();
  return An = (n, o, s) => {
    let c = null, l = null, u = null;
    try {
      u = new t(o, s);
    } catch {
      return null;
    }
    return n.forEach((m) => {
      u.test(m) && (!c || l.compare(m) === -1) && (c = m, l = new e(c, s));
    }), c;
  }, An;
}
var qn, Pi;
function Yl() {
  if (Pi) return qn;
  Pi = 1;
  const e = ye(), t = Ae();
  return qn = (n, o, s) => {
    let c = null, l = null, u = null;
    try {
      u = new t(o, s);
    } catch {
      return null;
    }
    return n.forEach((m) => {
      u.test(m) && (!c || l.compare(m) === 1) && (c = m, l = new e(c, s));
    }), c;
  }, qn;
}
var Cn, Ii;
function Zl() {
  if (Ii) return Cn;
  Ii = 1;
  const e = ye(), t = Ae(), r = jr();
  return Cn = (o, s) => {
    o = new t(o, s);
    let c = new e("0.0.0");
    if (o.test(c) || (c = new e("0.0.0-0"), o.test(c)))
      return c;
    c = null;
    for (let l = 0; l < o.set.length; ++l) {
      const u = o.set[l];
      let m = null;
      u.forEach((i) => {
        const p = new e(i.semver.version);
        switch (i.operator) {
          case ">":
            p.prerelease.length === 0 ? p.patch++ : p.prerelease.push(0), p.raw = p.format();
          /* fallthrough */
          case "":
          case ">=":
            (!m || r(p, m)) && (m = p);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${i.operator}`);
        }
      }), m && (!c || r(c, m)) && (c = m);
    }
    return c && o.test(c) ? c : null;
  }, Cn;
}
var kn, Ni;
function Ql() {
  if (Ni) return kn;
  Ni = 1;
  const e = Ae();
  return kn = (r, n) => {
    try {
      return new e(r, n).range || "*";
    } catch {
      return null;
    }
  }, kn;
}
var Dn, Oi;
function ns() {
  if (Oi) return Dn;
  Oi = 1;
  const e = ye(), t = Ar(), { ANY: r } = t, n = Ae(), o = qr(), s = jr(), c = es(), l = rs(), u = ts();
  return Dn = (i, p, $, _) => {
    i = new e(i, _), p = new n(p, _);
    let S, y, f, h, a;
    switch ($) {
      case ">":
        S = s, y = l, f = c, h = ">", a = ">=";
        break;
      case "<":
        S = c, y = u, f = s, h = "<", a = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (o(i, p, _))
      return !1;
    for (let d = 0; d < p.set.length; ++d) {
      const v = p.set[d];
      let w = null, E = null;
      if (v.forEach((b) => {
        b.semver === r && (b = new t(">=0.0.0")), w = w || b, E = E || b, S(b.semver, w.semver, _) ? w = b : f(b.semver, E.semver, _) && (E = b);
      }), w.operator === h || w.operator === a || (!E.operator || E.operator === h) && y(i, E.semver))
        return !1;
      if (E.operator === a && f(i, E.semver))
        return !1;
    }
    return !0;
  }, Dn;
}
var Ln, Ti;
function ef() {
  if (Ti) return Ln;
  Ti = 1;
  const e = ns();
  return Ln = (r, n, o) => e(r, n, ">", o), Ln;
}
var Mn, ji;
function tf() {
  if (ji) return Mn;
  ji = 1;
  const e = ns();
  return Mn = (r, n, o) => e(r, n, "<", o), Mn;
}
var Vn, Ai;
function rf() {
  if (Ai) return Vn;
  Ai = 1;
  const e = Ae();
  return Vn = (r, n, o) => (r = new e(r, o), n = new e(n, o), r.intersects(n, o)), Vn;
}
var Fn, qi;
function nf() {
  if (qi) return Fn;
  qi = 1;
  const e = qr(), t = je();
  return Fn = (r, n, o) => {
    const s = [];
    let c = null, l = null;
    const u = r.sort(($, _) => t($, _, o));
    for (const $ of u)
      e($, n, o) ? (l = $, c || (c = $)) : (l && s.push([c, l]), l = null, c = null);
    c && s.push([c, null]);
    const m = [];
    for (const [$, _] of s)
      $ === _ ? m.push($) : !_ && $ === u[0] ? m.push("*") : _ ? $ === u[0] ? m.push(`<=${_}`) : m.push(`${$} - ${_}`) : m.push(`>=${$}`);
    const i = m.join(" || "), p = typeof n.raw == "string" ? n.raw : String(n);
    return i.length < p.length ? i : n;
  }, Fn;
}
var zn, Ci;
function sf() {
  if (Ci) return zn;
  Ci = 1;
  const e = Ae(), t = Ar(), { ANY: r } = t, n = qr(), o = je(), s = (p, $, _ = {}) => {
    if (p === $)
      return !0;
    p = new e(p, _), $ = new e($, _);
    let S = !1;
    e: for (const y of p.set) {
      for (const f of $.set) {
        const h = u(y, f, _);
        if (S = S || h !== null, h)
          continue e;
      }
      if (S)
        return !1;
    }
    return !0;
  }, c = [new t(">=0.0.0-0")], l = [new t(">=0.0.0")], u = (p, $, _) => {
    if (p === $)
      return !0;
    if (p.length === 1 && p[0].semver === r) {
      if ($.length === 1 && $[0].semver === r)
        return !0;
      _.includePrerelease ? p = c : p = l;
    }
    if ($.length === 1 && $[0].semver === r) {
      if (_.includePrerelease)
        return !0;
      $ = l;
    }
    const S = /* @__PURE__ */ new Set();
    let y, f;
    for (const I of p)
      I.operator === ">" || I.operator === ">=" ? y = m(y, I, _) : I.operator === "<" || I.operator === "<=" ? f = i(f, I, _) : S.add(I.semver);
    if (S.size > 1)
      return null;
    let h;
    if (y && f) {
      if (h = o(y.semver, f.semver, _), h > 0)
        return null;
      if (h === 0 && (y.operator !== ">=" || f.operator !== "<="))
        return null;
    }
    for (const I of S) {
      if (y && !n(I, String(y), _) || f && !n(I, String(f), _))
        return null;
      for (const M of $)
        if (!n(I, String(M), _))
          return !1;
      return !0;
    }
    let a, d, v, w, E = f && !_.includePrerelease && f.semver.prerelease.length ? f.semver : !1, b = y && !_.includePrerelease && y.semver.prerelease.length ? y.semver : !1;
    E && E.prerelease.length === 1 && f.operator === "<" && E.prerelease[0] === 0 && (E = !1);
    for (const I of $) {
      if (w = w || I.operator === ">" || I.operator === ">=", v = v || I.operator === "<" || I.operator === "<=", y) {
        if (b && I.semver.prerelease && I.semver.prerelease.length && I.semver.major === b.major && I.semver.minor === b.minor && I.semver.patch === b.patch && (b = !1), I.operator === ">" || I.operator === ">=") {
          if (a = m(y, I, _), a === I && a !== y)
            return !1;
        } else if (y.operator === ">=" && !n(y.semver, String(I), _))
          return !1;
      }
      if (f) {
        if (E && I.semver.prerelease && I.semver.prerelease.length && I.semver.major === E.major && I.semver.minor === E.minor && I.semver.patch === E.patch && (E = !1), I.operator === "<" || I.operator === "<=") {
          if (d = i(f, I, _), d === I && d !== f)
            return !1;
        } else if (f.operator === "<=" && !n(f.semver, String(I), _))
          return !1;
      }
      if (!I.operator && (f || y) && h !== 0)
        return !1;
    }
    return !(y && v && !f && h !== 0 || f && w && !y && h !== 0 || b || E);
  }, m = (p, $, _) => {
    if (!p)
      return $;
    const S = o(p.semver, $.semver, _);
    return S > 0 ? p : S < 0 || $.operator === ">" && p.operator === ">=" ? $ : p;
  }, i = (p, $, _) => {
    if (!p)
      return $;
    const S = o(p.semver, $.semver, _);
    return S < 0 ? p : S > 0 || $.operator === "<" && p.operator === "<=" ? $ : p;
  };
  return zn = s, zn;
}
var Un, ki;
function af() {
  if (ki) return Un;
  ki = 1;
  const e = $t(), t = Or(), r = ye(), n = uo(), o = at(), s = kl(), c = Dl(), l = Ll(), u = Ml(), m = Vl(), i = Fl(), p = zl(), $ = Ul(), _ = je(), S = Gl(), y = Kl(), f = Qn(), h = Hl(), a = Xl(), d = jr(), v = es(), w = lo(), E = fo(), b = ts(), I = rs(), M = ho(), K = Bl(), k = Ar(), F = Ae(), U = qr(), q = xl(), D = Jl(), X = Yl(), G = Zl(), z = Ql(), H = ns(), A = ef(), P = tf(), j = rf(), N = nf(), g = sf();
  return Un = {
    parse: o,
    valid: s,
    clean: c,
    inc: l,
    diff: u,
    major: m,
    minor: i,
    patch: p,
    prerelease: $,
    compare: _,
    rcompare: S,
    compareLoose: y,
    compareBuild: f,
    sort: h,
    rsort: a,
    gt: d,
    lt: v,
    eq: w,
    neq: E,
    gte: b,
    lte: I,
    cmp: M,
    coerce: K,
    Comparator: k,
    Range: F,
    satisfies: U,
    toComparators: q,
    maxSatisfying: D,
    minSatisfying: X,
    minVersion: G,
    validRange: z,
    outside: H,
    gtr: A,
    ltr: P,
    intersects: j,
    simplifyRange: N,
    subset: g,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, Un;
}
var of = af();
const rt = /* @__PURE__ */ Bi(of), cf = Object.prototype.toString, uf = "[object Uint8Array]", lf = "[object ArrayBuffer]";
function mo(e, t, r) {
  return e ? e.constructor === t ? !0 : cf.call(e) === r : !1;
}
function po(e) {
  return mo(e, Uint8Array, uf);
}
function ff(e) {
  return mo(e, ArrayBuffer, lf);
}
function df(e) {
  return po(e) || ff(e);
}
function hf(e) {
  if (!po(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function mf(e) {
  if (!df(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Di(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((o, s) => o + s.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const o of e)
    hf(o), r.set(o, n), n += o.length;
  return r;
}
const $r = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Li(e, t = "utf8") {
  return mf(e), $r[t] ?? ($r[t] = new globalThis.TextDecoder(t)), $r[t].decode(e);
}
function pf(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const yf = new globalThis.TextEncoder();
function Gn(e) {
  return pf(e), yf.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const $f = Pl.default, Mi = "aes-256-cbc", nt = () => /* @__PURE__ */ Object.create(null), gf = (e) => e != null, vf = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, gr = "__internal__", Kn = `${gr}.migrations.version`;
var He, Le, Ee, Me;
class _f {
  constructor(t = {}) {
    ot(this, "path");
    ot(this, "events");
    ct(this, He);
    ct(this, Le);
    ct(this, Ee);
    ct(this, Me, {});
    ot(this, "_deserialize", (t) => JSON.parse(t));
    ot(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Ao(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (ut(this, Ee, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const c = new dl.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      $f(c);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      ut(this, He, c.compile(l));
      for (const [u, m] of Object.entries(r.schema ?? {}))
        m != null && m.default && (ae(this, Me)[u] = m.default);
    }
    r.defaults && ut(this, Me, {
      ...ae(this, Me),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), ut(this, Le, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = se.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const o = this.store, s = Object.assign(nt(), r.defaults, o);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(s);
    try {
      bo.deepEqual(o, s);
    } catch {
      this.store = s;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (ae(this, Ee).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${gr} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, o = (s, c) => {
      vf(s, c), ae(this, Ee).accessPropertiesByDotNotation ? cs(n, s, c) : n[s] = c;
    };
    if (typeof t == "object") {
      const s = t;
      for (const [c, l] of Object.entries(s))
        o(c, l);
    } else
      o(t, r);
    this.store = n;
  }
  /**
      Check if an item exists.
  
      @param key - The key of the item to check.
      */
  has(t) {
    return ae(this, Ee).accessPropertiesByDotNotation ? No(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      gf(ae(this, Me)[r]) && this.set(r, ae(this, Me)[r]);
  }
  delete(t) {
    const { store: r } = this;
    ae(this, Ee).accessPropertiesByDotNotation ? Io(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = nt();
    for (const t of Object.keys(ae(this, Me)))
      this.reset(t);
  }
  /**
      Watches the given `key`, calling `callback` on any changes.
  
      @param key - The key to watch.
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  get store() {
    try {
      const t = Y.readFileSync(this.path, ae(this, Le) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(nt(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), nt();
      if (ae(this, Ee).clearInvalidConfig && t.name === "SyntaxError")
        return nt();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      yield [t, r];
  }
  _encryptData(t) {
    if (!ae(this, Le))
      return typeof t == "string" ? t : Li(t);
    try {
      const r = t.slice(0, 16), n = lt.pbkdf2Sync(ae(this, Le), r.toString(), 1e4, 32, "sha512"), o = lt.createDecipheriv(Mi, n, r), s = t.slice(17), c = typeof s == "string" ? Gn(s) : s;
      return Li(Di([o.update(c), o.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const o = () => {
      const s = n, c = t();
      So(c, s) || (n = c, r.call(this, c, s));
    };
    return this.events.addEventListener("change", o), () => {
      this.events.removeEventListener("change", o);
    };
  }
  _validate(t) {
    if (!ae(this, He) || ae(this, He).call(this, t) || !ae(this, He).errors)
      return;
    const n = ae(this, He).errors.map(({ instancePath: o, message: s = "" }) => `\`${o.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Y.mkdirSync(se.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (ae(this, Le)) {
      const n = lt.randomBytes(16), o = lt.pbkdf2Sync(ae(this, Le), n.toString(), 1e4, 32, "sha512"), s = lt.createCipheriv(Mi, o, n);
      r = Di([n, Gn(":"), s.update(Gn(r)), s.final()]);
    }
    if (ce.env.SNAP)
      Y.writeFileSync(this.path, r, { mode: ae(this, Ee).configFileMode });
    else
      try {
        Xi(this.path, r, { mode: ae(this, Ee).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          Y.writeFileSync(this.path, r, { mode: ae(this, Ee).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), Y.existsSync(this.path) || this._write(nt()), ce.platform === "win32" ? Y.watch(this.path, { persistent: !1 }, Ka(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : Y.watchFile(this.path, { persistent: !1 }, Ka(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let o = this._get(Kn, "0.0.0");
    const s = Object.keys(t).filter((l) => this._shouldPerformMigration(l, o, r));
    let c = { ...this.store };
    for (const l of s)
      try {
        n && n(this, {
          fromVersion: o,
          toVersion: l,
          finalVersion: r,
          versions: s
        });
        const u = t[l];
        u == null || u(this), this._set(Kn, l), o = l, c = { ...this.store };
      } catch (u) {
        throw this.store = c, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(o) || !rt.eq(o, r)) && this._set(Kn, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === gr ? !0 : typeof t != "string" ? !1 : ae(this, Ee).accessPropertiesByDotNotation ? !!t.startsWith(`${gr}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return rt.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && rt.satisfies(r, t) ? !1 : rt.satisfies(n, t) : !(rt.lte(t, r) || rt.gt(t, n));
  }
  _get(t, r) {
    return Po(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    cs(n, t, r), this.store = n;
  }
}
He = new WeakMap(), Le = new WeakMap(), Ee = new WeakMap(), Me = new WeakMap();
const { app: vr, ipcMain: Hn, shell: Ef } = wr;
let Vi = !1;
const Fi = () => {
  if (!Hn || !vr)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: vr.getPath("userData"),
    appVersion: vr.getVersion()
  };
  return Vi || (Hn.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Vi = !0), e;
};
class yo extends _f {
  constructor(t) {
    let r, n;
    if (ce.type === "renderer") {
      const o = wr.ipcRenderer.sendSync("electron-store-get-data");
      if (!o)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = o);
    } else Hn && vr && ({ defaultCwd: r, appVersion: n } = Fi());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = se.isAbsolute(t.cwd) ? t.cwd : se.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Fi();
  }
  async openInEditor() {
    const t = await Ef.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
if (typeof wr == "string")
  throw new TypeError("Not running in an Electron environment!");
const { env: $o } = process, wf = "ELECTRON_IS_DEV" in $o, Sf = Number.parseInt($o.ELECTRON_IS_DEV, 10) === 1, bf = wf ? Sf : !wr.app.isPackaged;
let oe = new yo({
  name: "children-rewards-data",
  fileExtension: "json",
  cwd: Xe.getPath("userData")
  // 初始时使用默认的userData目录
});
const go = () => oe.get("dataDir") || Xe.getPath("userData"), Rf = () => Se.join(go(), "images");
let Ve = Rf();
Xe.whenReady().then(() => {
  Ie.mkdirSync(Ve, {
    recursive: !0,
    mode: 493
    // 设置目录权限为rwxr-xr-x
  });
});
Ne.handle("set-data-dir", async (e, t) => {
  try {
    await Ie.promises.mkdir(t, { recursive: !0 }), oe.set("dataDir", t);
    const r = Se.join(t, "images");
    if (await Ie.promises.mkdir(r, { recursive: !0 }), Ve !== r && Ie.existsSync(Ve)) {
      const s = await Ie.promises.readdir(Ve);
      for (const c of s) {
        const l = Se.join(Ve, c), u = Se.join(r, c);
        await Ie.promises.copyFile(l, u);
      }
    }
    Ve = r;
    const n = new yo({
      name: "children-rewards-data",
      fileExtension: "json",
      cwd: t
    }), o = {
      children: oe.get("children", []),
      rewards: oe.get("rewards", [])
    };
    return oe = n, oe.set("children", o.children), oe.set("rewards", o.rewards), { success: !0 };
  } catch (r) {
    return console.error("设置数据目录失败:", r), { success: !1, error: String(r) };
  }
});
Ne.handle("get-data-dir", () => go());
const Pf = wo(import.meta.url), zi = Se.dirname(Pf);
let we = null;
function Ui() {
  we = new Gi({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: Se.join(zi, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), bf ? (we.loadURL("http://localhost:5173"), we.webContents.openDevTools()) : we.loadFile(Se.join(zi, "../dist/index.html")), we.on("closed", () => {
    we = null;
  });
}
Xe.whenReady().then(() => {
  Ui(), Xe.on("activate", () => {
    Gi.getAllWindows().length === 0 && Ui();
  });
});
Xe.on("window-all-closed", () => {
  process.platform !== "darwin" && Xe.quit();
});
Ne.handle("save-children", (e, t) => (oe.set("children", t), { success: !0 }));
Ne.handle("get-children", () => oe.get("children", []));
Ne.handle("save-rewards", (e, t) => (oe.set("rewards", t), { success: !0 }));
Ne.handle("get-rewards", () => oe.get("rewards", []));
Ne.handle("save-image", async (e, { imageData: t, fileName: r, date: n, subDir: o }) => {
  try {
    const s = t.replace(/^data:image\/\w+;base64,/, ""), c = Buffer.from(s, "base64");
    let l;
    if (o)
      l = Se.join(Ve, o);
    else if (n) {
      const [m, i, p] = n.split("-");
      l = Se.join(Ve, m, i, p);
    } else
      l = Ve;
    await Ie.promises.mkdir(l, { recursive: !0 });
    const u = Se.join(l, r);
    return await Ie.promises.writeFile(u, c), { success: !0, path: u };
  } catch (s) {
    return console.error("保存图片失败:", s), { success: !1, error: String(s) };
  }
});
Ne.handle("select-image", async () => {
  try {
    const e = await mt.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] }]
    });
    if (e.canceled) return { canceled: !0 };
    const t = e.filePaths[0], r = Se.basename(t), n = await Ie.promises.readFile(t);
    return {
      canceled: !1,
      imageData: `data:image/${Se.extname(t).slice(1)};base64,${n.toString("base64")}`,
      fileName: r
    };
  } catch (e) {
    return console.error("文件操作失败:", e), {
      error: e instanceof Error ? e.message : "未知错误",
      canceled: !0
    };
  }
});
Ne.handle("export-data", async () => {
  if (!we) return { success: !1, error: "窗口未创建" };
  const e = await mt.showSaveDialog(we, {
    title: "导出数据",
    defaultPath: Se.join(
      Xe.getPath("documents"),
      "children-rewards-data.json"
    ),
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (e.canceled || !e.filePath)
    return { success: !1, canceled: !0 };
  try {
    const t = {
      children: oe.get("children", []),
      rewards: oe.get("rewards", [])
    };
    return Ie.writeFileSync(e.filePath, JSON.stringify(t, null, 2)), { success: !0 };
  } catch (t) {
    return console.error("导出数据失败:", t), { success: !1, error: String(t) };
  }
});
Ne.handle("import-data", async () => {
  if (!we) return { success: !1, error: "窗口未创建" };
  const e = await mt.showOpenDialog(we, {
    title: "导入数据",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (e.canceled || e.filePaths.length === 0)
    return { success: !1, canceled: !0 };
  try {
    const t = e.filePaths[0];
    if (!t.toLowerCase().endsWith(".json"))
      return { success: !1, error: "只能导入JSON格式的文件" };
    const r = Ie.readFileSync(t, "utf8");
    let n;
    try {
      n = JSON.parse(r);
    } catch (m) {
      return console.error("JSON解析失败:", m), { success: !1, error: "文件内容不是有效的JSON格式" };
    }
    if (!n || typeof n != "object")
      return console.error("无效的数据格式: 不是对象"), { success: !1, error: "导入的数据格式不正确" };
    if (!Array.isArray(n.children))
      return console.error("无效的children数据:", n.children), { success: !1, error: "导入的children数据格式不正确" };
    if (!Array.isArray(n.rewards))
      return console.error("无效的rewards数据:", n.rewards), { success: !1, error: "导入的rewards数据格式不正确" };
    n.children.length === 0 && n.rewards.length === 0 && console.warn("警告：导入的数据为空");
    const o = await mt.showMessageBox(we, {
      type: "question",
      title: "导入选项",
      message: "您想要如何处理现有数据？",
      buttons: ["合并数据", "替换数据"],
      defaultId: 0,
      cancelId: 1,
      detail: `合并数据：保留现有数据，并添加新数据
替换数据：删除现有数据，仅保留导入的新数据`
    }), s = oe.get("children", []), c = oe.get("rewards", []);
    if (o.response === 0) {
      const m = [...s, ...n.children.filter(
        (p) => !s.some(($) => $.id === p.id)
      )], i = [...c, ...n.rewards.filter(
        (p) => !c.some(($) => $.id === p.id)
      )];
      oe.set("children", m), oe.set("rewards", i);
    } else
      oe.set("children", n.children), oe.set("rewards", n.rewards);
    const l = oe.get("children", []), u = oe.get("rewards", []);
    return l.length === 0 && u.length === 0 && console.warn("警告：保存后的数据为空"), { success: !0 };
  } catch (t) {
    return console.error("导入数据失败:", t), { success: !1, error: String(t) };
  }
});
Ne.handle("select-data-dir", async () => {
  if (!we) return { canceled: !0 };
  try {
    const e = await mt.showOpenDialog(we, {
      properties: ["openDirectory", "createDirectory"],
      title: "选择数据存储目录"
    });
    return e.canceled ? { canceled: !0 } : {
      canceled: !1,
      path: e.filePaths[0]
    };
  } catch (e) {
    return console.error("选择目录失败:", e), { error: String(e) };
  }
});
