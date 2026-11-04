import "./Schemas.css";

// Schémas décoratifs de l'accueil (offres et étapes). Aucun texte dans les dessins : valables dans les quatre langues.
// pathLength="1" sur chaque forme : le tracé animé (stroke-dashoffset 1 → 0) se règle sans calculer de longueurs.
const P = (props) => <path pathLength="1" className="sd" {...props} />;
const R = (props) => <rect pathLength="1" className="sd" {...props} />;
const C = (props) => <circle pathLength="1" className="sd" {...props} />;
const E = (props) => <ellipse pathLength="1" className="sd" {...props} />;

// Fenêtre de navigateur : cadre, barre du haut et trois points
function Frame({ x = 8, y = 8, w = 224, h = 104 }) {
  return (
    <>
      <R x={x} y={y} width={w} height={h} rx="8" />
      <P d={`M${x} ${y + 20}H${x + w}`} />
      <C cx={x + 12} cy={y + 10} r="2" />
      <C cx={x + 22} cy={y + 10} r="2" />
      <C cx={x + 32} cy={y + 10} r="2" />
    </>
  );
}

// kind 0 : Vitrine (une page, plusieurs sections) · 1 : Vitrine + (réservation, paiement, administration) · 2 : Maintenance (serveur, protection, alerte)
export function OfferSchema({ kind }) {
  return (
    <svg className="schema schema--offer" viewBox="0 0 240 120" aria-hidden="true" focusable="false">
      {kind === 0 && (
        <>
          <Frame />
          <R x="20" y="36" width="200" height="28" rx="4" />
          <P d="M30 45H92" />
          <P d="M30 54H72" />
          <R x="168" y="45" width="40" height="10" rx="5" className="sd sa" />
          <R x="20" y="72" width="56" height="32" rx="4" />
          <R x="92" y="72" width="56" height="32" rx="4" />
          <R x="164" y="72" width="56" height="32" rx="4" />
        </>
      )}
      {kind === 1 && (
        <>
          <Frame />
          <R x="20" y="36" width="124" height="28" rx="4" />
          <P d="M30 45H84" />
          <P d="M30 54H70" />
          <R x="98" y="46" width="36" height="9" rx="4.5" className="sd sa" />
          <R x="20" y="72" width="36" height="32" rx="4" />
          <R x="64" y="72" width="36" height="32" rx="4" />
          <R x="108" y="72" width="36" height="32" rx="4" />
          {/* réservation : calendrier */}
          <R x="154" y="36" width="66" height="36" rx="4" className="sd sa" />
          <P d="M154 48H220" />
          <P d="M176 48V72" />
          <P d="M198 48V72" />
          <P d="M154 60H220" />
          {/* paiement : carte */}
          <R x="154" y="80" width="32" height="24" rx="4" />
          <P d="M154 88H186" />
          <P d="M159 98H169" />
          {/* administration : réglages */}
          <C cx="206" cy="92" r="10" />
          <C cx="206" cy="92" r="3.5" className="sd sa" />
        </>
      )}
      {kind === 2 && (
        <>
          {/* serveur */}
          <R x="12" y="26" width="46" height="18" rx="4" />
          <R x="12" y="51" width="46" height="18" rx="4" />
          <R x="12" y="76" width="46" height="18" rx="4" />
          <C cx="22" cy="35" r="2" className="sd sa" />
          <C cx="22" cy="60" r="2" className="sd sa" />
          <C cx="22" cy="85" r="2" className="sd sa" />
          <P d="M32 35H50" />
          <P d="M32 60H50" />
          <P d="M32 85H50" />
          {/* liens */}
          <P d="M58 60H84" className="sd sd--dash" />
          <P d="M156 60H182" className="sd sd--dash" />
          {/* bouclier */}
          <P d="M120 12L156 26V56C156 80 140 98 120 108C100 98 84 80 84 56V26Z" className="sd sa" />
          <P d="M104 58L116 70L138 44" className="sd sa" />
          {/* alerte : cloche */}
          <P d="M182 80H218C214 76 212 70 212 62C212 52 206 46 200 46C194 46 188 52 188 62C188 70 186 76 182 80Z" />
          <P d="M194 86A6 6 0 0 0 206 86" />
        </>
      )}
    </svg>
  );
}

// n de 0 à 3 : Échange · Maquette · Développement · Mise en ligne
export function StepSchema({ n }) {
  return (
    <svg className="schema schema--step" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      {n === 0 && (
        <>
          <R x="6" y="8" width="62" height="34" rx="9" />
          <P d="M20 42L15 54L32 42" />
          <P d="M18 20H50" />
          <P d="M18 29H40" />
          <R x="52" y="34" width="62" height="34" rx="9" className="sd sa step-fill" />
          <P d="M100 68L106 78L88 68" className="sd sa" />
          <P d="M64 46H96" className="sd sa" />
          <P d="M64 55H84" className="sd sa" />
        </>
      )}
      {n === 1 && (
        <>
          <R x="12" y="6" width="96" height="68" rx="7" />
          <P d="M12 20H108" />
          <C cx="22" cy="13" r="1.8" />
          <C cx="30" cy="13" r="1.8" />
          <R x="22" y="28" width="76" height="18" rx="3" className="sd sa sd--dash" />
          <R x="22" y="52" width="22" height="14" rx="3" />
          <R x="49" y="52" width="22" height="14" rx="3" />
          <R x="76" y="52" width="22" height="14" rx="3" />
        </>
      )}
      {n === 2 && (
        <>
          <P d="M42 20L18 40L42 60" />
          <P d="M78 20L102 40L78 60" />
          <P d="M67 12L53 68" className="sd sa" />
        </>
      )}
      {n === 3 && (
        <>
          <C cx="60" cy="30" r="24" />
          <E cx="60" cy="30" rx="11" ry="24" />
          <P d="M36 30H84" />
          <P d="M60 76V62" className="sd sa" />
          <P d="M52 69L60 61L68 69" className="sd sa" />
        </>
      )}
    </svg>
  );
}
