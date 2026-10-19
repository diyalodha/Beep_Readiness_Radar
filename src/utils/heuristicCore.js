// Browser-safe heuristic analysis engine.
// Shared between the client offline fallback and the Express backend.

export const SKILL_REGISTRY = [
  { canonical: 'react',         aliases: ['react', 'reactjs'],                   label: 'React' },
  { canonical: 'javascript',    aliases: ['javascript', 'ecmascript'],           label: 'JavaScript' },
  { canonical: 'typescript',    aliases: ['typescript'],                         label: 'TypeScript' },
  { canonical: 'node',          aliases: ['node', 'nodejs'],                     label: 'Node.js' },
  { canonical: 'express',       aliases: ['express', 'expressjs'],               label: 'Express' },
  { canonical: 'python',        aliases: ['python'],                             label: 'Python' },
  { canonical: 'java',          aliases: ['java'],                               label: 'Java' },
  { canonical: 'sql',           aliases: ['sql', 'mysql', 'advancedsql'],        label: 'SQL' },
  { canonical: 'mongodb',       aliases: ['mongodb'],                            label: 'MongoDB' },
  { canonical: 'postgresql',    aliases: ['postgresql', 'postgres'],             label: 'PostgreSQL' },
  { canonical: 'html',          aliases: ['html', 'html5'],                      label: 'HTML' },
  { canonical: 'css',           aliases: ['css', 'css3'],                        label: 'CSS' },
  { canonical: 'tailwind',      aliases: ['tailwind', 'tailwindcss'],            label: 'Tailwind CSS' },
  { canonical: 'git',           aliases: ['git'],                                label: 'Git' },
  { canonical: 'github',        aliases: ['github'],                             label: 'GitHub' },
  { canonical: 'docker',        aliases: ['docker'],                             label: 'Docker' },
  { canonical: 'aws',           aliases: ['aws', 'amazonwebservices'],           label: 'AWS' },
  { canonical: 'redux',         aliases: ['redux', 'reduxtoolkit'],              label: 'Redux' },
  { canonical: 'zustand',       aliases: ['zustand'],                            label: 'Zustand' },
  { canonical: 'nextjs',        aliases: ['nextjs'],                             label: 'Next.js' },
  { canonical: 'restapi',       aliases: ['restapi', 'restfulapi', 'restapis'],  label: 'REST APIs' },
  { canonical: 'graphql',       aliases: ['graphql'],                            label: 'GraphQL' },
  { canonical: 'cpp',           aliases: ['c++', 'cpp'],                         label: 'C++' },
  { canonical: 'tableau',       aliases: ['tableau'],                            label: 'Tableau' },
  { canonical: 'powerbi',       aliases: ['powerbi'],                            label: 'Power BI' },
  { canonical: 'pandas',        aliases: ['pandas'],                             label: 'Pandas' },
  { canonical: 'numpy',         aliases: ['numpy'],                              label: 'NumPy' },
  { canonical: 'excel',         aliases: ['excel', 'microsoftexcel'],            label: 'Excel' },
  { canonical: 'figma',         aliases: ['figma'],                              label: 'Figma' },
  { canonical: 'uiux',          aliases: ['uiux'],                               label: 'UI/UX' },
  { canonical: 'seo',           aliases: ['seo'],                                label: 'SEO' },
  { canonical: 'marketresearch',aliases: ['marketresearch'],                     label: 'Market Research' },
  { canonical: 'productmgmt',   aliases: ['productmanagement', 'productmgmt'],   label: 'Product Management' },
  { canonical: 'agile',         aliases: ['agile'],                              label: 'Agile' },
  { canonical: 'scrum',         aliases: ['scrum'],                              label: 'Scrum' },
  { canonical: 'dataanalysis',  aliases: ['dataanalysis'],                       label: 'Data Analysis' },
  { canonical: 'ml',            aliases: ['machinelearning', 'ml'],              label: 'Machine Learning' },
  { canonical: 'pytorch',       aliases: ['pytorch'],                            label: 'PyTorch' },
  { canonical: 'tensorflow',    aliases: ['tensorflow'],                         label: 'TensorFlow' },
  { canonical: 'nlp',           aliases: ['nlp', 'naturallanguageprocessing'],   label: 'NLP' },
  { canonical: 'llm',           aliases: ['llm', 'llms'],                        label: 'LLM' },
  { canonical: 'langchain',     aliases: ['langchain'],                          label: 'LangChain' },
  { canonical: 'vectordb',      aliases: ['vectordatabases', 'vectordb'],        label: 'Vector Databases' },
  { canonical: 'abtesting',     aliases: ['abtesting'],                          label: 'A/B Testing' },
  { canonical: 'prd',           aliases: ['prd', 'prds'],                        label: 'PRD' },
  { canonical: 'userinterviews',aliases: ['userinterviews', 'userdiscovery'],    label: 'User Interviews' },
  { canonical: 'wireframing',   aliases: ['wireframing'],                        label: 'Wireframing' },
  { canonical: 'mixpanel',      aliases: ['mixpanel'],                           label: 'Mixpanel' },
  { canonical: 'metabase',      aliases: ['metabase'],                           label: 'Metabase' },
];

