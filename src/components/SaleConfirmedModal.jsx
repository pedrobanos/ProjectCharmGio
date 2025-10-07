


export const SaleConfirmedModal = ({ isOpen, onClose }) => {
    // useEffect(() => {
    //     if (!isOpen) return;

    //     const timer = setTimeout(() => {
    //         onClose();
    //     }, 1000);

    //     return () => clearTimeout(timer); // limpiar al desmontar o cerrar
    // }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-md mx-auto">
                <h2 className="text-2xl text-green-600 font-bold mb-4 text-center">
                    ¡Venta Confirmada!
                </h2>
                <p className="mb-6 text-center">
                    La venta se ha registrado correctamente.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
