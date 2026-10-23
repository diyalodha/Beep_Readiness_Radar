import test from 'node:test';
import assert from 'node:assert/strict';

import { generateQuizSession, gradeQuizSession } from '../server/services/quizService.js';
import { quizQueries } from '../server/db.js';

test('Expert Adaptive Quiz Unit Tests', async (t) => {
  let createdSessionId = null;

  await t.test('generateQuizSession returns public questions with ZERO answer-key leakage', async () => {
    const sessionPayload = await generateQuizSession({
      targetRole: 'Frontend Developer',
      difficulty: 'expert',
      questionCount: 5,
      detectedGaps: ['React Performance', 'Web Security']
    });

    assert.ok(sessionPayload.sessionId);
    assert.ok(sessionPayload.sessionId.startsWith('qz_'));
    createdSessionId = sessionPayload.sessionId;

    assert.equal(sessionPayload.targetRole, 'Frontend Developer');
    assert.equal(sessionPayload.difficulty, 'expert');
    assert.equal(sessionPayload.questions.length, 5);

    // Strict Anti-Leakage Check
    for (const q of sessionPayload.questions) {
      assert.ok(q.id);
      assert.ok(q.category);
      assert.ok(q.type);
      assert.ok(q.question);

      // Verify that no secret keys leaked into the public client representation
      assert.equal(q.correctAnswerIndex, undefined, `Leaked correctAnswerIndex in question ${q.id}`);
      assert.equal(q.correctAnswerIndices, undefined, `Leaked correctAnswerIndices in question ${q.id}`);
      assert.equal(q.rubric, undefined, `Leaked rubric in question ${q.id}`);
      assert.equal(q.sampleAnswer, undefined, `Leaked sampleAnswer in question ${q.id}`);
      assert.equal(q.explanation, undefined, `Leaked explanation in question ${q.id}`);
      assert.equal(q.knowledgeGap, undefined, `Leaked knowledgeGap in question ${q.id}`);
    }

    // Verify session persisted in SQLite database
    const dbSession = quizQueries.findById(createdSessionId);
    assert.ok(dbSession);
    assert.equal(dbSession.id, createdSessionId);
    assert.equal(dbSession.difficulty, 'expert');

    const privateKeys = JSON.parse(dbSession.answer_keys);
    assert.ok(Object.keys(privateKeys).length >= 5);
  });

  await t.test('gradeQuizSession accurately scores correct and incorrect answers and diagnoses gaps', async () => {
    assert.ok(createdSessionId, 'Session must exist from previous test');

    const dbSession = quizQueries.findById(createdSessionId);
    const privateKeys = JSON.parse(dbSession.answer_keys);
    const questionIds = Object.keys(privateKeys);

    // Construct responses: answer the first 2 correctly, answer the 3rd wrong
    const firstQId = questionIds[0];
    const secondQId = questionIds[1];
    const thirdQId = questionIds[2];

    const answers = {
      [firstQId]: privateKeys[firstQId].correctAnswerIndex,
      [secondQId]: privateKeys[secondQId].correctAnswerIndex,
      [thirdQId]: 99 // Deliberate incorrect choice
    };

    const graded = await gradeQuizSession(createdSessionId, answers);

    assert.ok(graded.sessionId);
    assert.ok(graded.overallScore >= 0 && graded.overallScore <= 100);

    // Verify individual question evaluations
    const evalFirst = graded.evaluations.find(e => e.id === firstQId);
    assert.ok(evalFirst);
    assert.equal(evalFirst.isCorrect, true);
    assert.equal(evalFirst.earnedPoints, 100);
    assert.ok(evalFirst.explanation, 'Must provide architectural explanation');

    const evalThird = graded.evaluations.find(e => e.id === thirdQId);
    assert.ok(evalThird);
    assert.equal(evalThird.isCorrect, false);
    assert.equal(evalThird.earnedPoints, 0);

    // Diagnosed gaps must capture the missed questions
    assert.ok(Array.isArray(graded.knowledgeGapsIdentified));
    assert.ok(graded.knowledgeGapsIdentified.length > 0);
  });

  await t.test('gradeQuizSession throws error for non-existent session ID', async () => {
    await assert.rejects(
      async () => {
        await gradeQuizSession('qz_invalid_nonexistent_session', {});
      },
      /Quiz session not found/
    );
  });

  await t.test('Backend role banks support both Frontend and Backend developer tracks', async () => {
    const backendSession = await generateQuizSession({
      targetRole: 'Backend Developer',
      difficulty: 'expert',
      questionCount: 4
    });

    assert.equal(backendSession.targetRole, 'Backend Developer');
    assert.equal(backendSession.questions.length, 4);

    // Verify backend-specific engineering topics
    const categories = backendSession.questions.map(q => q.category);
    assert.ok(
      categories.some(c => c.toLowerCase().includes('database') || c.toLowerCase().includes('api') || c.toLowerCase().includes('sql') || c.toLowerCase().includes('concurrency'))
    );
  });
});
