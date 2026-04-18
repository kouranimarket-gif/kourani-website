// CLE DU PANIER DANS LE LOCALSTORAGE
const CART_KEY = 'kourani-cart';

// ----------------------------
// PANIER (localStorage)
// ----------------------------

// Récupérer le panier
function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error parsing cart from localStorage', e);
    return [];
  }
}

// Sauvegarder le panier
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBasketBadges(cart);
}

// Nombre total d'articles
function getCartCount(cart) {
  const c = cart || getCart();
  return c.reduce((sum, item) => sum + (item.qty || 0), 0);
}

// Mettre à jour toutes les pastilles [data-basket-count]
function updateBasketBadges(cart) {
  const currentCart = cart || getCart();
  const count = getCartCount(currentCart);

  document.querySelectorAll('[data-basket-count]').forEach((el) => {
    if (!el) return;
    el.textContent = count;

    el.classList.remove('basket-pulse');
    void el.offsetWidth; // relance l’animation
    el.classList.add('basket-pulse');
  });
}

// Ajouter un produit au panier
function addToCart(product) {
  const cart = getCart();

  const existing = cart.find(
    (item) =>
      (product.id && item.id === product.id) ||
      (item.name === product.name && item.family === product.family)
  );

  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
  } else {
    cart.push({
      id: product.id || product.name,
      name: product.name,
      family: product.family || '',
      subfamily: product.subfamily || '',
      price: typeof product.price === 'number' ? product.price : 0,
      qty: 1
    });
  }

  saveCart(cart);
  showAddToast(product.name);
}

// Vider complètement le panier (utile après commande)
function clearCart() {
  saveCart([]);
}

// Petite bulle en bas "X added to basket"
function showAddToast(productName) {
  const toast = document.getElementById('addToast');
  if (!toast) return;

  toast.textContent = `“${productName}” added to basket`;
  toast.classList.add('is-visible');

  clearTimeout(showAddToast._timeout);
  showAddToast._timeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 1400);
}

// Initialiser les pastilles au chargement
document.addEventListener('DOMContentLoaded', () => {
  updateBasketBadges();
});


// ----------------------------
// ✅ TRANSITIONS DOUCES (SAFE)
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Respecte le mode "réduction d’animations"
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // injecte un tout petit style
    const style = document.createElement('style');
    style.textContent = `
      body { opacity: 1; transition: opacity 0.18s ease-out; }
      body.is-transitioning { opacity: 0; }

      /* mini feedback bouton add */
      .add-to-basket-btn.is-adding {
        transform: scale(0.96);
        opacity: 0.85;
        transition: transform 0.08s ease-out, opacity 0.08s ease-out;
      }
    `;
    document.head.appendChild(style);

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href) return;

      // ancres internes
      if (href.startsWith('#')) return;

      // nouveaux onglets / externes
      if (a.target === '_blank') return;
      if (/^https?:\/\//i.test(href)) return;

      // option pour désactiver sur un lien si besoin
      if (a.dataset.noTransition === "true") return;

      e.preventDefault();
      document.body.classList.add('is-transitioning');

      setTimeout(() => {
        window.location.href = href;
      }, 160);
    });
  } catch (err) {
    console.warn("Page transition disabled:", err);
  }
});


// ----------------------------
// ✅ BRANCHE AUTOMATIQUE DES BOUTONS "ADD TO BASKET"
// ----------------------------
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-basket-btn");
  if (!btn) return;

  e.preventDefault();

  // petit feedback visuel
  btn.classList.add("is-adding");
  setTimeout(() => btn.classList.remove("is-adding"), 120);

  const product = {
    id: btn.dataset.id || btn.dataset.name,
    name: btn.dataset.name || "Product",
    family: btn.dataset.family || "",
    subfamily: btn.dataset.subfamily || "",
    price: parseFloat(btn.dataset.price) || 0
  };

  addToCart(product);
});

// ---------------------------------------------------
// ⭐ LOYALTY SYSTEM (points + reward vouchers)
// ---------------------------------------------------

