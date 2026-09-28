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
  return id;
}

export async function softDeleteProduct(id) {
  const { error } = await supabase.from("products").update({ deleted: true }).eq("id", id);
  if (error) erro(error);
}

export async function uploadFile(file, pasta = "pecas") {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("danny").upload(nome, file, { cacheControl: "3600" });
  if (error) erro(error);
  const { data } = supabase.storage.from("danny").getPublicUrl(nome);
  return data.publicUrl;
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
