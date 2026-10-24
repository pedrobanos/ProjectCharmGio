import React from "react";

// Colores por sección (los mismos que la barra lateral)
const TONES = {
  red: "bg-red-500",
  blue: "bg-blue-600",
  purple: "bg-purple-700",
  teal: "bg-teal-700",
  amber: "bg-yellow-700",
  pink: "bg-pink-700",
  black: "bg-gray-900",
  green: "bg-green-600",
  gray: "bg-gray-700",
};

/**
 * Cabecera común de las pantallas: icono + título + subtítulo + acciones a la derecha.
 *  <PageHeader icon="fa-solid fa-table-list" tone="red" title="Productos" subtitle="..." actions={<button/>} />
 */
const PageHeader = ({ icon, tone = "blue", title, subtitle, actions, extra, className = "" }) => (
  <header
    className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
      /(^|\s)mt-/.test(className) ? "" : "mt-12"
    } ${/(^|\s)mb-/.test(className) ? "" : "mb-6"} ${className}`}
  >
    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
      {icon && (
        <span
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl shadow-sm flex-shrink-0 ${
            TONES[tone] || TONES.blue
          }`}
          aria-hidden="true"
        >
          <i className={icon}></i>
        </span>
      )}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight flex items-center gap-2 flex-wrap">
          {title}
          {extra}
        </h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
  </header>
);

export default PageHeader;
