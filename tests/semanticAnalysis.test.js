import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DIMENSION_WEIGHTS,
  SCORING_WEIGHTS,
  calculateWeightedScore,
  getReadinessBand,
  CRITICAL_GAP_POLICY
} from '../server/config/scoringPolicy.js';

import {
  isExcerptGrounded,
  validateInputPayload,
  validateAndEnforceAnalysis
} from '../server/services/analysisValidator.js';

import { generateFallbackAnalysis } from '../server/services/fallbackAnalysisService.js';

test('Threshold-Based Scoring Policy Unit Tests', async (t) => {
  await t.test('Scoring dimensions sum up to exactly 1.00 (100%)', () => {
    const totalWeight = Object.values(DIMENSION_WEIGHTS).reduce((sum, w) => sum + w, 0);
    assert.equal(Math.round(totalWeight * 100), 100);
    assert.equal(SCORING_WEIGHTS.requiredCompetencies, 0.35);
    assert.equal(SCORING_WEIGHTS.depthOfEvidence, 0.25);
    assert.equal(SCORING_WEIGHTS.relevantExperience, 0.15);
    assert.equal(SCORING_WEIGHTS.preferredCompetencies, 0.15);
    assert.equal(SCORING_WEIGHTS.transferableSkills, 0.10);
  });

  await t.test('calculateWeightedScore calculates mathematically sound weighted sums', () => {
    // Perfect scores across all dimensions
    const perfect = calculateWeightedScore({
      requiredCompetencies: 100,
      depthOfEvidence: 100,
      relevantExperience: 100,
      preferredCompetencies: 100,
      transferableSkills: 100
    });
    assert.equal(perfect.finalScore, 100);

    // Balanced score
    // 80 * 0.35 (28) + 70 * 0.25 (17.5) + 60 * 0.15 (9) + 50 * 0.15 (7.5) + 80 * 0.10 (8) = 70
    const balanced = calculateWeightedScore({
      requiredCompetencies: 80,
      depthOfEvidence: 70,
      relevantExperience: 60,
      preferredCompetencies: 50,
      transferableSkills: 80
    });
    assert.equal(balanced.finalScore, 70);
    assert.equal(balanced.dimensionBreakdown.requiredCompetencies.contribution, 28);
    assert.equal(balanced.dimensionBreakdown.depthOfEvidence.contribution, 18); // rounded
  });

  await t.test('Readiness bands map correctly to threshold ranges', () => {
    assert.equal(getReadinessBand(90).band, 'Strong Alignment');
    assert.equal(getReadinessBand(85).band, 'Strong Alignment');
    assert.equal(getReadinessBand(84).band, 'Good Alignment');
    assert.equal(getReadinessBand(70).band, 'Good Alignment');
    assert.equal(getReadinessBand(69).band, 'Partial Alignment');
    assert.equal(getReadinessBand(50).band, 'Partial Alignment');
    assert.equal(getReadinessBand(49).band, 'Significant Gaps');
    assert.equal(getReadinessBand(0).band, 'Significant Gaps');
  });

  await t.test('Mandatory prerequisite blocker caps score at 65 and adjusts readiness band', () => {
    const rawDimensions = {
      requiredCompetencies: 95,
      depthOfEvidence: 90,
      relevantExperience: 85,
      preferredCompetencies: 90,
      transferableSkills: 85
    };
    
    // Without mandatory blocker
    const unblocked = calculateWeightedScore(rawDimensions, []);
    assert.ok(unblocked.finalScore >= 85);
    assert.equal(unblocked.hasMandatoryBlocker, false);

    // With mandatory blocker active
    const criticalGaps = [{ skillOrCompetency: 'Core Python', isMandatoryBlocker: true }];
    const blocked = calculateWeightedScore(rawDimensions, criticalGaps);
    assert.equal(blocked.finalScore, CRITICAL_GAP_POLICY.mandatoryMissingMaxScore); // 65
    assert.equal(blocked.finalScore, 65);
    assert.equal(blocked.hasMandatoryBlocker, true);
    assert.equal(blocked.readinessBand, 'Partial Alignment (Critical Prerequisite Missing)');
  });
});

