import type { en } from "./en";

export interface Translation {
    [key: string]: string;
}

/** Alle Schlüssel der Referenzsprache Englisch. */
export type TranslationKey = keyof typeof en;

/**
 * Typ für jede weitere Sprache: Der Build schlägt fehl, wenn gegenüber en.ts
 * ein Schlüssel fehlt oder einer zu viel ist - statt dass die Seite später
 * rohe Schlüssel anzeigt.
 */
export type CompleteTranslation = Record<TranslationKey, string>;
