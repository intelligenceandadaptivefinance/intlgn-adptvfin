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

// ===================================
// DECISION TREE (Section 3.5)
// ===================================
let decisionTreeAnswers = {};

document.addEventListener('DOMContentLoaded', function() {
  // Decision Tree button click handling
  const dtOptions = document.querySelectorAll('.dt-option');
  dtOptions.forEach(btn => {
    btn.addEventListener('click', function() {
      const currentQuestion = this.closest('.dt-question').getAttribute('data-question');
      const value = this.getAttribute('data-value');
      const nextQuestion = this.getAttribute('data-next');
      
      // Store answer
      decisionTreeAnswers['q' + currentQuestion] = value;
      
      // Hide current question
      document.querySelector(`.dt-question[data-question="${currentQuestion}"]`).removeAttribute('data-active');
      
      // Show next question or result
      if (nextQuestion === 'result') {
        showDecisionTreeResult();
      } else {
        document.querySelector(`.dt-question[data-question="${nextQuestion}"]`).setAttribute('data-active', 'true');
      }
    });
  });
});

function showDecisionTreeResult() {
  // Generate recommendation based on answers
  const result = generateStackRecommendation(decisionTreeAnswers);
  
  // Update result display
  document.getElementById('resultDatabase').textContent = result.database.tech;
  document.getElementById('resultDatabaseCost').textContent = result.database.cost;
  document.getElementById('resultDatabaseWhy').textContent = result.database.why;
  
  document.getElementById('resultReporting').textContent = result.reporting.tech;
  document.getElementById('resultReportingCost').textContent = result.reporting.cost;
  document.getElementById('resultReportingWhy').textContent = result.reporting.why;
  
  document.getElementById('resultDashboard').textContent = result.dashboard.tech;
  document.getElementById('resultDashboardCost').textContent = result.dashboard.cost;
  document.getElementById('resultDashboardWhy').textContent = result.dashboard.why;
  
  document.getElementById('resultForms').textContent = result.forms.tech;
  document.getElementById('resultFormsCost').textContent = result.forms.cost;
  document.getElementById('resultFormsWhy').textContent = result.forms.why;
  
  document.getElementById('resultIntegration').textContent = result.integration.tech;
  document.getElementById('resultIntegrationCost').textContent = result.integration.cost;
  document.getElementById('resultIntegrationWhy').textContent = result.integration.why;
  
  document.getElementById('resultOrchestration').textContent = result.orchestration.tech;
  document.getElementById('resultOrchestrationCost').textContent = result.orchestration.cost;
  document.getElementById('resultOrchestrationWhy').textContent = result.orchestration.why;
  
  document.getElementById('resultLLM').textContent = result.llm.tech;
  document.getElementById('resultLLMCost').textContent = result.llm.cost;
  document.getElementById('resultLLMWhy').textContent = result.llm.why;
  
  document.getElementById('resultTotalMonthly').innerHTML = result.totalMonthly;
  document.getElementById('resultTotalSetup').innerHTML = result.totalSetup;
  document.getElementById('resultTimeline').textContent = result.timeline;
  document.getElementById('resultCompliance').innerHTML = result.compliance;
  
  // Show result screen
  document.getElementById('dtResult').setAttribute('data-active', 'true');
}

