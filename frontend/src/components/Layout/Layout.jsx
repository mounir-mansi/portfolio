import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import BackToTop from "../BackToTop/BackToTop";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "60px" }}>{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
