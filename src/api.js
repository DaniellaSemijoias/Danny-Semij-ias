/* ===========================================================================
   DANNY SEMIJOIAS — Conversa com o Supabase
   Todo acesso ao banco passa por aqui. As telas nunca falam direto.
   =========================================================================== */
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const erro = (e) => { throw new Error(e.message || "Algo deu errado. Tente de novo."); };

/* --------------------------------- Acesso --------------------------------- */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) erro(error);
  return data.user;
}
export async function signOut() { await supabase.auth.signOut(); }
export function onAuthChange(cb) { return supabase.auth.onAuthStateChange((_e, s) => cb(s)); }
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email, name: data?.name || user.email, role: data?.role || "func" };
}

/* ------------------------------- Cadastros -------------------------------- */
export async function loadMeta() {
  const [cat, pla, siz, kar, cli, cfg, usr] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("platings").select("*").order("sort_order"),
    supabase.from("sizes").select("*").order("sort_order"),
    supabase.from("karats").select("*").order("sort_order"),
    supabase.from("customers").select("*").order("name"),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("profiles").select("*").order("email"),
  ]);
  const s = cfg.data || {};
  return {
    categories: cat.data || [],
    platings: pla.data || [],
    sizes: siz.data || [],
    karats: kar.data || [],
    customers: cli.data || [],
    users: usr.data || [],
    settings: {
      storeName: s.store_name || "Danny Semijoias",
      tagline: s.tagline || "",
      whatsapp: s.whatsapp || "",
      instagram: s.instagram || "",
      lowStock: s.low_stock ?? 2,
      paymentNote: s.payment_note || "",
      careNote: s.care_note || "",
    },
  };
}

const lista = (tabela) => ({
  add: async (dados) => { const { error } = await supabase.from(tabela).insert(dados); if (error) erro(error); },
  remove: async (id) => { const { error } = await supabase.from(tabela).delete().eq("id", id); if (error) erro(error); },
});
export const addCategory = (name) => lista("categories").add({ name });
export const removeCategory = (id) => lista("categories").remove(id);
export const addPlating = (name, hex) => lista("platings").add({ name, hex: hex || "#C9A227" });
export const removePlating = (id) => lista("platings").remove(id);
export const addSize = (name) => lista("sizes").add({ name });
export const removeSize = (id) => lista("sizes").remove(id);
export const addKarat = (name) => lista("karats").add({ name });
export const removeKarat = (id) => lista("karats").remove(id);

export async function saveSettings(s) {
  const { error } = await supabase.from("settings").update({
    store_name: s.storeName, tagline: s.tagline, whatsapp: s.whatsapp, instagram: s.instagram,
    low_stock: Number(s.lowStock) || 0, payment_note: s.paymentNote, care_note: s.careNote,
  }).eq("id", 1);
  if (error) erro(error);
}
export async function setUserRole(id, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) erro(error);
}

/* -------------------------------- Clientes -------------------------------- */
const limpaCliente = (c) => ({
  name: c.name, phone: c.phone || null, email: c.email || null,
  birthday: c.birthday || null, notes: c.notes || null,
});
export async function addCustomer(c) {
  const { data, error } = await supabase.from("customers").insert(limpaCliente(c)).select().single();
  if (error) erro(error);
  return data;
}
export async function updateCustomer(id, c) {
  const { error } = await supabase.from("customers").update(limpaCliente(c)).eq("id", id);
  if (error) erro(error);
}
export async function removeCustomer(id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) erro(error);
}

