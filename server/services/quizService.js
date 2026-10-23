/**
 * Expert-Level Adaptive Quiz Service for Beep Readiness Radar
 *
 * Generates hard, multi-step scenario questions grounded in the candidate's
 * target job description and identified skill gaps.
 *
 * Anti-Leakage Guarantee:
 * - Public question payloads returned to the client NEVER include correct answers,
 *   rubrics, or option indexes.
 * - Grading happens strictly server-side, with full architectural explanations
 *   and knowledge gap identification returned only after submission.
 */

import crypto from 'crypto';
import { callGeminiStructured, isGeminiConfigured, wrapUntrustedDocument } from './geminiService.js';
import { quizQueries } from '../db.js';

const PRACTICE_DISCLAIMER = 'Generated practice assessment for technical interview preparation — not an officially validated certification exam.';

/**
 * High-yield fallback expert question bank tailored by role.
 * Used when Gemini is unavailable or unconfigured, ensuring hard, multi-step reasoning.
 */
const EXPERT_ROLE_BANKS = {
  frontend: [
    {
      id: 'q_fe_1',
      category: 'React & Browser Performance',
      type: 'code-analysis',
      scenario: 'You are profiling a high-throughput dashboard that renders real-time candidate metrics. Users report noticeable input lag during live filtering.',
      codeSnippet: `function FilterableList({ items, filterText }) {
  // Expensive computation recalculating 10,000 candidate items
  const filteredItems = items.filter(item => 
    item.skills.some(s => s.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div>
      <MetricChart data={filteredItems} />
      <VirtualTable rows={filteredItems} />
    </div>
  );
}`,
      question: 'Which architectural fix addresses the input lag without causing stale-closure bugs?',
      options: [
        'Wrap the entire FilterableList in React.memo and pass filterText as a window global variable.',
        'Use useDeferredValue or useTransition on filterText combined with useMemo for filteredItems, allowing the search input to remain responsive while deferring the non-urgent list recalculation.',
        'Replace VirtualTable with a regular <table> map and invoke forceUpdate() on every keystroke.',
        'Move the array filtering into a useEffect hook that updates a local state variable synchronously.'
      ],
      correctAnswerIndex: 1,
      explanation: 'useDeferredValue/useTransition tells React to prioritize urgent user keystrokes in the main lane while scheduling the expensive CPU filter pass in a transition lane, preventing frame drops.',
      knowledgeGap: 'Concurrent React scheduling (useTransition/useDeferredValue) vs blocking render passes.'
    },
    {
      id: 'q_fe_2',
      category: 'Web Security & Token Lifecycle',
      type: 'scenario-based',
      scenario: 'A fintech application requires storing authentication tokens. An audit identified a potential stored-XSS vulnerability in a user bio field.',
      question: 'Which token storage strategy provides the highest defense-in-depth against credential theft via XSS?',
      options: [
        'Store the access token in localStorage and encrypt it with a secret key hardcoded in the client bundle.',
        'Store the short-lived access token strictly in JavaScript in-memory state and maintain the refresh token in an httpOnly, Secure, SameSite=Strict cookie with CSRF mitigation.',
        'Store both access and refresh tokens in sessionStorage with window.name obfuscation.',
        'Embed the JWT token directly in the document.title tag so it resets on page reload.'
      ],
      correctAnswerIndex: 1,
      explanation: 'httpOnly cookies cannot be accessed or read by arbitrary JavaScript execution (mitigating token exfiltration via XSS), while keeping access tokens short-lived in-memory limits exposure duration.',
      knowledgeGap: 'Browser credential isolation, httpOnly cookie boundaries, and XSS blast-radius minimization.'
    },
    {
      id: 'q_fe_3',
      category: 'DOM & Rendering Engine',
      type: 'single-select',
      scenario: 'A developer animates a modal dialog across the screen using JavaScript by updating "left" and "top" CSS properties inside a requestAnimationFrame loop. The animation drops frames on mobile devices.',
      question: 'Why does animating "left/top" cause jank, and what is the optimal architectural replacement?',
      options: [
        'left/top triggers Layout (Reflow) and Paint across the entire document tree; animating "transform: translate3d()" offloads compositing to the GPU without triggering layout.',
        'left/top only works on flexbox containers and causes CPU thread starvation.',
        'left/top is deprecated in HTML5 and automatically disabled in WebKit.',
        'Animating transform requires synchronous DOM tree re-parsing.'
      ],
      correctAnswerIndex: 0,
      explanation: 'Mutating geometric properties like top/left forces the browser engine through Style -> Layout -> Paint -> Composite. CSS transform mutations skip Layout and Paint, running purely on the Compositor thread.',
      knowledgeGap: 'Browser critical rendering path: Layout/Reflow vs Composite-only GPU layer operations.'
    },
    {
      id: 'q_fe_4',
      category: 'State Management & Concurrency',
      type: 'multi-select',
      scenario: 'You are architecting a client-side state store for a collaborative editor. Two concurrent network requests arrive with overlapping document mutations.',
      question: 'Which of the following architectural strategies prevent race conditions and state divergence? (Select all that apply)',
      options: [
        'Implement an optimistic UI mutation queue with monotonic version vectors / sequence IDs.',
        'Discard all asynchronous responses that arrive out of timestamp sequence.',
        'Rely entirely on client-side Math.random() locks.',
        'Apply Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs) for commutative state resolution.'
      ],
      correctAnswerIndices: [0, 3],
      explanation: 'Version sequence vectors allow deterministic ordering of mutations, while CRDTs/OT mathematically guarantee eventual consistency regardless of network delivery order.',
      knowledgeGap: 'Distributed state reconciliation, eventual consistency, and sequence-based race condition prevention.'
    },
    {
      id: 'q_fe_5',
      category: 'System Architecture & Trade-offs',
      type: 'short-answer',
      scenario: 'Explain the trade-offs between Server-Side Rendering (SSR) and Client-Side Rendering (CSR) for an internship job board with dynamic applicant telemetry.',
      question: 'In 2-3 sentences, analyze how SSR vs CSR impacts First Contentful Paint (FCP), Time to Interactive (TTI), and infrastructure compute costs.',
      rubric: {
        keywords: ['fcp', 'tti', 'hydration', 'compute', 'server', 'seo'],
        passingConcepts: [
          'SSR improves FCP and initial SEO by returning pre-rendered HTML',
          'SSR introduces server compute overhead and a TTI hydration delay where page is visible but non-interactive',
          'CSR reduces server compute cost but has slower initial FCP due to JavaScript bundle download'
        ]
      },
      sampleAnswer: 'SSR delivers faster First Contentful Paint (FCP) and optimal SEO because the server renders static HTML immediately, but introduces ongoing server compute costs and potential TTI delays during client hydration. Conversely, CSR offloads rendering computation to the user browser, resulting in cheaper infrastructure but slower initial FCP on mobile networks due to heavy JavaScript bundles.',
      knowledgeGap: 'Web core vitals (FCP vs TTI), hydration mismatches, and infrastructure cost modeling.'
    }
  ],

  backend: [
    {
      id: 'q_be_1',
      category: 'Database Concurrency & ACID',
      type: 'scenario-based',
      scenario: 'Under high traffic (5,000 requests/sec), an internship application counter allows duplicate submissions because two concurrent transactions read the same application count before writing back.',
      question: 'Which database concurrency control mechanism prevents this race condition with minimal lock contention?',
      options: [
        'Wrap the query in a try-catch block and retry on the client after 500ms.',
        'Use optimistic concurrency control with a version column (UPDATE ... WHERE version = x) or an atomic database increment (UPDATE ... count = count + 1).',
        'Drop all foreign keys and convert the table to an unindexed log file.',
        'Set transaction isolation level to READ UNCOMMITTED.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Atomic expressions (UPDATE ... SET count = count + 1) or optimistic concurrency control via version checking execute at the database engine level with row-level locks, preventing dirty read-modify-write race conditions without blocking the entire table.',
      knowledgeGap: 'Database isolation levels, optimistic vs pessimistic locking, and atomic write operations.'
    },
    {
      id: 'q_be_2',
      category: 'API Idempotency & Fault Tolerance',
      type: 'code-analysis',
      scenario: 'A microservice endpoint charges an internship application fee via a payment gateway. Network drops cause the client to retry the request.',
      codeSnippet: `app.post('/api/charges', async (req, res) => {
  const { userId, amount } = req.body;
  const charge = await paymentGateway.charge({ userId, amount });
  await db.recordPayment({ chargeId: charge.id, userId, amount });
  res.json({ success: true, chargeId: charge.id });
});`,
      question: 'What architectural vulnerability exists in this implementation and what is the standard fix?',
      options: [
        'The route uses POST instead of GET; GET requests are naturally idempotent.',
        'Network timeouts during the gateway call or DB write cause duplicate charges on retry; the endpoint must require a unique client Idempotency-Key checked transactionally before charging.',
        'The route lacks a response timeout header.',
        'Payment gateway credentials must be passed in the request body.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Without an Idempotency-Key, if the client drops connection before receiving the response, a retry triggers a second charge. Storing and locking an Idempotency-Key ensures identical retries return the previous result without re-executing payment.',
      knowledgeGap: 'Distributed system idempotency, duplicate write prevention, and network partition recovery.'
    },
    {
      id: 'q_be_3',
      category: 'SQL Query Optimization',
      type: 'single-select',
      scenario: 'A query running "SELECT * FROM applicants WHERE college = ? ORDER BY graduation_year DESC LIMIT 20" takes 1.4 seconds on a table of 2,000,000 rows. The table has an index on (college).',
      question: 'Why is the query slow despite the index on "college", and what is the optimal composite index?',
      options: [
        'The database engine cannot use indexes when LIMIT is specified.',
        'The single index on (college) locates matching rows, but the engine must perform a slow in-memory filesort across all matching rows for "graduation_year"; creating a composite index on (college, graduation_year DESC) avoids the filesort entirely.',
        'The table must be partitioned into 50 separate tables by state.',
        'SQLite and PostgreSQL do not support descending column ordering.'
      ],
      correctAnswerIndex: 1,
      explanation: 'A single index on (college) satisfies the WHERE predicate, but requires an unindexed disk/memory filesort for the ORDER BY clause. A composite index (college, graduation_year DESC) allows the B-tree to be traversed directly in sort order.',
      knowledgeGap: 'Composite B-tree indexing, filesort elimination, and index-covered query optimization.'
    },
    {
      id: 'q_be_4',
      category: 'Distributed Caching & Redis',
      type: 'multi-select',
      scenario: 'You are deploying a Redis cache in front of a relational database for student profile lookups. Under a flash surge of traffic, multiple cache keys expire at the exact same second.',
      question: 'Which of the following phenomena and architectural mitigations apply to this scenario? (Select all that apply)',
      options: [
        'This creates a "Cache Stampede" (thundering herd) where thousands of requests bypass the cache and overwhelm the primary database.',
        'Adding random jitter (TTL = baseTTL + random(0, 300s)) smooths out expiration waves.',
        'Using a distributed mutex lock (e.g. Redlock) ensures only one worker thread recomputes the expired key while others wait or serve stale cache.',
        'Setting TTL to -1 guarantees that Redis will automatically shard across CPU cores.'
      ],
      correctAnswerIndices: [0, 1, 2],
      explanation: 'When hot cache keys expire simultaneously without jitter or mutex locks, concurrent requests flood the database (Cache Stampede). Random TTL jitter and mutex locking on miss are primary industry defenses.',
      knowledgeGap: 'Cache stampede mitigation, TTL jittering, and mutex locking on cache miss.'
    },
    {
      id: 'q_be_5',
      category: 'System Resilience & Microservices',
      type: 'short-answer',
      scenario: 'An upstream third-party verification API experiences 15-second latencies and periodic 500 errors, causing all backend worker threads in our application to hang.',
      question: 'Describe how implementing the Circuit Breaker pattern with a Fallback mechanism restores system health and prevents cascading failure.',
      rubric: {
        keywords: ['circuit breaker', 'open', 'closed', 'half-open', 'cascading', 'fallback', 'timeout'],
        passingConcepts: [
          'Trip circuit to OPEN state when error threshold or latency limit is exceeded',
          'Immediately return fallback response or cached data without waiting for the slow upstream service',
          'Periodically test upstream health in HALF-OPEN state before safely closing the circuit'
        ]
      },
      sampleAnswer: 'The Circuit Breaker pattern monitors upstream failure and latency rates. When failures cross a predefined threshold, the breaker transitions from CLOSED to OPEN, immediately short-circuiting downstream requests with a fallback response rather than blocking worker threads for 15 seconds. After a cooldown, it enters HALF-OPEN to test upstream recovery before safely closing.',
      knowledgeGap: 'Cascading failure prevention, thread pool starvation, and circuit breaker states.'
    }
  ],

  data: [
    {
      id: 'q_da_1',
      category: 'SQL Analytical Querying & Window Functions',
      type: 'scenario-based',
      scenario: 'You are analyzing candidate application retention. You need to calculate the running 7-day cumulative count of applications per university without collapsing individual applicant records.',
      question: 'Which SQL window construct achieves this correctly and efficiently?',
      options: [
        'Use GROUP BY university, application_date with a self-join on date <= date.',
        'Use COUNT(*) OVER (PARTITION BY university ORDER BY application_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).',
        'Window functions cannot be combined with PARTITION BY in modern SQL engines.',
        'Export the raw table to CSV and compute rolling sums in Microsoft Excel.'
      ],
      correctAnswerIndex: 1,
      explanation: 'OVER (PARTITION BY university ORDER BY application_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) defines a rolling 7-row analytical window partitioned per university without collapsing records.',
      knowledgeGap: 'SQL window frame specifications (ROWS BETWEEN) vs GROUP BY aggregations.'
    },
    {
      id: 'q_da_2',
      category: 'Data Manipulation & Vectorization in Pandas',
      type: 'code-analysis',
      scenario: 'A data pipeline calculates applicant percentiles across 500,000 student records using Python Pandas.',
      codeSnippet: `for index, row in df.iterrows():
  df.at[index, 'adjusted_score'] = (row['raw_score'] - mean_val) / std_val`,
      question: 'Why does this code run slowly, and what is the optimal vectorized implementation?',
      options: [
        'iterrows() is slow because Python lacks multi-core support; rewrite the loop in Bash.',
        'iterrows() generates a Pandas Series object for each of the 500,000 rows with massive overhead; use vectorized NumPy broadcasting: df["adjusted_score"] = (df["raw_score"] - mean_val) / std_val.',
        'The loop is slow because adjusted_score is a reserved SQL keyword.',
        'Pandas requires calling gc.collect() inside every iteration of the loop.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Iterating row-by-row in Python incurs heavy interpreter and Series conversion overhead. Vectorized operations execute contiguous memory arrays directly in compiled C/NumPy code, running orders of magnitude faster.',
      knowledgeGap: 'Pandas row-iteration anti-patterns vs vectorized NumPy memory broadcasting.'
    },
    {
      id: 'q_da_3',
      category: 'A/B Testing & Statistical Rigor',
      type: 'single-select',
      scenario: 'A product team runs an A/B test on a candidate apply button. After 3 days, p-value reaches 0.03 (alpha = 0.05). The team decides to stop the experiment early and declare the variant a winner.',
      question: 'What statistical pitfall does this early stopping introduce?',
      options: [
        'Survivorship bias.',
        'The Peeking Problem (Type I error inflation): repeatedly checking p-values before reaching the predetermined minimum sample size dramatically inflates false-positive rates.',
        'Multicollinearity between user sessions.',
        'Simpson’s Paradox caused by lack of database indexes.'
      ],
      correctAnswerIndex: 1,
      explanation: 'Continuous monitoring ("peeking") without statistical correction causes random short-term fluctuations to cross the significance threshold, leading to false-positive conclusions (inflated Type I error). Sample sizes must be fixed a priori.',
      knowledgeGap: 'A/B testing sample size power calculations and the peeking problem.'
    },
    {
      id: 'q_da_4',
      category: 'Data Warehousing & Star Schema',
      type: 'multi-select',
      scenario: 'You are modeling an enterprise placement analytics data warehouse in Snowflake/BigQuery.',
      question: 'Which of the following dimensional modeling principles apply to fact and dimension tables? (Select all that apply)',
      options: [
        'Fact tables contain additive or semi-additive numerical metrics (e.g. applications_count, salary_stipend).',
        'Dimension tables provide descriptive context and filters (e.g. candidate demographics, university metadata, company details).',
        'Fact tables should never contain foreign keys referencing dimension tables.',
        'Surrogate keys in dimension tables isolate the data warehouse from operational source system changes.'
      ],
      correctAnswerIndices: [0, 1, 3],
      explanation: 'In dimensional modeling (Kimball), fact tables capture quantifiable business measurements and foreign keys linking to descriptive dimension tables. Surrogate keys insulate against upstream operational schema changes.',
      knowledgeGap: 'Dimensional modeling, Fact vs Dimension boundaries, and surrogate key isolation.'
    },
    {
      id: 'q_da_5',
      category: 'Data Quality & Anomaly Detection',
      type: 'short-answer',
      scenario: 'You discover that an automated applicant tracking pipeline ingested corrupted salary figures where 5% of records have an extra zero appended.',
      question: 'Describe an anomaly detection technique to detect and isolate these outliers, and explain why median is preferable to mean in this context.',
      rubric: {
        keywords: ['median', 'mean', 'outlier', 'iqr', 'z-score', 'robust', 'skew'],
        passingConcepts: [
          'Mean is heavily skewed by extreme outliers whereas median is robust (breakdown point of 50%)',
          'Use Interquartile Range (IQR) or Z-score thresholds to detect values exceeding normal distributions'
        ]
      },
      sampleAnswer: 'Extreme order-of-magnitude anomalies heavily distort the arithmetic mean, whereas the median remains robust because it reflects the 50th percentile. An anomaly detection pipeline using Interquartile Range (IQR, flagging values beyond Q3 + 1.5*IQR) or modified Z-scores based on Median Absolute Deviation (MAD) can isolate these corrupted records without being skewed by the outliers themselves.',
      knowledgeGap: 'Robust statistics (mean vs median sensitivity) and IQR/MAD outlier detection.'
    }
  ]
};

/**
 * Builds the expert quiz generation prompt for Google Gemini.
 */
function buildQuizPrompt(targetRole, jobDescription, skillGaps = [], difficulty = 'expert', questionCount = 5, resumeText = '') {
  const wrappedJd = jobDescription ? wrapUntrustedDocument('job_description_data', jobDescription) : '';
  const wrappedResume = resumeText ? wrapUntrustedDocument('candidate_resume_data', resumeText) : '';
  const gapsList = Array.isArray(skillGaps) && skillGaps.length > 0
    ? skillGaps.map(g => (typeof g === 'string' ? g : g.missingCompetency || g.skillOrCompetency || g.skill || '')).filter(Boolean).join(', ')
    : 'System architecture, API idempotency, database indexing, edge case debugging, state concurrency';

  return `
You are the Principal Technical Evaluator designing an EXPERT-LEVEL, DEEPLY PERSONALIZED technical assessment for this candidate.

Target Role: "${targetRole || 'Software Engineering Intern'}"
Target Gaps / Required Domains: ${gapsList}
Difficulty Level: "${difficulty}" (Focus strictly on application, multi-step engineering reasoning, debugging, design trade-offs, and failure mode analysis. DO NOT generate basic recall or trivial terminology questions).

${wrappedResume}

${wrappedJd}

CORE PERSONALIZATION DIRECTIVES:
1. Ground the assessment directly in the candidate's actual projects, libraries, databases, and frameworks mentioned in their resume (in <candidate_resume_data>). For example, if their resume mentions building an analytics dashboard with React and PostgreSQL, or an e-commerce API in Django/Node, set the scenarios and code analysis around those specific technologies and architectural challenges.
2. Directly evaluate the specific skill gaps between the candidate's resume and the job description requirements in <job_description_data>.
3. Include realistic code snippets for code-analysis questions that test debugging subtle concurrency issues, stale closures, memory leaks, or database isolation anomalies.
4. Exactly one question must be a high-yield short-answer question evaluating trade-off analysis.

Generate exactly ${questionCount} expert technical questions.

CRITICAL INSTRUCTIONS:
- Distractors must represent plausible, commonly held engineering misconceptions.
- Questions must be challenging, fair, realistic, and directly relevant to the role.
- Provide thorough explanations of WHY the correct option is optimal and WHY each distractor fails.
- Identify the exact underlying knowledge gap tested by each question.

Respond strictly in valid JSON matching this structure:
{
  "targetRole": "${targetRole}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q_1",
      "category": "Domain Category",
      "type": "single-select | multi-select | code-analysis | scenario-based | short-answer",
      "scenario": "Realistic background context or setup reflecting candidate background or role",
      "codeSnippet": "Optional code block (or empty string)",
      "question": "Clear, deep technical question",
      "options": [
        "Plausible engineering option A",
        "Plausible engineering option B",
        "Plausible engineering option C",
        "Plausible engineering option D"
      ],
      "correctAnswerIndex": 0,
      "correctAnswerIndices": [0],
      "rubric": {
        "keywords": ["keyword1", "keyword2"],
        "passingConcepts": ["Concept A", "Concept B"]
      },
      "sampleAnswer": "Comprehensive model response for short-answer questions",
      "explanation": "Deep architectural explanation of the correct solution and why alternatives fail",
      "knowledgeGap": "Core concept or failure mode tested"
    }
  ]
}
`;
}

/**
 * Validates a generated question item before session creation.
 */
function validateQuestionItem(q, idx) {
  if (!q || typeof q !== 'object') return false;
  if (!q.question || typeof q.question !== 'string' || q.question.length < 10) return false;
  if (!q.explanation || typeof q.explanation !== 'string') return false;

  const validTypes = ['single-select', 'multi-select', 'code-analysis', 'scenario-based', 'short-answer'];
  const type = validTypes.includes(q.type) ? q.type : 'single-select';
  q.type = type;
  q.id = q.id || `gen_q_${idx + 1}_${Date.now().toString(36)}`;

  if (type === 'short-answer') {
    if (!q.sampleAnswer && !q.rubric) return false;
    q.options = [];
  } else {
    if (!Array.isArray(q.options) || q.options.length < 2) return false;
    if (type === 'multi-select') {
      if (!Array.isArray(q.correctAnswerIndices) || q.correctAnswerIndices.length === 0) {
        q.correctAnswerIndices = [typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0];
      }
    } else {
      if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
        q.correctAnswerIndex = 0;
      }
    }
  }

  return true;
}

/**
 * Generates an expert quiz session without leaking answer keys.
 *
 * @param {object} params
 * @param {string} params.targetRole
 * @param {string} params.jobDescription
 * @param {Array} params.skillGaps
 * @param {string} params.difficulty - 'expert' | 'advanced' | 'intermediate'
 * @param {number} params.questionCount - default 5
 * @param {string} params.resumeText - optional candidate resume text for deep personalization
 * @param {string} params.userId - optional authenticated user ID
 * @returns {Promise<{ sessionId: string, difficulty: string, targetRole: string, questions: Array, disclaimer: string, isPersonalized: boolean, isAIGenerated: boolean, engine: string }>}
 */
export async function generateExpertQuiz({
  targetRole = 'Software Engineering Intern',
  jobDescription = '',
  skillGaps = [],
  difficulty = 'expert',
  questionCount = 5,
  resumeText = '',
  userId = null
}) {
  let questionsPool = [];
  let isAIGenerated = false;

  const roleLower = (targetRole || '').toLowerCase();
  const resumeLower = (resumeText || '').toLowerCase();

  // Role bank selection for fallback
  let fallbackBank = EXPERT_ROLE_BANKS.frontend;
  if (roleLower.includes('data') || roleLower.includes('analytics') || roleLower.includes('analyst')) {
    fallbackBank = EXPERT_ROLE_BANKS.data;
  } else if (roleLower.includes('backend') || roleLower.includes('python') || roleLower.includes('node') || resumeLower.includes('django') || resumeLower.includes('fastapi')) {
    fallbackBank = EXPERT_ROLE_BANKS.backend;
  } else if (roleLower.includes('fullstack') || roleLower.includes('full stack')) {
    fallbackBank = EXPERT_ROLE_BANKS.backend;
  }

  // Attempt live personalization via Gemini if configured
  const hasContentForAi = isGeminiConfigured() && (
    (typeof resumeText === 'string' && resumeText.trim().length >= 20) ||
    (typeof jobDescription === 'string' && jobDescription.trim().length >= 20) ||
    Boolean(targetRole)
  );

  if (hasContentForAi) {
    try {
      const prompt = buildQuizPrompt(targetRole, jobDescription, skillGaps, difficulty, questionCount, resumeText);
      const { parsedJson } = await callGeminiStructured(prompt, { temperature: 0.3 });

      if (parsedJson && Array.isArray(parsedJson.questions) && parsedJson.questions.length >= 3) {
        const valid = parsedJson.questions.filter((q, idx) => validateQuestionItem(q, idx));
        if (valid.length >= 3) {
          questionsPool = valid.slice(0, questionCount);
          isAIGenerated = true;
        }
      }
    } catch (err) {
      console.warn('[Quiz Service] Gemini personalized quiz generation error, using role fallback:', err.message);
    }
  }

  // Use role-tailored expert question bank if Gemini generation was unconfigured or failed
  if (questionsPool.length === 0) {
    questionsPool = fallbackBank.slice(0, questionCount).map((q) => ({ ...q }));
  }

  // Split questions into Public (client view) and Private (server answer key)
  const publicQuestions = [];
  const privateAnswerKeys = {};

  for (const q of questionsPool) {
    // Public representation: zero answer leak
    publicQuestions.push({
      id: q.id,
      category: q.category || 'Engineering Fundamentals',
      type: q.type || 'single-select',
      scenario: q.scenario || '',
      codeSnippet: q.codeSnippet || '',
      question: q.question,
      options: q.type === 'short-answer' ? [] : (q.options || []),
    });

    // Server-side secret answer key
    privateAnswerKeys[q.id] = {
      type: q.type,
      correctAnswerIndex: q.correctAnswerIndex,
      correctAnswerIndices: q.correctAnswerIndices,
      rubric: q.rubric,
      sampleAnswer: q.sampleAnswer,
      explanation: q.explanation,
      knowledgeGap: q.knowledgeGap,
    };
  }

  const sessionId = 'qz_' + crypto.randomUUID();

  // Save session to SQLite database
  quizQueries.createSession({
    id: sessionId,
    userId: userId || null,
    targetRole,
    difficulty,
    questionsPublic: publicQuestions,
    answerKeys: privateAnswerKeys,
  });

  const isPersonalized = Boolean(resumeText && resumeText.trim().length >= 20);

  return {
    sessionId,
    difficulty,
    targetRole,
    isPersonalized,
    isAIGenerated,
    engine: isAIGenerated 
      ? (isPersonalized ? 'Gemini 2.5 Flash (Personalized Resume Quiz)' : 'Gemini 2.5 Flash (Role Scenario Quiz)')
      : 'Adaptive Role Engine (Curated Technical Bank)',
    questionCount: publicQuestions.length,
    questions: publicQuestions,
    disclaimer: PRACTICE_DISCLAIMER,
  };
}

/**
 * Grades user answers for a quiz session using server-side keys.
 *
 * @param {string} sessionId
 * @param {object} userAnswers - map of questionId -> student response
 * @param {string} userId - optional authenticated user ID
 * @returns {Promise<object>} graded evaluation results with explanations and gaps
 */
export async function gradeQuizSession(sessionId, userAnswers = {}, _userId = null) {
  const session = quizQueries.findById(sessionId);
  if (!session) {
    throw new Error('Quiz session not found or expired.');
  }

  const publicQuestions = JSON.parse(session.questions_public || '[]');
  const answerKeys = JSON.parse(session.answer_keys || '{}');

  const questionEvaluations = [];
  const knowledgeGapsIdentified = [];
  let totalScoreSum = 0;

  for (const q of publicQuestions) {
    const key = answerKeys[q.id];
    if (!key) continue;

    const studentAns = userAnswers[q.id];
    let isCorrect = false;
    let earnedPoints = 0; // 0 to 100
    let feedback = '';

    if (key.type === 'single-select' || key.type === 'code-analysis' || key.type === 'scenario-based') {
      isCorrect = Number(studentAns) === key.correctAnswerIndex;
      earnedPoints = isCorrect ? 100 : 0;
      feedback = isCorrect
        ? 'Correct choice.'
        : `Selected option was incorrect. Option ${key.correctAnswerIndex + 1} is the optimal approach.`;
    } else if (key.type === 'multi-select') {
      const studentArr = Array.isArray(studentAns) ? studentAns.map(Number).sort() : [];
      const correctArr = (key.correctAnswerIndices || [key.correctAnswerIndex]).map(Number).sort();

      const isExactMatch = studentArr.length === correctArr.length && studentArr.every((val, i) => val === correctArr[i]);
      if (isExactMatch) {
        isCorrect = true;
        earnedPoints = 100;
        feedback = 'All correct options selected.';
      } else {
        const intersection = studentArr.filter(x => correctArr.includes(x));
        const partial = Math.round((intersection.length / correctArr.length) * 50);
        earnedPoints = partial;
        feedback = `Partial match. Selected ${intersection.length} of ${correctArr.length} required options.`;
      }
    } else if (key.type === 'short-answer') {
      // Evaluate short answer against rubric keywords and length
      const text = String(studentAns || '').trim().toLowerCase();
      if (!text || text.length < 15) {
        earnedPoints = 0;
        feedback = 'Response was too brief to demonstrate architectural trade-off understanding.';
      } else {
        const rubricKeywords = key.rubric?.keywords || ['trade-off', 'performance', 'latency', 'architecture'];
        const matchedKeywords = rubricKeywords.filter(k => text.includes(k.toLowerCase()));
        const keywordScore = Math.min(60, matchedKeywords.length * 20);
        const lengthScore = Math.min(40, Math.round((text.length / 100) * 40));
        earnedPoints = Math.min(100, keywordScore + lengthScore);
        isCorrect = earnedPoints >= 65;
        feedback = isCorrect
          ? `Strong response addressing key architectural dimensions (${matchedKeywords.join(', ') || 'demonstrated'}).`
          : 'Response lacks key engineering criteria (see sample answer below).';
      }
    }

    if (!isCorrect && key.knowledgeGap) {
      knowledgeGapsIdentified.push({
        questionId: q.id,
        category: q.category,
        gap: key.knowledgeGap,
      });
    }

    totalScoreSum += earnedPoints;

    questionEvaluations.push({
      id: q.id,
      category: q.category,
      type: q.type,
      question: q.question,
      codeSnippet: q.codeSnippet || null,
      scenario: q.scenario || null,
      studentAnswer: studentAns,
      isCorrect,
      earnedPoints,
      correctAnswer: key.correctAnswerIndex,
      correctAnswerIndices: key.correctAnswerIndices,
      sampleAnswer: key.sampleAnswer,
      explanation: key.explanation,
      knowledgeGap: key.knowledgeGap,
      feedback,
    });
  }

  const finalScore = publicQuestions.length > 0 ? Math.round(totalScoreSum / publicQuestions.length) : 0;
  const correctCount = questionEvaluations.filter(e => e.isCorrect).length;

  // Record completion in database
  quizQueries.completeSession(sessionId, {
    userAnswers: JSON.stringify(userAnswers),
    score: finalScore,
  });

  return {
    sessionId,
    targetRole: session.target_role,
    difficulty: session.difficulty,
    overallScore: finalScore,
    scorePercent: finalScore,
    correctCount,
    totalQuestions: publicQuestions.length,
    passed: finalScore >= 70,
    readinessTier: finalScore >= 85 
      ? 'Strong Candidate Readiness' 
      : (finalScore >= 70 ? 'Good Alignment with Specific Gaps' : 'Needs Practice On Core Trade-Offs'),
    evaluations: questionEvaluations,
    questionEvaluations: questionEvaluations,
    knowledgeGapsIdentified: knowledgeGapsIdentified.length > 0 ? knowledgeGapsIdentified : [
      { category: session.target_role, gap: 'Continue sharpening edge-case handling, system trade-offs, and latency optimization.' }
    ],
    disclaimer: PRACTICE_DISCLAIMER,
    evaluatedAt: new Date().toISOString(),
  };
}

export { generateExpertQuiz as generateQuizSession };
