const CATS = {celulares:'Celulares', fones:'Fones', relogios:'Relógios', carregadores:'Carregadores', cameras:'Câmeras'};
const ICONS = {
  celulares:'<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
  fones:'<svg viewBox="0 0 24 24"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/></svg>',
  relogios:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4"/></svg>',
  carregadores:'<svg viewBox="0 0 24 24"><path d="M9 2v4M15 2v4"/><rect x="6" y="6" width="12" height="8" rx="2"/><path d="M12 14v8"/></svg>',
  cameras:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>'
};
const KEY = 'garbosa-demo';
const PASS = '1234'; // senha de demonstração do painel

const DEF = {name:'Garbosa', whats:'', logo:'', products:[
  {id:1, name:'Smartphone X Pro', price:1899, cat:'celulares'},
  {id:2, name:'Smartphone Lite 128GB', price:999, cat:'celulares'},
  {id:3, name:'Fone Over-Ear Bluetooth', price:249.9, cat:'fones'},
  {id:4, name:'Fone Intra Sem Fio', price:129.9, cat:'fones'},
  {id:5, name:'Smartwatch Fit', price:329.9, cat:'relogios'},
  {id:6, name:'Carregador Turbo 25W', price:69.9, cat:'carregadores'},
  {id:7, name:'Cabo USB-C 1m', price:29.9, cat:'carregadores'},
  {id:8, name:'Câmera de Ação 4K', price:459.9, cat:'cameras'}
]};

let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || DEF; } catch (e) { S = DEF; }
let filter = 'todos';
const cart = {};

const $ = id => document.getElementById(id);
const money = n => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { alert('Não foi possível salvar (imagem muito grande?).'); }
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function renderBrand() {
  const b = $('brand');
  b.textContent = '';
  if (S.logo) { const i = el('img'); i.src = S.logo; i.alt = S.name; b.appendChild(i); }
  b.appendChild(el('span', '', S.name));
  document.title = S.name + ' - Loja Virtual';
}

function renderChips() {
  const c = $('chips');
  c.textContent = '';
  [['todos', 'Todos'], ...Object.entries(CATS)].forEach(([k, v]) => {
    const b = el('button', 'chip' + (filter === k ? ' on' : ''), v);
    b.onclick = () => { filter = k; renderChips(); renderGrid(); };
    c.appendChild(b);
  });
}

function renderGrid() {
  const g = $('grid');
  g.textContent = '';
  S.products.filter(p => filter === 'todos' || p.cat === filter).forEach(p => {
    const card = el('article', 'card');
    const ic = el('div', 'ico');
    ic.innerHTML = ICONS[p.cat] || ICONS.celulares;
    card.append(ic, el('h3', '', p.name), el('p', 'price', money(p.price)));
    const b = el('button', 'buy', 'Adicionar');
    b.onclick = () => { cart[p.id] = (cart[p.id] || 0) + 1; renderCart(); openCart(); };
    card.appendChild(b);
    g.appendChild(card);
  });
}

function renderCart() {
  const list = $('items');
  list.textContent = '';
  let total = 0, n = 0;
  Object.keys(cart).forEach(id => {
    const p = S.products.find(x => x.id == id);
    if (!p) { delete cart[id]; return; }
    const q = cart[id];
    total += p.price * q; n += q;
    const li = el('li');
    li.append(el('span', '', q + 'x ' + p.name), el('b', '', money(p.price * q)));
    const r = el('button', 'x', 'Remover');
    r.onclick = () => { delete cart[id]; renderCart(); };
    li.appendChild(r);
    list.appendChild(li);
  });
  $('count').textContent = n;
  $('total').textContent = money(total);
  $('empty').hidden = n > 0;
  $('checkout').disabled = n === 0;
}

function openCart() { $('cart').classList.add('open'); $('veil').classList.add('on'); }
function closeCart() { $('cart').classList.remove('open'); $('veil').classList.remove('on'); }
$('btnCart').onclick = openCart;
$('closeCart').onclick = closeCart;
$('veil').onclick = closeCart;

$('checkout').onclick = () => {
  const num = (S.whats || '').replace(/\D/g, '');
  if (!num) { $('warn').hidden = false; return; }
  const lines = Object.keys(cart).map(id => {
    const p = S.products.find(x => x.id == id);
    return cart[id] + 'x ' + p.name + ' - ' + money(p.price * cart[id]);
  });
  lines.push('Total: ' + $('total').textContent);
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent('Olá! Quero fazer este pedido:\n' + lines.join('\n')), '_blank');
};

/* ---------- Painel ---------- */
Object.entries(CATS).forEach(([k, v]) => { const o = el('option', '', v); o.value = k; $('pCat').appendChild(o); });

function renderPList() {
  const u = $('plist');
  u.textContent = '';
  S.products.forEach(p => {
    const li = el('li');
    li.appendChild(el('span', '', p.name + ' - ' + money(p.price)));
    const b = el('button', 'x', 'Excluir');
    b.onclick = () => { S.products = S.products.filter(x => x.id !== p.id); save(); renderPList(); renderGrid(); renderCart(); };
    li.appendChild(b);
    u.appendChild(li);
  });
}

$('btnAdmin').onclick = () => {
  if (prompt('Senha do painel (demo: 1234)') !== PASS) return;
  $('fName').value = S.name;
  $('fWhats').value = S.whats;
  renderPList();
  $('admin').showModal();
};
$('closeAdmin').onclick = () => $('admin').close();

$('saveCfg').onclick = () => {
  S.name = $('fName').value.trim() || 'Minha Loja';
  S.whats = $('fWhats').value.trim();
  save(); renderBrand(); $('warn').hidden = true;
  alert('Salvo!');
};

$('fLogo').onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    if (r.result.length > 400000) { alert('Imagem grande demais. Use uma logo menor que 300 KB.'); return; }
    S.logo = r.result; save(); renderBrand();
  };
  r.readAsDataURL(f);
};
$('rmLogo').onclick = () => { S.logo = ''; save(); renderBrand(); };

$('addProd').onclick = () => {
  const name = $('pName').value.trim();
  const price = parseFloat($('pPrice').value);
  if (!name || !(price >= 0)) { alert('Informe nome e preço.'); return; }
  S.products.push({id: Date.now(), name, price, cat: $('pCat').value});
  save();
  $('pName').value = ''; $('pPrice').value = '';
  renderPList(); renderGrid();
};

renderBrand(); renderChips(); renderGrid(); renderCart();
