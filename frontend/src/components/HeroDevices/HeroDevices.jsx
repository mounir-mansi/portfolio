import "./HeroDevices.css";

// Visuel du hero de l'accueil : une démo (Maison Camille) sur un ordinateur et sur un téléphone, qui flottent doucement.
// Image décorative (le site de démonstration est présenté en détail dans le bandeau juste dessous). Captures du site en ligne :
// public/hero-laptop.webp (1200×750) et public/hero-phone.webp (360×780).
export default function HeroDevices() {
  return (
    <div className="hero-devices" aria-hidden="true">
      <div className="hd-laptop">
        <div className="hd-laptop-screen">
          <img src="/hero-laptop.webp" alt="" width="1200" height="750" decoding="async" fetchPriority="low" />
        </div>
        <div className="hd-laptop-base" />
      </div>
      <div className="hd-phone">
        <img src="/hero-phone.webp" alt="" width="360" height="780" decoding="async" fetchPriority="low" />
      </div>
    </div>
  );
}
