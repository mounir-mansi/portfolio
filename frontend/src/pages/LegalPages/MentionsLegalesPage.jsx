import { Link, useParams } from "react-router-dom";
import LegalPage from "./LegalPage";
import { LEGAL } from "../../data/legal";

export default function MentionsLegalesPage() {
  const { lang = "fr" } = useParams();
  return (
    <LegalPage titleKey="legal.mentions">
      <h2>Éditeur du site</h2>
      <dl className="legal-facts">
        <div><dt>Nom commercial</dt><dd>{LEGAL.brand}</dd></div>
        <div><dt>Éditeur</dt><dd>{LEGAL.publisher}</dd></div>
        <div><dt>Statut</dt><dd>{LEGAL.status}</dd></div>
        <div><dt>SIREN</dt><dd>{LEGAL.siren}</dd></div>
        {LEGAL.siret && <div><dt>SIRET</dt><dd>{LEGAL.siret}</dd></div>}
        {LEGAL.address && <div><dt>Adresse</dt><dd>{LEGAL.address}</dd></div>}
        <div><dt>Téléphone</dt><dd><a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`}>{LEGAL.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></dd></div>
        <div><dt>TVA</dt><dd>{LEGAL.vat}</dd></div>
        <div><dt>Directeur de la publication</dt><dd>{LEGAL.publisher}</dd></div>
      </dl>

      <h2>Hébergeur</h2>
      <dl className="legal-facts">
        <div><dt>Société</dt><dd>{LEGAL.host.name}</dd></div>
        <div><dt>Adresse</dt><dd>{LEGAL.host.address}</dd></div>
        <div><dt>Téléphone</dt><dd>{LEGAL.host.phone}</dd></div>
      </dl>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, la mise en page, le code et les éléments graphiques de ce site sont la propriété de
        l'éditeur, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite
        est interdite.
      </p>
      <p>
        Les captures d'écran et les noms de projets présentés dans la rubrique « Projets » appartiennent à
        leurs propriétaires respectifs et sont montrés à titre de références professionnelles.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les informations de ce site sont données à titre indicatif et peuvent être modifiées à tout moment.
        L'éditeur ne peut être tenu responsable du contenu des sites externes vers lesquels pointent certains
        liens.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données saisies dans les formulaires est décrit dans la{" "}
        <Link to={`/${lang}/confidentialite`}>politique de confidentialité</Link>.
      </p>

      <h2>Droit applicable</h2>
      <p>Le présent site et ses mentions légales sont soumis au droit français.</p>
    </LegalPage>
  );
}
