export const getStoreLanguage = () => {
  return localStorage.getItem("storeLanguage") || "en";
};

export const setStoreLanguage = (language) => {
  localStorage.setItem(
    "storeLanguage",
    language
  );

  document.documentElement.lang = language;

  document.documentElement.dir =
    language === "ar" ? "rtl" : "ltr";

  window.dispatchEvent(
    new CustomEvent("storeLanguageChanged", {
      detail: language,
    })
  );
};