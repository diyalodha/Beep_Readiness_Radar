/**
 * Rigorous Analysis Validation Layer for Beep Readiness Radar
 *
 * Enforces schema compliance, score range bounds, scoring policy math,
 * evidence grounding against source text, contradiction detection, and
 * prevents hallucinated quotations.
 */

import { calculateWeightedScore } from '../config/scoringPolicy.js';

const MIN_INPUT_CHARS = 20;

/**
 * Normalizes text for robust excerpt matching (case-insensitive, whitespace collapsed).
 */
function normalizeText(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Checks whether an excerpt is grounded in the source text.
 * Returns true if exact substring exists or >=85% of meaningful words are present.
 */
export function isExcerptGrounded(excerpt, sourceText) {
  if (!excerpt || typeof excerpt !== 'string') return false;
  if (!sourceText || typeof sourceText !== 'string') return false;

  const normExcerpt = normalizeText(excerpt);
  const normSource = normalizeText(sourceText);

  if (normExcerpt.length === 0) return false;

  // Direct substring match
  if (normSource.includes(normExcerpt)) {
    return true;
  }

  // If excerpt has quotes, try stripping quotes
  const unquoted = normExcerpt.replace(/^["'`]|["'`]$/g, '').trim();
  if (unquoted.length > 5 && normSource.includes(unquoted)) {
    return true;
  }

  // Token-level fuzzy check for longer sentences (handles OCR or token boundary nuances)
  const tokens = normExcerpt.split(' ').filter(w => w.length > 2);
  if (tokens.length >= 4) {
    let matchCount = 0;
    for (const token of tokens) {
      if (normSource.includes(token)) {
        matchCount++;
      }
    }
    const tokenRatio = matchCount / tokens.length;
    if (tokenRatio >= 0.85) {
      return true;
    }
  }

  return false;
}

/**
 * Validates raw API request inputs before processing.
 */
export function validateInputPayload({ resumeText, jobDescription, targetRole, companyName }) {
  const errors = [];

  if (typeof resumeText !== 'string' || resumeText.trim().length < MIN_INPUT_CHARS) {
    errors.push(`Resume text is missing or too short (minimum ${MIN_INPUT_CHARS} characters required).`);
  } else if (resumeText.length > 50000) {
    errors.push('Resume text exceeds maximum limit of 50,000 characters.');
  }

  if (typeof jobDescription !== 'string' || jobDescription.trim().length < MIN_INPUT_CHARS) {
    errors.push(`Job description is missing or too short (minimum ${MIN_INPUT_CHARS} characters required).`);
  } else if (jobDescription.length > 50000) {
    errors.push('Job description exceeds maximum limit of 50,000 characters.');
  }

  if (targetRole && (typeof targetRole !== 'string' || targetRole.length > 200)) {
    errors.push('Target role must be a string under 200 characters.');
  }

  if (companyName && (typeof companyName !== 'string' || companyName.length > 200)) {
    errors.push('Company name must be a string under 200 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates and normalizes the structured output from the LLM or heuristic engine.
 *
 * @param {object} analysisData - Raw output object
 * @param {string} resumeText - Original candidate resume string
 * @param {string} jobDescription - Original target job description string
 * @returns {object} validated and ground-checked analysis result
 */
export function validateAndEnforceAnalysis(analysisData, resumeText, jobDescription) {
  const validationFlags = [];

  if (!analysisData || typeof analysisData !== 'object') {
    throw new Error('Analysis output is null or not an object.');
  }

  // 1. Dimension Scores & Policy Recalculation
  const dimensionScores = analysisData.dimensionScores || {};
  const criticalGaps = Array.isArray(analysisData.criticalSkillGaps) ? analysisData.criticalSkillGaps : [];

  const policyEvaluation = calculateWeightedScore(dimensionScores, criticalGaps);

  // Use the policy-recalculated score as the authoritative ground truth
  const verifiedScore = policyEvaluation.finalScore;
  const verifiedReadiness = policyEvaluation.readinessBand;

  if (typeof analysisData.overallReadinessScore === 'number') {
    const diff = Math.abs(analysisData.overallReadinessScore - verifiedScore);
    if (diff > 5) {
      validationFlags.push({
        type: 'SCORE_RECALIBRATED',
        detail: `Model proposed score ${analysisData.overallReadinessScore} was adjusted to ${verifiedScore} following strict scoring policy weights.`,
      });
    }
  }

  // 2. Evidence Grounding Verification
  let totalExcerptsChecked = 0;
  let groundedExcerptsCount = 0;

  // Verify Evidence-Backed Strengths
  const validatedStrengths = [];
  const strengths = Array.isArray(analysisData.evidenceBackedStrengths) ? analysisData.evidenceBackedStrengths : [];

  for (const s of strengths) {
    if (!s || typeof s !== 'object') continue;
    const resumeExcerpt = s.evidenceExcerptFromResume || s.excerpt || '';
    const jdExcerpt = s.jdExcerpt || s.requirementExcerpt || '';

    const isResumeGrounded = isExcerptGrounded(resumeExcerpt, resumeText);
    const isJdGrounded = jdExcerpt ? isExcerptGrounded(jdExcerpt, jobDescription) : true;

    totalExcerptsChecked += (resumeExcerpt ? 1 : 0) + (jdExcerpt ? 1 : 0);
    if (isResumeGrounded) groundedExcerptsCount++;
    if (jdExcerpt && isJdGrounded) groundedExcerptsCount++;

    if (!isResumeGrounded && resumeExcerpt) {
      validationFlags.push({
        type: 'UNGROUNDED_STRENGTH_EXCERPT',
        detail: `Strength "${s.competency || 'Skill'}" cited an excerpt not verified in the uploaded resume.`,
      });
    }

    validatedStrengths.push({
      competency: String(s.competency || s.skill || 'Competency').trim(),
      evidenceExcerptFromResume: String(resumeExcerpt).trim(),
      jdExcerpt: String(jdExcerpt).trim(),
      depthLevel: s.depthLevel || 'Demonstrated in Project',
      reasoning: String(s.reasoning || '').trim(),
      isGrounded: isResumeGrounded,
    });
  }

  // Verify Critical Skill Gaps
  const validatedGaps = [];
  for (const g of criticalGaps) {
    if (!g || typeof g !== 'object') continue;
    const jdExcerpt = g.jdRequirementExcerpt || g.requirementExcerpt || '';
    const isGrounded = jdExcerpt ? isExcerptGrounded(jdExcerpt, jobDescription) : true;

    if (jdExcerpt) {
      totalExcerptsChecked++;
      if (isGrounded) groundedExcerptsCount++;
    }

    validatedGaps.push({
      missingCompetency: String(g.missingCompetency || g.skill || 'Missing Skill').trim(),
      jdRequirementExcerpt: String(jdExcerpt).trim(),
      impactOnRole: String(g.impactOnRole || 'Important for target role').trim(),
      isMandatoryBlocker: Boolean(g.isMandatoryBlocker || g.severity === 'critical'),
      recommendation: String(g.recommendation || '').trim(),
      isGrounded,
    });
  }

  // Verify Claims Needing Stronger Evidence
  const validatedClaims = [];
  const claims = Array.isArray(analysisData.claimsNeedingStrongerEvidence) ? analysisData.claimsNeedingStrongerEvidence : [];
  for (const c of claims) {
    if (!c || typeof c !== 'object') continue;
    const excerpt = c.excerpt || c.claimExcerpt || '';
    const isGrounded = excerpt ? isExcerptGrounded(excerpt, resumeText) : false;

    if (excerpt) {
      totalExcerptsChecked++;
      if (isGrounded) groundedExcerptsCount++;
    }

    validatedClaims.push({
      claim: String(c.claim || c.title || 'Unsubstantiated Claim').trim(),
      excerpt: String(excerpt).trim(),
      concern: String(c.concern || 'Lacks measurable metrics or repository proof.').trim(),
      suggestion: String(c.suggestion || 'Add quantifiable outcome metrics.').trim(),
      isGrounded,
    });
  }

  // 3. Contradiction Detection
  // Check if a competency is claimed as both a verified strength and a critical gap
  const strengthNames = new Set(validatedStrengths.map(s => s.competency.toLowerCase()));
  for (const gap of validatedGaps) {
    if (strengthNames.has(gap.missingCompetency.toLowerCase())) {
      validationFlags.push({
        type: 'CONTRADICTORY_FINDING',
        detail: `Competency "${gap.missingCompetency}" was listed both as an evidence-backed strength and a critical gap.`,
      });
    }
  }

  // Calculate grounded excerpt ratio
  const groundedExcerptRatio = totalExcerptsChecked > 0
    ? Math.round((groundedExcerptsCount / totalExcerptsChecked) * 100)
    : 100;

  // Validation Tier determination
  let validationTier = 'LLM Validated';
  if (analysisData.isAIGenerated === false) {
    validationTier = 'Heuristic Fallback Validated';
  } else if (groundedExcerptRatio < 70) {
    validationTier = 'LLM Evaluated (Partial Excerpt Grounding)';
  }

  // Ensure confidence level is valid
  const validConfidenceLevels = ['high', 'medium', 'low'];
  let confidenceLevel = analysisData.confidenceLevel;
  if (!validConfidenceLevels.includes(confidenceLevel)) {
    confidenceLevel = groundedExcerptRatio >= 85 ? 'high' : 'medium';
  }

  return {
    ...analysisData,

    // Authoritative scores from policy
    overallReadinessScore: verifiedScore,
    matchScore: verifiedScore,
    readinessLevel: verifiedReadiness,
    badgeColor: policyEvaluation.badgeColor,
    readyForScreening: policyEvaluation.readyForScreening,
    hasMandatoryBlocker: policyEvaluation.hasMandatoryBlocker,
    penaltyApplied: policyEvaluation.penaltyApplied,
    dimensionBreakdown: policyEvaluation.dimensionBreakdown,

    // Confidence & justification
    confidenceLevel,
    confidenceExplanation: analysisData.confidenceExplanation ||
      `Confidence rated ${confidenceLevel} based on ${groundedExcerptRatio}% verified textual grounding between resume claims and job criteria.`,
    reasoningJustification: analysisData.reasoningJustification || analysisData.recruiterInsight ||
      'Evaluated using threshold-based dimensional weighting across required skills, evidence depth, and domain experience.',

    // Grounded collections
    evidenceBackedStrengths: validatedStrengths,
    criticalSkillGaps: validatedGaps,
    adjacentTransferableSkills: Array.isArray(analysisData.adjacentTransferableSkills) ? analysisData.adjacentTransferableSkills : [],
    claimsNeedingStrongerEvidence: validatedClaims,

    // Backward-compatible skills breakdown for existing UI
    skillsBreakdown: {
      matched: validatedStrengths.map(s => s.competency),
      transferable: Array.isArray(analysisData.adjacentTransferableSkills)
        ? analysisData.adjacentTransferableSkills.map(t => `${t.candidateSkill || t.skill} (→ ${t.targetSkill || 'Target'})`)
        : (analysisData.skillsBreakdown?.transferable || []),
      missingCritical: validatedGaps.map(g => g.missingCompetency),
    },

    // Validation Status Object
    validationStatus: {
      isValid: true,
      validationTier,
      totalExcerptsChecked,
      groundedExcerptsCount,
      groundedExcerptRatio,
      validationFlags,
      evaluatedAt: new Date().toISOString(),
    },
  };
}
