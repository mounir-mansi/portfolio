import { Link } from "react-router-dom";
import { parseInline, typoFr } from "../../utils/markdown";
import "./BlogContent.css";

// Texte avec mise en forme (gras, italique, code, liens). Les liens commençant par « / » restent dans le site.
function Inline({ jetons }) {
  return jetons.map((j, i) => {
    if (j.type === "gras") return <strong key={i}><Inline jetons={j.enfants} /></strong>;
    if (j.type === "italique") return <em key={i}><Inline jetons={j.enfants} /></em>;
    if (j.type === "code") return <code key={i}>{j.texte}</code>;
    if (j.type === "lien") {
      return j.href.startsWith("/")
        ? <Link key={i} to={j.href}>{j.texte}</Link>
        : <a key={i} href={j.href} target="_blank" rel="noopener noreferrer">{j.texte}</a>;
    }
    return j.texte;
  });
}

const T = ({ texte }) => <Inline jetons={parseInline(typoFr(texte))} />;

// Corps d'un article : le titre de la page est le seul H1, les titres « ### » du texte deviennent des H2, « #### » des H3
export default function BlogContent({ blocs }) {
  return blocs.map((b, i) => {
    if (b.type === "titre") {
      const Tag = `h${Math.min(6, Math.max(2, b.niveau - 1))}`;
      return <Tag key={i}><T texte={b.texte} /></Tag>;
    }
    if (b.type === "paragraphe") return <p key={i}><T texte={b.texte} /></p>;
    if (b.type === "liste") {
      const avecCases = b.items.some((it) => it.coche !== null);
      const Tag = b.ordonnee ? "ol" : "ul";
      return (
        <Tag key={i} className={avecCases ? "blog-checklist" : undefined}>
          {b.items.map((it, j) => (
            <li key={j}>
              {avecCases && <span className="blog-box" aria-hidden="true" />}
              <span><T texte={it.texte} /></span>
            </li>
          ))}
        </Tag>
      );
    }
    if (b.type === "tableau") {
      return (
        <div key={i} className="blog-table" role="region" aria-label="Tableau comparatif" tabIndex={0}>
          <table>
            <thead>
              <tr>{b.entetes.map((h, j) => <th key={j} scope="col"><T texte={h || "Critère"} /></th>)}</tr>
            </thead>
            <tbody>
              {b.lignes.map((ligne, k) => (
                <tr key={k}>
                  {ligne.map((c, j) => (j === 0 ? <th key={j} scope="row"><T texte={c} /></th> : <td key={j}><T texte={c} /></td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  });
}
