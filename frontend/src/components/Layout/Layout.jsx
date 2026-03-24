import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackToTop from "../BackToTop/BackToTop";

export default function Layout({ children, noFooter }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "52px" }}>{children}</main>
      {!noFooter && <Footer />}
      <BackToTop />
    </>
  );
}
