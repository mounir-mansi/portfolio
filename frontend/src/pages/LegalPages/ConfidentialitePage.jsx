import LegalPage from "./LegalPage";
import { LEGAL } from "../../data/legal";

export default function ConfidentialitePage() {
  return (
    <LegalPage titleKey="legal.privacy">
      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données personnelles collectées sur ce site est{" "}
        <strong>{LEGAL.publisher}</strong>, exerçant sous le nom {LEGAL.brand} ({LEGAL.status}, SIREN {LEGAL.siren}).
        Contact : <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>
          <strong>Demande de maquette gratuite :</strong> nom, nom du commerce, numéro de téléphone, activité et, si
          vous le souhaitez, adresse email. Vous pouvez ensuite préciser, de façon facultative, les pages souhaitées,
          votre style (fond clair ou sombre, couleurs, logo existant), l'échéance et un créneau de rappel.
        </li>
        <li>
          <strong>Formulaire de contact :</strong> nom, adresse email et message.
        </li>
        <li>
          <strong>Échanges directs</strong> (téléphone, WhatsApp, email) : les informations que vous choisissez de
          me transmettre.
        </li>
        <li>
          <strong>Données techniques :</strong> comme tout serveur web, le serveur enregistre l'adresse IP, la date et
          la page demandée, pour assurer la sécurité et le bon fonctionnement du site.
        </li>
      </ul>

      <h2>Pourquoi ces données sont utilisées</h2>
      <ul>
        <li>Répondre à votre demande, vous envoyer la maquette et établir un devis (mesures précontractuelles).</li>
        <li>Assurer le suivi de la relation commerciale et des prestations (exécution du contrat).</li>
        <li>Protéger le site contre les abus et les intrusions (intérêt légitime).</li>
      </ul>
      <p>Vos données ne sont ni vendues ni utilisées à des fins publicitaires.</p>

      <h2>Qui y a accès</h2>
      <p>
        Moi-même, ainsi que des prestataires techniques strictement nécessaires au fonctionnement du site :
      </p>
      <ul>
        <li>{LEGAL.host.name} : hébergement du site et de la base de données ;</li>
        <li>Cloudflare : réseau de diffusion et stockage des images ;</li>
        <li>Resend : envoi des notifications par email lorsqu'un formulaire est soumis.</li>
      </ul>
      <p>
        Certains de ces prestataires sont établis hors de l'Union européenne. Les transferts sont encadrés par les
        garanties prévues par le RGPD (par exemple les clauses contractuelles types).
      </p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Demandes restées sans suite : 3 ans à compter du dernier contact.</li>
        <li>
          Clients : pendant la durée de la relation contractuelle, puis pendant les durées légales de conservation des
          documents comptables.
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation ou l'opposition à
        leur traitement, ainsi que leur portabilité. Écrivez-moi à{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : je réponds dans un délai d'un mois. Si vous estimez que
        vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>).
      </p>

      <h2>Cookies et traceurs</h2>
      <p>
        Ce site n'utilise ni cookie publicitaire ni outil de mesure d'audience. Un cookie technique de connexion est
        utilisé uniquement pour l'espace d'administration, qui n'est pas destiné aux visiteurs.
      </p>
      <p>
        Pendant que vous remplissez le formulaire de contact, un brouillon de votre message peut être conservé
        temporairement dans le stockage de votre navigateur, jusqu'à la fermeture de l'onglet. Il n'est pas transmis
        tant que vous n'envoyez pas le formulaire.
      </p>
      <p>
        Pour s'afficher, le site charge des polices (Google Fonts) et des icônes (Font Awesome, via cdnjs) depuis des
        serveurs tiers : votre adresse IP leur est alors transmise.
      </p>
    </LegalPage>
  );
}
