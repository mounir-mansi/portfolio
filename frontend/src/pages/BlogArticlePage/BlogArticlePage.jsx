import { useEffect, useMemo, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import BlogContent from "../../components/BlogContent/BlogContent";
import NotFoundPage from "../NotFoundPage/NotFoundPage";
import usePageTitle from "../../utils/usePageTitle";
import useNoindex from "../../utils/useNoindex";
import useReveal from "../../utils/useReveal";
import useJsonLd from "../../utils/useJsonLd";
import { corpsArticle, minutesLecture } from "../../utils/blogContent";
import { extraireFaq, parseMarkdown, typoFr } from "../../utils/markdown";
import { faqJsonLd } from "../../utils/ssrHead";
import { BLOG_ARTICLES, BLOG_PUBLIC, BLOG_SLUG, blogArticle, dateLongue } from "../../data/blog";
import "../BlogPage/Blog.css";

const SITE = "https://mandev.fr";

// Fine barre sous la navigation : avancement de la lecture (transform seulement, mise à jour au scroll)
function ProgressionLecture() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const maj = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        ref.current?.style.setProperty("--p", max > 0 ? (doc.scrollTop / max).toFixed(4) : "0");
      });
    };
    window.addEventListener("scroll", maj, { passive: true });
    maj();
    return () => {
      window.removeEventListener("scroll", maj);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="blog-progress" aria-hidden="true"><span ref={ref} /></div>;
}

// Page d'un article. Les textes existent seulement en français : les autres langues renvoient vers la version française.
export default function BlogArticlePage() {
  const { lang = "fr", slug } = useParams();
  if (lang !== "fr") return <Navigate to={`/fr/${BLOG_SLUG}/${slug}`} replace />;
  const article = blogArticle(slug);
  if (!article) return <NotFoundPage />;
  return <ArticleContent article={article} />;
}

function ArticleContent({ article }) {
  const blocs = useMemo(() => parseMarkdown(corpsArticle(article.slug) || ""), [article.slug]);
  const faq = useMemo(() => extraireFaq(blocs), [blocs]);
  const url = `${SITE}/fr/${BLOG_SLUG}/${article.slug}`;

  usePageTitle(article.metaTitle);
  useNoindex(!BLOG_PUBLIC);
  useReveal([article.slug]);

  useJsonLd([
    {
      id: "blog-article-jsonld",
      data: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.date,
        inLanguage: "fr-FR",
        keywords: article.keyword,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "ManDev Web", url: SITE },
        publisher: { "@id": `${SITE}/#service` },
      },
    },
    {
      id: "blog-breadcrumb-jsonld",
      data: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ManDev Web", item: `${SITE}/fr` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/fr/${BLOG_SLUG}` },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
    },
    ...(faq.length ? [{ id: "blog-faq-jsonld", data: faqJsonLd(faq) }] : []),
  ]);

  // Trois autres articles à lire ensuite (les suivants dans la liste)
  const index = BLOG_ARTICLES.findIndex((a) => a.slug === article.slug);
  const lies = [1, 2, 3].map((n) => BLOG_ARTICLES[(index + n) % BLOG_ARTICLES.length]);

  return (
    <Layout>
      <ProgressionLecture />
      <article>
        <header className="page-head container blog-head">
          {!BLOG_PUBLIC && <p className="blog-preview">Aperçu de relecture : page non publique, non indexée</p>}
          <nav className="blog-crumbs" aria-label="Fil d'Ariane">
            <Link to="/fr">Accueil</Link> <span aria-hidden="true">/</span> <Link to={`/fr/${BLOG_SLUG}`}>Blog</Link>
          </nav>
          <h1 className="page-title reveal">{typoFr(article.title)}</h1>
          <p className="eyebrow blog-meta reveal" style={{ "--delay": "80ms" }}>
            {dateLongue(article.date)} · {minutesLecture(article.slug)} min de lecture
          </p>
        </header>

        <div className="container blog-layout">
          <div className="blog-body">
            <BlogContent blocs={blocs} />
          </div>
        </div>
      </article>

      <section className="block block--raised" aria-labelledby="blog-lies-titre">
        <div className="container">
          <h2 id="blog-lies-titre" className="blog-related-title">À lire aussi</h2>
          <ul className="blog-list blog-list--trois">
            {lies.map((a) => (
              <li key={a.slug} className="blog-card reveal">
                <Link to={`/fr/${BLOG_SLUG}/${a.slug}`}>
                  <span className="eyebrow">{minutesLecture(a.slug)} min de lecture</span>
                  <h3>{typoFr(a.title)}</h3>
                  <span className="blog-card-cta" aria-hidden="true">Lire l'article →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
