import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userQueries, applicationQueries } from '../server/db.js';

const TEST_SECRET = 'test-suite-secure-jwt-secret-key-32chars!';

test('Authentication and Security Unit Tests', async (t) => {
  const testEmail = `test_${Date.now()}@college.edu`;
  const rawPassword = 'ValidPassword123';

  await t.test('Password hashing with bcrypt produces secure salts', async () => {
    const hash = await bcrypt.hash(rawPassword, 10);
    assert.notEqual(hash, rawPassword);
    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true);
    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isInvalid, false);
  });

  await t.test('User registration in SQLite database', async () => {
    const hash = await bcrypt.hash(rawPassword, 10);
    const user = userQueries.createUser({
      email: testEmail,
      passwordHash: hash,
      name: 'Test Student',
      college: 'Test Institute of Technology',
      graduationYear: '2026'
    });

    assert.ok(user.id.startsWith('usr_'));
    assert.equal(user.email, testEmail);
    assert.equal(user.name, 'Test Student');

    // Query back from DB
    const fetched = userQueries.findByEmail(testEmail);
    assert.ok(fetched);
    assert.equal(fetched.id, user.id);
  });

  await t.test('JWT token issuance and verification', () => {
    const user = userQueries.findByEmail(testEmail);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      TEST_SECRET,
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, TEST_SECRET);
    assert.equal(decoded.id, user.id);
    assert.equal(decoded.email, testEmail);
  });

  await t.test('Application creation and strict user isolation', () => {
    const userA = userQueries.findByEmail(testEmail);
    const appA = applicationQueries.createApplication({
      refId: `BEEP-TEST-${Date.now()}`,
      userId: userA.id,
      userEmail: userA.email,
      name: userA.name,
      phone: '+919876543210',
      githubUrl: 'https://github.com/test',
      role: 'Backend Intern',
      company: 'CRED',
      matchScore: 82
    });

    assert.ok(appA.id.startsWith('app_'));
    assert.equal(appA.user_id, userA.id);

    // List userA applications
    const userAApps = applicationQueries.listByUserId(userA.id);
    assert.ok(userAApps.some(a => a.id === appA.id));

    // Verify User B cannot see user A applications
    const userBApps = applicationQueries.listByUserId('usr_random_other_user');
    assert.equal(userBApps.length, 0, 'Another user ID must receive 0 applications');
  });
});
