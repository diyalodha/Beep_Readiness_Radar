/**
 * Central Scoring Policy & Threshold Rules for Beep Readiness Radar
 *
 * This policy governs the mathematical evaluation of student resumes against
 * job descriptions. Dimension weights and readiness bands are strictly enforced
 * on the backend so the system does not blindly trust raw model numbers.
 */

export const SCORING_WEIGHTS = {
  // Must-have core technologies, framework requirements, and foundational stack
  requiredCompetencies: 0.35,

  // Verifiable projects, measured metrics, code links, live demos, and technical depth
  depthOfEvidence: 0.25,

  // Recency, internships, production exposure, and practical domain alignment
  relevantExperience: 0.15,

  // Bonus/preferred technologies and tools mentioned in the job description
  preferredCompetencies: 0.15,

  // Adjacent languages/frameworks that readily translate to the target stack
  transferableSkills: 0.10,
};

// Verify weights sum to 1.0 (100%)
const totalWeight = Object.values(SCORING_WEIGHTS).reduce((acc, w) => acc + w, 0);
if (Math.abs(totalWeight - 1.0) > 0.001) {
  throw new Error(`[Scoring Policy Error] Weights must sum to 1.0, current sum: ${totalWeight}`);
}

export const READINESS_BANDS = [
  {
    minScore: 85,
    maxScore: 100,
    band: 'Strong Alignment',
    description: 'High readiness across core technical requirements with verifiable project evidence. Recommended to apply immediately.',
    badgeColor: 'emerald',
    readyForScreening: true,
  },
  {
    minScore: 70,
    maxScore: 84,
    band: 'Good Alignment',
    description: 'Solid foundational overlap with specific addressable gaps. A 48-hour focused project can bridge remaining missing requirements.',
    badgeColor: 'blue',
    readyForScreening: true,
  },
  {
    minScore: 50,
    maxScore: 69,
    band: 'Partial Alignment',
    description: 'Moderate overlap; core stack or practical project evidence is partially missing. Targeted sprint preparation recommended prior to applying.',
    badgeColor: 'amber',
    readyForScreening: false,
  },
  {
    minScore: 0,
    maxScore: 49,
    band: 'Significant Gaps',
    description: 'Substantial skill or domain gap. Foundational coursework and beginner-to-intermediate proof-of-work development recommended.',
    badgeColor: 'rose',
    readyForScreening: false,
  },
];

export const CRITICAL_REQUIREMENT_POLICY = {
  // Cap score if an essential non-negotiable prerequisite (e.g. required core language) is absent
  mandatoryMissingMaxScore: 65,
  mandatoryMissingBand: 'Partial Alignment (Critical Prerequisite Missing)',
  mandatoryMissingNotice: 'A mandatory qualification or non-negotiable core competency is missing from the resume. This caps readiness classification regardless of peripheral skills.',
};

/**
 * Calculates a verified weighted readiness score enforcing bounds [0, 100]
 * and the critical requirement policy.
 */
export function calculateWeightedScore(dimensionScores = {}, criticalGaps = []) {
  const clamp = (val) => Math.max(0, Math.min(100, Number(val) || 0));

  const reqScore = clamp(dimensionScores.requiredCompetencies);
  const depthScore = clamp(dimensionScores.depthOfEvidence);
  const expScore = clamp(dimensionScores.relevantExperience);
  const prefScore = clamp(dimensionScores.preferredCompetencies);
  const transScore = clamp(dimensionScores.transferableSkills);

  // Raw weighted sum
  let rawWeighted = (
    reqScore * SCORING_WEIGHTS.requiredCompetencies +
    depthScore * SCORING_WEIGHTS.depthOfEvidence +
    expScore * SCORING_WEIGHTS.relevantExperience +
    prefScore * SCORING_WEIGHTS.preferredCompetencies +
    transScore * SCORING_WEIGHTS.transferableSkills
  );

  const hasMandatoryBlocker = Array.isArray(criticalGaps) && criticalGaps.some(
    (gap) => gap.isMandatoryBlocker === true || gap.severity === 'critical'
  );

  let penaltyApplied = 0;
  if (hasMandatoryBlocker) {
    // If mandatory requirements are absent, apply cap
    if (rawWeighted > CRITICAL_REQUIREMENT_POLICY.mandatoryMissingMaxScore) {
      penaltyApplied = Math.round(rawWeighted - CRITICAL_REQUIREMENT_POLICY.mandatoryMissingMaxScore);
      rawWeighted = CRITICAL_REQUIREMENT_POLICY.mandatoryMissingMaxScore;
    }
  }

  const finalScore = Math.round(clamp(rawWeighted));
  const readiness = getReadinessBand(finalScore, hasMandatoryBlocker);

  return {
    finalScore,
    dimensionBreakdown: {
      requiredCompetencies: { score: reqScore, weight: SCORING_WEIGHTS.requiredCompetencies, contribution: Math.round(reqScore * SCORING_WEIGHTS.requiredCompetencies) },
      depthOfEvidence: { score: depthScore, weight: SCORING_WEIGHTS.depthOfEvidence, contribution: Math.round(depthScore * SCORING_WEIGHTS.depthOfEvidence) },
      relevantExperience: { score: expScore, weight: SCORING_WEIGHTS.relevantExperience, contribution: Math.round(expScore * SCORING_WEIGHTS.relevantExperience) },
      preferredCompetencies: { score: prefScore, weight: SCORING_WEIGHTS.preferredCompetencies, contribution: Math.round(prefScore * SCORING_WEIGHTS.preferredCompetencies) },
      transferableSkills: { score: transScore, weight: SCORING_WEIGHTS.transferableSkills, contribution: Math.round(transScore * SCORING_WEIGHTS.transferableSkills) },
    },
    hasMandatoryBlocker,
    penaltyApplied,
    readinessBand: readiness.band,
    readinessDescription: readiness.description,
    badgeColor: readiness.badgeColor,
    readyForScreening: readiness.readyForScreening,
  };
}

/**
 * Returns the matching readiness band for a given numeric score.
 */
export function getReadinessBand(score, hasMandatoryBlocker = false) {
  if (hasMandatoryBlocker && score <= CRITICAL_REQUIREMENT_POLICY.mandatoryMissingMaxScore) {
    return {
      band: CRITICAL_REQUIREMENT_POLICY.mandatoryMissingBand,
      description: CRITICAL_REQUIREMENT_POLICY.mandatoryMissingNotice,
      badgeColor: 'amber',
      readyForScreening: false,
    };
  }

  for (const b of READINESS_BANDS) {
    if (score >= b.minScore && score <= b.maxScore) {
      return b;
    }
  }

  return READINESS_BANDS[READINESS_BANDS.length - 1];
}

export const SCORING_POLICY_DOC = {
  policyVersion: '2026.2-threshold-policy',
  weights: SCORING_WEIGHTS,
  bands: READINESS_BANDS,
  criticalRequirementPolicy: CRITICAL_REQUIREMENT_POLICY,
};

// Convenient exports & aliases
export { SCORING_WEIGHTS as DIMENSION_WEIGHTS };
export { CRITICAL_REQUIREMENT_POLICY as CRITICAL_GAP_POLICY };
