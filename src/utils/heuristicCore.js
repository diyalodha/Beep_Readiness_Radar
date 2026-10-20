// Browser-safe heuristic analysis engine with boundary-aware token matching.
// Shared between the client offline fallback and the Express backend.

export const SKILL_REGISTRY = [
  { canonical: 'react',         aliases: ['react', 'react.js', 'reactjs'],       label: 'React' },
  { canonical: 'javascript',    aliases: ['javascript', 'js', 'ecmascript'],     label: 'JavaScript' },
  { canonical: 'typescript',    aliases: ['typescript', 'ts'],                   label: 'TypeScript' },
  { canonical: 'node',          aliases: ['node', 'nodejs', 'node.js'],          label: 'Node.js' },
  { canonical: 'express',       aliases: ['express', 'express.js', 'expressjs'], label: 'Express' },
  { canonical: 'python',        aliases: ['python', 'py'],                       label: 'Python' },
  { canonical: 'java',          aliases: ['java'],                               label: 'Java' },
  { canonical: 'sql',           aliases: ['sql', 'mysql', 'advanced sql'],       label: 'SQL' },
  { canonical: 'mongodb',       aliases: ['mongodb', 'mongo'],                   label: 'MongoDB' },
  { canonical: 'postgresql',    aliases: ['postgresql', 'postgres'],             label: 'PostgreSQL' },
  { canonical: 'html',          aliases: ['html', 'html5'],                      label: 'HTML' },
  { canonical: 'css',           aliases: ['css', 'css3'],                        label: 'CSS' },
  { canonical: 'tailwind',      aliases: ['tailwind', 'tailwindcss'],            label: 'Tailwind CSS' },
  { canonical: 'git',           aliases: ['git'],                                label: 'Git' },
  { canonical: 'github',        aliases: ['github'],                             label: 'GitHub' },
  { canonical: 'docker',        aliases: ['docker'],                             label: 'Docker' },
  { canonical: 'aws',           aliases: ['aws', 'amazon web services'],         label: 'AWS' },
  { canonical: 'redux',         aliases: ['redux', 'redux toolkit'],             label: 'Redux' },
  { canonical: 'zustand',       aliases: ['zustand'],                            label: 'Zustand' },
  { canonical: 'nextjs',        aliases: ['nextjs', 'next.js'],                  label: 'Next.js' },
  { canonical: 'restapi',       aliases: ['rest api', 'restful api', 'rest apis', 'restapi'], label: 'REST APIs' },
  { canonical: 'graphql',       aliases: ['graphql'],                            label: 'GraphQL' },
  { canonical: 'cpp',           aliases: ['c++', 'cpp'],                         label: 'C++' },
  { canonical: 'c',             aliases: ['c'],                                  label: 'C' },
  { canonical: 'tableau',       aliases: ['tableau'],                            label: 'Tableau' },
  { canonical: 'powerbi',       aliases: ['power bi', 'powerbi'],                label: 'Power BI' },
  { canonical: 'pandas',        aliases: ['pandas'],                             label: 'Pandas' },
  { canonical: 'numpy',         aliases: ['numpy'],                              label: 'NumPy' },
  { canonical: 'excel',         aliases: ['excel', 'microsoft excel'],           label: 'Excel' },
  { canonical: 'figma',         aliases: ['figma'],                              label: 'Figma' },
  { canonical: 'uiux',          aliases: ['ui/ux', 'uiux', 'product design'],    label: 'UI/UX' },
  { canonical: 'seo',           aliases: ['seo', 'search engine optimization'],  label: 'SEO' },
  { canonical: 'marketresearch',aliases: ['market research'],                    label: 'Market Research' },
  { canonical: 'productmgmt',   aliases: ['product management', 'product mgmt'], label: 'Product Management' },
  { canonical: 'agile',         aliases: ['agile'],                              label: 'Agile' },
  { canonical: 'scrum',         aliases: ['scrum'],                              label: 'Scrum' },
  { canonical: 'dataanalysis',  aliases: ['data analysis', 'data analytics'],    label: 'Data Analysis' },
  { canonical: 'ml',            aliases: ['machine learning', 'ml'],             label: 'Machine Learning' },
  { canonical: 'pytorch',       aliases: ['pytorch'],                            label: 'PyTorch' },
  { canonical: 'tensorflow',    aliases: ['tensorflow'],                         label: 'TensorFlow' },
  { canonical: 'nlp',           aliases: ['nlp', 'natural language processing'], label: 'NLP' },
  { canonical: 'llm',           aliases: ['llm', 'llms', 'large language model'],label: 'LLM' },
  { canonical: 'langchain',     aliases: ['langchain'],                          label: 'LangChain' },
  { canonical: 'vectordb',      aliases: ['vector database', 'vector databases', 'vectordb'], label: 'Vector Databases' },
  { canonical: 'abtesting',     aliases: ['a/b testing', 'ab testing'],          label: 'A/B Testing' },
  { canonical: 'prd',           aliases: ['prd', 'prds', 'product requirement document'], label: 'PRD' },
  { canonical: 'userinterviews',aliases: ['user interviews', 'user discovery'],  label: 'User Interviews' },
  { canonical: 'wireframing',   aliases: ['wireframing', 'wireframes'],          label: 'Wireframing' },
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Boundary-aware skill token matcher
export function matchSkillToken(alias, text) {
  const lowerText = ' ' + String(text || '').toLowerCase() + ' ';
  
  if (alias === 'c++') {
    return /(?:^|[\s,;/()[\].{}"'`])c\+\+(?:$|[\s,;/()[\].{}"'`])/i.test(lowerText);
  }
  if (alias === 'c#') {
    return /(?:^|[\s,;/()[\].{}"'`])c#(?:$|[\s,;/()[\].{}"'`])/i.test(lowerText);
  }
  if (alias === '.net') {
    return /(?:^|[\s,;/()[\].{}"'`])\.net(?:$|[\s,;/()[\].{}"'`])/i.test(lowerText);
  }
  if (alias === 'c') {
    return /(?:^|[\s,;/()[\].{}"'`])c(?:$|[\s,;/()[\].{}"'`])/i.test(lowerText) &&
           !/(?:^|[\s,;/()[\].{}"'`])c\+\+/i.test(lowerText) &&
           !/(?:^|[\s,;/()[\].{}"'`])c#/i.test(lowerText);
  }
  if (alias === 'ml') {
    return /\bml\b/i.test(lowerText) && !/\bhtml\b/i.test(lowerText) && !/\bxml\b/i.test(lowerText);
  }

  const escaped = escapeRegExp(alias);
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(lowerText);
}

export function detectSkills(rawText) {
  const found = new Map();
  for (const entry of SKILL_REGISTRY) {
    for (const alias of entry.aliases) {
      if (matchSkillToken(alias, rawText)) {
        if (!found.has(entry.canonical)) found.set(entry.canonical, entry.label);
        break;
      }
    }
  }
  return found;
}

export function runDynamicHeuristicAnalysis(studentResumeText = '', jobDescriptionText = '', targetRole = '', companyName = '') {
  const demandedMap = detectSkills(jobDescriptionText);
  let demanded = [...demandedMap.entries()];

  if (demanded.length === 0) {
    const lower = jobDescriptionText.toLowerCase();
    if (lower.includes('frontend') || lower.includes('web')) {
      demanded = [['react', 'React'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['tailwind', 'Tailwind CSS'], ['git', 'Git'], ['restapi', 'REST APIs']];
    } else if (lower.includes('data') || lower.includes('analytics')) {
      demanded = [['sql', 'SQL'], ['python', 'Python'], ['pandas', 'Pandas'], ['tableau', 'Tableau'], ['excel', 'Excel']];
    } else if (lower.includes('product') || lower.includes('apm')) {
      demanded = [['userinterviews', 'User Interviews'], ['figma', 'Figma'], ['prd', 'PRD'], ['mixpanel', 'Mixpanel']];
    } else {
      demanded = [['git', 'Git'], ['javascript', 'JavaScript']];
    }
  }

  const matched = [];
  const transferable = [];
  const missing = [];
  const resumeFound = detectSkills(studentResumeText);

  for (const [canonical, label] of demanded) {
    if (resumeFound.has(canonical)) {
      matched.push(label);
      continue;
    }
    const prereqs = TRANSFERABLE_PREREQS[canonical] || [];
    const bridged = prereqs.find(p => resumeFound.has(p));
    if (bridged) {
      transferable.push({ skill: label, via: resumeFound.get(bridged) });
    } else {
      missing.push(label);
    }
  }

  const hasLiveLinks = /(github\.com|vercel\.app|netlify\.app|render\.com|http:\/\/|https:\/\/)/i.test(studentResumeText);
  const metricMatches = (studentResumeText.match(/\b\d+(\.\d+)?%|\b\d+k\b|\b\d+ms\b|\b\d+\+\b/gi) || []).length;
  const hasMetrics = metricMatches > 0;
  
  const actionVerbsList = ['built', 'architected', 'engineered', 'developed', 'designed', 'scaled', 'optimized', 'reduced', 'increased', 'deployed', 'automated', 'integrated', 'implemented', 'refactored'];
  const lowerResume = studentResumeText.toLowerCase();
  const detectedVerbs = actionVerbsList.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lowerResume));
  const distinctActionVerbCount = detectedVerbs.length;

  const wordCount = studentResumeText.trim().split(/\s+/).filter(Boolean).length;
  const isTooShort = wordCount < 60;
  const isOptimalLength = wordCount >= 200 && wordCount <= 800;

  const totalDemanded = Math.max(demanded.length, 1);
  const matchRatio = matched.length / totalDemanded;
  const transferableRatio = transferable.length / totalDemanded;

  // Evidence-based technical match formula:
  // - Required skills coverage accounts for up to 80 points
  // - Adjacent/transferable foundation accounts for up to 10 points
  // - Verified project links and quantified metrics account for up to 10 points
  let rawScore = Math.round((matchRatio * 80) + (transferableRatio * 10));
  if (hasLiveLinks) rawScore += 5;
  if (hasMetrics) rawScore += 5;
  if (isTooShort) rawScore -= 15;
  rawScore = Math.max(15, Math.min(98, rawScore));

  let readinessLevel = 'Developing Match - Major Gaps';
  let badgeColor = 'amber';
  if (rawScore >= 80) {
    readinessLevel = 'High Match - Ready to Apply';
    badgeColor = 'emerald';
  } else if (rawScore >= 55) {
    readinessLevel = 'Moderate Match - 7-Day Sprint Needed';
    badgeColor = 'blue';
  }

  const silentRejectionFlags = [];
  if (!hasLiveLinks) {
    silentRejectionFlags.push({
      type: 'critical',
      title: 'No Project / Code Links Detected in Text',
      description: 'Your resume does not mention repository (GitHub) or deployment (Vercel/Render) links. Recruiters prioritize applicants with inspectable code.'
    });
  } else {
    silentRejectionFlags.push({
      type: 'pass',
      title: 'Project Links Detected in Resume Text',
      description: 'Resume contains links to external profiles or repositories. Note: code originality and live deployment require recruiter review.'
    });
  }

  if (missing.length > 0) {
    silentRejectionFlags.push({
      type: 'warning',
      title: `Required Stack Missing: ${missing.slice(0, 2).map(s => s.toUpperCase()).join(' & ')}`,
      description: `This JD explicitly requires ${missing.slice(0, 2).join(', ')}. Automated screening or early recruiter reviews may filter out profiles lacking these core components.`
    });
  }

  if (!hasMetrics) {
    silentRejectionFlags.push({
      type: 'warning',
      title: 'No Quantified Achievement Metrics Detected',
      description: 'Project bullet points describe duties without numeric impact. Try Google XYZ format (e.g. "Accomplished [X], measured by [Y]%, by doing [Z]").'
    });
  } else {
    silentRejectionFlags.push({
      type: 'pass',
      title: 'Quantified Metrics Present in Resume',
      description: `Detected ${metricMatches} numeric achievement metric${metricMatches === 1 ? '' : 's'} in your resume bullet points.`
    });
  }

  const primaryMissingLabel = missing[0] || 'Production Deployment Architecture';
  const roleName = targetRole || 'Internship Candidate';
  const targetCompany = companyName || 'Target Company';

  const atsHeatmap = [
    ...matched.map(s => ({ keyword: s, status: 'matched', label: 'Direct Match', note: 'Explicitly found in resume text' })),
    ...transferable.map(t => ({ keyword: t.skill, status: 'transferable', label: `Adjacent (via ${t.via})`, note: `Adjacent foundation through ${t.via}` })),
    ...missing.map(m => ({ keyword: m, status: 'missing', label: 'Missing Required', note: 'Explicitly required in JD; not found in resume' }))
  ];

  const filterChecklist = [
    {
      name: 'Required Tech Stack Match',
      status: matchRatio >= 0.7 ? 'pass' : (matchRatio >= 0.4 ? 'warning' : 'fail'),
      value: `${matched.length}/${demanded.length} Skills`,
      detail: `${Math.round(matchRatio * 100)}% of required stack detected`
    },
    {
      name: 'Project Links in Resume',
      status: hasLiveLinks ? 'pass' : 'fail',
      value: hasLiveLinks ? 'Detected' : 'Not Found',
      detail: hasLiveLinks ? 'Links detected (manual verification required)' : 'No GitHub or demo URLs found'
    },
    {
      name: 'Quantified Metrics',
      status: metricMatches >= 2 ? 'pass' : (metricMatches === 1 ? 'warning' : 'fail'),
      value: `${metricMatches} metric${metricMatches === 1 ? '' : 's'}`,
      detail: metricMatches >= 2 ? 'Strong quantified impact' : 'Add measurable Google XYZ numbers'
    },
    {
      name: 'Document Length',
      status: isOptimalLength ? 'pass' : (wordCount < 100 ? 'fail' : 'warning'),
      value: `${wordCount} words`,
      detail: isOptimalLength ? 'Standard single-page density' : (wordCount < 100 ? 'Too sparse for evaluation' : 'Consider trimming to 1 page')
    }
  ];

  const interviewQuestions = [
    {
      topic: `${primaryMissingLabel} Fundamentals`,
      question: `In this ${roleName} role, the team utilizes ${primaryMissingLabel}. How would you approach ramp-up or feature implementation using it?`,
      recruiterIntent: `Assesses whether your gap in ${primaryMissingLabel} is merely unfamiliarity with syntax or a conceptual engineering gap.`,
      recommendedAnswer: `Anchor to your strongest adjacent skill (${matched[0] || 'core engineering foundation'}): "While I have built primarily with ${matched[0] || 'core technologies'}, the conceptual model translates directly. I am bridging this with a weekend prototype."`
    },
    {
      topic: 'Debugging & Problem Solving',
      question: `Tell us about a technical bottleneck or critical bug you encountered in one of your projects. How did you diagnose and resolve it?`,
      recruiterIntent: 'Checks whether you wrote the code yourself vs copied an existing template.',
      recommendedAnswer: 'Use the STAR format: describe the bug, the debugging tool used (DevTools, logs, profiler), the root cause, and the measurable outcome.'
    },
    {
      topic: 'Production Readiness',
      question: `If you were tasked with building a feature end-to-end for ${targetCompany}, how would you structure your workflow from design to deployment?`,
      recruiterIntent: 'Assesses autonomy, git discipline, and readiness to contribute to production sprints.',
      recommendedAnswer: 'Outline your workflow: (1) Clarify requirements and edge cases, (2) Create minimal prototype with tests, (3) Submit clean PR with screenshots/loom, (4) Monitor build and deployment.'
    }
  ];

  return {
    isAIGenerated: false,
    engine: 'Curated Heuristic Engine (Offline Mode)',
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
      actionVerbCount: distinctActionVerbCount, 
      detectedVerbs,
      skillsIdentified: matched.length + transferable.length 
    },
    detailedStats: {
      coreSkillMatchPercent: Math.round(matchRatio * 100),
      estimatedReadinessIndicator: Math.round(matchRatio * 100),
      metricMatches,
      actionVerbCount: distinctActionVerbCount, 
      detectedVerbs,
      filterChecklist
    },
    atsHeatmap,
    interviewQuestions,
    silentRejectionFlags,
    scoreBreakdown: {
      mustHaveCoverage: `${Math.round(matchRatio * 100)}% (${matched.length}/${demanded.length})`,
      transferableBonus: transferable.length > 0 ? `+${transferable.length * 5}% adjacent foundations` : '0%',
      riskFactor: missing.length > 2 ? 'Several required skills not found in resume' : 'Core requirements covered'
    },
    skillsBreakdown: {
      matched: matched.map(s => s.toUpperCase()),
      transferable: transferable.map(t => `${t.skill.toUpperCase()} (via ${t.via})`),
      missingCritical: missing.map(s => s.toUpperCase())
    },
    recruiterInsight: `When evaluating this resume for the ${roleName} opening, evidence of ${matched.slice(0, 2).join(', ') || 'foundational interest'} was detected. The key technical area to substantiate is ${primaryMissingLabel.toUpperCase()}, along with quantified project bullet points.`,
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
      { day: 'Day 6', phase: 'Targeted Outreach', tasks: [
        `Locate the hiring manager or tech lead for ${roleName} at ${targetCompany} on LinkedIn.`,
        `Send a personalized cold pitch referencing your newly deployed micro-project.`
      ]},
      { day: 'Day 7', phase: 'Application Submission via Beep', tasks: [
        `Review the technical interview questions for ${primaryMissingLabel}.`,
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
      coldPitchMessage: `Hi [Hiring Manager Name],\n\nI noticed you are hiring for the ${roleName} role at ${targetCompany}. I recently built a working project applying ${primaryMissingLabel} to a problem similar to one your team handles: [Insert Live Project Link].\n\nI would love 5 minutes to learn whether my hands-on background could add value to your engineering sprints this semester.\n\nBest,\n[Your Name]`
    }
  };
}
