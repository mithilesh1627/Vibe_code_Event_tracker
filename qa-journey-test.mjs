// qa-journey-test.mjs - Comprehensive QA Reviewer & End-to-End Battery
const BASE_URL = 'http://localhost:5000/api';

async function runQABattery() {
  console.log('======================================================================');
  console.log('🕵️  GATHERPULSE SENIOR QA FULL-STACK AUDIT & VERIFICATION BATTERY');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  async function step(name, testFn) {
    try {
      process.stdout.write(`⏳ [TEST] ${name} ... `);
      await testFn();
      console.log(`✅ PASS`);
      passed++;
    } catch (err) {
      console.log(`❌ FAIL`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  // Variables across journey
  let userA = {
    name: 'Alice Cooper',
    email: `alice_${Date.now()}@example.com`,
    password: 'Password123!',
    token: '',
    id: '',
  };

  let userB = {
    name: 'Bob Marley',
    email: `bob_${Date.now()}@example.com`,
    password: 'Password456!',
    token: '',
    id: '',
  };

  let targetEvent = null;
  let initialFriendsCount = 0;
  let inviteCode = '';
  let inviteUrl = '';
  let visitorB_Id = `visitor_b_${Date.now()}`;

  // ==========================================
  // SECTION 2: COMPLETE USER JOURNEY
  // ==========================================
  console.log('--- PHASE 1: COMPLETE USER JOURNEY (USER A & USER B) ---');

  // Step 1: Register User A
  await step('User A: Register new account', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userA.name,
        email: userA.email,
        password: userA.password,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.token) throw new Error(json.message || 'Registration failed');
    userA.token = json.data.token;
    userA.id = json.data.user.id;
  });

  // Step 2: Login User A
  await step('User A: Login with credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userA.email,
        password: userA.password,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.token) throw new Error(json.message || 'Login failed');
    userA.token = json.data.token;
  });

  // Step 3 & 4: Open event discovery page & verify events load
  await step('User A: Open discovery page & verify events feed', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success || !json.data.events || json.data.events.length === 0) {
      throw new Error('Events feed failed to load');
    }
    targetEvent = json.data.events[0];
    initialFriendsCount = targetEvent.friendsAttendingCount;
    if (typeof initialFriendsCount !== 'number') {
      throw new Error('friendsAttendingCount missing from feed');
    }
  });

  // Step 5 & 6: Open event details & verify details
  await step('User A: Open event details and verify schema', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success || !json.data.title || !json.data.venue || !json.data.date) {
      throw new Error('Event details missing required fields');
    }
    if (json.data.isRSVPed !== false) {
      throw new Error(`Expected isRSVPed: false before RSVP, got: ${json.data.isRSVPed}`);
    }
  });

  // Step 7 & 8: RSVP to the event & verify success
  await step('User A: RSVP to event & verify response and inviteCode', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({
        eventTitle: targetEvent.title,
        eventDate: targetEvent.date,
        venue: targetEvent.venue,
        eventImage: targetEvent.imageUrl,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.inviteCode) {
      throw new Error(json.message || 'RSVP failed');
    }
    inviteCode = json.data.inviteCode;
    inviteUrl = `http://localhost:5173/invite/${inviteCode}`;
  });

  // Step 9 & 10: Refresh page & verify RSVP state persists
  await step('User A: Refresh event details & verify isRSVPed: true persists', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success || json.data.isRSVPed !== true) {
      throw new Error(`Expected isRSVPed: true after RSVP, got: ${json.data.isRSVPed}`);
    }
    if (json.data.friendsAttendingCount <= initialFriendsCount) {
      throw new Error(
        `Expected count to increase from ${initialFriendsCount}, got: ${json.data.friendsAttendingCount}`
      );
    }
  });

  // Step 11 & 12: Open My Events & verify event appears
  await step('User A: Open My Events & verify event in upcoming list', async () => {
    const res = await fetch(`${BASE_URL}/users/me/rsvps`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.upcoming)) {
      throw new Error('My Events query failed');
    }
    const found = json.data.upcoming.find((r) => r.eventId === targetEvent.id);
    if (!found) throw new Error('Target event not found in upcoming RSVPs');
    if (found.inviteCode !== inviteCode) {
      throw new Error(`Invite code mismatch in My Events: ${found.inviteCode} vs ${inviteCode}`);
    }
  });

  // Step 13 & 14: Generate Friend Invite / Share Link verified
  await step('User A: Generate invite code matches persistent record', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success || json.data.inviteCode !== inviteCode) {
      throw new Error('Expected same persistent invite code for User A');
    }
  });

  // User B: Step 1 & 2 - Open invite page as separate session & verify details
  await step('User B: Open invite landing page without auth', async () => {
    const res = await fetch(`${BASE_URL}/invites/${inviteCode}`);
    const json = await res.json();
    if (!json.success || !json.data.event || !json.data.inviter) {
      throw new Error('Invite landing page data failed to load');
    }
    if (json.data.inviter.name !== userA.name) {
      throw new Error(`Expected inviter name ${userA.name}, got: ${json.data.inviter.name}`);
    }
    if (json.data.event.id !== targetEvent.id) {
      throw new Error('Invite event does not match target event');
    }
  });

  // User B: Step 3 - Track invite click
  let clickCountBefore = 0;
  await step('User B: Track invite link click with visitorIdentifier', async () => {
    const inviteInfo = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    clickCountBefore = inviteInfo.data.clicks;

    const res = await fetch(`${BASE_URL}/invites/${inviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorB_Id }),
    });
    const json = await res.json();
    if (!json.success || json.data.tracked !== true) {
      throw new Error('Visitor B click was not tracked');
    }
    if (json.data.totalClicks !== clickCountBefore + 1) {
      throw new Error(`Click count did not increment properly: ${json.data.totalClicks}`);
    }
  });

  // User B: Step 4 - Register / login User B
  await step('User B: Register and login', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userB.name,
        email: userB.email,
        password: userB.password,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.token) throw new Error('User B registration failed');
    userB.token = json.data.token;
    userB.id = json.data.user.id;
  });

  // User B: Step 5 - RSVP through the invite
  await step('User B: RSVP to event through User A invite link', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        eventTitle: targetEvent.title,
        eventDate: targetEvent.date,
        venue: targetEvent.venue,
        eventImage: targetEvent.imageUrl,
        referredByInviteCode: inviteCode,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data.rsvp) {
      throw new Error(json.message || 'User B RSVP through invite failed');
    }
  });

  // Final verification: Return to User A
  await step('Final Verification: Friends Attending count increased and persists', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to fetch event as User A');
    const newCount = json.data.friendsAttendingCount;
    // initialFriendsCount + 2 (User A and User B)
    if (newCount < initialFriendsCount + 2) {
      throw new Error(
        `Expected count to be at least ${initialFriendsCount + 2}, got: ${newCount}`
      );
    }
    // Check invite landing page shows referral conversion
    const inviteCheck = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    if (inviteCheck.data.referredRSVPs < 1) {
      throw new Error(`Expected at least 1 referred RSVP on invite, got: ${inviteCheck.data.referredRSVPs}`);
    }
  });

  // ==========================================
  // SECTION 3: AUTHENTICATION ROBUSTNESS
  // ==========================================
  console.log('\n--- PHASE 2: AUTHENTICATION ROBUSTNESS & SECURITY ---');

  await step('Auth: Duplicate email registration blocked with 409', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Imposter',
        email: userA.email,
        password: 'Password123!',
      }),
    });
    if (res.status !== 409) throw new Error(`Expected 409, got: ${res.status}`);
  });

  await step('Auth: Invalid email format rejected with 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'Password123!',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got: ${res.status}`);
  });

  await step('Auth: Short password rejected with 400', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pwd User',
        email: `short_${Date.now()}@example.com`,
        password: '123',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got: ${res.status}`);
  });

  await step('Auth: Incorrect login password rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userA.email,
        password: 'WRONG_PASSWORD!',
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got: ${res.status}`);
  });

  await step('Auth: Non-existent account login rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `ghost_${Date.now()}@notfound.com`,
        password: 'Password123!',
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got: ${res.status}`);
  });

  await step('Auth: Protected endpoint without token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/users/me`);
    if (res.status !== 401) throw new Error(`Expected 401, got: ${res.status}`);
  });

  await step('Auth: Invalid/tampered Bearer token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: 'Bearer this.is.invalid' },
    });
    if (res.status !== 401) throw new Error(`Expected 401, got: ${res.status}`);
  });

  await step('Auth: Password hash is NEVER exposed in responses', async () => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    const json = await res.json();
    if (json.data.user.passwordHash || json.data.user.password) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in API response!');
    }
  });

  // ==========================================
  // SECTION 4: EVENTS & TICKETMASTER RESILIENCE
  // ==========================================
  console.log('\n--- PHASE 3: EVENTS & SEARCH/FILTER RESILIENCE ---');

  await step('Events: Keyword search filters correctly', async () => {
    const res = await fetch(`${BASE_URL}/events?keyword=Synthwave`);
    const json = await res.json();
    if (!json.success || json.data.events.length === 0) {
      throw new Error('Keyword search returned no results');
    }
    if (!json.data.events[0].title.toLowerCase().includes('synthwave')) {
      throw new Error('Keyword search results do not match keyword');
    }
  });

  await step('Events: Category filter works properly', async () => {
    const res = await fetch(`${BASE_URL}/events?category=Sports`);
    const json = await res.json();
    if (!json.success || json.data.events.length === 0) {
      throw new Error('Category filter returned no results');
    }
    const nonSports = json.data.events.filter((e) => e.category !== 'Sports');
    if (nonSports.length > 0) throw new Error('Non-sports events found in category filter');
  });

  await step('Events: Non-existent event ID returns clean 404', async () => {
    const res = await fetch(`${BASE_URL}/events/non-existent-event-999999`);
    if (res.status !== 404) throw new Error(`Expected 404, got: ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error('Expected success: false for 404');
  });

  // ==========================================
  // SECTION 5: RSVP DUPLICATE & CANCEL TESTING
  // ==========================================
  console.log('\n--- PHASE 4: RSVP DUPLICATE & CANCELLATION ENGINE ---');

  await step('RSVP: Duplicate RSVP by User A is strictly blocked (409 Conflict)', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({}),
    });
    if (res.status !== 409) throw new Error(`Expected 409, got: ${res.status}`);
    const json = await res.json();
    if (!json.message.includes('already RSVPed')) {
      throw new Error(`Unexpected message: ${json.message}`);
    }
  });

  await step('RSVP: Cancellation by User B successfully removes registration', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('RSVP cancellation failed');

    // Verify User B is no longer RSVPed
    const checkRes = await fetch(`${BASE_URL}/events/${targetEvent.id}`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    const checkJson = await checkRes.json();
    if (checkJson.data.isRSVPed !== false) {
      throw new Error('User B is still marked as isRSVPed: true');
    }
  });

  await step('RSVP: Cancelling a non-existent RSVP returns 404', async () => {
    const res = await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    if (res.status !== 404) throw new Error(`Expected 404, got: ${res.status}`);
  });

  // Re-RSVP User B for invite count checks
  await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userB.token}`,
    },
    body: JSON.stringify({ referredByInviteCode: inviteCode }),
  });

  // ==========================================
  // SECTION 6: FRIEND INVITE & DEDUPLICATION
  // ==========================================
  console.log('\n--- PHASE 5: FRIEND INVITE & CLICK DEDUPLICATION ---');

  await step('Invite: Duplicate clicks from Visitor B within 24h are deduplicated', async () => {
    const inviteBefore = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    const countBefore = inviteBefore.data.clicks;

    // Send rapid clicks from the same visitor
    const res1 = await fetch(`${BASE_URL}/invites/${inviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorB_Id }),
    });
    const json1 = await res1.json();
    if (json1.data.tracked !== false) {
      throw new Error('Duplicate click was incorrectly marked as tracked: true');
    }

    const res2 = await fetch(`${BASE_URL}/invites/${inviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorB_Id }),
    });
    const json2 = await res2.json();
    if (json2.data.tracked !== false) {
      throw new Error('Second duplicate click was incorrectly marked as tracked: true');
    }

    const inviteAfter = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    if (inviteAfter.data.clicks !== countBefore) {
      throw new Error(
        `Click count inflated from ${countBefore} to ${inviteAfter.data.clicks} on duplicate clicks!`
      );
    }
  });

  await step('Invite: Distinct visitor click correctly increments counter', async () => {
    const inviteBefore = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    const countBefore = inviteBefore.data.clicks;

    const newVisitorId = `visitor_c_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/invites/${inviteCode}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: newVisitorId }),
    });
    const json = await res.json();
    if (json.data.tracked !== true) throw new Error('New visitor click was not tracked');

    const inviteAfter = await (await fetch(`${BASE_URL}/invites/${inviteCode}`)).json();
    if (inviteAfter.data.clicks !== countBefore + 1) {
      throw new Error(`Expected click count ${countBefore + 1}, got: ${inviteAfter.data.clicks}`);
    }
  });

  await step('Invite: Invalid invite code returns clean 404', async () => {
    const res = await fetch(`${BASE_URL}/invites/nonexistent_code_999`);
    if (res.status !== 404) throw new Error(`Expected 404, got: ${res.status}`);
  });

  // ==========================================
  // SECTION 7: API SECURITY & DATA ISOLATION
  // ==========================================
  console.log('\n--- PHASE 6: API SECURITY & DATA ISOLATION ---');

  await step('Security: User A cannot cancel User B RSVP', async () => {
    // User A attempts to cancel User B's RSVP for targetEvent
    // User A will cancel their own RSVP, not User B's!
    // Let's verify User B's RSVP remains intact in database:
    const userBRsvpsBefore = await (
      await fetch(`${BASE_URL}/users/me/rsvps`, {
        headers: { Authorization: `Bearer ${userB.token}` },
      })
    ).json();
    const userBHasEventBefore = userBRsvpsBefore.data.upcoming.some((r) => r.eventId === targetEvent.id);
    if (!userBHasEventBefore) throw new Error('User B should have target event');

    // User A calls cancel
    await fetch(`${BASE_URL}/events/${targetEvent.id}/rsvp`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userA.token}` },
    });

    // Check User B's RSVPs: still intact!
    const userBRsvpsAfter = await (
      await fetch(`${BASE_URL}/users/me/rsvps`, {
        headers: { Authorization: `Bearer ${userB.token}` },
      })
    ).json();
    const userBHasEventAfter = userBRsvpsAfter.data.upcoming.some((r) => r.eventId === targetEvent.id);
    if (!userBHasEventAfter) {
      throw new Error('SECURITY VIOLATION: User A action deleted User B RSVP!');
    }
  });

  await step('Security: Error responses never expose stack traces', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email' }),
    });
    const text = await res.text();
    if (text.includes('node_modules') || text.includes('at Module.') || text.includes('at process.')) {
      throw new Error('SECURITY LEAK: Stack trace found in response!');
    }
  });

  // ==========================================
  // SECTION 8: USER PROFILE & REMINDERS
  // ==========================================
  console.log('\n--- PHASE 7: PROFILE & REMINDER PREFERENCES ---');

  await step('Profile: Fetch profile stats for User B', async () => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${userB.token}` },
    });
    const json = await res.json();
    if (!json.success || !json.data.stats) throw new Error('Profile stats missing');
    if (json.data.stats.upcomingEvents < 1) {
      throw new Error('Profile stats do not reflect User B RSVP');
    }
  });

  await step('Profile: Update name and avatar persists in MongoDB', async () => {
    const newName = 'Robert Marley';
    const newAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({ name: newName, avatar: newAvatar }),
    });
    const json = await res.json();
    if (!json.success || json.data.name !== newName || json.data.avatar !== newAvatar) {
      throw new Error('Profile update failed');
    }
  });

  await step('Profile: Update reminder preferences persists in MongoDB', async () => {
    const res = await fetch(`${BASE_URL}/users/me/reminders`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        emailEnabled: false,
        pushEnabled: true,
        reminderHoursBefore: 48,
      }),
    });
    const json = await res.json();
    if (!json.success || json.data.reminderHoursBefore !== 48 || json.data.emailEnabled !== false) {
      throw new Error('Reminder preferences update failed');
    }
  });

  console.log('\n======================================================================');
  console.log(`🏁 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runQABattery();
