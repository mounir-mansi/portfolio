// Convertisseur Markdown minimal pour les articles du blog (aucune dépendance).
// Blocs : titres (#), paragraphes, listes à puces, listes numérotées, cases à cocher, tableaux.
// En ligne : **gras**, *italique*, `code`, [texte](adresse). Tout le reste est du texte brut.
// Le résultat est une liste de blocs simples (objets) : l'affichage se fait dans components/BlogContent.

const RE_INLINE = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(texte) {
  const jetons = [];
  let dernier = 0;
  for (const m of texte.matchAll(RE_INLINE)) {
    if (m.index > dernier) jetons.push({ type: "texte", texte: texte.slice(dernier, m.index) });
    if (m[1] !== undefined) jetons.push({ type: "gras", enfants: parseInline(m[1]) });
    else if (m[2] !== undefined) jetons.push({ type: "italique", enfants: parseInline(m[2]) });
    else if (m[3] !== undefined) jetons.push({ type: "code", texte: m[3] });
    else jetons.push({ type: "lien", texte: m[4], href: m[5] });
    dernier = m.index + m[0].length;
  }
  if (dernier < texte.length) jetons.push({ type: "texte", texte: texte.slice(dernier) });
  return jetons;
}

const estTitre = (l) => /^#{1,6}\s+\S/.test(l);
const estPuce = (l) => /^[-*]\s+/.test(l);
const estNumero = (l) => /^\d+\.\s+/.test(l);
const estLigneTableau = (l) => /^\|.*\|\s*$/.test(l);
const estSeparateurTableau = (l) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const estRegle = (l) => /^---+\s*$/.test(l);
const decouperLigne = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

// Adresse d'ancre d'un titre (sans accents, en minuscules, tirets) ; un titre répété reçoit -2, -3…
const ancre = (texte) => texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, "et").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";

export function parseMarkdown(md) {
  const lignes = md.replace(/\r\n?/g, "\n").split("\n");
  const utilises = new Map();
  const idUnique = (texte) => {
    const base = ancre(enTexteBrut(texte));
    const n = (utilises.get(base) || 0) + 1;
    utilises.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
  const debutTableau = (i) => estLigneTableau(lignes[i]) && i + 1 < lignes.length && estSeparateurTableau(lignes[i + 1]);
  const blocs = [];
  let i = 0;
  while (i < lignes.length) {
    const l = lignes[i];
    if (!l.trim() || estRegle(l)) { i++; continue; }

    const titre = l.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (titre) { blocs.push({ type: "titre", niveau: titre[1].length, texte: titre[2], id: idUnique(titre[2]) }); i++; continue; }

    if (debutTableau(i)) {
      const entetes = decouperLigne(l);
      const lignesTableau = [];
      i += 2;
      while (i < lignes.length && estLigneTableau(lignes[i])) { lignesTableau.push(decouperLigne(lignes[i])); i++; }
      blocs.push({ type: "tableau", entetes, lignes: lignesTableau });
      continue;
    }

    if (estPuce(l) || estNumero(l)) {
      const ordonnee = estNumero(l);
      const items = [];
      while (i < lignes.length) {
        const cur = lignes[i];
        if (ordonnee ? estNumero(cur) : estPuce(cur)) {
          let texte = cur.replace(ordonnee ? /^\d+\.\s+/ : /^[-*]\s+/, "");
          let coche = null;
          const c = texte.match(/^\[( |x|X)\]\s+(.*)$/);
          if (c) { coche = c[1] !== " "; texte = c[2]; }
          items.push({ texte, coche });
          i++;
        } else if (items.length && /^\s{2,}\S/.test(cur)) {
          items[items.length - 1].texte += ` ${cur.trim()}`; // suite d'un élément sur la ligne suivante
          i++;
        } else break;
      }
      blocs.push({ type: "liste", ordonnee, items });
      continue;
    }

    const morceaux = [];
    while (i < lignes.length && lignes[i].trim() && !estTitre(lignes[i]) && !estPuce(lignes[i]) && !estNumero(lignes[i]) && !estRegle(lignes[i]) && !debutTableau(i)) {
      morceaux.push(lignes[i].trim());
      i++;
    }
    blocs.push({ type: "paragraphe", texte: morceaux.join(" ") });
  }
  return blocs;
}

// Texte sans mise en forme (réponses de la FAQ pour Google)
export function enTexteBrut(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

// Questions/réponses de la section « Questions fréquentes » : paragraphes « **Question ?** Réponse »
export function extraireFaq(blocs) {
  const debut = blocs.findIndex((b) => b.type === "titre" && /questions fréquentes/i.test(b.texte));
  if (debut === -1) return [];
  const faq = [];
  for (const b of blocs.slice(debut + 1)) {
    if (b.type === "titre") break;
    if (b.type !== "paragraphe") continue;
    const m = b.texte.match(/^\*\*([^*]+\?)\*\*\s*(.+)$/);
    if (m) faq.push({ q: m[1].trim(), a: enTexteBrut(m[2]).trim() });
  }
  return faq;
}

// Typographie française : espace insécable avant « : ; ! ? » et autour des guillemets, pour qu'un titre ne coupe pas
// la ligne juste avant un deux-points ou un point d'interrogation
export const typoFr = (texte) => texte.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");

export const compterMots =(md) => md.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
