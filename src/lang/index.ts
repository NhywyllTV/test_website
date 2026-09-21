import { de } from "./de";
import { en } from "./en";
import type { Translation } from "./i18n-types";

export interface LanguageInfo {
    /** ISO-639-1-Code, z. B. "de". Wird auch für html[lang] und die Flagge genutzt. */
    code: string;
    /** Name der Sprache in ihr selbst ("Deutsch", nicht "German"). */
    name: string;
    strings: Translation;
}

/**
 * Register aller verfügbaren Sprachen. Eine neue Sprache hinzufügen:
 *   1. src/lang/<code>.ts anlegen (Typ CompleteTranslation, alle Schlüssel aus en.ts)
 *   2. hier einen Eintrag ergänzen
 *   3. Flagge unter public/images/flags/<code>.svg ablegen
 * Sprachmenü, Browser-Erkennung und `npm run audit:i18n` ziehen automatisch mit.
 */
export const languages: LanguageInfo[] = [
    { code: "en", name: "English", strings: en },
    { code: "de", name: "Deutsch", strings: de },
];

/** Fallback, wenn weder die gespeicherte noch eine Browsersprache verfügbar ist. */
export const DEFAULT_LANGUAGE = "en";

export const translations: { [code: string]: Translation } = Object.fromEntries(
    languages.map((l) => [l.code, l.strings]),
);

export const isSupportedLanguage = (code: string | null | undefined): code is string =>
    !!code && Object.prototype.hasOwnProperty.call(translations, code);