/* --------------------------------- Peças ---------------------------------- */
function montaPeca(p, meta) {
  const fotos = (p.product_images || []).slice().sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url);
  const vars = (p.product_variations || []).map((v) => ({
    id: v.id, platingId: v.plating_id, sizeId: v.size_id, quantity: v.quantity || 0,
  }));
  const total = vars.reduce((a, v) => a + v.quantity, 0);
  return {
    id: p.id, name: p.name, sku: p.sku || "", categoryId: p.category_id,
    description: p.description || "", cost: Number(p.cost_price) || 0, price: Number(p.sale_price) || 0,
    karat: p.plating_detail || "", warranty: p.warranty_years || 0,
    active: p.active !== false, mainImage: p.main_image_url, gallery: fotos,
    photos: [p.main_image_url, ...fotos].filter(Boolean),
    variations: vars, stock: total,
    temEstoque: (platingId, sizeId) => vars.some((v) => v.platingId === platingId && v.sizeId === sizeId && v.quantity > 0),
    banhoTem: (platingId) => vars.some((v) => v.platingId === platingId && v.quantity > 0),
    quantidade: (platingId, sizeId) => vars.find((v) => v.platingId === platingId && v.sizeId === sizeId)?.quantity || 0,
    variacao: (platingId, sizeId) => vars.find((v) => v.platingId === platingId && v.sizeId === sizeId),
    createdAt: p.created_at,
  };
}

export async function loadProducts() {
  const { data, error } = await supabase
    .from("products").select("*, product_images(*), product_variations(*)")
    .eq("deleted", false).order("name");
  if (error) erro(error);
  return (data || []).map((p) => montaPeca(p));
}

export async function nextSku(prefixo = "DS") {
  const { data } = await supabase.from("products").select("sku");
  let maior = 0;
  (data || []).forEach((p) => {
    const m = String(p.sku || "").match(/^([A-Za-z]+)[-\s]?(\d+)$/);
    if (m && m[1].toUpperCase() === prefixo.toUpperCase()) maior = Math.max(maior, parseInt(m[2], 10));
  });
  return `${prefixo.toUpperCase()}-${String(maior + 1).padStart(3, "0")}`;
}

export async function skuExists(sku, ignoreId) {
  if (!sku) return false;
  let q = supabase.from("products").select("id").eq("sku", sku).eq("deleted", false);
  if (ignoreId) q = q.neq("id", ignoreId);
  const { data } = await q;
  return (data || []).length > 0;
}

/* f.variations: [{ platingId, sizeId, quantity }] */
export async function saveProduct(f) {
  /* fotos gravadas antes, para apagar as que a usuária tirou */
  let fotosAntigas = [];
  if (f.id) {
    const { data: antigo } = await supabase.from("products")
      .select("main_image_url, product_images(image_url)").eq("id", f.id).maybeSingle();
    fotosAntigas = [antigo?.main_image_url, ...((antigo?.product_images || []).map((i) => i.image_url))].filter(Boolean);
  }

  const base = {
    name: f.name, sku: f.sku || null, category_id: f.categoryId || null,
    description: f.description || null, cost_price: Number(f.cost) || 0,
    sale_price: Number(f.price) || 0, plating_detail: f.karat || null,
    warranty_years: Number(f.warranty) || 0, main_image_url: f.mainImage || null,
    active: f.active !== false,
  };
  let id = f.id;
  if (id) {
    const { error } = await supabase.from("products").update(base).eq("id", id);
    if (error) erro(error);
  } else {
    const { data, error } = await supabase.from("products").insert(base).select().single();
    if (error) erro(error);
    id = data.id;
  }

  await supabase.from("product_images").delete().eq("product_id", id);
  const fotos = (f.gallery || []).filter(Boolean).map((url, i) => ({ product_id: id, image_url: url, sort_order: i }));
  if (fotos.length) await supabase.from("product_images").insert(fotos);

  /* variações: mantém a quantidade das que já existem */
  const { data: atuais } = await supabase.from("product_variations").select("*").eq("product_id", id);
  const querem = f.variations || [];
  const chave = (v) => `${v.platingId || v.plating_id}_${v.sizeId || v.size_id}`;
  const mapaAtual = new Map((atuais || []).map((v) => [chave(v), v]));
  const querKeys = new Set(querem.map(chave));

  for (const v of querem) {
    const existe = mapaAtual.get(chave(v));
    if (existe) {
      if (v.quantity != null && Number(v.quantity) !== existe.quantity) {
        await supabase.from("product_variations").update({ quantity: Number(v.quantity) || 0 }).eq("id", existe.id);
      }
    } else {
      await supabase.from("product_variations").insert({
        product_id: id, plating_id: v.platingId, size_id: v.sizeId, quantity: Number(v.quantity) || 0,
      });
    }
  }
  for (const [k, v] of mapaAtual) {
    if (!querKeys.has(k)) await supabase.from("product_variations").delete().eq("id", v.id);
  }

  /* o que saiu da peça sai também do Storage, senão o espaço nunca volta */
  const fotosAgora = [f.mainImage, ...(f.gallery || [])].filter(Boolean);
  const sobrando = fotosAntigas.filter((u) => !fotosAgora.includes(u));
  if (sobrando.length) await removeFiles(sobrando);

  return id;
}