function generateStackRecommendation(answers) {
  const result = {
    database: {},
    reporting: {},
    dashboard: {},
    forms: {},
    integration: {},
    orchestration: {},
    llm: {},
    totalMonthly: '',
    totalSetup: '',
    timeline: '',
    compliance: ''
  };
  
  // Database recommendation
  if (answers.q2 === 'relational') {
    result.database = {
      tech: 'PostgreSQL + pgvector',
      cost: '$100-300/month • ₹8,000-24,000/month',
      why: 'Structured GL data with ACID guarantees + semantic search capability via pgvector extension'
    };
  } else if (answers.q2 === 'graph') {
    result.database = {
      tech: 'Neo4j + PostgreSQL',
      cost: '$500-1,500/month • ₹40,000-1,20,000/month',
      why: 'Neo4j for relationship queries (ownership chains, intercompany flows) + PostgreSQL for transactional data'
    };
  } else if (answers.q2 === 'unstructured') {
    result.database = {
      tech: 'PostgreSQL + Pinecone',
      cost: '$200-600/month • ₹16,000-48,000/month',
      why: 'Pinecone for semantic search over documents + PostgreSQL for structured metadata'
    };
  } else {
    result.database = {
      tech: 'PostgreSQL + pgvector + MongoDB',
      cost: '$300-800/month • ₹24,000-64,000/month',
      why: 'PostgreSQL for transactions, pgvector for semantic search, MongoDB for variable-structure documents'
    };
  }
  
  // Reporting recommendation
  if (answers.q3 === 'powerbi') {
    result.reporting = {
      tech: 'Power BI',
      cost: '$10-15/user/month × 15 users = $150-225/month • ₹12,000-18,000/month',
      why: 'Existing licenses, familiar to controllers, enterprise governance already configured'
    };
  } else if (answers.q3 === 'tableau') {
    result.reporting = {
      tech: 'Tableau',
      cost: '$15-25/user/month × 15 users = $225-375/month • ₹18,000-30,000/month',
      why: 'Existing licenses, strong visualization capabilities, team already trained'
    };
  } else {
    result.reporting = {
      tech: 'Metabase (open source)',
      cost: '$0/month (self-hosted) + $100-200 infrastructure • ₹8,000-16,000 infrastructure',
      why: 'Budget-friendly, self-hosted for data control, SQL-first approach'
    };
  }
  
  // Dashboard recommendation
  if (answers.q4 === 'yes-custom' && answers.q9 === 'has-frontend') {
    result.dashboard = {
      tech: 'React + Recharts',
      cost: '$0/month operational + $5,000-10,000 build • ₹4,00,000-8,00,000 build',
      why: 'Custom agent UI with real-time updates, tool trace visibility, full control over UX'
    };
  } else if (answers.q4 === 'yes-custom' && answers.q9 === 'no-frontend') {
    result.dashboard = {
      tech: 'Retool',
      cost: '$10-50/user/month × 10 users = $100-500/month • ₹8,000-40,000/month',
      why: 'Low-code dashboard builder, fast to deploy, no frontend engineers needed'
    };
  } else {
    result.dashboard = {
      tech: 'Power BI / Tableau (from reporting layer)',
      cost: 'Included in reporting cost',
      why: 'Standard BI dashboards sufficient for agent monitoring and reporting'
    };
  }
  
  // Forms recommendation
  if (answers.q9 === 'has-frontend') {
    result.forms = {
      tech: 'React Hook Form',
      cost: '$0/month (open source)',
      why: 'Client-side validation, field dependencies, TypeScript support, integrates with React dashboard'
    };
  } else {
    result.forms = {
      tech: 'Cognito Forms / Typeform',
      cost: '$15-50/month • ₹1,200-4,000/month',
      why: 'No-code form builder, conditional logic built-in, easy for non-technical users to configure'
    };
  }
  
  // Integration recommendation
  result.integration = {
    tech: 'REST API',
    cost: '$0/month (included in infrastructure)',
    why: 'Standard integration pattern, mature, every ERP system provides REST APIs'
  };
  
  // Orchestration recommendation
  if (answers.q1 === 'python') {
    result.orchestration = {
      tech: 'LangGraph',
      cost: '$0/month (open source) + $200-600/month hosting • ₹16,000-48,000/month hosting',
      why: 'Python-native, built-in HITL and state persistence, production-ready, active community'
    };
  } else if (answers.q1 === 'csharp') {
    result.orchestration = {
      tech: 'Semantic Kernel',
      cost: '$0/month (open source) + $200-600/month hosting • ₹16,000-48,000/month hosting',
      why: '.NET native, Azure integration, familiar to your team, enterprise logging'
    };
  } else {
    result.orchestration = {
      tech: 'LangGraph',
      cost: '$0/month (open source) + $200-600/month hosting • ₹16,000-48,000/month hosting',
      why: 'Most mature option, language-agnostic via API, production-ready'
    };
  }
  
  // LLM costs
  result.llm = {
    tech: 'Claude Sonnet 4',
    cost: '$0.40-1.20/run • ₹32-96/run (100-300 runs/month = $40-360/month • ₹3,200-28,800/month)',
    why: 'Based on typical close review agent: 2,000-6,000 tokens input, 1,000-3,000 tokens output per run'
  };
  
  // Calculate totals
  const budgetRange = answers.q7;
  if (budgetRange === 'budget-low') {
    result.totalMonthly = '$400-800/month<br/>₹32,000-64,000/month';
    result.totalSetup = '$5,000-12,000<br/>₹4,00,000-9,60,000';
  } else if (budgetRange === 'budget-mid') {
    result.totalMonthly = '$800-1,800/month<br/>₹64,000-1,44,000/month';
    result.totalSetup = '$10,000-20,000<br/>₹8,00,000-16,00,000';
  } else if (budgetRange === 'budget-high') {
    result.totalMonthly = '$2,000-4,000/month<br/>₹1,60,000-3,20,000/month';
    result.totalSetup = '$20,000-40,000<br/>₹16,00,000-32,00,000';
  } else {
    result.totalMonthly = '$4,000-8,000/month<br/>₹3,20,000-6,40,000/month';
    result.totalSetup = '$40,000-80,000<br/>₹32,00,000-64,00,000';
  }
  
  // Timeline
  if (answers.q8 === 'timeline-fast') {
    result.timeline = '2-4 weeks (rapid prototype, limited features)';
  } else if (answers.q8 === 'timeline-normal') {
    result.timeline = '8-12 weeks (full features, testing, documentation)';
  } else {
    result.timeline = '4-6 months (enterprise rollout, change management, training)';
  }
  
  // Compliance
  if (answers.q5 === 'eu' || answers.q5 === 'multi') {
    result.compliance = '<strong>GDPR Compliance Required:</strong> EU data residency (AWS Frankfurt/Ireland or Azure West Europe), tenant isolation via row-level security in PostgreSQL, data retention policies matching client contracts (typically 7 years for audit records), encryption at rest (AES-256) and in transit (TLS 1.3), regular penetration testing, DPIA (Data Protection Impact Assessment) for high-risk processing.';
  } else if (answers.q5 === 'uk') {
    result.compliance = '<strong>UK GDPR Compliance:</strong> UK data residency, ICO registration, tenant isolation, 7-year retention for audit records, encryption at rest and in transit, documented data processing agreements with vendors.';
  } else if (answers.q5 === 'us') {
    result.compliance = '<strong>US Compliance:</strong> SOC 2 Type II recommended for enterprise clients, CCPA compliance for California clients, tenant isolation, encryption standards, audit logging for financial data access.';
  } else if (answers.q5 === 'india') {
    result.compliance = '<strong>Indian Compliance:</strong> Data localization as per RBI guidelines if handling payment data, tenant isolation, encryption standards, audit trails for financial transactions, retention policies per Companies Act 2013.';
  } else {
    result.compliance = '<strong>Multi-Jurisdiction Compliance:</strong> Strictest standard applies (GDPR + local regulations), data residency requirements vary by jurisdiction, documented cross-border transfer mechanisms, unified tenant isolation architecture.';
  }
  
  // Multi-tenant security note
  if (answers.q6 === 'multi-tenant') {
    result.compliance += ' <strong>Multi-tenant architecture:</strong> Row-level security (RLS) in PostgreSQL mandatory, separate encryption keys per tenant, audit logging with tenant ID on every query, network isolation for tenant data processing.';
  }
  
  return result;
}