export const TRANSFERABLE_PREREQS = {
  typescript: ['javascript'],
  nextjs: ['react'],
  zustand: ['redux', 'react'],
  tailwind: ['css'],
  pandas: ['python'],
  powerbi: ['tableau', 'excel'],
  postgresql: ['sql'],
  docker: ['git', 'node'],
  mongodb: ['sql'],
};

export function normalizeSkillText(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

export function detectSkills(normText) {
  const found = new Map();
  for (const entry of SKILL_REGISTRY) {
    for (const alias of entry.aliases) {
      if (normText.includes(alias)) {
        if (!found.has(entry.canonical)) found.set(entry.canonical, entry.label);
        break;
      }
    }
  }
  return found;
}

export function runDynamicHeuristicAnalysis(studentResumeText = '', jobDescriptionText = '', targetRole = '', companyName = '') {
  const sNorm = normalizeSkillText(studentResumeText);
  const jdNorm = normalizeSkillText(jobDescriptionText);

  const demandedMap = detectSkills(jdNorm);
  let demanded = [...demandedMap.entries()];

  if (demanded.length === 0) {
    const lower = jobDescriptionText.toLowerCase();
    if (lower.includes('frontend') || lower.includes('web')) {
      demanded = [['react', 'React'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['tailwind', 'Tailwind CSS'], ['git', 'Git'], ['restapi', 'REST APIs']];
    } else if (lower.includes('data') || lower.includes('analytics')) {
      demanded = [['sql', 'SQL'], ['python', 'Python'], ['pandas', 'Pandas'], ['tableau', 'Tableau'], ['excel', 'Excel']];
    } else if (lower.includes('product') || lower.includes('apm')) {
      demanded = [['userinterviews', 'User Discovery'], ['figma', 'Figma'], ['prd', 'PRD Writing'], ['mixpanel', 'Funnel Analytics']];
    } else {
      demanded = [['git', 'Git'], ['javascript', 'JavaScript']];
    }
  }

  const matched = [];
  const transferable = [];
  const missing = [];
  const resumeFound = detectSkills(sNorm);

  for (const [canonical, label] of demanded) {
    if (resumeFound.has(canonical)) { matched.push(label); continue; }
    const prereqs = TRANSFERABLE_PREREQS[canonical] || [];
    const bridged = prereqs.find(p => resumeFound.has(p));
    if (bridged) transferable.push({ skill: label, via: resumeFound.get(bridged) });
    else missing.push(label);
  }

  const hasLiveLinks = /(github\.com|vercel\.app|netlify\.app|render\.com|http:\/\/|https:\/\/)/i.test(studentResumeText);
  const metricMatches = (studentResumeText.match(/\b\d+(\.\d+)?%|\b\d+k\b|\b\d+ms\b|\b\d+\+\b/gi) || []).length;
  const hasMetrics = metricMatches > 0 || /(\breduced\b|\bincreased\b|\boptimized\b|\bwinner\b|\bprocessed\b)/i.test(studentResumeText.toLowerCase());
  
  const actionVerbsList = ['built', 'architected', 'engineered', 'developed', 'designed', 'scaled', 'optimized', 'reduced', 'increased', 'deployed', 'automated', 'integrated', 'implemented', 'refactored'];
  const lowerResume = studentResumeText.toLowerCase();
  const detectedVerbs = actionVerbsList.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lowerResume));
  const actionVerbCount = detectedVerbs.length;

  const wordCount = studentResumeText.trim().split(/\s+/).filter(Boolean).length;
  const isTooShort = wordCount < 60;
  const isOptimalLength = wordCount >= 250 && wordCount <= 750;

  const totalDemanded = Math.max(demanded.length, 1);
  const matchRatio = matched.length / totalDemanded;
  const transferableRatio = transferable.length / totalDemanded;

  let rawScore = Math.round((matchRatio * 72) + (transferableRatio * 18));
  rawScore += 6;
  if (hasLiveLinks) rawScore += 10; else rawScore -= 8;
  if (hasMetrics) rawScore += 8; else rawScore -= 6;
  if (isTooShort) rawScore -= 15;
  rawScore = Math.max(18, Math.min(96, rawScore));

  let readinessLevel = 'Developing Match - Major Gaps';
  let badgeColor = 'amber';
  if (rawScore >= 80) { readinessLevel = 'High Match - Ready to Apply'; badgeColor = 'emerald'; }
  else if (rawScore >= 55) { readinessLevel = 'Moderate Match - 7-Day Sprint Needed'; badgeColor = 'blue'; }

  const silentRejectionFlags = [];
  if (!hasLiveLinks) {
    silentRejectionFlags.push({ type: 'critical', title: 'Ghost Project Flag (Missing Proof of Work)', description: 'Your resume mentions projects but lacks verifiable live URLs (Vercel, Render) or GitHub repository links. Tech screeners frequently auto-skip unverified claims.' });
  } else {
    silentRejectionFlags.push({ type: 'pass', title: 'Verifiable Proof of Work Detected', description: 'Resume contains live deployment or GitHub links, establishing authentic hands-on credibility.' });
  }
  if (missing.length > 0) {
    silentRejectionFlags.push({ type: 'warning', title: `Keyword Filter Risk: Missing ${missing.slice(0, 2).map(s => s.toUpperCase()).join(' & ')}`, description: `This JD explicitly requires ${missing.slice(0, 2).join(', ')}. Automated ATS or early recruiter screens will mark your profile as lacking non-negotiable stack components.` });
  }
  if (!hasMetrics) {
    silentRejectionFlags.push({ type: 'warning', title: 'Passive Impact Language Flag', description: 'Project bullet points describe duties rather than measurable outcomes. Recruiters prefer Google XYZ bullets (e.g. "Accomplished [X], measured by [Y], by doing [Z]").' });
  } else {
    silentRejectionFlags.push({ type: 'pass', title: 'Metric-Driven Bullet Points Present', description: 'Resume highlights quantified achievements and measurable metrics.' });
  }

  const primaryMissingLabel = missing[0] || 'Production Deployment Architecture';
  const roleName = targetRole || 'Internship Candidate';
  const targetCompany = companyName || 'Target Company';

  // Comprehensive ATS Heatmap chips
  const atsHeatmap = [
    ...matched.map(s => ({ keyword: s, status: 'matched', label: 'Verified Match', note: 'Direct match found in resume' })),
    ...transferable.map(t => ({ keyword: t.skill, status: 'transferable', label: `Adjacent (via ${t.via})`, note: `Transferable foundation through ${t.via}` })),
    ...missing.map(m => ({ keyword: m, status: 'missing', label: 'Missing Filter', note: 'Explicitly demanded in JD; absent in resume' }))
  ];

  // Evidence-based Filter Checklist
  const filterChecklist = [
    {
      name: 'Core Tech Stack Match',
      status: matchRatio >= 0.7 ? 'pass' : (matchRatio >= 0.4 ? 'warning' : 'fail'),
      value: `${Math.round(matchRatio * 100)}%`,
      detail: `${matched.length} of ${demanded.length} core keywords present`
    },
    {
      name: 'Proof of Work & Code Links',
      status: hasLiveLinks ? 'pass' : 'fail',
      value: hasLiveLinks ? 'Verified' : 'Missing',
      detail: hasLiveLinks ? 'GitHub / Deployment links detected' : 'No GitHub or demo URLs found'
    },
    {
      name: 'Quantifiable Metrics & Impact',
      status: metricMatches >= 2 ? 'pass' : (metricMatches === 1 ? 'warning' : 'fail'),
      value: `${metricMatches} metric${metricMatches === 1 ? '' : 's'}`,
      detail: metricMatches >= 2 ? 'Strong quantified impact' : 'Needs Google XYZ bullet numbers'
    },
    {
      name: 'Document Length & ATS Density',
      status: isOptimalLength ? 'pass' : (wordCount < 100 ? 'fail' : 'warning'),
      value: `${wordCount} words`,
      detail: isOptimalLength ? 'Optimal 1-page density' : (wordCount < 100 ? 'Too sparse for ATS scan' : 'Consider trimming to 1 page')
    }
  ];

  // Tailored Interview Questions based on gap
  const interviewQuestions = [
    {
      topic: `${primaryMissingLabel} Fundamentals`,
      question: `In this ${roleName} role, we rely heavily on ${primaryMissingLabel}. Can you walk us through how you would architect a feature using it, or how you would ramp up on it quickly?`,
      recruiterIntent: `Recruiters want to verify if your gap in ${primaryMissingLabel} is merely lack of syntax exposure or a fundamental gap in engineering concepts.`,
      recommendedAnswer: `Anchor to your strongest adjacent skill (${matched[0] || 'core engineering foundation'}): "While I have built primarily with ${matched[0] || 'modern tech'}, the core mental model translates directly. In my previous project, I solved [similar problem] by [action]. Transitioning to ${primaryMissingLabel}, the equivalent pattern is [explain concept]. I am already completing a 48-hour prototype to demonstrate this."`
    },
    {
      topic: 'Handling Failure & Debugging',
      question: `Tell us about a technical bottleneck or critical bug you encountered in one of your featured projects. How did you diagnose and resolve it?`,
      recruiterIntent: 'Checks whether you actually wrote the code yourself vs copied a tutorial.',
      recommendedAnswer: 'Use the STAR format: describe the unexpected behavior (e.g. state synchronization lag, memory leak, API timeout), the debugging tool used (DevTools profiler, network logs), the root cause, and the measurable fix.'
    },
    {
      topic: 'Proof-of-Work Architecture',
      question: `If you were tasked with building a feature end-to-end for ${targetCompany} in your first two weeks, how would you structure your workflow from design to deployment?`,
      recruiterIntent: 'Assesses autonomy, git discipline, and readiness to contribute to production sprints.',
      recommendedAnswer: 'Outline your 4-step process: (1) Clarify requirements & edge cases, (2) Create minimal reproducible prototype with automated tests, (3) Submit clean PR with loom/screenshots, (4) Monitor production deployment.'
    }
  ];

  return {
    isAIGenerated: false,
    engine: 'Curated Heuristic Engine (Demo Mode)',
    targetRole: roleName,
    company: targetCompany,
    matchScore: rawScore,
    readinessLevel,
    badgeColor,
    resumeStats: { 
      wordCount, 
      hasLiveLinks, 
      hasMetrics, 
      metricMatches, 
      actionVerbCount, 
      detectedVerbs,
      skillsIdentified: matched.length + transferable.length 
    },
    detailedStats: {
      coreSkillMatchPercent: Math.round(matchRatio * 100),
      atsScreenPassRate: Math.min(95, Math.max(25, Math.round(rawScore * 0.92))),
      metricMatches,
      actionVerbCount,
      detectedVerbs,
      filterChecklist
    },
    atsHeatmap,
    interviewQuestions,
    silentRejectionFlags,
    scoreBreakdown: {
      mustHaveCoverage: `${Math.round(matchRatio * 100)}%`,
      transferableBonus: `+${Math.round(transferableRatio * 20)}% potential`,
      riskFactor: missing.length > 2 ? 'High ATS rejection probability' : (hasLiveLinks ? 'Low risk' : 'Medium risk due to unverified links')
    },
    skillsBreakdown: {
      matched: matched.map(s => s.toUpperCase()),
      transferable: transferable.map(t => `${t.skill.toUpperCase()} (via ${t.via})`),
      missingCritical: missing.map(s => s.toUpperCase())
    },
    recruiterInsight: `When a reviewer at ${targetCompany} reads this resume for the ${roleName} opening, they can see evidence of ${matched.slice(0, 2).join(', ') || 'foundational interest'}. The gap flagged most often at this stage is ${primaryMissingLabel.toUpperCase()}, plus clear quantified outcomes for your projects.`,
    proofOfWorkProject: {
      title: `48-Hour ${primaryMissingLabel.toUpperCase()} Proof Project`,
      deliverable: `Build and deploy a targeted micro-application demonstrating ${primaryMissingLabel}, hosted on Vercel/Render with a clean GitHub README. Only claim metrics you actually measured.`,
      estimatedHours: '6-8 hours over a weekend',
      architectureOverview: `Frontend client communicating via typed REST/GraphQL endpoints with ${primaryMissingLabel} state layer. Includes CI/CD workflow and automated test verification.`,
      readmeTemplate: `# ${primaryMissingLabel.toUpperCase()} Proof-of-Work Demo\n\n> Target Role: ${roleName} at ${targetCompany}\n\n## Overview\nProduction prototype demonstrating end-to-end implementation of ${primaryMissingLabel}.\n\n## Tech Stack\n- Core: ${matched[0] || 'Frontend/Backend'}, ${primaryMissingLabel}\n- Deployment: Vercel / Render\n- Testing: Vitest / Jest\n\n## Key Architectural Decisions\n1. Modular component separation for high testability.\n2. Strict input validation and error handling boundaries.\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``
    },
    sevenDayPlan: [
      { day: 'Day 1 & 2', phase: 'Core Concept Immersion', tasks: [
        `Learn the essentials of ${primaryMissingLabel} specifically relevant to ${roleName}.`,
        `Set up a standalone repo and build a functional minimal sandbox.`
      ]},
      { day: 'Day 3 & 4', phase: 'The 48-Hour Proof-of-Work Project', tasks: [
        `Build a prototype that addresses a real challenge a team at ${targetCompany} might face.`,
        `Deploy it live and write a 3-paragraph GitHub README explaining your design decisions.`
      ]},
      { day: 'Day 5', phase: 'Resume Optimization (Google XYZ Formula)', tasks: [
        `Rewrite your project bullets using the XYZ template below. Replace [X]/[Y]/[Z] with numbers you actually measured.`,
        `Highlight the live demo link at the top of your project section.`
      ]},
      { day: 'Day 6', phase: 'Targeted Recruiter & Founder Outreach', tasks: [
        `Locate the hiring manager or tech lead for ${roleName} at ${targetCompany} on LinkedIn.`,
        `Send the personalized cold pitch referencing your newly deployed micro-project.`
      ]},
      { day: 'Day 7', phase: 'Application Submission via Beep', tasks: [
        `Review the 3 common technical interview questions for ${primaryMissingLabel}.`,
        `Submit your application through the Beep Fast-Track Queue.`
      ]}
    ],
    applicationBooster: {
      metricNotice: 'Replace every bracketed placeholder with a real, measured number before adding these to your resume. Do not invent metrics you cannot defend in an interview.',
      tailoredBullets: [
        `Architected a prototype incorporating ${matched[0] || 'core technologies'} and ${primaryMissingLabel}, reducing [metric] by [X]% for [scope].`,
        `Engineered [data flow / feature name] achieving [Y]% [uptime / reliability / coverage] across [Z test environments or sessions].`,
        `Deployed a production build with an automated CI/CD pipeline, publishing documentation and [N] unit tests (coverage: [M]%).`
      ],
      coldPitchMessage: `Hi [Hiring Manager Name],\n\nI noticed you are hiring for the ${roleName} role at ${targetCompany}. I recently built a working project applying ${primaryMissingLabel} to a problem similar to one your team handles: [Insert Live Project Link].\n\nI would love 5 minutes to learn whether my hands-on background could add immediate value to your engineering sprints this semester.\n\nBest,\n[Your Name]`
    }
  };
}
