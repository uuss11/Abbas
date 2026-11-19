const E = id => document.getElementById(id);
const LSg = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch {}
  }
};
const kn = value => value.trim().toLowerCase()
  .replace(/[\u064B-\u065F\u0640]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/\s+/g, ' ');
const hh = value => {
  let hash = 5381;
  for (const char of value) hash = ((hash << 5) + hash + char.charCodeAt(0)) | 0;
  return String(hash);
};
const MIG = ['fname', 'tsTot', 'todo', 'habits', 'water', 'moods2', 'period', 'diary', 'event', 'exps', 'shop', 'cards', 'ldate', 'lt'];
let appLoadPromise = null;
let isEntering = false;

E('gs').textContent = 'اكتبي اسمج حتى بياناتج تنحفظ بملف خاص بيج';
E('lgo').onclick = () => {
  LSg.set('lastProfile', '');
  location.reload();
};

function loadApp() {
  if (typeof window.APP === 'function') return Promise.resolve(window.APP);
  if (!appLoadPromise) {
    appLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('app.js', document.baseURI).href;
      script.async = true;
      script.onload = () => {
        if (typeof window.APP === 'function') resolve(window.APP);
        else reject(new Error('app.js loaded without APP'));
      };
      script.onerror = () => {
        appLoadPromise = null;
        reject(new Error('Failed to load app.js'));
      };
      document.head.appendChild(script);
    });
  }
  return appLoadPromise;
}

async function mountApp(name, prefix, fadeGate) {
  const APP = await loadApp();
  APP(name, prefix, LSg, kn);
  document.body.style.overflow = '';
  const gate = E('gate');
  if (fadeGate && gate) {
    gate.classList.add('gx');
    window.setTimeout(() => gate.remove(), 700);
  } else {
    gate?.remove();
  }
}

async function enter() {
  if (isEntering) return;
  const normalizeDigits = value => value
    .replace(/[٠-٩]/g, char => char.charCodeAt(0) - 1632)
    .replace(/[۰-۹]/g, char => char.charCodeAt(0) - 1776);
  const raw = E('gname').value.trim();
  const pin = normalizeDigits(E('gp').value.trim());
  if (!raw) {
    E('ge').textContent = 'اكتبي اسمج';
    return;
  }

  let profiles = {};
  try { profiles = JSON.parse(LSg.get('profiles') || '{}'); } catch {}
  const key = kn(raw);
  const prefix = `p_${hh(key)}:`;
  let profile = profiles[key];
  if (profile) {
    if (profile.h && profile.h !== hh(pin)) {
      E('ge').textContent = 'الرمز السري غلط';
      return;
    }
  } else {
    const firstProfile = Object.keys(profiles).length === 0;
    profile = profiles[key] = { n: raw, h: pin ? hh(pin) : '' };
    LSg.set('profiles', JSON.stringify(profiles));
    if (firstProfile) {
      MIG.forEach(item => {
        const value = LSg.get(item);
        if (value !== null && LSg.get(prefix + item) === null) LSg.set(prefix + item, value);
      });
    }
  }

  isEntering = true;
  const button = E('gbtn');
  button.disabled = true;
  button.textContent = 'جاري التحميل…';
  E('ge').textContent = 'نجهز صفحتج…';
  LSg.set('lastProfile', key);
  try {
    await mountApp(profile.n, prefix, true);
  } catch (error) {
    console.error('تعذر تحميل الموقع:', error);
    E('gate').classList.remove('gx');
    document.body.style.overflow = 'hidden';
    E('ge').textContent = 'تعذر تحميل الموقع. جرّبي مرة ثانية.';
    button.disabled = false;
    button.textContent = 'ادخلي ✨';
  } finally {
    isEntering = false;
  }
}

E('gbtn').addEventListener('click', enter);
['gname', 'gp'].forEach(id => E(id).addEventListener('keydown', event => {
  if (event.key === 'Enter') enter();
}));

(async () => {
  let profiles = {};
  try { profiles = JSON.parse(LSg.get('profiles') || '{}'); } catch {}
  const key = LSg.get('lastProfile');
  if (key && profiles[key]) {
    E('gname').value = profiles[key].n;
    try {
      await mountApp(profiles[key].n, `p_${hh(key)}:`, false);
    } catch (error) {
      console.error('تعذر استعادة ملف المستخدم:', error);
      E('ge').textContent = 'تعذر تحميل الموقع. تحققي من الاتصال ثم أعيدي المحاولة.';
      document.body.style.overflow = 'hidden';
    }
  } else {
    document.body.style.overflow = 'hidden';
  }
})();
