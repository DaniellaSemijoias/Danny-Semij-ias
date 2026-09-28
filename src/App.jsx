import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as api from "./api";

/* ===========================================================================
   DANNY SEMIJOIAS — Gestão de peças, vendas, clientes e comissão
   =========================================================================== */

const T = {
  bg: "#FDF4F7", bg2: "#F9E9EF", card: "#FFFFFF",
  ink: "#3B2230", ink2: "#7C6270", ink3: "#A8909C", line: "#F0DDE5",
  vinho: "#6B1F4A", vinhoHover: "#56163B", vinhoSoft: "#FAEAF2",
  rose: "#C9899B", roseSoft: "#FBEFF2", roxo: "#8E2D6B",
  ok: "#2F855A", okSoft: "#E9F6EF",
  warn: "#B7791F", warnSoft: "#FDF5E7",
  err: "#C53030", errSoft: "#FDECEC",
  zap: "#25D366",
};
const SERIF = `"Playfair Display", Georgia, serif`;
const FONT = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
const SOMBRA = "0 1px 2px rgba(59,34,48,.04), 0 2px 8px rgba(59,34,48,.05)";
const SOMBRA_ALTA = "0 14px 44px rgba(59,34,48,.18)";
const ARQUIVOS = "https://qgdjigwgtzykmrakqoep.supabase.co/storage/v1/object/public/danny/";

const brl = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (n) => (Number(n) || 0).toLocaleString("pt-BR");
const dia = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const diaHora = (d) => (d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
const mesISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
const mesNome = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso.length === 7 ? iso + "-01T12:00:00" : iso + "T12:00:00");
  const s = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/* --------------------------------- Ícones --------------------------------- */
const ICONES = {
  inicio: "M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1h4v-6h3v6h4a1 1 0 0 0 1-1V9.5",
  pecas: "M6 3h12l3 6-9 12-9-12zM3 9h18M9 3 6 9l6 12M15 3l3 6-6 12",
  estoque: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  vendas: "M20.6 13.4 12 22l-9-9V4a1 1 0 0 1 1-1h8l8.6 8.6a2 2 0 0 1 0 2.8M7.5 7.5h.01",
  clientes: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1.5a4 4 0 0 0-3-3.85M16.5 3.8a3.5 3.5 0 0 1 0 6.4",
  comissao: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 6.5v11M14.3 9.6c0-1-1-1.8-2.3-1.8s-2.3.8-2.3 1.8 1 1.5 2.3 1.9 2.3.9 2.3 1.9-1 1.8-2.3 1.8-2.3-.8-2.3-1.8",
  relatorios: "M3 3v16a2 2 0 0 0 2 2h16M7.5 15.5v-3M12 15.5v-7M16.5 15.5v-5",
  ajustes: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.4 14a1.5 1.5 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.5 1.5 0 0 0-2.5 1v.3a2 2 0 1 1-4 0V19a1.5 1.5 0 0 0-2.6-1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.5 1.5 0 0 0-1-2.5H4a2 2 0 1 1 0-4h.2a1.5 1.5 0 0 0 1-2.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.5 1.5 0 0 0 2.5-1V4a2 2 0 1 1 4 0v.2a1.5 1.5 0 0 0 2.5 1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.5 1.5 0 0 0 1 2.5h.2a2 2 0 1 1 0 4H20a1.5 1.5 0 0 0-1.4 1z",
  mais: "M12 5v14M5 12h14",
  busca: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3",
  voltar: "m15 18-6-6 6-6",
  avancar: "m9 18 6-6-6-6",
  fechar: "M18 6 6 18M6 6l12 12",
  check: "m20 6-11 11-5-5",
  lixo: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6",
  editar: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12",
  entrada: "m12 5 7 7-7 7M19 12H5",
  saida: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  relogio: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  alerta: "M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0",
  whats: "M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1 1 21 11.5",
  voltarSeta: "M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-4",
};
function Icone({ n, s = 18, cor = "currentColor", w = 1.75, style }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={w}
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} aria-hidden="true">
      <path d={ICONES[n] || ICONES.pecas} />
    </svg>
  );
}

const NAV = [
  { id: "inicio", label: "Início" },
  { id: "pecas", label: "Peças" },
  { id: "estoque", label: "Estoque" },
  { id: "vendas", label: "Vendas" },
  { id: "clientes", label: "Clientes" },
  { id: "comissao", label: "Comissão" },
  { id: "relatorios", label: "Relatórios" },
  { id: "ajustes", label: "Ajustes" },
];

/* ------------------- Voltar do celular fecha a tela aberta ----------------- */
const pilha = [];
function useVoltar(ativo, aoFechar) {
  const ref = useRef(aoFechar);
  ref.current = aoFechar;
  useEffect(() => {
    if (!ativo) return;
    const fn = () => { if (ref.current) ref.current(); };
    pilha.push(fn);
    return () => { const i = pilha.lastIndexOf(fn); if (i >= 0) pilha.splice(i, 1); };
  }, [ativo]);
}

/* ---------------------------------- CSS ----------------------------------- */
const CSS = `*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:${T.bg};color:${T.ink};font-family:${FONT};-webkit-font-smoothing:antialiased}
input,select,textarea,button{font-family:inherit}
@keyframes dnFade{from{opacity:0}to{opacity:1}}
@keyframes dnUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dnSheet{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes dnGira{to{transform:rotate(360deg)}}
.dn-up{animation:dnUp .24s cubic-bezier(.16,1,.3,1) both}
.dn-fade{animation:dnFade .2s ease both}
.dn-scroll::-webkit-scrollbar{width:8px;height:8px}
.dn-scroll::-webkit-scrollbar-thumb{background:#E6CCD8;border-radius:99px}
.dn-x::-webkit-scrollbar{height:0}
.dn-btn{transition:background .16s ease,border-color .16s ease,color .16s ease,transform .12s ease,box-shadow .18s}
.dn-btn:active:not(:disabled){transform:scale(.985)}
.dn-card{transition:box-shadow .2s ease,border-color .2s ease,transform .2s ease}
.dn-click:hover{border-color:#E9C9D8;box-shadow:0 6px 20px rgba(59,34,48,.08)}
.dn-in{transition:border-color .16s ease,box-shadow .16s ease}
.dn-in:focus{outline:none;border-color:${T.vinho};box-shadow:0 0 0 3px rgba(107,31,74,.12)}
.dn-linha:hover{background:${T.bg2}}
.dn-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dn-3col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
@media(max-width:560px){.dn-2col{grid-template-columns:1fr}.dn-3col{grid-template-columns:1fr 1fr}}
`;

/* -------------------------------- UI base --------------------------------- */
const estiloEntrada = {
  width: "100%", padding: "11px 13px", fontSize: 14.5, borderRadius: 11,
  border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontWeight: 500,
};
function Entrada(p) { return <input {...p} className="dn-in" style={{ ...estiloEntrada, ...p.style }} />; }
function Selecao(p) { return <select {...p} className="dn-in" style={{ ...estiloEntrada, ...p.style }} />; }
function Area(p) { return <textarea {...p} className="dn-in" style={{ ...estiloEntrada, minHeight: 84, resize: "vertical", ...p.style }} />; }

function Campo({ label, children, dica, obrigatorio }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>
        {label}{obrigatorio && <span style={{ color: T.err }}> *</span>}
      </span>
      {children}
      {dica && <span style={{ display: "block", fontSize: 12, color: T.ink3, marginTop: 5 }}>{dica}</span>}
    </label>
  );
}

function Botao({ children, onClick, tipo = "primario", icone, tamanho = "m", disabled, style, type }) {
  const tam = { s: { padding: "7px 12px", fontSize: 13 }, m: { padding: "10px 16px", fontSize: 14 }, g: { padding: "13px 20px", fontSize: 15 } };
  const tipos = {
    primario: { background: T.vinho, color: "#fff", border: "1px solid transparent" },
    suave: { background: T.vinhoSoft, color: T.vinho, border: "1px solid transparent" },
    neutro: { background: "#fff", color: T.ink, border: `1px solid ${T.line}` },
    fantasma: { background: "transparent", color: T.ink2, border: "1px solid transparent" },
    zap: { background: T.zap, color: "#fff", border: "1px solid transparent" },
    perigo: { background: "#fff", color: T.err, border: "1px solid #F3C9C9" },
  };
  return (
    <button type={type || "button"} onClick={onClick} disabled={disabled} className="dn-btn"
      onMouseEnter={(e) => { if (!disabled && tipo === "primario") e.currentTarget.style.background = T.vinhoHover; }}
      onMouseLeave={(e) => { if (!disabled && tipo === "primario") e.currentTarget.style.background = T.vinho; }}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 11, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, whiteSpace: "nowrap", ...tam[tamanho], ...tipos[tipo], ...style }}>
      {icone && <Icone n={icone} s={tamanho === "s" ? 15 : 17} />}
      {children}
    </button>
  );
}

function Cartao({ children, style, onClick }) {
  return (
    <div onClick={onClick} className={`dn-card ${onClick ? "dn-click" : ""}`}
      style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, boxShadow: SOMBRA, cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function Selo({ children, cor = T.ink2, fundo = T.bg2, ponto }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: fundo, color: cor, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {ponto && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cor }} />}
      {children}
    </span>
  );
}

function Titulo({ children, sub, acao }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "4px 0 18px" }}>
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, margin: 0 }}>{children}</h2>
        {sub && <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 3 }}>{sub}</div>}
      </div>
      {acao}
    </div>
  );
}

function Vazio({ children, icone = "pecas" }) {
  return (
    <div style={{ padding: "44px 20px", textAlign: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: T.vinhoSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icone n={icone} s={20} cor={T.rose} />
      </div>
      <div style={{ fontSize: 14, color: T.ink2 }}>{children}</div>
    </div>
  );
}

function Modal({ aberto, aoFechar, titulo, sub, children, largo, rodape }) {
  useVoltar(!!aberto, aoFechar);
  if (!aberto) return null;
  return (
    <div className="dn-fade" onClick={aoFechar}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, height: "100dvh", background: "rgba(59,34,48,.45)", zIndex: 90, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={(e) => e.stopPropagation()} className="dn-scroll"
        style={{ background: "#fff", width: "100%", maxWidth: largo ? 760 : 520, maxHeight: "92dvh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", borderRadius: "22px 22px 0 0", boxShadow: SOMBRA_ALTA, animation: "dnSheet .26s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2, padding: "18px 20px 14px", borderBottom: `1px solid ${T.line}`, borderRadius: "22px 22px 0 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 19, fontWeight: 600 }}>{titulo}</h3>
              {sub && <div style={{ fontSize: 13, color: T.ink2, marginTop: 3 }}>{sub}</div>}
            </div>
            <button onClick={aoFechar} aria-label="Fechar" className="dn-btn"
              style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: T.bg2, color: T.ink2, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <Icone n="fechar" s={16} />
            </button>
          </div>
        </div>
        <div style={{ padding: "18px 20px 22px" }}>{children}</div>
        {rodape && <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: `1px solid ${T.line}`, padding: "14px 20px", display: "flex", gap: 10 }}>{rodape}</div>}
      </div>
    </div>
  );
}

