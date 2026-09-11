import { APP_PREFIXES, DEFAULT_LOCALE, LOCALE_COOKIE } from "./i18n";

// ── Scripts that run before first paint ──────────────────────────────
// Theme and text direction have to be right before the page is drawn, or it
// visibly flips. So these run as inline <script>s, and cannot import anything.
//
// Two rules, both learned the hard way:
//  1. String.raw, so every backslash reaches the browser exactly as written.
//     The theme script once lost one (/\/$/ became //$/, which starts a
//     comment) and threw a SyntaxError on every page for every visitor.
//  2. The app's path list comes from APP_PREFIXES, the same list lib/theme.ts
//     and lib/i18n.ts use, rather than being pasted in by hand to drift.
const isApp = String.raw`var isApp=function(p){return ${JSON.stringify(APP_PREFIXES)}.some(function(a){var b=a.charAt(a.length-1)==='/'?a.slice(0,-1):a;return p===b||p.indexOf(a)===0})};`;

/** A saved choice wins; otherwise the app opens light and marketing dark. */
export const THEME_SCRIPT = String.raw`(function(){try{${isApp}var t=localStorage.getItem('theme');var dark=t?t==='dark':!isApp(location.pathname);document.documentElement.classList.toggle('dark',dark)}catch(e){}})();`;

/** The URL decides on /ar and /de; the app follows the cookie; marketing is English. */
export const LOCALE_SCRIPT = String.raw`(function(){try{${isApp}var p=location.pathname,l;if(/^\/ar(\/|$)/.test(p))l='ar';else if(/^\/de(\/|$)/.test(p))l='de';else if(isApp(p)){var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]+)/);l=m?m[1]:'${DEFAULT_LOCALE}'}else l='en';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}catch(e){}})();`;
