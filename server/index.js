import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// Health and AI status check endpoint
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    aiEnabled: hasKey,
    engine: hasKey ? 'Gemini 2.5 Flash (Live AI)' : 'Curated Heuristic Engine (Demo Mode)',
    message: hasKey
      ? 'Genuine AI analysis engine active via backend Gemini API.'
      : 'Running in Demo/Heuristic mode. Add GEMINI_API_KEY to server .env for live LLM extraction.'
  });
});

// Dynamic analysis engine: Calculates a genuinely unique score for every resume/job combination
function runDynamicHeuristicAnalysis(studentResumeText = '', jobDescriptionText = '', targetRole = '', companyName = '') {
  const sText = studentResumeText.toLowerCase();
  const jdText = jobDescriptionText.toLowerCase();

  const techDictionary = [
    'react', 'react.js', 'javascript', 'typescript', 'node.js', 'express', 'python', 'java',
    'sql', 'advanced sql', 'mongodb', 'postgresql', 'html', 'css', 'tailwind', 'git', 'github',
    'docker', 'aws', 'redux', 'zustand', 'next.js', 'rest api', 'graphql', 'c++', 'tableau',
    'powerbi', 'pandas', 'numpy', 'excel', 'figma', 'ui/ux', 'seo', 'market research',
    'product management', 'agile', 'scrum', 'data analysis', 'machine learning', 'pytorch',
    'tensorflow', 'nlp', 'llm', 'langchain', 'vector databases', 'a/b testing', 'prd',
    'user interviews', 'wireframing', 'mixpanel', 'metabase'
  ];

  // 1. Identify skills demanded by the target JD
  const rawDemanded = techDictionary.filter(skill => jdText.includes(skill));
  const canonicalMap = {
    'react.js': 'react',
    'advanced sql': 'sql',
    'node.js': 'node',
    'rest api': 'apis'
  };

  const demandedSkills = [...new Set(rawDemanded.map(s => canonicalMap[s] || s))];
  if (demandedSkills.length === 0) {
    if (jdText.includes('frontend') || jdText.includes('web')) demandedSkills.push('react', 'javascript', 'typescript', 'tailwind', 'git', 'apis');
    else if (jdText.includes('data') || jdText.includes('analytics')) demandedSkills.push('sql', 'python', 'pandas', 'tableau', 'excel');
    else if (jdText.includes('product') || jdText.includes('apm')) demandedSkills.push('user discovery', 'figma', 'prd writing', 'funnel analytics');
    else demandedSkills.push('core technical skills', 'git', 'problem solving', 'communication');
  }

  // 2. Classify resume skills into Matched, Transferable, and Critical Missing
  const matchedSkills = [];
  const transferableSkills = [];
  const missingSkills = [];

  demandedSkills.forEach(skill => {
    const isMatched = sText.includes(skill) || 
      (skill === 'react' && sText.includes('react.js')) ||
      (skill === 'sql' && sText.includes('mysql')) ||
      (skill === 'apis' && (sText.includes('api') || sText.includes('rest')));

    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      // Check transferable/adjacent competence
      if ((skill === 'typescript' && sText.includes('javascript')) ||
          (skill === 'next.js' && sText.includes('react')) ||
          (skill === 'zustand' && (sText.includes('redux') || sText.includes('react'))) ||
          (skill === 'postgresql' && sText.includes('sql')) ||
          (skill === 'tailwind' && sText.includes('css')) ||
          (skill === 'pandas' && sText.includes('python')) ||
          (skill === 'powerbi' && sText.includes('tableau')) ||
          (skill === 'docker' && sText.includes('git'))) {
        transferableSkills.push({
          skill,
          note: 'Adjacent foundation detected in your resume (bridgeable in 24-48 hrs)'
        });
      } else {
        missingSkills.push(skill);
      }
    }
  });

  // 3. Inspect Resume Credibility & Hygiene Indicators
  const hasLiveLinks = /(github\.com|vercel\.app|netlify\.app|render\.com|http:\/\/|https:\/\/)/i.test(studentResumeText);
  const hasMetrics = /(\b\d+%\b|\b\d+k\b|\b\d+ms\b|\breduced\b|\bincreased\b|\boptimized\b|\bwinner\b|\bprocessed\b)/i.test(sText);
  const wordCount = studentResumeText.trim().split(/\s+/).length;
  const isTooShort = wordCount < 50;

  // 4. Calculate dynamic score (Truly specific to this resume!)
  const matchRatio = matchedSkills.length / Math.max(demandedSkills.length, 1);
  const transferableRatio = transferableSkills.length / Math.max(demandedSkills.length, 1);

  let rawScore = Math.round((matchRatio * 72) + (transferableRatio * 18));
  rawScore += 6; // base encouragement

  // Live link credibility adjustment (+10% or -8%)
  if (hasLiveLinks) rawScore += 10;
  else rawScore -= 8;

  // Metric backed achievement adjustment (+8% or -6%)
  if (hasMetrics) rawScore += 8;
  else rawScore -= 6;

  // Length penalties
  if (isTooShort) rawScore -= 15;

  // Clamp score bounds realistically
  rawScore = Math.max(18, Math.min(96, rawScore));

  let readinessLevel = 'Developing Match - Major Gaps';
  let badgeColor = 'amber';
  if (rawScore >= 80) {
    readinessLevel = 'High Match - Ready to Apply';
    badgeColor = 'emerald';
  } else if (rawScore >= 55) {
    readinessLevel = 'Moderate Match - 7-Day Sprint Needed';
    badgeColor = 'blue';
  }

  // 5. Generate "Silent Rejection Radar" (The Out-of-the-Box Feature)
  const silentRejectionFlags = [];

  if (!hasLiveLinks) {
    silentRejectionFlags.push({
      type: 'critical',
      title: 'Ghost Project Flag (Missing Proof of Work)',
      description: 'Your resume mentions projects but lacks verifiable live URLs (Vercel, Render) or GitHub repository links. Tech screeners frequently auto-skip unverified claims.'
    });
  } else {
    silentRejectionFlags.push({
      type: 'pass',
      title: 'Verifiable Proof of Work Detected',
      description: 'Resume contains live deployment or GitHub links, establishing authentic hands-on credibility.'
    });
  }

  if (missingSkills.length > 0) {
    silentRejectionFlags.push({
      type: 'warning',
      title: `Keyword Filter Risk: Missing ${missingSkills.slice(0, 2).map(s => s.toUpperCase()).join(' & ')}`,
      description: `This JD explicitly requires ${missingSkills.slice(0, 2).map(s => s.toUpperCase()).join(', ')}. Automated ATS or early recruiter screens will mark your profile as lacking non-negotiable stack components.`
    });
  }

  if (!hasMetrics) {
    silentRejectionFlags.push({
      type: 'warning',
      title: 'Passive Impact Language Flag',
      description: 'Project bullet points describe duties rather than measurable outcomes. Recruiters prefer Google XYZ bullets (e.g. "Accomplished [X], measured by [Y], by doing [Z]").'
    });
  } else {
    silentRejectionFlags.push({
      type: 'pass',
      title: 'Metric-Driven Bullet Points Present',
      description: 'Resume highlights quantified achievements and measurable metrics.'
    });
  }

  const primaryMissing = missingSkills[0] || 'Production Deployment Architecture';
  const roleName = targetRole || 'Internship Candidate';
  const targetCompany = companyName || 'Target Company';

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
      skillsIdentified: matchedSkills.length + transferableSkills.length
    },
    silentRejectionFlags,
    scoreBreakdown: {
      mustHaveCoverage: `${Math.round(matchRatio * 100)}%`,
      transferableBonus: `+${Math.round(transferableRatio * 20)}% potential`,
      riskFactor: missingSkills.length > 2 ? 'High ATS rejection probability' : (hasLiveLinks ? 'Low risk' : 'Medium risk due to unverified links')
    },
    skillsBreakdown: {
      matched: matchedSkills.map(s => s.toUpperCase()),
      transferable: transferableSkills.map(t => `${t.skill.toUpperCase()} (Bridgeable)`),
      missingCritical: missingSkills.map(s => s.toUpperCase())
    },
    recruiterInsight: `When a recruiter at ${targetCompany} reviews this resume for the ${roleName} opening, they notice you possess ${matchedSkills.slice(0, 2).join(', ') || 'foundational interest'}. However, without clear evidence of ${primaryMissing.toUpperCase()} and quantified project outcomes, this resume risks being deprioritized in favor of candidates with verified live code.`,
    proofOfWorkProject: {
      title: `48-Hour ${primaryMissing.toUpperCase()} Proof Project`,
      deliverable: `Build and deploy a targeted micro-application demonstrating ${primaryMissing.toUpperCase()} hosted on Vercel/Render with a clean GitHub README and test suite.`,
      estimatedHours: '6-8 hours over a weekend'
    },
    sevenDayPlan: [
      {
        day: 'Day 1 & 2',
        phase: 'Core Concept Immersion',
        tasks: [
          `Master high-yield essentials of ${primaryMissing.toUpperCase()} specific to ${roleName}.`,
          `Set up a standalone repo and build a functional minimal sandbox.`
        ]
      },
      {
        day: 'Day 3 & 4',
        phase: 'The 48-Hour Proof-of-Work Project',
        tasks: [
          `Build the prototype addressing real challenges faced by ${targetCompany}.`,
          `Deploy live and write a clear 3-paragraph GitHub README explaining design decisions.`
        ]
      },
      {
        day: 'Day 5',
        phase: 'Resume Optimization (Google XYZ Formula)',
        tasks: [
          `Integrate the 3 tailored XYZ bullet points below directly into your resume.`,
          `Highlight the live demo link at the very top of your project section.`
        ]
      },
      {
        day: 'Day 6',
        phase: 'Targeted Recruiter & Founder Outreach',
        tasks: [
          `Locate the hiring manager or tech lead for ${roleName} at ${targetCompany} on LinkedIn.`,
          `Send the personalized cold pitch referencing your newly deployed micro-project.`
        ]
      },
      {
        day: 'Day 7',
        phase: 'Application Submission via Beep',
        tasks: [
          `Review the 3 common technical interview questions for ${primaryMissing}.`,
          `Submit your application through the Beep Fast-Track Queue.`
        ]
      }
    ],
    applicationBooster: {
      tailoredBullets: [
        `Architected a high-performance prototype incorporating ${matchedSkills[0] || 'core technologies'} and ${primaryMissing.toUpperCase()}, reducing response times by 32% for client sessions.`,
        `Engineered robust data flows and automated error handling aligned with ${roleName} standards, achieving 99.5% uptime across test environments.`,
        `Deployed production build with automated CI/CD pipeline, publishing clear documentation and GitHub repository with comprehensive unit tests.`
      ],
      coldPitchMessage: `Hi [Hiring Manager Name],\n\nI noticed you are hiring for the ${roleName} role at ${targetCompany}. I recently engineered a working project incorporating ${primaryMissing.toUpperCase()} and ${matchedSkills[0] || 'modern development practices'} specifically addressing your requirements: [Insert Live Project Link].\n\nI would love 5 minutes to learn how my hands-on background can add immediate value to your engineering sprints this semester.\n\nBest,\n[Your Name]`
    }
  };
}

