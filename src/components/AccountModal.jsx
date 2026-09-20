

// import React, { useState, useEffect } from "react";
import { BANCOS, MARCAS_MOVIL, OPERADORAS, PLATAFORMAS } from "../Constants";

// /* ─────────────── Listas de los selectores ─────────────── */


// const VALORES_INICIALES = {
//   mail: "",
//   username: "",
//   password: "",
//   phone_number: "",
//   associated_number: "",
//   pin: "",
//   puk: "",
//   phone_brand: "",
//   sim_brand: "Simyo",
//   is_esim: "",
//   platform_app: "Vinted",
//   created_at: "",
//   blocked_at: "",
//   bank_name: "",
//   iban: "",
// };

// const labelBase = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500";
// const inputBase =
//   "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

// /* Select con opción "Otro…" que despliega un input libre */
// const SelectConOtro = ({ label, value, options, onChange, placeholder }) => {
//   const esOtro = value !== "" && !options.includes(value);
//   const [modoLibre, setModoLibre] = useState(esOtro);

//   useEffect(() => {
//     if (value === "") setModoLibre(false);
//   }, [value]);

//   return (
//     <label className="block">
//       <span className={labelBase}>{label}</span>
//       {modoLibre ? (
//         <div className="flex items-center gap-2">
//           <input
//             type="text"
//             autoFocus
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             className={inputBase}
//             placeholder={placeholder}
//           />
//           <button
//             type="button"
//             tabIndex={-1}
//             onClick={() => {
//               setModoLibre(false);
//               onChange("");
//             }}
//             className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
//             title="Volver a la lista"
//           >
//             <i className="fa-solid fa-list"></i>
//           </button>
//         </div>
//       ) : (
//         <select
//           value={options.includes(value) ? value : ""}
//           onChange={(e) => {
//             if (e.target.value === "__otro__") {
//               setModoLibre(true);
//               onChange("");
//             } else {
//               onChange(e.target.value);
//             }
//           }}
//           className={inputBase}
//         >
//           <option value="">—</option>
//           {options.map((opt) => (
//             <option key={opt} value={opt}>
//               {opt}
//             </option>
//           ))}
//           <option value="__otro__">Otro…</option>
//         </select>
//       )}
//     </label>
//   );
// };

// const AddAccountModal = ({ isOpen, onClose, onCreate }) => {
//   const [form, setForm] = useState(VALORES_INICIALES);
//   const [showPass, setShowPass] = useState(false);
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setForm(VALORES_INICIALES);
//       setShowPass(false);
//       setError("");
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const onKeyDown = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
//   const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!form.mail.trim() && !form.username.trim() && !form.phone_number.trim()) {
//       setError("Rellena al menos el mail, el usuario o el teléfono.");
//       return;
//     }

//     const payload = Object.fromEntries(
//       Object.entries(form).map(([key, value]) => {
//         if (key === "is_esim") {
//           return [key, value === "yes" ? true : value === "no" ? false : null];
//         }
//         const v = typeof value === "string" ? value.trim() : value;
//         return [key, v === "" ? null : v];
//       })
//     );

//     setSaving(true);
//     try {
//       await onCreate(payload);
//       onClose();
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "No se pudo crear la cuenta.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
//       <div className="absolute inset-0" onClick={onClose} />

//       <div className="relative bg-white rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
//         <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
//           <h2 className="text-xl font-bold text-gray-900">Añadir cuenta</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-700 cursor-pointer"
//             title="Cerrar"
//           >
//             <i className="fa-solid fa-xmark text-lg"></i>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5" noValidate>
//           {error && (
//             <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           <div className="grid gap-4 sm:grid-cols-2">
//             <label className="block sm:col-span-2">
//               <span className={labelBase}>Mail</span>
//               <input
//                 type="email"
//                 value={form.mail}
//                 onChange={set("mail")}
//                 className={inputBase}
//                 placeholder="cuenta@outlook.com"
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>Usuario</span>
//               <input
//                 type="text"
//                 value={form.username}
//                 onChange={set("username")}
//                 className={inputBase}
//                 placeholder="lunavelvetshop"
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>Password</span>
//               <div className="flex items-center gap-2">
//                 <input
//                   type={showPass ? "text" : "password"}
//                   value={form.password}
//                   onChange={set("password")}
//                   className={inputBase}
//                 />
//                 <button
//                   type="button"
//                   tabIndex={-1}
//                   onClick={() => setShowPass((s) => !s)}
//                   className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
//                 >
//                   <i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
//                 </button>
//               </div>
//             </label>

