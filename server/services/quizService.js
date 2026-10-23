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
      category: 'Database Indexing & Query Optimization',
      type: 'single-select',
      scenario: 'A table with 5 million rows runs: SELECT * FROM applications WHERE user_id = 42 ORDER BY submitted_at DESC LIMIT 10;',
      question: 'Which index structure provides the highest read performance and eliminates an in-memory sort pass (Using filesort)?',
      options: [
        'Two separate single-column indexes: CREATE INDEX idx_user ON applications(user_id) and CREATE INDEX idx_date ON applications(submitted_at).',
        'A composite B-Tree index on (user_id, submitted_at DESC).',
        'A hash index on user_id.',
        'A full-text index on the entire table.'
      ],
      correctAnswerIndex: 1,
      explanation: 'A composite index on (user_id, submitted_at DESC) allows the database engine to perform an index seek for the user_id and immediately read rows in the pre-sorted order of submitted_at, completely avoiding an expensive in-memory filesort.',
      knowledgeGap: 'Composite B-Tree index ordering, index seek vs filesort, and covering indexes.'
    },
    {
      id: 'q_be_4',
      category: 'Distributed Caching & Cache Invalidation',
      type: 'multi-select',
      scenario: 'A backend team uses Redis as a write-around cache in front of a PostgreSQL database.',
      question: 'Which issues can arise when cache invalidation fails during heavy traffic? (Select all that apply)',
      options: [
        'Cache stampede / thundering herd when a hot key expires and hundreds of worker threads hit the database simultaneously.',
        'Data inconsistency where clients read stale cached records after a database update.',
        'Automatic corruption of PostgreSQL WAL logs.',
        'Cascading database connection pool exhaustion.'
      ],
      correctAnswerIndices: [0, 1, 3],
      explanation: 'When hot cache keys expire without mutex locks or probabilistic early expiration, hundreds of threads query the database simultaneously (thundering herd), saturating connection pools and serving inconsistent stale state.',
      knowledgeGap: 'Cache stampede mitigation, mutex locking on cache miss, and cache-aside consistency.'
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
  ]
};

/**
 * Builds the expert quiz generation prompt for Google Gemini.
 */
