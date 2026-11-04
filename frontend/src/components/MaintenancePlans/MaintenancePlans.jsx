import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../pages/ServicesPage/ServicesPage.css";

// Les trois niveaux de maintenance (textes : services_page.plans*). `as` : niveau du titre (h2 sur la page Maintenance, h3 sous un service)
export default function MaintenancePlans({ as = "h3" }) {
  const { t } = useTranslation();
  const s = (path, options) => t(`services_page.${path}`, options);
  const plans = s("plans", { returnObjects: true });
  const planRows = s("plan_rows", { returnObjects: true });
  if (!Array.isArray(plans) || !Array.isArray(planRows)) return null;

  return (
    <>
      <header className="block-head reveal">
        <p className="eyebrow">{s("plans_eyebrow")}</p>
        {as === "h2"
          ? <h2 className="block-title svc-plans-title">{s("plans_title")}</h2>
          : <h3 className="block-title svc-plans-title">{s("plans_title")}</h3>}
        <p className="svc-desc">{s("plans_text")}</p>
      </header>
      <div className="svc-plans">
        {plans.map((plan, p) => (
          <article key={plan.name} className={`svc-plan reveal${p === 1 ? " svc-plan--featured" : ""}`} style={{ "--delay": `${p * 90}ms` }}>
            {p === 1 && <span className="svc-plan-badge">{s("plans_recommended")}</span>}
            <h4 className="svc-plan-name">{plan.name}</h4>
            <p className="svc-plan-price"><strong>{plan.price}</strong> <span>{plan.unit}</span></p>
            <p className="svc-plan-tagline">{plan.tagline}</p>
            <dl className="svc-plan-rows">
              {planRows.map((label, r) => {
                const value = plan.values[r];
                const off = value === "—";
                return (
                  <div key={label} className={`svc-plan-row${off ? " is-off" : ""}`}>
                    <dt>{label}</dt>
                    <dd aria-label={off ? s("plan_not_included") : undefined}>{value}</dd>
                  </div>
                );
              })}
            </dl>
            <Link to="/fr/contact" className={p === 1 ? "btn-primary" : "btn-outline"}>
              {s("plans_cta")} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
      <p className="metier-note svc-plans-note">{s("plans_note")}</p>
    </>
  );
}