function Aviso({ msg }) {
  if (!msg) return null;
  const cores = { ok: [T.ok, T.okSoft], erro: [T.err, T.errSoft], info: [T.vinho, T.vinhoSoft], alerta: [T.warn, T.warnSoft] };
  const [cor, fundo] = cores[msg.tipo] || cores.info;
  return (
    <div className="dn-up" style={{ position: "fixed", left: 12, right: 12, bottom: 84, zIndex: 120, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: "#fff", borderLeft: `3px solid ${cor}`, color: T.ink, padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: SOMBRA_ALTA, maxWidth: 440, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, background: fundo, color: cor, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icone n={msg.tipo === "erro" ? "alerta" : "check"} s={13} />
        </span>
        {msg.texto}
      </div>
    </div>
  );
}

/* O bucket pode ter o arquivo como icone.jpg, ICONE.JPG, Icone.jpeg…
   Tenta as grafias até uma carregar; se nenhuma vier, usa o monograma. */
const VARIANTES = (nome) => {
  const bases = [nome, nome.toUpperCase(), nome.charAt(0).toUpperCase() + nome.slice(1)];
  const exts = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];
  const lista = [];
  bases.forEach((b) => exts.forEach((e) => lista.push(ARQUIVOS + encodeURIComponent(`${b}.${e}`))));
  return [...new Set(lista)];
};

function ImgArquivo({ nome, alt, style, reserva }) {
  const urls = useMemo(() => VARIANTES(nome), [nome]);
  const [k, setK] = useState(0);
  if (k >= urls.length) return reserva || null;
  return <img src={urls[k]} alt={alt} onError={() => setK(k + 1)} style={style} />;
}

function Marca({ s = 36 }) {
  const base = { width: s, height: s, borderRadius: 12, flexShrink: 0, objectFit: "cover", border: `1px solid ${T.line}` };
  const monograma = (
    <div style={{ ...base, background: T.vinho, border: "none", display: "grid", placeItems: "center", color: "#fff", fontFamily: SERIF, fontWeight: 700, fontSize: s * 0.42 }}>D</div>
  );
  return <ImgArquivo nome="icone" alt="Danny" style={base} reserva={monograma} />;
}

function Indicador({ rotulo, valor, nota, icone, cor, fundo }) {
  return (
    <Cartao style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 10, background: fundo, color: cor, display: "grid", placeItems: "center" }}>
          <Icone n={icone} s={16} />
        </span>
        <span style={{ fontSize: 12.5, color: T.ink2, fontWeight: 500 }}>{rotulo}</span>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{valor}</div>
      <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 4 }}>{nota}</div>
    </Cartao>
  );
}

/* ============================== Aplicativo ================================ */
export default function App() {
  const [abrindo, setAbrindo] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("inicio");
  const [meta, setMeta] = useState({
    categories: [], platings: [], sizes: [], karats: [], customers: [], users: [],
    settings: { storeName: "Danny Semijoias", tagline: "", whatsapp: "", instagram: "", lowStock: 2, paymentNote: "", careNote: "" },
  });
  const [pecas, setPecas] = useState([]);
  const [movs, setMovs] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [msg, setMsg] = useState(null);
  const [largo, setLargo] = useState(typeof window !== "undefined" && window.innerWidth >= 1000);

  const avisar = useCallback((texto, tipo = "ok") => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 3400);
  }, []);

  useEffect(() => {
    const r = () => setLargo(window.innerWidth >= 1000);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const recarregar = useCallback(async () => {
    try {
      const [m, p, mv, c] = await Promise.all([api.loadMeta(), api.loadProducts(), api.loadMovements({}), api.loadCommissions()]);
      setMeta(m); setPecas(p); setMovs(mv); setComissoes(c);
    } catch (e) { avisar(e.message, "erro"); }
  }, [avisar]);

  const recarregarMovs = useCallback(async () => {
    try { const [p, mv] = await Promise.all([api.loadProducts(), api.loadMovements({})]); setPecas(p); setMovs(mv); }
    catch (e) { avisar(e.message, "erro"); }
  }, [avisar]);

  const recarregarMeta = useCallback(async () => {
    try { setMeta(await api.loadMeta()); } catch (e) { avisar(e.message, "erro"); }
  }, [avisar]);

  const recarregarComissoes = useCallback(async () => {
    try { setComissoes(await api.loadCommissions()); } catch (e) { avisar(e.message, "erro"); }
  }, [avisar]);

  useEffect(() => {
    let vivo = true;
    const entrar = async (sessao) => {
      if (!sessao) { if (vivo) { setUser(null); setAbrindo(false); } return; }
      const perfil = await api.getProfile();
      if (!vivo) return;
      setUser(perfil);
      await recarregar();
      setAbrindo(false);
    };
    api.supabase.auth.getSession().then(({ data }) => entrar(data.session));
    const { data: sub } = api.onAuthChange((s) => entrar(s));
    return () => { vivo = false; sub?.subscription?.unsubscribe?.(); };
  }, [recarregar]);

  const tabRef = useRef(tab); tabRef.current = tab;
  const sairArmado = useRef(false);
  useEffect(() => {
    const trava = () => window.history.pushState({ dn: true }, "");
    trava();
    const aoVoltar = () => {
      const fn = pilha[pilha.length - 1];
      if (fn) { pilha.pop(); fn(); trava(); return; }
      if (tabRef.current !== "inicio") { setTab("inicio"); trava(); return; }
      if (sairArmado.current) { window.removeEventListener("popstate", aoVoltar); window.history.back(); return; }
      sairArmado.current = true;
      avisar("Toque em voltar de novo para sair.", "info");
      setTimeout(() => { sairArmado.current = false; }, 2500);
      trava();
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, [avisar]);

  if (abrindo) {
    return (
      <div style={{ fontFamily: FONT, background: T.bg, height: "100vh", display: "grid", placeItems: "center" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center" }}>
          <Marca s={52} />
          <div style={{ color: T.ink3, marginTop: 14, fontSize: 13.5 }}>Carregando…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login avisar={avisar} />;

  const ctx = {
    user, meta, pecas, movs, comissoes, largo, avisar,
    recarregar, recarregarMovs, recarregarMeta, recarregarComissoes, setTab,
    categoria: (id) => meta.categories.find((c) => c.id === id),
    banho: (id) => meta.platings.find((p) => p.id === id),
    aro: (id) => meta.sizes.find((s) => s.id === id),
  };

  const telas = {
    inicio: <Inicio ctx={ctx} />, pecas: <Pecas ctx={ctx} />, estoque: <Estoque ctx={ctx} />,
    vendas: <Vendas ctx={ctx} />, clientes: <Clientes ctx={ctx} />, comissao: <Comissao ctx={ctx} />,
    relatorios: <Relatorios ctx={ctx} />, ajustes: <Ajustes ctx={ctx} />,
  };

  return (
    <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", display: "flex" }}>
      <style>{CSS}</style>
      {largo && <Lateral tab={tab} setTab={setTab} user={user} meta={meta} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {!largo && <TopoMobile tab={tab} setTab={setTab} meta={meta} />}
        <main className="dn-scroll" style={{ flex: 1, padding: largo ? "26px 30px 40px" : "16px 14px 92px", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
          <div key={tab} className="dn-up">{telas[tab]}</div>
        </main>
      </div>
      {!largo && <BarraMobile tab={tab} setTab={setTab} />}
      <Aviso msg={msg} />
    </div>
  );
}

/* ------------------------------- Navegação -------------------------------- */
function Lateral({ tab, setTab, user, meta }) {
  return (
    <aside style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${T.line}`, height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", padding: "18px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 18px" }}>
        <Marca s={38} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600 }}>Danny</div>
          <div style={{ fontSize: 11.5, color: T.ink3 }}>Semijoias</div>
        </div>
      </div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const on = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} className="dn-btn"
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 11, border: "none", cursor: "pointer", fontSize: 14, fontWeight: on ? 600 : 500, background: on ? T.vinhoSoft : "transparent", color: on ? T.vinho : T.ink2, textAlign: "left" }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = T.bg2; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <Icone n={n.id} s={18} />{n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.roseSoft, color: T.vinho, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>
          {(user.name || "D").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
          <div style={{ fontSize: 11.5, color: T.ink3 }}>{user.role === "admin" ? "Administradora" : "Atendente"}</div>
        </div>
        <button onClick={() => api.signOut()} aria-label="Sair" className="dn-btn"
          style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: T.ink3, cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icone n="saida" s={16} />
        </button>
      </div>
    </aside>
  );
}

function TopoMobile({ tab, setTab, meta }) {
  const atual = NAV.find((n) => n.id === tab);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.line}`, padding: "11px 14px", display: "flex", alignItems: "center", gap: 11 }}>
      {tab !== "inicio" ? (
        <button onClick={() => setTab("inicio")} aria-label="Voltar" className="dn-btn"
          style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icone n="voltar" s={17} />
        </button>
      ) : <Marca s={34} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {tab === "inicio" ? meta.settings.storeName : atual?.label}
        </div>
      </div>
      <button onClick={() => api.signOut()} aria-label="Sair" className="dn-btn"
        style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.line}`, background: "#fff", color: T.ink2, cursor: "pointer", display: "grid", placeItems: "center" }}>
        <Icone n="saida" s={16} />
      </button>
    </header>
  );
}

function BarraMobile({ tab, setTab }) {
  const [mais, setMais] = useState(false);
  useVoltar(mais, () => setMais(false));
  const principais = NAV.slice(0, 4);
  const extras = NAV.slice(4);
  const item = (id, label, ativo, onClick) => (
    <button key={id} onClick={onClick} className="dn-btn"
      style={{ flex: 1, background: "none", border: "none", padding: "8px 2px 6px", cursor: "pointer", color: ativo ? T.vinho : T.ink3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Icone n={id} s={19} w={ativo ? 2 : 1.7} />
      <span style={{ fontSize: 10.5, fontWeight: ativo ? 600 : 500 }}>{label}</span>
    </button>
  );
  return (
    <>
      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${T.line}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        {principais.map((n) => item(n.id, n.label, tab === n.id, () => setTab(n.id)))}
        {item("ajustes", "Mais", extras.some((e) => e.id === tab), () => setMais(true))}
      </nav>
      {mais && (
        <div className="dn-fade" onClick={() => setMais(false)} style={{ position: "fixed", inset: 0, background: "rgba(59,34,48,.45)", zIndex: 70, display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", borderRadius: "22px 22px 0 0", padding: "20px 16px 28px", boxShadow: SOMBRA_ALTA, animation: "dnSheet .26s cubic-bezier(.16,1,.3,1) both" }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Mais</div>
            {extras.map((n) => (
              <button key={n.id} onClick={() => { setTab(n.id); setMais(false); }} className="dn-btn"
                style={{ width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${T.line}`, borderRadius: 12, padding: "13px 14px", marginBottom: 8, fontSize: 14.5, fontWeight: 600, color: T.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: T.bg2, display: "grid", placeItems: "center", color: T.ink2 }}>
                  <Icone n={n.id} s={17} />
                </span>
                {n.label}
                <span style={{ marginLeft: "auto", color: T.ink3 }}><Icone n="avancar" s={16} /></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------- Entrar --------------------------------- */
function Login({ avisar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [indo, setIndo] = useState(false);
  const [logo, setLogo] = useState(true);
  const entrar = async () => {
    if (!email || !senha) return avisar("Preencha e-mail e senha.", "erro");
    setIndo(true);
    try { await api.signIn(email.trim(), senha); }
    catch (e) { avisar(e.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : e.message, "erro"); }
    finally { setIndo(false); }
  };
  return (
    <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", display: "grid", placeItems: "center", padding: 22 }}>
      <style>{CSS}</style>
      <div className="dn-up" style={{ width: "100%", maxWidth: 390 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {logo ? (
            <ImgArquivo nome="logo" alt="Danny Semijoias"
              style={{ width: "100%", maxWidth: 320, borderRadius: 16, marginBottom: 16, boxShadow: SOMBRA }}
              reserva={<Marca s={72} />} />
          ) : (
            <>
              <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: T.vinho, margin: "0 0 4px" }}>Danny Semijoias</h1>
              <div style={{ fontSize: 14, color: T.rose, marginBottom: 14 }}>seu estilo merece brilhar</div>
            </>
          )}
          <div style={{ fontSize: 14, color: T.ink2 }}>Peças, vendas, clientes e comissão</div>
        </div>
        <Cartao style={{ padding: 22 }}>
          <Campo label="E-mail"><Entrada type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" /></Campo>
          <Campo label="Senha"><Entrada type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} placeholder="••••••••" /></Campo>
          <Botao onClick={entrar} disabled={indo} tamanho="g" style={{ width: "100%", marginTop: 4 }}>{indo ? "Entrando…" : "Entrar"}</Botao>
        </Cartao>
      </div>
    </div>
  );
}

/* --------------------------------- Início --------------------------------- */
function Inicio({ ctx }) {
  const { pecas, movs, comissoes, meta, user, setTab, largo } = ctx;

  const inicioMes = useMemo(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; }, []);
  const vendasMes = useMemo(() => movs.filter((m) => m.type === "SALE" && !m.reversed && new Date(m.createdAt) >= inicioMes), [movs, inicioMes]);
  const fatMes = vendasMes.reduce((a, m) => a + m.total, 0);
  const pecasVendidas = vendasMes.reduce((a, m) => a + m.quantity, 0);

  const comissaoMes = comissoes.find((c) => c.month === mesISO());
  const acumulado = comissoes.reduce((a, c) => a + c.value, 0);

  const totalPecas = pecas.reduce((a, p) => a + p.stock, 0);
  const baixo = pecas.filter((p) => p.stock > 0 && p.stock <= meta.settings.lowStock);
  const semEstoque = pecas.filter((p) => p.stock === 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, color: T.ink2 }}>{meta.settings.tagline || "Bem-vinda de volta"}</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, margin: "3px 0 0" }}>Olá, {user.name}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
        <Indicador rotulo="Vendas do mês" valor={brl(fatMes)} nota={`${pecasVendidas} peça(s)`} icone="vendas" cor={T.vinho} fundo={T.vinhoSoft} />
        <Indicador rotulo="Comissão do mês" valor={comissaoMes ? brl(comissaoMes.value) : "—"} nota={comissaoMes ? "já lançada" : "ainda não lançada"} icone="comissao" cor={T.ok} fundo={T.okSoft} />
        <Indicador rotulo="Acumulado" valor={brl(acumulado)} nota={`${comissoes.length} mês(es)`} icone="relatorios" cor={T.roxo} fundo={T.roseSoft} />
        <Indicador rotulo="Peças no mostruário" valor={num(totalPecas)} nota={`${pecas.length} modelos`} icone="estoque" cor={T.warn} fundo={T.warnSoft} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <Botao icone="mais" onClick={() => setTab("vendas")}>Registrar venda</Botao>
        <Botao tipo="neutro" icone="pecas" onClick={() => setTab("pecas")}>Peças</Botao>
        <Botao tipo="neutro" icone="comissao" onClick={() => setTab("comissao")}>Comissão</Botao>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "1.3fr 1fr" : "1fr", gap: 16 }}>
        <div>
          <Titulo sub="As últimas entradas, saídas e vendas">Movimentações</Titulo>
          <Cartao style={{ padding: 6 }}>
            {movs.length === 0 && <Vazio icone="relogio">Nada registrado ainda.</Vazio>}
            {movs.slice(0, 8).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", opacity: m.reversed ? 0.5 : 1 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
                  background: m.type === "ENTRY" ? T.okSoft : m.type === "SALE" ? T.vinhoSoft : T.warnSoft,
                  color: m.type === "ENTRY" ? T.ok : m.type === "SALE" ? T.vinho : T.warn }}>
                  <Icone n={m.type === "ENTRY" ? "entrada" : m.type === "SALE" ? "vendas" : "saida"} s={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.productName}</div>
                  <div style={{ fontSize: 12, color: T.ink3 }}>
                    {m.reason}{m.customerName ? ` · ${m.customerName}` : ""} · {diaHora(m.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.type === "SALE" ? brl(m.total) : `${m.type === "ENTRY" ? "+" : "−"}${m.quantity}`}</div>
                  {m.reversed && <div style={{ fontSize: 11, color: T.err }}>estornado</div>}
                </div>
              </div>
            ))}
          </Cartao>
        </div>

        <div>
          <Titulo sub="Peças acabando ou zeradas">Atenção no estoque</Titulo>
          <Cartao style={{ padding: 6 }}>
            {baixo.length === 0 && semEstoque.length === 0 && <Vazio icone="check">Tudo certo por aqui.</Vazio>}
            {baixo.slice(0, 5).map((p) => (
              <div key={p.id} onClick={() => setTab("estoque")} className="dn-linha" style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 11, cursor: "pointer" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: T.warnSoft, color: T.warn, display: "grid", placeItems: "center" }}>
                  <Icone n="alerta" s={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <Selo cor={T.warn} fundo={T.warnSoft}>{p.stock}</Selo>
              </div>
            ))}
            {semEstoque.slice(0, 5).map((p) => (
              <div key={p.id} onClick={() => setTab("estoque")} className="dn-linha" style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 11, cursor: "pointer" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: T.errSoft, color: T.err, display: "grid", placeItems: "center" }}>
                  <Icone n="alerta" s={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                <Selo cor={T.err} fundo={T.errSoft}>esgotado</Selo>
              </div>
            ))}
          </Cartao>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   PARTE 2 — Peças e Estoque
   =========================================================================== */

