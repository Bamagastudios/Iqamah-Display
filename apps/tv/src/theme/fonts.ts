/**
 * Self-hosted webfonts (bundled woff2 via Fontsource — no CDN; the TV's network
 * is unreliable). Importing these registers the @font-face rules.
 *
 *   Fraunces Variable      — display serif, prayer names
 *   Hanken Grotesk Variable — utility grotesque, countdown + all data
 *   Amiri (400/700)         — Arabic, RTL (includes the Arabic subset)
 */
import '@fontsource-variable/fraunces';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
