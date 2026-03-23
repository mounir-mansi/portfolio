import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";
import { apiFetch } from "../../utils/api";
import "./LandingPage.css";

export default function LandingPage() {
  const [sections, setSections] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    apiFetch("/api/sections").then((r) => r.json()).then(setSections).catch(() => {});
    apiFetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
    apiFetch("/api/skills").then((r) => r.json()).then(setSkills).catch(() => {});
  }, []);

  return (
    <div className="landing">
      <Navbar />
      <Hero section={sections.hero} />
      <About section={sections.about} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  );
}