// clés localStorage loyalty
const LOYALTY_PROFILE_KEY  = "kourani-loyalty-profile";
const LOYALTY_POINTS_KEY   = "kourani-loyalty-points";
const LOYALTY_ORDERS_KEY   = "kourani-loyalty-orders";
const LOYALTY_VOUCHERS_KEY = "kourani-loyalty-vouchers";

// règle points : 1 point par 20p dépensés (5 pts / £)
function pointsFromAmount(amount) {
  const a = Number(amount) || 0;
  return Math.floor(a / 0.20);
}

function getPoints() {
  return Number(localStorage.getItem(LOYALTY_POINTS_KEY) || 0);
}

function setPoints(points) {
  localStorage.setItem(LOYALTY_POINTS_KEY, String(Math.max(0, points)));
}

function addPointsFromAmount(amount) {
  const earned = pointsFromAmount(amount);
  const newTotal = getPoints() + earned;
  setPoints(newTotal);
  return { earned, total: newTotal };
}

// profil loyalty (inscription)
function saveLoyaltyProfile(profile) {
  localStorage.setItem(LOYALTY_PROFILE_KEY, JSON.stringify(profile || {}));
}

function getLoyaltyProfile() {
  try {
    return JSON.parse(localStorage.getItem(LOYALTY_PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function isLoyaltyMember() {
  const p = getLoyaltyProfile();
  return !!(p && (p.phone || p.email));
}

// compteur de commandes
function getOrderCount() {
  return Number(localStorage.getItem(LOYALTY_ORDERS_KEY) || 0);
}

function setOrderCount(n) {
  localStorage.setItem(LOYALTY_ORDERS_KEY, String(Math.max(0, n)));
}

// vouchers
function getVouchers() {
  try {
    const v = JSON.parse(localStorage.getItem(LOYALTY_VOUCHERS_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveVouchers(v) {
  localStorage.setItem(LOYALTY_VOUCHERS_KEY, JSON.stringify(v || []));
}

function generateVoucherCode(prefix = "KOURANI") {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

function createVoucher(value, reason) {
  const vouchers = getVouchers();
  const code = generateVoucherCode();
  const voucher = {
    code,
    value: Number(value) || 0,
    reason: reason || "Reward",
    used: false,
    createdAt: new Date().toISOString()
  };
  vouchers.push(voucher);
  saveVouchers(vouchers);
  return voucher;
}

function getAvailableVouchers() {
  return getVouchers().filter(v => !v.used);
}

function markVoucherUsed(code) {
  const vouchers = getVouchers();
  const v = vouchers.find(x => x.code === code);
  if (v) v.used = true;
  saveVouchers(vouchers);
}

// bonus 10e commande = £3 off
function incrementOrderCountAndReward() {
  const next = getOrderCount() + 1;
  setOrderCount(next);

  let newVoucher = null;
  if (next % 10 === 0) {
    newVoucher = createVoucher(3, "10 orders reward (£3 off)");
  }
  return { count: next, voucher: newVoucher };
}

// utiliser un voucher (calcule total)
function applyVoucherToTotal(code, total) {
  const t = Number(total) || 0;
  const v = getVouchers().find(x => x.code === code && !x.used);
  if (!v) return { ok: false, newTotal: t, discount: 0 };

  const discount = Math.min(v.value, t);
  return { ok: true, newTotal: t - discount, discount };
}


// ✅ Rend les fonctions accessibles partout (SAFE)
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.clearCart = clearCart;
window.updateBasketBadges = updateBasketBadges;

// Loyalty exports
window.pointsFromAmount = pointsFromAmount;
window.getPoints = getPoints;
window.setPoints = setPoints;
window.addPointsFromAmount = addPointsFromAmount;
window.saveLoyaltyProfile = saveLoyaltyProfile;
window.getLoyaltyProfile = getLoyaltyProfile;
window.isLoyaltyMember = isLoyaltyMember;
window.getOrderCount = getOrderCount;
window.incrementOrderCountAndReward = incrementOrderCountAndReward;
window.getAvailableVouchers = getAvailableVouchers;
window.applyVoucherToTotal = applyVoucherToTotal;
window.markVoucherUsed = markVoucherUsed;
