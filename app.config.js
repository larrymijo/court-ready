// Everything lives in app.json. This file only adds the URL prefix for the hosted web build:
// GitHub Pages serves the repo at https://<user>.github.io/<repo>/, so CI sets
// EXPO_PUBLIC_BASE_URL=/<repo> before `expo export --platform web`. Native builds and
// `npx expo start` are unaffected.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  if (!baseUrl) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
