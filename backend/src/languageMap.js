// languageMap.js
export const languageMap = {
  javascript: { language: "nodejs", versionIndex: "4" }, // Node.js v18+
  python: { language: "python3", versionIndex: "4" },    // Python 3.10+
  java: { language: "java", versionIndex: "4" },         // Java 17+
  cpp: { language: "cpp17", versionIndex: "0" },         // C++17
};

// Optional: fallback for unlisted languages
export const getJDoodleParams = (lang) => {
  return languageMap[lang] || { language: "nodejs", versionIndex: "4" };
};