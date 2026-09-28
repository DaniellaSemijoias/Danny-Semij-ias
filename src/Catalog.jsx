import React, { useState, useEffect, useMemo, useRef } from "react";
import * as api from "./api";

/* ===========================================================================
   DANNY SEMIJOIAS — Catálogo público (/catalogo)
   Sem login. As peças de cada categoria deslizam para o lado.
   =========================================================================== */

const T = {
  bg: "#FDF4F7", bg2: "#F9E9EF", card: "#FFFFFF",
  ink: "#3B2230", ink2: "#7C6270", ink3: "#A8909C", line: "#F0DDE5",
  vinho: "#6B1F4A", vinhoSoft: "#FAEAF2", rose: "#C9899B", roseSoft: "#FBEFF2", roxo: "#8E2D6B",
  ok: "#2F855A", err: "#C53030", zap: "#25D366",
};
const SERIF = `"Playfair Display", Georgia, serif`;
const FONT = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
const SOMBRA = "0 1px 2px rgba(59,34,48,.04), 0 2px 10px rgba(59,34,48,.06)";
const SOMBRA_ALTA = "0 14px 44px rgba(59,34,48,.2)";
const ARQUIVOS = "https://qgdjigwgtzykmrakqoep.supabase.co/storage/v1/object/public/danny/";

const brl = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const soDigitos = (t) => String(t || "").replace(/\D/g, "");

const ICONES = {
  busca: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3",
  sacola: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  fechar: "M18 6 6 18M6 6l12 12",
  voltar: "m15 18-6-6 6-6",
  avancar: "m9 18 6-6-6-6",
  mais: "M12 5v14M5 12h14",
  menos: "M5 12h14",
  check: "m20 6-11 11-5-5",
  whats: "M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1 1 21 11.5",
  escudo: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cartao: "M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1M2 10h20M6 15h4",\n  pix: "M12 2.6 21.4 12 12 21.4 2.6 12zM8.4 8.4 12 4.8l3.6 3.6M8.4 15.6 12 19.2l3.6-3.6",
  joia: "M6 3h12l3 6-9 12-9-12zM3 9h18M9 3 6 9l6 12M15 3l3 6-6 12",
  instagram: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4M17.5 6.5h.01",
  seta: "M12 5v14M19 12l-7 7-7-7",
  gota: "M12 2.7 6.8 9a7 7 0 1 0 10.4 0z",
  brilho: "M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8",
  coracao: "M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z",
  estrela: "m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z",
  caixa: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
};
function Icone({ n, s = 18, cor = "currentColor", w = 1.75, style }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={w}
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} aria-hidden="true">
      <path d={ICONES[n] || ICONES.joia} />
    </svg>
  );
}

const CSS = `*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:${T.bg};color:${T.ink};font-family:${FONT};-webkit-font-smoothing:antialiased}
input,select,textarea,button{font-family:inherit}
@keyframes ctFade{from{opacity:0}to{opacity:1}}
@keyframes ctSheet{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
.ct-fade{animation:ctFade .2s ease both}
.ct-x{overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.ct-x::-webkit-scrollbar{height:0}
.ct-btn{transition:background .16s ease,color .16s ease,border-color .16s ease,transform .12s ease}
.ct-btn:active:not(:disabled){transform:scale(.97)}
.ct-card{transition:box-shadow .2s ease,transform .2s ease}
.ct-card:hover{box-shadow:0 10px 26px rgba(59,34,48,.1)}
.ct-in{transition:border-color .16s ease,box-shadow .16s ease}
.ct-in:focus{outline:none;border-color:${T.vinho};box-shadow:0 0 0 3px rgba(107,31,74,.12)}
@keyframes ctKenA{from{transform:scale(1.05) translate(0,0)}to{transform:scale(1.22) translate(-2.5%,-2%)}}
@keyframes ctKenB{from{transform:scale(1.22) translate(2.5%,1.5%)}to{transform:scale(1.05) translate(0,0)}}
@keyframes ctSobe{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes ctFlutua{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes ctPula{0%,100%{transform:translateY(0);opacity:.75}50%{transform:translateY(7px);opacity:1}}
.ct-sobe{animation:ctSobe .7s cubic-bezier(.16,1,.3,1) both}
`;

/* ------------------------- Abertura (ABERTURA 01 a 06) -------------------- */
/* Tenta alguns jeitos de escrever o nome do arquivo no bucket. O primeiro que
   carregar é o que vale. Se nenhum carregar, o catálogo abre direto.        */
const NOMES_ABERTURA = (n) => {
  const num = String(n).padStart(2, "0");
  const bases = [`ABERTURA${num}`, `ABERTURA ${num}`, `ABERTURA-${num}`, `ABERTURA_${num}`, `abertura${num}`];
  const exts = ["JPEG", "jpeg", "JPG", "jpg", "PNG", "png"];
  const lista = [];
  bases.forEach((b) => exts.forEach((e) => lista.push(ARQUIVOS + encodeURIComponent(`${b}.${e}`))));
  return lista;
};

function achaQuadro(urls) {
  return new Promise((pronto) => {
    let i = 0;
    const tenta = () => {
      if (i >= urls.length) return pronto(null);
      const url = urls[i++];
      const img = new Image();
      img.onload = () => pronto(url);
      img.onerror = tenta;
      img.src = url;
    };
    tenta();
  });
}

