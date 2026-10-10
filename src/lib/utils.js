export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

let cachedShouldShow = null;

export function shouldShowWelcome() {
  if (typeof window === 'undefined') return false;
  if (cachedShouldShow !== null) return cachedShouldShow;

  let isHard = false;
  try {
    if (sessionStorage.getItem('hard_reload') === '1') {
      isHard = true;
      sessionStorage.removeItem('hard_reload');
    }
  } catch {}

  let isReload = false;
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      isReload = navEntries[0].type === 'reload';
    } else if (window.performance && window.performance.navigation) {
      isReload = window.performance.navigation.type === 1;
    }
  } catch {}

  let hasVisited = false;
  try {
    hasVisited = sessionStorage.getItem('has_visited') === '1';
  } catch {}

  // 1. Hard reload explicitly requested via Cmd+Shift+R / Ctrl+Shift+R
  if (isHard) {
    try {
      sessionStorage.setItem('has_visited', '1');
    } catch {}
    cachedShouldShow = true;
    return true;
  }

  // 2. Normal reload or previously visited in this session -> DO NOT show welcome
  if (isReload || hasVisited) {
    try {
      sessionStorage.setItem('has_visited', '1');
    } catch {}
    cachedShouldShow = false;
    return false;
  }

  // 3. Initial first visit in this session -> show welcome
  try {
    sessionStorage.setItem('has_visited', '1');
  } catch {}
  cachedShouldShow = true;
  return true;
}
