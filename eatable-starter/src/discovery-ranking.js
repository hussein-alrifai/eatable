/* Eatable v14 — pure discovery helpers; never expose individual user activity. */
export const discoveryKey = recipe => recipe?.source === 'community'
  ? `community:${recipe.communityId}` : `curated:${recipe?.id || ''}`;

export const metricFor = (recipe, stats) => stats?.[discoveryKey(recipe)] || null;

export function weightedRating(metric) {
  if (!metric || Number(metric.review_count) <= 0) return 0;
  const count = Number(metric.review_count) || 0;
  const average = Number(metric.average_rating) || 0;
  // Bayesian prior: avoid promoting a single five-star review above well-reviewed dishes.
  return (count * average + 5 * 3.5) / (count + 5);
}

export function popularityScore(metric) {
  if (!metric) return 0;
  return (Number(metric.favorite_count) || 0) * 2 + (Number(metric.review_count) || 0);
}

export function sortDiscovery(recipes, sort = 'recommended', stats = {}, lang = 'en') {
  const date = r => {const x = metricFor(r, stats)?.published_at; const n = x ? Date.parse(x) : NaN; return Number.isFinite(n) ? n : 0;};
  const title = r => String(r.name?.[lang] || r.name?.en || r.id || '');
  const tie = (a,b) => title(a).localeCompare(title(b), lang === 'it' ? 'it' : 'en');
  return [...recipes].sort((a,b)=>{
    const x=metricFor(a,stats), y=metricFor(b,stats);
    let diff = 0;
    if(sort === 'top') diff = weightedRating(y) - weightedRating(x) || (Number(y?.review_count)||0) - (Number(x?.review_count)||0);
    else if(sort === 'popular') diff = popularityScore(y) - popularityScore(x) || weightedRating(y) - weightedRating(x);
    else if(sort === 'newest') diff = date(b) - date(a);
    else if(sort === 'quickest') diff = (Number(a.time)||9999) - (Number(b.time)||9999);
    else if(sort === 'recommended') diff = popularityScore(y) - popularityScore(x) || weightedRating(y) - weightedRating(x);
    return diff || tie(a,b);
  });
}

export function filterDiscovery(recipes, opts, stats={}) {
  const q = String(opts.query || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const norm = text => String(text ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return recipes.filter(r=>{
    if(opts.cuisine && opts.cuisine !== 'all' && r.cuisine !== opts.cuisine) return false;
    if(opts.diet === 'vegan' && r.diet !== 'vegan') return false;
    if(opts.diet === 'vegetarian' && !['vegetarian','vegan'].includes(r.diet)) return false;
    if(opts.maxTime && Number(r.time) > Number(opts.maxTime)) return false;
    const m=metricFor(r,stats);
    if(opts.minRating && opts.minRating !== 'all') {
      if(!m || Number(m.review_count) === 0 || Number(m.average_rating) < Number(opts.minRating)) return false;
    }
    if(q){
      const search=[r.name?.en,r.name?.it,r.cuisine,r.category,r.description?.en,r.description?.it,opts.extraText?.(r) || '',
        ...(r.rawIngredients || [])].join(' ');
      if(!norm(search).includes(q)) return false;
    }
    return true;
  });
}

export const editorialLebaneseSlugs = [
  'fattet-hummus','batata-harra','fattoush','hummus','mujaddara',
  'manakish-zaatar','kibbeh','tabbouleh'
];
export function lebaneseSpotlight(recipes,stats={},lang='en',count=4){
  const lebanese=recipes.filter(r=>r.cuisine==='Lebanese');
  const chosen=editorialLebaneseSlugs.map(id=>lebanese.find(r=>r.id===id)).filter(Boolean);
  const remaining=sortDiscovery(lebanese.filter(r=>!chosen.includes(r)),'recommended',stats,lang);
  return [...chosen,...remaining].slice(0,count);
}
