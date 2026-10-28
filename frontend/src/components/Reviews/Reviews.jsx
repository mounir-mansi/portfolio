import { useTranslation } from "react-i18next";
import { REVIEWS } from "../../data/reviews";
import "./Reviews.css";

// Avis clients réels (voir src/data/reviews.js). N'affiche rien tant qu'il n'y en a pas.
export default function Reviews() {
  const { t } = useTranslation();
  if (REVIEWS.length === 0) return null;

  return (
    <section id="avis" className="block reviews" aria-labelledby="reviews-title">
      <div className="container">
        <h2 id="reviews-title" className="block-title reveal">{t("reviews.title")}</h2>
        <ul className="reviews-list">
          {REVIEWS.map((review, i) => (
            <li key={`${review.author}-${i}`} className="reviews-item reveal" style={{ "--delay": `${i * 90}ms` }}>
              <figure>
                <blockquote>
                  <p>{review.text}</p>
                </blockquote>
                <figcaption>
                  {review.author}
                  {review.source && (
                    <>
                      {" · "}
                      {review.url ? (
                        <a href={review.url} target="_blank" rel="noopener noreferrer">{review.source}</a>
                      ) : (
                        review.source
                      )}
                    </>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
