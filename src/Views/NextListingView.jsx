import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import ListingCopyFields from "../components/ListingCopyFields";
import PlatformIcon, { AccountBadge } from "../components/PlatformIcon";
import { PLATFORM_STYLES, TEMATICAS, textHasWord } from "../utils/listingUtils";
import { LugaresDisponibles, normalizeString } from "../Constants";
import {
  accountLabel,
  createListing,
  getListingAccounts,
  getPendingProductsForAccount,
} from "../services/listingsServices";

const PLATFORM_URLS = {
  Vinted: "https://www.vinted.es",
  Wallapop: "https://es.wallapop.com",
};

const SKIP_KEY = "anuncios_saltados";

const readSkipped = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SKIP_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeSkipped = (ids) => {
  try {
    sessionStorage.setItem(SKIP_KEY, JSON.stringify(ids));
  } catch {
    // sin sessionStorage: no pasa nada
  }
};

// Cuenta elegida a mano: se recuerda en este móvil/tablet/ordenador
const ACCOUNT_KEY = "anuncios_cuenta";
const readSavedAccount = () => {
  try {
    return localStorage.getItem(ACCOUNT_KEY) || "";
  } catch {
    return "";
  }
};
const saveAccount = (id) => {
  try {
    if (id) localStorage.setItem(ACCOUNT_KEY, String(id));
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // sin localStorage: habrá que elegirla cada vez
  }
};

// Lugar "base" (sin la posición): "Caja Beige 3" → "Caja Beige"
const LUGARES_NORM = LugaresDisponibles.map((l) => [l, normalizeString(l).trim()]).sort(
  (a, b) => b[1].length - a[1].length
);
const lugarBaseOf = (lugar) => {
  const raw = String(lugar || "").trim();
  if (!raw) return "Sin lugar";
  const n = normalizeString(raw);
  const known = LUGARES_NORM.find(([, ln]) => n.startsWith(ln));
  if (known) return known[0];
  const parts = raw.split(/\s+/);
  if (parts.length > 1 && parts[parts.length - 1].length <= 3) parts.pop();
  return parts.join(" ");
};

// Texto de las temáticas: nombre y descripción (el lugar tiene su propio filtro)
const temaTextOf = (p) => normalizeString([p.nombre, p.descripcion].filter(Boolean).join(" "));
const matchesTema = (p, t) => {
  const text = temaTextOf(p);
  return t.words.some((w) => textHasWord(text, normalizeString(w)));
};

/**
 * /anuncios            → usa la última cuenta elegida a mano en este dispositivo
 * /anuncios?cuenta=ID   → productos pendientes de publicar en esa cuenta (y la recuerda)
 * Filtros opcionales en la URL: q (texto), lugar, tema, prov
 * Pensada para abrirla desde un atajo de iPhone.
 */
