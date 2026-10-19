import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

// Heuristic fallback analysis engine (guarantees immediate, high-quality, zero-config demo experience)
function runHeuristicAnalysis(studentSkillsText = '', jobDescriptionText = '', targetRole = '') {
  const commonTechSkills = [
    'react', 'react.js', 'javascript', 'typescript', 'node.js', 'express', 'python', 'java',
    'sql', 'mongodb', 'postgresql', 'html', 'css', 'tailwind', 'git', 'github', 'docker',
    'aws', 'redux', 'next.js', 'rest api', 'graphql', 'c++', 'tableau', 'powerbi', 'pandas',
    'numpy', 'excel', 'figma', 'ui/ux', 'seo', 'market research', 'product management',
    'agile', 'scrum', 'data analysis', 'machine learning'
  ];

  const sText = studentSkillsText.toLowerCase();
  const jdText = jobDescriptionText.toLowerCase();

  // Extract skills present in JD
  const jdSkills = commonTechSkills.filter(skill => jdText.includes(skill));
  // If few known keywords found, extract high-frequency relevant terms
  if (jdSkills.length < 3) {
    if (jdText.includes('frontend') || jdText.includes('web')) jdSkills.push('react', 'javascript', 'html/css', 'git');
    if (jdText.includes('data') || jdText.includes('analytics')) jdSkills.push('sql', 'python', 'excel', 'data analysis');
    if (jdText.includes('product') || jdText.includes('growth')) jdSkills.push('market research', 'figma', 'analytics', 'communication');
    if (jdSkills.length === 0) jdSkills.push('problem solving', 'communication', 'git', 'core technical fundamentals');
  }

  const matchedSkills = [];
  const transferableSkills = [];
  const missingSkills = [];

  jdSkills.forEach(skill => {
    if (sText.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      // Check transferable logic
      if ((skill === 'typescript' && sText.includes('javascript')) ||
          (skill === 'next.js' && sText.includes('react')) ||
          (skill === 'postgresql' && sText.includes('sql')) ||
          (skill === 'tailwind' && sText.includes('css')) ||
          (skill === 'pandas' && sText.includes('python'))) {
        transferableSkills.push({
          targetSkill: skill,
          relatedSkill: 'Basics present in your profile',
          gapEffort: 'Can be bridged in 24-48 hours'
        });
      } else {
        missingSkills.push(skill);
      }
    }
  });

  // Calculate transparent score
  const totalWeight = (matchedSkills.length * 1.0) + (transferableSkills.length * 0.5);
  const totalPossible = Math.max(jdSkills.length, 1);
  let rawScore = Math.round((totalWeight / totalPossible) * 100);
  if (rawScore < 25) rawScore = 35; // baseline encouraging score
  if (rawScore > 95) rawScore = 92;

  let readinessLevel = 'Developing Match';
  let badgeColor = 'amber';
  if (rawScore >= 80) {
    readinessLevel = 'High Match - Ready to Apply';
    badgeColor = 'emerald';
  } else if (rawScore >= 55) {
    readinessLevel = 'Moderate Match - 7-Day Sprint Needed';
    badgeColor = 'blue';
  }

  const primaryMissing = missingSkills[0] || 'Modern Production Practices';
  const roleName = targetRole || 'Target Internship Role';

  return {
    isAIGenerated: false,
    engine: 'Curated Heuristic Engine (Demo Mode)',
    targetRole: roleName,
    matchScore: rawScore,
    readinessLevel,
    badgeColor,
    scoreBreakdown: {
      mustHaveCoverage: `${Math.min(100, Math.round((matchedSkills.length / Math.max(1, jdSkills.length)) * 100))}%`,
      transferableBonus: `+${transferableSkills.length * 5}% potential`,
      riskFactor: missingSkills.length > 2 ? 'High resume filter risk on primary keywords' : 'Low keyword risk'
    },
    skillsBreakdown: {
      matched: matchedSkills.map(s => s.toUpperCase()),
      transferable: transferableSkills.map(t => `${t.targetSkill.toUpperCase()} (${t.gapEffort})`),
      missingCritical: missingSkills.map(s => s.toUpperCase())
    },
    recruiterInsight: `Recruiters screening for ${roleName} typically scan for ${missingSkills.slice(0, 3).join(', ') || 'demonstrated live projects'}. Right now, your profile demonstrates strong foundational capability, but lacks explicit proof of ${primaryMissing.toUpperCase()} in production.`,
    proofOfWorkProject: {
      title: `48-Hour ${primaryMissing.toUpperCase()} Mini-Proof App`,
      deliverable: `A lightweight, working demonstration tackling a realistic problem with ${primaryMissing.toUpperCase()} deployed on Vercel/Render with a clean GitHub README.`,
      estimatedHours: '6-8 hours over a weekend'
    },
    sevenDayPlan: [
      {
        day: 'Day 1 & 2',
        phase: 'Core Concept Immersion',
        tasks: [
          `Learn the top 20% high-yield concepts of ${primaryMissing.toUpperCase()} needed for junior roles.`,
          `Set up a local environment and build a simple starter repo following official docs.`
        ]
      },
      {
        day: 'Day 3 & 4',
        phase: 'The 48-Hour Proof-of-Work Project',
        tasks: [
          `Build the prototype solving a real workflow problem relevant to ${roleName}.`,
          `Deploy live and write a 3-section GitHub README: Problem Solved, Architecture, and Live URL.`
        ]
      },
      {
        day: 'Day 5',
        phase: 'Resume Optimization (Google XYZ Formula)',
        tasks: [
          `Rewrite 2-3 project bullets to emphasize metrics and exact keywords from this JD.`,
          `Place the live project link prominently at the top of your resume and GitHub profile.`
        ]
      },
      {
        day: 'Day 6',
        phase: 'Targeted Recruiter & Founder Outreach',
        tasks: [
          `Identify 3 hiring managers or tech leads at companies hiring for ${roleName}.`,
          `Send a personalized cold pitch referencing the exact proof-of-work project you just built.`
        ]
      },
      {
        day: 'Day 7',
        phase: 'Interview Readiness & Formal Submission',
        tasks: [
          `Prepare answers for the 3 most common technical screening questions around ${matchedSkills[0] || 'your stack'} and ${primaryMissing}.`,
          `Submit the optimized application with customized portfolio links.`
        ]
      }
    ],
    applicationBooster: {
      tailoredBullets: [
        `Engineered a responsive, production-ready prototype utilizing ${matchedSkills[0] || 'modern web standards'} and ${primaryMissing.toUpperCase()}, reducing loading overhead by 25%.`,
        `Integrated state and API workflows following industry best practices for ${roleName}, achieving 99% reliable data handling across client sessions.`,
        `Authored comprehensive documentation and deployed automated CI/CD pipeline, showcasing strong adherence to Git version control and collaborative developer standards.`
      ],
      coldPitchMessage: `Hi [Hiring Manager Name],\n\nI noticed you are hiring for the ${roleName} role. I built a focused project implementing ${primaryMissing.toUpperCase()} and ${matchedSkills[0] || 'modern workflows'} specifically addressing the core requirements in your job description: [Insert Project Link].\n\nI would love 5 minutes to learn if my hands-on background could add immediate value to your team this semester.\n\nBest,\n[Your Name]`
    }
  };
}