export async function softDeleteProduct(id) {
  const { data: p } = await supabase.from("products")
    .select("main_image_url, product_images(image_url)").eq("id", id).maybeSingle();
  const { error } = await supabase.from("products").update({ deleted: true }).eq("id", id);
  if (error) erro(error);
  const fotos = [p?.main_image_url, ...((p?.product_images || []).map((i) => i.image_url))].filter(Boolean);
  if (fotos.length) await removeFiles(fotos);
}

/* --------------------------------- Arquivos -------------------------------
   O plano gratuito do Supabase guarda 1 GB. Foto de celular tem de 3 a 8 MB,
   então sem tratamento o espaço acabaria em 150 a 300 fotos. Aqui a imagem é
   reduzida no próprio aparelho antes de subir: no máximo 1600 pixels no lado
   maior, bem mais do que o catálogo mostra. Cada foto cai para uns 200 a
   350 KB e o mesmo 1 GB passa a caber alguns milhares, sem diferença na tela.
   -------------------------------------------------------------------------- */
const BUCKET = "danny";
const LADO_MAXIMO = 1600;
const QUALIDADE = 0.82;
const TAMANHO_MAXIMO_MB = 8;
const RAIZ_PUBLICA = `/storage/v1/object/public/${BUCKET}/`;

export function caminhoDoArquivo(url) {
  const u = String(url || "");
  const i = u.indexOf(RAIZ_PUBLICA);
  if (i < 0) return null;
  try { return decodeURIComponent(u.slice(i + RAIZ_PUBLICA.length).split("?")[0]) || null; }
  catch { return u.slice(i + RAIZ_PUBLICA.length).split("?")[0] || null; }
}

/* Apaga de verdade. Sem isso, tirar a foto da tela só apaga o endereço no
   banco e o arquivo fica ocupando espaço para sempre.                       */
export async function removeFiles(urls) {
  const caminhos = (Array.isArray(urls) ? urls : [urls]).map(caminhoDoArquivo).filter(Boolean);
  if (!caminhos.length) return 0;
  const { error } = await supabase.storage.from(BUCKET).remove(caminhos);
  return error ? 0 : caminhos.length;
}

function lerImagem(file) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => lerPorTag(file));
  }
  return lerPorTag(file);
}
function lerPorTag(file) {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error("imagem")); };
    img.src = url;
  });
}
const paraBlob = (canvas, tipo, q) => new Promise((ok) => canvas.toBlob(ok, tipo, q));
async function melhorBlob(canvas, q) {
  const webp = await paraBlob(canvas, "image/webp", q);
  if (webp && webp.type === "image/webp") return webp;
  return await paraBlob(canvas, "image/jpeg", q);
}

export async function encolherImagem(file, lado = LADO_MAXIMO, q = QUALIDADE) {
  try {
    if (!file || !file.type.startsWith("image/")) return file;
    if (file.type === "image/gif") return file;
    const img = await lerImagem(file);
    const l = img.width, a = img.height;
    if (!l || !a) return file;
    const escala = Math.min(1, lado / Math.max(l, a));
    if (escala === 1 && file.size <= 400 * 1024) return file;
    const nl = Math.max(1, Math.round(l * escala));
    const na = Math.max(1, Math.round(a * escala));
    const canvas = document.createElement("canvas");
    canvas.width = nl; canvas.height = na;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, nl, na);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, nl, na);
    if (img.close) img.close();
    const blob = await melhorBlob(canvas, q);
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const base = (file.name || "foto").replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch { return file; }
}