function resetDecisionTree() {
  decisionTreeAnswers = {};
  document.querySelectorAll('.dt-question').forEach(q => q.removeAttribute('data-active'));
  document.querySelector('.dt-question[data-question="1"]').setAttribute('data-active', 'true');
  document.getElementById('dtResult').removeAttribute('data-active');
}

// ===================================
// RBAC MATRIX MODEL SELECTOR
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  const rbacModelBtns = document.querySelectorAll('.rbac-model-btn');
  
  rbacModelBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const modelType = this.getAttribute('data-model');
      
      // Update button states
      rbacModelBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Hide all models
      document.querySelectorAll('.rbac-model').forEach(model => {
        model.removeAttribute('data-active');
      });
      
      // Show selected model
      const modelMap = {
        'simple': 'rbacSimple',
        'function': 'rbacFunction',
        'entity': 'rbacEntity'
      };
      document.getElementById(modelMap[modelType]).setAttribute('data-active', 'true');
    });
  });
});

function highlightRBACAccess(role) {
  // This is a placeholder for diagram highlighting functionality
  // In a real implementation, this would highlight specific nodes in the architecture diagram
  
  const accessMap = {
    'analyst': {
      components: ['Input Form', 'Output'],
      description: 'Analyst can submit requests via Input Form and view their own results in Output. No access to configuration, approval workflows, or other clients data.'
    },
    'controller': {
      components: ['Input Form', 'Output', 'Human-in-the-loop', 'Memory (session only)'],
      description: 'Controller can submit requests, view all results for their client, approve flagged items at HITL checkpoint, and access session memory. Cannot configure agent or access other clients.'
    },
    'partner': {
      components: ['Input Form', 'Orchestrator (config)', 'Tools', 'Memory', 'Output', 'Human-in-the-loop'],
      description: 'Partner has full operational access: submit requests, configure agent parameters, access all memory, review audit logs, approve items. Can access all clients in their portfolio. Cannot modify system RBAC settings.'
    },
    'admin': {
      components: ['All components'],
      description: 'Admin has system-wide access: all Partner permissions plus RBAC configuration, tool integration management, and access to all audit logs across all clients.'
    }
  };
  
  const access = accessMap[role];
  alert(`${role.toUpperCase()} ACCESS:\n\nComponents: ${access.components.join(', ')}\n\n${access.description}`);
}