// Analysis API endpoint
app.post('/api/analyze', async (req, res) => {
  const { studentSkills, jobDescription, targetRole } = req.body;

  if (!studentSkills || !jobDescription) {
    return res.status(400).json({ error: 'Please provide both student skills and the internship job description.' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no Gemini key is provided, run heuristic analysis immediately
  if (!apiKey) {
    const heuristicResult = runHeuristicAnalysis(studentSkills, jobDescription, targetRole);
    return res.json(heuristicResult);
  }

  // Live Gemini Analysis
  try {
    const prompt = `
You are a senior hiring partner and career mentor for Beep, an AI career platform for college students in India.
Analyze the following student profile against the target internship job description.

STUDENT PROFILE & SKILLS:
${studentSkills}

TARGET INTERNSHIP JOB DESCRIPTION:
${jobDescription}

TARGET ROLE TITLE (if specified):
${targetRole || 'Internship Candidate'}

You MUST respond strictly with a valid JSON object matching the following structure without any markdown formatting or backticks:
{
  "targetRole": "Identified Job Title",
  "matchScore": 72,
  "readinessLevel": "High Match - Ready to Apply | Moderate Match - 7-Day Sprint Needed | Developing Match",
  "badgeColor": "emerald | blue | amber",
  "scoreBreakdown": {
    "mustHaveCoverage": "Percentage of non-negotiable skills possessed",
    "transferableBonus": "Bonus potential from related skills",
    "riskFactor": "Why automated ATS or recruiters might drop this resume"
  },
  "skillsBreakdown": {
    "matched": ["SKILL1", "SKILL2"],
    "transferable": ["SKILL3 (Reason/Bridge)"],
    "missingCritical": ["MISSING_SKILL1", "MISSING_SKILL2"]
  },
  "recruiterInsight": "Direct, empathetic, 2-3 sentence explanation of what an Indian tech/startup recruiter will think when reading this resume against this JD.",
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
      const errText = await response.text();
      console.warn('Gemini API returned error, falling back to heuristic engine:', errText);
      const fallbackResult = runHeuristicAnalysis(studentSkills, jobDescription, targetRole);
      fallbackResult.fallbackNotice = 'Gemini API call encountered an error. Showing verified heuristic results.';
      return res.json(fallbackResult);
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No content returned from Gemini model');
    }

    // Clean any accidental markdown backticks
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
    const fallbackResult = runHeuristicAnalysis(studentSkills, jobDescription, targetRole);
    fallbackResult.fallbackNotice = 'Live AI error occurred. Fallback heuristic analysis loaded.';
    return res.json(fallbackResult);
  }
});

app.listen(PORT, () => {
  console.log(`[Beep Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[Beep Server] Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini AI' : 'Demo / Heuristic Mode'}`);
});
