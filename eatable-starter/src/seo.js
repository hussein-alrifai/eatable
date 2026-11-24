// Eatable v25 — public SEO metadata for the existing single-page application.
// Metadata here runs client-side. Social crawlers and some search engines may need
// pre-rendered / server-rendered HTML for individual recipe previews.
const SITE_ORIGIN = 'https://cookwitheatable.com';
const STATIC_PUBLIC = new Set(['', 'cook', 'recipes', 'lebanese', 'community', 'about', 'contact']);
const PRIVATE_ROOTS = new Set([
  'account', 'for-you', 'collections', 'my-kitchen', 'shopping-list',
  'submit', 'edit', 'my-recipes', 'report', 'admin', 'admin-index',
  'admin-quality', 'admin-import', 'admin-launch', 'admin-coverage',
  'admin-curated', 'privacy', 'terms', 'cookies'
]);
const labels = {
  en: {
    home: ['Cook With What You Have | Eatable', 'Find recipes from ingredients you already have. Explore Lebanese food traditions and recipes from around the world.'],
    cook: ['What Can I Cook? | Eatable', 'Choose ingredients from your kitchen and discover recipes you can cook with what you have.'],
    recipes: ['Explore Recipes | Eatable', 'Explore dishes from around the world, discover new ingredients and find your next recipe.'],
    lebanese: ['Lebanese Recipes & Food Traditions | Eatable', 'Discover Lebanese dishes, mezze, ingredients and home cooking traditions on Eatable.'],
    community: ['Community Recipes | Eatable', 'Explore recipes contributed by the Eatable cooking community.'],
    about: ['About Eatable | Eatable', 'Learn about Eatable, a personal cooking project celebrating everyday meals and Lebanese culinary roots.'],
    contact: ['Contact Eatable | Eatable', 'Get in touch with Eatable and learn how to report a problem or share feedback.']
  },
  it: {
    home: ['Cucina con ciò che hai | Eatable', 'Trova ricette con gli ingredienti che hai già. Esplora la cucina libanese e piatti da tutto il mondo.'],
    cook: ['Cosa posso cucinare? | Eatable', 'Seleziona gli ingredienti che hai in cucina e scopri quali ricette puoi preparare.'],
    recipes: ['Esplora le ricette | Eatable', 'Scopri piatti da tutto il mondo, nuovi ingredienti e idee per il tuo prossimo pasto.'],
    lebanese: ['Ricette e tradizioni libanesi | Eatable', 'Scopri piatti libanesi, mezze, ingredienti e tradizioni della cucina di casa.'],
    community: ['Ricette della community | Eatable', 'Esplora le ricette condivise dalla community di Eatable.'],
    about: ['Chi siamo | Eatable', 'Scopri Eatable, un progetto personale dedicato alla cucina di tutti i giorni e alle radici culinarie libanesi.'],
    contact: ['Contatta Eatable | Eatable', 'Contatta Eatable, segnala un problema o invia un suggerimento.']
  }
};
function meta(name, value, property = false) {
  const attr = property ? 'property' : 'name';
  let item = document.querySelector(`meta[${attr}="${name}"]`);
  if (!item) {
    item = document.createElement('meta');
    item.setAttribute(attr, name);
    document.head.appendChild(item);
  }
  item.content = value;
}
function link(rel, href, hreflang) {
  const item = document.createElement('link');
  item.rel = rel;
  item.href = href;
  if (hreflang) item.hreflang = hreflang;
  item.dataset.eatableSeo = 'true';
  document.head.appendChild(item);
}
export function updateSeo({lang, route, recipe = null, publicDescription = ''}) {
  const selectedLang = lang === 'it' ? 'it' : 'en';
  const parts = Array.isArray(route) ? route : [];
  const section = parts[0] || '';
  const isRecipe = (section === 'recipes' || section === 'community') && parts.length === 2;
  const staticPublic = STATIC_PUBLIC.has(section) && parts.length <= 1;
  const isPublic = staticPublic || (isRecipe && Boolean(recipe));
  const noindex = PRIVATE_ROOTS.has(section) || !isPublic;
  const fallback = labels[selectedLang][section || 'home'] || labels[selectedLang].home;
  const recipeName = recipe?.name?.[selectedLang] || recipe?.name?.en || '';
  const recipeDesc = recipe?.description?.[selectedLang] || recipe?.description?.en || '';
  // Preserve the app's own titles and descriptions for legal, account and other noindex pages.
  const title = !isPublic ? document.title : (isRecipe && recipeName ? `${recipeName} | Eatable` : fallback[0]);
  const description = !isPublic ? (document.querySelector('meta[name="description"]')?.content || fallback[1])
    : (isRecipe && recipeDesc ? recipeDesc : (['about', 'contact'].includes(section) && publicDescription ? publicDescription : fallback[1]));
  const pathname = window.location.pathname.replace(/\/+$/, '') || `/${selectedLang}`;
  const canonical = SITE_ORIGIN + pathname;
  document.title = title;
  meta('description', description);
  meta('robots', noindex ? 'noindex,follow' : 'index,follow');
  meta('og:site_name', 'Eatable', true);
  meta('og:title', title, true);
  meta('og:description', description, true);
  meta('og:type', 'website', true);
  meta('og:url', canonical, true);
  meta('og:locale', selectedLang === 'it' ? 'it_IT' : 'en_US', true);
  meta('twitter:card', 'summary');
  meta('twitter:title', title);
  meta('twitter:description', description);
  document.querySelectorAll('link[data-eatable-seo="true"]').forEach(el => el.remove());
  if (!noindex) {
    link('canonical', canonical);
    // Only declare alternate languages for routes that have an actual bilingual page.
    const hasAlternates = staticPublic || (isRecipe && recipe?.name?.en && recipe?.name?.it);
    if (hasAlternates) {
      const suffix = pathname.replace(/^\/(en|it)/, '');
      link('alternate', `${SITE_ORIGIN}/en${suffix}`, 'en');
      link('alternate', `${SITE_ORIGIN}/it${suffix}`, 'it');
      if (!suffix) link('alternate', `${SITE_ORIGIN}/en`, 'x-default');
    }
  }
}
