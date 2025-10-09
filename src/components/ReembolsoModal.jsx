import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reembolso from "./Reembolso";


const ReembolsoModal = ({  userRole, isOpen, onClose, saldoInicial, onReembolso }) => {
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
                    <div className="absolute inset-0" onClick={onClose} />

                    {/* Panel derecho (mitad de la pantalla) */}
                    <motion.div
                        className="relative bg-white w-1/2 h-full shadow-xl overflow-hidden"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        {/* Botón de cerrar */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-lg z-10"
                        >
                            ✕
                        </button>

                        {/* Contenido que ocupa todo el modal */}
                        <Reembolso saldoInicial={saldoInicial} onReembolso={onReembolso}  userRole={userRole}/>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReembolsoModal;



