import useMediaQuery from "../../utils/useMediaQuery";
import QuickQuote from "./QuickQuote";
import QuoteModal from "./QuoteModal";

// Grand écran : section du formulaire dans la page (elle apparaît après l'envoi du formulaire du hero).
// Mobile et tablette : plus de section, le formulaire s'ouvre dans une modale.
export default function QuoteSection() {
  const wide = useMediaQuery("(min-width: 1024px)");
  return wide ? <QuickQuote /> : <QuoteModal />;
}
