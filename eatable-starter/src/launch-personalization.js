/** Returns the first name provided at signup. Never guesses a name from an email. */
export function firstNameFor(user) {
  const metadata = user?.user_metadata;
  const raw = metadata?.display_name || metadata?.full_name || '';
  if (typeof raw !== 'string') return '';
  return (raw.trim().split(/\s+/u)[0] || '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 48);
}

/** Uses the visitor's local clock, not the server's timezone. */
export function greetingFor(locale = 'en', user = null, hour = new Date().getHours()) {
  const language = locale === 'it' ? 'it' : 'en';
  const period = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : 'evening';
  const phrases = {
    en: {morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening'},
    it: {morning: 'Buongiorno', afternoon: 'Buon pomeriggio', evening: 'Buonasera'},
  };
  const name = firstNameFor(user);
  return `${phrases[language][period]}${name ? `, ${name}` : ''}!`;
}
