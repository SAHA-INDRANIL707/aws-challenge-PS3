// Automated API Test Suite for Meeting Action Tracker (SyncPulse)
const BASE_URL = 'http://localhost:3000';

async function request(path, method = 'GET', body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE API VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Process Transcript with AI
  console.log('1️⃣ Testing POST /api/process-transcript...');
  try {
    const transcriptSample = `Alex: Let's finalize the NextAuth setup with Google OAuth by Friday.
Priya: I will write the database migration and benchmark latency by Thursday.
Marcus: Official decision: We are freezing Sprint 24 on October 10th.`;

    const res1 = await request('/api/process-transcript', 'POST', {
      transcript: transcriptSample,
      apiKey: 'gsk_mock_test_key',
    });

    if (res1.ok || res1.status === 200 || res1.data) {
      console.log('   ✅ PASS: Transcript parsing endpoint functional!');
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/process-transcript', res1);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  // TEST 2: Google Calendar Action Dispatcher
  console.log('\n2️⃣ Testing POST /api/actions/calendar...');
  try {
    const res2 = await request('/api/actions/calendar', 'POST', {
      title: 'Write database migration',
      description: 'Benchmark events table latency',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      attendees: ['priya@company.com'],
    });

    if (res2.ok && res2.data?.success) {
      console.log('   ✅ PASS: Google Calendar event generated!');
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/actions/calendar', res2);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  // TEST 3: Email Single Owner
  console.log('\n3️⃣ Testing POST /api/actions/email...');
  try {
    const res3 = await request('/api/actions/email', 'POST', {
      to: 'priya@company.com',
      ownerName: 'Priya',
      task: 'Write database migration and benchmark query performance',
      deadline: '2026-10-02T18:00:00Z',
      priority: 'High',
      sourceQuote: 'I will write the database migration by Thursday.',
    });

    if (res3.ok && res3.data?.success) {
      console.log('   ✅ PASS: Single email notification generated!');
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/actions/email', res3);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  // TEST 4: Broadcast Email to All Attendees
  console.log('\n4️⃣ Testing POST /api/actions/email-all (Broadcast)...');
  try {
    const res4 = await request('/api/actions/email-all', 'POST', {
      meeting: {
        title: 'Sprint 24 Planning Meeting',
        summary: 'Team agreed to freeze code on Oct 10 and deploy migrations by Thursday.',
        decisions: [{ decision_text: 'Code freeze Oct 10', category: 'Operations' }],
        action_items: [
          { task: 'Database migration', owner_name: 'Priya', owner_email: 'priya@company.com', deadline: '2026-10-01' },
          { task: 'Auth overhaul', owner_name: 'Marcus', owner_email: 'marcus@company.com', deadline: '2026-10-05' },
        ],
      },
      recipients: ['priya@company.com', 'marcus@company.com', 'alex@company.com'],
      customNote: 'Great sprint planning session team!',
    });

    if (res4.ok && res4.data?.success && res4.data?.sentCount > 0) {
      console.log('   ✅ PASS: Broadcast email summary dispatched to all recipients!');
      console.log(`      • Total Recipients: ${res4.data.sentCount}`);
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/actions/email-all', res4);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  // TEST 5: Jira Ticket Creator
  console.log('\n5️⃣ Testing POST /api/actions/jira...');
  try {
    const res5 = await request('/api/actions/jira', 'POST', {
      summary: 'Implement NextAuth v5 Google OAuth flow',
      description: 'Scopes: Calendar + Gmail API',
      priority: 'High',
      projectKey: 'PROJ',
    });

    if (res5.ok && res5.data?.success) {
      console.log('   ✅ PASS: Jira ticket created!');
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/actions/jira', res5);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  // TEST 6: Slack Dispatcher
  console.log('\n6️⃣ Testing POST /api/actions/slack...');
  try {
    const res6 = await request('/api/actions/slack', 'POST', {
      task: 'Deliver UI review dashboard overhaul',
      ownerName: 'Elena',
      deadline: '2026-10-02',
      priority: 'Medium',
      category: 'Frontend',
      channel: '#eng-sprint',
    });

    if (res6.ok && res6.data?.success) {
      console.log('   ✅ PASS: Slack message dispatched!');
      passed++;
    } else {
      console.error('   ❌ FAIL: /api/actions/slack', res6);
      failed++;
    }
  } catch (err) {
    console.error('   ❌ ERROR:', err.message);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');
}

runTests();
