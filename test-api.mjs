// test-api.mjs - End-to-end verification script
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 GATHERPULSE FULL END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${desc}:`, err.message);
      failed++;
    }
  }

  let token = '';
  let sampleEventId = '';
  let generatedInviteCode = '';

  // 1. Health check
  await assert('GET /api/health returns status ok', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Status was ${data.status}`);
  });

  // 2. Events feed
  await assert('GET /api/events returns normalized events list with mock/API data', async () => {
    const res = await fetch(`${BASE_URL}/events`);
    const json = await res.json();
    if (!json.success || !json.data.events || json.data.events.length === 0) {
      throw new Error('No events returned');
    }
    sampleEventId = json.data.events[0].id;
    if (!sampleEventId) throw new Error('First event has no id');
    if (typeof json.data.events[0].friendsAttendingCount !== 'number') {
      throw new Error('friendsAttendingCount is not a number');
    }
  });

  // 3. Calendar events
  await assert('GET /api/events/calendar returns dates with events', async () => {
    const res = await fetch(`${BASE_URL}/events/calendar`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.dates)) {
      throw new Error('Calendar dates missing');
    }
  });

  // 4. Registration
  const testEmail = `test_user_${Date.now()}@example.com`;
  await assert('POST /api/auth/register creates user and returns JWT token', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Developer',
        email: testEmail,
        password: 'password123',
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.token) {
      throw new Error(json.message || 'Token missing');
    }
    token = json.data.token;
  });

  // 5. Auth Me
  await assert('GET /api/auth/me returns current user profile with token', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success || json.data.email !== testEmail) {
      throw new Error('User profile mismatch');
    }
  });

  // 6. Create RSVP
  await assert('POST /api/events/:eventId/rsvp registers RSVP and creates unique invite code', async () => {
    const res = await fetch(`${BASE_URL}/events/${sampleEventId}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!json.success || !json.data.inviteCode) {
      throw new Error(json.message || 'Invite code missing');
    }
    generatedInviteCode = json.data.inviteCode;
  });

  // 7. Duplicate RSVP Prevention
  await assert('POST /api/events/:eventId/rsvp blocks duplicate RSVP with 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/events/${sampleEventId}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409, got status ${res.status}`);
    }
  });

  // 8. Fetch My RSVPs Dashboard
  await assert('GET /api/users/me/rsvps returns categorized upcoming and past events', async () => {
    const res = await fetch(`${BASE_URL}/users/me/rsvps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.upcoming) || json.data.total === 0) {
      throw new Error('Upcoming RSVPs not returned');
    }
  });

  // 9. Public Invite Landing Page resolution
  await assert('GET /api/invites/:inviteCode resolves invite details and inviter info', async () => {
    const res = await fetch(`${BASE_URL}/invites/${generatedInviteCode}`);
    const json = await res.json();
    if (!json.success || !json.data.event || !json.data.inviter) {
      throw new Error('Invite details or inviter not found');
    }
    if (json.data.inviter.name !== 'Alex Developer') {
      throw new Error(`Inviter name mismatch: got ${json.data.inviter.name}`);
    }
  });

  // 10. Invite Click Tracking & Deduplication Protection
  await assert('POST /api/invites/:inviteCode/click records first click', async () => {
    const testVisitor = 'test-visitor-' + Date.now();
    const res1 = await fetch(`${BASE_URL}/invites/${generatedInviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: testVisitor }),
    });
    const json1 = await res1.json();
    if (!json1.success || !json1.data.tracked) {
      throw new Error('First click was not tracked');
    }

    // Duplicate click from SAME visitor
    const res2 = await fetch(`${BASE_URL}/invites/${generatedInviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: testVisitor }),
    });
    const json2 = await res2.json();
    if (!json2.success || json2.data.tracked !== false) {
      throw new Error('Duplicate click protection failed: second click was counted!');
    }
  });

  // 11. User Profile & Reminders Preferences
  await assert('PATCH /api/users/me/reminders updates user notification settings in MongoDB', async () => {
    const res = await fetch(`${BASE_URL}/users/me/reminders`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        emailEnabled: true,
        pushEnabled: false,
        reminderHoursBefore: 12,
      }),
    });
    const json = await res.json();
    if (!json.success || json.data.reminderHoursBefore !== 12 || json.data.pushEnabled !== false) {
      throw new Error('Reminder settings did not persist correctly');
    }
  });

  // 12. RSVP Cancellation
  await assert('DELETE /api/events/:eventId/rsvp cancels RSVP correctly', async () => {
    const res = await fetch(`${BASE_URL}/events/${sampleEventId}/rsvp`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'RSVP cancellation failed');

    // Verify it is removed from active RSVPs
    const checkRes = await fetch(`${BASE_URL}/users/me/rsvps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkJson = await checkRes.json();
    const found = checkJson.data.upcoming.find((r) => r.eventId === sampleEventId);
    if (found) throw new Error('Cancelled RSVP still appears in upcoming list');
  });

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests();
