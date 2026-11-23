// Eatable v12 — cooking progress is stored locally on this device only.
// No cloud credentials or recipe data are written to localStorage.
const PREFIX = 'eatable:cooking-progress:v12:';

const copy = {
  en: {
    resume: 'Resume cooking',
    jump: 'Go to step',
    ingredients: 'Ingredients',
    hideIngredients: 'Hide ingredients',
    noQuantities: 'For community recipes, check the submitted amounts before scaling servings.',
    textSize: 'Larger text',
    normalSize: 'Normal text',
    progressHint: 'Progress is saved in this browser until you finish the recipe.',
    finished: 'Recipe completed! Enjoy your meal.',
    localResume: 'Continue from your last step on this device',
    stepOf: 'Step',
    close: 'Close cooking mode',
  },
  it: {
    resume: 'Riprendi la preparazione',
    jump: 'Vai al passaggio',
    ingredients: 'Ingredienti',
    hideIngredients: 'Nascondi ingredienti',
    noQuantities: 'Per le ricette della community, verifica le quantità prima di modificare le porzioni.',
    textSize: 'Testo più grande',
    normalSize: 'Testo normale',
    progressHint: 'I progressi restano salvati in questo browser finché completi la ricetta.',
    finished: 'Ricetta completata! Buon appetito.',
    localResume: 'Continua dall’ultimo passaggio su questo dispositivo',
    stepOf: 'Passaggio',
    close: 'Chiudi la modalità cucina',
  },
};

export function cookText(language, key) {
  return (copy[language] || copy.en)[key] || copy.en[key] || key;
}

export function clampCookingStep(step, stepCount) {
  const count = Number.isInteger(stepCount) ? stepCount : 0;
  if (count < 1) return 0;
  const n = Number(step);
  return Number.isInteger(n) ? Math.min(Math.max(n, 0), count - 1) : 0;
}

export function recipeFingerprint(recipe) {
  const steps = Array.isArray(recipe?.steps) ? recipe.steps : [];
  const input = steps.map(step => typeof step === 'string' ? step : `${step?.en ?? ''}|${step?.it ?? ''}`).join('\u241f');
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${steps.length}-${(hash >>> 0).toString(16)}`;
}

function browserStorage(storage) {
  if (storage !== undefined) return storage;
  try { return window.localStorage; } catch { return null; }
}

function keyFor(recipe) { return PREFIX + String(recipe?.id || ''); }

export function readCookingProgress(recipe, storage) {
  if (!recipe?.id || !Array.isArray(recipe.steps) || recipe.steps.length < 2) return null;
  try {
    const store = browserStorage(storage);
    if (!store) return null;
    const value = JSON.parse(store.getItem(keyFor(recipe)) || 'null');
    if (!value || value.fingerprint !== recipeFingerprint(recipe)) return null;
    if (!Number.isInteger(value.step) || value.step < 1 || value.step >= recipe.steps.length) return null;
    return value.step;
  } catch { return null; }
}

export function writeCookingProgress(recipe, step, storage) {
  if (!recipe?.id || !Array.isArray(recipe.steps) || recipe.steps.length === 0) return;
  try {
    const store = browserStorage(storage);
    if (!store) return;
    store.setItem(keyFor(recipe), JSON.stringify({fingerprint: recipeFingerprint(recipe), step: clampCookingStep(step, recipe.steps.length)}));
  } catch { /* Browsers may block local storage; cooking still works. */ }
}

export function clearCookingProgress(recipe, storage) {
  if (!recipe?.id) return;
  try { browserStorage(storage)?.removeItem(keyFor(recipe)); } catch { /* ignored */ }
}
