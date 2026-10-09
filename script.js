(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Subtle ambient particles; no libraries, assets, or build step required.
  function startParticles(canvasId, count) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, particles = [], raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = Math.max(1, Math.floor(rect.width * Math.min(devicePixelRatio || 1, 1.7)));
      height = canvas.height = Math.max(1, Math.floor(rect.height * Math.min(devicePixelRatio || 1, 1.7)));
      canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      particles = Array.from({length: count}, () => ({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.6+.3,v:Math.random()*.28+.05,a:Math.random()*.5+.08,phase:Math.random()*6.28}));
    };
    const draw = () => {
      ctx.clearRect(0,0,width,height);
      for (const p of particles) {
        if (!reduceMotion) { p.y -= p.v; p.phase += .012; p.x += Math.sin(p.phase)*.12; }
        if (p.y < -4) { p.y = height+4; p.x = Math.random()*width; }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle = `rgba(56,189,248,${p.a})`; ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); }, {passive:true});
  }
  startParticles('hero-canvas', 95);
  startParticles('final-canvas', 70);

  // Responsive mobile navigation.

  // Persistent dark/light theme switcher. Dark mode is the default blue look.
  const themeButton = $('.theme-toggle');
  const savedTheme = localStorage.getItem('mohit-portfolio-theme');
  if (savedTheme === 'light') document.body.classList.add('light-mode');
  const updateThemeButton = () => {
    const light = document.body.classList.contains('light-mode');
    if (themeButton) {
      themeButton.innerHTML = light ? '<span class="theme-icon" aria-hidden="true">☾</span><span class="theme-label">Dark</span>' : '<span class="theme-icon" aria-hidden="true">☀</span><span class="theme-label">Light</span>';
      themeButton.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      themeButton.title = light ? 'Switch to dark mode' : 'Switch to light mode';
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = light ? '#f3f8ff' : '#050b1c';
  };
  if (themeButton) themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('mohit-portfolio-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeButton();
  });
  updateThemeButton();

  const menuButton = $('.menu-toggle');
  const nav = $('.topbar nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
    $$('a', nav).forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.textContent = '☰';
    }));
  }

  // Reveal section content as it enters view.
  const revealTargets = $$('.section-kicker, .intro-layout, .orbit-stage, .timeline-heading, .timeline-world, .projects-heading, .project-card, .project-note, .about-layout, .final-bottom');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add('in-view'));

  // Timeline copy: honest starter milestones, easy to replace with your actual history.
  const chapters = [
    {year:'2021',title:'Curiosity starts everything.',copy:'The beginning isn’t always a big moment. Sometimes it’s simply asking more questions and wanting to understand how things work.',status:'THE FIRST SPARK'},
    {year:'2022',title:'Build the foundations.',copy:'Learning how to learn: developing patience, building study habits, and getting comfortable with the basics one step at a time.',status:'LAYING THE GROUNDWORK'},
    {year:'2023',title:'Explore beyond the obvious.',copy:'Following interests, trying new things, and discovering that the best questions often lead to unexpected directions.',status:'WIDENING THE LENS'},
    {year:'2024',title:'Start finding a direction.',copy:'Connecting curiosity with a future in technology, and thinking about the kinds of problems I want to learn how to solve.',status:'A DIRECTION EMERGES'},
    {year:'2025',title:'Prepare for the next chapter.',copy:'Putting in the work to move forward academically and getting ready to turn an interest in computing into a focused path.',status:'GETTING READY'},
    {year:'2026',title:'A new chapter begins.',copy:'Starting B.Tech CSE (AI) at NIAT × Geeta University. The plan is simple: keep learning, build real projects, and improve through practice.',status:'IN PROGRESS'},
  ];
  const nodes = $$('.year-node');
  const hand = $('.clock-hand');
  const progress = $('.line-progress');
  let activeIndex = 0;
  function selectChapter(index) {
    activeIndex = Math.max(0, Math.min(chapters.length-1, index));
    const chapter = chapters[activeIndex];
    nodes.forEach((node,i) => { node.classList.toggle('active',i===activeIndex); node.setAttribute('aria-pressed',String(i===activeIndex)); });
    $('#chapter-number').textContent = String(activeIndex+1).padStart(2,'0');
    $('#chapter-year').textContent = chapter.year;
    $('#chapter-title').textContent = chapter.title;
    $('#chapter-copy').textContent = chapter.copy;
    $('#chapter-status').textContent = chapter.status;
    if (hand) hand.style.transform = `rotate(${-55 + activeIndex*22.6}deg)`;
    if (progress) progress.style.width = `${activeIndex/(chapters.length-1)*100}%`;
  }
  nodes.forEach((node,i) => {
    node.style.setProperty('--i',i);
    node.addEventListener('click', () => selectChapter(i));
    node.addEventListener('mouseenter', () => { if (window.matchMedia('(hover:hover)').matches) selectChapter(i); });
    node.addEventListener('focus', () => selectChapter(i));
  });
  const timeline = $('.timeline-world');
  if (timeline) timeline.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const rect = timeline.getBoundingClientRect();
    const ratio = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    selectChapter(Math.round(ratio*(chapters.length-1)));
  });
  selectChapter(0);
  $('#year-now').textContent = new Date().getFullYear();

  // Gentle pointer response on desktop for a little cinematic depth.
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      $('.hero-wordmark').style.transform = `translate(calc(-50% + ${x*12}px),calc(-50% + ${y*8}px))`;
      if ($('.hero-figure')) $('.hero-figure').style.marginLeft = `${x*-10}px`;
    });
    hero.addEventListener('pointerleave', () => {
      $('.hero-wordmark').style.transform = 'translate(-50%,-50%)'; if ($('.hero-figure')) $('.hero-figure').style.marginLeft = '0';
    });
  }
})();
