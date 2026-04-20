// ============================================================
// RED EYE CAFÉ — script.js  (shared across all pages)
// ============================================================

// ── Cart State ───────────────────────────────────────────────
let cart = JSON.parse(sessionStorage.getItem('redeye_cart') || '[]');
let currentUser = JSON.parse(sessionStorage.getItem('redeye_user') || 'null');
function saveCart() { sessionStorage.setItem('redeye_cart', JSON.stringify(cart)); }

// ── DEFAULT Menu Data ────────────────────────────────────────
const DEFAULT_MENU = [
  { name: 'Red Eye Espresso',    icon: '☕', price: 320, cat: 'coffee',     desc: 'Double-shot with silky crema. Bold, dark, intense.',            img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80' },
  { name: 'Dark Velvet Latte',   icon: '🌙', price: 380, cat: 'coffee',     desc: 'Charcoal-infused latte with oat milk & vanilla.',               img: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=600&q=80' },
  { name: 'Midnight Mocha',      icon: '🍫', price: 360, cat: 'coffee',     desc: 'Rich dark chocolate meets our finest espresso.',                img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80' },
  { name: 'Classic Cappuccino',  icon: '🫗', price: 290, cat: 'coffee',     desc: 'Perfectly balanced espresso, steamed milk & foam.',             img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80' },
  { name: 'Hazelnut Macchiato',  icon: '🌰', price: 340, cat: 'coffee',     desc: 'Espresso marked with hazelnut cream foam.',                     img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80' },
  { name: 'Turkish Black',       icon: '🖤', price: 250, cat: 'coffee',     desc: 'Unfiltered strength. Traditional, bold, ancient.',              img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' },
  { name: 'Cold Brew Tonic',     icon: '🧊', price: 350, cat: 'colddrinks', desc: '18-hour cold brew over fever-tree tonic.',                      img: 'https://images.unsplash.com/photo-1461784180009-22c55e3fce52?w=600&q=80' },
  { name: 'Iced Caramel Latte',  icon: '🧋', price: 370, cat: 'colddrinks', desc: 'Espresso, milk, salted caramel, ice.',                          img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80' },
  { name: 'Rose Cold Brew',      icon: '🌹', price: 390, cat: 'colddrinks', desc: 'Cold brew infused with rose petals & cardamom.',                img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80' },
  { name: 'Avocado Toast',       icon: '🥑', price: 320, cat: 'food',       desc: 'Sourdough, smashed avo, poached egg & chilli.',                 img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80' },
  { name: 'Croque Monsieur',     icon: '🥪', price: 380, cat: 'food',       desc: 'Ham & gruyere on toasted brioche.',                             img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80' },
  { name: 'Mushroom Bruschetta', icon: '🍄', price: 290, cat: 'food',       desc: 'Wild mushrooms, garlic, thyme on ciabatta.',                   img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80' },
  { name: 'Crimson Cheesecake',  icon: '🍰', price: 280, cat: 'desserts',   desc: 'Red velvet cheesecake with berry coulis.',                      img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80' },
  { name: 'Tiramisu Noir',       icon: '🍮', price: 310, cat: 'desserts',   desc: 'Dark espresso tiramisu with cocoa dust.',                       img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80' },
  { name: 'Lava Cake',           icon: '🫕', price: 340, cat: 'desserts',   desc: 'Molten dark chocolate, vanilla ice cream.',                     img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80' },
];

// ── LIVE Menu — reads admin changes from localStorage ────────
function getLiveMenu() {
  try {
    const saved = localStorage.getItem('redeye_menu');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_MENU));
}

// menuItems kept for backward compat (used by admin.html seed)
const menuItems = DEFAULT_MENU;

// ── CART FUNCTIONS ───────────────────────────────────────────
function addToCart(name, icon, price) {
  if (!currentUser) {
    sessionStorage.setItem('redeye_pending', JSON.stringify({ name, icon, price }));
    window.location.href = 'auth.html';
    return;
  }
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty++; } else { cart.push({ name, icon, price, qty: 1 }); }
  saveCart();
  updateCartUI();
  showToast(`${icon} ${name} added to cart!`);
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function updateCartUI() {
  const badge   = document.getElementById('cart-badge');
  const list    = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (badge) { badge.style.display = totalQty > 0 ? 'flex' : 'none'; badge.textContent = totalQty; }
  if (totalEl) totalEl.textContent = '₹' + totalPrice;
  if (list) {
    if (cart.length === 0) {
      list.innerHTML = `<div class="empty-cart"><div class="empty-icon">🛒</div><p>Your cart is empty.<br>Browse our menu to add items.</p></div>`;
    } else {
      list.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <span class="cart-item-icon">${item.icon}</span>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price * item.qty}</div>
          </div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }
}

function placeOrder() {
  if (!currentUser) { window.location.href = 'auth.html'; return; }
  if (cart.length === 0) { showToast('Add items to cart first!'); return; }
  showAddressModal();
}

function showAddressModal() {
  const old = document.getElementById('address-modal');
  if (old) old.remove();
  const total = cart.reduce((s,i) => s + i.price*i.qty, 0);
  const modal = document.createElement('div');
  modal.id = 'address-modal';
  modal.style.cssText = `position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:1rem;`;
  modal.innerHTML = `
    <div style="background:#110d0a;border:1px solid #2a1f18;border-radius:4px;width:480px;max-width:100%;padding:2rem;position:relative;animation:scaleIn 0.3s ease;">
      <button onclick="document.getElementById('address-modal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:#8a7a6a;font-size:1.3rem;cursor:pointer;">✕</button>
      <div style="font-family:'Playfair Display',serif;font-size:1.3rem;color:#f5ede0;margin-bottom:0.3rem;">📍 Delivery Details</div>
      <div style="color:#8a7a6a;font-size:0.82rem;margin-bottom:1.8rem;">Where should we deliver your order?</div>
      <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;">
        <button id="type-delivery" onclick="setOrderType('delivery')" style="flex:1;padding:0.6rem;background:#c0392b;border:1px solid #c0392b;color:#f5ede0;border-radius:2px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;">🛵 Delivery</button>
        <button id="type-pickup" onclick="setOrderType('pickup')" style="flex:1;padding:0.6rem;background:#1a1410;border:1px solid #2a1f18;color:#8a7a6a;border-radius:2px;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;">🏠 Self Pickup</button>
      </div>
      <div id="delivery-fields">
        <div style="margin-bottom:1rem;"><label style="display:block;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.4rem;">Full Address</label><input id="addr-line" type="text" placeholder="House/Flat No., Street, Area" style="width:100%;background:#0a0705;border:1px solid #2a1f18;color:#e8ddd0;padding:0.7rem 0.9rem;font-family:'Jost',sans-serif;font-size:0.88rem;border-radius:2px;outline:none;" onfocus="this.style.borderColor='#d4a853'" onblur="this.style.borderColor='#2a1f18'"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1rem;">
          <div><label style="display:block;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.4rem;">City</label><input id="addr-city" type="text" placeholder="Pune" style="width:100%;background:#0a0705;border:1px solid #2a1f18;color:#e8ddd0;padding:0.7rem 0.9rem;font-family:'Jost',sans-serif;font-size:0.88rem;border-radius:2px;outline:none;" onfocus="this.style.borderColor='#d4a853'" onblur="this.style.borderColor='#2a1f18'"></div>
          <div><label style="display:block;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.4rem;">Pincode</label><input id="addr-pin" type="text" placeholder="411001" maxlength="6" style="width:100%;background:#0a0705;border:1px solid #2a1f18;color:#e8ddd0;padding:0.7rem 0.9rem;font-family:'Jost',sans-serif;font-size:0.88rem;border-radius:2px;outline:none;" onfocus="this.style.borderColor='#d4a853'" onblur="this.style.borderColor='#2a1f18'"></div>
        </div>
        <div style="margin-bottom:1.5rem;"><label style="display:block;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.4rem;">Landmark (Optional)</label><input id="addr-landmark" type="text" placeholder="Near XYZ, opposite ABC..." style="width:100%;background:#0a0705;border:1px solid #2a1f18;color:#e8ddd0;padding:0.7rem 0.9rem;font-family:'Jost',sans-serif;font-size:0.88rem;border-radius:2px;outline:none;" onfocus="this.style.borderColor='#d4a853'" onblur="this.style.borderColor='#2a1f18'"></div>
      </div>
      <div id="pickup-msg" style="display:none;background:#1a1410;border:1px solid #2a1f18;border-radius:4px;padding:1rem;margin-bottom:1.5rem;text-align:center;color:#8a7a6a;font-size:0.88rem;line-height:1.7;">
        📍 <strong style="color:#f5ede0;">Red Eye Café</strong><br>12, Red Eye Lane, Koregaon Park<br>Pune, Maharashtra 411001<br><span style="color:#d4a853;font-size:0.8rem;">Ready in ~15 mins</span>
      </div>
      <div style="background:#1a1410;border:1px solid #2a1f18;border-radius:4px;padding:1rem;margin-bottom:1.5rem;">
        <div style="font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#d4a853;margin-bottom:0.8rem;">Order Summary</div>
        ${cart.map(i=>`<div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#8a7a6a;margin-bottom:0.4rem;"><span>${i.icon} ${i.name} × ${i.qty}</span><span style="color:#e8ddd0;">₹${i.price*i.qty}</span></div>`).join('')}
        <div style="display:flex;justify-content:space-between;border-top:1px solid #2a1f18;margin-top:0.8rem;padding-top:0.8rem;font-size:1rem;"><strong style="color:#f5ede0;">Total</strong><strong style="color:#d4a853;">₹${total}</strong></div>
      </div>
      <button onclick="confirmOrder()" style="width:100%;padding:0.85rem;background:#d4a853;color:#0a0705;border:none;border-radius:2px;font-family:'Jost',sans-serif;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;cursor:pointer;" onmouseover="this.style.background='#f0c678'" onmouseout="this.style.background='#d4a853'">Confirm Order →</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

let orderType = 'delivery';
function setOrderType(type) {
  orderType = type;
  const dBtn=document.getElementById('type-delivery'), pBtn=document.getElementById('type-pickup');
  const dFields=document.getElementById('delivery-fields'), pMsg=document.getElementById('pickup-msg');
  if (type === 'delivery') {
    dBtn.style.cssText += 'background:#c0392b;border-color:#c0392b;color:#f5ede0;';
    pBtn.style.cssText += 'background:#1a1410;border-color:#2a1f18;color:#8a7a6a;';
    dFields.style.display = 'block'; pMsg.style.display = 'none';
  } else {
    pBtn.style.cssText += 'background:#c0392b;border-color:#c0392b;color:#f5ede0;';
    dBtn.style.cssText += 'background:#1a1410;border-color:#2a1f18;color:#8a7a6a;';
    dFields.style.display = 'none'; pMsg.style.display = 'block';
  }
}

async function confirmOrder() {
  let deliveryAddress = '';
  if (orderType === 'delivery') {
    const line = document.getElementById('addr-line').value.trim();
    const city = document.getElementById('addr-city').value.trim();
    const pin  = document.getElementById('addr-pin').value.trim();
    const landmark = document.getElementById('addr-landmark').value.trim();
    if (!line || !city || !pin) { showToast('Please fill address, city and pincode'); return; }
    if (!/^\d{6}$/.test(pin))   { showToast('Enter a valid 6-digit pincode'); return; }
    deliveryAddress = `${line}, ${city} - ${pin}${landmark ? ' (Near: ' + landmark + ')' : ''}`;
  } else {
    deliveryAddress = 'Self Pickup — Red Eye Café, 12 Red Eye Lane, Koregaon Park, Pune';
  }
  const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_email: currentUser.email, items: cart, total: cart.reduce((s,i) => s+i.price*i.qty, 0), delivery_address: deliveryAddress, order_type: orderType }) });
  const data = await res.json();
  if (data.success) {
    const orderedItems = [...cart];
    const orderTotal   = cart.reduce((s,i) => s+i.price*i.qty, 0);
    const orderAddr    = deliveryAddress;
    const orderMode    = orderType;
    cart = []; saveCart(); updateCartUI();
    document.getElementById('address-modal').remove();
    const cs = document.getElementById('cart-sidebar'); if (cs) cs.classList.remove('open');
    showOrderReceipt({ user: currentUser, items: orderedItems, total: orderTotal, address: orderAddr, type: orderMode });
  } else { showToast(data.message); }
}


// ── ORDER RECEIPT POPUP (shown right after placing order) ────
function showOrderReceipt({ user, items, total, address, type }) {
  const old = document.getElementById('order-receipt-popup');
  if (old) old.remove();
  const subtotal = items.reduce((s,i) => s+i.price*i.qty, 0);
  const tax      = Math.round(subtotal * 0.05);
  const typeText = type === 'pickup' ? '🏠 Self Pickup' : '🛵 Home Delivery';
  const now      = new Date().toLocaleString('en-IN', {weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const oid      = String(Date.now()).slice(-6).toUpperCase();
  const itemRows = items.map(i => `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0;border-bottom:1px solid rgba(42,31,24,0.4);">
    <span style="font-size:1rem;width:22px;">${i.icon||'🍽'}</span>
    <span style="flex:1;color:#f5ede0;font-size:0.85rem;">${i.name}</span>
    <span style="font-size:0.73rem;color:#8a7a6a;background:#1a1410;padding:0.1rem 0.35rem;border-radius:3px;">×${i.qty}</span>
    <span style="color:#8a7a6a;font-size:0.73rem;min-width:50px;text-align:right;">₹${i.price} ea</span>
    <span style="font-weight:600;color:#d4a853;font-size:0.85rem;min-width:55px;text-align:right;">₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
  </div>`).join('');
  const popup = document.createElement('div');
  popup.id = 'order-receipt-popup';
  popup.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1rem;`;
  popup.innerHTML = `<div style="background:#110d0a;border:1px solid #2a1f18;border-radius:4px;width:520px;max-width:100%;max-height:90vh;overflow-y:auto;position:relative;animation:scaleIn 0.3s ease;">
    <div style="padding:2rem 2rem 0;">
      <div style="text-align:center;padding-bottom:1.2rem;border-bottom:1px solid #2a1f18;margin-bottom:1.3rem;">
        <div style="font-size:2rem;margin-bottom:0.3rem;">✅</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.3rem;color:#f5ede0;margin-bottom:0.2rem;">Order Confirmed!</div>
        <div style="color:#8a7a6a;font-size:0.8rem;">${type==='delivery'?'Your order is on its way!':'Ready for pickup in ~15 mins'}</div>
        <div style="font-family:monospace;font-size:0.78rem;color:#8a7a6a;margin-top:0.6rem;">RECEIPT #${oid}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.2rem;">
        <div><div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.3rem;">Customer</div>
          <div style="color:#f5ede0;font-size:0.85rem;font-weight:500;">${user.name}</div>
          <div style="color:#8a7a6a;font-size:0.73rem;">${user.email}</div></div>
        <div><div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.3rem;">Order Type</div>
          <div style="color:#f5ede0;font-size:0.85rem;">${typeText}</div>
          <div style="color:#8a7a6a;font-size:0.73rem;">${now}</div></div>
        <div style="grid-column:1/-1;"><div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.3rem;">Delivery Address</div>
          <div style="background:#1a1410;border-radius:3px;padding:0.6rem 0.8rem;font-size:0.78rem;color:#8a7a6a;line-height:1.6;">${address}</div></div>
      </div>
      <div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a7a6a;margin-bottom:0.4rem;">Items Ordered</div>
      ${itemRows}
      <div style="border-top:1px solid rgba(212,168,83,0.2);padding-top:0.8rem;margin-top:0.3rem;">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem;"><span style="color:#8a7a6a;">Subtotal</span><span style="color:#e8ddd0;">₹${subtotal.toLocaleString('en-IN')}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem;"><span style="color:#8a7a6a;">GST (5%)</span><span style="color:#e8ddd0;">₹${tax.toLocaleString('en-IN')}</span></div>
        <div style="display:flex;justify-content:space-between;font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700;margin-top:0.4rem;"><span style="color:#f5ede0;">Total Paid</span><span style="color:#d4a853;">₹${total.toLocaleString('en-IN')}</span></div>
      </div>
      <div style="text-align:center;margin-top:1rem;padding:0.8rem 0;border-top:1px dashed #2a1f18;font-size:0.73rem;color:#8a7a6a;">✦ &nbsp;Thank you for choosing Red Eye Café&nbsp; ✦</div>
    </div>
    <div style="padding:0.8rem 2rem 1.5rem;display:flex;gap:0.7rem;border-top:1px solid #2a1f18;margin-top:0.5rem;">
      <a href="orders.html" style="flex:1;"><button style="width:100%;padding:0.7rem;background:#d4a853;color:#0a0705;border:none;border-radius:2px;font-family:'Jost',sans-serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;cursor:pointer;">View Order History</button></a>
      <button onclick="document.getElementById('order-receipt-popup').remove()" style="padding:0.7rem 1.2rem;background:#1a1410;border:1px solid #2a1f18;color:#8a7a6a;border-radius:2px;font-family:'Jost',sans-serif;font-size:0.8rem;cursor:pointer;">Close</button>
    </div>
  </div>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if(e.target===popup) popup.remove(); });
}

function updateNavAuth() {
  const authBtns = document.getElementById('auth-btns');
  const userDisplay = document.getElementById('user-display');
  const usernameEl  = document.getElementById('username-text');
  if (!authBtns) return;
  if (currentUser) {
    authBtns.style.display = 'none'; userDisplay.style.display = 'flex';
    if (usernameEl) usernameEl.textContent = currentUser.name.split(' ')[0];
  } else { authBtns.style.display = 'flex'; userDisplay.style.display = 'none'; }
}

function logout() {
  currentUser = null; cart = [];
  sessionStorage.removeItem('redeye_user'); sessionStorage.removeItem('redeye_cart');
  saveCart(); updateNavAuth(); updateCartUI();
  showToast('Logged out. See you soon! 👋');
  setTimeout(() => window.location.href = 'index.html', 1000);
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

window.addEventListener('DOMContentLoaded', () => {
  updateNavAuth(); updateCartUI();
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => { if (a.dataset.page === path) a.classList.add('active-link'); });
});
