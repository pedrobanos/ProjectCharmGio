import { useState } from "react";
import { AccountBadge } from "./PlatformIcon";

export const SaleConfirmedModal = ({
    isOpen,
    onClose,
    soldListing = null,
    listingsToReview = [],
    onRetireListing,
}) => {
    const [retiringId, setRetiringId] = useState(null);

    if (!isOpen) return null;

    const handleRetire = async (listing) => {
        setRetiringId(listing.id);
        try {
            await onRetireListing?.(listing);
        } finally {
            setRetiringId(null);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl text-green-600 font-bold mb-4 text-center">
                    ¡Venta Confirmada!
                </h2>
                <p className="mb-4 text-center">
                    La venta se ha registrado correctamente.
                </p>

                {soldListing && (
                    <div className="mb-4 text-sm text-center">
                        <p className="text-gray-600 mb-1">Anuncio marcado como vendido:</p>
                        <AccountBadge account={soldListing.account} />
                    </div>
                )}

                {listingsToReview.length > 0 && (
                    <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-left">
                        <p className="text-sm font-semibold text-amber-800 mb-2">
                            ⚠️ Borra estos anuncios para no venderlo dos veces:
                        </p>
                        <ul className="flex flex-col gap-2">
                            {listingsToReview.map((l) => (
                                <li key={l.id} className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-700 truncate">{l.product?.nombre}</p>
                                        <AccountBadge account={l.account} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRetire(l)}
                                        disabled={retiringId === l.id}
                                        className="text-xs whitespace-nowrap bg-white border border-amber-400 text-amber-800 px-2 py-1.5 rounded-md hover:bg-amber-100 cursor-pointer disabled:opacity-50"
                                    >
                                        {retiringId === l.id ? "..." : "Ya lo he borrado"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