test('Analysis Grounding and Validation Unit Tests', async (t) => {
  const sampleResume = `
    Alex Rivera - Full Stack Developer
    alex@college.edu | github.com/alexrivera
    Skills: React, Node.js, Express, PostgreSQL, Docker, Git.
    Experience: Built an internal analytics dashboard using React and Tailwind CSS.
    Engineered REST APIs with Express and optimized PostgreSQL indexes reducing latency by 35%.
  `;

  const sampleJd = `
    Internship: Full Stack Developer at TechVentures
    Requirements:
    - Strong knowledge of React.js and modern JavaScript (ES6+)
    - Experience designing RESTful APIs with Node.js and Express
    - Familiarity with relational databases like PostgreSQL
    - Nice to have: Docker and containerization basics
  `;

  await t.test('isExcerptGrounded verifies verbatim and case-insensitive substrings', () => {
    assert.equal(isExcerptGrounded('internal analytics dashboard using React', sampleResume), true);
    assert.equal(isExcerptGrounded('optimized PostgreSQL indexes reducing latency by 35%', sampleResume), true);
    assert.equal(isExcerptGrounded('Designing RESTful APIs with Node.js', sampleJd), true);
    assert.equal(isExcerptGrounded('Kubernetes cluster management with Terraform', sampleResume), false);
  });

  await t.test('validateInputPayload catches short or empty resume text', () => {
    const emptyResult = validateInputPayload({ resumeText: '', jobDescription: sampleJd });
    assert.equal(emptyResult.isValid, false);
    assert.ok(emptyResult.errors.length > 0);

    const shortResult = validateInputPayload({ resumeText: 'Too short', jobDescription: sampleJd });
    assert.equal(shortResult.isValid, false);

    const validResult = validateInputPayload({
      resumeText: sampleResume,
      jobDescription: sampleJd,
      targetRole: 'Full Stack Developer'
    });
    assert.equal(validResult.isValid, true);
    assert.equal(validResult.errors.length, 0);
  });

  await t.test('validateAndEnforceAnalysis guarantees mathematical rigor and excerpt grounding', () => {
    const candidateAnalysis = {
      targetRole: 'Full Stack Developer',
      overallReadinessScore: 99, // Deliberate mismatch with dimension scores to test server authority
      dimensionScores: {
        requiredCompetencies: 80,
        depthOfEvidence: 80,
        relevantExperience: 70,
        preferredCompetencies: 70,
        transferableSkills: 70
      },
      evidenceBackedStrengths: [
        {
          skillOrCompetency: 'PostgreSQL Optimization',
          depthRating: 'Proficient',
          evidenceExcerptFromResume: 'optimized PostgreSQL indexes reducing latency by 35%',
          matchingRequirementFromJd: 'relational databases like PostgreSQL',
          analysis: 'Demonstrated real database query indexing with measured 35% latency drop.'
        }
      ],
      criticalSkillGaps: [],
      adjacentTransferableSkills: [],
      claimsNeedingEvidence: []
    };

    const validated = validateAndEnforceAnalysis(
      candidateAnalysis,
      sampleResume,
      sampleJd
    );

    // Overridden by authoritative math: 80*0.35 + 80*0.25 + 70*0.15 + 70*0.15 + 70*0.10 = 28 + 20 + 10.5 + 10.5 + 7 = 76
    assert.equal(validated.overallReadinessScore, 76);
    assert.equal(validated.validationStatus.groundedExcerptRatio, 100);
    assert.equal(validated.validationStatus.validationTier, 'LLM Validated');
    assert.ok(validated.validationStatus.validationFlags.some(f => f.type === 'SCORE_RECALIBRATED'));
  });
});

test('Fallback Analysis Service Unit Tests', async (t) => {
  const resume = `
    Priya Sharma
    Skills: Python, Django, SQL, Git, Linux.
    Projects: Built an e-commerce backend in Django with SQLite. Created REST endpoints for user checkout.
  `;
  const jd = `
    Backend Developer Intern
    Must have: Python, Django, REST APIs, SQL.
    Good to have: Docker, AWS.
  `;

  await t.test('generateFallbackAnalysis returns full unified schema with honest fallback disclosure', () => {
    const result = generateFallbackAnalysis(resume, jd, 'Backend Developer', 'Missing Gemini API key');

    assert.equal(result.isAIGenerated, false);
    assert.ok(result.engine.includes('Fallback Analysis'));
    assert.equal(result.targetRole, 'Backend Developer');
    assert.ok(result.overallReadinessScore >= 0 && result.overallReadinessScore <= 100);

    // Dimension scores
    assert.ok(result.dimensionScores.requiredCompetencies);
    assert.ok(result.dimensionScores.depthOfEvidence);

    // Evidence-backed strengths with grounded quotes
    assert.ok(Array.isArray(result.evidenceBackedStrengths));
    assert.ok(result.evidenceBackedStrengths.length > 0);
    const firstStr = result.evidenceBackedStrengths[0];
    assert.ok(firstStr.evidenceExcerptFromResume || firstStr.resumeExcerpt);

    // Interview questions
    assert.ok(Array.isArray(result.interviewQuestions));
    assert.ok(result.interviewQuestions.length >= 1);

    // Proof of work project
    assert.ok(result.proofOfWorkProject);
    assert.ok(result.proofOfWorkProject.title);
    assert.ok(result.proofOfWorkProject.readmeTemplate);
  });
});