const NextListingView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // "auto" se trata igual que sin cuenta (por si el atajo antiguo lo lleva)
  const rawCuenta = searchParams.get("cuenta") || "";
  const cuentaParam = rawCuenta && rawCuenta !== "auto" ? rawCuenta : "";
  const q = searchParams.get("q") || "";
  const lugar = searchParams.get("lugar") || "";
  const tema = searchParams.get("tema") || "";
  const prov = searchParams.get("prov") || "";
  const est = searchParams.get("est") || ""; // "nuevo" (en ninguna cuenta) | "otra" (ya en otra cuenta)

  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [pending, setPending] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // último publicado
  const [showFilters, setShowFilters] = useState(() => Boolean(q || lugar || tema || prov || est));

  // Cambia un parámetro de la URL sin perder los demás
  const setParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const loadPending = useCallback(async (acc) => {
    if (!acc) {
      setPending([]);
      return;
    }
    setPending(await getPendingProductsForAccount(acc.id, readSkipped()));
  }, []);

  // Carga cuentas + cuenta elegida + productos pendientes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const accs = accounts.length ? accounts : await getListingAccounts();
        if (cancelled) return;
        if (!accounts.length) setAccounts(accs);

        const wantedId = cuentaParam || readSavedAccount();
        const acc = accs.find((a) => String(a.id) === String(wantedId)) || null;
        if (acc) saveAccount(acc.id);
        if (cancelled) return;
        setAccount(acc);
        setSelectedId(null);
        await loadPending(acc);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || "Error cargando anuncios.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaParam, loadPending]);

  // Texto en el que busca el buscador: TODOS los campos del producto
  // (nombre, descripción, lugar, proveedor, código, precio, stock, id y cuentas donde ya está)
  const haystackOf = useCallback(
    (p) => {
      const cuentas = (p.listedAccountIds || [])
        .map((id) => accounts.find((a) => String(a.id) === String(id)))
        .filter(Boolean)
        .map((a) => `${a.username || ""} ${a.mail || ""} ${a.platform || ""}`);
      const precio = p.precio != null ? `${p.precio} ${String(p.precio).replace(".", ",")}` : "";
      return normalizeString(
        [
          p.nombre,
          p.descripcion,
          p.lugar,
          lugarBaseOf(p.lugar),
          p.proveedor,
          p.codigoProveedor,
          precio,
          p.cantidad != null ? `${p.cantidad} uds unidades` : "",
          `#${p.id} ${p.id}`,
          ...cuentas,
        ]
          .filter(Boolean)
          .join(" ")
      );
    },
    [accounts]
  );

  // Filtros sacados de los productos pendientes reales, con cuántos hay de cada
  const lugaresOpts = useMemo(() => {
    const m = new Map();
    for (const p of pending) {
      const b = lugarBaseOf(p.lugar);
      m.set(b, (m.get(b) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [pending]);

  const temaCounts = useMemo(() => {
    const c = {};
    for (const t of TEMATICAS) c[t.key] = pending.filter((p) => matchesTema(p, t)).length;
    return c;
  }, [pending]);

  const proveedores = useMemo(() => {
    const m = new Map();
    for (const p of pending) {
      const pr = p.proveedor?.trim();
      if (pr) m.set(pr, (m.get(pr) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [pending]);

  const estadoCounts = useMemo(
    () => ({
      nuevo: pending.filter((p) => !(p.listedAccountIds || []).length).length,
      otra: pending.filter((p) => (p.listedAccountIds || []).length > 0).length,
    }),
    [pending]
  );

  // Aplicar buscador y filtros
  const filtered = useMemo(() => {
    const terms = normalizeString(q).split(/\s+/).filter(Boolean);
    const temaDef = TEMATICAS.find((t) => t.key === tema);
    return pending.filter((p) => {
      if (terms.length) {
        const hay = haystackOf(p);
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      if (lugar && lugarBaseOf(p.lugar) !== lugar) return false;
      if (temaDef && !matchesTema(p, temaDef)) return false;
      if (prov && (p.proveedor?.trim() || "") !== prov) return false;
      if (est === "nuevo" && (p.listedAccountIds || []).length) return false;
      if (est === "otra" && !(p.listedAccountIds || []).length) return false;
      return true;
    });
  }, [pending, q, lugar, tema, prov, est, haystackOf]);

  const product =
    filtered.find((p) => String(p.id) === String(selectedId)) || filtered[0] || null;
  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;
  const activeFilters = [q, lugar, tema, prov, est].filter(Boolean).length;

  const refresh = async () => {
    setLoading(true);
    try {
      await loadPending(account);
    } finally {
      setLoading(false);
    }
  };

  const handlePublished = async () => {
    if (!account || !product) return;
    setSaving(true);
    setError("");
    try {
      await createListing(product.id, account.id);
      setDone({ product, account });
      setSelectedId(null);
      await loadPending(account);
      if (isMobile()) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!product) return;
    writeSkipped([...readSkipped(), product.id]);
    setDone(null);
    setSelectedId(null);
    await refresh();
  };

  const resetSkipped = async () => {
    writeSkipped([]);
    await refresh();
  };

  const changeAccount = (value) => {
    writeSkipped([]);
    setDone(null);
    saveAccount(value);
    setParam("cuenta", value);
  };

  const clearFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["q", "lugar", "tema", "prov", "est"].forEach((k) => next.delete(k));
        return next;
      },
      { replace: true }
    );
  };

  const listedAccounts = (p) =>
    (p?.listedAccountIds || [])
      .map((id) => accounts.find((a) => String(a.id) === String(id)))
      .filter(Boolean);

  const color = PLATFORM_STYLES[account?.platform]?.bg || "#374151";
  const selectClass = "border border-gray-300 rounded-md p-2 w-full text-base bg-white";

  // ── Bloques de la pantalla ──────────────────────────────────────────

  const accountBlock = (
    <section>
      <label className="block text-sm font-semibold text-gray-700 mb-1">Cuenta</label>
      <select
        value={account ? String(account.id) : ""}
        onChange={(e) => changeAccount(e.target.value)}
        className={`${selectClass} mb-2 ${!account && !loading ? "border-amber-400 ring-2 ring-amber-200" : ""}`}
      >
        <option value="" disabled>
          Elige la cuenta...
        </option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.platform} · {accountLabel(a)}
          </option>
        ))}
      </select>
      {account && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <AccountBadge account={account} size={18} className="text-sm" />
          <a
            href={PLATFORM_URLS[account.platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline whitespace-nowrap"
            style={{ color }}
          >
            Abrir {account.platform} ↗
          </a>
        </div>
      )}
    </section>
  );

  const searchBlock = (
    <section>
      <div className="relative mb-2">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="search"
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Buscar en todo: nombre, código, precio, lugar…"
          className="border border-gray-300 rounded-md py-2 pl-9 pr-3 w-full text-base bg-white"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          {/* En móvil los filtros se pliegan; en tablet/escritorio siempre a la vista */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="md:hidden text-sm font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-sliders"></i>
            Filtros{activeFilters ? ` (${activeFilters})` : ""}
            <i className={`fa-solid fa-chevron-${showFilters ? "up" : "down"} text-xs`}></i>
          </button>
          <p className="hidden md:flex text-sm font-semibold text-gray-700 items-center gap-1.5">
            <i className="fa-solid fa-sliders"></i>
            Filtros{activeFilters ? ` (${activeFilters})` : ""}
          </p>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-blue-600 underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div
          className={`${
            showFilters ? "flex" : "hidden"
          } md:flex mt-2 flex-col gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3`}
        >
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-circle-half-stroke mr-1.5 text-gray-400"></i>Estado
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["", "Todos", pending.length],
                ["nuevo", "Sin anunciar", estadoCounts.nuevo],
                ["otra", "Ya en otra cuenta", estadoCounts.otra],
              ].map(([v, label, n]) => (
                <button
                  key={v || "todos"}
                  type="button"
                  onClick={() => setParam("est", v)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    est === v
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {label} <span className="opacity-60">({n})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-location-dot mr-1.5 text-gray-400"></i>Lugar
            </label>
            <select value={lugar} onChange={(e) => setParam("lugar", e.target.value)} className={selectClass}>
              <option value="">Todos ({pending.length})</option>
              {lugaresOpts.map(([l, n]) => (
                <option key={l} value={l}>
                  {l} ({n})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <i className="fa-solid fa-tags mr-1.5 text-gray-400"></i>Temática
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TEMATICAS.map((t) => {
                const active = tema === t.key;
                const n = temaCounts[t.key] || 0;
                if (!n && !active) return null; // solo las que tienen productos
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setParam("tema", active ? "" : t.key)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      active
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {t.label} <span className="opacity-60">({n})</span>
                  </button>
                );
              })}
              {TEMATICAS.every((t) => !temaCounts[t.key]) && (
                <span className="text-xs text-gray-400">Ninguna temática encontrada en los pendientes.</span>
              )}
            </div>
          </div>

          {proveedores.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                <i className="fa-solid fa-truck mr-1.5 text-gray-400"></i>Proveedor
              </label>
              <select value={prov} onChange={(e) => setParam("prov", e.target.value)} className={selectClass}>
                <option value="">Todos ({pending.length})</option>
                {proveedores.map(([p, n]) => (
                  <option key={p} value={p}>
                    {p} ({n})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const emptyBlock = (
    <div className="text-center text-gray-600 mt-6 md:mt-0 md:bg-white md:rounded-xl md:shadow md:p-10 lg:shadow-none lg:p-6">
      {!account ? (
        accounts.length ? (
          <p className="text-lg">👆 Elige arriba la cuenta en la que vas a publicar.</p>
        ) : (
          <p>No hay cuentas de Vinted o Wallapop activas. Revisa la sección Cuentas.</p>
        )
      ) : pending.length > 0 && activeFilters > 0 ? (
        <p className="text-lg mb-2">No hay pendientes con estos filtros.</p>
      ) : (
        <p className="text-lg mb-2">🎉 No quedan productos pendientes para esta cuenta.</p>
      )}
      {account && readSkipped().length > 0 && (
        <button
          type="button"
          onClick={resetSkipped}
          className="text-sm underline text-blue-600 cursor-pointer"
        >
          Volver a mostrar los que he saltado
        </button>
      )}
    </div>
  );

  const detailBlock = product && (
    <div className="bg-white rounded-xl shadow p-4 md:p-5 lg:shadow-none lg:p-0 lg:rounded-none">
      <div className="flex items-center gap-3 md:gap-4 mb-4">
        {product.foto && (
          <img
            src={product.foto}
            alt={`Foto de ${product.nombre}`}
            className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-md border border-gray-200 flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 md:text-lg">{product.nombre}</p>
          <p className="text-xs md:text-sm text-gray-500">
            Stock: {product.cantidad} · Anunciado en {listedAccounts(product).length}/{product.cantidad}
          </p>
          {product.lugar && <p className="text-xs md:text-sm text-gray-500">📍 {product.lugar}</p>}
          {product.proveedor && (
            <p className="hidden md:block text-sm text-gray-500">
              🏷️ {product.proveedor}
              {product.codigoProveedor ? ` · ${product.codigoProveedor}` : ""}
            </p>
          )}
        </div>
      </div>

      {listedAccounts(product).length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-1">Ya anunciado en</p>
          <div className="flex flex-wrap gap-1.5">
            {listedAccounts(product).map((a) => (
              <AccountBadge key={a.id} account={a} size={16} />
            ))}
          </div>
        </div>
      )}

      <ListingCopyFields product={product} />

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="flex-1 px-3 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
        >
          Saltar
        </button>
        <button
          type="button"
          onClick={handlePublished}
          disabled={saving}
          className="flex-[2] flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          <PlatformIcon platform={account.platform} size={18} />
          {saving ? "Guardando..." : "Ya lo he publicado"}
        </button>
      </div>
    </div>
  );

  const listBlock = product && filtered.length > 0 && (
    <section className={`${filtered.length === 1 ? "hidden md:block" : ""} lg:h-full lg:flex lg:flex-col`}>
      <p className="text-sm font-semibold text-gray-700 mb-2">
        <span className="md:hidden">Otros pendientes</span>
        <span className="hidden md:inline">
          Pendientes ({filtered.length}
          {activeFilters ? ` de ${pending.length}` : ""})
        </span>
      </p>
      <ul className="flex flex-col divide-y divide-gray-200 bg-white rounded-xl shadow overflow-hidden md:overflow-y-auto md:max-h-[60vh] lg:max-h-none lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:shadow-none lg:rounded-lg lg:border lg:border-gray-200">
        {filtered.map((p) => {
          const isSelected = p === product;
          return (
            // En móvil el seleccionado ya se ve arriba, así que no se repite en la lista
            <li key={p.id} className={isSelected ? "hidden md:block" : ""}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setDone(null);
                  if (isMobile()) window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 md:py-2.5 text-left cursor-pointer border-l-4 ${
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50 border-transparent"
                }`}
                style={isSelected ? { borderLeftColor: color } : undefined}
              >
                {p.foto ? (
                  <img
                    src={p.foto}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-gray-200 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${isSelected ? "font-semibold text-gray-900" : "text-gray-800"}`}>
                    {p.nombre}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {p.lugar || "Sin lugar"} · Stock {p.cantidad}
                  </p>
                  {listedAccounts(p).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {listedAccounts(p).map((a) => (
                        <AccountBadge key={a.id} account={a} size={14} />
                      ))}
                    </div>
                  )}
                </div>
                <span className="md:hidden">
                  <i className="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  // ── Layout ─────────────────────────────────────────────────────────
  // Móvil: todo en una columna (cuenta → filtros → producto → lista)
  // Tablet (md): 2 columnas → izquierda cuenta, filtros y lista · derecha producto fijo
  // Escritorio (lg): 3 columnas → cuenta y filtros · lista · producto fijo

  return (
    <div className="w-full max-w-lg md:max-w-5xl lg:max-w-7xl mx-auto mt-12 mb-10 px-1">
      <PageHeader
        icon="fa-solid fa-bullhorn"
        tone="teal"
        title="Siguiente anuncio"
        extra={
          <span className="inline-flex items-center gap-1">
            <PlatformIcon platform="Vinted" size={24} />
            <PlatformIcon platform="Wallapop" size={24} />
          </span>
        }
        subtitle="Copia los datos, publícalo en la app y márcalo como publicado"
        className="mt-0"
      />

      <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:items-start">
        {/* Columna de controles */}
        <div className="md:col-start-1 md:row-start-1 lg:row-span-2 lg:bg-white lg:rounded-xl lg:shadow lg:p-4 lg:h-[calc(100vh-11rem)] lg:min-h-[560px] lg:overflow-y-auto">
          {accountBlock}
          {searchBlock}
        </div>

        {/* Producto seleccionado */}
        <div className="md:col-start-2 md:row-start-1 md:row-span-2 lg:col-start-3 mb-5 md:mb-0 lg:bg-white lg:rounded-xl lg:shadow lg:p-4 lg:h-[calc(100vh-11rem)] lg:min-h-[560px] lg:overflow-y-auto">
          {done && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-300 px-3 py-2 text-sm text-green-800">
              ✅ "{done.product.nombre}" marcado como publicado en {accountLabel(done.account)}.
            </div>
          )}
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading ? <Loading /> : product ? detailBlock : emptyBlock}
          {!loading && product && (
            <p className="text-xs text-gray-500 mt-2 md:hidden">
              {filtered.length} pendiente(s){activeFilters ? ` con filtros (de ${pending.length})` : ""} en
              esta cuenta
            </p>
          )}
        </div>

        {/* Lista de pendientes */}
        <div className="md:col-start-1 md:row-start-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:bg-white lg:rounded-xl lg:shadow lg:p-4 lg:h-[calc(100vh-11rem)] lg:min-h-[560px] lg:overflow-hidden">
          {!loading && listBlock}
        </div>
      </div>
    </div>
  );
};

export default NextListingView;
