import {
  PHOTO,
  HERO_WORDS,
  HERO_COLS,
  HERO_SET,
  WORKS_TABS,
  APPS,
  LAB,
  STACK,
  CERT,
  SHOW_CERTS,
  GH_USER,
  GH_COL,
  GH_R,
  GH_SNAP,
  CN_TEXT,
  CN_SUB,
  SCHEDULE_URL,
  CN_URL,
} from '../data/portfolioData';

const STORAGE_KEY = 'ralph_portfolio_admin_data';

export function getDefaultPortfolioData() {
  return {
    home: {
      name: 'Ralph Dainiell Gonzaga',
      heroWords: [...HERO_WORDS],
      heroCols: HERO_COLS,
      heroSet: HERO_SET,
      photo: PHOTO,
    },
    works: {
      tabs: [...WORKS_TABS],
      apps: JSON.parse(JSON.stringify(APPS)),
      lab: JSON.parse(JSON.stringify(LAB)),
    },
    certs: {
      list: JSON.parse(JSON.stringify(CERT)),
      showCount: SHOW_CERTS,
    },
    stack: {
      items: JSON.parse(JSON.stringify(STACK)),
      ghUser: GH_USER,
      ghCol: [...GH_COL],
      ghR: [...GH_R],
      ghSnap: JSON.parse(JSON.stringify(GH_SNAP)),
    },
    connect: {
      text: [...CN_TEXT],
      sub: CN_SUB,
      scheduleUrl: SCHEDULE_URL,
      url: { ...CN_URL },
    },
  };
}

export function loadPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPortfolioData();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultPortfolioData();

    // Deep merge defaults with stored data to ensure completeness
    return {
      home: { ...defaults.home, ...(parsed.home || {}) },
      works: {
        ...defaults.works,
        ...(parsed.works || {}),
        apps: parsed.works?.apps || defaults.works.apps,
        lab: { ...defaults.works.lab, ...(parsed.works?.lab || {}) },
      },
      certs: {
        ...defaults.certs,
        ...(parsed.certs || {}),
        list: parsed.certs?.list || defaults.certs.list,
      },
      stack: {
        ...defaults.stack,
        ...(parsed.stack || {}),
        items: parsed.stack?.items || defaults.stack.items,
      },
      connect: {
        ...defaults.connect,
        ...(parsed.connect || {}),
        url: { ...defaults.connect.url, ...(parsed.connect?.url || {}) },
      },
    };
  } catch (err) {
    console.warn('Failed to load portfolio data from localStorage:', err);
    return getDefaultPortfolioData();
  }
}

export function savePortfolioData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save portfolio data to localStorage:', err);
    return false;
  }
}

export function resetPortfolioData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return getDefaultPortfolioData();
  } catch (err) {
    console.error('Failed to reset portfolio data:', err);
    return getDefaultPortfolioData();
  }
}
