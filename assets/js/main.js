/* Haroon Raza portfolio: small, dependency-free interactions */
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Mobile navigation
  const menuButton = $('[data-menu-toggle]');
  const navLinks = $('[data-nav-links]');
  if (menuButton && navLinks) {
    const closeMenu = () => {
      menuButton.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    };

    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.classList.toggle('is-open', !open);
      menuButton.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });

    $$('a', navLinks).forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  // Current year (keeps the footer current without changing static content)
  $$('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  // Subtle entrance reveals; all content remains visible without JavaScript.
  const revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Shared category filters (projects and articles)
  $$('[data-filter-controls]').forEach((controls) => {
    const targetSelector = controls.dataset.filterControls;
    const targets = $$(targetSelector);
    const resultNode = controls.parentElement?.querySelector('[data-filter-result]');

    $$('[data-filter]', controls).forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        $$('[data-filter]', controls).forEach((control) => {
          control.classList.toggle('active', control === button);
          control.setAttribute('aria-pressed', String(control === button));
        });

        let visible = 0;
        targets.forEach((target) => {
          const categories = (target.dataset.categories || '').toLowerCase().split(/\s+/);
          const matches = filter === 'all' || categories.includes(filter.toLowerCase());
          target.classList.toggle('is-hidden', !matches);
          if (matches) visible += 1;
        });

        if (resultNode) {
          resultNode.textContent = `${visible} ${visible === 1 ? 'item' : 'items'} shown`;
        }
      });
    });
  });

  // Search the blog title, summary, and tags.
  const blogSearch = $('[data-blog-search]');
  if (blogSearch) {
    const cards = $$('[data-blog-card]');
    const empty = $('[data-empty-search]');
    const updateSearch = () => {
      const query = blogSearch.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
        const matches = !query || haystack.includes(query);
        card.classList.toggle('is-hidden', !matches);
        if (matches) visible += 1;
      });
      empty?.classList.toggle('visible', visible === 0);
    };
    blogSearch.addEventListener('input', updateSearch);
  }

  // Lightweight static contact form: it assembles a thoughtful, readable mailto.
  const contactForm = $('[data-contact-form]');
  if (contactForm) {
    const status = $('[data-form-status]', contactForm);
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const topic = String(formData.get('topic') || '').trim();
      const message = String(formData.get('message') || '').trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      status?.classList.remove('success', 'error');
      if (!name || !validEmail || !message) {
        if (status) {
          status.textContent = 'Please add your name, a valid email address, and a message.';
          status.classList.add('error');
        }
        return;
      }

      const subject = topic ? `Portfolio enquiry — ${topic}` : 'Portfolio enquiry';
      const body = [
        `Hello Haroon,`,
        '',
        message,
        '',
        `From: ${name}`,
        `Email: ${email}`,
      ].join('\n');
      const href = `mailto:haroonraza63@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (status) {
        status.textContent = 'Opening your email application with your message…';
        status.classList.add('success');
      }
      window.location.href = href;
    });
  }

  // Copy helpers for contact details and article links.
  $$('[data-copy-email]').forEach((button) => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail;
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        const original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = original; }, 1500);
      } catch {
        window.prompt('Copy this email address:', email);
      }
    });
  });

  $$('[data-share-link]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        const original = button.textContent;
        button.textContent = 'Link copied';
        setTimeout(() => { button.textContent = original; }, 1600);
      } catch {
        window.prompt('Copy this article URL:', url);
      }
    });
  });

  // Keep Resume in the compact terminal navigation grid when JavaScript is enabled; the original action remains the no-JS fallback.
  const compactNavLinks = $('.nav-links');
  const resumeAction = $('.nav-resume');
  if (compactNavLinks && resumeAction && !$('.nav-resume-inline', compactNavLinks)) {
    const resumeInline = resumeAction.cloneNode(true);
    resumeInline.className = 'nav-resume-inline';
    resumeInline.textContent = 'Resume ↗';
    compactNavLinks.appendChild(resumeInline);
  }

  const navShell = $('.nav-shell');
  if (navShell && !$('.header-social-utilities', navShell)) {
    const socialUtilities = document.createElement('div');
    socialUtilities.className = 'header-social-utilities';
    socialUtilities.setAttribute('aria-label', 'Profile and contact links');
    socialUtilities.innerHTML = `
      <a href="https://github.com/voltvirtuoso" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.42c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg><span>GitHub</span></a>
      <a href="https://www.linkedin.com/in/haroon-khr" target="_blank" rel="noopener noreferrer" aria-label="Open LinkedIn profile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 3H3.55A.55.55 0 0 0 3 3.55v16.9c0 .3.25.55.55.55h16.9c.3 0 .55-.25.55-.55V3.55a.55.55 0 0 0-.55-.55ZM8.35 18.35H5.65V9.7h2.7v8.65ZM7 8.52a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 0 1 0 3.12Zm11.35 9.83h-2.7v-4.2c0-1-.02-2.3-1.4-2.3-1.4 0-1.62 1.1-1.62 2.23v4.27h-2.7V9.7h2.6v1.18h.04c.36-.69 1.25-1.42 2.57-1.42 2.75 0 3.26 1.81 3.26 4.17v4.72Z"/></svg><span>LinkedIn</span></a>
      <a href="mailto:haroonraza63@gmail.com" aria-label="Email Haroon Raza"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3v-13Zm2 2v.35l7 4.9 7-4.9V7.5H5Zm14 8.75v-6.02l-7 4.9-7-4.9v6.02h14Z"/></svg><span>Email</span></a>`;
    navShell.appendChild(socialUtilities);
  }

  // Homepage introduction: terminal-style typing that pauses, erases, and repeats; reduced motion keeps the static line.
  const typewriter = $('[data-typewriter]');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (typewriter && !reducedMotion) {
    let lines = [typewriter.textContent || ''];
    try {
      const parsedLines = JSON.parse(typewriter.dataset.typewriterLines || '[]');
      if (Array.isArray(parsedLines) && parsedLines.length) lines = parsedLines.filter((line) => typeof line === 'string' && line.trim());
    } catch {
      // Keep the server-rendered first line as the safe fallback if the attribute is ever edited incorrectly.
    }
    typewriter.textContent = '';
    let index = 0;
    let isErasing = false;
    let lineIndex = 0;
    const typeLoop = () => {
      const text = lines[lineIndex] || '';
      typewriter.textContent = text.slice(0, index);
      if (!isErasing && index < text.length) {
        index += 1;
        window.setTimeout(typeLoop, index < 16 ? 32 : 21);
      } else if (!isErasing) {
        isErasing = true;
        window.setTimeout(typeLoop, 1650);
      } else if (index > 0) {
        index -= 1;
        window.setTimeout(typeLoop, 13);
      } else {
        isErasing = false;
        lineIndex = (lineIndex + 1) % lines.length;
        window.setTimeout(typeLoop, 420);
      }
    };
    window.setTimeout(typeLoop, 260);
  }
})();