// Analysis API endpoint
app.post('/api/analyze', async (req, res) => {
  const { studentSkills, jobDescription, targetRole, companyName } = req.body;

  if (!studentSkills || !jobDescription) {
    return res.status(400).json({ error: 'Please provide both student resume/skills and the internship job description.' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no Gemini key is provided, run dynamic heuristic analysis
  if (!apiKey) {
    const heuristicResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    return res.json(heuristicResult);
  }

  // Live Gemini Analysis
  try {
    const prompt = `
You are a senior hiring partner and career mentor for Beep, an AI career platform for college students in India.
Analyze this student's actual resume against the target internship job description.
Calculate a strictly DYNAMIC score that genuinely reflects whether the resume is beginner, intermediate, or advanced for this role.

STUDENT RESUME CONTENT:
${studentSkills}

TARGET INTERNSHIP JOB DESCRIPTION:
${jobDescription}

TARGET ROLE TITLE:
${targetRole || 'Internship Candidate'}

COMPANY NAME:
${companyName || 'Target Company'}

Respond strictly with valid JSON without any markdown formatting or backticks:
{
  "targetRole": "${targetRole || 'Internship Candidate'}",
  "company": "${companyName || 'Target Company'}",
  "matchScore": 68,
  "readinessLevel": "High Match - Ready to Apply | Moderate Match - 7-Day Sprint Needed | Developing Match",
  "badgeColor": "emerald | blue | amber",
  "resumeStats": {
    "wordCount": 240,
    "hasLiveLinks": true,
    "hasMetrics": true,
    "skillsIdentified": 8
  },
  "silentRejectionFlags": [
    {
      "type": "critical | warning | pass",
      "title": "Clear short flag title",
      "description": "Specific explanation of why an ATS or Indian tech recruiter will flag or pass this"
    }
  ],
  "scoreBreakdown": {
    "mustHaveCoverage": "Percentage of non-negotiable skills possessed",
    "transferableBonus": "Bonus potential from related skills",
    "riskFactor": "Why automated ATS or recruiters might drop this resume"
  },
  "skillsBreakdown": {
    "matched": ["SKILL1", "SKILL2"],
    "transferable": ["SKILL3 (Bridgeable)"],
    "missingCritical": ["MISSING_SKILL1", "MISSING_SKILL2"]
  },
  "recruiterInsight": "Direct, empathetic 2-sentence explanation of what an Indian tech/startup recruiter will think when reading this specific resume for this role.",
  "proofOfWorkProject": {
    "title": "Clear Name for a 48-Hour Micro Project",
    "deliverable": "Specific description of what the student should build over a weekend to prove the #1 missing skill",
    "estimatedHours": "6-8 hours"
  },
  "sevenDayPlan": [
    {
      "day": "Day 1 & 2",
      "phase": "Core Concept Immersion",
      "tasks": ["Task 1", "Task 2"]
    },
    {
      "day": "Day 3 & 4",
      "phase": "The 48-Hour Proof-of-Work Project",
      "tasks": ["Task 1", "Task 2"]
    },
    {
      "day": "Day 5",
      "phase": "Resume Optimization (Google XYZ Formula)",
      "tasks": ["Task 1", "Task 2"]
    },
    {
      "day": "Day 6",
      "phase": "Targeted Outreach",
      "tasks": ["Task 1", "Task 2"]
    },
    {
      "day": "Day 7",
      "phase": "Final Preparation & Submission",
      "tasks": ["Task 1", "Task 2"]
    }
  ],
  "applicationBooster": {
    "tailoredBullets": [
      "XYZ bullet point 1 integrating key JD skills",
      "XYZ bullet point 2",
      "XYZ bullet point 3"
    ],
    "coldPitchMessage": "A concise 4-sentence high-converting LinkedIn DM to a Founder or Hiring Manager"
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
      fallbackResult.fallbackNotice = 'Gemini API call encountered an error. Showing verified dynamic heuristic results.';
      return res.json(fallbackResult);
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) throw new Error('No content returned from Gemini model');

    const cleanedText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return res.json({
      ...parsedData,
      isAIGenerated: true,
      engine: 'Gemini 2.5 Flash (Live AI)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during AI analysis, invoking fallback:', error);
    const fallbackResult = runDynamicHeuristicAnalysis(studentSkills, jobDescription, targetRole, companyName);
    fallbackResult.fallbackNotice = 'Live AI error occurred. Fallback dynamic heuristic analysis loaded.';
    return res.json(fallbackResult);
  }
});

app.listen(PORT, () => {
  console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Beep Server] Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Demo / Dynamic Heuristic Mode'}`);
});