function buildQuizPrompt(targetRole, jobDescription, skillGaps = [], difficulty = 'expert', questionCount = 5) {
  const wrappedJd = wrapUntrustedDocument('job_description_data', jobDescription);
  const gapsList = Array.isArray(skillGaps) && skillGaps.length > 0
    ? skillGaps.map(g => (typeof g === 'string' ? g : g.missingCompetency || g.skill || '')).filter(Boolean).join(', ')
    : 'System architecture, API idempotency, database indexing, edge case debugging, state concurrency';

  return `
You are the Principal Technical Evaluator designing an EXPERT-LEVEL technical assessment for candidates applying for:
Role: "${targetRole || 'Software Engineering Intern'}"
Target Gaps / Required Domains: ${gapsList}
Difficulty Level: "${difficulty}" (Focus strictly on application, multi-step engineering reasoning, debugging, design trade-offs, and failure mode analysis. DO NOT generate basic recall or trivial terminology questions).

${wrappedJd}

Generate exactly ${questionCount} expert technical questions testing practical engineering judgment.
Include a mixture of:
1. Scenario-based architectural questions
2. Code analysis / bug diagnosis questions (with realistic snippets)
3. Concurrency / database trade-off questions
4. Exactly one high-yield short-answer question testing architectural trade-off reasoning

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
      "scenario": "Realistic background context or setup",
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
 * @param {string} params.userId - optional authenticated user ID
 * @returns {Promise<{ sessionId: string, difficulty: string, targetRole: string, questions: Array, disclaimer: string }>}
 */
export async function generateExpertQuiz({
  targetRole = 'Software Engineering Intern',
  jobDescription = '',
  skillGaps = [],
  difficulty = 'expert',
  questionCount = 5,
  userId = null
}) {
  let questionsPool = [];
  const roleLower = (targetRole || '').toLowerCase();
  const isBackendRole = roleLower.includes('backend') || roleLower.includes('data') || roleLower.includes('fullstack') || roleLower.includes('python') || roleLower.includes('node');
  const fallbackBank = isBackendRole ? EXPERT_ROLE_BANKS.backend : EXPERT_ROLE_BANKS.frontend;

  // Attempt live generation via Gemini if configured
  if (isGeminiConfigured() && jobDescription.trim().length >= 20) {
    try {
      const prompt = buildQuizPrompt(targetRole, jobDescription, skillGaps, difficulty, questionCount);
      const { parsedJson } = await callGeminiStructured(prompt, { temperature: 0.2 });

      if (parsedJson && Array.isArray(parsedJson.questions) && parsedJson.questions.length >= 3) {
        const valid = parsedJson.questions.filter((q, idx) => validateQuestionItem(q, idx));
        if (valid.length >= 3) {
          questionsPool = valid.slice(0, questionCount);
        }
      }
    } catch (err) {
      console.warn('[Quiz Service] Gemini quiz generation failed, falling back to expert bank:', err.message);
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

  return {
    sessionId,
    difficulty,
    targetRole,
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
        // Partial credit calculation
        const correctSet = new Set(correctArr);
        let matches = 0;
        for (const item of studentArr) {
          if (correctSet.has(item)) matches++;
        }
        earnedPoints = Math.max(0, Math.round((matches / Math.max(1, correctArr.length)) * 100) - ((studentArr.length - matches) * 20));
        isCorrect = earnedPoints >= 80;
        feedback = `Partial selection. Correct choices were: ${correctArr.map(idx => `Option ${idx + 1}`).join(', ')}.`;
      }
    } else if (key.type === 'short-answer') {
      // Short answer evaluation
      const studentText = typeof studentAns === 'string' ? studentAns.trim() : '';
      if (!studentText || studentText.length < 15) {
        earnedPoints = 15;
        isCorrect = false;
        feedback = 'Response was too brief to demonstrate architectural trade-off understanding.';
      } else {
        // Concept evaluation based on keywords and concepts
        const keywords = key.rubric?.keywords || ['fcp', 'tti', 'server', 'client', 'latency'];
        const matchedKeywords = keywords.filter(k => studentText.toLowerCase().includes(k.toLowerCase()));
        const keywordScore = Math.min(60, (matchedKeywords.length / Math.max(1, keywords.length)) * 60);
        const lengthScore = Math.min(40, (studentText.length / 250) * 40);

        earnedPoints = Math.round(keywordScore + lengthScore);
        isCorrect = earnedPoints >= 65;
        feedback = `Architectural analysis addressed ${matchedKeywords.length} of ${keywords.length} core concepts.`;
      }
    }

    if (!isCorrect && key.knowledgeGap) {
      knowledgeGapsIdentified.push(key.knowledgeGap);
    }

    totalScoreSum += earnedPoints;

    questionEvaluations.push({
      id: q.id,
      category: q.category,
      type: key.type,
      question: q.question,
      options: q.options,
      userAnswer: studentAns !== undefined ? studentAns : null,
      correctAnswerIndex: key.correctAnswerIndex,
      correctAnswerIndices: key.correctAnswerIndices,
      sampleAnswer: key.sampleAnswer,
      isCorrect,
      earnedPoints,
      feedback,
      explanation: key.explanation,
      knowledgeGap: key.knowledgeGap,
    });
  }

  const finalScore = Math.round(totalScoreSum / Math.max(1, questionEvaluations.length));

  // Save completion state to database
  quizQueries.completeSession(sessionId, {
    userAnswers,
    score: finalScore,
  });

  return {
    sessionId,
    targetRole: session.target_role,
    difficulty: session.difficulty,
    overallScore: finalScore,
    passed: finalScore >= 70,
    evaluations: questionEvaluations,
    knowledgeGapsIdentified: Array.from(new Set(knowledgeGapsIdentified)),
    disclaimer: PRACTICE_DISCLAIMER,
    evaluatedAt: new Date().toISOString(),
  };
}

export { generateExpertQuiz as generateQuizSession };