export async function uploadFile(file, pasta = "pecas") {
  const arquivo = await encolherImagem(file);
  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    throw new Error(`Arquivo muito grande (${(arquivo.size / 1024 / 1024).toFixed(1)} MB). O limite é ${TAMANHO_MAXIMO_MB} MB.`);
  }
  const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET)
    .upload(nome, arquivo, { cacheControl: "3600", contentType: arquivo.type || undefined });
  if (error) erro(error);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);
  return data.publicUrl;
}

/* ------------------------------ Espaço usado ------------------------------ */
export async function loadStorageUsage() {
  const { data, error } = await supabase.rpc("get_storage_usage");
  if (error || !data) return null;
  return {
    bytes: Number(data.bytes) || 0,
    arquivos: Number(data.arquivos) || 0,
    porPasta: (data.porPasta || []).map((p) => ({ pasta: p.pasta, bytes: Number(p.bytes) || 0, arquivos: Number(p.arquivos) || 0 })),
  };
}

export async function loadOrphanFiles() {
  const { data, error } = await supabase.rpc("get_orphan_files");
  if (error || !data) return { arquivos: 0, bytes: 0, lista: [] };
  return {
    arquivos: Number(data.arquivos) || 0,
    bytes: Number(data.bytes) || 0,
    lista: (data.lista || []).map((f) => ({ caminho: f.caminho, bytes: Number(f.bytes) || 0 })),
  };
}

export async function removeOrphanFiles(caminhos) {
  const lista = (caminhos || []).filter(Boolean);
  let apagados = 0;
  for (let i = 0; i < lista.length; i += 80) {
    const lote = lista.slice(i, i + 80);
    const { error } = await supabase.storage.from(BUCKET).remove(lote);
    if (error) { if (apagados === 0) erro(error); break; }
    apagados += lote.length;
  }
  return apagados;
}

/* ---------------------------- Acessos ao catálogo -------------------------
   Guarda só um código sorteado que fica no navegador de quem visita, para
   saber se é a mesma pessoa voltando. Nada que identifique alguém.          */
const CHAVE_VISITANTE = "dn_visitante";

export async function logCatalogVisit() {
  try {
    let id = localStorage.getItem(CHAVE_VISITANTE);
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
      localStorage.setItem(CHAVE_VISITANTE, id);
    }
    await supabase.rpc("log_catalog_visit", { p_visitor: id });
  } catch { /* contagem nunca pode atrapalhar quem está comprando */ }
}

export async function loadCatalogStats() {
  const { data, error } = await supabase.rpc("get_catalog_stats");
  if (error || !data) return null;
  const n = (v) => Number(v) || 0;
  return {
    hojeAcessos: n(data.hojeAcessos), hojePessoas: n(data.hojePessoas),
    seteAcessos: n(data.seteAcessos), setePessoas: n(data.setePessoas),
    trintaAcessos: n(data.trintaAcessos), trintaPessoas: n(data.trintaPessoas),
    totalAcessos: n(data.totalAcessos), totalPessoas: n(data.totalPessoas),
    porDia: (data.porDia || []).map((d) => ({ dia: d.dia, acessos: n(d.acessos), pessoas: n(d.pessoas) })),
  };
}

/* ------------------------- Entrada, saída e venda ------------------------- */
export async function applyMovement(m) {
  const { error } = await supabase.rpc("apply_movement", {
    p_variation: m.variationId, p_type: m.type, p_qty: Number(m.quantity),
    p_reason: m.reason || "Ajuste", p_customer: m.customerId || null,
    p_price: Number(m.unitPrice) || 0, p_cost: Number(m.unitCost) || 0,
  });
  if (error) erro(error);
}

export async function reverseMovement(id) {
  const { error } = await supabase.rpc("reverse_movement", { p_mov: id });
  if (error) erro(error);
}