//             <label className="block">
//               <span className={labelBase}>Teléfono</span>
//               <input
//                 type="text"
//                 value={form.phone_number}
//                 onChange={set("phone_number")}
//                 className={inputBase}
//                 placeholder="684738358"
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>Asociado a</span>
//               <input
//                 type="text"
//                 value={form.associated_number}
//                 onChange={set("associated_number")}
//                 className={inputBase}
//                 placeholder="Iphone 17 pro max Pedro"
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>PIN</span>
//               <input
//                 type="text"
//                 value={form.pin}
//                 onChange={set("pin")}
//                 className={inputBase}
//                 placeholder="0671"
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>PUK</span>
//               <input
//                 type="text"
//                 value={form.puk}
//                 onChange={set("puk")}
//                 className={inputBase}
//                 placeholder="53492363"
//               />
//             </label>

//             <SelectConOtro
//               label="Móvil"
//               value={form.phone_brand}
//               options={MARCAS_MOVIL}
//               onChange={setValue("phone_brand")}
//               placeholder="Tablet Gio"
//             />

//             <SelectConOtro
//               label="SIM"
//               value={form.sim_brand}
//               options={OPERADORAS}
//               onChange={setValue("sim_brand")}
//               placeholder="Otra operadora"
//             />

//             <label className="block">
//               <span className={labelBase}>eSIM</span>
//               <select value={form.is_esim} onChange={set("is_esim")} className={inputBase}>
//                 <option value="">—</option>
//                 <option value="yes">Sí</option>
//                 <option value="no">No</option>
//               </select>
//             </label>

//             <SelectConOtro
//               label="Plataforma"
//               value={form.platform_app}
//               options={PLATAFORMAS}
//               onChange={setValue("platform_app")}
//               placeholder="Otra plataforma"
//             />

//             <label className="block">
//               <span className={labelBase}>Creada</span>
//               <input
//                 type="date"
//                 value={form.created_at}
//                 onChange={set("created_at")}
//                 className={inputBase}
//               />
//             </label>

//             <label className="block">
//               <span className={labelBase}>Bloqueada</span>
//               <input
//                 type="text"
//                 value={form.blocked_at}
//                 onChange={set("blocked_at")}
//                 className={inputBase}
//                 placeholder="-"
//               />
//             </label>

//             <SelectConOtro
//               label="Banco"
//               value={form.bank_name}
//               options={BANCOS}
//               onChange={setValue("bank_name")}
//               placeholder="Otro banco"
//             />

//             <label className="block sm:col-span-2">
//               <span className={labelBase}>IBAN</span>
//               <input
//                 type="text"
//                 value={form.iban}
//                 onChange={set("iban")}
//                 className={inputBase}
//                 placeholder="ES00 0000 0000 0000 0000 0000"
//               />
//             </label>
//           </div>

//           <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
//             >
//               Cancelar
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
//             >
//               {saving ? "Guardando…" : "Añadir cuenta"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddAccountModal;

import React, { useState, useEffect } from "react";


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
  created_at: "",
  blocked_at: "",
  bank_name: "",
  iban: "",
};

const labelBase = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500";
const inputBase =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