/* Quanto da altura de cada quadro da abertura é jogado fora embaixo, em %.
   Serve para cortar a marca d'água do gerador de imagens no rodapé da foto.
   Se ainda aparecer um pedacinho, aumente para 12, 14…; se cortar demais,
   diminua para 8, 6. */
const CORTE_RODAPE = 10;

/* O arquivo no bucket pode estar como icone.jpg, ICONE.JPG, Icone.jpeg…
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

/* Zoom de recorte da logo dentro do círculo. Se o arquivo tiver moldura
   (fundo preto nas pontas), aumente para 1.16, 1.22… até sumir. */
const ZOOM_LOGO = 1.12;

/* Prata 925 é material, não banho — no catálogo os dois aparecem separados. */
const ehPrata = (nome) => /925|prata\s*esterlina/i.test(nome || "") || /^\s*prata\s*$/i.test(nome || "");

function Logo({ s = 88 }) {
  const moldura = { width: s, height: s, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
    border: "2px solid rgba(255,255,255,.85)", boxShadow: "0 8px 26px rgba(59,34,48,.28)", background: T.vinho };
  const foto = { width: "100%", height: "100%", objectFit: "cover", transform: `scale(${ZOOM_LOGO})`, display: "block" };
  const monograma = (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#fff", fontFamily: SERIF, fontWeight: 700, fontSize: s * 0.42 }}>D</div>
  );
  return (
    <div style={moldura}>
      <ImgArquivo nome="icone" alt="" style={foto} reserva={monograma} />
    </div>
  );
}

