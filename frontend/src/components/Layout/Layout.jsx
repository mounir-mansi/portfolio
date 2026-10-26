import { useTranslation } from "react-i18next";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackToTop from "../BackToTop/BackToTop";

export default function Layout({ children, noFooter, hideFooterCta }) {
  const { t } = useTranslation();

  const skipToContent = (e) => {
    e.preventDefault();
    document.getElementById("main")?.focus();
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={skipToContent}>{t("nav.skip")}</a>
      <Navbar />
      <main id="main" tabIndex={-1} style={{ paddingTop: "4.5rem" }}>{children}</main>
      {!noFooter && <Footer hideCta={hideFooterCta} />}
      <BackToTop />
    </>
  );
}