/* Select con opción "Otro…" que despliega un input libre */
const SelectConOtro = ({ label, value, options, onChange, placeholder, className = "" }) => {
  const esOtro = value !== "" && !options.includes(value);
  const [modoLibre, setModoLibre] = useState(esOtro);

  useEffect(() => {
    if (value === "") setModoLibre(false);
  }, [value]);

  return (
    <label className={`block ${className}`}>
      <span className={labelBase}>{label}</span>
      {modoLibre ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
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
            className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
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

const AddAccountModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState(VALORES_INICIALES);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(VALORES_INICIALES);
      setShowPass(false);
      setError("");
    }
  }, [isOpen]);

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

    const { phone_marca, phone_modelo, ...resto } = form;

    const payload = Object.fromEntries(
      Object.entries(resto).map(([key, value]) => {
        if (key === "is_esim") {
          return [key, value === "yes" ? true : value === "no" ? false : null];
        }
        const v = typeof value === "string" ? value.trim() : value;
        return [key, v === "" ? null : v];
      })
    );

    payload.phone_brand = movilFinal || null;

    setSaving(true);
    try {
      await onCreate(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Añadir cuenta</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
            title="Cerrar"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5" noValidate>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelBase}>Mail</span>
              <input
                type="email"
                value={form.mail}
                onChange={set("mail")}
                className={inputBase}
                placeholder="cuenta@outlook.com"
              />
            </label>

            <label className="block">
              <span className={labelBase}>Usuario</span>
              <input
                type="text"
                value={form.username}
                onChange={set("username")}
                className={inputBase}
                placeholder="lunavelvetshop"
              />
            </label>

            <label className="block">
              <span className={labelBase}>Password</span>
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
                  className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
                >
                  <i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                </button>
              </div>
            </label>

            <label className="block">
              <span className={labelBase}>Teléfono</span>
              <input
                type="text"
                value={form.phone_number}
                onChange={set("phone_number")}
                className={inputBase}
                placeholder="684738358"
              />
            </label>

            <label className="block">
              <span className={labelBase}>Asociado a</span>
              <input
                type="text"
                value={form.associated_number}
                onChange={set("associated_number")}
                className={inputBase}
                placeholder="Iphone 17 pro max Pedro"
              />
            </label>

            <label className="block">
              <span className={labelBase}>PIN</span>
              <input
                type="text"
                value={form.pin}
                onChange={set("pin")}
                className={inputBase}
                placeholder="0671"
              />
            </label>

            <label className="block">
              <span className={labelBase}>PUK</span>
              <input
                type="text"
                value={form.puk}
                onChange={set("puk")}
                className={inputBase}
                placeholder="53492363"
              />
            </label>

            {/* ── Móvil: marca (select) + modelo (input libre) ── */}
            <SelectConOtro
              label="Marca del móvil"
              value={form.phone_marca}
              options={MARCAS_MOVIL}
              onChange={setValue("phone_marca")}
              placeholder="Tablet Gio"
            />

            <label className="block">
              <span className={labelBase}>Modelo</span>
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
              value={form.sim_brand}
              options={OPERADORAS}
              onChange={setValue("sim_brand")}
              placeholder="Otra operadora"
            />

            <label className="block">
              <span className={labelBase}>eSIM</span>
              <select value={form.is_esim} onChange={set("is_esim")} className={inputBase}>
                <option value="">—</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </select>
            </label>

            <SelectConOtro
              label="Plataforma"
              value={form.platform_app}
              options={PLATAFORMAS}
              onChange={setValue("platform_app")}
              placeholder="Otra plataforma"
            />

            <label className="block">
              <span className={labelBase}>Creada</span>
              <input
                type="date"
                value={form.created_at}
                onChange={set("created_at")}
                className={inputBase}
              />
            </label>

            <label className="block">
              <span className={labelBase}>Bloqueada</span>
              <input
                type="text"
                value={form.blocked_at}
                onChange={set("blocked_at")}
                className={inputBase}
                placeholder="-"
              />
            </label>

            <SelectConOtro
              label="Banco"
              value={form.bank_name}
              options={BANCOS}
              onChange={setValue("bank_name")}
              placeholder="Otro banco"
            />

            <label className="block sm:col-span-2">
              <span className={labelBase}>IBAN</span>
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
              className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Guardando…" : "Añadir cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;