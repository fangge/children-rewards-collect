var _o = Object.defineProperty;
var is = (e) => {
  throw TypeError(e);
};
var Eo = (e, t, r) => t in e ? _o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ot = (e, t, r) => Eo(e, typeof t != "symbol" ? t + "" : t, r), os = (e, t, r) => t.has(e) || is("Cannot " + r);
var ae = (e, t, r) => (os(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ct = (e, t, r) => t.has(e) ? is("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ut = (e, t, r, n) => (os(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Er, { app as Xe, ipcMain as Ne, BrowserWindow as Gi, dialog as wr } from "electron";
import Ie from "path";
import be from "fs";
import { fileURLToPath as wo } from "url";
import oe from "node:process";
import se from "node:path";
import { promisify as fe, isDeepStrictEqual as So } from "node:util";
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
const Ke = Sr.homedir(), Bn = Sr.tmpdir(), { env: st } = oe, Oo = (e) => {
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
  return t && (e += `-${t}`), oe.platform === "darwin" ? Oo(e) : oe.platform === "win32" ? To(e) : jo(e);
}
const Fe = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, qe = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (o) {
    return t(o);
  }
}, qo = oe.getuid ? !oe.getuid() : !1, Co = 1e4, ge = () => {
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
          return new Promise((v) => setTimeout(v, i)).then(() => o.apply(void 0, s));
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
}, de = {
  attempt: {
    /* ASYNC */
    chmod: Fe(fe(Y.chmod), ie.onChangeError),
    chown: Fe(fe(Y.chown), ie.onChangeError),
    close: Fe(fe(Y.close), ge),
    fsync: Fe(fe(Y.fsync), ge),
    mkdir: Fe(fe(Y.mkdir), ge),
    realpath: Fe(fe(Y.realpath), ge),
    stat: Fe(fe(Y.stat), ge),
    unlink: Fe(fe(Y.unlink), ge),
    /* SYNC */
    chmodSync: qe(Y.chmodSync, ie.onChangeError),
    chownSync: qe(Y.chownSync, ie.onChangeError),
    closeSync: qe(Y.closeSync, ge),
    existsSync: qe(Y.existsSync, ge),
    fsyncSync: qe(Y.fsync, ge),
    mkdirSync: qe(Y.mkdirSync, ge),
    realpathSync: qe(Y.realpathSync, ge),
    statSync: qe(Y.statSync, ge),
    unlinkSync: qe(Y.unlinkSync, ge)
  },
  retry: {
    /* ASYNC */
    close: ze(fe(Y.close), ie.isRetriableError),
    fsync: ze(fe(Y.fsync), ie.isRetriableError),
    open: ze(fe(Y.open), ie.isRetriableError),
    readFile: ze(fe(Y.readFile), ie.isRetriableError),
    rename: ze(fe(Y.rename), ie.isRetriableError),
    stat: ze(fe(Y.stat), ie.isRetriableError),
    write: ze(fe(Y.write), ie.isRetriableError),
    writeFile: ze(fe(Y.writeFile), ie.isRetriableError),
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
}, Lo = "utf8", us = 438, Mo = 511, Vo = {}, Fo = Sr.userInfo().uid, zo = Sr.userInfo().gid, Uo = 1e3, Go = !!oe.getuid;
oe.getuid && oe.getuid();
const ls = 128, Ko = (e) => e instanceof Error && "code" in e, fs = (e) => typeof e == "string", Mr = (e) => e === void 0, Ho = oe.platform === "linux", Hi = oe.platform === "win32", Wn = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
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
        t && (Hi && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? oe.kill(oe.pid, "SIGTERM") : oe.kill(oe.pid, t));
      }
    }, this.hook = () => {
      oe.once("exit", () => this.exit());
      for (const t of Wn)
        try {
          oe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Bo = new Xo(), Wo = Bo.register, he = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), o = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${o}`;
  },
  get: (e, t, r = !0) => {
    const n = he.truncate(t(e));
    return n in he.store ? he.get(e, t, r) : (he.store[n] = r, [n, () => delete he.store[n]]);
  },
  purge: (e) => {
    he.store[e] && (delete he.store[e], de.attempt.unlink(e));
  },
  purgeSync: (e) => {
    he.store[e] && (delete he.store[e], de.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in he.store)
      he.purgeSync(e);
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
Wo(he.purgeSyncAll);
function Xi(e, t, r = Vo) {
  if (fs(r))
    return Xi(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Uo) || -1);
  let o = null, s = null, c = null;
  try {
    const l = de.attempt.realpathSync(e), u = !!l;
    e = l || e, [s, o] = he.get(e, r.tmpCreate || he.create, r.tmpPurge !== !1);
    const m = Go && Mr(r.chown), i = Mr(r.mode);
    if (u && (m || i)) {
      const p = de.attempt.statSync(e);
      p && (r = { ...r }, m && (r.chown = { uid: p.uid, gid: p.gid }), i && (r.mode = p.mode));
    }
    if (!u) {
      const p = se.dirname(e);
      de.attempt.mkdirSync(p, {
        mode: Mo,
        recursive: !0
      });
    }
    c = de.retry.openSync(n)(s, "w", r.mode || us), r.tmpCreated && r.tmpCreated(s), fs(t) ? de.retry.writeSync(n)(c, t, 0, r.encoding || Lo) : Mr(t) || de.retry.writeSync(n)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? de.retry.fsyncSync(n)(c) : de.attempt.fsync(c)), de.retry.closeSync(n)(c), c = null, r.chown && (r.chown.uid !== Fo || r.chown.gid !== zo) && de.attempt.chownSync(s, r.chown.uid, r.chown.gid), r.mode && r.mode !== us && de.attempt.chmodSync(s, r.mode);
    try {
      de.retry.renameSync(n)(s, e);
    } catch (p) {
      if (!Ko(p) || p.code !== "ENAMETOOLONG")
        throw p;
      de.retry.renameSync(n)(s, he.truncate(e));
    }
    o(), s = null;
  } finally {
    c && de.attempt.closeSync(c), s && he.purge(s);
  }
}
function Bi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var $t = { exports: {} }, Vr = {}, Ce = {}, Be = {}, Fr = {}, zr = {}, Ur = {}, ds;
function gr() {
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
        return (a = this._str) !== null && a !== void 0 ? a : this._str = this._items.reduce((d, g) => `${d}${g}`, "");
      }
      get names() {
        var a;
        return (a = this._names) !== null && a !== void 0 ? a : this._names = this._items.reduce((d, g) => (g instanceof r && (d[g.str] = (d[g.str] || 0) + 1), d), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function o(h, ...a) {
      const d = [h[0]];
      let g = 0;
      for (; g < a.length; )
        l(d, a[g]), d.push(h[++g]);
      return new n(d);
    }
    e._ = o;
    const s = new n("+");
    function c(h, ...a) {
      const d = [_(h[0])];
      let g = 0;
      for (; g < a.length; )
        d.push(s), l(d, a[g]), d.push(s, _(h[++g]));
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
    function v(h) {
      return new n(_(h));
    }
    e.stringify = v;
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
    const t = gr();
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
        const v = this.toName(m), { prefix: _ } = v, S = (p = i.key) !== null && p !== void 0 ? p : i.ref;
        let y = this._values[_];
        if (y) {
          const a = y.get(S);
          if (a)
            return a;
        } else
          y = this._values[_] = /* @__PURE__ */ new Map();
        y.set(S, v);
        const f = this._scope[_] || (this._scope[_] = []), h = f.length;
        return f[h] = i.ref, v.setValue(i, { property: _, itemIndex: h }), v;
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
        return this._reduceValues(m, (v) => {
          if (v.value === void 0)
            throw new Error(`CodeGen: name "${v}" has no value`);
          return v.value.code;
        }, i, p);
      }
      _reduceValues(m, i, p = {}, v) {
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
            } else if (a = v == null ? void 0 : v(h))
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
    const t = gr(), r = ms();
    var n = gr();
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
      optimizeNames($, R) {
        return this;
      }
    }
    class c extends s {
      constructor($, R, C) {
        super(), this.varKind = $, this.name = R, this.rhs = C;
      }
      render({ es5: $, _n: R }) {
        const C = $ ? r.varKinds.var : this.varKind, B = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${C} ${this.name}${B};` + R;
      }
      optimizeNames($, R) {
        if ($[this.name.str])
          return this.rhs && (this.rhs = q(this.rhs, $, R)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class l extends s {
      constructor($, R, C) {
        super(), this.lhs = $, this.rhs = R, this.sideEffects = C;
      }
      render({ _n: $ }) {
        return `${this.lhs} = ${this.rhs};` + $;
      }
      optimizeNames($, R) {
        if (!(this.lhs instanceof t.Name && !$[this.lhs.str] && !this.sideEffects))
          return this.rhs = q(this.rhs, $, R), this;
      }
      get names() {
        const $ = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return U($, this.rhs);
      }
    }
    class u extends l {
      constructor($, R, C, B) {
        super($, C, B), this.op = R;
      }
      render({ _n: $ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + $;
      }
    }
    class m extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `${this.label}:` + $;
      }
    }
    class i extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + $;
      }
    }
    class p extends s {
      constructor($) {
        super(), this.error = $;
      }
      render({ _n: $ }) {
        return `throw ${this.error};` + $;
      }
      get names() {
        return this.error.names;
      }
    }
    class v extends s {
      constructor($) {
        super(), this.code = $;
      }
      render({ _n: $ }) {
        return `${this.code};` + $;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames($, R) {
        return this.code = q(this.code, $, R), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class _ extends s {
      constructor($ = []) {
        super(), this.nodes = $;
      }
      render($) {
        return this.nodes.reduce((R, C) => R + C.render($), "");
      }
      optimizeNodes() {
        const { nodes: $ } = this;
        let R = $.length;
        for (; R--; ) {
          const C = $[R].optimizeNodes();
          Array.isArray(C) ? $.splice(R, 1, ...C) : C ? $[R] = C : $.splice(R, 1);
        }
        return $.length > 0 ? this : void 0;
      }
      optimizeNames($, R) {
        const { nodes: C } = this;
        let B = C.length;
        for (; B--; ) {
          const x = C[B];
          x.optimizeNames($, R) || (D($, x.names), C.splice(B, 1));
        }
        return C.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce(($, R) => F($, R.names), {});
      }
    }
    class S extends _ {
      render($) {
        return "{" + $._n + super.render($) + "}" + $._n;
      }
    }
    class y extends _ {
    }
    class f extends S {
    }
    f.kind = "else";
    class h extends S {
      constructor($, R) {
        super(R), this.condition = $;
      }
      render($) {
        let R = `if(${this.condition})` + super.render($);
        return this.else && (R += "else " + this.else.render($)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const $ = this.condition;
        if ($ === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const C = R.optimizeNodes();
          R = this.else = Array.isArray(C) ? new f(C) : C;
        }
        if (R)
          return $ === !1 ? R instanceof h ? R : R.nodes : this.nodes.length ? this : new h(X($), R instanceof h ? [R] : R.nodes);
        if (!($ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames($, R) {
        var C;
        if (this.else = (C = this.else) === null || C === void 0 ? void 0 : C.optimizeNames($, R), !!(super.optimizeNames($, R) || this.else))
          return this.condition = q(this.condition, $, R), this;
      }
      get names() {
        const $ = super.names;
        return U($, this.condition), this.else && F($, this.else.names), $;
      }
    }
    h.kind = "if";
    class a extends S {
    }
    a.kind = "for";
    class d extends a {
      constructor($) {
        super(), this.iteration = $;
      }
      render($) {
        return `for(${this.iteration})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iteration = q(this.iteration, $, R), this;
      }
      get names() {
        return F(super.names, this.iteration.names);
      }
    }
    class g extends a {
      constructor($, R, C, B) {
        super(), this.varKind = $, this.name = R, this.from = C, this.to = B;
      }
      render($) {
        const R = $.es5 ? r.varKinds.var : this.varKind, { name: C, from: B, to: x } = this;
        return `for(${R} ${C}=${B}; ${C}<${x}; ${C}++)` + super.render($);
      }
      get names() {
        const $ = U(super.names, this.from);
        return U($, this.to);
      }
    }
    class w extends a {
      constructor($, R, C, B) {
        super(), this.loop = $, this.varKind = R, this.name = C, this.iterable = B;
      }
      render($) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iterable = q(this.iterable, $, R), this;
      }
      get names() {
        return F(super.names, this.iterable.names);
      }
    }
    class E extends S {
      constructor($, R, C) {
        super(), this.name = $, this.args = R, this.async = C;
      }
      render($) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render($);
      }
    }
    E.kind = "func";
    class b extends _ {
      render($) {
        return "return " + super.render($);
      }
    }
    b.kind = "return";
    class I extends S {
      render($) {
        let R = "try" + super.render($);
        return this.catch && (R += this.catch.render($)), this.finally && (R += this.finally.render($)), R;
      }
      optimizeNodes() {
        var $, R;
        return super.optimizeNodes(), ($ = this.catch) === null || $ === void 0 || $.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames($, R) {
        var C, B;
        return super.optimizeNames($, R), (C = this.catch) === null || C === void 0 || C.optimizeNames($, R), (B = this.finally) === null || B === void 0 || B.optimizeNames($, R), this;
      }
      get names() {
        const $ = super.names;
        return this.catch && F($, this.catch.names), this.finally && F($, this.finally.names), $;
      }
    }
    class M extends S {
      constructor($) {
        super(), this.error = $;
      }
      render($) {
        return `catch(${this.error})` + super.render($);
      }
    }
    M.kind = "catch";
    class K extends S {
      render($) {
        return "finally" + super.render($);
      }
    }
    K.kind = "finally";
    class k {
      constructor($, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = $, this._scope = new r.Scope({ parent: $ }), this._nodes = [new y()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name($) {
        return this._scope.name($);
      }
      // reserves unique name in the external scope
      scopeName($) {
        return this._extScope.name($);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue($, R) {
        const C = this._extScope.value($, R);
        return (this._values[C.prefix] || (this._values[C.prefix] = /* @__PURE__ */ new Set())).add(C), C;
      }
      getScopeValue($, R) {
        return this._extScope.getValue($, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs($) {
        return this._extScope.scopeRefs($, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def($, R, C, B) {
        const x = this._scope.toName(R);
        return C !== void 0 && B && (this._constants[x.str] = C), this._leafNode(new c($, x, C)), x;
      }
      // `const` declaration (`var` in es5 mode)
      const($, R, C) {
        return this._def(r.varKinds.const, $, R, C);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let($, R, C) {
        return this._def(r.varKinds.let, $, R, C);
      }
      // `var` declaration with optional assignment
      var($, R, C) {
        return this._def(r.varKinds.var, $, R, C);
      }
      // assignment code
      assign($, R, C) {
        return this._leafNode(new l($, R, C));
      }
      // `+=` code
      add($, R) {
        return this._leafNode(new u($, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code($) {
        return typeof $ == "function" ? $() : $ !== t.nil && this._leafNode(new v($)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...$) {
        const R = ["{"];
        for (const [C, B] of $)
          R.length > 1 && R.push(","), R.push(C), (C !== B || this.opts.es5) && (R.push(":"), (0, t.addCodeArg)(R, B));
        return R.push("}"), new t._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if($, R, C) {
        if (this._blockNode(new h($)), R && C)
          this.code(R).else().code(C).endIf();
        else if (R)
          this.code(R).endIf();
        else if (C)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf($) {
        return this._elseNode(new h($));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(h, f);
      }
      _for($, R) {
        return this._blockNode($), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for($, R) {
        return this._for(new d($), R);
      }
      // `for` statement for a range of values
      forRange($, R, C, B, x = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const re = this._scope.toName($);
        return this._for(new g(x, re, R, C), () => B(re));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf($, R, C, B = r.varKinds.const) {
        const x = this._scope.toName($);
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
      forIn($, R, C, B = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf($, (0, t._)`Object.keys(${R})`, C);
        const x = this._scope.toName($);
        return this._for(new w("in", B, x, R), () => C(x));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(a);
      }
      // `label` statement
      label($) {
        return this._leafNode(new m($));
      }
      // `break` statement
      break($) {
        return this._leafNode(new i($));
      }
      // `return` statement
      return($) {
        const R = new b();
        if (this._blockNode(R), this.code($), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try($, R, C) {
        if (!R && !C)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const B = new I();
        if (this._blockNode(B), this.code($), R) {
          const x = this.name("e");
          this._currNode = B.catch = new M(x), R(x);
        }
        return C && (this._currNode = B.finally = new K(), this.code(C)), this._endBlockNode(M, K);
      }
      // `throw` statement
      throw($) {
        return this._leafNode(new p($));
      }
      // start self-balancing block
      block($, R) {
        return this._blockStarts.push(this._nodes.length), $ && this.code($).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock($) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const C = this._nodes.length - R;
        if (C < 0 || $ !== void 0 && C !== $)
          throw new Error(`CodeGen: wrong number of nodes: ${C} vs ${$} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func($, R = t.nil, C, B) {
        return this._blockNode(new E($, R, C)), B && this.code(B).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(E);
      }
      optimize($ = 1) {
        for (; $-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode($) {
        return this._currNode.nodes.push($), this;
      }
      _blockNode($) {
        this._currNode.nodes.push($), this._nodes.push($);
      }
      _endBlockNode($, R) {
        const C = this._currNode;
        if (C instanceof $ || R && C instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${$.kind}/${R.kind}` : $.kind}"`);
      }
      _elseNode($) {
        const R = this._currNode;
        if (!(R instanceof h))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = $, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const $ = this._nodes;
        return $[$.length - 1];
      }
      set _currNode($) {
        const R = this._nodes;
        R[R.length - 1] = $;
      }
    }
    e.CodeGen = k;
    function F(N, $) {
      for (const R in $)
        N[R] = (N[R] || 0) + ($[R] || 0);
      return N;
    }
    function U(N, $) {
      return $ instanceof t._CodeOrName ? F(N, $.names) : N;
    }
    function q(N, $, R) {
      if (N instanceof t.Name)
        return C(N);
      if (!B(N))
        return N;
      return new t._Code(N._items.reduce((x, re) => (re instanceof t.Name && (re = C(re)), re instanceof t._Code ? x.push(...re._items) : x.push(re), x), []));
      function C(x) {
        const re = R[x.str];
        return re === void 0 || $[x.str] !== 1 ? x : (delete $[x.str], re);
      }
      function B(x) {
        return x instanceof t._Code && x._items.some((re) => re instanceof t.Name && $[re.str] === 1 && R[re.str] !== void 0);
      }
    }
    function D(N, $) {
      for (const R in $)
        N[R] = (N[R] || 0) - ($[R] || 0);
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
      return ($, R) => $ === t.nil ? R : R === t.nil ? $ : (0, t._)`${j($)} ${N} ${j(R)}`;
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
  const e = J(), t = gr();
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
      M[K] || g(w, `unknown keyword: "${K}"`);
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
  function v(w, E) {
    if (Array.isArray(w))
      for (const b of w)
        E(b);
    else
      E(w);
  }
  Z.eachItem = v;
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
  function g(w, E, b = w.opts.strictSchema) {
    if (b) {
      if (E = `strict mode: ${E}`, b === !0)
        throw new Error(E);
      w.self.logger.warn(E);
    }
  }
  return Z.checkStrictMode = g, Z;
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
var vs;
function Rr() {
  return vs || (vs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = J(), r = ee(), n = Oe();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: h }) => h ? (0, t.str)`"${f}" keyword must be ${h} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function o(f, h = e.keywordError, a, d) {
      const { it: g } = f, { gen: w, compositeRule: E, allErrors: b } = g, I = p(f, h, a);
      d ?? (E || b) ? u(w, I) : m(g, (0, t._)`[${I}]`);
    }
    e.reportError = o;
    function s(f, h = e.keywordError, a) {
      const { it: d } = f, { gen: g, compositeRule: w, allErrors: E } = d, b = p(f, h, a);
      u(g, b), w || E || m(d, n.default.vErrors);
    }
    e.reportExtraError = s;
    function c(f, h) {
      f.assign(n.default.errors, h), f.if((0, t._)`${n.default.vErrors} !== null`, () => f.if(h, () => f.assign((0, t._)`${n.default.vErrors}.length`, h), () => f.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = c;
    function l({ gen: f, keyword: h, schemaValue: a, data: d, errsCount: g, it: w }) {
      if (g === void 0)
        throw new Error("ajv implementation error");
      const E = f.name("err");
      f.forRange("i", g, n.default.errors, (b) => {
        f.const(E, (0, t._)`${n.default.vErrors}[${b}]`), f.if((0, t._)`${E}.instancePath === undefined`, () => f.assign((0, t._)`${E}.instancePath`, (0, t.strConcat)(n.default.instancePath, w.errorPath))), f.assign((0, t._)`${E}.schemaPath`, (0, t.str)`${w.errSchemaPath}/${h}`), w.opts.verbose && (f.assign((0, t._)`${E}.schema`, a), f.assign((0, t._)`${E}.data`, d));
      });
    }
    e.extendErrors = l;
    function u(f, h) {
      const a = f.const("err", h);
      f.if((0, t._)`${n.default.vErrors} === null`, () => f.assign(n.default.vErrors, (0, t._)`[${a}]`), (0, t._)`${n.default.vErrors}.push(${a})`), f.code((0, t._)`${n.default.errors}++`);
    }
    function m(f, h) {
      const { gen: a, validateName: d, schemaEnv: g } = f;
      g.$async ? a.throw((0, t._)`new ${f.ValidationError}(${h})`) : (a.assign((0, t._)`${d}.errors`, h), a.return(!1));
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
      return d === !1 ? (0, t._)`{}` : v(f, h, a);
    }
    function v(f, h, a = {}) {
      const { gen: d, it: g } = f, w = [
        _(g, a),
        S(f, a)
      ];
      return y(f, h, w), d.object(...w);
    }
    function _({ errorPath: f }, { instancePath: h }) {
      const a = h ? (0, t.str)`${f}${(0, r.getErrorPath)(h, r.Type.Str)}` : f;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, a)];
    }
    function S({ keyword: f, it: { errSchemaPath: h } }, { schemaPath: a, parentSchema: d }) {
      let g = d ? h : (0, t.str)`${h}/${f}`;
      return a && (g = (0, t.str)`${g}${(0, r.getErrorPath)(a, r.Type.Str)}`), [i.schemaPath, g];
    }
    function y(f, { params: h, message: a }, d) {
      const { keyword: g, data: w, schemaValue: E, it: b } = f, { opts: I, propertyName: M, topSchemaRef: K, schemaPath: k } = b;
      d.push([i.keyword, g], [i.params, typeof h == "function" ? h(f) : h || (0, t._)`{}`]), I.messages && d.push([i.message, typeof a == "function" ? a(f) : a]), I.verbose && d.push([i.schema, E], [i.parentSchema, (0, t._)`${K}${k}`], [n.default.data, w]), M && d.push([i.propertyName, M]);
    }
  }(Fr)), Fr;
}
var gs;
function xo() {
  if (gs) return Be;
  gs = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.boolOrEmptySchema = Be.topBoolOrEmptySchema = void 0;
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
var le = {}, We = {}, _s;
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
function _r() {
  if (ws) return le;
  ws = 1, Object.defineProperty(le, "__esModule", { value: !0 }), le.reportTypeError = le.checkDataTypes = le.checkDataType = le.coerceAndCheckDataType = le.getJSONTypes = le.getSchemaTypes = le.DataType = void 0;
  const e = Wi(), t = xi(), r = Rr(), n = J(), o = ee();
  var s;
  (function(a) {
    a[a.Correct = 0] = "Correct", a[a.Wrong = 1] = "Wrong";
  })(s || (le.DataType = s = {}));
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
  le.getSchemaTypes = c;
  function l(a) {
    const d = Array.isArray(a) ? a : a ? [a] : [];
    if (d.every(e.isJSONType))
      return d;
    throw new Error("type must be JSONType or JSONType[]: " + d.join(","));
  }
  le.getJSONTypes = l;
  function u(a, d) {
    const { gen: g, data: w, opts: E } = a, b = i(d, E.coerceTypes), I = d.length > 0 && !(b.length === 0 && d.length === 1 && (0, t.schemaHasRulesForType)(a, d[0]));
    if (I) {
      const M = S(d, w, E.strictNumbers, s.Wrong);
      g.if(M, () => {
        b.length ? p(a, d, b) : f(a);
      });
    }
    return I;
  }
  le.coerceAndCheckDataType = u;
  const m = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(a, d) {
    return d ? a.filter((g) => m.has(g) || d === "array" && g === "array") : [];
  }
  function p(a, d, g) {
    const { gen: w, data: E, opts: b } = a, I = w.let("dataType", (0, n._)`typeof ${E}`), M = w.let("coerced", (0, n._)`undefined`);
    b.coerceTypes === "array" && w.if((0, n._)`${I} == 'object' && Array.isArray(${E}) && ${E}.length == 1`, () => w.assign(E, (0, n._)`${E}[0]`).assign(I, (0, n._)`typeof ${E}`).if(S(d, E, b.strictNumbers), () => w.assign(M, E))), w.if((0, n._)`${M} !== undefined`);
    for (const k of g)
      (m.has(k) || k === "array" && b.coerceTypes === "array") && K(k);
    w.else(), f(a), w.endIf(), w.if((0, n._)`${M} !== undefined`, () => {
      w.assign(E, M), v(a, M);
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
  function v({ gen: a, parentData: d, parentDataProperty: g }, w) {
    a.if((0, n._)`${d} !== undefined`, () => a.assign((0, n._)`${d}[${g}]`, w));
  }
  function _(a, d, g, w = s.Correct) {
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
      return (0, n.and)((0, n._)`typeof ${d} == "number"`, M, g ? (0, n._)`isFinite(${d})` : n.nil);
    }
  }
  le.checkDataType = _;
  function S(a, d, g, w) {
    if (a.length === 1)
      return _(a[0], d, g, w);
    let E;
    const b = (0, o.toHash)(a);
    if (b.array && b.object) {
      const I = (0, n._)`typeof ${d} != "object"`;
      E = b.null ? I : (0, n._)`!${d} || ${I}`, delete b.null, delete b.array, delete b.object;
    } else
      E = n.nil;
    b.number && delete b.integer;
    for (const I in b)
      E = (0, n.and)(E, _(I, d, g, w));
    return E;
  }
  le.checkDataTypes = S;
  const y = {
    message: ({ schema: a }) => `must be ${a}`,
    params: ({ schema: a, schemaValue: d }) => typeof a == "string" ? (0, n._)`{type: ${a}}` : (0, n._)`{type: ${d}}`
  };
  function f(a) {
    const d = h(a);
    (0, r.reportError)(d, y);
  }
  le.reportTypeError = f;
  function h(a) {
    const { gen: d, data: g, schema: w } = a, E = (0, o.schemaRefOrVal)(a, w, "type");
    return {
      gen: d,
      keyword: "type",
      data: g,
      schema: w.type,
      schemaCode: E,
      schemaValue: E,
      parentSchema: w,
      params: {},
      it: a
    };
  }
  return le;
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
    let v = (0, e._)`${p} === undefined`;
    i.useDefaults === "empty" && (v = (0, e._)`${v} || ${p} === null || ${p} === ""`), l.if(v, (0, e._)`${p} = ${(0, e.stringify)(c)}`);
  }
  return ft;
}
var Pe = {}, ne = {}, bs;
function Te() {
  if (bs) return ne;
  bs = 1, Object.defineProperty(ne, "__esModule", { value: !0 }), ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
  const e = J(), t = ee(), r = Oe(), n = ee();
  function o(a, d) {
    const { gen: g, data: w, it: E } = a;
    g.if(i(g, w, d, E.opts.ownProperties), () => {
      a.setParams({ missingProperty: (0, e._)`${d}` }, !0), a.error();
    });
  }
  ne.checkReportMissingProp = o;
  function s({ gen: a, data: d, it: { opts: g } }, w, E) {
    return (0, e.or)(...w.map((b) => (0, e.and)(i(a, d, b, g.ownProperties), (0, e._)`${E} = ${b}`)));
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
  function u(a, d, g) {
    return (0, e._)`${l(a)}.call(${d}, ${g})`;
  }
  ne.isOwnProperty = u;
  function m(a, d, g, w) {
    const E = (0, e._)`${d}${(0, e.getProperty)(g)} !== undefined`;
    return w ? (0, e._)`${E} && ${u(a, d, g)}` : E;
  }
  ne.propertyInData = m;
  function i(a, d, g, w) {
    const E = (0, e._)`${d}${(0, e.getProperty)(g)} === undefined`;
    return w ? (0, e.or)(E, (0, e.not)(u(a, d, g))) : E;
  }
  ne.noPropertyInData = i;
  function p(a) {
    return a ? Object.keys(a).filter((d) => d !== "__proto__") : [];
  }
  ne.allSchemaProperties = p;
  function v(a, d) {
    return p(d).filter((g) => !(0, t.alwaysValidSchema)(a, d[g]));
  }
  ne.schemaProperties = v;
  function _({ schemaCode: a, data: d, it: { gen: g, topSchemaRef: w, schemaPath: E, errorPath: b }, it: I }, M, K, k) {
    const F = k ? (0, e._)`${a}, ${d}, ${w}${E}` : d, U = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, b)],
      [r.default.parentData, I.parentData],
      [r.default.parentDataProperty, I.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    I.opts.dynamicRef && U.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const q = (0, e._)`${F}, ${g.object(...U)}`;
    return K !== e.nil ? (0, e._)`${M}.call(${K}, ${q})` : (0, e._)`${M}(${q})`;
  }
  ne.callValidateCode = _;
  const S = (0, e._)`new RegExp`;
  function y({ gen: a, it: { opts: d } }, g) {
    const w = d.unicodeRegExp ? "u" : "", { regExp: E } = d.code, b = E(g, w);
    return a.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${E.code === "new RegExp" ? S : (0, n.useFunc)(a, E)}(${g}, ${w})`
    });
  }
  ne.usePattern = y;
  function f(a) {
    const { gen: d, data: g, keyword: w, it: E } = a, b = d.name("valid");
    if (E.allErrors) {
      const M = d.let("valid", !0);
      return I(() => d.assign(M, !1)), M;
    }
    return d.var(b, !0), I(() => d.break()), b;
    function I(M) {
      const K = d.const("len", (0, e._)`${g}.length`);
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
    const { gen: d, schema: g, keyword: w, it: E } = a;
    if (!Array.isArray(g))
      throw new Error("ajv implementation error");
    if (g.some((K) => (0, t.alwaysValidSchema)(E, K)) && !E.opts.unevaluated)
      return;
    const I = d.let("valid", !1), M = d.name("_valid");
    d.block(() => g.forEach((K, k) => {
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
  function o(v, _) {
    const { gen: S, keyword: y, schema: f, parentSchema: h, it: a } = v, d = _.macro.call(a.self, f, h, a), g = m(S, y, d);
    a.opts.validateSchema !== !1 && a.self.validateSchema(d, !0);
    const w = S.name("valid");
    v.subschema({
      schema: d,
      schemaPath: e.nil,
      errSchemaPath: `${a.errSchemaPath}/${y}`,
      topSchemaRef: g,
      compositeRule: !0
    }, w), v.pass(w, () => v.error(!0));
  }
  Pe.macroKeywordCode = o;
  function s(v, _) {
    var S;
    const { gen: y, keyword: f, schema: h, parentSchema: a, $data: d, it: g } = v;
    u(g, _);
    const w = !d && _.compile ? _.compile.call(g.self, h, a, g) : _.validate, E = m(y, f, w), b = y.let("valid");
    v.block$data(b, I), v.ok((S = _.valid) !== null && S !== void 0 ? S : b);
    function I() {
      if (_.errors === !1)
        k(), _.modifying && c(v), F(() => v.error());
      else {
        const U = _.async ? M() : K();
        _.modifying && c(v), F(() => l(v, U));
      }
    }
    function M() {
      const U = y.let("ruleErrs", null);
      return y.try(() => k((0, e._)`await `), (q) => y.assign(b, !1).if((0, e._)`${q} instanceof ${g.ValidationError}`, () => y.assign(U, (0, e._)`${q}.errors`), () => y.throw(q))), U;
    }
    function K() {
      const U = (0, e._)`${E}.errors`;
      return y.assign(U, null), k(e.nil), U;
    }
    function k(U = _.async ? (0, e._)`await ` : e.nil) {
      const q = g.opts.passContext ? t.default.this : t.default.self, D = !("compile" in _ && !d || _.schema === !1);
      y.assign(b, (0, e._)`${U}${(0, r.callValidateCode)(v, E, q, D)}`, _.modifying);
    }
    function F(U) {
      var q;
      y.if((0, e.not)((q = _.valid) !== null && q !== void 0 ? q : b), U);
    }
  }
  Pe.funcKeywordCode = s;
  function c(v) {
    const { gen: _, data: S, it: y } = v;
    _.if(y.parentData, () => _.assign(S, (0, e._)`${y.parentData}[${y.parentDataProperty}]`));
  }
  function l(v, _) {
    const { gen: S } = v;
    S.if((0, e._)`Array.isArray(${_})`, () => {
      S.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${_} : ${t.default.vErrors}.concat(${_})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(v);
    }, () => v.error());
  }
  function u({ schemaEnv: v }, _) {
    if (_.async && !v.$async)
      throw new Error("async keyword in sync schema");
  }
  function m(v, _, S) {
    if (S === void 0)
      throw new Error(`keyword "${_}" failed to compile`);
    return v.scopeValue("keyword", typeof S == "function" ? { ref: S } : { ref: S, code: (0, e.stringify)(S) });
  }
  function i(v, _, S = !1) {
    return !_.length || _.some((y) => y === "array" ? Array.isArray(v) : y === "object" ? v && typeof v == "object" && !Array.isArray(v) : typeof v == y || S && typeof v > "u");
  }
  Pe.validSchemaType = i;
  function p({ schema: v, opts: _, self: S, errSchemaPath: y }, f, h) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(h) : f.keyword !== h)
      throw new Error("ajv implementation error");
    const a = f.dependencies;
    if (a != null && a.some((d) => !Object.prototype.hasOwnProperty.call(v, d)))
      throw new Error(`parent schema must have dependencies of ${h}: ${a.join(",")}`);
    if (f.validateSchema && !f.validateSchema(v[h])) {
      const g = `keyword "${h}" value is invalid at path "${y}": ` + S.errorsText(f.validateSchema.errors);
      if (_.validateSchema === "log")
        S.logger.error(g);
      else
        throw new Error(g);
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
      const v = s.schema[c];
      return l === void 0 ? {
        schema: v,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${c}`
      } : {
        schema: v[l],
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
    const { gen: v } = c;
    if (l !== void 0) {
      const { errorPath: S, dataPathArr: y, opts: f } = c, h = v.let("data", (0, e._)`${c.data}${(0, e.getProperty)(l)}`, !0);
      _(h), s.errorPath = (0, e.str)`${S}${(0, t.getErrorPath)(l, u, f.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${l}`, s.dataPathArr = [...y, s.parentDataProperty];
    }
    if (m !== void 0) {
      const S = m instanceof e.Name ? m : v.let("data", m, !0);
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
var me = {}, Kr, Is;
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
  function t(n, o, s, c, l, u, m, i, p, v) {
    if (c && typeof c == "object" && !Array.isArray(c)) {
      o(c, l, u, m, i, p, v);
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
      s(c, l, u, m, i, p, v);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Hr.exports;
}
var Os;
function Pr() {
  if (Os) return me;
  Os = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.getSchemaRefs = me.resolveUrl = me.normalizeId = me._getFullPath = me.getFullPath = me.inlineRef = void 0;
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
  me.inlineRef = o;
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
  me.getFullPath = u;
  function m(y, f) {
    return y.serialize(f).split("#")[0] + "#";
  }
  me._getFullPath = m;
  const i = /#\/?$/;
  function p(y) {
    return y ? y.replace(i, "") : "";
  }
  me.normalizeId = p;
  function v(y, f, h) {
    return h = p(h), y.resolve(f, h);
  }
  me.resolveUrl = v;
  const _ = /^[a-z_][-a-z0-9._]*$/i;
  function S(y, f) {
    if (typeof y == "boolean")
      return {};
    const { schemaId: h, uriResolver: a } = this.opts, d = p(y[h] || f), g = { "": d }, w = u(a, d, !1), E = {}, b = /* @__PURE__ */ new Set();
    return r(y, { allKeys: !0 }, (K, k, F, U) => {
      if (U === void 0)
        return;
      const q = w + k;
      let D = g[U];
      typeof K[h] == "string" && (D = X.call(this, K[h])), G.call(this, K.$anchor), G.call(this, K.$dynamicAnchor), g[k] = D;
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
  return me.getSchemaRefs = S, me;
}
var Ts;
function mt() {
  if (Ts) return Ce;
  Ts = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.getData = Ce.KeywordCxt = Ce.validateFunctionCode = void 0;
  const e = xo(), t = _r(), r = xi(), n = _r(), o = Jo(), s = Yo(), c = Zo(), l = J(), u = Oe(), m = Pr(), i = ee(), p = Rr();
  function v(O) {
    if (w(O) && (b(O), g(O))) {
      f(O);
      return;
    }
    _(O, () => (0, e.topBoolOrEmptySchema)(O));
  }
  Ce.validateFunctionCode = v;
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
    if (w(O) && (b(O), g(O))) {
      E(O, T);
      return;
    }
    (0, e.boolOrEmptySchema)(O, T);
  }
  function g({ schema: O, self: T }) {
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
      const ce = (0, l.str)`${V}/$comment`, Re = O.scopeValue("root", { ref: T.root });
      O.code((0, l._)`${u.default.self}.opts.$comment(${Q}, ${ce}, ${Re}.schema)`);
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
    const { gen: W, schema: Q, data: ce, allErrors: Re, opts: $e, self: ve } = O, { RULES: ue } = ve;
    if (Q.$ref && ($e.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(Q, ue))) {
      W.block(() => B(O, "$ref", ue.all.$ref.definition));
      return;
    }
    $e.jtd || z(O, T), W.block(() => {
      for (const we of ue.rules)
        Ye(we);
      Ye(ue.post);
    });
    function Ye(we) {
      (0, r.shouldUseGroup)(Q, we) && (we.type ? (W.if((0, n.checkDataType)(we.type, ce, $e.strictNumbers)), G(O, we), T.length === 1 && T[0] === we.type && L && (W.else(), (0, n.reportTypeError)(O)), W.endIf()) : G(O, we), Re || W.if((0, l._)`${u.default.errors} === ${V || 0}`));
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
      }), $(O, T);
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
        Q.length && !Q.some((ce) => j(T, ce)) && R(O, `missing type "${Q.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function j(O, T) {
    return O.includes(T) || T === "number" && O.includes("integer");
  }
  function N(O, T) {
    return O.includes(T) || T === "integer" && O.includes("number");
  }
  function $(O, T) {
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
      const { gen: V, schemaCode: W, schemaType: Q, def: ce } = this;
      V.if((0, l.or)((0, l._)`${W} === undefined`, L)), T !== l.nil && V.assign(T, !0), (Q.length || ce.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), T !== l.nil && V.assign(T, !1)), V.else();
    }
    invalid$data() {
      const { gen: T, schemaCode: L, schemaType: V, def: W, it: Q } = this;
      return (0, l.or)(ce(), Re());
      function ce() {
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
      const ve = re.exec(O);
      if (!ve)
        throw new Error(`Invalid JSON-pointer: ${O}`);
      const ue = +ve[1];
      if (W = ve[2], W === "#") {
        if (ue >= T)
          throw new Error($e("property/index", ue));
        return V[T - ue];
      }
      if (ue > T)
        throw new Error($e("data", ue));
      if (Q = L[T - ue], !W)
        return Q;
    }
    let ce = Q;
    const Re = W.split("/");
    for (const ve of Re)
      ve && (Q = (0, l._)`${Q}${(0, l.getProperty)((0, i.unescapeJsonPointer)(ve))}`, ce = (0, l._)`${ce} && ${Q}`);
    return ce;
    function $e(ve, ue) {
      return `Cannot access ${ve} ${ue} levels up, current level is ${T}`;
    }
  }
  return Ce.getData = te, Ce;
}
var gt = {}, js;
function Ir() {
  if (js) return gt;
  js = 1, Object.defineProperty(gt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return gt.default = e, gt;
}
var _t = {}, As;
function pt() {
  if (As) return _t;
  As = 1, Object.defineProperty(_t, "__esModule", { value: !0 });
  const e = Pr();
  class t extends Error {
    constructor(n, o, s, c) {
      super(c || `can't resolve reference ${s} from id ${o}`), this.missingRef = (0, e.resolveUrl)(n, o, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return _t.default = t, _t;
}
var _e = {}, qs;
function Nr() {
  if (qs) return _e;
  qs = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.resolveSchema = _e.getCompilingSchema = _e.resolveRef = _e.compileSchema = _e.SchemaEnv = void 0;
  const e = J(), t = Ir(), r = Oe(), n = Pr(), o = ee(), s = mt();
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
    const a = (0, n.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: d, lines: g } = this.opts.code, { ownProperties: w } = this.opts, E = new e.CodeGen(this.scope, { es5: d, lines: g, ownProperties: w });
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
    const g = f.refs[a];
    if (g)
      return g;
    let w = v.call(this, f, a);
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
  function v(f, h) {
    let a;
    for (; typeof (a = this.refs[h]) == "string"; )
      h = a;
    return a || this.schemas[h] || _.call(this, f, h);
  }
  function _(f, h) {
    const a = this.opts.uriResolver.parse(h), d = (0, n._getFullPath)(this.opts.uriResolver, a);
    let g = (0, n.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && d === g)
      return y.call(this, a, f);
    const w = (0, n.normalizeId)(d), E = this.refs[w] || this.schemas[w];
    if (typeof E == "string") {
      const b = _.call(this, f, E);
      return typeof (b == null ? void 0 : b.schema) != "object" ? void 0 : y.call(this, a, b);
    }
    if (typeof (E == null ? void 0 : E.schema) == "object") {
      if (E.validate || l.call(this, E), w === (0, n.normalizeId)(h)) {
        const { schema: b } = E, { schemaId: I } = this.opts, M = b[I];
        return M && (g = (0, n.resolveUrl)(this.opts.uriResolver, g, M)), new c({ schema: b, schemaId: I, root: f, baseId: g });
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
    var g;
    if (((g = f.fragment) === null || g === void 0 ? void 0 : g[0]) !== "/")
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
var Et = {}, dt = { exports: {} }, Xr, Cs;
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
    let g = !1, w = !1, E = !1;
    function b() {
      if (d.length) {
        if (g === !1) {
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
          g = !0;
        } else {
          d.push(M);
          continue;
        }
    }
    return d.length && (g ? h.zone = d.join("") : E ? a.push(d.join("")) : a.push(n(d))), h.address = a.join(""), h;
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
    for (let g = 0; g < d; g++) {
      const w = y[g];
      w === "0" && a ? (g + 1 <= d && y[g + 1] === f || g + 1 === d) && (h += w, a = !1) : (w === f ? a = !0 : a = !1, h += w);
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
  function v(y) {
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
    removeDotSegments: v,
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
      const [d, g] = a.resourceName.split("?");
      a.path = d && d !== "/" ? d : void 0, a.query = g, a.resourceName = void 0;
    }
    return a.fragment = void 0, a;
  }
  function l(a, d) {
    if (!a.path)
      return a.error = "URN can not be parsed", a;
    const g = a.path.match(t);
    if (g) {
      const w = d.scheme || a.scheme || "urn";
      a.nid = g[1].toLowerCase(), a.nss = g[2];
      const E = `${w}:${d.nid || a.nid}`, b = h[E];
      a.path = void 0, b && (a = b.parse(a, d));
    } else
      a.error = a.error || "URN can not be parsed.";
    return a;
  }
  function u(a, d) {
    const g = d.scheme || a.scheme || "urn", w = a.nid.toLowerCase(), E = `${g}:${d.nid || w}`, b = h[E];
    b && (a = b.serialize(a, d));
    const I = a, M = a.nss;
    return I.path = `${w || d.nid}:${M}`, d.skipEscape = !0, I;
  }
  function m(a, d) {
    const g = a;
    return g.uuid = g.nss, g.nss = void 0, !d.tolerant && (!g.uuid || !e.test(g.uuid)) && (g.error = g.error || "UUID is not valid."), g;
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
  }, v = {
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
    https: v,
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
    const d = Object.assign({ scheme: "null" }, a), g = u(S(f, d), S(h, d), d, !0);
    return i(g, { ...d, skipEscape: !0 });
  }
  function u(f, h, a, d) {
    const g = {};
    return d || (f = S(i(f, a), a), h = S(i(h, a), a)), a = a || {}, !a.tolerant && h.scheme ? (g.scheme = h.scheme, g.userinfo = h.userinfo, g.host = h.host, g.port = h.port, g.path = r(h.path || ""), g.query = h.query) : (h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0 ? (g.userinfo = h.userinfo, g.host = h.host, g.port = h.port, g.path = r(h.path || ""), g.query = h.query) : (h.path ? (h.path.charAt(0) === "/" ? g.path = r(h.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? g.path = "/" + h.path : f.path ? g.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + h.path : g.path = h.path, g.path = r(g.path)), g.query = h.query) : (g.path = f.path, h.query !== void 0 ? g.query = h.query : g.query = f.query), g.userinfo = f.userinfo, g.host = f.host, g.port = f.port), g.scheme = f.scheme), g.fragment = h.fragment, g;
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
    }, d = Object.assign({}, h), g = [], w = s[(d.scheme || a.scheme || "").toLowerCase()];
    w && w.serialize && w.serialize(a, d), a.path !== void 0 && (d.skipEscape ? a.path = unescape(a.path) : (a.path = escape(a.path), a.scheme !== void 0 && (a.path = a.path.split("%3A").join(":")))), d.reference !== "suffix" && a.scheme && g.push(a.scheme, ":");
    const E = n(a);
    if (E !== void 0 && (d.reference !== "suffix" && g.push("//"), g.push(E), a.path && a.path.charAt(0) !== "/" && g.push("/")), a.path !== void 0) {
      let b = a.path;
      !d.absolutePath && (!w || !w.absolutePath) && (b = r(b)), E === void 0 && (b = b.replace(/^\/\//u, "/%2F")), g.push(b);
    }
    return a.query !== void 0 && g.push("?", a.query), a.fragment !== void 0 && g.push("#", a.fragment), g.join("");
  }
  const p = Array.from({ length: 127 }, (f, h) => /[^!"$&'()*+,\-.;=_`a-z{}~]/u.test(String.fromCharCode(h)));
  function v(f) {
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
    }, g = f.indexOf("%") !== -1;
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
      if (!a.unicodeSupport && (!b || !b.unicodeSupport) && d.host && (a.domainHost || b && b.domainHost) && w === !1 && v(d.host))
        try {
          d.host = URL.domainToASCII(d.host.toLowerCase());
        } catch (I) {
          d.error = d.error || "Host's domain name can not be converted to ASCII: " + I;
        }
      (!b || b && !b.skipNormalize) && (g && d.scheme !== void 0 && (d.scheme = unescape(d.scheme)), g && d.host !== void 0 && (d.host = unescape(d.host)), d.path && (d.path = escape(unescape(d.path))), d.fragment && (d.fragment = encodeURI(decodeURIComponent(d.fragment)))), b && b.parse && b.parse(d, a);
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
  if (Ms) return Et;
  Ms = 1, Object.defineProperty(Et, "__esModule", { value: !0 });
  const e = lc();
  return e.code = 'require("ajv/dist/runtime/uri").default', Et.default = e, Et;
}
var Vs;
function Yi() {
  return Vs || (Vs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = mt();
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
    const n = Ir(), o = pt(), s = Wi(), c = Nr(), l = J(), u = Pr(), m = _r(), i = ee(), p = ic, v = fc(), _ = (A, P) => new RegExp(A, P);
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
      var P, j, N, $, R, C, B, x, re, te, O, T, L, V, W, Q, ce, Re, $e, ve, ue, Ye, we, Cr, kr;
      const it = A.strict, Dr = (P = A.code) === null || P === void 0 ? void 0 : P.optimize, ss = Dr === !0 || Dr === void 0 ? 1 : Dr || 0, as = (N = (j = A.code) === null || j === void 0 ? void 0 : j.regExp) !== null && N !== void 0 ? N : _, go = ($ = A.uriResolver) !== null && $ !== void 0 ? $ : v.default;
      return {
        strictSchema: (C = (R = A.strictSchema) !== null && R !== void 0 ? R : it) !== null && C !== void 0 ? C : !0,
        strictNumbers: (x = (B = A.strictNumbers) !== null && B !== void 0 ? B : it) !== null && x !== void 0 ? x : !0,
        strictTypes: (te = (re = A.strictTypes) !== null && re !== void 0 ? re : it) !== null && te !== void 0 ? te : "log",
        strictTuples: (T = (O = A.strictTuples) !== null && O !== void 0 ? O : it) !== null && T !== void 0 ? T : "log",
        strictRequired: (V = (L = A.strictRequired) !== null && L !== void 0 ? L : it) !== null && V !== void 0 ? V : !1,
        code: A.code ? { ...A.code, optimize: ss, regExp: as } : { optimize: ss, regExp: as },
        loopRequired: (W = A.loopRequired) !== null && W !== void 0 ? W : a,
        loopEnum: (Q = A.loopEnum) !== null && Q !== void 0 ? Q : a,
        meta: (ce = A.meta) !== null && ce !== void 0 ? ce : !0,
        messages: (Re = A.messages) !== null && Re !== void 0 ? Re : !0,
        inlineRefs: ($e = A.inlineRefs) !== null && $e !== void 0 ? $e : !0,
        schemaId: (ve = A.schemaId) !== null && ve !== void 0 ? ve : "$id",
        addUsedSchema: (ue = A.addUsedSchema) !== null && ue !== void 0 ? ue : !0,
        validateSchema: (Ye = A.validateSchema) !== null && Ye !== void 0 ? Ye : !0,
        validateFormats: (we = A.validateFormats) !== null && we !== void 0 ? we : !0,
        unicodeRegExp: (Cr = A.unicodeRegExp) !== null && Cr !== void 0 ? Cr : !0,
        int32range: (kr = A.int32range) !== null && kr !== void 0 ? kr : !0,
        uriResolver: go
      };
    }
    class g {
      constructor(P = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...d(P) };
        const { es5: j, lines: N } = this.opts.code;
        this.scope = new l.ValueScope({ scope: {}, prefixes: y, es5: j, lines: N }), this.logger = F(P.logger);
        const $ = P.validateFormats;
        P.validateFormats = !1, this.RULES = (0, s.getRules)(), w.call(this, f, P, "NOT SUPPORTED"), w.call(this, h, P, "DEPRECATED", "warn"), this._metaOpts = K.call(this), P.formats && I.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && M.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), b.call(this), P.validateFormats = $;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: P, meta: j, schemaId: N } = this.opts;
        let $ = p;
        N === "id" && ($ = { ...p }, $.id = $.$id, delete $.$id), j && P && this.addMetaSchema($, $[N], !1);
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
        const $ = N(j);
        return "$async" in N || (this.errors = N.errors), $;
      }
      compile(P, j) {
        const N = this._addSchema(P, j);
        return N.validate || this._compileSchemaEnv(N);
      }
      compileAsync(P, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: N } = this.opts;
        return $.call(this, P, j);
        async function $(te, O) {
          await R.call(this, te.$schema);
          const T = this._addSchema(te, O);
          return T.validate || C.call(this, T);
        }
        async function R(te) {
          te && !this.getSchema(te) && await $.call(this, { $ref: te }, !0);
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
      addSchema(P, j, N, $ = this.opts.validateSchema) {
        if (Array.isArray(P)) {
          for (const C of P)
            this.addSchema(C, void 0, N, $);
          return this;
        }
        let R;
        if (typeof P == "object") {
          const { schemaId: C } = this.opts;
          if (R = P[C], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${C} must be string`);
        }
        return j = (0, u.normalizeId)(j || R), this._checkUnique(j), this.schemas[j] = this._addSchema(P, N, j, $, !0), this;
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
        const $ = this.validate(N, P);
        if (!$ && j) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return $;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(P) {
        let j;
        for (; typeof (j = E.call(this, P)) == "string"; )
          P = j;
        if (j === void 0) {
          const { schemaId: N } = this.opts, $ = new c.SchemaEnv({ schema: {}, schemaId: N });
          if (j = c.resolveSchema.call(this, $, P), !j)
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
        const $ = {
          ...j,
          type: (0, m.getJSONTypes)(j.type),
          schemaType: (0, m.getJSONTypes)(j.schemaType)
        };
        return (0, i.eachItem)(N, $.type.length === 0 ? (R) => D.call(this, R, $) : (R) => $.type.forEach((C) => D.call(this, R, $, C))), this;
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
          const $ = N.rules.findIndex((R) => R.keyword === P);
          $ >= 0 && N.rules.splice($, 1);
        }
        return this;
      }
      // Add format
      addFormat(P, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[P] = j, this;
      }
      errorsText(P = this.errors, { separator: j = ", ", dataVar: N = "data" } = {}) {
        return !P || P.length === 0 ? "No errors" : P.map(($) => `${N}${$.instancePath} ${$.message}`).reduce(($, R) => $ + j + R);
      }
      $dataMetaSchema(P, j) {
        const N = this.RULES.all;
        P = JSON.parse(JSON.stringify(P));
        for (const $ of j) {
          const R = $.split("/").slice(1);
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
          const $ = P[N];
          (!j || j.test(N)) && (typeof $ == "string" ? delete P[N] : $ && !$.meta && (this._cache.delete($.schema), delete P[N]));
        }
      }
      _addSchema(P, j, N, $ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
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
        return x = new c.SchemaEnv({ schema: P, schemaId: B, meta: j, baseId: N, localRefs: re }), this._cache.set(x.schema, x), R && !N.startsWith("#") && (N && this._checkUnique(N), this.refs[N] = x), $ && this.validateSchema(P, !0), x;
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
    g.ValidationError = n.default, g.MissingRefError = o.default, e.default = g;
    function w(A, P, j, N = "error") {
      for (const $ in A) {
        const R = $;
        R in P && this.logger[N](`${j}: option ${$}. ${A[R]}`);
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
      const $ = P == null ? void 0 : P.post;
      if (j && $)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let C = $ ? R.post : R.rules.find(({ type: x }) => x === j);
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
      const N = A.rules.findIndex(($) => $.keyword === j);
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
var wt = {}, St = {}, bt = {}, Fs;
function dc() {
  if (Fs) return bt;
  Fs = 1, Object.defineProperty(bt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return bt.default = e, bt;
}
var Ge = {}, zs;
function xn() {
  if (zs) return Ge;
  zs = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.callRef = Ge.getValidate = void 0;
  const e = pt(), t = Te(), r = J(), n = Oe(), o = Nr(), s = ee(), c = {
    keyword: "$ref",
    schemaType: "string",
    code(m) {
      const { gen: i, schema: p, it: v } = m, { baseId: _, schemaEnv: S, validateName: y, opts: f, self: h } = v, { root: a } = S;
      if ((p === "#" || p === "#/") && _ === a.baseId)
        return g();
      const d = o.resolveRef.call(h, a, _, p);
      if (d === void 0)
        throw new e.default(v.opts.uriResolver, _, p);
      if (d instanceof o.SchemaEnv)
        return w(d);
      return E(d);
      function g() {
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
  function u(m, i, p, v) {
    const { gen: _, it: S } = m, { allErrors: y, schemaEnv: f, opts: h } = S, a = h.passContext ? n.default.this : r.nil;
    v ? d() : g();
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
    function g() {
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
  if (Us) return St;
  Us = 1, Object.defineProperty(St, "__esModule", { value: !0 });
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
  return St.default = r, St;
}
var Rt = {}, Pt = {}, Gs;
function hc() {
  if (Gs) return Pt;
  Gs = 1, Object.defineProperty(Pt, "__esModule", { value: !0 });
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
  return Pt.default = o, Pt;
}
var It = {}, Ks;
function mc() {
  if (Ks) return It;
  Ks = 1, Object.defineProperty(It, "__esModule", { value: !0 });
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
  return It.default = r, It;
}
var Nt = {}, Ot = {}, Hs;
function pc() {
  if (Hs) return Ot;
  Hs = 1, Object.defineProperty(Ot, "__esModule", { value: !0 });
  function e(t) {
    const r = t.length;
    let n = 0, o = 0, s;
    for (; o < r; )
      n++, s = t.charCodeAt(o++), s >= 55296 && s <= 56319 && o < r && (s = t.charCodeAt(o), (s & 64512) === 56320 && o++);
    return n;
  }
  return Ot.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Ot;
}
var Xs;
function yc() {
  if (Xs) return Nt;
  Xs = 1, Object.defineProperty(Nt, "__esModule", { value: !0 });
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
  return Nt.default = o, Nt;
}
var Tt = {}, Bs;
function $c() {
  if (Bs) return Tt;
  Bs = 1, Object.defineProperty(Tt, "__esModule", { value: !0 });
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
  return Tt.default = n, Tt;
}
var jt = {}, Ws;
function vc() {
  if (Ws) return jt;
  Ws = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
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
  return jt.default = r, jt;
}
var At = {}, xs;
function gc() {
  if (xs) return At;
  xs = 1, Object.defineProperty(At, "__esModule", { value: !0 });
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
      const { gen: c, schema: l, schemaCode: u, data: m, $data: i, it: p } = s, { opts: v } = p;
      if (!i && l.length === 0)
        return;
      const _ = l.length >= v.loopRequired;
      if (p.allErrors ? S() : y(), v.strictRequired) {
        const a = s.parentSchema.properties, { definedProperties: d } = s.it;
        for (const g of l)
          if ((a == null ? void 0 : a[g]) === void 0 && !d.has(g)) {
            const w = p.schemaEnv.baseId + p.errSchemaPath, E = `required property "${g}" is not defined at "${w}" (strictRequired)`;
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
          s.setParams({ missingProperty: a }), c.if((0, e.noPropertyInData)(c, m, a, v.ownProperties), () => s.error());
        });
      }
      function h(a, d) {
        s.setParams({ missingProperty: a }), c.forOf(a, u, () => {
          c.assign(d, (0, e.propertyInData)(c, m, a, v.ownProperties)), c.if((0, t.not)(d), () => {
            s.error(), c.break();
          });
        }, t.nil);
      }
    }
  };
  return At.default = o, At;
}
var qt = {}, Js;
function _c() {
  if (Js) return qt;
  Js = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
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
  return qt.default = r, qt;
}
var Ct = {}, kt = {}, Ys;
function Jn() {
  if (Ys) return kt;
  Ys = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  const e = Ji();
  return e.code = 'require("ajv/dist/runtime/equal").default', kt.default = e, kt;
}
var Zs;
function Ec() {
  if (Zs) return Ct;
  Zs = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = _r(), t = J(), r = ee(), n = Jn(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: c, j: l } }) => (0, t.str)`must NOT have duplicate items (items ## ${l} and ${c} are identical)`,
      params: ({ params: { i: c, j: l } }) => (0, t._)`{i: ${c}, j: ${l}}`
    },
    code(c) {
      const { gen: l, data: u, $data: m, schema: i, parentSchema: p, schemaCode: v, it: _ } = c;
      if (!m && !i)
        return;
      const S = l.let("valid"), y = p.items ? (0, e.getSchemaTypes)(p.items) : [];
      c.block$data(S, f, (0, t._)`${v} === false`), c.ok(S);
      function f() {
        const g = l.let("i", (0, t._)`${u}.length`), w = l.let("j");
        c.setParams({ i: g, j: w }), l.assign(S, !0), l.if((0, t._)`${g} > 1`, () => (h() ? a : d)(g, w));
      }
      function h() {
        return y.length > 0 && !y.some((g) => g === "object" || g === "array");
      }
      function a(g, w) {
        const E = l.name("item"), b = (0, e.checkDataTypes)(y, E, _.opts.strictNumbers, e.DataType.Wrong), I = l.const("indices", (0, t._)`{}`);
        l.for((0, t._)`;${g}--;`, () => {
          l.let(E, (0, t._)`${u}[${g}]`), l.if(b, (0, t._)`continue`), y.length > 1 && l.if((0, t._)`typeof ${E} == "string"`, (0, t._)`${E} += "_"`), l.if((0, t._)`typeof ${I}[${E}] == "number"`, () => {
            l.assign(w, (0, t._)`${I}[${E}]`), c.error(), l.assign(S, !1).break();
          }).code((0, t._)`${I}[${E}] = ${g}`);
        });
      }
      function d(g, w) {
        const E = (0, r.useFunc)(l, n.default), b = l.name("outer");
        l.label(b).for((0, t._)`;${g}--;`, () => l.for((0, t._)`${w} = ${g}; ${w}--;`, () => l.if((0, t._)`${E}(${u}[${g}], ${u}[${w}])`, () => {
          c.error(), l.assign(S, !1).break(b);
        })));
      }
    }
  };
  return Ct.default = s, Ct;
}
var Dt = {}, Qs;
function wc() {
  if (Qs) return Dt;
  Qs = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
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
  return Dt.default = o, Dt;
}
var Lt = {}, ea;
function Sc() {
  if (ea) return Lt;
  ea = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
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
      const v = m.length >= p.opts.loopEnum;
      let _;
      const S = () => _ ?? (_ = (0, t.useFunc)(c, r.default));
      let y;
      if (v || u)
        y = c.let("valid"), s.block$data(y, f);
      else {
        if (!Array.isArray(m))
          throw new Error("ajv implementation error");
        const a = c.const("vSchema", i);
        y = (0, e.or)(...m.map((d, g) => h(a, g)));
      }
      s.pass(y);
      function f() {
        c.assign(y, !1), c.forOf("v", i, (a) => c.if((0, e._)`${S()}(${l}, ${a})`, () => c.assign(y, !0).break()));
      }
      function h(a, d) {
        const g = m[d];
        return typeof g == "object" && g !== null ? (0, e._)`${S()}(${l}, ${a}[${d}])` : (0, e._)`${l} === ${g}`;
      }
    }
  };
  return Lt.default = o, Lt;
}
var ta;
function Qi() {
  if (ta) return Rt;
  ta = 1, Object.defineProperty(Rt, "__esModule", { value: !0 });
  const e = hc(), t = mc(), r = yc(), n = $c(), o = vc(), s = gc(), c = _c(), l = Ec(), u = wc(), m = Sc(), i = [
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
  return Rt.default = i, Rt;
}
var Mt = {}, Ze = {}, ra;
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
    const v = l.const("len", (0, e._)`${m}.length`);
    if (u === !1)
      s.setParams({ len: c.length }), s.pass((0, e._)`${v} <= ${c.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(p, u)) {
      const S = l.var("valid", (0, e._)`${v} <= ${c.length}`);
      l.if((0, e.not)(S), () => _(S)), s.ok(S);
    }
    function _(S) {
      l.forRange("i", c.length, v, (y) => {
        s.subschema({ keyword: i, dataProp: y, dataPropType: t.Type.Num }, S), p.allErrors || l.if((0, e.not)(S), () => l.break());
      });
    }
  }
  return Ze.validateAdditionalItems = o, Ze.default = n, Ze;
}
var Vt = {}, Qe = {}, na;
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
    const { gen: u, parentSchema: m, data: i, keyword: p, it: v } = s;
    y(m), v.opts.unevaluated && l.length && v.items !== !0 && (v.items = t.mergeEvaluated.items(u, l.length, v.items));
    const _ = u.name("valid"), S = u.const("len", (0, e._)`${i}.length`);
    l.forEach((f, h) => {
      (0, t.alwaysValidSchema)(v, f) || (u.if((0, e._)`${S} > ${h}`, () => s.subschema({
        keyword: p,
        schemaProp: h,
        dataProp: h
      }, _)), s.ok(_));
    });
    function y(f) {
      const { opts: h, errSchemaPath: a } = v, d = l.length, g = d === f.minItems && (d === f.maxItems || f[c] === !1);
      if (h.strictTuples && !g) {
        const w = `"${p}" is ${d}-tuple, but minItems or maxItems/${c} are not specified or different at path "${a}"`;
        (0, t.checkStrictMode)(v, w, h.strictTuples);
      }
    }
  }
  return Qe.validateTuple = o, Qe.default = n, Qe;
}
var sa;
function bc() {
  if (sa) return Vt;
  sa = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = to(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, e.validateTuple)(r, "items")
  };
  return Vt.default = t, Vt;
}
var Ft = {}, aa;
function Rc() {
  if (aa) return Ft;
  aa = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
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
  return Ft.default = s, Ft;
}
var zt = {}, ia;
function Pc() {
  if (ia) return zt;
  ia = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
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
      const { minContains: v, maxContains: _ } = l;
      m.opts.next ? (i = v === void 0 ? 1 : v, p = _) : i = 1;
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
        const d = s.name("_valid"), g = s.let("count", 0);
        h(d, () => s.if(d, () => a(g)));
      }
      function h(d, g) {
        s.forRange("i", 0, S, (w) => {
          o.subschema({
            keyword: "contains",
            dataProp: w,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, d), g();
        });
      }
      function a(d) {
        s.code((0, e._)`${d}++`), p === void 0 ? s.if((0, e._)`${d} >= ${i}`, () => s.assign(y, !0).break()) : (s.if((0, e._)`${d} > ${p}`, () => s.assign(y, !1).break()), i === 1 ? s.assign(y, !0) : s.if((0, e._)`${d} >= ${i}`, () => s.assign(y, !0)));
      }
    }
  };
  return zt.default = n, zt;
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
        const v = Array.isArray(u[p]) ? m : i;
        v[p] = u[p];
      }
      return [m, i];
    }
    function c(u, m = u.schema) {
      const { gen: i, data: p, it: v } = u;
      if (Object.keys(m).length === 0)
        return;
      const _ = i.let("missing");
      for (const S in m) {
        const y = m[S];
        if (y.length === 0)
          continue;
        const f = (0, n.propertyInData)(i, p, S, v.opts.ownProperties);
        u.setParams({
          property: S,
          depsCount: y.length,
          deps: y.join(", ")
        }), v.allErrors ? i.if(f, () => {
          for (const h of y)
            (0, n.checkReportMissingProp)(u, h);
        }) : (i.if((0, t._)`${f} && (${(0, n.checkMissingProp)(u, y, _)})`), (0, n.reportMissingProp)(u, _), i.else());
      }
    }
    e.validatePropertyDeps = c;
    function l(u, m = u.schema) {
      const { gen: i, data: p, keyword: v, it: _ } = u, S = i.name("valid");
      for (const y in m)
        (0, r.alwaysValidSchema)(_, m[y]) || (i.if(
          (0, n.propertyInData)(i, p, y, _.opts.ownProperties),
          () => {
            const f = u.subschema({ keyword: v, schemaProp: y }, S);
            u.mergeValidEvaluated(f, S);
          },
          () => i.var(S, !0)
          // TODO var
        ), u.ok(S));
    }
    e.validateSchemaDeps = l, e.default = o;
  }(xr)), xr;
}
var Ut = {}, ca;
function Ic() {
  if (ca) return Ut;
  ca = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
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
  return Ut.default = n, Ut;
}
var Gt = {}, ua;
function ro() {
  if (ua) return Gt;
  ua = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
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
      const { gen: l, schema: u, parentSchema: m, data: i, errsCount: p, it: v } = c;
      if (!p)
        throw new Error("ajv implementation error");
      const { allErrors: _, opts: S } = v;
      if (v.props = !0, S.removeAdditional !== "all" && (0, n.alwaysValidSchema)(v, u))
        return;
      const y = (0, e.allSchemaProperties)(m.properties), f = (0, e.allSchemaProperties)(m.patternProperties);
      h(), c.ok((0, t._)`${p} === ${r.default.errors}`);
      function h() {
        l.forIn("key", i, (E) => {
          !y.length && !f.length ? g(E) : l.if(a(E), () => g(E));
        });
      }
      function a(E) {
        let b;
        if (y.length > 8) {
          const I = (0, n.schemaRefOrVal)(v, m.properties, "properties");
          b = (0, e.isOwnProperty)(l, I, E);
        } else y.length ? b = (0, t.or)(...y.map((I) => (0, t._)`${E} === ${I}`)) : b = t.nil;
        return f.length && (b = (0, t.or)(b, ...f.map((I) => (0, t._)`${(0, e.usePattern)(c, I)}.test(${E})`))), (0, t.not)(b);
      }
      function d(E) {
        l.code((0, t._)`delete ${i}[${E}]`);
      }
      function g(E) {
        if (S.removeAdditional === "all" || S.removeAdditional && u === !1) {
          d(E);
          return;
        }
        if (u === !1) {
          c.setParams({ additionalProperty: E }), c.error(), _ || l.break();
          return;
        }
        if (typeof u == "object" && !(0, n.alwaysValidSchema)(v, u)) {
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
  return Gt.default = s, Gt;
}
var Kt = {}, la;
function Nc() {
  if (la) return Kt;
  la = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = mt(), t = Te(), r = ee(), n = ro(), o = {
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
      const v = p.filter((f) => !(0, r.alwaysValidSchema)(i, l[f]));
      if (v.length === 0)
        return;
      const _ = c.name("valid");
      for (const f of v)
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
  return Kt.default = o, Kt;
}
var Ht = {}, fa;
function Oc() {
  if (fa) return Ht;
  fa = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = Te(), t = J(), r = ee(), n = ee(), o = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: c, schema: l, data: u, parentSchema: m, it: i } = s, { opts: p } = i, v = (0, e.allSchemaProperties)(l), _ = v.filter((g) => (0, r.alwaysValidSchema)(i, l[g]));
      if (v.length === 0 || _.length === v.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const S = p.strictSchema && !p.allowMatchingProperties && m.properties, y = c.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, n.evaluatedPropsToName)(c, i.props));
      const { props: f } = i;
      h();
      function h() {
        for (const g of v)
          S && a(g), i.allErrors ? d(g) : (c.var(y, !0), d(g), c.if(y));
      }
      function a(g) {
        for (const w in S)
          new RegExp(g).test(w) && (0, r.checkStrictMode)(i, `property ${w} matches pattern ${g} (use allowMatchingProperties)`);
      }
      function d(g) {
        c.forIn("key", u, (w) => {
          c.if((0, t._)`${(0, e.usePattern)(s, g)}.test(${w})`, () => {
            const E = _.includes(g);
            E || s.subschema({
              keyword: "patternProperties",
              schemaProp: g,
              dataProp: w,
              dataPropType: n.Type.Str
            }, y), i.opts.unevaluated && f !== !0 ? c.assign((0, t._)`${f}[${w}]`, !0) : !E && !i.allErrors && c.if((0, t.not)(y), () => c.break());
          });
        });
      }
    }
  };
  return Ht.default = o, Ht;
}
var Xt = {}, da;
function Tc() {
  if (da) return Xt;
  da = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
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
  return Xt.default = t, Xt;
}
var Bt = {}, ha;
function jc() {
  if (ha) return Bt;
  ha = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Te().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Bt.default = t, Bt;
}
var Wt = {}, ma;
function Ac() {
  if (ma) return Wt;
  ma = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
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
      const m = c, i = s.let("valid", !1), p = s.let("passing", null), v = s.name("_valid");
      o.setParams({ passing: p }), s.block(_), o.result(i, () => o.reset(), () => o.error(!0));
      function _() {
        m.forEach((S, y) => {
          let f;
          (0, t.alwaysValidSchema)(u, S) ? s.var(v, !0) : f = o.subschema({
            keyword: "oneOf",
            schemaProp: y,
            compositeRule: !0
          }, v), y > 0 && s.if((0, e._)`${v} && ${i}`).assign(i, !1).assign(p, (0, e._)`[${p}, ${y}]`).else(), s.if(v, () => {
            s.assign(i, !0), s.assign(p, y), f && o.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return Wt.default = n, Wt;
}
var xt = {}, pa;
function qc() {
  if (pa) return xt;
  pa = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
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
  return xt.default = t, xt;
}
var Jt = {}, ya;
function Cc() {
  if (ya) return Jt;
  ya = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
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
      const p = c.let("valid", !0), v = c.name("_valid");
      if (_(), s.reset(), m && i) {
        const y = c.let("ifClause");
        s.setParams({ ifClause: y }), c.if(v, S("then", y), S("else", y));
      } else m ? c.if(v, S("then")) : c.if((0, e.not)(v), S("else"));
      s.pass(p, () => s.error(!0));
      function _() {
        const y = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, v);
        s.mergeEvaluated(y);
      }
      function S(y, f) {
        return () => {
          const h = s.subschema({ keyword: y }, v);
          c.assign(p, v), s.mergeValidEvaluated(h, p), f ? c.assign(f, (0, e._)`${y}`) : s.setParams({ ifClause: y });
        };
      }
    }
  };
  function o(s, c) {
    const l = s.schema[c];
    return l !== void 0 && !(0, t.alwaysValidSchema)(s, l);
  }
  return Jt.default = n, Jt;
}
var Yt = {}, $a;
function kc() {
  if ($a) return Yt;
  $a = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: o }) {
      n.if === void 0 && (0, e.checkStrictMode)(o, `"${r}" without "if" is ignored`);
    }
  };
  return Yt.default = t, Yt;
}
var va;
function no() {
  if (va) return Mt;
  va = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = eo(), t = bc(), r = to(), n = Rc(), o = Pc(), s = Yn(), c = Ic(), l = ro(), u = Nc(), m = Oc(), i = Tc(), p = jc(), v = Ac(), _ = qc(), S = Cc(), y = kc();
  function f(h = !1) {
    const a = [
      // any
      i.default,
      p.default,
      v.default,
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
  return Mt.default = f, Mt;
}
var Zt = {}, et = {}, ga;
function so() {
  if (ga) return et;
  ga = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.dynamicAnchor = void 0;
  const e = J(), t = Oe(), r = Nr(), n = xn(), o = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (l) => s(l, l.schema)
  };
  function s(l, u) {
    const { gen: m, it: i } = l;
    i.schemaEnv.root.dynamicAnchors[u] = !0;
    const p = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, v = i.errSchemaPath === "#" ? i.validateName : c(l);
    m.if((0, e._)`!${p}`, () => m.assign(p, v));
  }
  et.dynamicAnchor = s;
  function c(l) {
    const { schemaEnv: u, schema: m, self: i } = l.it, { root: p, baseId: v, localRefs: _, meta: S } = u.root, { schemaId: y } = i.opts, f = new r.SchemaEnv({ schema: m, schemaId: y, root: p, baseId: v, localRefs: _, meta: S });
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
        l.if(S, v(S, _), v(m.validateName, _));
      } else
        v(m.validateName, _)();
    }
    function v(_, S) {
      return S ? () => l.block(() => {
        (0, r.callRef)(s, _), l.let(S, !0);
      }) : () => (0, r.callRef)(s, _);
    }
  }
  return tt.dynamicRef = o, tt.default = n, tt;
}
var Qt = {}, Ea;
function Dc() {
  if (Ea) return Qt;
  Ea = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = so(), t = ee(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Qt.default = r, Qt;
}
var er = {}, wa;
function Lc() {
  if (wa) return er;
  wa = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = ao(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, e.dynamicRef)(r, r.schema)
  };
  return er.default = t, er;
}
var Sa;
function Mc() {
  if (Sa) return Zt;
  Sa = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = so(), t = ao(), r = Dc(), n = Lc(), o = [e.default, t.default, r.default, n.default];
  return Zt.default = o, Zt;
}
var tr = {}, rr = {}, ba;
function Vc() {
  if (ba) return rr;
  ba = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = Yn(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (r) => (0, e.validatePropertyDeps)(r)
  };
  return rr.default = t, rr;
}
var nr = {}, Ra;
function Fc() {
  if (Ra) return nr;
  Ra = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Yn(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, e.validateSchemaDeps)(r)
  };
  return nr.default = t, nr;
}
var sr = {}, Pa;
function zc() {
  if (Pa) return sr;
  Pa = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: o }) {
      n.contains === void 0 && (0, e.checkStrictMode)(o, `"${r}" without "contains" is ignored`);
    }
  };
  return sr.default = t, sr;
}
var Ia;
function Uc() {
  if (Ia) return tr;
  Ia = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = Vc(), t = Fc(), r = zc(), n = [e.default, t.default, r.default];
  return tr.default = n, tr;
}
var ar = {}, ir = {}, Na;
function Gc() {
  if (Na) return ir;
  Na = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
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
      const { allErrors: p, props: v } = i;
      v instanceof e.Name ? c.if((0, e._)`${v} !== true`, () => c.forIn("key", u, (f) => c.if(S(v, f), () => _(f)))) : v !== !0 && c.forIn("key", u, (f) => v === void 0 ? _(f) : c.if(y(v, f), () => _(f))), i.props = !0, s.ok((0, e._)`${m} === ${r.default.errors}`);
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
  return ir.default = o, ir;
}
var or = {}, Oa;
function Kc() {
  if (Oa) return or;
  Oa = 1, Object.defineProperty(or, "__esModule", { value: !0 });
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
        const v = s.var("valid", (0, e._)`${i} <= ${m}`);
        s.if((0, e.not)(v), () => p(v, m)), o.ok(v);
      }
      u.items = !0;
      function p(v, _) {
        s.forRange("i", _, i, (S) => {
          o.subschema({ keyword: "unevaluatedItems", dataProp: S, dataPropType: t.Type.Num }, v), u.allErrors || s.if((0, e.not)(v), () => s.break());
        });
      }
    }
  };
  return or.default = n, or;
}
var Ta;
function Hc() {
  if (Ta) return ar;
  Ta = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = Gc(), t = Kc(), r = [e.default, t.default];
  return ar.default = r, ar;
}
var cr = {}, ur = {}, ja;
function Xc() {
  if (ja) return ur;
  ja = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
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
      const { gen: s, data: c, $data: l, schema: u, schemaCode: m, it: i } = n, { opts: p, errSchemaPath: v, schemaEnv: _, self: S } = i;
      if (!p.validateFormats)
        return;
      l ? y() : f();
      function y() {
        const h = s.scopeValue("formats", {
          ref: S.formats,
          code: p.code.formats
        }), a = s.const("fDef", (0, e._)`${h}[${m}]`), d = s.let("fType"), g = s.let("format");
        s.if((0, e._)`typeof ${a} == "object" && !(${a} instanceof RegExp)`, () => s.assign(d, (0, e._)`${a}.type || "string"`).assign(g, (0, e._)`${a}.validate`), () => s.assign(d, (0, e._)`"string"`).assign(g, a)), n.fail$data((0, e.or)(w(), E()));
        function w() {
          return p.strictSchema === !1 ? e.nil : (0, e._)`${m} && !${g}`;
        }
        function E() {
          const b = _.$async ? (0, e._)`(${a}.async ? await ${g}(${c}) : ${g}(${c}))` : (0, e._)`${g}(${c})`, I = (0, e._)`(typeof ${g} == "function" ? ${b} : ${g}.test(${c}))`;
          return (0, e._)`${g} && ${g} !== true && ${d} === ${o} && !${I}`;
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
        const [a, d, g] = E(h);
        a === o && n.pass(b());
        function w() {
          if (p.strictSchema === !1) {
            S.logger.warn(I());
            return;
          }
          throw new Error(I());
          function I() {
            return `unknown format "${u}" ignored in schema at path "${v}"`;
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
            return (0, e._)`await ${g}(${c})`;
          }
          return typeof d == "function" ? (0, e._)`${g}(${c})` : (0, e._)`${g}.test(${c})`;
        }
      }
    }
  };
  return ur.default = r, ur;
}
var Aa;
function io() {
  if (Aa) return cr;
  Aa = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const t = [Xc().default];
  return cr.default = t, cr;
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
  if (Ca) return wt;
  Ca = 1, Object.defineProperty(wt, "__esModule", { value: !0 });
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
  return wt.default = u, wt;
}
var lr = {}, ht = {}, ka;
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
  if (Da) return lr;
  Da = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = J(), t = Wc(), r = Nr(), n = pt(), o = ee(), c = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: l, tagName: u } }) => l === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: l, tag: u, tagName: m } }) => (0, e._)`{error: ${l}, tag: ${m}, tagValue: ${u}}`
    },
    code(l) {
      const { gen: u, data: m, schema: i, parentSchema: p, it: v } = l, { oneOf: _ } = p;
      if (!v.opts.discriminator)
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
        const g = d();
        u.if(!1);
        for (const w in g)
          u.elseIf((0, e._)`${f} === ${w}`), u.assign(y, a(g[w]));
        u.else(), l.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: S }), u.endIf();
      }
      function a(g) {
        const w = u.name("valid"), E = l.subschema({ keyword: "oneOf", schemaProp: g }, w);
        return l.mergeEvaluated(E, e.Name), w;
      }
      function d() {
        var g;
        const w = {}, E = I(p);
        let b = !0;
        for (let k = 0; k < _.length; k++) {
          let F = _[k];
          if (F != null && F.$ref && !(0, o.schemaHasRulesButRef)(F, v.self.RULES)) {
            const q = F.$ref;
            if (F = r.resolveRef.call(v.self, v.schemaEnv.root, v.baseId, q), F instanceof r.SchemaEnv && (F = F.schema), F === void 0)
              throw new n.default(v.opts.uriResolver, v.baseId, q);
          }
          const U = (g = F == null ? void 0 : F.properties) === null || g === void 0 ? void 0 : g[S];
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
  return lr.default = c, lr;
}
var fr = {};
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
}, mu = "https://json-schema.org/draft/2020-12/schema", pu = "https://json-schema.org/draft/2020-12/meta/unevaluated", yu = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, $u = "meta", vu = "Unevaluated applicator vocabulary meta-schema", gu = ["object", "boolean"], _u = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Eu = {
  $schema: mu,
  $id: pu,
  $vocabulary: yu,
  $dynamicAnchor: $u,
  title: vu,
  type: gu,
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
  if (La) return fr;
  La = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
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
    ].forEach((v) => this.addMetaSchema(v, void 0, !1)), this;
    function p(v, _) {
      return i ? v.$dataMetaSchema(_, u) : _;
    }
  }
  return fr.default = m, fr;
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
    var u = mt();
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
    var p = pt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return p.default;
    } });
  }($t, $t.exports)), $t.exports;
}
var dl = fl(), dr = { exports: {} }, Jr = {}, Va;
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
      "date-time": t(v(!0), _),
      "iso-time": t(u(), i),
      "iso-date-time": t(v(), S),
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
    function v(k) {
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
    const g = -2147483648, w = 2 ** 31 - 1;
    function E(k) {
      return Number.isInteger(k) && k <= w && k >= g;
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
var Yr = {}, hr = { exports: {} }, mr = {}, Fa;
function ml() {
  if (Fa) return mr;
  Fa = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = Zi(), t = Qi(), r = no(), n = io(), o = oo(), s = [
    e.default,
    t.default,
    (0, r.default)(),
    n.default,
    o.metadataVocabulary,
    o.contentVocabulary
  ];
  return mr.default = s, mr;
}
const pl = "http://json-schema.org/draft-07/schema#", yl = "http://json-schema.org/draft-07/schema#", $l = "Core schema meta-schema", vl = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, gl = ["object", "boolean"], _l = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, El = {
  $schema: pl,
  $id: yl,
  title: $l,
  definitions: vl,
  type: gl,
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
    var m = mt();
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
    var v = pt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return v.default;
    } });
  }(hr, hr.exports)), hr.exports;
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
        const { gen: u, data: m, schemaCode: i, keyword: p, it: v } = l, { opts: _, self: S } = v;
        if (!_.validateFormats)
          return;
        const y = new t.KeywordCxt(v, S.RULES.all.format.definition, "format");
        y.$data ? f() : h();
        function f() {
          const d = u.scopeValue("formats", {
            ref: S.formats,
            code: _.code.formats
          }), g = u.const("fmt", (0, r._)`${d}[${y.schemaCode}]`);
          l.fail$data((0, r.or)((0, r._)`typeof ${g} != "object"`, (0, r._)`${g} instanceof RegExp`, (0, r._)`typeof ${g}.compare != "function"`, a(g)));
        }
        function h() {
          const d = y.schema, g = S.formats[d];
          if (!g || g === !0)
            return;
          if (typeof g != "object" || g instanceof RegExp || typeof g.compare != "function")
            throw new Error(`"${p}": format "${d}" does not define "compare" function`);
          const w = u.scopeValue("formats", {
            key: d,
            ref: g,
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
      const [p, v] = i.mode === "fast" ? [r.fastFormats, c] : [r.fullFormats, s], _ = i.formats || r.formatNames;
      return u(m, _, p, v), i.keywords && (0, n.default)(m), m;
    };
    l.get = (m, i = "full") => {
      const v = (i === "fast" ? r.fastFormats : r.fullFormats)[m];
      if (!v)
        throw new Error(`Unknown format "${m}"`);
      return v;
    };
    function u(m, i, p, v) {
      var _, S;
      (_ = (S = m.opts.code).formats) !== null && _ !== void 0 || (S.formats = (0, o._)`require("ajv-formats/dist/formats").${v}`);
      for (const y of i)
        m.addFormat(y, p[y]);
    }
    e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  }(dr, dr.exports)), dr.exports;
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
    const p = this, v = () => {
      c = void 0, l && (clearTimeout(l), l = void 0), s && (u = e.apply(p, i));
    }, _ = () => {
      l = void 0, c && (clearTimeout(c), c = void 0), s && (u = e.apply(p, i));
    }, S = o && !c;
    return clearTimeout(c), c = setTimeout(v, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(_, n)), S && (u = e.apply(p, i)), u;
  };
  return Cl(m, e), m.cancel = () => {
    c && (clearTimeout(c), c = void 0), l && (clearTimeout(l), l = void 0);
  }, m;
};
var pr = { exports: {} }, Zr, Ha;
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
function yt() {
  return Ba || (Ba = 1, function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: o
    } = Or(), s = Tr();
    t = e.exports = {};
    const c = t.re = [], l = t.safeRe = [], u = t.src = [], m = t.safeSrc = [], i = t.t = {};
    let p = 0;
    const v = "[a-zA-Z0-9-]", _ = [
      ["\\s", 1],
      ["\\d", o],
      [v, n]
    ], S = (f) => {
      for (const [h, a] of _)
        f = f.split(`${h}*`).join(`${h}{0,${a}}`).split(`${h}+`).join(`${h}{1,${a}}`);
      return f;
    }, y = (f, h, a) => {
      const d = S(h), g = p++;
      s(f, g, h), i[f] = g, u[g] = h, m[g] = d, c[g] = new RegExp(h, a ? "g" : void 0), l[g] = new RegExp(d, a ? "g" : void 0);
    };
    y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${v}*`), y("MAINVERSION", `(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${u[i.NUMERICIDENTIFIER]}|${u[i.NONNUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${u[i.NUMERICIDENTIFIERLOOSE]}|${u[i.NONNUMERICIDENTIFIER]})`), y("PRERELEASE", `(?:-(${u[i.PRERELEASEIDENTIFIER]}(?:\\.${u[i.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${u[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[i.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${v}+`), y("BUILD", `(?:\\+(${u[i.BUILDIDENTIFIER]}(?:\\.${u[i.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${u[i.MAINVERSION]}${u[i.PRERELEASE]}?${u[i.BUILD]}?`), y("FULL", `^${u[i.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${u[i.MAINVERSIONLOOSE]}${u[i.PRERELEASELOOSE]}?${u[i.BUILD]}?`), y("LOOSE", `^${u[i.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${u[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${u[i.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:${u[i.PRERELEASE]})?${u[i.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:${u[i.PRERELEASELOOSE]})?${u[i.BUILD]}?)?)?`), y("XRANGE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${u[i.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", u[i.COERCEPLAIN] + `(?:${u[i.PRERELEASE]})?(?:${u[i.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", u[i.COERCE], !0), y("COERCERTLFULL", u[i.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${u[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${u[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${u[i.LONECARET]}${u[i.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${u[i.LONECARET]}${u[i.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${u[i.GTLT]}\\s*(${u[i.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]}|${u[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${u[i.XRANGEPLAIN]})\\s+-\\s+(${u[i.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${u[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[i.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }(pr, pr.exports)), pr.exports;
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
  const e = Tr(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = Or(), { safeRe: n, safeSrc: o, t: s } = yt(), c = Zn(), { compareIdentifiers: l } = uo();
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
      const v = i.trim().match(p.loose ? n[s.LOOSE] : n[s.FULL]);
      if (!v)
        throw new TypeError(`Invalid Version: ${i}`);
      if (this.raw = i, this.major = +v[1], this.minor = +v[2], this.patch = +v[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      v[4] ? this.prerelease = v[4].split(".").map((_) => {
        if (/^[0-9]+$/.test(_)) {
          const S = +_;
          if (S >= 0 && S < r)
            return S;
        }
        return _;
      }) : this.prerelease = [], this.build = v[5] ? v[5].split(".") : [], this.format();
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
        const v = this.prerelease[p], _ = i.prerelease[p];
        if (e("prerelease compare", p, v, _), v === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if (v === void 0)
          return -1;
        if (v === _)
          continue;
        return l(v, _);
      } while (++p);
    }
    compareBuild(i) {
      i instanceof u || (i = new u(i, this.options));
      let p = 0;
      do {
        const v = this.build[p], _ = i.build[p];
        if (e("build compare", p, v, _), v === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if (v === void 0)
          return -1;
        if (v === _)
          continue;
        return l(v, _);
      } while (++p);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(i, p, v) {
      if (i.startsWith("pre")) {
        if (!p && v === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (p) {
          const _ = new RegExp(`^${this.options.loose ? o[s.PRERELEASELOOSE] : o[s.PRERELEASE]}$`), S = `-${p}`.match(_);
          if (!S || S[1] !== p)
            throw new Error(`invalid identifier: ${p}`);
        }
      }
      switch (i) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", p, v);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", p, v);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", p, v), this.inc("pre", p, v);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", p, v), this.inc("pre", p, v);
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
          const _ = Number(v) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [_];
          else {
            let S = this.prerelease.length;
            for (; --S >= 0; )
              typeof this.prerelease[S] == "number" && (this.prerelease[S]++, S = -2);
            if (S === -1) {
              if (p === this.prerelease.join(".") && v === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(_);
            }
          }
          if (p) {
            let S = [p, _];
            v === !1 && (S = [p]), l(this.prerelease[0], p) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = S) : this.prerelease = S;
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
    const v = i ? "pre" : "";
    return o.major !== s.major ? v + "major" : o.minor !== s.minor ? v + "minor" : o.patch !== s.patch ? v + "patch" : "prerelease";
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
var vn, fi;
function Xl() {
  if (fi) return vn;
  fi = 1;
  const e = Qn();
  return vn = (r, n) => r.sort((o, s) => e(s, o, n)), vn;
}
var gn, di;
function jr() {
  if (di) return gn;
  di = 1;
  const e = je();
  return gn = (r, n, o) => e(r, n, o) > 0, gn;
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
var Rn, vi;
function ho() {
  if (vi) return Rn;
  vi = 1;
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
var Pn, gi;
function Bl() {
  if (gi) return Pn;
  gi = 1;
  const e = ye(), t = at(), { safeRe: r, t: n } = yt();
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
    const u = l[2], m = l[3] || "0", i = l[4] || "0", p = c.includePrerelease && l[5] ? `-${l[5]}` : "", v = c.includePrerelease && l[6] ? `+${l[6]}` : "";
    return t(`${u}.${m}.${i}${p}${v}`, c);
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
      D = D.replace(A, F(this.options.includePrerelease)), c("hyphen replace", D), D = D.replace(u[m.COMPARATORTRIM], i), c("comparator trim", D), D = D.replace(u[m.TILDETRIM], p), c("tilde trim", D), D = D.replace(u[m.CARETTRIM], v), c("caret trim", D);
      let P = D.split(" ").map((R) => a(R, this.options)).join(" ").split(/\s+/).map((R) => k(R, this.options));
      H && (P = P.filter((R) => (c("loose invalid filter", R, this.options), !!R.match(u[m.COMPARATORLOOSE])))), c("range list", P);
      const j = /* @__PURE__ */ new Map(), N = P.map((R) => new s(R, this.options));
      for (const R of N) {
        if (y(R))
          return [R];
        j.set(R.value, R);
      }
      j.size > 1 && j.has("") && j.delete("");
      const $ = [...j.values()];
      return n.set(G, $), $;
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
    caretTrimReplace: v
  } = yt(), { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: S } = Or(), y = (q) => q.value === "<0.0.0-0", f = (q) => q.value === "", h = (q, D) => {
    let X = !0;
    const G = q.slice();
    let z = G.pop();
    for (; X && G.length; )
      X = G.every((H) => z.intersects(H, D)), z = G.pop();
    return X;
  }, a = (q, D) => (c("comp", q, D), q = E(q, D), c("caret", q), q = g(q, D), c("tildes", q), q = I(q, D), c("xrange", q), q = K(q, D), c("stars", q), q), d = (q) => !q || q.toLowerCase() === "x" || q === "*", g = (q, D) => q.trim().split(/\s+/).map((X) => w(X, D)).join(" "), w = (q, D) => {
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
      const N = d(H), $ = N || d(A), R = $ || d(P), C = R;
      return z === "=" && C && (z = ""), j = D.includePrerelease ? "-0" : "", N ? z === ">" || z === "<" ? G = "<0.0.0-0" : G = "*" : z && C ? ($ && (A = 0), P = 0, z === ">" ? (z = ">=", $ ? (H = +H + 1, A = 0, P = 0) : (A = +A + 1, P = 0)) : z === "<=" && (z = "<", $ ? H = +H + 1 : A = +A + 1), z === "<" && (j = "-0"), G = `${z + H}.${A}.${P}${j}`) : $ ? G = `>=${H}.0.0${j} <${+H + 1}.0.0-0` : R && (G = `>=${H}.${A}.0${j} <${H}.${+A + 1}.0-0`), c("xRange return", G), G;
    });
  }, K = (q, D) => (c("replaceStars", q, D), q.trim().replace(u[m.STAR], "")), k = (q, D) => (c("replaceGTE0", q, D), q.trim().replace(u[D.includePrerelease ? m.GTE0PRE : m.GTE0], "")), F = (q) => (D, X, G, z, H, A, P, j, N, $, R, C) => (d(G) ? X = "" : d(z) ? X = `>=${G}.0.0${q ? "-0" : ""}` : d(H) ? X = `>=${G}.${z}.0${q ? "-0" : ""}` : A ? X = `>=${X}` : X = `>=${X}${q ? "-0" : ""}`, d(N) ? j = "" : d($) ? j = `<${+N + 1}.0.0-0` : d(R) ? j = `<${N}.${+$ + 1}.0-0` : C ? j = `<=${N}.${$}.${R}-${C}` : q ? j = `<${N}.${$}.${+R + 1}-0` : j = `<=${j}`, `${X} ${j}`.trim()), U = (q, D, X) => {
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
      const p = this.options.loose ? n[o.COMPARATORLOOSE] : n[o.COMPARATOR], v = i.match(p);
      if (!v)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = v[1] !== void 0 ? v[1] : "", this.operator === "=" && (this.operator = ""), v[2] ? this.semver = new l(v[2], this.options.loose) : this.semver = e;
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
  const r = Zn(), { safeRe: n, t: o } = yt(), s = ho(), c = Tr(), l = ye(), u = Ae();
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
  return Dn = (i, p, v, _) => {
    i = new e(i, _), p = new n(p, _);
    let S, y, f, h, a;
    switch (v) {
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
      const g = p.set[d];
      let w = null, E = null;
      if (g.forEach((b) => {
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
    const u = r.sort((v, _) => t(v, _, o));
    for (const v of u)
      e(v, n, o) ? (l = v, c || (c = v)) : (l && s.push([c, l]), l = null, c = null);
    c && s.push([c, null]);
    const m = [];
    for (const [v, _] of s)
      v === _ ? m.push(v) : !_ && v === u[0] ? m.push("*") : _ ? v === u[0] ? m.push(`<=${_}`) : m.push(`${v} - ${_}`) : m.push(`>=${v}`);
    const i = m.join(" || "), p = typeof n.raw == "string" ? n.raw : String(n);
    return i.length < p.length ? i : n;
  }, Fn;
}
var zn, Ci;
function sf() {
  if (Ci) return zn;
  Ci = 1;
  const e = Ae(), t = Ar(), { ANY: r } = t, n = qr(), o = je(), s = (p, v, _ = {}) => {
    if (p === v)
      return !0;
    p = new e(p, _), v = new e(v, _);
    let S = !1;
    e: for (const y of p.set) {
      for (const f of v.set) {
        const h = u(y, f, _);
        if (S = S || h !== null, h)
          continue e;
      }
      if (S)
        return !1;
    }
    return !0;
  }, c = [new t(">=0.0.0-0")], l = [new t(">=0.0.0")], u = (p, v, _) => {
    if (p === v)
      return !0;
    if (p.length === 1 && p[0].semver === r) {
      if (v.length === 1 && v[0].semver === r)
        return !0;
      _.includePrerelease ? p = c : p = l;
    }
    if (v.length === 1 && v[0].semver === r) {
      if (_.includePrerelease)
        return !0;
      v = l;
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
      for (const M of v)
        if (!n(I, String(M), _))
          return !1;
      return !0;
    }
    let a, d, g, w, E = f && !_.includePrerelease && f.semver.prerelease.length ? f.semver : !1, b = y && !_.includePrerelease && y.semver.prerelease.length ? y.semver : !1;
    E && E.prerelease.length === 1 && f.operator === "<" && E.prerelease[0] === 0 && (E = !1);
    for (const I of v) {
      if (w = w || I.operator === ">" || I.operator === ">=", g = g || I.operator === "<" || I.operator === "<=", y) {
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
    return !(y && g && !f && h !== 0 || f && w && !y && h !== 0 || b || E);
  }, m = (p, v, _) => {
    if (!p)
      return v;
    const S = o(p.semver, v.semver, _);
    return S > 0 ? p : S < 0 || v.operator === ">" && p.operator === ">=" ? v : p;
  }, i = (p, v, _) => {
    if (!p)
      return v;
    const S = o(p.semver, v.semver, _);
    return S < 0 ? p : S > 0 || v.operator === "<" && p.operator === "<=" ? v : p;
  };
  return zn = s, zn;
}
var Un, ki;
function af() {
  if (ki) return Un;
  ki = 1;
  const e = yt(), t = Or(), r = ye(), n = uo(), o = at(), s = kl(), c = Dl(), l = Ll(), u = Ml(), m = Vl(), i = Fl(), p = zl(), v = Ul(), _ = je(), S = Gl(), y = Kl(), f = Qn(), h = Hl(), a = Xl(), d = jr(), g = es(), w = lo(), E = fo(), b = ts(), I = rs(), M = ho(), K = Bl(), k = Ar(), F = Ae(), U = qr(), q = xl(), D = Jl(), X = Yl(), G = Zl(), z = Ql(), H = ns(), A = ef(), P = tf(), j = rf(), N = nf(), $ = sf();
  return Un = {
    parse: o,
    valid: s,
    clean: c,
    inc: l,
    diff: u,
    major: m,
    minor: i,
    patch: p,
    prerelease: v,
    compare: _,
    rcompare: S,
    compareLoose: y,
    compareBuild: f,
    sort: h,
    rsort: a,
    gt: d,
    lt: g,
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
    subset: $,
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
const yr = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Li(e, t = "utf8") {
  return mf(e), yr[t] ?? (yr[t] = new globalThis.TextDecoder(t)), yr[t].decode(e);
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
const $f = Pl.default, Mi = "aes-256-cbc", nt = () => /* @__PURE__ */ Object.create(null), vf = (e) => e != null, gf = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, $r = "__internal__", Kn = `${$r}.migrations.version`;
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
      throw new TypeError(`Please don't use the ${$r} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, o = (s, c) => {
      gf(s, c), ae(this, Ee).accessPropertiesByDotNotation ? cs(n, s, c) : n[s] = c;
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
      vf(ae(this, Me)[r]) && this.set(r, ae(this, Me)[r]);
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
    if (oe.env.SNAP)
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
    this._ensureDirectory(), Y.existsSync(this.path) || this._write(nt()), oe.platform === "win32" ? Y.watch(this.path, { persistent: !1 }, Ka(() => {
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
    return typeof t == "object" && Object.keys(t)[0] === $r ? !0 : typeof t != "string" ? !1 : ae(this, Ee).accessPropertiesByDotNotation ? !!t.startsWith(`${$r}.`) : !1;
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
const { app: vr, ipcMain: Hn, shell: Ef } = Er;
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
    if (oe.type === "renderer") {
      const o = Er.ipcRenderer.sendSync("electron-store-get-data");
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
if (typeof Er == "string")
  throw new TypeError("Not running in an Electron environment!");
const { env: $o } = process, wf = "ELECTRON_IS_DEV" in $o, Sf = Number.parseInt($o.ELECTRON_IS_DEV, 10) === 1, bf = wf ? Sf : !Er.app.isPackaged, pe = new yo({
  name: "children-rewards-data",
  fileExtension: "json",
  cwd: Xe.getPath("userData")
  // 初始时使用默认的userData目录
}), vo = () => pe.get("dataDir") || Xe.getPath("userData"), Rf = () => Ie.join(vo(), "images");
let Ve = Rf();
Xe.whenReady().then(() => {
  be.mkdirSync(Ve, {
    recursive: !0,
    mode: 493
    // 设置目录权限为rwxr-xr-x
  });
});
Ne.handle("set-data-dir", async (e, t) => {
  try {
    await be.promises.mkdir(t, { recursive: !0 }), pe.set("dataDir", t);
    const r = Ie.join(t, "images");
    if (await be.promises.mkdir(r, { recursive: !0 }), Ve !== r && be.existsSync(Ve)) {
      const s = await be.promises.readdir(Ve);
      for (const c of s) {
        const l = Ie.join(Ve, c), u = Ie.join(r, c);
        await be.promises.copyFile(l, u);
      }
    }
    Ve = r;
    const n = new yo({
      name: "children-rewards-data",
      fileExtension: "json",
      cwd: t
    }), o = {
      children: pe.get("children", []),
      rewards: pe.get("rewards", [])
    };
    return Object.assign(pe, n), pe.set("children", o.children), pe.set("rewards", o.rewards), { success: !0 };
  } catch (r) {
    return console.error("设置数据目录失败:", r), { success: !1, error: String(r) };
  }
});
Ne.handle("get-data-dir", () => vo());
const Pf = wo(import.meta.url), zi = Ie.dirname(Pf);
let Se = null;
function Ui() {
  Se = new Gi({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: Ie.join(zi, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), bf ? (Se.loadURL("http://localhost:5173"), Se.webContents.openDevTools()) : Se.loadFile(Ie.join(zi, "../dist/index.html")), Se.on("closed", () => {
    Se = null;
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
Ne.handle("save-children", (e, t) => (pe.set("children", t), { success: !0 }));
Ne.handle("get-children", () => pe.get("children", []));
Ne.handle("save-rewards", (e, t) => (pe.set("rewards", t), { success: !0 }));
Ne.handle("get-rewards", () => pe.get("rewards", []));
Ne.handle("save-image", async (e, { imageData: t, fileName: r }) => {
  try {
    const n = t.replace(/^data:image\/\w+;base64,/, ""), o = Buffer.from(n, "base64"), s = Ie.join(Ve, r);
    return be.writeFileSync(s, o), { success: !0, path: s };
  } catch (n) {
    return console.error("保存图片失败:", n), { success: !1, error: String(n) };
  }
});
Ne.handle("select-image", async () => {
  try {
    const e = await wr.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] }]
    });
    if (e.canceled) return { canceled: !0 };
    const t = e.filePaths[0], r = Ie.basename(t), n = Ie.join(Ve, r);
    return await be.promises.mkdir(Ve, { recursive: !0 }), await be.promises.copyFile(t, n), await be.promises.chmod(n, 420), {
      canceled: !1,
      filePath: n,
      fileName: r
    };
  } catch (e) {
    return console.error("文件操作失败:", e), {
      error: e instanceof Error ? e.message : "未知错误"
    };
  }
});
Ne.handle("export-data", async () => {
  if (!Se) return { success: !1, error: "窗口未创建" };
  const e = await wr.showSaveDialog(Se, {
    title: "导出数据",
    defaultPath: Ie.join(
      Xe.getPath("documents"),
      "children-rewards-data.json"
    ),
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (e.canceled || !e.filePath)
    return { success: !1, canceled: !0 };
  try {
    const t = {
      children: pe.get("children", []),
      rewards: pe.get("rewards", [])
    };
    return be.writeFileSync(e.filePath, JSON.stringify(t, null, 2)), { success: !0 };
  } catch (t) {
    return console.error("导出数据失败:", t), { success: !1, error: String(t) };
  }
});
Ne.handle("import-data", async () => {
  if (!Se) return { success: !1, error: "窗口未创建" };
  const e = await wr.showOpenDialog(Se, {
    title: "导入数据",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }]
  });
  if (e.canceled || e.filePaths.length === 0)
    return { success: !1, canceled: !0 };
  try {
    const t = e.filePaths[0], r = be.readFileSync(t, "utf8"), n = JSON.parse(r);
    return n.children && pe.set("children", n.children), n.rewards && pe.set("rewards", n.rewards), { success: !0 };
  } catch (t) {
    return console.error("导入数据失败:", t), { success: !1, error: String(t) };
  }
});
Ne.handle("select-data-dir", async () => {
  if (!Se) return { canceled: !0 };
  try {
    const e = await wr.showOpenDialog(Se, {
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
