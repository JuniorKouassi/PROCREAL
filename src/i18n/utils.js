import fr from './fr.json';
import en from './en.json';

export const LOCALES = ['fr', 'en'];
export const DEFAULT_LOCALE = 'fr';

const dictionaries = { fr, en };

export function getLangFromUrl(url) {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : 'fr';
}

export function useTranslations(lang) {
  const dict = dictionaries[lang] ?? dictionaries[DEFAULT_LOCALE];
  return function t(key) {
    return key.split('.').reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : key), dict);
  };
}

/** Prefix a canonical (FR) path with /en when needed. Path must start with "/". */
export function localizePath(path, lang) {
  if (lang !== 'en') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

/** Swap the current pathname to the other locale, preserving the rest of the path. */
export function switchLocalePath(pathname, targetLang) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'en') segments.shift();
  const rest = segments.join('/');
  return localizePath(rest ? `/${rest}` : '/', targetLang);
}

/** Pick the localized value of a content-collection field, falling back to FR. */
export function localizedField(entry, field, lang) {
  if (lang === 'en' && entry[`${field}_en`] !== undefined) return entry[`${field}_en`];
  return entry[field];
}
