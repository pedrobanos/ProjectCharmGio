import React, { useState, useEffect } from "react";
import { BANCOS, MARCAS_MOVIL, OPERADORAS, PLATAFORMAS } from "../Constants";

const VALORES_INICIALES = {
  mail: "",
  username: "",
  password: "",
  phone_number: "",
  associated_number: "",
  pin: "",
  puk: "",
  phone_marca: "",
  phone_modelo: "",
  sim_brand: "Simyo",
  is_esim: "",
  platform_app: "Vinted",
  is_pro: "",
  created_at: "",
  blocked_at: "",
  bank_name: "",
  iban: "",
};

// Convierte una cuenta guardada en los valores del formulario (para editar)
const formFromAccount = (a) => {
  const movil = (a.phone_brand || "").trim();
  const marca = MARCAS_MOVIL.find((m) => movil.toLowerCase().startsWith(m.toLowerCase()));
  return {
    ...VALORES_INICIALES,
    ...Object.fromEntries(
      Object.keys(VALORES_INICIALES).map((k) => [k, a[k] == null ? "" : String(a[k])])
    ),
    phone_marca: marca || movil,
    phone_modelo: marca ? movil.slice(marca.length).trim() : "",
    is_esim: a.is_esim === true ? "yes" : a.is_esim === false ? "no" : "",
    is_pro: a.is_pro === true ? "yes" : a.is_pro === false ? "no" : "",
    created_at: a.created_at ? String(a.created_at).slice(0, 10) : "",
  };
};

const labelBase =
  "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500";
const inputBase =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20";

const Label = ({ icon, children }) => (
  <span className={labelBase}>
    {icon && <i className={`${icon} w-3.5 text-center text-gray-400`}></i>}
    {children}
  </span>
);

const Section = ({ icon, title }) => (
  <h3 className="sm:col-span-2 flex items-center gap-2 text-sm font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mt-2 first:mt-0">
    <i className={`${icon} text-purple-600`}></i>
    {title}
  </h3>
);

/* Select con opción "Otro…" que despliega un input libre */
const SelectConOtro = ({ label, icon, value, options, onChange, placeholder, className = "" }) => {
  const esOtro = value !== "" && !options.includes(value);
  const [modoLibre, setModoLibre] = useState(esOtro);

  useEffect(() => {
    if (value === "") setModoLibre(false);
    else if (!options.includes(value)) setModoLibre(true);
  }, [value, options]);

  return (
    <label className={`block ${className}`}>
      <Label icon={icon}>{label}</Label>
      {modoLibre ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
            placeholder={placeholder}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setModoLibre(false);
              onChange("");
            }}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            title="Volver a la lista"
          >
            <i className="fa-solid fa-list"></i>
          </button>
        </div>
      ) : (
        <select
          value={options.includes(value) ? value : ""}
          onChange={(e) => {
            if (e.target.value === "__otro__") {
              setModoLibre(true);
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          className={inputBase}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__otro__">Otro…</option>
        </select>
      )}
    </label>
  );
};

/**
 * Modal para añadir una cuenta o, si recibe `account`, editarla.
 *  - Añadir: <AccountModal isOpen onClose onCreate />
 *  - Editar: <AccountModal isOpen onClose account={cuenta} onSave />
 */
