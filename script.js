/* ═══════════════════════════════════════════════════════
   Loom Analytics — Interactions
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Page Loader Logic ── */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderNumber = document.getElementById('loaderNumber');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 5) + 1; // Randomized increments for organic feel
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      // Premium transition delay
      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger hero reveals after loader is gone
        setTimeout(triggerHeroReveals, 400);
      }, 500);
    }

    loaderBar.style.height = `${progress}%`;
    loaderNumber.textContent = `${progress}%`;
  }, 50);

  /* ── Sticky Header ── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  /* ── Intersection Observer for Reveals ── */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Trigger reveals only for non-hero elements via observer
  // Hero elements are handled separately to ensure they reveal on load
  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.closest('#hero')) {
      observer.observe(el);
    }
  });

  function triggerHeroReveals() {
    const heroReveals = document.querySelectorAll('#hero .reveal');
    heroReveals.forEach(el => {
      el.classList.add('active');
    });
  }

  /* ── Word-by-Word Text Splitting ── */
  function splitTextIntoWords(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      let wordCount = 0;
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const content = node.textContent;
          // Split by whitespace but keep the whitespace as separate entries if needed
          // or just match words and handle the spaces
          const words = content.split(/(\s+)/);
          const fragment = document.createDocumentFragment();

          words.forEach((word) => {
            if (word.trim() === "") {
              if (word.length > 0) fragment.appendChild(document.createTextNode(word));
            } else {
              const span = document.createElement('span');
              span.className = 'reveal-word';
              span.style.setProperty('--i', wordCount++);
              span.textContent = word;
              fragment.appendChild(span);
            }
          });
          return fragment;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newEl = node.cloneNode(false);
          Array.from(node.childNodes).forEach(child => {
            newEl.appendChild(processNode(child));
          });
          return newEl;
        }
        return node.cloneNode(true);
      };

      const newContent = document.createDocumentFragment();
      Array.from(el.childNodes).forEach(child => {
        newContent.appendChild(processNode(child));
      });
      el.innerHTML = '';
      el.appendChild(newContent);
    });
  }

  // Split hero text before animating
  splitTextIntoWords('.hero__headline');
  splitTextIntoWords('.hero__sub');

  /* ── Interactive Dot Grid Background ── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, rows, cols;
    const spacing = 30;
    const dots = [];
    let mouse = { x: -50, y: -50 };

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      dots.length = 0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * spacing,
            y: j * spacing,
            baseX: i * spacing,
            baseY: j * spacing
          });
        }
      }
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(225, 29, 72, 0.15)'; // Adjusted to a subtle 20% opacity

      dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          dot.x -= dx * force * 0.1;
          dot.y -= dy * force * 0.1;
        } else {
          dot.x += (dot.baseX - dot.x) * 0.05;
          dot.y += (dot.baseY - dot.y) * 0.05;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2); // Increased dot radius from 1 to 1.5
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    init();
    animate();
  }

  /* ── Interactive Tilt on Browser Mockup ── */
  const mockup = document.querySelector('.browser-mockup');
  if (mockup) {
    mockup.parentElement.addEventListener('mousemove', (e) => {
      const rect = mockup.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;

      // Apply tilt while maintaining the base 2deg rotation for the float animation
      mockup.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y + 1}deg) translateY(-10px)`;
    });

    mockup.parentElement.addEventListener('mouseleave', () => {
      mockup.style.transform = '';
    });
  }

  /* ── Dynamic Chart Bar Animation ── */
  const chart = document.querySelector('.dashboard-chart');
  if (chart) {
    const chartObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.chart-bar').forEach((bar, i) => {
          setTimeout(() => {
            bar.style.opacity = '0.6';
          }, i * 100);
        });
        chartObserver.unobserve(chart);
      }
    }, { threshold: 0.5 });
    chartObserver.observe(chart);
  }

  /* ── Mobile Navigation ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('open');
  });

  /* ── Magnetic Buttons ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Subtle magnetic pull (15% of distance)
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── Smooth Scroll for Anchor Links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // If mobile nav is open, close it
        navLinks.classList.remove('active');
        hamburger.classList.remove('open');
      }
    });
  });

  /* ── Dynamic Scroll Opacity for Insights ── */
  const insightsElements = document.querySelectorAll('.features__content .section__header, .feature-list li');

  function updateInsightsOpacity() {
    const vh = window.innerHeight;
    const midpoint = vh / 2;

    insightsElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top;

      // Calculate opacity: 0 at bottom, 1 at midpoint and above
      // (vh - elementTop) is the distance from the bottom of the viewport
      // Dividing by midpoint means it reaches 1.0 when elementTop is at the midpoint
      let opacity = (vh - elementTop) / midpoint;

      // Clamp between 0 and 1
      opacity = Math.min(Math.max(opacity, 0), 1);

      el.style.opacity = opacity;
    });
  }

  // Initial call and scroll listener
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateInsightsOpacity);
  });

  // Initial run to set state on load
  updateInsightsOpacity();
});