const ehAnel = (nome) => /an[eé][li]|an[eé]is/i.test(nome || "");

function Miniatura({ url, s = 54, raio = 12 }) {
  const [falhou, setFalhou] = useState(false);
  const base = { width: s, height: s, borderRadius: raio, flexShrink: 0, objectFit: "cover", border: `1px solid ${T.line}`, background: T.bg2 };
  if (!url || falhou) {
    return (
      <div style={{ ...base, display: "grid", placeItems: "center", color: T.rose }}>
        <Icone n="pecas" s={s * 0.42} />
      </div>
    );
  }
  return <img src={url} alt="" loading="lazy" onError={() => setFalhou(true)} style={base} />;
}

/* Foto grande sem aspect-ratio (Safari antigo): caixa com paddingTop */
function FotoQuadrada({ url, raio = 14, children }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: raio, overflow: "hidden", background: T.bg2, border: `1px solid ${T.line}` }}>
      {url ? (
        <img src={url} alt="" loading="lazy"
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "grid", placeItems: "center", color: T.rose }}>
          <Icone n="pecas" s={30} />
        </div>
      )}
      {children}
    </div>
  );
}

/* ---------------------------------- Peças --------------------------------- */
function Pecas({ ctx }) {
  const { pecas, meta, largo, avisar, recarregar, user } = ctx;
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("");
  const [form, setForm] = useState(null);
  const [ficha, setFicha] = useState(null);

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return pecas.filter((p) => {
      if (cat && p.categoryId !== cat) return false;
      if (!b) return true;
      return `${p.name} ${p.sku} ${p.description}`.toLowerCase().includes(b);
    });
  }, [pecas, busca, cat]);

  const nova = async () => {
    try {
      const sku = await api.nextSku("DS");
      const aroUnico = meta.sizes.find((s) => /[uú]nico/i.test(s.name)) || meta.sizes[0];
      setForm({
        name: "", sku, categoryId: meta.categories[0]?.id || "", description: "",
        cost: "", price: "", karat: meta.karats[0]?.name || "", warranty: 1,
        fotos: [], banhos: [], aros: aroUnico ? [aroUnico.id] : [], quantidades: {}, active: true,
      });
    } catch (e) { avisar(e.message, "erro"); }
  };

  const editar = (p) => {
    const banhos = [...new Set(p.variations.map((v) => v.platingId))].filter(Boolean);
    const aros = [...new Set(p.variations.map((v) => v.sizeId))].filter(Boolean);
    const quantidades = {};
    p.variations.forEach((v) => { quantidades[`${v.platingId}_${v.sizeId}`] = v.quantity; });
    setFicha(null);
    setForm({
      id: p.id, name: p.name, sku: p.sku, categoryId: p.categoryId || "", description: p.description,
      cost: p.cost || "", price: p.price || "", karat: p.karat, warranty: p.warranty,
      fotos: p.photos, banhos, aros, quantidades, active: p.active,
    });
  };

  const excluir = async (p) => {
    if (!window.confirm(`Remover "${p.name}" da lista de peças?`)) return;
    try { await api.softDeleteProduct(p.id); setFicha(null); await recarregar(); avisar("Peça removida."); }
    catch (e) { avisar(e.message, "erro"); }
  };

  return (
    <div>
      <Titulo sub={`${pecas.length} modelo(s) no mostruário`} acao={<Botao icone="mais" onClick={nova}>Nova peça</Botao>}>Peças</Titulo>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 190 }}>
          <span style={{ position: "absolute", left: 12, top: 12, color: T.ink3 }}><Icone n="busca" s={16} /></span>
          <Entrada value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou código" style={{ paddingLeft: 36 }} />
        </div>
        <Selecao value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: largo ? 210 : "100%" }}>
          <option value="">Todas as categorias</option>
          {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Selecao>
      </div>

      {lista.length === 0 ? (
        <Cartao><Vazio icone="pecas">{pecas.length ? "Nenhuma peça encontrada." : "Cadastre a primeira peça."}</Vazio></Cartao>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: largo ? "repeat(3,1fr)" : "1fr", gap: 12 }}>
          {lista.map((p) => {
            const c = ctx.categoria(p.categoryId);
            const zerado = p.stock === 0;
            const baixo = !zerado && p.stock <= meta.settings.lowStock;
            return (
              <Cartao key={p.id} onClick={() => setFicha(p)} style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <Miniatura url={p.photos[0]} s={62} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{p.sku}{c ? ` · ${c.name}` : ""}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.vinho }}>{brl(p.price)}</span>
                    <Selo cor={zerado ? T.err : baixo ? T.warn : T.ok} fundo={zerado ? T.errSoft : baixo ? T.warnSoft : T.okSoft} ponto>
                      {zerado ? "esgotado" : `${p.stock} un.`}
                    </Selo>
                  </div>
                </div>
                <span style={{ color: T.ink3 }}><Icone n="avancar" s={17} /></span>
              </Cartao>
            );
          })}
        </div>
      )}

      <FichaPeca ctx={ctx} peca={ficha} aoFechar={() => setFicha(null)} aoEditar={editar} aoExcluir={excluir} />
      {form && <FormPeca ctx={ctx} inicial={form} aoFechar={() => setForm(null)} />}
    </div>
  );
}