/* Original portfolio field: connected sparrows + orange cursor treatment */
(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const canvas = document.getElementById('field');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    const linkDistance = 245;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.max(28, Math.min(74, Math.round((width * height) / 15000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .42,
        vy: (Math.random() - .5) * .42,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - .5) * .016,
        size: Math.random() * 10 + 7,
      }));
    };

    const sparrow = (particle) => {
      const s = particle.size;
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, -s * .6);
      ctx.lineTo(s * .2, 0);
      ctx.lineTo(s, s * .6);
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < linkDistance) {
            const alpha = (1 - distance / linkDistance) * .46;
            ctx.strokeStyle = `rgba(220, 220, 224, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rot += particle.vr;
        if (particle.x < -12 || particle.x > width + 12) particle.vx *= -1;
        if (particle.y < -12 || particle.y > height + 12) particle.vy *= -1;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rot);
        ctx.beginPath();
        sparrow(particle);
        ctx.fillStyle = 'rgba(235, 235, 238, .56)';
        ctx.fill();
        ctx.restore();
      });
      window.requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  const dot = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  const hasFinePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  if (dot && ring && hasFinePointer && !reducedMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }, { passive: true });
    document.addEventListener('mouseover', (event) => {
      ring.classList.toggle('hov', Boolean(event.target.closest('a, button, input, textarea')));
    });
    const moveRing = () => {
      ringX += (mouseX - ringX) * .16;
      ringY += (mouseY - ringY) * .16;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      window.requestAnimationFrame(moveRing);
    };
    moveRing();
  }

  // Image lightbox: open a content image, click it to zoom, click again to reset, and press Esc to close.
  const lightboxImages = $$('main img:not([data-no-zoom])');
  if (lightboxImages.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Expanded image');
    overlay.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close image">&times;</button><img class="lightbox-img" alt="" role="button" tabindex="0">';
    document.body.appendChild(overlay);
    const overlayImg = $('.lightbox-img', overlay);
    const closeBtn = $('.lightbox-close', overlay);
    let lastFocused = null;
    let zoom = 1;

    const updateZoom = () => {
      overlayImg.classList.toggle('is-zoomed', zoom > 1);
      overlayImg.setAttribute('aria-label', zoom > 1 ? 'Zoomed image. Click to zoom out.' : 'Expanded image. Click to zoom in.');
    };

    const openLightbox = (img) => {
      lastFocused = document.activeElement;
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || '';
      zoom = 1;
      updateZoom();
      overlay.classList.add('is-open');
      document.body.classList.add('lightbox-locked');
      closeBtn.focus();
    };

    const closeLightbox = () => {
      overlay.classList.remove('is-open');
      document.body.classList.remove('lightbox-locked');
      overlayImg.src = '';
      overlayImg.classList.remove('is-zoomed');
      if (lastFocused) lastFocused.focus();
    };

    lightboxImages.forEach((img) => {
      img.classList.add('is-zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Click to expand image');
      img.addEventListener('click', () => openLightbox(img));
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(img);
        }
      });
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeLightbox();
    });
    closeBtn.addEventListener('click', closeLightbox);
    overlayImg.addEventListener('click', () => {
      zoom = zoom > 1 ? 1 : 2;
      updateZoom();
    });
    overlayImg.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        zoom = zoom > 1 ? 1 : 2;
        updateZoom();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
    });
  }

  // Project and article cards should behave like their primary links, not only their small arrow controls.
  $$('.project-card, .blog-card, .info-card, .cert-card, .project-row').forEach((card) => {
    const primaryLink = $('a[href]', card);
    if (!primaryLink) return;
    const title = $('h2, h3', card)?.textContent?.trim() || primaryLink.textContent?.trim() || 'Open item';
    card.classList.add('is-card-link');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${title}`);
    const openCard = (event) => {
      if (event.target.closest('a, button, input, textarea, select, video')) return;
      if (event.metaKey || event.ctrlKey) window.open(primaryLink.href, '_blank', 'noopener');
      else window.location.href = primaryLink.href;
    };
    card.addEventListener('click', openCard);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = primaryLink.href;
      }
    });
  });
})();
