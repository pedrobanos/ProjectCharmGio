// DualRingLoader.jsx
export default function Loading({
  size = 56,                   // px
  thickness = 4,               // px
  color = "text-blue-500",     // anillo exterior
  secondary = "text-blue-300", // anillo interior
  label = "Cargando…",
}) {
  const outerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${thickness}px`,
  };

  const gap = 8; // espacio entre aros
  const innerSize = Math.max(0, size - thickness * 2 - gap);
  const innerStyle = {
    width: `${innerSize}px`,
    height: `${innerSize}px`,
    borderWidth: `${thickness}px`,
    animation: "spin 1.25s linear infinite reverse", // antihorario
  };

  const ringBase =
    "rounded-full border-solid border-current border-t-transparent";

  return (
    // Ocupa alto de la ventana y centra el loader como una navbar centrada
    <div className="min-h-screen w-full grid place-items-center" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>

      {/* Wrapper con tamaño fijo y posicionamiento relativo para centrar el aro interior */}
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Anillo exterior (horario) */}
        <div className={`${ringBase} animate-spin ${color}`} style={outerStyle} />

        {/* Anillo interior (antihorario), centrado sobre el exterior */}
        <div
          className={`${ringBase} ${secondary} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
          style={innerStyle}
        />
      </div>
    </div>
  );
}