/* ------------------------------ Ficha da peça ----------------------------- */
function FichaPeca({ ctx, peca, aoFechar, aoEditar, aoExcluir }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [peca?.id]);
  if (!peca) return null;
  const fotos = peca.photos.length ? peca.photos : [null];
  const c = ctx.categoria(peca.categoryId);

  return (
    <Modal aberto={!!peca} aoFechar={aoFechar} titulo={peca.name} sub={`${peca.sku}${c ? " · " + c.name : ""}`} largo
      rodape={
        <>
          <Botao tipo="neutro" icone="editar" onClick={() => aoEditar(peca)} style={{ flex: 1 }}>Editar</Botao>
          {ctx.user.role === "admin" && <Botao tipo="perigo" icone="lixo" onClick={() => aoExcluir(peca)}>Remover</Botao>}
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: ctx.largo ? "260px 1fr" : "1fr", gap: 18 }}>
        <div>
          <FotoQuadrada url={fotos[i]}>
            {fotos.length > 1 && (
              <>
                <button onClick={() => setI((i - 1 + fotos.length) % fotos.length)} aria-label="Anterior" className="dn-btn"
                  style={{ position: "absolute", left: 8, top: "50%", marginTop: -16, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.92)", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Icone n="voltar" s={16} />
                </button>
                <button onClick={() => setI((i + 1) % fotos.length)} aria-label="Próxima" className="dn-btn"
                  style={{ position: "absolute", right: 8, top: "50%", marginTop: -16, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.92)", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Icone n="avancar" s={16} />
                </button>
              </>
            )}
          </FotoQuadrada>
          {fotos.length > 1 && (
            <div className="dn-x" style={{ display: "flex", gap: 7, marginTop: 8, overflowX: "auto" }}>
              {fotos.map((f, k) => (
                <button key={k} onClick={() => setI(k)} style={{ border: k === i ? `2px solid ${T.vinho}` : `1px solid ${T.line}`, padding: 0, borderRadius: 10, background: "none", cursor: "pointer", lineHeight: 0 }}>
                  <Miniatura url={f} s={46} raio={9} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: T.vinho }}>{brl(peca.price)}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "10px 0 14px" }}>
            {peca.karat && <Selo>{peca.karat}</Selo>}
            {peca.warranty > 0 && <Selo cor={T.ok} fundo={T.okSoft}>{peca.warranty} ano(s) de garantia</Selo>}
            <Selo cor={peca.stock ? T.vinho : T.err} fundo={peca.stock ? T.vinhoSoft : T.errSoft}>{peca.stock ? `${peca.stock} no mostruário` : "esgotado"}</Selo>
          </div>
          {peca.description && <div style={{ fontSize: 14, color: T.ink2, lineHeight: 1.55, marginBottom: 16 }}>{peca.description}</div>}

          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>Estoque por banho e aro</div>
          <Cartao style={{ padding: 6 }}>
            {peca.variations.length === 0 && <Vazio icone="estoque">Sem variações cadastradas.</Vazio>}
            {peca.variations.map((v) => {
              const b = ctx.banho(v.platingId);
              const a = ctx.aro(v.sizeId);
              return (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: b?.hex || T.rose, border: `1px solid ${T.line}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500 }}>
                    {b?.name || "—"}{a && !/[uú]nico/i.test(a.name) ? ` · aro ${a.name}` : ""}
                  </div>
                  <Selo cor={v.quantity ? T.ink2 : T.err} fundo={v.quantity ? T.bg2 : T.errSoft}>{v.quantity} un.</Selo>
                </div>
              );
            })}
          </Cartao>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------- Cadastro da peça ----------------------------- */
function FormPeca({ ctx, inicial, aoFechar }) {
  const { meta, avisar, recarregar } = ctx;
  const [f, setF] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const arquivo = useRef(null);

  const muda = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const categoria = meta.categories.find((c) => c.id === f.categoryId);
  const comAro = ehAnel(categoria?.name);
  const aroUnico = meta.sizes.find((s) => /[uú]nico/i.test(s.name)) || meta.sizes[0];
  const arosUsados = comAro ? f.aros.filter((id) => id !== aroUnico?.id) : (aroUnico ? [aroUnico.id] : []);

  const alterna = (campo, id) => setF((x) => ({
    ...x, [campo]: x[campo].includes(id) ? x[campo].filter((v) => v !== id) : [...x[campo], id],
  }));

  const qtd = (b, a) => f.quantidades[`${b}_${a}`] ?? 0;
  const setQtd = (b, a, v) => setF((x) => ({ ...x, quantidades: { ...x.quantidades, [`${b}_${a}`]: Math.max(0, Number(v) || 0) } }));

  const subirFotos = async (files) => {
    if (!files?.length) return;
    setEnviando(true);
    try {
      const urls = [];
      for (const file of Array.from(files)) urls.push(await api.uploadFile(file, "pecas"));
      setF((x) => ({ ...x, fotos: [...x.fotos, ...urls] }));
    } catch (e) { avisar(e.message, "erro"); }
    finally { setEnviando(false); if (arquivo.current) arquivo.current.value = ""; }
  };

  const salvar = async () => {
    if (!f.name.trim()) return avisar("Dê um nome para a peça.", "erro");
    if (!f.categoryId) return avisar("Escolha a categoria.", "erro");
    if (!Number(f.price)) return avisar("Informe o preço de venda.", "erro");
    if (!f.banhos.length) return avisar("Escolha pelo menos um banho.", "erro");
    if (comAro && !arosUsados.length) return avisar("Escolha pelo menos um aro.", "erro");

    setSalvando(true);
    try {
      if (f.sku && await api.skuExists(f.sku.trim(), f.id)) {
        setSalvando(false);
        return avisar("Já existe uma peça com esse código.", "erro");
      }
      const variations = [];
      f.banhos.forEach((b) => arosUsados.forEach((a) => variations.push({ platingId: b, sizeId: a, quantity: qtd(b, a) })));
      await api.saveProduct({
        id: f.id, name: f.name.trim(), sku: f.sku.trim(), categoryId: f.categoryId,
        description: f.description.trim(), cost: f.cost, price: f.price, karat: f.karat,
        warranty: f.warranty, active: f.active,
        mainImage: f.fotos[0] || null, gallery: f.fotos.slice(1), variations,
      });
      await recarregar();
      avisar(f.id ? "Peça atualizada." : "Peça cadastrada.");
      aoFechar();
    } catch (e) { avisar(e.message, "erro"); }
    finally { setSalvando(false); }
  };

  return (
    <Modal aberto aoFechar={aoFechar} titulo={f.id ? "Editar peça" : "Nova peça"} sub="Os campos com * são obrigatórios" largo
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={salvando} style={{ flex: 2 }}>{salvando ? "Salvando…" : "Salvar peça"}</Botao>
        </>
      }>
      <Campo label="Nome da peça" obrigatorio>
        <Entrada value={f.name} onChange={(e) => muda("name", e.target.value)} placeholder="Ex.: Colar ponto de luz" />
      </Campo>

      <div className="dn-2col">
        <Campo label="Categoria" obrigatorio>
          <Selecao value={f.categoryId} onChange={(e) => muda("categoryId", e.target.value)}>
            <option value="">Escolher…</option>
            {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Selecao>
        </Campo>
        <Campo label="Código" dica="Gerado automaticamente">
          <Entrada value={f.sku} onChange={(e) => muda("sku", e.target.value)} placeholder="DS-001" />
        </Campo>
      </div>

      <div className="dn-2col">
        <Campo label="Preço de venda" obrigatorio>
          <Entrada type="number" inputMode="decimal" step="0.01" value={f.price} onChange={(e) => muda("price", e.target.value)} placeholder="0,00" />
        </Campo>
        <Campo label="Custo" dica="Opcional — não entra em relatório">
          <Entrada type="number" inputMode="decimal" step="0.01" value={f.cost} onChange={(e) => muda("cost", e.target.value)} placeholder="0,00" />
        </Campo>
      </div>

      <div className="dn-2col">
        <Campo label="Quilates">
          <Selecao value={f.karat} onChange={(e) => muda("karat", e.target.value)}>
            <option value="">—</option>
            {meta.karats.map((k) => <option key={k.id} value={k.name}>{k.name}</option>)}
          </Selecao>
        </Campo>
        <Campo label="Garantia (anos)">
          <Entrada type="number" inputMode="numeric" min="0" value={f.warranty} onChange={(e) => muda("warranty", e.target.value)} />
        </Campo>
      </div>

      <Campo label="Descrição" dica="Aparece no catálogo">
        <Area value={f.description} onChange={(e) => muda("description", e.target.value)} placeholder="Material, medidas, detalhes…" />
      </Campo>

      <Campo label="Fotos" dica="A primeira é a foto principal">
        <div className="dn-3col" style={{ marginBottom: 10 }}>
          {f.fotos.map((url, k) => (
            <div key={url + k} style={{ position: "relative" }}>
              <FotoQuadrada url={url} raio={11} />
              {k === 0 && (
                <span style={{ position: "absolute", left: 6, top: 6, background: T.vinho, color: "#fff", fontSize: 10.5, fontWeight: 600, padding: "3px 7px", borderRadius: 999 }}>principal</span>
              )}
              <button onClick={() => muda("fotos", f.fotos.filter((_, j) => j !== k))} aria-label="Remover foto" className="dn-btn"
                style={{ position: "absolute", right: 6, top: 6, width: 26, height: 26, borderRadius: 8, border: "none", background: "rgba(255,255,255,.94)", color: T.err, cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icone n="fechar" s={13} />
              </button>
              {k > 0 && (
                <button onClick={() => { const n = [...f.fotos]; const [x] = n.splice(k, 1); n.unshift(x); muda("fotos", n); }} className="dn-btn"
                  style={{ position: "absolute", left: 6, bottom: 6, border: "none", background: "rgba(255,255,255,.94)", color: T.vinho, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, cursor: "pointer" }}>
                  usar como capa
                </button>
              )}
            </div>
          ))}
        </div>
        <input ref={arquivo} type="file" accept="image/*" multiple onChange={(e) => subirFotos(e.target.files)} style={{ display: "none" }} />
        <Botao tipo="neutro" icone="upload" onClick={() => arquivo.current?.click()} disabled={enviando}>
          {enviando ? "Enviando…" : "Adicionar fotos"}
        </Botao>
      </Campo>

      <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16, marginTop: 4 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>Banhos disponíveis <span style={{ color: T.err }}>*</span></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {meta.platings.map((b) => {
            const on = f.banhos.includes(b.id);
            return (
              <button key={b.id} onClick={() => alterna("banhos", b.id)} className="dn-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: on ? T.vinhoSoft : "#fff", color: on ? T.vinho : T.ink2, border: `1px solid ${on ? T.vinho : T.line}` }}>
                <span style={{ width: 13, height: 13, borderRadius: "50%", background: b.hex || T.rose, border: `1px solid ${T.line}` }} />
                {b.name}
              </button>
            );
          })}
        </div>

        {comAro && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>Aros <span style={{ color: T.err }}>*</span></div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
              {meta.sizes.filter((s) => s.id !== aroUnico?.id).map((s) => {
                const on = f.aros.includes(s.id);
                return (
                  <button key={s.id} onClick={() => alterna("aros", s.id)} className="dn-btn"
                    style={{ minWidth: 44, padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: on ? T.vinhoSoft : "#fff", color: on ? T.vinho : T.ink2, border: `1px solid ${on ? T.vinho : T.line}` }}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {f.banhos.length > 0 && arosUsados.length > 0 && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>
              Quantidade no mostruário
            </div>
            <Cartao style={{ padding: 6 }}>
              {f.banhos.map((b) => {
                const banho = ctx.banho(b);
                return (
                  <div key={b} style={{ padding: "10px 11px", borderBottom: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: arosUsados.length > 1 ? 9 : 0 }}>
                      <span style={{ width: 13, height: 13, borderRadius: "50%", background: banho?.hex || T.rose, border: `1px solid ${T.line}` }} />
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{banho?.name}</span>
                      {arosUsados.length === 1 && (
                        <Entrada type="number" inputMode="numeric" min="0" value={qtd(b, arosUsados[0])}
                          onChange={(e) => setQtd(b, arosUsados[0], e.target.value)} style={{ width: 82, padding: "8px 10px", textAlign: "center" }} />
                      )}
                    </div>
                    {arosUsados.length > 1 && (
                      <div className="dn-x" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                        {arosUsados.map((a) => (
                          <div key={a} style={{ flexShrink: 0, textAlign: "center" }}>
                            <div style={{ fontSize: 11.5, color: T.ink3, marginBottom: 4 }}>aro {ctx.aro(a)?.name}</div>
                            <Entrada type="number" inputMode="numeric" min="0" value={qtd(b, a)}
                              onChange={(e) => setQtd(b, a, e.target.value)} style={{ width: 66, padding: "8px 6px", textAlign: "center" }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </Cartao>
            <div style={{ fontSize: 12, color: T.ink3, marginTop: 7 }}>
              Depois do cadastro, use a tela Estoque para dar entrada e saída — assim fica registrado no histórico.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* --------------------------------- Estoque -------------------------------- */
function Estoque({ ctx }) {
  const { pecas, movs, meta, largo, avisar, recarregarMovs, user } = ctx;
  const [busca, setBusca] = useState("");
  const [mov, setMov] = useState(null);
  const [filtro, setFiltro] = useState("");

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return pecas.filter((p) => !b || `${p.name} ${p.sku}`.toLowerCase().includes(b));
  }, [pecas, busca]);

  const historico = useMemo(() => movs.filter((m) => !filtro || m.type === filtro), [movs, filtro]);
  const total = pecas.reduce((a, p) => a + p.stock, 0);

  return (
    <div>
      <Titulo sub={`${num(total)} peça(s) no mostruário`} acao={
        <div style={{ display: "flex", gap: 8 }}>
          <Botao tipo="suave" icone="entrada" onClick={() => setMov({ tipo: "ENTRY" })}>Entrada</Botao>
          <Botao tipo="neutro" icone="saida" onClick={() => setMov({ tipo: "EXIT" })}>Saída</Botao>
        </div>
      }>Estoque</Titulo>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 12, top: 12, color: T.ink3 }}><Icone n="busca" s={16} /></span>
        <Entrada value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar peça" style={{ paddingLeft: 36 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "1.15fr 1fr" : "1fr", gap: 16 }}>
        <div>
          <Cartao style={{ padding: 6, marginBottom: largo ? 0 : 18 }}>
            {lista.length === 0 && <Vazio icone="estoque">Nenhuma peça encontrada.</Vazio>}
            {lista.map((p) => {
              const zerado = p.stock === 0;
              const baixo = !zerado && p.stock <= meta.settings.lowStock;
              return (
                <div key={p.id} className="dn-linha" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 12 }}>
                  <Miniatura url={p.photos[0]} s={44} raio={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: T.ink3 }}>{p.sku} · {p.variations.length} variação(ões)</div>
                  </div>
                  <Selo cor={zerado ? T.err : baixo ? T.warn : T.ok} fundo={zerado ? T.errSoft : baixo ? T.warnSoft : T.okSoft}>{p.stock}</Selo>
                  <Botao tamanho="s" tipo="suave" onClick={() => setMov({ tipo: "ENTRY", pecaId: p.id })}>+</Botao>
                  <Botao tamanho="s" tipo="neutro" onClick={() => setMov({ tipo: "EXIT", pecaId: p.id })}>−</Botao>
                </div>
              );
            })}
          </Cartao>
        </div>

        <div>
          <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
            {[["", "Tudo"], ["ENTRY", "Entradas"], ["EXIT", "Saídas"], ["SALE", "Vendas"]].map(([v, l]) => (
              <button key={v} onClick={() => setFiltro(v)} className="dn-btn"
                style={{ padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filtro === v ? T.vinhoSoft : "#fff", color: filtro === v ? T.vinho : T.ink2, border: `1px solid ${filtro === v ? T.vinho : T.line}` }}>
                {l}
              </button>
            ))}
          </div>
          <Cartao style={{ padding: 6 }}>
            {historico.length === 0 && <Vazio icone="relogio">Nada registrado ainda.</Vazio>}
            {historico.slice(0, 40).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", opacity: m.reversed ? 0.5 : 1 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center",
                  background: m.type === "ENTRY" ? T.okSoft : m.type === "SALE" ? T.vinhoSoft : T.warnSoft,
                  color: m.type === "ENTRY" ? T.ok : m.type === "SALE" ? T.vinho : T.warn }}>
                  <Icone n={m.type === "ENTRY" ? "entrada" : m.type === "SALE" ? "vendas" : "saida"} s={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.productName}</div>
                  <div style={{ fontSize: 12, color: T.ink3 }}>
                    {ctx.banho(m.platingId)?.name || m.reason} · {diaHora(m.createdAt)}
                  </div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: m.type === "ENTRY" ? T.ok : T.ink }}>
                  {m.type === "ENTRY" ? "+" : "−"}{m.quantity}
                </div>
              </div>
            ))}
          </Cartao>
        </div>
      </div>

      {mov && <FormMovimento ctx={ctx} inicial={mov} aoFechar={() => setMov(null)} />}
    </div>
  );
}

/* --------------------- Entrada e saída de uma variação -------------------- */
function FormMovimento({ ctx, inicial, aoFechar }) {
  const { pecas, avisar, recarregarMovs } = ctx;
  const entrada = inicial.tipo === "ENTRY";
  const [pecaId, setPecaId] = useState(inicial.pecaId || "");
  const [varId, setVarId] = useState("");
  const [qtd, setQtd] = useState(1);
  const [motivo, setMotivo] = useState(entrada ? "Reposição do mostruário" : "Devolução ao fornecedor");
  const [indo, setIndo] = useState(false);

  const peca = pecas.find((p) => p.id === pecaId);
  useEffect(() => { setVarId(peca?.variations[0]?.id || ""); }, [pecaId]);
  const variacao = peca?.variations.find((v) => v.id === varId);

  const salvar = async () => {
    if (!variacao) return avisar("Escolha a peça e a variação.", "erro");
    if (!Number(qtd)) return avisar("Informe a quantidade.", "erro");
    if (!entrada && Number(qtd) > variacao.quantity) return avisar(`Só há ${variacao.quantity} no estoque dessa variação.`, "erro");
    setIndo(true);
    try {
      await api.applyMovement({ variationId: varId, type: inicial.tipo, quantity: Number(qtd), reason: motivo.trim() || "Ajuste" });
      await recarregarMovs();
      avisar(entrada ? "Entrada registrada." : "Saída registrada.");
      aoFechar();
    } catch (e) { avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  return (
    <Modal aberto aoFechar={aoFechar} titulo={entrada ? "Entrada no estoque" : "Saída do estoque"}
      sub={entrada ? "Peças que chegaram para o mostruário" : "Peças que saíram sem ser venda"}
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={indo} style={{ flex: 2 }}>{indo ? "Registrando…" : "Registrar"}</Botao>
        </>
      }>
      <Campo label="Peça" obrigatorio>
        <Selecao value={pecaId} onChange={(e) => setPecaId(e.target.value)}>
          <option value="">Escolher…</option>
          {pecas.map((p) => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>)}
        </Selecao>
      </Campo>

      {peca && (
        <Campo label="Banho e aro" obrigatorio>
          <Selecao value={varId} onChange={(e) => setVarId(e.target.value)}>
            {peca.variations.map((v) => {
              const a = ctx.aro(v.sizeId);
              const aro = a && !/[uú]nico/i.test(a.name) ? ` · aro ${a.name}` : "";
              return <option key={v.id} value={v.id}>{ctx.banho(v.platingId)?.name || "—"}{aro} — {v.quantity} un.</option>;
            })}
          </Selecao>
        </Campo>
      )}

      <div className="dn-2col">
        <Campo label="Quantidade" obrigatorio>
          <Entrada type="number" inputMode="numeric" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)} />
        </Campo>
        <Campo label="Motivo">
          <Entrada value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: reposição" />
        </Campo>
      </div>

      {variacao && (
        <Cartao style={{ padding: 13, background: T.bg2, border: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <Icone n="estoque" s={17} cor={T.vinho} />
          <div style={{ fontSize: 13.5 }}>
            Ficará com <strong>{entrada ? variacao.quantity + Number(qtd || 0) : Math.max(0, variacao.quantity - Number(qtd || 0))}</strong> un. nessa variação.
          </div>
        </Cartao>
      )}
    </Modal>
  );
}

/* ===========================================================================
   PARTE 3 — Vendas, Clientes, Comissão, Relatórios e Ajustes
   =========================================================================== */

const soDigitos = (t) => String(t || "").replace(/\D/g, "");
const zapLink = (fone, texto) => {
  const n = soDigitos(fone);
  const completo = n.length <= 11 ? `55${n}` : n;
  return `https://wa.me/${completo}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
};

function baixarCSV(nome, linhas) {
  const csv = linhas.map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* --------------------------------- Vendas --------------------------------- */
function Vendas({ ctx }) {
  const { movs, pecas, meta, largo, user, avisar, recarregarMovs } = ctx;
  const [aberto, setAberto] = useState(false);
  const [periodo, setPeriodo] = useState("mes");

  const desde = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (periodo === "mes") d.setDate(1);
    else if (periodo === "7") d.setDate(d.getDate() - 7);
    else if (periodo === "ano") { d.setMonth(0); d.setDate(1); }
    else return null;
    return d;
  }, [periodo]);

  const vendas = useMemo(
    () => movs.filter((m) => m.type === "SALE" && !m.reversed && (!desde || new Date(m.createdAt) >= desde)),
    [movs, desde]
  );

  const faturamento = vendas.reduce((a, m) => a + m.total, 0);
  const pecasVendidas = vendas.reduce((a, m) => a + m.quantity, 0);
  const ticket = vendas.length ? faturamento / vendas.length : 0;

  const maisVendidas = useMemo(() => {
    const mapa = new Map();
    vendas.forEach((m) => {
      const atual = mapa.get(m.productId) || { nome: m.productName, qtd: 0, valor: 0 };
      atual.qtd += m.quantity; atual.valor += m.total;
      mapa.set(m.productId, atual);
    });
    return [...mapa.values()].sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [vendas]);

  const estornar = async (m) => {
    if (!window.confirm(`Estornar a venda de "${m.productName}"? A peça volta para o estoque.`)) return;
    try { await api.reverseMovement(m.id); await recarregarMovs(); avisar("Venda estornada."); }
    catch (e) { avisar(e.message, "erro"); }
  };

  return (
    <div>
      <Titulo sub="Registre a venda e acompanhe o resultado" acao={<Botao icone="mais" onClick={() => setAberto(true)}>Registrar venda</Botao>}>Vendas</Titulo>

      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
        {[["mes", "Este mês"], ["7", "7 dias"], ["ano", "Este ano"], ["tudo", "Tudo"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriodo(v)} className="dn-btn"
            style={{ padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600, background: periodo === v ? T.vinhoSoft : "#fff", color: periodo === v ? T.vinho : T.ink2, border: `1px solid ${periodo === v ? T.vinho : T.line}` }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
        <Indicador rotulo="Faturamento" valor={brl(faturamento)} nota={`${vendas.length} venda(s)`} icone="vendas" cor={T.vinho} fundo={T.vinhoSoft} />
        <Indicador rotulo="Peças vendidas" valor={num(pecasVendidas)} nota="no período" icone="pecas" cor={T.roxo} fundo={T.roseSoft} />
        <Indicador rotulo="Ticket médio" valor={brl(ticket)} nota="por venda" icone="relatorios" cor={T.ok} fundo={T.okSoft} />
        <Indicador rotulo="Peças no mostruário" valor={num(pecas.reduce((a, p) => a + p.stock, 0))} nota={`${pecas.length} modelos`} icone="estoque" cor={T.warn} fundo={T.warnSoft} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "1.4fr 1fr" : "1fr", gap: 16 }}>
        <div>
          <Titulo sub="Da mais recente para a mais antiga">Vendas do período</Titulo>
          <Cartao style={{ padding: 6 }}>
            {vendas.length === 0 && <Vazio icone="vendas">Nenhuma venda no período.</Vazio>}
            {vendas.slice(0, 50).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px" }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: T.vinhoSoft, color: T.vinho, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icone n="vendas" s={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.productName}{m.quantity > 1 ? ` ×${m.quantity}` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: T.ink3 }}>
                    {m.customerName || "Sem cliente"} · {diaHora(m.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{brl(m.total)}</div>
                  {user.role === "admin" && (
                    <button onClick={() => estornar(m)} className="dn-btn"
                      style={{ border: "none", background: "none", color: T.err, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "2px 0" }}>
                      estornar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Cartao>
        </div>

        <div>
          <Titulo sub="As campeãs do período">Mais vendidas</Titulo>
          <Cartao style={{ padding: 6 }}>
            {maisVendidas.length === 0 && <Vazio icone="pecas">Ainda sem dados.</Vazio>}
            {maisVendidas.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px" }}>
                <span style={{ width: 26, height: 26, borderRadius: 9, background: T.bg2, color: T.vinho, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
                <Selo>{p.qtd} un.</Selo>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink2 }}>{brl(p.valor)}</div>
              </div>
            ))}
          </Cartao>
        </div>
      </div>

      {aberto && <FormVenda ctx={ctx} aoFechar={() => setAberto(false)} />}
    </div>
  );
}

/* ---------------------------- Registrar venda ----------------------------- */
function FormVenda({ ctx, aoFechar }) {
  const { pecas, meta, avisar, recarregarMovs, recarregarMeta } = ctx;
  const [pecaId, setPecaId] = useState("");
  const [varId, setVarId] = useState("");
  const [qtd, setQtd] = useState(1);
  const [preco, setPreco] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoFone, setNovoFone] = useState("");
  const [indo, setIndo] = useState(false);

  const comEstoque = useMemo(() => pecas.filter((p) => p.stock > 0), [pecas]);
  const peca = pecas.find((p) => p.id === pecaId);
  const variacoes = (peca?.variations || []).filter((v) => v.quantity > 0);
  const variacao = variacoes.find((v) => v.id === varId);

  useEffect(() => {
    const v = pecas.find((p) => p.id === pecaId);
    const primeira = (v?.variations || []).find((x) => x.quantity > 0);
    setVarId(primeira?.id || "");
    setPreco(v ? v.price : "");
  }, [pecaId]);

  const total = (Number(preco) || 0) * (Number(qtd) || 0);

  const salvar = async () => {
    if (!variacao) return avisar("Escolha a peça e a variação.", "erro");
    if (!Number(qtd)) return avisar("Informe a quantidade.", "erro");
    if (Number(qtd) > variacao.quantity) return avisar(`Só há ${variacao.quantity} un. dessa variação.`, "erro");
    setIndo(true);
    try {
      let cliente = clienteId || null;
      if (clienteId === "novo") {
        if (!novoNome.trim()) { setIndo(false); return avisar("Digite o nome da cliente.", "erro"); }
        const c = await api.addCustomer({ name: novoNome.trim(), phone: novoFone.trim() });
        cliente = c.id;
        await recarregarMeta();
      }
      await api.applyMovement({
        variationId: varId, type: "SALE", quantity: Number(qtd), reason: "Venda",
        customerId: cliente, unitPrice: Number(preco) || 0, unitCost: peca?.cost || 0,
      });
      await recarregarMovs();
      avisar("Venda registrada.");
      aoFechar();
    } catch (e) { avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  return (
    <Modal aberto aoFechar={aoFechar} titulo="Registrar venda" sub="A peça sai do estoque na hora"
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={indo} style={{ flex: 2 }}>{indo ? "Registrando…" : `Vender ${brl(total)}`}</Botao>
        </>
      }>
      <Campo label="Peça" obrigatorio>
        <Selecao value={pecaId} onChange={(e) => setPecaId(e.target.value)}>
          <option value="">Escolher…</option>
          {comEstoque.map((p) => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""} — {p.stock} un.</option>)}
        </Selecao>
      </Campo>

      {peca && (
        <Campo label="Banho e aro" obrigatorio>
          <Selecao value={varId} onChange={(e) => setVarId(e.target.value)}>
            {variacoes.map((v) => {
              const a = ctx.aro(v.sizeId);
              const aro = a && !/[uú]nico/i.test(a.name) ? ` · aro ${a.name}` : "";
              return <option key={v.id} value={v.id}>{ctx.banho(v.platingId)?.name || "—"}{aro} — {v.quantity} un.</option>;
            })}
          </Selecao>
        </Campo>
      )}

      <div className="dn-2col">
        <Campo label="Quantidade" obrigatorio>
          <Entrada type="number" inputMode="numeric" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)} />
        </Campo>
        <Campo label="Preço unitário" obrigatorio>
          <Entrada type="number" inputMode="decimal" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" />
        </Campo>
      </div>

      <Campo label="Cliente" dica="Opcional, mas ajuda no histórico">
        <Selecao value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Sem cliente</option>
          <option value="novo">+ Cadastrar nova cliente</option>
          {meta.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Selecao>
      </Campo>

      {clienteId === "novo" && (
        <div className="dn-2col">
          <Campo label="Nome da cliente" obrigatorio>
            <Entrada value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" />
          </Campo>
          <Campo label="WhatsApp">
            <Entrada inputMode="tel" value={novoFone} onChange={(e) => setNovoFone(e.target.value)} placeholder="(34) 9 9999-9999" />
          </Campo>
        </div>
      )}

      <Cartao style={{ padding: 14, background: T.vinhoSoft, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, color: T.ink2, fontWeight: 500 }}>Total da venda</span>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.vinho }}>{brl(total)}</span>
      </Cartao>
    </Modal>
  );
}

/* -------------------------------- Clientes -------------------------------- */
function Clientes({ ctx }) {
  const { meta, movs, largo, user, avisar, recarregarMeta } = ctx;
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(null);
  const [ficha, setFicha] = useState(null);

  const resumo = useMemo(() => {
    const mapa = new Map();
    movs.filter((m) => m.type === "SALE" && !m.reversed && m.customerId).forEach((m) => {
      const a = mapa.get(m.customerId) || { total: 0, compras: 0, ultima: null };
      a.total += m.total; a.compras += 1;
      if (!a.ultima || new Date(m.createdAt) > new Date(a.ultima)) a.ultima = m.createdAt;
      mapa.set(m.customerId, a);
    });
    return mapa;
  }, [movs]);

  const lista = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return meta.customers.filter((c) => !b || `${c.name} ${c.phone || ""}`.toLowerCase().includes(b));
  }, [meta.customers, busca]);

  const excluir = async (c) => {
    if (!window.confirm(`Remover ${c.name} da lista de clientes?`)) return;
    try { await api.removeCustomer(c.id); setFicha(null); await recarregarMeta(); avisar("Cliente removida."); }
    catch (e) { avisar(e.message, "erro"); }
  };

  return (
    <div>
      <Titulo sub={`${meta.customers.length} cliente(s)`} acao={<Botao icone="mais" onClick={() => setForm({ name: "", phone: "", email: "", birthday: "", notes: "" })}>Nova cliente</Botao>}>Clientes</Titulo>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 12, top: 12, color: T.ink3 }}><Icone n="busca" s={16} /></span>
        <Entrada value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone" style={{ paddingLeft: 36 }} />
      </div>

      {lista.length === 0 ? (
        <Cartao><Vazio icone="clientes">{meta.customers.length ? "Nenhuma cliente encontrada." : "Cadastre a primeira cliente."}</Vazio></Cartao>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: largo ? "repeat(2,1fr)" : "1fr", gap: 12 }}>
          {lista.map((c) => {
            const r = resumo.get(c.id) || { total: 0, compras: 0, ultima: null };
            return (
              <Cartao key={c.id} onClick={() => setFicha(c)} style={{ padding: 13, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: T.roseSoft, color: T.vinho, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
                    {c.phone || "sem telefone"}{r.compras ? ` · ${r.compras} compra(s)` : ""}
                  </div>
                </div>
                {r.total > 0 && <Selo cor={T.vinho} fundo={T.vinhoSoft}>{brl(r.total)}</Selo>}
              </Cartao>
            );
          })}
        </div>
      )}

      {ficha && (
        <FichaCliente ctx={ctx} cliente={ficha} aoFechar={() => setFicha(null)}
          aoEditar={(c) => { setFicha(null); setForm({ ...c, birthday: c.birthday || "", phone: c.phone || "", email: c.email || "", notes: c.notes || "" }); }}
          aoExcluir={excluir} />
      )}
      {form && <FormCliente ctx={ctx} inicial={form} aoFechar={() => setForm(null)} />}
    </div>
  );
}

function FichaCliente({ ctx, cliente, aoFechar, aoEditar, aoExcluir }) {
  const compras = ctx.movs.filter((m) => m.type === "SALE" && !m.reversed && m.customerId === cliente.id);
  const total = compras.reduce((a, m) => a + m.total, 0);
  return (
    <Modal aberto aoFechar={aoFechar} titulo={cliente.name} sub={cliente.phone || "sem telefone"}
      rodape={
        <>
          {cliente.phone && (
            <Botao tipo="zap" icone="whats" onClick={() => window.open(zapLink(cliente.phone, `Oi, ${cliente.name}! `), "_blank")}>WhatsApp</Botao>
          )}
          <Botao tipo="neutro" icone="editar" onClick={() => aoEditar(cliente)} style={{ flex: 1 }}>Editar</Botao>
          {ctx.user.role === "admin" && <Botao tipo="perigo" icone="lixo" onClick={() => aoExcluir(cliente)}>Remover</Botao>}
        </>
      }>
      <div className="dn-2col" style={{ marginBottom: 16 }}>
        <Indicador rotulo="Total em compras" valor={brl(total)} nota={`${compras.length} compra(s)`} icone="vendas" cor={T.vinho} fundo={T.vinhoSoft} />
        <Indicador rotulo="Aniversário" valor={cliente.birthday ? dia(cliente.birthday) : "—"} nota={cliente.email || "sem e-mail"} icone="clientes" cor={T.roxo} fundo={T.roseSoft} />
      </div>

      {cliente.notes && (
        <Cartao style={{ padding: 13, background: T.bg2, border: "none", marginBottom: 16, fontSize: 13.5, color: T.ink2 }}>{cliente.notes}</Cartao>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>Histórico de compras</div>
      <Cartao style={{ padding: 6 }}>
        {compras.length === 0 && <Vazio icone="vendas">Nenhuma compra registrada.</Vazio>}
        {compras.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {m.productName}{m.quantity > 1 ? ` ×${m.quantity}` : ""}
              </div>
              <div style={{ fontSize: 12, color: T.ink3 }}>{diaHora(m.createdAt)}</div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{brl(m.total)}</div>
          </div>
        ))}
      </Cartao>
    </Modal>
  );
}

function FormCliente({ ctx, inicial, aoFechar }) {
  const { avisar, recarregarMeta } = ctx;
  const [f, setF] = useState(inicial);
  const [indo, setIndo] = useState(false);
  const muda = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const salvar = async () => {
    if (!f.name.trim()) return avisar("Digite o nome.", "erro");
    setIndo(true);
    try {
      const dados = { name: f.name.trim(), phone: f.phone, email: f.email, birthday: f.birthday || null, notes: f.notes };
      if (f.id) await api.updateCustomer(f.id, dados); else await api.addCustomer(dados);
      await recarregarMeta();
      avisar(f.id ? "Cliente atualizada." : "Cliente cadastrada.");
      aoFechar();
    } catch (e) { avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  return (
    <Modal aberto aoFechar={aoFechar} titulo={f.id ? "Editar cliente" : "Nova cliente"}
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={indo} style={{ flex: 2 }}>{indo ? "Salvando…" : "Salvar"}</Botao>
        </>
      }>
      <Campo label="Nome" obrigatorio><Entrada value={f.name} onChange={(e) => muda("name", e.target.value)} placeholder="Nome completo" /></Campo>
      <div className="dn-2col">
        <Campo label="WhatsApp"><Entrada inputMode="tel" value={f.phone} onChange={(e) => muda("phone", e.target.value)} placeholder="(34) 9 9999-9999" /></Campo>
        <Campo label="Aniversário"><Entrada type="date" value={f.birthday} onChange={(e) => muda("birthday", e.target.value)} /></Campo>
      </div>
      <Campo label="E-mail"><Entrada type="email" value={f.email} onChange={(e) => muda("email", e.target.value)} placeholder="opcional" /></Campo>
      <Campo label="Observações"><Area value={f.notes} onChange={(e) => muda("notes", e.target.value)} placeholder="Preferências, tamanho de aro, o que ela gosta…" /></Campo>
    </Modal>
  );
}

/* -------------------------------- Comissão -------------------------------- */
function Comissao({ ctx }) {
  const { comissoes, largo, user, avisar, recarregarComissoes } = ctx;
  const [form, setForm] = useState(null);

  const acumulado = comissoes.reduce((a, c) => a + c.value, 0);
  const media = comissoes.length ? acumulado / comissoes.length : 0;
  const doMes = comissoes.find((c) => c.month === mesISO());

  /* soma andando de baixo para cima: cada mês mostra o acumulado até ele */
  const comAcumulado = useMemo(() => {
    const crescente = [...comissoes].sort((a, b) => a.month.localeCompare(b.month));
    let soma = 0;
    const mapa = new Map();
    crescente.forEach((c) => { soma += c.value; mapa.set(c.id, soma); });
    return comissoes.map((c) => ({ ...c, acumulado: mapa.get(c.id) || 0 }));
  }, [comissoes]);

  const excluir = async (c) => {
    if (!window.confirm(`Apagar o lançamento de ${mesNome(c.month)}?`)) return;
    try { await api.removeCommission(c.id); await recarregarComissoes(); avisar("Lançamento apagado."); }
    catch (e) { avisar(e.message, "erro"); }
  };

  return (
    <div>
      <Titulo sub="O que você recebeu de comissão, mês a mês"
        acao={<Botao icone="mais" onClick={() => setForm({ month: mesISO().slice(0, 7), value: "", percent: "", salesBase: "", note: "" })}>Lançar mês</Botao>}>
        Comissão
      </Titulo>

      <Cartao style={{ padding: largo ? 24 : 20, marginBottom: 18, background: T.vinho, border: "none", color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Acumulado de {comissoes.length} mês(es)</div>
        <div style={{ fontFamily: SERIF, fontSize: largo ? 42 : 34, fontWeight: 600, lineHeight: 1.1, margin: "6px 0 2px" }}>{brl(acumulado)}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          {doMes ? `${mesNome(doMes.month)} já lançado: ${brl(doMes.value)}` : "Este mês ainda não foi lançado"} · média {brl(media)}
        </div>
      </Cartao>

      <Cartao style={{ padding: 6 }}>
        {comAcumulado.length === 0 && <Vazio icone="comissao">Nenhum mês lançado ainda.</Vazio>}
        {comAcumulado.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", borderBottom: `1px solid ${T.line}` }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, background: T.vinhoSoft, color: T.vinho, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icone n="comissao" s={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{mesNome(c.month)}</div>
              <div style={{ fontSize: 12, color: T.ink3 }}>
                {c.percent != null ? `${c.percent}%` : "sem porcentagem"}
                {c.salesBase != null ? ` sobre ${brl(c.salesBase)}` : ""}
                {c.note ? ` · ${c.note}` : ""}
              </div>
              <div style={{ fontSize: 11.5, color: T.rose, marginTop: 2 }}>acumulado até aqui: {brl(c.acumulado)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.vinho }}>{brl(c.value)}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 3 }}>
                <button onClick={() => setForm({ ...c, month: c.month.slice(0, 7), percent: c.percent ?? "", salesBase: c.salesBase ?? "" })} className="dn-btn"
                  style={{ border: "none", background: "none", color: T.ink2, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>editar</button>
                {user.role === "admin" && (
                  <button onClick={() => excluir(c)} className="dn-btn"
                    style={{ border: "none", background: "none", color: T.err, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>apagar</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </Cartao>

      {form && <FormComissao ctx={ctx} inicial={form} aoFechar={() => setForm(null)} />}
    </div>
  );
}

function FormComissao({ ctx, inicial, aoFechar }) {
  const { avisar, recarregarComissoes } = ctx;
  const [f, setF] = useState(inicial);
  const [indo, setIndo] = useState(false);
  const muda = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const sugerido = f.percent && f.salesBase ? (Number(f.salesBase) * Number(f.percent)) / 100 : 0;

  const salvar = async () => {
    if (!f.month) return avisar("Escolha o mês.", "erro");
    if (!Number(f.value)) return avisar("Informe quanto você recebeu.", "erro");
    setIndo(true);
    try {
      await api.saveCommission({ id: f.id, month: `${f.month}-01`, value: f.value, percent: f.percent, salesBase: f.salesBase, note: f.note });
      await recarregarComissoes();
      avisar("Comissão lançada.");
      aoFechar();
    } catch (e) { avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  return (
    <Modal aberto aoFechar={aoFechar} titulo={f.id ? "Editar lançamento" : "Lançar comissão"} sub="Um lançamento por mês"
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={indo} style={{ flex: 2 }}>{indo ? "Salvando…" : "Salvar"}</Botao>
        </>
      }>
      <Campo label="Mês" obrigatorio>
        <Entrada type="month" value={f.month} onChange={(e) => muda("month", e.target.value)} />
      </Campo>
      <Campo label="Quanto você recebeu" obrigatorio>
        <Entrada type="number" inputMode="decimal" step="0.01" value={f.value} onChange={(e) => muda("value", e.target.value)} placeholder="0,00" />
      </Campo>
      <div className="dn-2col">
        <Campo label="Porcentagem" dica="Opcional">
          <Entrada type="number" inputMode="decimal" step="0.01" value={f.percent} onChange={(e) => muda("percent", e.target.value)} placeholder="Ex.: 30" />
        </Campo>
        <Campo label="Total vendido" dica="Opcional">
          <Entrada type="number" inputMode="decimal" step="0.01" value={f.salesBase} onChange={(e) => muda("salesBase", e.target.value)} placeholder="0,00" />
        </Campo>
      </div>
      {sugerido > 0 && (
        <Cartao style={{ padding: 12, background: T.bg2, border: "none", marginBottom: 14, fontSize: 13.5, display: "flex", alignItems: "center", gap: 9 }}>
          <Icone n="comissao" s={16} cor={T.vinho} />
          <span>Pela conta, daria <strong>{brl(sugerido)}</strong>. Use o valor que realmente caiu.</span>
        </Cartao>
      )}
      <Campo label="Observação">
        <Area value={f.note} onChange={(e) => muda("note", e.target.value)} placeholder="Ex.: recebido dia 10, desconto de peça devolvida…" />
      </Campo>
    </Modal>
  );
}

/* ------------------------------- Relatórios ------------------------------- */
function Barra({ rotulo, valor, maximo, texto, cor = T.vinho }) {
  const pct = maximo > 0 ? Math.max(4, (valor / maximo) * 100) : 0;
  return (
    <div style={{ padding: "9px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rotulo}</span>
        <span style={{ fontSize: 13, color: T.ink2, fontWeight: 600, flexShrink: 0 }}>{texto}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: T.bg2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: cor }} />
      </div>
    </div>
  );
}

function Relatorios({ ctx }) {
  const { movs, pecas, meta, comissoes, largo } = ctx;
  const [periodo, setPeriodo] = useState("mes");

  const desde = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (periodo === "mes") d.setDate(1);
    else if (periodo === "3") { d.setMonth(d.getMonth() - 3); }
    else if (periodo === "ano") { d.setMonth(0); d.setDate(1); }
    else return null;
    return d;
  }, [periodo]);

  const vendas = useMemo(
    () => movs.filter((m) => m.type === "SALE" && !m.reversed && (!desde || new Date(m.createdAt) >= desde)),
    [movs, desde]
  );

  const faturamento = vendas.reduce((a, m) => a + m.total, 0);
  const unidades = vendas.reduce((a, m) => a + m.quantity, 0);
  const ticket = vendas.length ? faturamento / vendas.length : 0;

  const porPeca = useMemo(() => {
    const mapa = new Map();
    vendas.forEach((m) => {
      const a = mapa.get(m.productId) || { nome: m.productName, qtd: 0, valor: 0 };
      a.qtd += m.quantity; a.valor += m.total; mapa.set(m.productId, a);
    });
    return [...mapa.values()].sort((a, b) => b.valor - a.valor).slice(0, 8);
  }, [vendas]);

  const porCategoria = useMemo(() => {
    const mapa = new Map();
    vendas.forEach((m) => {
      const p = pecas.find((x) => x.id === m.productId);
      const nome = ctx.categoria(p?.categoryId)?.name || "Outros";
      const a = mapa.get(nome) || { nome, qtd: 0, valor: 0 };
      a.qtd += m.quantity; a.valor += m.total; mapa.set(nome, a);
    });
    return [...mapa.values()].sort((a, b) => b.valor - a.valor);
  }, [vendas, pecas]);

  const porBanho = useMemo(() => {
    const mapa = new Map();
    vendas.forEach((m) => {
      const nome = ctx.banho(m.platingId)?.name || "Sem banho";
      const a = mapa.get(nome) || { nome, qtd: 0, valor: 0, hex: ctx.banho(m.platingId)?.hex };
      a.qtd += m.quantity; a.valor += m.total; mapa.set(nome, a);
    });
    return [...mapa.values()].sort((a, b) => b.qtd - a.qtd);
  }, [vendas]);

  const maxPeca = Math.max(1, ...porPeca.map((p) => p.valor));
  const maxCat = Math.max(1, ...porCategoria.map((p) => p.valor));
  const maxBanho = Math.max(1, ...porBanho.map((p) => p.qtd));
  const acumulado = comissoes.reduce((a, c) => a + c.value, 0);

  return (
    <div>
      <Titulo sub="Como as vendas se comportaram no período">Relatórios</Titulo>

      <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
        {[["mes", "Este mês"], ["3", "3 meses"], ["ano", "Este ano"], ["tudo", "Tudo"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriodo(v)} className="dn-btn"
            style={{ padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600, background: periodo === v ? T.vinhoSoft : "#fff", color: periodo === v ? T.vinho : T.ink2, border: `1px solid ${periodo === v ? T.vinho : T.line}` }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 12, marginBottom: 22 }}>
        <Indicador rotulo="Faturamento" valor={brl(faturamento)} nota={`${vendas.length} venda(s)`} icone="vendas" cor={T.vinho} fundo={T.vinhoSoft} />
        <Indicador rotulo="Peças vendidas" valor={num(unidades)} nota="no período" icone="pecas" cor={T.roxo} fundo={T.roseSoft} />
        <Indicador rotulo="Ticket médio" valor={brl(ticket)} nota="por venda" icone="relatorios" cor={T.ok} fundo={T.okSoft} />
        <Indicador rotulo="Comissão acumulada" valor={brl(acumulado)} nota={`${comissoes.length} mês(es)`} icone="comissao" cor={T.warn} fundo={T.warnSoft} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: largo ? "1fr 1fr" : "1fr", gap: 16 }}>
        <div>
          <Titulo sub="Quem trouxe mais dinheiro">Peças que mais venderam</Titulo>
          <Cartao style={{ padding: 6, marginBottom: 18 }}>
            {porPeca.length === 0 && <Vazio icone="pecas">Sem vendas no período.</Vazio>}
            {porPeca.map((p, i) => <Barra key={i} rotulo={p.nome} valor={p.valor} maximo={maxPeca} texto={`${p.qtd} un. · ${brl(p.valor)}`} />)}
          </Cartao>

          <Titulo sub="O que sai mais de cada tipo">Por categoria</Titulo>
          <Cartao style={{ padding: 6 }}>
            {porCategoria.length === 0 && <Vazio icone="estoque">Sem vendas no período.</Vazio>}
            {porCategoria.map((p, i) => <Barra key={i} rotulo={p.nome} valor={p.valor} maximo={maxCat} texto={`${p.qtd} un. · ${brl(p.valor)}`} cor={T.roxo} />)}
          </Cartao>
        </div>

        <div>
          <Titulo sub="Ouro, prata, aço — qual a cliente prefere">Comparativo por banho</Titulo>
          <Cartao style={{ padding: 6, marginBottom: 18 }}>
            {porBanho.length === 0 && <Vazio icone="relatorios">Sem vendas no período.</Vazio>}
            {porBanho.map((p, i) => <Barra key={i} rotulo={p.nome} valor={p.qtd} maximo={maxBanho} texto={`${p.qtd} un. · ${brl(p.valor)}`} cor={p.hex || T.rose} />)}
          </Cartao>

          <Titulo sub="Mês a mês, o que você recebeu">Comissão</Titulo>
          <Cartao style={{ padding: 6 }}>
            {comissoes.length === 0 && <Vazio icone="comissao">Nenhum mês lançado.</Vazio>}
            {comissoes.slice(0, 8).map((c) => (
              <Barra key={c.id} rotulo={mesNome(c.month)} valor={c.value}
                maximo={Math.max(1, ...comissoes.map((x) => x.value))} texto={brl(c.value)} cor={T.ok} />
            ))}
          </Cartao>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Ajustes -------------------------------- */
function ListaEditavel({ titulo, itens, aoAdicionar, aoRemover, comCor, ctx }) {
  const [novo, setNovo] = useState("");
  const [cor, setCor] = useState("#C9A227");
  const [indo, setIndo] = useState(false);

  const adicionar = async () => {
    if (!novo.trim()) return;
    setIndo(true);
    try { await aoAdicionar(novo.trim(), cor); setNovo(""); }
    catch (e) { ctx.avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  return (
    <Cartao style={{ padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 11 }}>{titulo}</div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
        {itens.length === 0 && <span style={{ fontSize: 13, color: T.ink3 }}>Nenhum item.</span>}
        {itens.map((i) => (
          <span key={i.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.bg2, borderRadius: 999, padding: "6px 8px 6px 11px", fontSize: 13, fontWeight: 600 }}>
            {comCor && <span style={{ width: 12, height: 12, borderRadius: "50%", background: i.hex || T.rose, border: `1px solid ${T.line}` }} />}
            {i.name}
            <button onClick={() => aoRemover(i.id)} aria-label="Remover" className="dn-btn"
              style={{ width: 19, height: 19, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.8)", color: T.err, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <Icone n="fechar" s={11} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Entrada value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()} placeholder="Adicionar novo…" style={{ flex: 1 }} />
        {comCor && (
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} aria-label="Cor"
            style={{ width: 44, height: 44, padding: 3, borderRadius: 11, border: `1px solid ${T.line}`, background: "#fff", cursor: "pointer" }} />
        )}
        <Botao onClick={adicionar} disabled={indo} icone="mais">Incluir</Botao>
      </div>
    </Cartao>
  );
}

function Ajustes({ ctx }) {
  const { meta, pecas, movs, comissoes, user, avisar, recarregarMeta } = ctx;
  const [s, setS] = useState(meta.settings);
  const [indo, setIndo] = useState(false);
  const admin = user.role === "admin";
  const muda = (k, v) => setS((x) => ({ ...x, [k]: v }));

  useEffect(() => { setS(meta.settings); }, [meta.settings]);

  const salvar = async () => {
    setIndo(true);
    try { await api.saveSettings(s); await recarregarMeta(); avisar("Ajustes salvos."); }
    catch (e) { avisar(e.message, "erro"); }
    finally { setIndo(false); }
  };

  const recarregaDepois = (fn) => async (...args) => { await fn(...args); await recarregarMeta(); };

  const exportarPecas = () => baixarCSV("pecas-danny.csv", [
    ["Código", "Peça", "Categoria", "Preço", "Quilates", "Garantia", "Estoque"],
    ...pecas.map((p) => [p.sku, p.name, ctx.categoria(p.categoryId)?.name || "", p.price, p.karat, p.warranty, p.stock]),
  ]);

  const exportarVendas = () => baixarCSV("vendas-danny.csv", [
    ["Data", "Peça", "Banho", "Quantidade", "Valor", "Cliente", "Estornada"],
    ...movs.filter((m) => m.type === "SALE").map((m) => [
      diaHora(m.createdAt), m.productName, ctx.banho(m.platingId)?.name || "", m.quantity, m.total, m.customerName, m.reversed ? "sim" : "não",
    ]),
  ]);

  const exportarClientes = () => baixarCSV("clientes-danny.csv", [
    ["Nome", "WhatsApp", "E-mail", "Aniversário", "Observações"],
    ...meta.customers.map((c) => [c.name, c.phone, c.email, c.birthday, c.notes]),
  ]);

  const exportarComissoes = () => baixarCSV("comissoes-danny.csv", [
    ["Mês", "Recebido", "Porcentagem", "Total vendido", "Observação"],
    ...comissoes.map((c) => [mesNome(c.month), c.value, c.percent ?? "", c.salesBase ?? "", c.note]),
  ]);

  const linkCatalogo = `${window.location.origin}/catalogo`;

  return (
    <div>
      <Titulo sub="Dados da loja, listas e exportação">Ajustes</Titulo>

      <Cartao style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Dados da loja</div>
        <div className="dn-2col">
          <Campo label="Nome da loja"><Entrada value={s.storeName} onChange={(e) => muda("storeName", e.target.value)} /></Campo>
          <Campo label="Slogan"><Entrada value={s.tagline} onChange={(e) => muda("tagline", e.target.value)} /></Campo>
        </div>
        <div className="dn-2col">
          <Campo label="WhatsApp" dica="Só números, com DDD"><Entrada inputMode="tel" value={s.whatsapp} onChange={(e) => muda("whatsapp", e.target.value)} placeholder="34999955420" /></Campo>
          <Campo label="Instagram"><Entrada value={s.instagram} onChange={(e) => muda("instagram", e.target.value)} placeholder="@dannysemijoias" /></Campo>
        </div>
        <Campo label="Avisar estoque baixo a partir de" dica="Quantidade que acende o alerta na tela Início">
          <Entrada type="number" inputMode="numeric" min="0" value={s.lowStock} onChange={(e) => muda("lowStock", e.target.value)} style={{ maxWidth: 140 }} />
        </Campo>
        <Campo label="Aviso de pagamento" dica="Aparece no catálogo, antes de fechar o pedido">
          <Area value={s.paymentNote} onChange={(e) => muda("paymentNote", e.target.value)} />
        </Campo>
        <Campo label="Cuidados e garantia" dica="Aparece no catálogo antes de finalizar o pedido">
          <Area value={s.careNote} onChange={(e) => muda("careNote", e.target.value)} style={{ minHeight: 120 }} />
        </Campo>
        <Botao onClick={salvar} disabled={indo} tamanho="g" style={{ width: "100%" }}>{indo ? "Salvando…" : "Salvar ajustes"}</Botao>
      </Cartao>

      <Cartao style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Link do catálogo</div>
        <div style={{ fontSize: 13, color: T.ink2, marginBottom: 11 }}>Mande esse endereço para as clientes.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Entrada value={linkCatalogo} readOnly onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 200 }} />
          <Botao tipo="neutro" icone="check" onClick={() => { navigator.clipboard?.writeText(linkCatalogo); avisar("Link copiado."); }}>Copiar</Botao>
        </div>
      </Cartao>

      <ListaEditavel ctx={ctx} titulo="Categorias" itens={meta.categories}
        aoAdicionar={recarregaDepois((n) => api.addCategory(n))} aoRemover={recarregaDepois(api.removeCategory)} />
      <ListaEditavel ctx={ctx} titulo="Banhos" itens={meta.platings} comCor
        aoAdicionar={recarregaDepois((n, c) => api.addPlating(n, c))} aoRemover={recarregaDepois(api.removePlating)} />
      <ListaEditavel ctx={ctx} titulo="Aros" itens={meta.sizes}
        aoAdicionar={recarregaDepois((n) => api.addSize(n))} aoRemover={recarregaDepois(api.removeSize)} />
      <ListaEditavel ctx={ctx} titulo="Quilates" itens={meta.karats}
        aoAdicionar={recarregaDepois((n) => api.addKarat(n))} aoRemover={recarregaDepois(api.removeKarat)} />

      {admin && (
        <Cartao style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Quem pode usar o app</div>
          <div style={{ fontSize: 13, color: T.ink2, marginBottom: 12 }}>
            A pessoa cria a conta pela tela de entrada e aparece aqui. Administradora pode apagar e estornar.
          </div>
          {meta.users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${T.line}` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.roseSoft, color: T.vinho, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {(u.name || u.email || "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || u.email}</div>
                <div style={{ fontSize: 12, color: T.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
              </div>
              <Selecao value={u.role} disabled={u.id === user.id}
                onChange={async (e) => {
                  try { await api.setUserRole(u.id, e.target.value); await recarregarMeta(); avisar("Permissão alterada."); }
                  catch (err) { avisar(err.message, "erro"); }
                }}
                style={{ width: 132, padding: "8px 10px", fontSize: 13 }}>
                <option value="admin">Administradora</option>
                <option value="func">Atendente</option>
              </Selecao>
            </div>
          ))}
        </Cartao>
      )}

      <Cartao style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 11 }}>Exportar para planilha</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Botao tipo="neutro" icone="pecas" onClick={exportarPecas}>Peças</Botao>
          <Botao tipo="neutro" icone="vendas" onClick={exportarVendas}>Vendas</Botao>
          <Botao tipo="neutro" icone="clientes" onClick={exportarClientes}>Clientes</Botao>
          <Botao tipo="neutro" icone="comissao" onClick={exportarComissoes}>Comissão</Botao>
        </div>
      </Cartao>

      <div style={{ textAlign: "center", fontSize: 12, color: T.ink3, padding: "10px 0 6px" }}>
        {meta.settings.storeName} · Programa feito por Miguel Borges — (34) 9 9188-1557
      </div>
    </div>
  );
}