const AccountModal = ({ isOpen, onClose, onCreate, account = null, onSave }) => {
  const isEdit = Boolean(account);
  const [form, setForm] = useState(VALORES_INICIALES);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(account ? formFromAccount(account) : VALORES_INICIALES);
      setShowPass(false);
      setError("");
    }
  }, [isOpen, account]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Marca + modelo se guardan juntos en phone_brand
  const movilFinal = [form.phone_marca.trim(), form.phone_modelo.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.mail.trim() && !form.username.trim() && !form.phone_number.trim()) {
      setError("Rellena al menos el mail, el usuario o el teléfono.");
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { phone_marca, phone_modelo, ...resto } = form;

    const payload = Object.fromEntries(
      Object.entries(resto).map(([key, value]) => {
        if (key === "is_esim" || key === "is_pro") {
          return [key, value === "yes" ? true : value === "no" ? false : null];
        }
        const v = typeof value === "string" ? value.trim() : value;
        return [key, v === "" ? null : v];
      })
    );

    payload.phone_brand = movilFinal || null;
    // "PRO" solo se envía si se ha elegido (así no falla si aún no existe la columna)
    if (form.is_pro === "") delete payload.is_pro;

    setSaving(true);
    try {
      if (isEdit) await onSave(payload);
      else await onCreate(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || (isEdit ? "No se pudo guardar la cuenta." : "No se pudo crear la cuenta."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center text-base">
              <i className={isEdit ? "fa-solid fa-pen-to-square" : "fa-solid fa-user-plus"}></i>
            </span>
            {isEdit ? "Editar cuenta" : "Añadir cuenta"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            title="Cerrar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5" noValidate>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Section icon="fa-solid fa-key" title="Acceso" />

            <label className="block sm:col-span-2">
              <Label icon="fa-solid fa-envelope">Mail</Label>
              <input
                type="email"
                value={form.mail}
                onChange={set("mail")}
                className={inputBase}
                placeholder="cuenta@outlook.com"
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-at">Usuario</Label>
              <input
                type="text"
                value={form.username}
                onChange={set("username")}
                className={inputBase}
                placeholder="lunavelvetshop"
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-lock">Password</Label>
              <div className="flex items-center gap-2">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  className={inputBase}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((s) => !s)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                  title={showPass ? "Ocultar" : "Mostrar"}
                >
                  <i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                </button>
              </div>
            </label>

            <Section icon="fa-solid fa-mobile-screen-button" title="Teléfono y SIM" />

            <label className="block">
              <Label icon="fa-solid fa-phone">Teléfono</Label>
              <input
                type="text"
                inputMode="tel"
                value={form.phone_number}
                onChange={set("phone_number")}
                className={inputBase}
                placeholder="684738358"
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-user">Asociado a</Label>
              <input
                type="text"
                value={form.associated_number}
                onChange={set("associated_number")}
                className={inputBase}
                placeholder="Iphone 17 pro max Pedro"
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-hashtag">PIN</Label>
              <input
                type="text"
                inputMode="numeric"
                value={form.pin}
                onChange={set("pin")}
                className={inputBase}
                placeholder="0671"
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-unlock-keyhole">PUK</Label>
              <input
                type="text"
                inputMode="numeric"
                value={form.puk}
                onChange={set("puk")}
                className={inputBase}
                placeholder="53492363"
              />
            </label>

            {/* ── Móvil: marca (select) + modelo (input libre) ── */}
            <SelectConOtro
              label="Marca del móvil"
              icon="fa-solid fa-mobile-screen"
              value={form.phone_marca}
              options={MARCAS_MOVIL}
              onChange={setValue("phone_marca")}
              placeholder="Tablet Gio"
            />

            <label className="block">
              <Label icon="fa-solid fa-tag">Modelo</Label>
              <input
                type="text"
                value={form.phone_modelo}
                onChange={set("phone_modelo")}
                disabled={!form.phone_marca}
                className={`${inputBase} disabled:cursor-not-allowed disabled:bg-gray-50`}
                placeholder="17 Pro Max (Gio)"
              />
              <span className="mt-1 block text-xs text-gray-400">
                {form.phone_marca
                  ? `Se guardará como "${movilFinal || form.phone_marca}"`
                  : "Selecciona antes una marca."}
              </span>
            </label>

            <SelectConOtro
              label="SIM"
              icon="fa-solid fa-sim-card"
              value={form.sim_brand}
              options={OPERADORAS}
              onChange={setValue("sim_brand")}
              placeholder="Otra operadora"
            />

            <label className="block">
              <Label icon="fa-solid fa-microchip">eSIM</Label>
              <select value={form.is_esim} onChange={set("is_esim")} className={inputBase}>
                <option value="">—</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </select>
            </label>

            <Section icon="fa-solid fa-store" title="Plataforma" />

            <SelectConOtro
              label="Plataforma"
              icon="fa-solid fa-shop"
              value={form.platform_app}
              options={PLATAFORMAS}
              onChange={setValue("platform_app")}
              placeholder="Otra plataforma"
            />

            <div className="block">
              <Label icon="fa-solid fa-crown">Cuenta PRO</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["no", "Normal", "fa-solid fa-user"],
                  ["yes", "PRO", "fa-solid fa-crown"],
                ].map(([v, txt, ic]) => {
                  const active = form.is_pro === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue("is_pro")(active ? "" : v)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? v === "yes"
                            ? "border-amber-400 bg-amber-50 text-amber-700"
                            : "border-gray-400 bg-gray-50 text-gray-800"
                          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <i className={ic}></i>
                      {txt}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <Label icon="fa-solid fa-calendar-plus">Creada</Label>
              <input
                type="date"
                value={form.created_at}
                onChange={set("created_at")}
                className={inputBase}
              />
            </label>

            <label className="block">
              <Label icon="fa-solid fa-ban">Bloqueada</Label>
              <input
                type="text"
                value={form.blocked_at}
                onChange={set("blocked_at")}
                className={inputBase}
                placeholder="Déjalo vacío si la cuenta está activa"
              />
            </label>

            <Section icon="fa-solid fa-building-columns" title="Banco" />

            <SelectConOtro
              label="Banco"
              icon="fa-solid fa-landmark"
              value={form.bank_name}
              options={BANCOS}
              onChange={setValue("bank_name")}
              placeholder="Otro banco"
            />

            <label className="block">
              <Label icon="fa-solid fa-credit-card">IBAN</Label>
              <input
                type="text"
                value={form.iban}
                onChange={set("iban")}
                className={inputBase}
                placeholder="ES00 0000 0000 0000 0000 0000"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-xmark"></i>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-700 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"}></i>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Añadir cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
