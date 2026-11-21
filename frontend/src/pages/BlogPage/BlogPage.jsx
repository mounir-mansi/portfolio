import { Link, Navigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import usePageTitle from "../../utils/usePageTitle";
import useNoindex from "../../utils/useNoindex";
import useReveal from "../../utils/useReveal";
import useJsonLd from "../../utils/useJsonLd";
import { minutesLecture } from "../../utils/blogContent";
import { typoFr } from "../../utils/markdown";
import { BLOG_ARTICLES, BLOG_INDEX, BLOG_PUBLIC, BLOG_SLUG } from "../../data/blog";
import "./Blog.css";

const SITE = "https://mandev.fr";

// Liste des articles du blog. Les textes existent seulement en français : les autres langues renvoient vers la version française.
export default function BlogPage() {
  const { lang = "fr" } = useParams();
  if (lang !== "fr") return <Navigate to={`/fr/${BLOG_SLUG}`} replace />;
  return <BlogIndex />;
}

function BlogIndex() {
  usePageTitle(BLOG_INDEX.metaTitle);
  useNoindex(!BLOG_PUBLIC);
  useReveal([]);

  const url = `${SITE}/fr/${BLOG_SLUG}`;
  useJsonLd([
    {
      id: "blog-jsonld",
      data: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Blog ManDev Web",
        url,
        description: BLOG_INDEX.description,
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE}/#service` },
        blogPost: BLOG_ARTICLES.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: `${url}/${a.slug}`, datePublished: a.date })),
      },
    },
    {
      id: "blog-breadcrumb-jsonld",
      data: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ManDev Web", item: `${SITE}/fr` },
          { "@type": "ListItem", position: 2, name: "Blog", item: url },
        ],
      },
    },
  ]);

  return (
    <Layout>
      <header className="page-head container blog-index-head">
        {!BLOG_PUBLIC && <p className="blog-preview">Aperçu de relecture : page non publique, non indexée</p>}
        <p className="eyebrow">Blog</p>
        <h1 className="page-title reveal">{BLOG_INDEX.h1}</h1>
        <span className="blog-line" aria-hidden="true" />
        <p className="page-intro reveal" style={{ "--delay": "120ms" }}>{BLOG_INDEX.intro}</p>
      </header>

      <div className="page-body container">
        <ul className="blog-list">
          {BLOG_ARTICLES.map((article, i) => (
            <li key={article.slug} className="blog-card reveal" style={{ "--delay": `${(i % 2) * 80}ms` }}>
              <Link to={`/fr/${BLOG_SLUG}/${article.slug}`}>
                <span className="eyebrow">Article {i + 1} · {minutesLecture(article.slug)} min de lecture</span>
                <h2>{typoFr(article.title)}</h2>
                <p>{typoFr(article.description)}</p>
                <span className="blog-card-cta" aria-hidden="true">Lire l'article →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
