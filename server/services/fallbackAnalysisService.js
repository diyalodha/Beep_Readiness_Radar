/**
 * Enhanced Fallback Analysis Service for Beep Readiness Radar
 *
 * Invoked when Gemini API is unconfigured, rate-limited, timed out, or unavailable.
 * Produces the complete unified schema with grounded evidence and explicit disclosure.
 */

import { runDynamicHeuristicAnalysis } from '../../src/utils/heuristicCore.js';
import { calculateWeightedScore } from '../config/scoringPolicy.js';

export function runFallbackAnalysis(resumeText, jobDescription, targetRole, companyName, reasonNotice = '') {
  // Run core boundary-aware token analyzer
  const coreResult = runDynamicHeuristicAnalysis(
    resumeText,
    jobDescription,
    targetRole || 'Internship Candidate',
    companyName || 'Hiring Company'
  );

  // Derive dimension scores based on detected textual evidence
  const matchedCount = coreResult.skillsBreakdown?.matched?.length || 0;
  const missingCount = coreResult.skillsBreakdown?.missingCritical?.length || 0;
  const totalJd = Math.max(1, matchedCount + missingCount);

  const reqScore = Math.min(100, Math.round((matchedCount / totalJd) * 100));
  const depthScore = coreResult.resumeStats?.hasMetrics ? (coreResult.resumeStats?.hasLiveLinks ? 85 : 70) : (coreResult.resumeStats?.hasLiveLinks ? 60 : 45);
  const expScore = Math.min(90, Math.max(30, Math.round(coreResult.resumeStats?.wordCount ? (coreResult.resumeStats.wordCount / 350) * 80 : 40)));
  const prefScore = Math.min(85, Math.max(35, Math.round(reqScore * 0.85)));
  const transScore = (coreResult.skillsBreakdown?.transferable?.length || 0) > 0 ? 75 : 45;

  const dimensionScores = {
    requiredCompetencies: reqScore,
    depthOfEvidence: depthScore,
    relevantExperience: expScore,
    preferredCompetencies: prefScore,
    transferableSkills: transScore,
  };

  // Build grounded strengths with verified text excerpts
  const resumeLines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const jdLines = jobDescription.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const evidenceBackedStrengths = (coreResult.skillsBreakdown?.matched || []).map(skill => {
    // Find matching line in resume for grounding
    const matchingResumeLine = resumeLines.find(l => l.toLowerCase().includes(skill.toLowerCase())) || `${skill} documented in candidate profile`;
    const matchingJdLine = jdLines.find(l => l.toLowerCase().includes(skill.toLowerCase())) || `Proficiency in ${skill} required`;

    return {
      competency: skill,
      evidenceExcerptFromResume: matchingResumeLine.slice(0, 140),
      jdExcerpt: matchingJdLine.slice(0, 140),
      depthLevel: matchingResumeLine.length > 40 ? 'Project Implementation' : 'Keyword Mention',
      reasoning: `Demonstrated ${skill} alignment matching role requirements.`,
    };
  });

  // Build grounded critical gaps
  const criticalSkillGaps = (coreResult.skillsBreakdown?.missingCritical || []).map(skill => {
    const matchingJdLine = jdLines.find(l => l.toLowerCase().includes(skill.toLowerCase())) || `Strong grasp of ${skill} required`;
    return {
      missingCompetency: skill,
      jdRequirementExcerpt: matchingJdLine.slice(0, 140),
      impactOnRole: `Primary qualification for ${targetRole || 'this position'}.`,
      isMandatoryBlocker: false,
      recommendation: `Construct a weekend micro-project focused on ${skill} to overcome recruiter screening hurdles.`,
    };
  });

  // Calculate weighted policy score
  const policyEvaluation = calculateWeightedScore(dimensionScores, criticalSkillGaps);

  // Build transferable skills
  const adjacentTransferableSkills = (coreResult.skillsBreakdown?.transferable || []).map(t => {
    const clean = t.replace(/\s*\(.*?\)/, '').trim();
    return {
      candidateSkill: clean,
      targetSkill: targetRole || 'Target Technology',
      transferableRelevance: 'Core engineering concepts directly bridge to the target framework.',
      bridgeEffort: '1-2 Days of guided practice',
    };
  });

  // Claims needing stronger evidence
  const claimsNeedingStrongerEvidence = [];
  if (!coreResult.resumeStats?.hasMetrics) {
    const unmeasuredProject = resumeLines.find(l => l.toLowerCase().includes('built') || l.toLowerCase().includes('developed')) || resumeLines[0] || '';
    if (unmeasuredProject) {
      claimsNeedingStrongerEvidence.push({
        claim: 'Unmeasured project statement',
        excerpt: unmeasuredProject.slice(0, 120),
        concern: 'Statement describes general tasks without quantified performance or efficiency metrics.',
        suggestion: 'Apply the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].',
      });
    }
  }

  const defaultNotice = reasonNotice || 'Gemini API not active or unavailable. Showing offline heuristic match results.';

  return {
    ...coreResult,
    isAIGenerated: false,
    engine: 'Fallback Analysis (Heuristic Engine)',
    fallbackNotice: defaultNotice,

    // Unified scoring and dimensions
    overallReadinessScore: policyEvaluation.finalScore,
    matchScore: policyEvaluation.finalScore,
    readinessLevel: policyEvaluation.readinessBand,
    badgeColor: policyEvaluation.badgeColor,
    readyForScreening: policyEvaluation.readyForScreening,
    hasMandatoryBlocker: policyEvaluation.hasMandatoryBlocker,
    dimensionScores,
    dimensionBreakdown: policyEvaluation.dimensionBreakdown,

    // Semantic fields
    confidenceLevel: 'medium',
    confidenceExplanation: 'Heuristic evaluation based on boundary-aware token matching. Connect Gemini API for deep semantic reasoning.',
    semanticFitScore: policyEvaluation.finalScore,
    requiredSkillsCoverage: reqScore,
    preferredSkillsCoverage: prefScore,

    evidenceBackedStrengths,
    criticalSkillGaps,
    adjacentTransferableSkills,
    claimsNeedingStrongerEvidence,

    reasoningJustification: `Heuristic evaluation identified ${matchedCount} matching technical competencies out of ${totalJd} key requirements for ${targetRole || 'the role'}.`,

    recommendedResumeImprovements: [
      'Quantify project impact with bracketed metrics: e.g. [X]% latency reduction, [N] active users.',
      'Add live deployment links (Vercel, Render) and public GitHub repository links next to project headers.',
      'Explicitly highlight foundational skills mentioned in the job description to pass ATS token filters.',
    ],

    prioritizedRoadmap: coreResult.sevenDayPlan || [],
    suggestedPortfolioProjects: [coreResult.proofOfWorkProject].filter(Boolean),
    suggestedInterviewTopics: coreResult.interviewQuestions || [],
    actionableNextSteps: `Complete the recommended 48-hour proof-of-work project to address missing competencies in ${criticalSkillGaps.map(g => g.missingCompetency).slice(0, 2).join(', ') || 'core stack'}.`,
  };
}

export { runFallbackAnalysis as generateFallbackAnalysis };
