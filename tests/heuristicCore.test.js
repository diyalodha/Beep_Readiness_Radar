import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSkillToken, detectSkills, runDynamicHeuristicAnalysis } from '../src/utils/heuristicCore.js';

test('Boundary-aware skill matching prevents substring collisions', async (t) => {
  await t.test('Java vs JavaScript collision check', () => {
    assert.equal(matchSkillToken('java', 'Expert in JavaScript and React'), false, 'java must not match JavaScript');
    assert.equal(matchSkillToken('java', 'Experience building in Java and Spring Boot'), true, 'java must match Java');
  });

  await t.test('ML vs HTML collision check', () => {
    assert.equal(matchSkillToken('ml', 'Proficient in HTML, CSS, and web fundamentals'), false, 'ml must not match HTML');
    assert.equal(matchSkillToken('ml', 'Trained ML classifiers in Python'), true, 'ml must match ML');
  });

  await t.test('C vs CSS collision check', () => {
    assert.equal(matchSkillToken('c', 'Styling with Tailwind CSS'), false, 'c must not match CSS');
    assert.equal(matchSkillToken('c', 'Implemented algorithms in C and assembly'), true, 'c must match C');
  });

  await t.test('React vs Reactive collision check', () => {
    assert.equal(matchSkillToken('react', 'Built reactive streaming event pipeline'), false, 'react must not match reactive');
    assert.equal(matchSkillToken('react', 'Frontend built using React and Vite'), true, 'react must match React');
  });

  await t.test('C++ symbol matching', () => {
    assert.equal(matchSkillToken('c++', 'Systems programming with C++ and CMake'), true, 'c++ must match C++');
  });
});

test('detectSkills accurately identifies technologies from resume text', () => {
  const resume = `
    Frontend Software Engineer Intern.
    Proficient in JavaScript, React, HTML, CSS, and Git.
    Worked with Node.js and SQL backends.
  `;
  const detected = detectSkills(resume);

  assert.equal(detected.has('javascript'), true, 'Should detect JavaScript');
  assert.equal(detected.has('react'), true, 'Should detect React');
  assert.equal(detected.has('java'), false, 'Should NOT detect Java from JavaScript');
  assert.equal(detected.has('ml'), false, 'Should NOT detect ML from HTML');
});

test('runDynamicHeuristicAnalysis produces honest scoring and explicit labels', () => {
  const resume = 'Experienced React, JavaScript developer with GitHub link: https://github.com/test';
  const jd = 'Looking for a React, JavaScript, TypeScript, and Docker intern.';
  const analysis = runDynamicHeuristicAnalysis(resume, jd, 'Frontend Intern', 'Acme Corp');

  assert.equal(typeof analysis.matchScore, 'number');
  assert.ok(analysis.matchScore >= 15 && analysis.matchScore <= 98);
  assert.ok(Array.isArray(analysis.skillsBreakdown.matched));
  assert.ok(analysis.skillsBreakdown.matched.includes('REACT'));
  assert.ok(analysis.skillsBreakdown.matched.includes('JAVASCRIPT'));
  assert.equal(analysis.skillsBreakdown.matched.includes('JAVA'), false);
  assert.ok(analysis.silentRejectionFlags.some(f => f.title.includes('Links Detected')));
});
