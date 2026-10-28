import { Link, useParams } from "react-router-dom";
import LegalPage from "./LegalPage";
import { LEGAL, vatMention } from "../../data/legal";

export default function CgvPage() {
  const { lang = "fr" } = useParams();

  return (
    <LegalPage titleKey="legal.terms">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente s'appliquent aux prestations de création, de refonte et de
        maintenance de sites internet fournies par {LEGAL.brand} ({LEGAL.publisher}, {LEGAL.status}, SIREN{" "}
        {LEGAL.siren}) à des clients professionnels. Toute commande implique l'acceptation de ces conditions.
      </p>

      <h2>2. Maquette gratuite</h2>
      <p>
        La maquette de votre page d'accueil est gratuite et sans engagement. Elle est envoyée dans un délai indicatif
        de 72 heures à compter de notre échange téléphonique, qui permet de recueillir les informations nécessaires
        (activité, besoins, goûts). Elle reste la propriété de {LEGAL.brand}{" "}
        et ne peut pas être utilisée sans commande. Vous n'avez aucune obligation de poursuivre.
      </p>

      <h2>3. Devis et commande</h2>
      <p>
        Un devis est établi gratuitement. La commande devient ferme lorsque vous acceptez le devis par écrit (un
        email suffit) et que l'acompte est réglé.
      </p>

      <h2>4. Prix</h2>
      <p>
        Les prix sont exprimés en euros. {vatMention()}. Les tarifs « à partir de » sont indicatifs : le prix définitif est
        celui du devis accepté. À titre indicatif : pack Vitrine à partir de 490 €, pack Vitrine + à partir de 990 €,
        maintenance à 50 € par mois.
      </p>

      <h2>5. Paiement</h2>
      <ul>
        <li>Acompte de <strong>30 %</strong> à la commande, c'est-à-dire après la maquette gratuite, une fois le devis accepté.</li>
        <li>Solde de <strong>70 %</strong> à la livraison du site.</li>
        <li>Règlement par virement bancaire ou tout autre moyen convenu par écrit.</li>
      </ul>
      <p>
        Tout retard de paiement entraîne de plein droit des pénalités égales à trois fois le taux d'intérêt légal, ainsi
        que l'indemnité forfaitaire de 40 € pour frais de recouvrement. Aucun escompte n'est accordé pour paiement
        anticipé.
      </p>

      <h2>6. Délais</h2>
      <p>
        Les délais sont indiqués sur le devis. Ils dépendent de la remise des contenus nécessaires (textes, images,
        accès) et de la rapidité de validation de chaque étape par le client : tout retard de sa part prolonge d'autant
        le délai de livraison.
      </p>

      <h2>7. Obligations du client</h2>
      <p>
        Le client fournit des informations exactes et des contenus dont il détient les droits. Il est responsable des
        textes, images et marques qu'il transmet.
      </p>

      <h2>8. Livraison</h2>
      <p>
        La livraison correspond à la mise en ligne du site. Le client signale toute non-conformité dans le délai prévu
        au devis ; je la corrige alors sans frais.
      </p>

      <h2>9. Propriété intellectuelle</h2>
      <p>
        À compter du paiement intégral, les droits d'exploitation des éléments créés spécialement pour le client
        (maquette retenue, design, textes rédigés, code spécifique) lui sont cédés. Les composants tiers et logiciels
        libres restent soumis à leurs licences. Sauf refus écrit du client, {LEGAL.brand} peut citer le projet comme
        référence.
      </p>

      <h2>10. Nom de domaine</h2>
      <p>
        Le nom de domaine est enregistré au nom du client, qui en est le titulaire. Lorsque je l'achète pour son compte,
        je le lui refacture au prix coûtant. Si le client souscrit la maintenance, l'achat et le renouvellement du nom de
        domaine (un seul par site, extensions courantes comme .fr ou .com) sont offerts tant qu'elle est active. À son
        arrêt, le client prend en charge le renouvellement au prix coûtant, ou transfère le domaine chez lui. Sur simple
        demande par email, je déverrouille le domaine et lui remets le code de transfert sous 48 h ouvrées, sans frais. Le
        client me prévient avant tout transfert afin d'éviter une interruption du site.
      </p>

      <h2>11. Remise du site</h2>
      <p>
        À la livraison ou à tout moment sur simple demande, je remets au client, sans frais, les fichiers de son site :
        dépôt de code privé transféré dans son compte GitHub, ou archive, avec les instructions de mise en ligne et, le
        cas échéant, un export de ses données. Les composants techniques réutilisables, non spécifiques au client,
        restent ma propriété ; le client en conserve le droit d'usage pour son site.
      </p>

      <h2>12. Maintenance</h2>
      <p>
        La maintenance, à 50 € par mois, comprend les sauvegardes et la surveillance, les mises à jour de sécurité et un
        support réactif. L'hébergement sécurisé et le nom de domaine (voir l'article 10) sont offerts avec tout contrat
        de maintenance. Le contrat est sans engagement de durée : il est facturé mensuellement et se renouvelle chaque
        mois, et chaque partie peut y mettre fin par email, sans frais, moyennant un{" "}
        <strong>préavis d'un mois</strong>. Le site reste hébergé jusqu'à la fin du préavis ; le client l'héberge ensuite
        où il le souhaite, avec les fichiers remis selon l'article 11. Les nouvelles fonctionnalités et les refontes font
        l'objet d'un devis distinct.
      </p>

      <h2>13. Responsabilité</h2>
      <p>
        {LEGAL.brand} est tenu à une obligation de moyens. Aucun résultat commercial ni positionnement dans les moteurs
        de recherche n'est garanti. La responsabilité est limitée au montant payé pour la prestation concernée et ne
        couvre pas les interruptions dues à un cas de force majeure ou à un tiers (hébergeur, fournisseur de noms de
        domaine, etc.).
      </p>

      <h2>14. Résiliation avant livraison</h2>
      <p>
        Si le client met fin à la commande avant la livraison, l'acompte reste acquis en contrepartie du travail déjà
        engagé ; le travail réalisé au-delà de l'acompte est facturé au prorata de son avancement.
      </p>

      <h2>15. Données personnelles</h2>
      <p>
        Les données collectées sont traitées conformément à la{" "}
        <Link to={`/${lang}/confidentialite`}>politique de confidentialité</Link>.
      </p>

      <h2>16. Droit applicable et litiges</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, les parties cherchent d'abord une
        solution amiable. À défaut, les tribunaux compétents du ressort de {LEGAL.jurisdiction} sont seuls compétents.
      </p>
    </LegalPage>
  );
}
