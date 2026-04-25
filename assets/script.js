
        /* ============================================================
           HAVE A NICE DAY Â· LONDON Â· Full-functionality JS
           ============================================================ */
        (function () {
            'use strict';

            // ---------- Helpers ----------
            const $ = (s, ctx = document) => ctx.querySelector(s);
            const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
            const fmt = (n) => 'Â£' + n.toFixed(2);
            const parseGBP = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
            const SHIP_FREE = 50;

            // ---------- State ----------
            const state = {
                cart: JSON.parse(localStorage.getItem('hand_cart') || '[]'),
                wish: JSON.parse(localStorage.getItem('hand_wish') || '[]'),
                modalProduct: null,
                modalSize: 'M',
                modalQty: 1
            };

            const persist = () => {
                localStorage.setItem('hand_cart', JSON.stringify(state.cart));
                localStorage.setItem('hand_wish', JSON.stringify(state.wish));
            };

            // ---------- Toasts ----------
            const toast = (msg, type = 'ok', icon = 'â˜»') => {
                const wrap = $('#toastWrap');
                const el = document.createElement('div');
                el.className = 'toast-msg' + (type === 'err' ? ' err' : '');
                el.innerHTML = `<span class="ic">${icon}</span><span>${msg}</span>`;
                wrap.appendChild(el);
                requestAnimationFrame(() => el.classList.add('show'));
                setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3200);
            };

            // ---------- Reveal on scroll ----------
            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
            }, { threshold: .1 });
            $$('.reveal').forEach(el => io.observe(el));

            // ---------- Smooth scroll for any in-page anchor ----------
            $$('a[href^="#"]').forEach(a => {
                a.addEventListener('click', (e) => {
                    const href = a.getAttribute('href');
                    if (href.length < 2) return;
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        closeAll();
                    }
                });
            });

            // ---------- Body lock helper ----------
            const lock = (on) => document.body.classList.toggle('lock', on);

            const backdrop = $('#backdrop');
            const closeAll = () => {
                $('#cartDrawer').classList.remove('show');
                $('#searchOv').classList.remove('show');
                $('#mobMenu').classList.remove('show');
                $('#modal').classList.remove('show');
                $('#megaMenu').classList.remove('open');
                backdrop.classList.remove('show');
                lock(false);
            };
            backdrop.addEventListener('click', closeAll);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

            // ============================================================
            //  MEGA MENU
            // ============================================================
            const trigger = $('#shopTrigger');
            const mega = $('#megaMenu');
            let megaOpen = false;
            let megaTimer;
            const openMega = () => { clearTimeout(megaTimer); mega.classList.add('open'); megaOpen = true; };
            const closeMega = () => { megaTimer = setTimeout(() => { mega.classList.remove('open'); megaOpen = false; }, 150); };
            trigger.addEventListener('click', (e) => { e.stopPropagation(); megaOpen ? closeMega() : openMega(); });
            trigger.addEventListener('mouseenter', openMega);
            trigger.addEventListener('mouseleave', closeMega);
            mega.addEventListener('mouseenter', openMega);
            mega.addEventListener('mouseleave', closeMega);

            // ============================================================
            //  CART
            // ============================================================
            const cartDrawer = $('#cartDrawer');
            const cartBody = $('#cartBody');
            const cartFoot = $('#cartFoot');
            const emptyCart = $('#emptyCart');
            const cartCount = $('#cartCount');
            const cartItemsCount = $('#cartItemsCount');
            const cartSub = $('#cartSub');
            const cartTotal = $('#cartTotal');
            const cartShip = $('#cartShip');
            const shipNote = $('#shipNote');

            const openCart = () => {
                renderCart();
                cartDrawer.classList.add('show');
                backdrop.classList.add('show');
                lock(true);
            };
            const closeCart = () => { cartDrawer.classList.remove('show'); backdrop.classList.remove('show'); lock(false); };

            $('.cart-btn').addEventListener('click', (e) => { e.preventDefault(); openCart(); });
            $$('[data-close-cart]').forEach(b => b.addEventListener('click', closeCart));
            $$('[data-open-cart]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); closeAll(); openCart(); }));
            $('#stickyView').addEventListener('click', () => { $('#stickyBar').classList.remove('show'); openCart(); });

            const productImg = (card) => {
                const img = card?.querySelector?.('.real-img') || card?.querySelector?.('img');
                return img ? img.src : '';
            };

            const renderCart = () => {
                const totalItems = state.cart.reduce((a, b) => a + b.qty, 0);
                const sub = state.cart.reduce((a, b) => a + b.qty * b.price, 0);
                cartCount.textContent = totalItems;
                cartItemsCount.textContent = '(' + totalItems + ')';

                if (state.cart.length === 0) {
                    emptyCart.style.display = 'block';
                    cartFoot.style.display = 'none';
                    cartBody.querySelectorAll('.cart-item').forEach(n => n.remove());
                    return;
                }
                emptyCart.style.display = 'none';
                cartFoot.style.display = 'block';

                // Render items
                cartBody.querySelectorAll('.cart-item').forEach(n => n.remove());
                state.cart.forEach((it, idx) => {
                    const row = document.createElement('div');
                    row.className = 'cart-item';
                    row.innerHTML = `
                    <div class="thumb">${it.img ? `<img src="${it.img}" alt="">` : '<span style="font-size:24px">â˜»</span>'}</div>
                    <div class="meta">
                        <div class="nm">${it.name}</div>
                        <div class="sub">${it.cat || ''}${it.size ? ' Â· Size ' + it.size : ''}</div>
                        <div class="qty">
                            <button data-dec="${idx}" aria-label="Decrease">âˆ’</button>
                            <span>${it.qty}</span>
                            <button data-inc="${idx}" aria-label="Increase">+</button>
                        </div>
                    </div>
                    <div class="right">
                        <div class="price">${fmt(it.qty * it.price)}</div>
                        <div class="rm" data-rm="${idx}">Remove</div>
                    </div>`;
                    cartBody.appendChild(row);
                });

                cartSub.textContent = fmt(sub);
                cartTotal.textContent = fmt(sub);
                if (sub >= SHIP_FREE) {
                    shipNote.innerHTML = '<b>â˜» Free UK shipping unlocked</b>';
                    shipNote.style.background = 'rgba(27,138,58,.18)';
                    cartShip.textContent = 'Free';
                } else {
                    shipNote.innerHTML = `Add <b>${fmt(SHIP_FREE - sub)}</b> more for free UK shipping`;
                    shipNote.style.background = 'rgba(245,228,0,.25)';
                    cartShip.textContent = 'Calculated at checkout';
                }
            };

            cartBody.addEventListener('click', (e) => {
                const inc = e.target.closest('[data-inc]');
                const dec = e.target.closest('[data-dec]');
                const rm = e.target.closest('[data-rm]');
                if (inc) { state.cart[+inc.dataset.inc].qty++; persist(); renderCart(); }
                if (dec) {
                    const i = +dec.dataset.dec;
                    state.cart[i].qty--;
                    if (state.cart[i].qty <= 0) state.cart.splice(i, 1);
                    persist(); renderCart();
                }
                if (rm) { state.cart.splice(+rm.dataset.rm, 1); persist(); renderCart(); toast('Removed from bag'); }
            });

            $('#checkoutBtn').addEventListener('click', () => {
                if (!state.cart.length) return;
                const total = state.cart.reduce((a, b) => a + b.qty * b.price, 0);
                toast('Redirecting to secure checkout Â· ' + fmt(total), 'ok', 'â˜»');
                // simulate
                setTimeout(() => {
                    alert('ðŸŽ‰ Demo checkout\n\nThis demo would now redirect to Shopify Checkout / Stripe.\n\nOrder total: ' + fmt(total) + '\nItems: ' + state.cart.reduce((a, b) => a + b.qty, 0));
                }, 800);
            });

            // ---------- Add-to-cart core ----------
            const addToCart = (data) => {
                const existing = state.cart.find(i => i.id === data.id && i.size === data.size);
                if (existing) existing.qty += data.qty || 1;
                else state.cart.push({ ...data, qty: data.qty || 1 });
                persist();
                renderCart();

                // Sticky bar quick feedback
                $('#stickyName').textContent = data.name;
                $('#stickyPrice').textContent = fmt(data.price);
                const sb = $('#stickyBar');
                sb.classList.add('show');
                clearTimeout(sb._t);
                sb._t = setTimeout(() => sb.classList.remove('show'), 4200);

                toast(`Added: ${data.name}`, 'ok', '+');
            };

            // Wire all "Quick Add" buttons
            $$('[data-add]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const card = btn.closest('.card');
                    const name = card.dataset.product;
                    const price = parseGBP(card.dataset.price);
                    const cat = card.querySelector('.card-cat')?.textContent.trim() || '';
                    const img = productImg(card);
                    addToCart({
                        id: name.replace(/\s+/g, '-').toLowerCase(),
                        name, price, cat, img, size: 'M'
                    });
                    const orig = btn.textContent;
                    btn.textContent = 'â˜» Added';
                    btn.style.background = 'var(--acid)';
                    btn.style.color = 'var(--ink)';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1500);
                });
            });

            // ============================================================
            //  PRODUCT QUICK VIEW MODAL
            // ============================================================
            const modal = $('#modal');
            const openModal = (card) => {
                state.modalProduct = {
                    id: card.dataset.product.replace(/\s+/g, '-').toLowerCase(),
                    name: card.dataset.product,
                    price: parseGBP(card.dataset.price),
                    cat: card.querySelector('.card-cat')?.textContent.trim() || '',
                    img: productImg(card)
                };
                state.modalSize = 'M';
                state.modalQty = 1;
                $('#modalTitle').textContent = state.modalProduct.name;
                $('#modalCat').textContent = state.modalProduct.cat;
                $('#modalPrice').textContent = fmt(state.modalProduct.price);
                $('#modalAddPrice').textContent = fmt(state.modalProduct.price);
                const mImg = $('#modalImg');
                if (state.modalProduct.img) {
                    mImg.src = state.modalProduct.img;
                    mImg.style.display = 'block';
                } else {
                    mImg.style.display = 'none';
                }
                $('#modalQty').textContent = '1';
                $$('#modalSizes button').forEach(b => b.classList.toggle('sel', b.dataset.size === 'M'));
                modal.classList.add('show');
                backdrop.classList.add('show');
                lock(true);
            };
            const closeModal = () => { modal.classList.remove('show'); backdrop.classList.remove('show'); lock(false); };
            $$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

            // wire iconbtn (â†—) â†’ opens modal
            $$('.iconbtn, .card-media').forEach(el => {
                // skip the quick-add buttons
                if (el.matches('.iconbtn') || el.matches('.card-media')) {
                    el.addEventListener('click', (e) => {
                        if (e.target.closest('[data-add]')) return; // let add do its job
                        if (e.target.closest('.iconbtn') || (el.matches('.card-media') && e.target === el)) {
                            const card = el.closest('.card');
                            if (card) { e.preventDefault(); e.stopPropagation(); openModal(card); }
                        }
                    });
                }
            });

            $('#modalSizes').addEventListener('click', (e) => {
                const b = e.target.closest('button');
                if (!b || b.classList.contains('oos')) return;
                $$('#modalSizes button').forEach(x => x.classList.remove('sel'));
                b.classList.add('sel');
                state.modalSize = b.dataset.size;
            });
            $('#modalPlus').addEventListener('click', () => {
                state.modalQty++; $('#modalQty').textContent = state.modalQty;
                $('#modalAddPrice').textContent = fmt(state.modalQty * state.modalProduct.price);
            });
            $('#modalMinus').addEventListener('click', () => {
                if (state.modalQty > 1) state.modalQty--;
                $('#modalQty').textContent = state.modalQty;
                $('#modalAddPrice').textContent = fmt(state.modalQty * state.modalProduct.price);
            });
            $('#modalAdd').addEventListener('click', () => {
                const p = state.modalProduct;
                addToCart({ ...p, size: state.modalSize, qty: state.modalQty });
                closeModal();
                setTimeout(openCart, 350);
            });

            // ============================================================
            //  SEARCH OVERLAY
            // ============================================================
            const searchOv = $('#searchOv');
            const searchInput = $('#searchInput');
            const searchResults = $('#searchResults');
            const resultsLabel = $('#resultsLabel');

            // Build product index from existing cards
            const allProducts = $$('.products .card').map(c => ({
                el: c,
                name: c.dataset.product || '',
                price: c.dataset.price || '',
                cat: c.querySelector('.card-cat')?.textContent || '',
                html: c.outerHTML
            }));

            const buildResultCard = (p) => {
                // clone card & strip data-add buttons (use outerHTML preserving styling)
                const wrapper = document.createElement('div');
                wrapper.innerHTML = p.html;
                const card = wrapper.firstElementChild;
                // Keep its quick-add hooked via event delegation
                return card;
            };

            const renderSearch = (q) => {
                searchResults.innerHTML = '';
                const query = q.trim().toLowerCase();
                const list = !query
                    ? allProducts.slice(0, 8)
                    : allProducts.filter(p =>
                        p.name.toLowerCase().includes(query) ||
                        p.cat.toLowerCase().includes(query)
                    );
                resultsLabel.textContent = query
                    ? (list.length ? `${list.length} result${list.length === 1 ? '' : 's'} for "${q}"` : `No results for "${q}"`)
                    : 'Featured products';
                if (!list.length) {
                    searchResults.innerHTML = `<div class="search-empty" style="grid-column:1/-1">
                    <div style="font-size:48px;margin-bottom:10px">â˜»</div>
                    <p>Nothing found. Try "Sam", "Dready" or "Beanie".</p></div>`;
                    return;
                }
                list.forEach(p => searchResults.appendChild(buildResultCard(p)));
            };

            const openSearch = () => {
                searchOv.classList.add('show');
                backdrop.classList.add('show');
                lock(true);
                renderSearch('');
                setTimeout(() => searchInput.focus(), 350);
            };
            $$('[data-open-search], a.nav-link').forEach(el => {
                if (el.textContent.trim().toLowerCase() === 'search' || el.dataset.openSearch !== undefined) {
                    el.addEventListener('click', (e) => { e.preventDefault(); closeAll(); openSearch(); });
                }
            });
            $$('[data-close-search]').forEach(b => b.addEventListener('click', closeAll));

            searchInput.addEventListener('input', (e) => renderSearch(e.target.value));
            $$('#trendingBox span').forEach(s => s.addEventListener('click', () => {
                searchInput.value = s.dataset.q;
                renderSearch(s.dataset.q);
            }));

            // Delegate clicks inside search results
            searchResults.addEventListener('click', (e) => {
                const addBtn = e.target.closest('[data-add]');
                const iconBtn = e.target.closest('.iconbtn');
                const card = e.target.closest('.card');
                if (!card) return;
                if (addBtn) {
                    e.preventDefault(); e.stopPropagation();
                    const name = card.dataset.product;
                    const price = parseGBP(card.dataset.price);
                    const cat = card.querySelector('.card-cat')?.textContent.trim() || '';
                    const img = productImg(card);
                    addToCart({ id: name.replace(/\s+/g, '-').toLowerCase(), name, price, cat, img, size: 'M' });
                } else if (iconBtn) {
                    e.preventDefault();
                    closeAll();
                    setTimeout(() => openModal(card), 250);
                }
            });

            // ============================================================
            //  MOBILE MENU
            // ============================================================
            const burger = $('.burger');
            const mobMenu = $('#mobMenu');
            burger?.addEventListener('click', () => {
                mobMenu.classList.add('show');
                backdrop.classList.add('show');
                lock(true);
            });
            $$('[data-close-mob]').forEach(b => b.addEventListener('click', closeAll));
            $$('[data-mob]').forEach(a => a.addEventListener('click', () => {
                // close after pick â€” smooth scroll handled by anchor handler
                setTimeout(closeAll, 100);
            }));

            // ============================================================
            //  WISHLIST HEARTS â€” inject into every card
            // ============================================================
            $$('.card').forEach(card => {
                // Avoid duplicates
                if (card.querySelector('.heart')) return;
                const id = (card.dataset.product || '').replace(/\s+/g, '-').toLowerCase();
                const btn = document.createElement('button');
                btn.className = 'heart' + (state.wish.includes(id) ? ' on' : '');
                btn.setAttribute('aria-label', 'Add to wishlist');
                btn.dataset.heart = id;
                btn.innerHTML = 'â™¥';
                // Place to top-right (we already have card-badge top-left)
                card.appendChild(btn);
            });
            document.addEventListener('click', (e) => {
                const h = e.target.closest('.heart');
                if (!h) return;
                e.preventDefault(); e.stopPropagation();
                const id = h.dataset.heart;
                const i = state.wish.indexOf(id);
                if (i > -1) { state.wish.splice(i, 1); h.classList.remove('on'); toast('Removed from wishlist', 'ok', 'âˆ’'); }
                else { state.wish.push(id); h.classList.add('on'); toast('Saved to wishlist â™¥', 'ok', 'â™¥'); }
                persist();
            });

            // ============================================================
            //  BRAND FILTER (clicking a brand tile filters product grid)
            // ============================================================
            const filterMap = {
                'have-a-nice-day': /have a nice day|sam the man|shurl/i,
                'dready': /dready/i,
                'sista': /sista/i,
                'handspun-records': /handspun/i,
                'btka': /btka/i,
                'vortex': /vortex/i,
                'funky-dog': /funky dog/i,
                'don\'t-do-the-dodo': /dodo/i
            };
            const brandFilterAliases = {
                'hand': /have a nice day|sam the man|shurl/i,
                'dready': /dready/i,
                'sista': /sista/i,
                'handspun': /handspun/i,
                'vortex': /vortex/i,
                'funky': /funky dog/i,
                'dodo': /dodo/i
            };
            const applyFilter = (regex, label) => {
                $$('.products .card').forEach(card => {
                    const matches = regex.test((card.dataset.product || '') + ' ' + (card.querySelector('.card-cat')?.textContent || ''));
                    card.classList.toggle('hide', !matches);
                });
                // show clear bar on first products section
                let bar = $('#filterBar');
                if (!bar) {
                    bar = document.createElement('div');
                    bar.id = 'filterBar';
                    bar.className = 'filter-bar show';
                    bar.innerHTML = `Showing: <b>${label}</b> <span class="clear" id="filterClear">Clear filter âœ•</span>`;
                    const firstProducts = $('#bestsellers .container');
                    firstProducts.insertBefore(bar, firstProducts.querySelector('.products'));
                } else {
                    bar.innerHTML = `Showing: <b>${label}</b> <span class="clear" id="filterClear">Clear filter âœ•</span>`;
                    bar.classList.add('show');
                }
                $('#filterClear').addEventListener('click', clearFilter);
                // scroll to bestsellers
                $('#bestsellers').scrollIntoView({ behavior: 'smooth' });
                toast(`Filtering: ${label}`, 'ok', 'âŒ•');
            };
            const clearFilter = () => {
                $$('.products .card').forEach(c => c.classList.remove('hide'));
                const bar = $('#filterBar'); if (bar) bar.classList.remove('show');
                toast('Filter cleared');
            };

            $$('.brand-tile').forEach(tile => {
                const name = tile.querySelector('.label')?.textContent.trim() || '';
                tile.addEventListener('click', (e) => {
                    if (tile.classList.contains('bt-incu')) return; // let it scroll to incubator section
                    e.preventDefault();
                    const key = name.toLowerCase();
                    let regex = null;
                    Object.entries(filterMap).forEach(([k, r]) => { if (key.includes(k.replace(/-/g, ' ')) || k.includes(key.replace(/'/g, '').replace(/\s+/g, '-'))) regex = r; });
                    if (!regex) regex = new RegExp(name.split(' ').filter(Boolean).join('|'), 'i');
                    applyFilter(regex, name);
                });
            });

            $$('[data-brand-filter]').forEach(a => {
                a.addEventListener('click', (e) => {
                    const key = a.dataset.brandFilter;
                    const r = brandFilterAliases[key];
                    if (r) applyFilter(r, a.firstChild.textContent.trim());
                });
            });

            // ============================================================
            //  NEWSLETTER FORM (real working flow + validation + storage)
            // ============================================================
            const form = $('#signupForm');
            const formInput = form.querySelector('input');
            const formBtn = form.querySelector('button');
            form.removeAttribute('onsubmit'); // overwrite inline handler
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = formInput.value.trim();
                const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!valid) { toast('Please enter a valid email', 'err', '!'); formInput.focus(); return; }
                formBtn.classList.add('loading');
                formBtn.textContent = 'Sending...';
                // simulated async
                setTimeout(() => {
                    const list = JSON.parse(localStorage.getItem('hand_subs') || '[]');
                    if (!list.includes(email)) list.push(email);
                    localStorage.setItem('hand_subs', JSON.stringify(list));
                    form.classList.add('done');
                    form.innerHTML = '<div style="padding:14px 22px;font-family:\'Bungee\',sans-serif;font-size:13px;letter-spacing:.16em;color:var(--ink)">â˜» You\'re on the list. Check your inbox.</div>';
                    $('#signupSuccess').textContent = 'Welcome to the family â€” drops & news headed your way.';
                    toast('Subscribed â˜» Welcome to the family');
                }, 700);
            });

            // ============================================================
            //  TYPE PILLS â€” filter by product type
            // ============================================================
            const typeMap = {
                't-shirts': /t-shirt|tee/i,
                'sweatshirts': /sweatshirt/i,
                'beanies': /beanie/i,
                'slip mats': /slip mat/i,
                'accessories': /beanie|slip mat|accessor/i,
                'sam the man': /sam the man|have a nice day tee/i,
                'unisex fit': /unisex/i,
                'organic cotton': /organic|cotton/i
            };
            $$('.type-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    const txt = pill.firstChild.textContent.trim().toLowerCase();
                    const regex = typeMap[txt];
                    if (regex) applyFilter(regex, pill.firstChild.textContent.trim());
                });
            });

            // ============================================================
            //  GALLERY TILES - open search prefilled
            // ============================================================
            $$('.gtile').forEach(tile => {
                tile.addEventListener('click', () => {
                    const tag = tile.querySelector('.gtag')?.textContent.trim() || '';
                    openSearch();
                    searchInput.value = tag;
                    renderSearch(tag);
                });
            });

            // ============================================================
            //  Footer / "Log in" / Account links â€” graceful demo modal
            // ============================================================
            $$('.footer ul a, .nav-link, .footer .socials a').forEach(a => {
                const txt = a.textContent.trim().toLowerCase();
                if (a.getAttribute('href') === '#' || a.getAttribute('href') === '') {
                    a.addEventListener('click', (e) => {
                        if (a.dataset.openSearch !== undefined) return;
                        if (txt === 'log in' || txt === 'cart' || txt === 'newsletter' || txt === 'search') return;
                        e.preventDefault();
                        if (a.classList.contains('socials') || a.parentElement.classList.contains('socials')) {
                            toast('Follow us on ' + (txt === 'fb' ? 'Facebook' : 'Instagram'));
                        } else {
                            toast(`Going to: ${a.textContent.trim()}`, 'ok', 'â†’');
                        }
                    });
                }
            });
            // Log in link â†’ demo
            $$('a').forEach(a => {
                if (a.textContent.trim().toLowerCase() === 'log in' && a.getAttribute('href') === '#') {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        const email = prompt('Demo Login\n\nEnter your email to sign in:');
                        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            localStorage.setItem('hand_user', email);
                            toast('Welcome back, ' + email.split('@')[0] + ' â˜»');
                        } else if (email) toast('Invalid email', 'err', '!');
                    });
                }
            });

            // Incubator licensing button
            $('.incu-note')?.addEventListener('click', (e) => {
                e.preventDefault();
                const msg = prompt('Licensing & Wholesale Enquiry\n\nLeave us your email and a short note. We\'ll be in touch.\n\nYour email:');
                if (msg && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
                    toast('Thanks! We\'ll be in touch â˜»');
                } else if (msg) toast('Invalid email', 'err', '!');
            });

            // "View All Products" + "Open Full Gallery" buttons
            $$('.btn-ghost').forEach(btn => {
                const txt = btn.textContent.trim();
                if (/View All|Open Full Gallery/i.test(txt)) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (/Gallery/i.test(txt)) toast('Opening full gallery...', 'ok', 'â†’');
                        else toast('Loading all 84 pieces...', 'ok', 'âŒ•');
                    });
                }
            });

            // ============================================================
            //  Live "just-bought" social proof
            // ============================================================
            const socialPool = [
                { name: 'Maya', city: 'Hackney', product: 'Sam The Man Front Print T-Shirt' },
                { name: 'James', city: 'Camden', product: 'Have A Nice Day Tee Unisex' },
                { name: 'Sienna', city: 'Brixton', product: 'Shurl The Girl Sweatshirt' },
                { name: 'Leo', city: 'Shoreditch', product: 'Vortex Beanie' },
                { name: 'Riya', city: 'Soho', product: 'Dready Selecta T-Shirt' },
                { name: 'Tom', city: 'Notting Hill', product: 'Funky Dog Slip Mat' }
            ];
            let proofTimer;
            const showProof = () => {
                const p = socialPool[Math.floor(Math.random() * socialPool.length)];
                const wrap = $('#toastWrap');
                const el = document.createElement('div');
                el.className = 'toast-msg show';
                el.innerHTML = `<span class="ic">â˜»</span><span><b>${p.name} from ${p.city}</b><br><span style="font-size:11px;color:rgba(255,254,247,.6)">just bought ${p.product}</span></span>`;
                el.style.transform = 'none';
                wrap.appendChild(el);
                setTimeout(() => { el.style.transform = 'translateX(120%)'; setTimeout(() => el.remove(), 400); }, 4500);
            };
            // Start social proof after a delay; respect reduced-motion
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                setTimeout(() => {
                    showProof();
                    proofTimer = setInterval(showProof, 18000);
                }, 6000);
            }

            // ============================================================
            //  Initial render
            // ============================================================
            renderCart();
            if (state.cart.length) toast(`Welcome back Â· ${state.cart.length} item${state.cart.length === 1 ? '' : 's'} saved in bag`);

            // Expose for debug
            window.HAND = { state, addToCart, openCart, openSearch, openModal, applyFilter, clearFilter, toast };
        })();
    
