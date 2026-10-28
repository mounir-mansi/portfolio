import { HONEYPOT_FIELD } from "./honeypotField";

// À placer dans un <form> : champ caché hors écran, ignoré par le clavier et les lecteurs d'écran
export default function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Ne pas remplir ce champ
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
