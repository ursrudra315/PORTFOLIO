/* ============================================================
   Rudrapratap Singh — Portfolio interactions
   Vanilla JS (ES6+). No frameworks.
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. LOADER ---------- */
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  const pct = document.getElementById('loaderPct');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18);
    bar.style.width = p + '%';
    pct.textContent = Math.floor(p) + '%';
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => loader.classList.add('hidden'), 350);
    }
  }, 130);

  /* ---------- 2. YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- 3. NAVBAR SCROLL + BURGER ---------- */
  const header = document.querySelector('header');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    })
  );

  /* ---------- 4. ROTATING ROLES (typed effect, no library) ---------- */
  const typed = document.getElementById('typed');
  const roles = ['Frontend Developer', 'UI Engineer', 'Cyber Security Student', 'Creative Coder'];
  let ri = 0, ci = 0, deleting = false;
  function type() {
    const word = roles[ri];
    typed.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 90); }
    else if (deleting && ci > 0) { ci--; setTimeout(type, 45); }
    else {
      if (!deleting) { deleting = true; setTimeout(type, 1500); }
      else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(type, 300); }
    }
  }
  type();

  /* ---------- 5. SCROLL REVEAL (IntersectionObserver) ---------- */
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- 6. SKILL FILTERING ---------- */
  const filters = document.querySelectorAll('.filter');
  const skills = document.querySelectorAll('.skill');
  filters.forEach(btn =>
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      skills.forEach(s => s.classList.toggle('hide', !(cat === 'all' || s.dataset.cat === cat)));
    })
  );

  /* ---------- 7. 3D TILT ON CARDS ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 8. CUSTOM CURSOR ---------- */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (window.matchMedia('(hover:hover)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {           // smooth follow for outer ring
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
  }

  /* ---------- 9. CONTACT FORM (Formspree, async) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) { status.textContent = '✅ Message sent. Thank you!'; form.reset(); }
      else { status.textContent = '⚠️ Something went wrong. Try again.'; }
    } catch {
      status.textContent = '⚠️ Network error. Please email me directly.';
    }
  });

  /* ---------- 10. THREE.JS 3D BACKGROUND ---------- */
  if (!reduceMotion && window.THREE) initThree();

  function initThree() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    // Particle starfield
    const COUNT = innerWidth < 768 ? 450 : 900;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 130;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(geo,
      new THREE.PointsMaterial({ color: 0x7c5cff, size: 0.35, transparent: true, opacity: 0.85 }));
    scene.add(particles);

    // Floating wireframe torus knot
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(7, 1.5, 140, 20),
      new THREE.MeshStandardMaterial({
        color: 0x00e0ff, emissive: 0x7c5cff, emissiveIntensity: 0.6,
        metalness: 0.8, roughness: 0.25, wireframe: true
      })
    );
    scene.add(knot);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const l1 = new THREE.PointLight(0x00e0ff, 2, 200); l1.position.set(25, 20, 20); scene.add(l1);
    const l2 = new THREE.PointLight(0xff2d95, 2, 200); l2.position.set(-25, -10, 10); scene.add(l2);

    // Mouse parallax + scroll
    let mx = 0, my = 0, sy = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    window.addEventListener('scroll', () => { sy = window.scrollY; });

    (function render() {
      requestAnimationFrame(render);
      particles.rotation.y += 0.0006;
      particles.rotation.x += 0.0003;
      knot.rotation.x += 0.004;
      knot.rotation.y += 0.006;
      knot.position.y = Math.sin(Date.now() * 0.0008) * 2 - sy * 0.01;
      camera.position.x += (mx * 8 - camera.position.x) * 0.04;
      camera.position.y += (-my * 8 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }
});
