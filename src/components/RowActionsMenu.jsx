import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

/**
 * Botón "⋯" que abre un menú con las acciones de una fila.
 * El menú se pinta en <body> para que la tabla (con scroll) no lo recorte.
 *
 * items: [{ key, label, icon, color, to?, state?, onClick?, danger? }]
 */
const RowActionsMenu = ({ items, title = "Más acciones" }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current.getBoundingClientRect();
    const menuH = items.length * 44 + 12;
    const openUp = r.bottom + menuH > window.innerHeight && r.top > menuH;
    setPos({
      top: openUp ? r.top - menuH - 4 : r.bottom + 4,
      left: Math.max(8, Math.min(r.right - 192, window.innerWidth - 200)),
      openUp,
    });
    setOpen(true);
  };

  // Cerrar al pulsar fuera, hacer scroll, cambiar tamaño o pulsar Escape
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-gray-100 cursor-pointer";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-8 h-8 inline-flex items-center justify-center rounded-full cursor-pointer text-gray-600 hover:bg-gray-200 ${
          open ? "bg-gray-200" : ""
        }`}
      >
        <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[70] w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 normal-case"
            style={{ top: pos.top, left: pos.left }}
          >
            {items.map((it) => {
              const content = (
                <>
                  <span className="w-5 flex justify-center" style={{ color: it.color }}>
                    {it.icon}
                  </span>
                  <span className={it.danger ? "text-red-600" : "text-gray-800"}>{it.label}</span>
                </>
              );
              return it.to ? (
                <Link
                  key={it.key}
                  to={it.to}
                  state={it.state}
                  role="menuitem"
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={it.key}
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

export default RowActionsMenu;