export async function loadMovements({ de, ate, tipo, limite = 400 } = {}) {
  let q = supabase.from("stock_movements")
    .select("*, products(name, sku), customers(name), product_variations(plating_id, size_id)")
    .order("created_at", { ascending: false }).limit(limite);
  if (de) q = q.gte("created_at", de);
  if (ate) q = q.lte("created_at", ate);
  if (tipo) q = q.eq("type", tipo);
  const { data, error } = await q;
  if (error) erro(error);
  return (data || []).map((m) => ({
    id: m.id, productId: m.product_id, productName: m.products?.name || "(peça removida)",
    sku: m.products?.sku || "", customerId: m.customer_id, customerName: m.customers?.name || "",
    platingId: m.product_variations?.plating_id, sizeId: m.product_variations?.size_id,
    type: m.type, quantity: m.quantity, reason: m.reason,
    unitPrice: Number(m.unit_price) || 0, unitCost: Number(m.unit_cost) || 0,
    total: (Number(m.unit_price) || 0) * m.quantity,
    reversed: !!m.reversed, userName: m.user_name, createdAt: m.created_at,
  }));
}

/* -------------------------------- Comissão -------------------------------- */
/* Um lançamento por mês. O acumulado é somado na tela. */
export async function loadCommissions() {
  const { data, error } = await supabase.from("commissions").select("*").order("ref_month", { ascending: false });
  if (error) erro(error);
  return (data || []).map((c) => ({
    id: c.id, month: c.ref_month, value: Number(c.gross_value) || 0,
    percent: c.percent == null ? null : Number(c.percent),
    salesBase: c.sales_base == null ? null : Number(c.sales_base),
    note: c.note || "",
  }));
}

export async function saveCommission(c) {
  const base = {
    ref_month: c.month, gross_value: Number(c.value) || 0,
    percent: c.percent === "" || c.percent == null ? null : Number(c.percent),
    sales_base: c.salesBase === "" || c.salesBase == null ? null : Number(c.salesBase),
    note: c.note || null,
  };
  if (c.id) {
    const { error } = await supabase.from("commissions").update(base).eq("id", c.id);
    if (error) erro(error);
    return c.id;
  }
  const { data, error } = await supabase.from("commissions")
    .upsert(base, { onConflict: "ref_month" }).select().single();
  if (error) erro(error);
  return data.id;
}

export async function removeCommission(id) {
  const { error } = await supabase.from("commissions").delete().eq("id", id);
  if (error) erro(error);
}

/* ------------------------ Catálogo público (sem login) -------------------- */
export async function loadCatalog() {
  const [cat, loja] = await Promise.all([supabase.rpc("get_catalog"), supabase.rpc("get_store")]);
  if (cat.error) erro(cat.error);
  const pecas = (cat.data || []).map((p) => {
    const vars = (p.variations || []).map((v) => ({
      platingId: v.platingId, plating: v.plating, hex: v.hex,
      sizeId: v.sizeId, size: v.size, quantity: Number(v.quantity) || 0,
    }));
    return {
      id: p.id, name: p.name, sku: p.sku, description: p.description,
      price: Number(p.price) || 0, karat: p.karat, warranty: Number(p.warranty) || 0,
      category: p.category || "Outros",
      photos: [p.mainImage, ...(p.images || [])].filter(Boolean),
      variations: vars,
      platings: [...new Map(vars.filter((v) => v.plating).map((v) => [v.platingId, { id: v.platingId, name: v.plating, hex: v.hex }])).values()],
      sizes: [...new Map(vars.filter((v) => v.size).map((v) => [v.sizeId, { id: v.sizeId, name: v.size }])).values()],
      temEstoque: (pl, sz) => vars.some((v) => v.platingId === pl && v.sizeId === sz && v.quantity > 0),
      banhoTem: (pl) => vars.some((v) => v.platingId === pl && v.quantity > 0),
      algumDisponivel: vars.some((v) => v.quantity > 0),
    };
  });
  return { pecas, loja: loja.data || {} };
}
