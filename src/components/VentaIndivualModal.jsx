import React, { useState, useEffect } from "react";
import { getBlacklist } from "../services/clientServices";


export default function VentaIndividualModal({
  isOpen,
  selectedProduct,
  cantidadVenta,
  setCantidadVenta,
  cliente,
  setCliente,
  precioVenta,
  setPrecioVenta,
  error,
  confirmSale,
  setIsModalOpen,
}) {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [previousPrice, setPreviousPrice] = useState(null);
  const [stockError, setStockError] = useState("");
  const [precioBase, setPrecioBase] = useState(selectedProduct?.precio ?? 0);
  const [blacklist, setBlacklist] = useState([]);
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  // 🧩 Obtener blacklist al abrir modal
  useEffect(() => {
    if (isOpen) {
      getBlacklist()
        .then((data) => setBlacklist(data.map((b) => b.cliente.toLowerCase())))
        .catch((err) => console.error("Error cargando blacklist:", err));
    }
  }, [isOpen]);

  // 🧩 Verificar si el cliente actual está bloqueado
  useEffect(() => {
    if (!cliente) return;
    const nombre = cliente.trim().toLowerCase();
    const bloqueado = blacklist.some((b) => nombre.includes(b));
    setIsBlacklisted(bloqueado);
  }, [cliente, blacklist]);

  // --- Lógica del selector (Carol, Gio, Otros)
  useEffect(() => {
    if (!selectedProduct) return;

    if (selectedPerson === "carol") {
      setCliente("vinted (carol)");
      if (previousPrice !== null) {
        setPrecioVenta(previousPrice);
        setPreviousPrice(null);
      }
    } else if (selectedPerson === "gio") {
      setCliente("vinted (gio)");
      if (precioVenta !== 0) setPreviousPrice(precioVenta);
      setPrecioVenta(0);
    } else if (selectedPerson === "otros") {
      setCliente("");
      if (previousPrice !== null) {
        setPrecioVenta(previousPrice);
        setPreviousPrice(null);
      }
    } else {
      setCliente("");
    }
  }, [selectedPerson]);

  // --- Multiplica cantidad * precio unitario ---
  useEffect(() => {
    if (!selectedProduct || selectedPerson === "gio") return;
    const base = selectedProduct.precio ?? precioBase;
    const total = (cantidadVenta || 0) * base;
    setPrecioVenta(Number(total.toFixed(2)));
  }, [cantidadVenta, selectedProduct, selectedPerson]);

  // --- Validar stock ---
  const handleCantidadChange = (e) => {
    const value = Number(e.target.value);
    if (value > selectedProduct.cantidad) {
      setStockError(
        `No puedes vender más de ${selectedProduct.cantidad} unidades disponibles.`
      );
      setCantidadVenta(selectedProduct.cantidad);
    } else {
      setStockError("");
      setCantidadVenta(value);
    }
  };

  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
        <h2 className="text-4xl text-center font-semibold mb-4">
          Venta Individual
        </h2>

        {/* Info producto */}
        <div className="flex items-center gap-3 mb-4">
          {selectedProduct.foto ? (
            <img
              src={selectedProduct.foto}
              alt={selectedProduct.nombre}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs">
              No foto
            </div>
          )}
          <div>
            <p className="font-medium">{selectedProduct.nombre}</p>
            <p className="text-xs text-gray-500">{selectedProduct.lugar}</p>
            <p className="text-xs text-gray-500">
              Stock: {selectedProduct.cantidad}
            </p>
          </div>
        </div>

        {/* Cantidad */}
        <label className="block text-sm font-medium mb-1">
          Cantidad a vender
        </label>
        <input
          type="number"
          min="1"
          value={cantidadVenta}
          onChange={handleCantidadChange}
          className={`border rounded-md p-2 w-full mb-1 ${
            stockError ? "border-red-500" : "border-gray-300"
          }`}
        />
        {stockError && (
          <p className="text-red-500 text-xs mb-3">{stockError}</p>
        )}

        {/* Selector de cliente */}
        <label className="block text-sm font-medium mb-1">Cliente</label>
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full mb-3"
        >
          <option value="">Seleccionar cliente...</option>
          <option value="carol">Carol</option>
          <option value="gio">Gio</option>
          <option value="otros">Otros</option>
        </select>

        {/* Nombre cliente */}
        {selectedPerson && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Nombre Cliente
            </label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="John Doe"
              readOnly={selectedPerson !== "otros"}
              className={`border border-gray-300 rounded-md p-2 w-full ${
                selectedPerson !== "otros"
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        )}

        {/* ⚠️ Cliente bloqueado */}
        {isBlacklisted && (
          <p className="text-red-500 text-sm mb-3 text-center font-medium">
            ⚠️ Este cliente está en la blacklist y no puede realizar compras.
          </p>
        )}

        {/* Precio */}
        <label className="block text-sm font-medium mb-1">
          Precio Total (€)
        </label>
        <input
          type="text"
          value={precioVenta}
          onChange={(e) => {
            const value = e.target.value.replace(",", ".");
            setPrecioVenta(value);
          }}
          placeholder="Precio total"
          readOnly={selectedPerson === "gio"}
          className={`border border-gray-300 rounded-md p-2 w-full mb-4 ${
            selectedPerson === "gio"
              ? "bg-gray-100 text-gray-600 cursor-not-allowed"
              : ""
          }`}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Botones */}
        <div className="flex justify-center text-center items-center mt-6 gap-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
          >
            <i className="fa-solid fa-xmark mx-2"></i>
            Cancelar
          </button>

          <button
            onClick={confirmSale}
            disabled={!selectedPerson || !!stockError || isBlacklisted}
            className={`px-2 py-2 rounded-md text-white ${
              !selectedPerson || stockError || isBlacklisted
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <i className="fa-solid fa-cart-shopping mx-2"></i>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
