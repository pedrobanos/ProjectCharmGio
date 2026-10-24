import React, { useState } from "react";
import { normalizePlatform, accountLabel } from "../services/listingsServices";
import { PLATFORM_STYLES } from "../utils/listingUtils";

// Logo "V" oficial de Vinted (fuente: Simple Icons)
const VINTED_PATH =
  "M19.316 0c-.258 0-.571.217-1.415.953-.3.108-.627.027-1.008.613-2.15 3.09-3.825 14.648-5.255 17.984-.286-1.444-.885-10.837-1.116-13.41-.028-.477.027-1.076.027-1.43 0-2.368-.516-3.567-2.886-3.567-1.198 0-2.382.436-3.008 1.226-.299.408-.409.708-.409 1.443 0 4.915 1.171 12.973 2.478 18.228C7.132 23.688 8.603 24 9.99 24c.654 0 1.307-.081 2.233-.544 3.212-1.567 4.07-5.84 4.9-9.993.15-.749.899-4.37 1.253-6.275.476-2.6 1.02-5.54 1.347-6.617C19.833.245 19.63 0 19.317 0z";

// Icono oficial de Wallapop (el de su web), servido por Google
const WALLAPOP_ICON_URL = "https://www.google.com/s2/favicons?domain=es.wallapop.com&sz=64";

const VintedIcon = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label="Vinted"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <title>Vinted</title>
    <rect width="24" height="24" rx="6" fill={PLATFORM_STYLES.Vinted.bg} />
    {/* el logo ocupa el 60% centrado */}
    <path d={VINTED_PATH} fill="#ffffff" transform="translate(4.8 4.8) scale(0.6)" />
  </svg>
);

const WallapopIcon = ({ size, className }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <LetterIcon platform="Wallapop" size={size} className={className} />;
  return (
    <img
      src={WALLAPOP_ICON_URL}
      width={size}
      height={size}
      alt="Wallapop"
      title="Wallapop"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block flex-shrink-0 rounded-md ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

// Icono de la plataforma (logos oficiales; si no carga, la inicial)
const PlatformIcon = ({ platform, size = 18, className = "" }) => {
  const p = normalizePlatform(platform);
  if (p === "Vinted") return <VintedIcon size={size} className={className} />;
  if (p === "Wallapop") return <WallapopIcon size={size} className={className} />;
  return null;
};

// Respaldo: cuadrado con la inicial
const LetterIcon = ({ platform, size = 18, className = "" }) => {
  const p = normalizePlatform(platform);
  const s = PLATFORM_STYLES[p];
  if (!s) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={p}
      className={`inline-block flex-shrink-0 ${className}`}
    >
      <title>{p}</title>
      <rect width="24" height="24" rx="6" fill={s.bg} />
      <text
        x="12"
        y={p === "Wallapop" ? "16.5" : "17"}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize={p === "Wallapop" ? "15" : "14"}
        fill={s.text}
      >
        {s.letter}
      </text>
    </svg>
  );
};

// Etiqueta "icono + usuario" para una cuenta
export const AccountBadge = ({ account, size = 16, className = "", children }) => {
  if (!account) return null;
  const s = PLATFORM_STYLES[account.platform] || {};
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full pl-0.5 pr-2 py-0.5 text-xs font-medium normal-case max-w-full ${className}`}
      style={{ backgroundColor: s.light || "#f3f4f6", color: s.bg || "#374151" }}
      title={`${account.platform} · ${accountLabel(account)}`}
    >
      <PlatformIcon platform={account.platform} size={size} />
      <span className="truncate">{accountLabel(account)}</span>
      {children}
    </span>
  );
};

export default PlatformIcon;
