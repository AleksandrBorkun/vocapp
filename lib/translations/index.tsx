import en from "./en";
import { Path } from "./types";

const translations = {
  en,
};

export const getTranslation = (path: Path) => {
  const defaultLanguage = "en";

  return translations[defaultLanguage][path];
};
