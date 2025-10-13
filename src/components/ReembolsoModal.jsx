import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reembolso from "./Reembolso";

const ReembolsoModal = ({ userRole, isOpen, onClose, saldoInicial, onReembolso }) => {
  // 🔁 Cerrar y recargar toda la página
  const handleClose = () => {
    onClose();
    // Esperamos un momento para que la animación se vea fluida
    setTimeout(() => {
      window.location.reload(); // 🔁 Recarga completa del navegador
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 flex justify-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo clicable */}
          <div className="absolute inset-0" onClick={handleClose} />

          {/* Panel lateral derecho */}
          <motion.div
            className="relative bg-white w-1/2 h-full shadow-xl overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-lg z-10"
            >
              ✕
            </button>

            {/* Contenido principal */}
            <Reembolso
              saldoInicial={saldoInicial}
              onReembolso={onReembolso}
              userRole={userRole}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReembolsoModal;