function Abertura({ aoTerminar, loja }) {
  const [quadros, setQuadros] = useState([]);
  const [i, setI] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const [pronto, setPronto] = useState(false);

  /* Procura os quadros. Nada aparece antes de carregar — sem imagem quebrada. */
  useEffect(() => {
    let vivo = true;
    const desistir = setTimeout(() => { if (vivo) setPronto(true); }, 6000);
    Promise.all([1, 2, 3, 4, 5, 6].map((n) => achaQuadro(NOMES_ABERTURA(n)))).then((achados) => {
      if (!vivo) return;
      clearTimeout(desistir);
      setQuadros(achados.filter(Boolean));
      setPronto(true);
    });
    return () => { vivo = false; clearTimeout(desistir); };
  }, []);

  /* Os quadros vão passando devagar, em laço, com zoom lento. */
  useEffect(() => {
    if (quadros.length < 2) return;
    const t = setInterval(() => setI((k) => (k + 1) % quadros.length), 4200);
    return () => clearInterval(t);
  }, [quadros]);

  const sair = () => { setSaindo(true); setTimeout(aoTerminar, 520); };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, height: "100dvh", zIndex: 200, overflow: "hidden", background: T.vinho, opacity: saindo ? 0 : 1, transition: "opacity .5s ease" }}>
      {/* fotos ao fundo */}
      {quadros.map((url, k) => (
        <img key={url} src={url} alt=""
          style={{ position: "absolute", top: 0, right: 0, left: 0, width: "100%",
            height: `${100 + CORTE_RODAPE}%`, objectFit: "cover", objectPosition: "center top",
            opacity: k === i ? 1 : 0, transition: "opacity 1.3s ease",
            animation: `${k % 2 ? "ctKenB" : "ctKenA"} 9s ease-out both`,
            animationPlayState: k === i ? "running" : "paused" }} />
      ))}

      {/* véu para o texto ficar legível */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
        background: "linear-gradient(180deg, rgba(59,34,48,.55) 0%, rgba(59,34,48,.25) 35%, rgba(59,34,48,.82) 100%)" }} />

      {/* moldura fina */}
      <div style={{ position: "absolute", top: 14, right: 14, bottom: 14, left: 14, border: "1px solid rgba(255,255,255,.35)", borderRadius: 18, pointerEvents: "none" }} />

      {/* conteúdo */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 28px calc(40px + env(safe-area-inset-bottom,0px))", color: "#fff" }}>
        {pronto && (
          <>
            <div className="ct-sobe"><Logo s={92} /></div>

            <h1 className="ct-sobe" style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, margin: "20px 0 0", letterSpacing: .3, animationDelay: ".1s", textShadow: "0 2px 18px rgba(0,0,0,.35)" }}>
              {loja.storeName || "Danny Semijoias"}
            </h1>

            <div className="ct-sobe" style={{ fontSize: 15, color: "rgba(255,255,255,.9)", marginTop: 6, fontStyle: "italic", animationDelay: ".18s" }}>
              {loja.tagline || "seu estilo merece brilhar"}
            </div>

            <div className="ct-sobe" style={{ width: 54, height: 1, background: "rgba(255,255,255,.5)", margin: "22px 0", animationDelay: ".26s" }} />

            <p className="ct-sobe" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.45, maxWidth: 330, margin: 0, fontWeight: 500, animationDelay: ".32s", textShadow: "0 2px 18px rgba(0,0,0,.3)" }}>
              Seja bem-vinda.<br />Escolha com calma — cada peça foi separada pensando em você.
            </p>

            <div className="ct-sobe" style={{ marginTop: 28, animationDelay: ".42s" }}>
              <button onClick={sair} className="ct-btn"
                style={{ border: "none", background: "#fff", color: T.vinho, borderRadius: 999, padding: "15px 30px", fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,.28)" }}>
                Ver a coleção
              </button>
            </div>

            <div style={{ position: "absolute", left: 0, right: 0, bottom: "calc(26px + env(safe-area-inset-bottom,0px))", display: "flex", justifyContent: "center", color: "rgba(255,255,255,.85)", animation: "ctPula 1.9s ease-in-out infinite" }}>
              <Icone n="seta" s={22} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------- Seção "Seja bem-vinda" do catálogo ----------------- */
function BemVinda({ loja }) {
  const cartoes = [
    { icone: "joia", titulo: "Peça escolhida a dedo", texto: "Cada modelo é selecionado pensando no que fica bonito no dia a dia." },
    { icone: "escudo", titulo: "Com garantia", texto: "Defeito de fabricação a gente resolve. É só falar comigo." },
    { icone: "whats", titulo: "Atendimento no WhatsApp", texto: "Monte sua sacola aqui e finalize a compra comigo, sem pressa." },
  ];
  return (
    <section style={{ padding: "26px 16px 6px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, letterSpacing: 1.4, textTransform: "uppercase", color: T.rose, fontWeight: 700 }}>Seja bem-vinda</div>
        <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, margin: "6px 0 0" }}>Feito para brilhar com você</h2>
        <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 6, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
          {loja.tagline || "seu estilo merece brilhar"}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {cartoes.map((c, k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 16, padding: "14px 15px", boxShadow: SOMBRA }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: T.vinhoSoft, color: T.vinho, display: "grid", placeItems: "center", flexShrink: 0, animation: "ctFlutua 3.4s ease-in-out infinite", animationDelay: `${k * 0.35}s` }}>
              <Icone n={c.icone} s={19} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{c.titulo}</div>
              <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, marginTop: 2 }}>{c.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------- Seção "Sobre o banho das suas peças" ----------------- */
function SobreBanho() {
  const cartoes = [
    { icone: "brilho", titulo: "O banho pode perder o brilho", texto: "É normal e acontece com toda semijoia. O tempo que dura depende do uso, do suor, de perfume e de produtos químicos." },
    { icone: "gota", titulo: "Escurecer não é ferrugem", texto: "Semijoia não enferruja. Quando escurece, é o banho reagindo ao contato com água, creme ou perfume." },
    { icone: "estrela", titulo: "Pequenas diferenças são normais", texto: "O tom e o brilho podem variar um pouquinho entre peças e em relação à foto — cada banho reage do seu jeito." },
    { icone: "coracao", titulo: "E as peças de prata 925?", texto: "Prata 925 não tem banho para sair. Ela pode escurecer com o tempo — é oxidação natural — e volta a brilhar com flanela própria para prata." },
    { icone: "escudo", titulo: "O que a garantia cobre", texto: "Defeito de fabricação: fecho que solta, solda que abre, pedra que cai sozinha. Não cobre perda de cor pelo uso, queda ou contato com água e química." },
  ];
  return (
    <section style={{ background: "#fff", borderTop: `1px solid ${T.line}`, padding: "30px 16px 26px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, letterSpacing: 1.4, textTransform: "uppercase", color: T.rose, fontWeight: 700 }}>Bom saber</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, margin: "6px 0 0" }}>Sobre o banho das suas peças</h2>
          <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 6 }}>Com um cuidado simples, elas duram muito mais.</div>
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr" }}>
          {cartoes.map((c, k) => (
            <div key={k} style={{ display: "flex", gap: 13, background: T.bg, borderRadius: 16, padding: "15px 16px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", color: T.vinho, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icone n={c.icone} s={18} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{c.titulo}</div>
                <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.6, marginTop: 3 }}>{c.texto}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Peças base ------------------------------- */
function Foto({ url, raio = 14, altura = "100%", children }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: altura, borderRadius: raio, overflow: "hidden", background: T.bg2 }}>
      {url && !falhou ? (
        <img src={url} alt="" loading="lazy" onError={() => setFalhou(true)}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "grid", placeItems: "center", color: T.rose }}>
          <Icone n="joia" s={26} />
        </div>
      )}
      {children}
    </div>
  );
}

function Botao({ children, onClick, tipo = "primario", icone, tamanho = "m", disabled, style }) {
  const tam = { s: { padding: "8px 13px", fontSize: 13 }, m: { padding: "11px 17px", fontSize: 14 }, g: { padding: "14px 20px", fontSize: 15 } };
  const tipos = {
    primario: { background: T.vinho, color: "#fff", border: "1px solid transparent" },
    suave: { background: T.vinhoSoft, color: T.vinho, border: "1px solid transparent" },
    neutro: { background: "#fff", color: T.ink, border: `1px solid ${T.line}` },
    zap: { background: T.zap, color: "#fff", border: "1px solid transparent" },
  };
  return (
    <button onClick={onClick} disabled={disabled} className="ct-btn"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap", ...tam[tamanho], ...tipos[tipo], ...style }}>
      {icone && <Icone n={icone} s={tamanho === "s" ? 15 : 17} />}
      {children}
    </button>
  );
}

function Folha({ aberto, aoFechar, titulo, sub, children, rodape, largo }) {
  useEffect(() => {
    if (!aberto) return;
    const t = () => window.history.pushState({ ct: true }, "");
    t();
    const fechar = () => aoFechar();
    window.addEventListener("popstate", fechar);
    return () => window.removeEventListener("popstate", fechar);
  }, [aberto]);
  if (!aberto) return null;
  return (
    <div className="ct-fade" onClick={aoFechar}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, height: "100dvh", background: "rgba(59,34,48,.5)", zIndex: 90, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", maxWidth: largo ? 720 : 520, maxHeight: "94dvh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", borderRadius: "24px 24px 0 0", boxShadow: SOMBRA_ALTA, animation: "ctSheet .26s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 2, padding: "18px 20px 14px", borderBottom: `1px solid ${T.line}`, borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 20, fontWeight: 600 }}>{titulo}</h3>
              {sub && <div style={{ fontSize: 13, color: T.ink2, marginTop: 3 }}>{sub}</div>}
            </div>
            <button onClick={aoFechar} aria-label="Fechar" className="ct-btn"
              style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: T.bg2, color: T.ink2, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icone n="fechar" s={16} />
            </button>
          </div>
        </div>
        <div style={{ padding: "18px 20px 22px" }}>{children}</div>
        {rodape && (
          <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: `1px solid ${T.line}`, padding: "14px 20px calc(14px + env(safe-area-inset-bottom,0px))", display: "flex", gap: 10 }}>
            {rodape}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================ Catálogo ================================ */
export default function Catalog() {
  const [abertura, setAbertura] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pecas, setPecas] = useState([]);
  const [loja, setLoja] = useState({});
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState("Todas");
  const [ficha, setFicha] = useState(null);
  const [sacola, setSacola] = useState([]);
  const [verSacola, setVerSacola] = useState(false);
  const [passo, setPasso] = useState(0);        /* 1 cuidados · 2 pagamento */
  const [aviso, setAviso] = useState("");
  const [largo, setLargo] = useState(typeof window !== "undefined" && window.innerWidth >= 900);
  const trilhos = useRef({});

  useEffect(() => {
    const r = () => setLargo(window.innerWidth >= 900);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    api.loadCatalog()
      .then(({ pecas, loja }) => { setPecas(pecas); setLoja(loja); })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(""), 2600); };

  const categorias = useMemo(() => {
    const vistas = [];
    pecas.forEach((p) => { if (!vistas.includes(p.category)) vistas.push(p.category); });
    return vistas;
  }, [pecas]);

  const filtradas = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return pecas.filter((p) => {
      if (!p.algumDisponivel) return false;
      if (aba !== "Todas" && p.category !== aba) return false;
      if (!b) return true;
      return `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(b);
    });
  }, [pecas, busca, aba]);

  const porCategoria = useMemo(() => {
    const mapa = new Map();
    filtradas.forEach((p) => {
      if (!mapa.has(p.category)) mapa.set(p.category, []);
      mapa.get(p.category).push(p);
    });
    return [...mapa.entries()];
  }, [filtradas]);

  const adicionar = (item) => {
    setSacola((s) => {
      const i = s.findIndex((x) => x.id === item.id && x.platingId === item.platingId && x.sizeId === item.sizeId);
      if (i >= 0) { const n = [...s]; n[i] = { ...n[i], qtd: n[i].qtd + item.qtd }; return n; }
      return [...s, item];
    });
    setFicha(null);
    mostrar("Adicionado à sacola.");
  };

  const mudarQtd = (k, d) => setSacola((s) => s.map((x, i) => (i === k ? { ...x, qtd: Math.max(1, x.qtd + d) } : x)));
  const tirar = (k) => setSacola((s) => s.filter((_, i) => i !== k));

  const totalSacola = sacola.reduce((a, x) => a + x.preco * x.qtd, 0);
  const totalItens = sacola.reduce((a, x) => a + x.qtd, 0);

  const deslizar = (cat, lado) => {
    const el = trilhos.current[cat];
    if (el) el.scrollBy({ left: lado * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (abertura) {
    return (
      <div style={{ fontFamily: FONT, background: T.vinho, minHeight: "100vh" }}>
        <style>{CSS}</style>
        <Abertura aoTerminar={() => setAbertura(false)} loja={loja} />
      </div>
    );
  }

  if (carregando) {
    return (
      <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center", color: T.ink3 }}>
          <Logo s={62} />
          <div style={{ marginTop: 14, fontSize: 13.5 }}>Abrindo a vitrine…</div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <style>{CSS}</style>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 21, marginBottom: 8 }}>Não consegui abrir o catálogo</div>
          <div style={{ fontSize: 14, color: T.ink2, marginBottom: 16 }}>{erro}</div>
          <Botao onClick={() => window.location.reload()}>Tentar de novo</Botao>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT, background: T.bg, minHeight: "100vh", paddingBottom: 110 }}>
      <style>{CSS}</style>

      {/* ------------------------------- Topo ------------------------------- */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${T.line}`, padding: "18px 16px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <ImgArquivo nome="logo" alt={loja.storeName || "Danny Semijoias"}
              style={{ width: "100%", maxWidth: 420, borderRadius: 16, boxShadow: SOMBRA }}
              reserva={<Logo s={78} />} />
          </div>

          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 13, top: 13, color: T.ink3 }}><Icone n="busca" s={17} /></span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar uma peça…" className="ct-in"
              style={{ width: "100%", padding: "12px 14px 12px 40px", fontSize: 14.5, borderRadius: 12, border: `1px solid ${T.line}`, background: T.bg, color: T.ink, fontWeight: 500 }} />
          </div>

          <div className="ct-x" style={{ display: "flex", gap: 8, paddingBottom: 12, scrollSnapType: "none" }}>
            {["Todas", ...categorias].map((c) => {
              const on = aba === c;
              return (
                <button key={c} onClick={() => setAba(c)} className="ct-btn"
                  style={{ flexShrink: 0, padding: "9px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: on ? T.vinho : "#fff", color: on ? "#fff" : T.ink2, border: `1px solid ${on ? T.vinho : T.line}` }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ---------------------------- Os trilhos ---------------------------- */}
      <BemVinda loja={loja} />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 0 10px" }}>
        {porCategoria.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: T.ink2 }}>
            <Icone n="joia" s={30} cor={T.rose} />
            <div style={{ marginTop: 12, fontSize: 14.5 }}>Nenhuma peça encontrada.</div>
          </div>
        )}

        {porCategoria.map(([cat, itens]) => (
          <section key={cat} style={{ marginBottom: 30 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 16px 12px" }}>
              <div>
                <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, margin: 0 }}>{cat}</h2>
                <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{itens.length} peça(s) · deslize para o lado</div>
              </div>
              {largo && (
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => deslizar(cat, -1)} aria-label="Anterior" className="ct-btn"
                    style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.line}`, background: "#fff", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icone n="voltar" s={16} />
                  </button>
                  <button onClick={() => deslizar(cat, 1)} aria-label="Próxima" className="ct-btn"
                    style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${T.line}`, background: "#fff", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icone n="avancar" s={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="ct-x" ref={(el) => { trilhos.current[cat] = el; }}
              style={{ display: "flex", gap: 12, padding: "2px 16px 8px" }}>
              {itens.map((p) => (
                <div key={p.id} onClick={() => setFicha(p)} className="ct-card"
                  style={{ scrollSnapAlign: "start", flexShrink: 0, width: largo ? 230 : 168, background: "#fff", borderRadius: 18, border: `1px solid ${T.line}`, boxShadow: SOMBRA, overflow: "hidden", cursor: "pointer" }}>
                  <Foto url={p.photos[0]} raio={0} />
                  <div style={{ padding: "11px 12px 13px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, minHeight: 35, overflow: "hidden" }}>{p.name}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.vinho, margin: "6px 0 9px" }}>{brl(p.price)}</div>
                    <Botao tamanho="s" icone="mais" style={{ width: "100%" }} onClick={(e) => { e.stopPropagation?.(); setFicha(p); }}>
                      Adicionar
                    </Botao>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <SobreBanho />

      {/* ------------------------------ Rodapé ------------------------------ */}
      <footer style={{ borderTop: `1px solid ${T.line}`, background: "#fff", padding: "22px 16px 28px", textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.vinho }}>{loja.storeName || "Danny Semijoias"}</div>
        {loja.tagline && <div style={{ fontSize: 13, color: T.rose, marginTop: 3 }}>{loja.tagline}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "14px 0 16px", flexWrap: "wrap" }}>
          {loja.whatsapp && (
            <Botao tipo="zap" icone="whats" tamanho="s" onClick={() => window.open(`https://wa.me/55${soDigitos(loja.whatsapp)}`, "_blank")}>
              Falar no WhatsApp
            </Botao>
          )}
          {loja.instagram && (
            <Botao tipo="neutro" icone="instagram" tamanho="s"
              onClick={() => window.open(`https://instagram.com/${String(loja.instagram).replace("@", "")}`, "_blank")}>
              Instagram
            </Botao>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: T.ink3, lineHeight: 1.6 }}>
          Programa feito por Miguel Borges — (34) 9 9188-1557
        </div>
      </footer>

      {/* ----------------------------- Flutuantes --------------------------- */}
      {loja.whatsapp && (
        <button onClick={() => window.open(`https://wa.me/55${soDigitos(loja.whatsapp)}`, "_blank")} aria-label="WhatsApp" className="ct-btn"
          style={{ position: "fixed", right: 16, bottom: sacola.length ? 92 : 22, width: 54, height: 54, borderRadius: "50%", border: "none", background: T.zap, color: "#fff", boxShadow: SOMBRA_ALTA, cursor: "pointer", display: "grid", placeItems: "center", zIndex: 60 }}>
          <Icone n="whats" s={25} />
        </button>
      )}

      {sacola.length > 0 && (
        <div style={{ position: "fixed", left: 12, right: 12, bottom: 16, zIndex: 60, display: "flex", justifyContent: "center" }}>
          <button onClick={() => setVerSacola(true)} className="ct-btn"
            style={{ width: "100%", maxWidth: 520, border: "none", background: T.vinho, color: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: SOMBRA_ALTA, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <Icone n="sacola" s={20} />
            <span style={{ flex: 1, textAlign: "left", fontSize: 14.5, fontWeight: 600 }}>
              {totalItens} item(ns) na sacola
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>{brl(totalSacola)}</span>
          </button>
        </div>
      )}

      {aviso && (
        <div className="ct-fade" style={{ position: "fixed", left: 12, right: 12, bottom: sacola.length ? 92 : 24, zIndex: 100, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ background: "#fff", borderLeft: `3px solid ${T.ok}`, padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: SOMBRA_ALTA, display: "flex", alignItems: "center", gap: 9 }}>
            <Icone n="check" s={15} cor={T.ok} />{aviso}
          </div>
        </div>
      )}

      {/* ------------------------------- Telas ------------------------------ */}
      {ficha && <FichaPeca peca={ficha} aoFechar={() => setFicha(null)} aoAdicionar={adicionar} largo={largo} />}

      <Sacola aberto={verSacola} aoFechar={() => setVerSacola(false)} itens={sacola} total={totalSacola}
        mudarQtd={mudarQtd} tirar={tirar} aoFinalizar={() => { setVerSacola(false); setPasso(1); }} />

      <Cuidados aberto={passo === 1} aoFechar={() => setPasso(0)} texto={loja.careNote}
        aoSeguir={() => setPasso(2)} />

      <Pagamento aberto={passo === 2} aoFechar={() => setPasso(0)} loja={loja} itens={sacola} total={totalSacola}
        aoEnviar={() => { setPasso(0); setSacola([]); mostrar("Pedido enviado no WhatsApp."); }} />
    </div>
  );
}

/* ----------------------------- Ficha da peça ------------------------------ */
function FichaPeca({ peca, aoFechar, aoAdicionar, largo }) {
  const [i, setI] = useState(0);
  const [banho, setBanho] = useState(peca.platings.find((b) => peca.banhoTem(b.id))?.id || peca.platings[0]?.id || null);
  const [aro, setAro] = useState(null);
  const [qtd, setQtd] = useState(1);
  const [erro, setErro] = useState("");

  const fotos = peca.photos.length ? peca.photos : [null];
  const aros = peca.sizes.filter((s) => !/[uú]nico/i.test(s.name));
  const precisaAro = aros.length > 0;

  useEffect(() => {
    if (!precisaAro) { setAro(peca.sizes[0]?.id || null); return; }
    const livre = aros.find((s) => peca.temEstoque(banho, s.id));
    setAro(livre?.id || null);
  }, [banho]);

  const disponivel = banho && aro ? peca.temEstoque(banho, aro) : false;

  const confirmar = () => {
    if (!banho) return setErro("Escolha o acabamento.");
    if (precisaAro && !aro) return setErro("Escolha o aro.");
    if (!disponivel) return setErro("Essa combinação está esgotada.");
    const b = peca.platings.find((x) => x.id === banho);
    const a = peca.sizes.find((x) => x.id === aro);
    aoAdicionar({
      id: peca.id, nome: peca.name, preco: peca.price, foto: peca.photos[0],
      platingId: banho, banho: b?.name || "", sizeId: aro, aro: a && !/[uú]nico/i.test(a.name) ? a.name : "",
      qtd,
    });
  };

  return (
    <Folha aberto largo={largo} aoFechar={aoFechar} titulo={peca.name} sub={peca.category}
      rodape={
        <>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden" }}>
            <button onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Menos" className="ct-btn"
              style={{ width: 40, height: 44, border: "none", background: "#fff", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <Icone n="menos" s={16} />
            </button>
            <span style={{ width: 34, textAlign: "center", fontSize: 15, fontWeight: 600 }}>{qtd}</span>
            <button onClick={() => setQtd((q) => q + 1)} aria-label="Mais" className="ct-btn"
              style={{ width: 40, height: 44, border: "none", background: "#fff", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <Icone n="mais" s={16} />
            </button>
          </div>
          <Botao onClick={confirmar} tamanho="g" style={{ flex: 1 }}>Adicionar à sacola</Botao>
        </>
      }>
      <div style={{ display: "grid", gridTemplateColumns: largo ? "1fr 1fr" : "1fr", gap: 18 }}>
        <div>
          <Foto url={fotos[i]}>
            {fotos.length > 1 && (
              <>
                <button onClick={() => setI((i - 1 + fotos.length) % fotos.length)} aria-label="Anterior" className="ct-btn"
                  style={{ position: "absolute", left: 9, top: "50%", marginTop: -17, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.94)", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icone n="voltar" s={16} />
                </button>
                <button onClick={() => setI((i + 1) % fotos.length)} aria-label="Próxima" className="ct-btn"
                  style={{ position: "absolute", right: 9, top: "50%", marginTop: -17, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.94)", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icone n="avancar" s={16} />
                </button>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center", gap: 5 }}>
                  {fotos.map((_, k) => (
                    <span key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 999, background: k === i ? T.vinho : "rgba(255,255,255,.9)" }} />
                  ))}
                </div>
              </>
            )}
          </Foto>
        </div>

        <div>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: T.vinho }}>{brl(peca.price)}</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "10px 0 14px" }}>
            {peca.karat && (
              <span style={{ background: T.bg2, color: T.ink2, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999 }}>{peca.karat}</span>
            )}
            {peca.warranty > 0 && (
              <span style={{ background: T.vinhoSoft, color: T.vinho, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icone n="escudo" s={12} />{peca.warranty} ano(s) de garantia
              </span>
            )}
          </div>

          {peca.description && (
            <div style={{ fontSize: 14, color: T.ink2, lineHeight: 1.6, marginBottom: 18 }}>{peca.description}</div>
          )}

          {[["Banho", peca.platings.filter((b) => !ehPrata(b.name))],
            ["Prata", peca.platings.filter((b) => ehPrata(b.name))]].map(([grupo, itens]) => (
            itens.length === 0 ? null : (
              <div key={grupo} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, letterSpacing: .8, textTransform: "uppercase", color: T.ink3, fontWeight: 700, marginBottom: 7 }}>{grupo}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {itens.map((b) => {
                    const tem = peca.banhoTem(b.id);
                    const on = banho === b.id;
                    return (
                      <button key={b.id} disabled={!tem} onClick={() => { setBanho(b.id); setErro(""); }} className="ct-btn"
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 999, cursor: tem ? "pointer" : "not-allowed", opacity: tem ? 1 : 0.4, fontSize: 13.5, fontWeight: 600, background: on ? T.vinhoSoft : "#fff", color: on ? T.vinho : T.ink2, border: `1px solid ${on ? T.vinho : T.line}` }}>
                        <span style={{ width: 13, height: 13, borderRadius: "50%", background: b.hex || T.rose, border: `1px solid ${T.line}` }} />
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          {precisaAro && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 8 }}>Aro</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
                {aros.map((s) => {
                  const tem = peca.temEstoque(banho, s.id);
                  const on = aro === s.id;
                  return (
                    <button key={s.id} disabled={!tem} onClick={() => { setAro(s.id); setErro(""); }} className="ct-btn"
                      style={{ minWidth: 46, padding: "9px 13px", borderRadius: 11, cursor: tem ? "pointer" : "not-allowed", opacity: tem ? 1 : 0.35, fontSize: 13.5, fontWeight: 600, background: on ? T.vinhoSoft : "#fff", color: on ? T.vinho : T.ink2, border: `1px solid ${on ? T.vinho : T.line}` }}>
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {erro && <div style={{ fontSize: 13, color: T.err, fontWeight: 600 }}>{erro}</div>}
          {!erro && !disponivel && <div style={{ fontSize: 13, color: T.ink3 }}>Escolha um acabamento disponível.</div>}
        </div>
      </div>
    </Folha>
  );
}

/* --------------------------------- Sacola --------------------------------- */
function Sacola({ aberto, aoFechar, itens, total, mudarQtd, tirar, aoFinalizar }) {
  return (
    <Folha aberto={aberto} aoFechar={aoFechar} titulo="Sua sacola" sub={`${itens.length} peça(s) escolhida(s)`}
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Continuar vendo</Botao>
          <Botao onClick={aoFinalizar} disabled={!itens.length} style={{ flex: 2 }}>Finalizar pedido</Botao>
        </>
      }>
      {itens.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 10px", color: T.ink2 }}>
          <Icone n="sacola" s={26} cor={T.rose} />
          <div style={{ marginTop: 10, fontSize: 14 }}>Sua sacola está vazia.</div>
        </div>
      )}

      {itens.map((x, k) => (
        <div key={k} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ width: 58, flexShrink: 0 }}><Foto url={x.foto} raio={11} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{x.nome}</div>
            <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
              {x.banho}{x.aro ? ` · aro ${x.aro}` : ""}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.line}`, borderRadius: 9 }}>
                <button onClick={() => mudarQtd(k, -1)} aria-label="Menos" className="ct-btn"
                  style={{ width: 28, height: 28, border: "none", background: "none", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icone n="menos" s={13} />
                </button>
                <span style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{x.qtd}</span>
                <button onClick={() => mudarQtd(k, 1)} aria-label="Mais" className="ct-btn"
                  style={{ width: 28, height: 28, border: "none", background: "none", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icone n="mais" s={13} />
                </button>
              </div>
              <button onClick={() => tirar(k)} className="ct-btn"
                style={{ border: "none", background: "none", color: T.err, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                tirar
              </button>
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{brl(x.preco * x.qtd)}</div>
        </div>
      ))}

      {itens.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <span style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>Total</span>
          <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: T.vinho }}>{brl(total)}</span>
        </div>
      )}
    </Folha>
  );
}

/* ---------------------- Passo 1 — cuidados e garantia --------------------- */
function Cuidados({ aberto, aoFechar, texto, aoSeguir }) {
  const [ciente, setCiente] = useState(false);
  useEffect(() => { if (aberto) setCiente(false); }, [aberto]);

  const padrao = `Todas as peças são semijoias banhadas — elas não podem molhar.

• Tire antes do banho, da piscina, do mar e da academia. Água e suor tiram o brilho do banho.
• Perfume, creme e álcool por último, longe da peça. Espere secar antes de colocar.
• Nada de produto de limpeza, cloro ou água sanitária.
• Guarde cada peça separada, num saquinho, em lugar seco e longe do sol.
• Para limpar, só flanela macia e seca.

Prata 925: essa não tem banho para sair. Com o tempo pode escurecer (oxidação natural) e volta ao brilho com flanela própria para prata. Ainda assim, evite piscina, mar e produtos de limpeza.

Garantia: cobre defeito de fabricação — fecho que solta, solda que abre, pedra que cai sozinha. Não cobre perda de cor pelo uso, queda, amassado ou contato com água e produtos químicos.`;

  return (
    <Folha aberto={aberto} aoFechar={aoFechar} titulo="Cuidados e garantia" sub="Leia antes de fechar o pedido"
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Voltar</Botao>
          <Botao onClick={aoSeguir} disabled={!ciente} style={{ flex: 2 }}>Continuar</Botao>
        </>
      }>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <span style={{ width: 52, height: 52, borderRadius: 16, background: T.vinhoSoft, color: T.vinho, display: "grid", placeItems: "center" }}>
          <Icone n="escudo" s={24} />
        </span>
      </div>

      <div style={{ fontSize: 14.5, color: T.ink2, lineHeight: 1.7, whiteSpace: "pre-line", background: T.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        {texto || padrao}
      </div>

      <button onClick={() => setCiente((c) => !c)} className="ct-btn"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "13px 14px", borderRadius: 13, cursor: "pointer", textAlign: "left", background: ciente ? T.vinhoSoft : "#fff", border: `1px solid ${ciente ? T.vinho : T.line}` }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: ciente ? T.vinho : "#fff", color: "#fff", border: `1px solid ${ciente ? T.vinho : T.line}` }}>
          {ciente && <Icone n="check" s={13} />}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: ciente ? T.vinho : T.ink2 }}>
          Li e entendi como cuidar das minhas peças
        </span>
      </button>
    </Folha>
  );
}

/* ------------------ Passo 2 — pagamento e envio no WhatsApp --------------- */
const FORMAS = [
  { id: "Pix", icone: "pix" },
  { id: "Dinheiro", icone: "caixa" },
  { id: "Cartão de débito", icone: "cartao" },
  { id: "Cartão de crédito", icone: "cartao" },
];

function Pagamento({ aberto, aoFechar, loja, itens, total, aoEnviar }) {
  const [forma, setForma] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");

  useEffect(() => { if (aberto) { setForma(""); setParcelas("1"); setObs(""); } }, [aberto]);

  const enviar = () => {
    if (!forma) return;
    const linhas = itens.map((x) =>
      `• ${x.qtd}x ${x.nome}${x.banho ? ` — ${x.banho}` : ""}${x.aro ? ` · aro ${x.aro}` : ""} — ${brl(x.preco * x.qtd)}`
    );
    const pagamento = forma === "Cartão de crédito" && parcelas !== "1" ? `${forma} em ${parcelas}x` : forma;
    const texto = [
      `Olá! Quero fechar meu pedido no catálogo da ${loja.storeName || "Danny Semijoias"} 💎`,
      "",
      ...linhas,
      "",
      `Total: ${brl(total)}`,
      `Forma de pagamento: ${pagamento}`,
      nome.trim() ? `Meu nome: ${nome.trim()}` : "",
      obs.trim() ? `Observação: ${obs.trim()}` : "",
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/55${soDigitos(loja.whatsapp)}?text=${encodeURIComponent(texto)}`, "_blank");
    aoEnviar();
  };

  return (
    <Folha aberto={aberto} aoFechar={aoFechar} titulo="Como você prefere pagar?" sub="Depois é só enviar no WhatsApp"
      rodape={
        <>
          <Botao tipo="neutro" onClick={aoFechar} style={{ flex: 1 }}>Voltar</Botao>
          <Botao tipo="zap" icone="whats" onClick={enviar} disabled={!forma} style={{ flex: 2 }}>Enviar pedido</Botao>
        </>
      }>
      <div style={{ display: "grid", gap: 9, marginBottom: 16 }}>
        {FORMAS.map((f) => {
          const on = forma === f.id;
          return (
            <button key={f.id} onClick={() => setForma(f.id)} className="ct-btn"
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 15px", borderRadius: 13, cursor: "pointer", textAlign: "left", background: on ? T.vinhoSoft : "#fff", border: `1px solid ${on ? T.vinho : T.line}` }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: on ? T.vinho : T.bg2, color: on ? "#fff" : T.ink2 }}>
                <Icone n={f.icone} s={16} />
              </span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: on ? T.vinho : T.ink }}>{f.id}</span>
              {on && <Icone n="check" s={17} cor={T.vinho} />}
            </button>
          );
        })}
      </div>

      {forma === "Cartão de crédito" && (
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Em quantas vezes?</span>
          <select value={parcelas} onChange={(e) => setParcelas(e.target.value)} className="ct-in"
            style={{ width: "100%", padding: "12px 13px", fontSize: 14.5, borderRadius: 12, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontWeight: 500 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={String(n)}>{n}x de {brl(total / n)}</option>
            ))}
          </select>
        </label>
      )}

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Seu nome</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como te chamar" className="ct-in"
          style={{ width: "100%", padding: "12px 13px", fontSize: 14.5, borderRadius: 12, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontWeight: 500 }} />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.ink2, marginBottom: 6 }}>Observação</span>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Algum recado? É presente?" className="ct-in"
          style={{ width: "100%", padding: "12px 13px", fontSize: 14.5, borderRadius: 12, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontWeight: 500, minHeight: 80, resize: "vertical" }} />
      </label>

      {loja.paymentNote && (
        <div style={{ fontSize: 13, color: T.ink2, background: T.bg, borderRadius: 12, padding: 13, marginBottom: 14, lineHeight: 1.6 }}>
          {loja.paymentNote}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
        <span style={{ fontSize: 14, color: T.ink2, fontWeight: 500 }}>Total do pedido</span>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: T.vinho }}>{brl(total)}</span>
      </div>
    </Folha>
  );
}
