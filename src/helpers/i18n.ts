import { Fluent } from 'npm:@moebius/fluent'
import path from 'node:path';

// Create an instance of @moebius/fluent and configure it
export const fluent = new Fluent();
const __dirname = path.resolve();

// Add "french" translation
fluent.addTranslation({
  // Specify one or more locales supported by your translation:
  locales: "fr",

  // Or the translation files:
  filePath: [
    `${__dirname}/src/i18n/commands.fr.ftl`,
    `${__dirname}/src/i18n/messages.fr.ftl`,
    `${__dirname}/src/i18n/errors.fr.ftl`,
    `${__dirname}/src/i18n/admin.fr.ftl`
  ],
  // All the aspects of Fluent are highly configurable:
  bundleOptions: {
    // Use this option to avoid invisible characters around placeables.
    useIsolating: false,
  },
  isDefault: true
});

// Add "english" translation
fluent.addTranslation({
  // Specify one or more locales supported by your translation:
  locales: "en",

  // Or the translation files:
  filePath: [
    `${__dirname}/src/i18n/commands.en.ftl`,
    `${__dirname}/src/i18n/messages.en.ftl`,
    `${__dirname}/src/i18n/errors.en.ftl`,
    `${__dirname}/src/i18n/admin.en.ftl`
  ],
  // All the aspects of Fluent are highly configurable:
  bundleOptions: {
    // Use this option to avoid invisible characters around placeables.
    useIsolating: false,
  },
});
