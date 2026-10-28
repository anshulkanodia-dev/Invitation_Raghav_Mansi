(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- Gold sparkles ---------- */
  $$('canvas.sparkles').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const n = +cv.dataset.count || 40;
    let w, h, pts;
    const size = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: 0.6 + Math.random() * 2.2,
        p: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 1.4, vy: -(0.05 + Math.random() * 0.25),
      }));
    };
    size(); addEventListener('resize', size);
    const star = (x, y, r, a) => {
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 3); ctx.quadraticCurveTo(x, y, x + r * 3, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 3); ctx.quadraticCurveTo(x, y, x - r * 3, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 3); ctx.fill();
    };
    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#d4ad5f';
      pts.forEach((q) => {
        q.y += q.vy; if (q.y < -10) { q.y = h + 10; q.x = Math.random() * w; }
        const a = (Math.sin(t / 600 * q.s + q.p) + 1) / 2;
        star(q.x, q.y, q.r, a * 0.9);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Music (synthesised so no audio file is needed) ---------- */
  let audio = null;
  const music = $('#music');
  const startMusic = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const master = ac.createGain(); master.gain.value = 0.18; master.connect(ac.destination);
    const delay = ac.createDelay(); delay.delayTime.value = 0.38;
    const fb = ac.createGain(); fb.gain.value = 0.35;
    delay.connect(fb); fb.connect(delay); delay.connect(master);
    [130.81, 196.0].forEach((f) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.12;
      o.connect(g); g.connect(master); o.start();
    });
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
    const phrase = [0, 2, 3, 4, 3, 2, 1, 0, 2, 4, 5, 4, 3, 2, 3, 1];
    let i = 0;
    const pluck = () => {
      const t = ac.currentTime;
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = scale[phrase[i++ % phrase.length]];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g); g.connect(master); g.connect(delay); o.start(t); o.stop(t + 1.5);
    };
    const id = setInterval(pluck, 520);
    audio = { ac, id };
    music.classList.add('playing');
  };
  music.addEventListener('click', () => {
    if (!audio) return startMusic();
    if (audio.ac.state === 'running') { audio.ac.suspend(); music.classList.remove('playing'); }
    else { audio.ac.resume(); music.classList.add('playing'); }
  });

  /* ---------- Envelope intro ---------- */
  const intro = $('#intro');
  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    startMusic();
    intro.classList.add('opening');
    setTimeout(() => intro.classList.add('lift'), 1300);
    setTimeout(() => intro.classList.add('zoom'), 2500);
    setTimeout(() => {
      document.body.classList.remove('locked');
      document.body.classList.add('ready');
      intro.classList.add('gone');
    }, 3200);
    setTimeout(() => intro.remove(), 4200);
  };
  $('#envelope').addEventListener('click', open);

  /* ---------- Parallax ---------- */
  const para = $$('[data-parallax]');
  const onScrollParallax = () => {
    const y = scrollY;
    para.forEach((el) => { el.style.transform = `translateY(${y * +el.dataset.parallax}px)`; });
  };

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.25 });
  $$('.reveal-sec, .tl-item').forEach((el) => io.observe(el));

  /* ---------- Confetti ---------- */
  const cc = $('#confetti'); const cx = cc.getContext('2d');
  let parts = []; let running = false;
  const sizeConf = () => { cc.width = innerWidth * DPR; cc.height = innerHeight * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  sizeConf(); addEventListener('resize', sizeConf);
  const colors = ['#c9a25a', '#ecd49a', '#6b1424', '#f7b9c4', '#ffffff', '#e07a5f'];
  const burst = (x, y, n = 160) => {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2; const v = 4 + Math.random() * 9;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[k % colors.length], life: 0 });
    }
    if (!running) { running = true; requestAnimationFrame(confTick); }
  };
  const confTick = () => {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((p) => {
      p.vy += 0.22; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      cx.globalAlpha = clamp(1 - p.life / 200, 0, 1); cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
    });
    parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 200);
    if (parts.length) requestAnimationFrame(confTick); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  };

  /* ---------- Scratch hearts ---------- */
  const hearts = $$('.heart');
  let revealed = 0;
  hearts.forEach((heart) => {
    const cv = $('canvas', heart); const ctx = cv.getContext('2d');
    const w = heart.clientWidth; const h = heart.clientHeight;
    cv.width = w * DPR; cv.height = h * DPR; ctx.scale(DPR, DPR);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f3dc9c'); g.addColorStop(0.45, '#c9a25a'); g.addColorStop(0.7, '#f6e2ac'); g.addColorStop(1, '#a8803c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < 70; k++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    ctx.fillStyle = 'rgba(107,20,36,.55)'; ctx.font = '600 9px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('SCRATCH', w / 2, h / 2 - 2);
    ctx.globalCompositeOperation = 'destination-out';
    let down = false; let last = null; let done = false;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const scratch = (p) => {
      ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo((last || p).x, (last || p).y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
    };
    const check = () => {
      if (done) return;
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0; for (let k = 3; k < d.length; k += 16) if (d[k] === 0) clear++;
      if (clear / (d.length / 16) > 0.45) {
        done = true; heart.classList.add('done');
        if (++revealed === hearts.length) {
          const r = $('.hearts').getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, 220);
          setTimeout(() => $('#countdown').classList.add('show'), 400);
        }
      }
    };
    cv.addEventListener('pointerdown', (e) => { down = true; last = null; cv.setPointerCapture(e.pointerId); scratch(pos(e)); });
    cv.addEventListener('pointermove', (e) => { if (down) scratch(pos(e)); });
    const up = () => { if (down) { down = false; check(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  });

  /* ---------- Countdown ---------- */
  const target = new Date('2026-11-30T18:00:00+05:30').getTime();
  const cd = Object.fromEntries($$('#countdown b').map((b) => [b.dataset.k, b]));
  const pad = (n) => String(n).padStart(2, '0');
  const tickCd = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    cd.d.textContent = pad(Math.floor(s / 86400)); s %= 86400;
    cd.h.textContent = pad(Math.floor(s / 3600)); s %= 3600;
    cd.m.textContent = pad(Math.floor(s / 60)); cd.s.textContent = pad(s % 60);
  };
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- Card stack ---------- */
  const cards = $$('.ev-card');
  cards.forEach((c, i) => {
    c.style.setProperty('--i', i);
    const sh = document.createElement('div'); sh.className = 'ev-shade'; c.appendChild(sh);
  });
  const onScrollStack = () => {
    cards.forEach((c, i) => {
      const next = cards[i + 1]; if (!next) return;
      const top = parseFloat(getComputedStyle(c).top);
      const p = clamp(1 - (next.getBoundingClientRect().top - top) / c.offsetHeight, 0, 1);
      c.style.transform = `scale(${1 - p * 0.1}) translateY(${-p * 14}px)`;
      c.lastChild.style.opacity = p * 0.45;
    });
  };

  /* ---------- Timeline line ---------- */
  const tl = $('.tl'); const fill = $('.tl-line span');
  const onScrollTl = () => {
    const r = tl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1);
    fill.style.height = `${p * 100}%`;
  };

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { onScrollParallax(); onScrollStack(); onScrollTl(); ticking = false; });
  }, { passive: true });
  onScrollStack(); onScrollTl();
})();