/* ========================================
   COLLAPSIBLE NAVIGATION
   ======================================== */
function toggleNavGroup(groupName) {
  const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);
  if (group) {
    group.classList.toggle('collapsed');
  }
}

// Auto-expand group containing current section
document.addEventListener('DOMContentLoaded', function() {
  // Map sections to groups
  const groupMapping = {
    fundamentals: ['s0', 's1', 's2'],
    architecture: ['s3', 's35', 's375'],
    core: ['s4', 's5', 's6', 's7', 's8'],
    safety: ['s85', 's9', 's10'],
    implementation: ['s11', 's12', 's13']
  };
  
  // Get current section from URL hash or default to s0
  let currentSection = window.location.hash.substring(1) || 's0';
  
  // Find which group contains current section
  let currentGroup = null;
  for (const [group, sections] of Object.entries(groupMapping)) {
    if (sections.includes(currentSection)) {
      currentGroup = group;
      break;
    }
  }
  
  // Collapse all groups except the one containing current section
  document.querySelectorAll('.nav-group').forEach(group => {
    const groupName = group.getAttribute('data-group');
    if (groupName !== currentGroup) {
      group.classList.add('collapsed');
    }
  });
  
  // Mark current section as active
  document.querySelectorAll('.nav-group-items a').forEach(link => {
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.setAttribute('aria-current', 'page');
    }
  });
  
  // Update active section on hash change
  window.addEventListener('hashchange', function() {
    const newSection = window.location.hash.substring(1);
    document.querySelectorAll('.nav-group-items a').forEach(link => {
      if (link.getAttribute('href') === `#${newSection}`) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
});
