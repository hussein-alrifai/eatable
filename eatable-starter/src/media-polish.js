/** Eatable v26: graceful visual fallbacks for unavailable public recipe images. */
const themes = new Set(['cream', 'green', 'gold', 'ochre', 'spice', 'tomato']);
let registered = false;

export function buildImageFallback(image, doc = document) {
  const kind = image?.dataset?.eatableFallback;
  if (!['card', 'detail', 'hero'].includes(kind)) return null;
  if (kind === 'hero') {
    const container = doc.createElement('div');
    container.className = 'v19-hero-pattern';
    container.setAttribute('aria-hidden', 'true');
    const emblem = doc.createElement('div');
    emblem.className = 'v19-emblem';
    emblem.textContent = 'e';
    const caption = doc.createElement('div');
    caption.className = 'v19-pattern-caption';
    caption.textContent = `Eatable · ${image.dataset.fallbackCaption || ''}`;
    container.append(emblem, caption);
    return container;
  }
  const container = doc.createElement('div');
  const theme = themes.has(image.dataset.fallbackTheme) ? image.dataset.fallbackTheme : 'cream';
  container.className = `${kind === 'detail' ? 'detail-illustration ' : ''}recipe-art ${theme}`;
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${image.dataset.fallbackName || 'Recipe'} illustration`);
  const emoji = doc.createElement('span');
  if (kind === 'card') emoji.className = 'emoji';
  emoji.textContent = image.dataset.fallbackEmoji || '🍽️';
  container.append(emoji);
  return container;
}

export function installImageFallbacks(doc = document) {
  if (registered) return;
  registered = true;
  // `error` does not bubble. Capture handles images added by SPA re-renders.
  doc.addEventListener('error', (event) => {
    const image = event.target;
    if (image?.tagName !== 'IMG' || !image.dataset?.eatableFallback) return;
    const replacement = buildImageFallback(image, doc);
    if (replacement) image.replaceWith(replacement);
  }, true);
}
