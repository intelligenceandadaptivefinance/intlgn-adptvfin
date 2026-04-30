/* ============================================================
   Agentic AI for Finance — Edition 01
   Interactivity: progress bar, nav, diagram, quizzes, capstone PDF
   ============================================================ */

(function () {
  'use strict';

  /* -----------------------------------------------------------
     1. READING PROGRESS BAR
     ----------------------------------------------------------- */
  const progressBar = document.getElementById('readingProgress');
  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const pct = docHeight > 0 ? Math.min(100, (scrolled / docHeight) * 100) : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* -----------------------------------------------------------
     2. NAV RAIL — active section highlighting
     ----------------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-list a'));
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav() {
    const scrollY = window.scrollY + 140; // offset for masthead
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollY) activeIdx = i;
    }
    navLinks.forEach((link, i) => {
      link.classList.toggle('is-active', i === activeIdx);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* -----------------------------------------------------------
     3. ARCHITECTURE DIAGRAM TOGGLES
     ----------------------------------------------------------- */
  const stage = document.getElementById('diagramStage');
  const toggleBtns = document.querySelectorAll('.toggle-btn[data-layer]');
  const resetBtn = document.getElementById('resetDiagram');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      const cls = 'show-' + layer;
      stage.classList.toggle(cls);
      btn.classList.toggle('is-on', stage.classList.contains(cls));
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['tools', 'memory', 'hitl', 'reflection', 'guardrails', 'techstack', 'trace'].forEach(layer => {
        stage.classList.remove('show-' + layer);
      });
      toggleBtns.forEach(b => b.classList.remove('is-on'));
    });
  }

  /* -----------------------------------------------------------
     4. QUIZ LOGIC
     ----------------------------------------------------------- */
  const FEEDBACK = {
    correct: [
      'Correct.',
      'Right — that\'s the one.',
      'Yes. That\'s the safer architecture.',
      'Exactly. That\'s the pattern.',
      'Correct. The cure is structural, not behavioural.'
    ],
    incorrect: [
      'Not quite. Re-read the section above.',
      'Close, but the better answer prioritises auditability.',
      'No — that\'s the failure mode, not the cure.',
      'Have another look at the decision rule above.'
    ]
  };

  document.querySelectorAll('.quiz-question').forEach(q => {
    const buttons = q.querySelectorAll('.quiz-options button');
    const feedback = q.querySelector('.quiz-feedback');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.dataset.answered === 'true') return;
        q.dataset.answered = 'true';
        const isCorrect = btn.dataset.correct === 'true';

        buttons.forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.classList.add('correct');
          } else if (b === btn) {
            b.classList.add('incorrect');
          } else {
            b.classList.add('fade');
          }
        });

        feedback.classList.add('show');
        if (isCorrect) {
          feedback.textContent = FEEDBACK.correct[Math.floor(Math.random() * FEEDBACK.correct.length)];
          feedback.style.color = '#2E6B3C';
        } else {
          feedback.textContent = FEEDBACK.incorrect[Math.floor(Math.random() * FEEDBACK.incorrect.length)];
          feedback.style.color = '#9B2A2A';
        }
      });
    });
  });

  /* -----------------------------------------------------------
     5. CAPSTONE FORM — validation & PDF generation
     ----------------------------------------------------------- */
  const generateBtn = document.getElementById('generatePdf');
  const formStatus = document.getElementById('formStatus');

  function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function getCheckedDbs() {
    return Array.from(document.querySelectorAll('.checks input[type="checkbox"]:checked'))
      .map(cb => cb.value);
  }

  function validateForm() {
    const required = [
      'cf-name', 'cf-author', 'cf-outcome', 'cf-loop',
      'cf-determ', 'cf-memory', 'cf-hitl', 'cf-wrong',
      'cf-pii', 'cf-metric'
    ];
    const missing = [];
    required.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('invalid');
      if (!el.value.trim()) {
        el.classList.add('invalid');
        missing.push(id);
      }
    });
    const dbs = getCheckedDbs();
    const dbContainer = document.querySelector('.checks');
    dbContainer.classList.remove('invalid');
    if (dbs.length === 0) {
      dbContainer.style.borderLeft = '2px solid #9B2A2A';
      dbContainer.style.paddingLeft = '10px';
      missing.push('cf-db');
    } else {
      dbContainer.style.borderLeft = '';
      dbContainer.style.paddingLeft = '';
    }
    return missing;
  }

  function setStatus(msg, type) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status ' + (type || '');
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const missing = validateForm();
      if (missing.length > 0) {
        setStatus('Please complete the required fields before generating.', 'error');
        const firstMissing = document.getElementById(missing[0]) || document.querySelector('.checks');
        if (firstMissing) firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setStatus('Generating your PDF…', '');

      // Wait for jsPDF to load
      if (typeof window.jspdf === 'undefined') {
        setStatus('PDF library still loading — try again in a moment.', 'error');
        return;
      }

      try {
        await generatePdf();
        setStatus('Downloaded. Bring it to your team.', 'success');
      } catch (err) {
        console.error(err);
        setStatus('Something went wrong generating the PDF.', 'error');
      }
    });
  }

  async function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 50;
    const colW = pageW - margin * 2;

    // Colours
    const ink = [15, 42, 68];
    const inkSoft = [42, 62, 85];
    const slate = [107, 116, 128];
    const amber = [199, 122, 24];

    // ===== HEADER =====
    doc.setFillColor(...ink);
    doc.rect(0, 0, pageW, 6, 'F');

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...amber);
    doc.text('AGENTIC AI FOR FINANCE — CAPSTONE WORKSHEET', margin, 36);

    doc.setFont('times', 'normal');
    doc.setFontSize(22);
    doc.setTextColor(...ink);
    const useCaseName = getFieldValue('cf-name');
    const wrappedTitle = doc.splitTextToSize(useCaseName, colW);
    doc.text(wrappedTitle, margin, 64);

    let y = 64 + (wrappedTitle.length * 24) + 8;

    // Author + date line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(getFieldValue('cf-author') + '  ·  ' + dateStr, margin, y);
    y += 16;

    // Hairline rule
    doc.setDrawColor(...slate);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 22;

    // ===== BUSINESS OUTCOME =====
    y = addSection(doc, 'BUSINESS OUTCOME', getFieldValue('cf-outcome'), margin, y, colW, ink, slate, inkSoft, true);

    // ===== ARCHITECTURAL CHOICES =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...amber);
    doc.text('ARCHITECTURE', margin, y);
    y += 14;
    doc.setDrawColor(...amber);
    doc.setLineWidth(0.4);
    doc.line(margin, y - 8, margin + 60, y - 8);

    y = addLabelValue(doc, 'Loop pattern', getFieldValue('cf-loop'), margin, y, colW, ink, slate, inkSoft);
    y = addLabelValue(doc, 'Memory needs', getFieldValue('cf-memory'), margin, y, colW, ink, slate, inkSoft);

    const dbs = getCheckedDbs().join(' · ');
    y = addLabelValue(doc, 'Databases', dbs, margin, y, colW, ink, slate, inkSoft);

    y += 8;

    // ===== DETERMINISM =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...amber);
    doc.text('DETERMINISM BOUNDARY', margin, y);
    y += 14;
    doc.setDrawColor(...amber);
    doc.line(margin, y - 8, margin + 130, y - 8);

    y = addLabelValue(doc, 'Must be deterministic (code)', getFieldValue('cf-determ'), margin, y, colW, ink, slate, inkSoft);
    const stoch = getFieldValue('cf-stoch');
    if (stoch) {
      y = addLabelValue(doc, 'Acceptable to be model-generated', stoch, margin, y, colW, ink, slate, inkSoft);
    }

    y += 8;

    // ===== SAFETY & CONTROLS =====
    if (y > pageH - 200) { doc.addPage(); y = 60; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...amber);
    doc.text('SAFETY & CONTROLS', margin, y);
    y += 14;
    doc.setDrawColor(...amber);
    doc.line(margin, y - 8, margin + 110, y - 8);

    y = addLabelValue(doc, 'Human checkpoints', getFieldValue('cf-hitl'), margin, y, colW, ink, slate, inkSoft);
    y = addLabelValue(doc, 'What could go wrong', getFieldValue('cf-wrong'), margin, y, colW, ink, slate, inkSoft);
    y = addLabelValue(doc, 'Data that must never reach the model', getFieldValue('cf-pii'), margin, y, colW, ink, slate, inkSoft);

    y += 8;

    // ===== SUCCESS & ECONOMICS =====
    if (y > pageH - 140) { doc.addPage(); y = 60; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...amber);
    doc.text('SUCCESS & ECONOMICS', margin, y);
    y += 14;
    doc.setDrawColor(...amber);
    doc.line(margin, y - 8, margin + 130, y - 8);

    y = addLabelValue(doc, 'Success metric', getFieldValue('cf-metric'), margin, y, colW, ink, slate, inkSoft);
    const cost = getFieldValue('cf-cost');
    if (cost) {
      y = addLabelValue(doc, 'Estimated cost per run', cost, margin, y, colW, ink, slate, inkSoft);
    }

    const notes = getFieldValue('cf-notes');
    if (notes) {
      if (y > pageH - 90) { doc.addPage(); y = 60; }
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...amber);
      doc.text('NOTES & OPEN QUESTIONS', margin, y);
      y += 14;
      doc.setDrawColor(...amber);
      doc.line(margin, y - 8, margin + 145, y - 8);
      y = addLabelValue(doc, '', notes, margin, y, colW, ink, slate, inkSoft);
    }

    // ===== FOOTER (bottom of last page) =====
    const finalPageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...slate);
    doc.setLineWidth(0.3);
    doc.line(margin, finalPageH - 50, pageW - margin, finalPageH - 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text('Generated from the Agentic AI for Finance scoping course · Edition 01', margin, finalPageH - 32);
    doc.text('Move from single-shot → ReAct → Plan-and-Execute → +Reflection → +HITL. Earn complexity.', margin, finalPageH - 20);

    // Filename
    const safeName = useCaseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'agentic-use-case';
    doc.save(safeName + '-scoped.pdf');
  }

  // ----- PDF helper functions -----
  function addSection(doc, label, value, x, y, w, ink, slate, inkSoft, isLede) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text(label, x, y);
    y += 14;

    doc.setFont('times', isLede ? 'normal' : 'normal');
    doc.setFontSize(isLede ? 13 : 11);
    doc.setTextColor(...ink);
    const lines = doc.splitTextToSize(value, w);
    doc.text(lines, x, y);
    y += lines.length * (isLede ? 16 : 14) + 14;
    return y;
  }

  function addLabelValue(doc, label, value, x, y, w, ink, slate, inkSoft) {
    if (label) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text(label.toUpperCase(), x, y);
      y += 12;
    }
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...inkSoft);
    const lines = doc.splitTextToSize(value, w);
    doc.text(lines, x, y);
    y += lines.length * 14 + 10;
    return y;
  }

})();
