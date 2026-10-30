#!/usr/bin/env node
/**
 * End-to-end smoke test for admin list filters + pagination.
 *
 * Boots a mock API, the Next dev server pointed at it, and headless Chrome
 * (driven over the DevTools protocol), then exercises the filter controls and
 * asserts the outgoing query params and rendered rows.
 *
 * The build is written to .next-smoke (NEXT_DIST_DIR) so the real .next
 * production build is left untouched.
 *
 * Usage: npm run test:smoke
 * Requires Google Chrome installed at the default macOS path.
 */

import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_PORT = 4010;
const APP_PORT = 4005;
const CDP_PORT = 9222;
const DIST_DIR = path.join(ROOT, '.next-smoke');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Mock API
// ---------------------------------------------------------------------------
const ALL_PERMISSIONS = [
  'admins:create', 'roles:manage', 'agents:read', 'agents:review',
  'clients:review', 'ippis:upload', 'agents:sessions:revoke',
  'clients:sessions:revoke', 'audit:read', 'loans:upload',
  'repayments:upload', 'documents:read', 'permissions:manage',
  'wallets:read', 'wallets:manage', 'loan-products:manage',
  'loan-settings:manage', 'loan-requests:review', 'client-loans:read',
  'clients:read', 'departments:manage', 'clients:onboard',
  'agents:onboarding-access:manage', 'clients:analytics:read',
  'agents:analytics:read', 'agents:recruitment:read',
  'agents:recruitment:analytics:read', 'agents:recruitment:manage',
  'reconciliation:read',
];

const mockRequests = [];

function paginate(items, query) {
  const page = Math.max(1, parseInt(query.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.get('limit') || '25', 10) || 25));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    rows: items.slice((page - 1) * limit, page * limit),
  };
}

function textMatch(value, term) {
  if (!term) return true;
  return String(value || '').toLowerCase().includes(term.toLowerCase());
}

function agentRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `agent-${i + 1}`,
    fullName: `Agent ${i + 1}`,
    firstName: 'Agent',
    lastName: String(i + 1),
    email: `agent${i + 1}@example.com`,
    phone: `0801000${String(i).padStart(4, '0')}`,
    status: i % 3 === 0 ? 'APPROVED' : i % 3 === 1 ? 'PENDING_REVIEW' : 'REJECTED',
    createdAt: '2026-01-15T10:00:00.000Z',
    reviewedAt: '2026-01-20T10:00:00.000Z',
    canOnboardClients: true,
  }));
}
const AGENTS = agentRows();

function adminRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `admin-${i + 1}`,
    email: `admin${i + 1}@example.com`,
    fullName: `Admin ${i + 1}`,
    role: { id: 'role-1', name: 'ADMIN' },
    department: { id: 'dept-1', name: 'Finance' },
    isActive: i % 2 === 0,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-20T10:00:00.000Z',
  }));
}
const ADMINS = adminRows();

function ippisRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `ippis-${i + 1}`,
    employeeName: `Employee ${i + 1}`,
    staffId: `IPPIS${1000 + i}`,
    agency: 'NSCDC',
    department: 'Finance',
    grade: 'GL-08',
    step: '2',
    salary: 250000,
    employeeStatus: i % 2 === 0 ? 'ACTIVE' : 'INACTIVE',
    jobTitle: 'Officer',
  }));
}
const IPPIS = ippisRows();

function loanRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `loan-${i + 1}`,
    customerName: `Customer ${i + 1}`,
    accountNumber: `00123${i}`,
    ippisNumber: `IPPIS${1000 + i}`,
    agency: 'NSCDC',
    product: 'PERSONAL LOAN',
    loanAmount: 500000,
    principalBalance: 200000,
    disbursementDate: '2026-01-10T00:00:00.000Z',
  }));
}
const LOANS = loanRows();

function clientRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `client-${i + 1}`,
    firstName: 'Customer',
    lastName: String(i + 1),
    phone: `0802000${String(i).padStart(4, '0')}`,
    status: i % 2 === 0 ? 'VERIFIED' : 'MANUAL_REVIEW',
    createdAt: '2026-01-15T10:00:00.000Z',
    onboarding: { step: i % 2 === 0 ? 'COMPLETED' : 'IDENTITY_SUBMITTED', agency: 'NSCDC' },
  }));
}
const CLIENTS = clientRows();

function loanRequestRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `request-${i + 1}`,
    amount: 500000,
    status: i % 2 === 0 ? 'CONFIRMED' : 'APPROVED',
    type: i % 2 === 0 ? 'ORIGINATION' : 'TOPUP',
    createdAt: '2026-01-15T10:00:00.000Z',
    client: { id: `client-${i + 1}`, firstName: 'Customer', lastName: String(i + 1) },
  }));
}
const LOAN_REQUESTS = loanRequestRows();

function auditRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `audit-${i + 1}`,
    action: i % 2 === 0 ? 'admin.invite.created' : 'client.created',
    actorType: i % 2 === 0 ? 'ADMIN' : 'CLIENT',
    targetType: i % 2 === 0 ? 'AdminInvite' : 'Client',
    targetId: `target-${i + 1}`,
    createdAt: '2026-01-15T10:00:00.000Z',
  }));
}
const AUDIT_LOGS = auditRows();

function inviteRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `invite-${i + 1}`,
    email: `invite${i + 1}@example.com`,
    status: i % 2 === 0 ? 'PENDING' : 'ACCEPTED',
    createdAt: '2026-01-15T10:00:00.000Z',
    expiresAt: '2026-02-15T10:00:00.000Z',
    role: { id: 'role-1', name: 'ADMIN' },
  }));
}
const INVITES = inviteRows();

function reconciliationRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `recon-${i + 1}`,
    period: '2026-01',
    status: i % 2 === 0 ? 'MATCHED' : 'UNDER_PAID',
    expectedAmount: 100000,
    actualAmount: i % 2 === 0 ? 100000 : 90000,
    variance: i % 2 === 0 ? 0 : -10000,
    loan: { customerName: `Customer ${i + 1}`, agency: 'NSCDC' },
  }));
}
const RECONCILIATION = reconciliationRows();

function recruitmentRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `app-${i + 1}`,
    email: `applicant${i + 1}@example.com`,
    fullName: `Applicant ${i + 1}`,
    status: i % 2 === 0 ? 'SUBMITTED' : 'EMAIL_VERIFIED',
    createdAt: '2026-01-15T10:00:00.000Z',
  }));
}
const RECRUITMENT = recruitmentRows();

function batchRows() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: `batch-${i + 1}`,
    documentType: i % 2 === 0 ? 'IPPIS_BROADSHEET' : 'REPAYMENT_SCHEDULE',
    status: 'COMPLETED',
    totalRows: 100,
    processedRows: 100,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:05:00.000Z',
  }));
}
const BATCHES = batchRows();

const listRoutes = [
  {
    match: /^\/admin\/agents$/,
    rows: AGENTS,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      return textMatch(`${row.fullName} ${row.email} ${row.phone}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/admins$/,
    rows: ADMINS,
    filter: (row, q) => {
      if (q.has('isActive')) {
        const want = q.get('isActive') === 'true';
        if (row.isActive !== want) return false;
      }
      return textMatch(`${row.fullName} ${row.email}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/ippis-records$/,
    rows: IPPIS,
    filter: (row, q) => {
      if (q.get('employeeStatus') && row.employeeStatus !== q.get('employeeStatus')) return false;
      return textMatch(`${row.employeeName} ${row.staffId}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/loans$/,
    rows: LOANS,
    filter: (row, q) => {
      if (q.get('agency') && row.agency !== q.get('agency')) return false;
      return textMatch(`${row.customerName} ${row.accountNumber} ${row.ippisNumber}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/loan-requests$/,
    rows: LOAN_REQUESTS,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      if (q.get('type') && row.type !== q.get('type')) return false;
      return true;
    },
  },
  {
    match: /^\/admin\/client-loans$/,
    rows: LOAN_REQUESTS,
    filter: () => true,
  },
  {
    match: /^\/admin\/clients$/,
    rows: CLIENTS,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      return textMatch(`${row.firstName} ${row.lastName} ${row.phone}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/audit-logs$/,
    rows: AUDIT_LOGS,
    filter: (row, q) => {
      if (q.get('action') && row.action !== q.get('action')) return false;
      if (q.get('actorType') && row.actorType !== q.get('actorType')) return false;
      return true;
    },
  },
  {
    match: /^\/admin\/invites$/,
    rows: INVITES,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      return textMatch(row.email, q.get('q'));
    },
  },
  {
    match: /^\/admin\/reconciliation$/,
    rows: RECONCILIATION,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      if (q.get('agency') && row.loan.agency !== q.get('agency')) return false;
      return true;
    },
  },
  {
    match: /^\/admin\/agent-recruitment-applications$/,
    rows: RECRUITMENT,
    filter: (row, q) => {
      if (q.get('status') && row.status !== q.get('status')) return false;
      return textMatch(`${row.fullName} ${row.email}`, q.get('q'));
    },
  },
  {
    match: /^\/admin\/documents\/batches$/,
    rows: BATCHES,
    filter: (row, q) => {
      if (q.get('documentType') && row.documentType !== q.get('documentType')) return false;
      return true;
    },
  },
];

const mockServer = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${API_PORT}`);
  mockRequests.push({ method: req.method, path: url.pathname, search: url.search });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (url.pathname === '/admin/me') {
    return send(200, {
      data: {
        id: 'admin-1',
        email: 'admin@example.com',
        fullName: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        role: { id: 'role-1', name: 'SUPER_ADMIN', permissions: ALL_PERMISSIONS },
        permissions: ALL_PERMISSIONS,
      },
    });
  }

  if (url.pathname === '/admin/agents/analytics') {
    return send(200, {
      data: {
        totalApplications: 60,
        byStatus: { APPROVED: 20, PENDING_REVIEW: 20, REJECTED: 20 },
        activity: { averageReviewTimeHours: 12, totalApproved: 20, totalRejected: 20 },
        reviewerLeaderboard: [{ adminId: 'admin-1', adminName: 'Super Admin', approvedCount: 20, rejectedCount: 20 }],
      },
    });
  }

  if (url.pathname === '/admin/clients/analytics') {
    return send(200, {
      data: {
        totalClients: 60,
        bySource: { SELF: 10, AGENT: 30, ADMIN: 20 },
        byClientStatus: { VERIFIED: 30, MANUAL_REVIEW: 30 },
        byOnboardingStep: { COMPLETED: 30, IDENTITY_SUBMITTED: 30 },
        agentLeaderboard: [],
        activity: {},
      },
    });
  }

  if (url.pathname === '/admin/agent-recruitment-applications/analytics') {
    return send(200, {
      data: {
        totalApplications: 60,
        byStatus: { SUBMITTED: 30, EMAIL_VERIFIED: 30 },
        conversionRate: 50,
        averageTimeToSubmitHours: 10,
      },
    });
  }

  const route = listRoutes.find((r) => r.match.test(url.pathname));
  if (route) {
    const query = url.searchParams;
    const filtered = route.rows.filter((row) => route.filter(row, query));
    const { rows, total, totalPages, page, limit } = paginate(filtered, query);
    return send(200, { data: rows, meta: { total, page, limit, totalPages } });
  }

  return send(200, { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 1 } });
});

// ---------------------------------------------------------------------------
// CDP
// ---------------------------------------------------------------------------
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('close', () => {
      for (const { reject } of this.pending.values()) {
        reject(new Error('CDP connection closed'));
      }
      this.pending.clear();
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || 'Evaluation failed');
    }
    return result.result.value;
  }

  waitForEvent(method, timeoutMs = 30000) {
    const existing = this.events.find((e) => e.method === method);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timer = setInterval(() => {
        const event = this.events.find((e) => e.method === method);
        if (event) {
          clearInterval(timer);
          resolve(event);
        } else if (Date.now() - started > timeoutMs) {
          clearInterval(timer);
          reject(new Error(`Timed out waiting for ${method}`));
        }
      }, 100);
    });
  }
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

async function crash(message) {
  console.error(`\n✗ ${message}`);
  process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
function requestsFor(pathname) {
  return mockRequests.filter((r) => r.path === pathname);
}

function lastQuery(pathname) {
  const entries = requestsFor(pathname);
  if (entries.length === 0) return null;
  return new URLSearchParams(entries[entries.length - 1].search);
}

async function waitFor(cdp, predicateExpression, label, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await cdp.evaluate(predicateExpression);
    if (value) return value;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for: ${label}`);
}

async function setInput(cdp, placeholder, value) {
  const expression = `(() => {
    const input = [...document.querySelectorAll('input')].find((el) => (el.placeholder || '').toLowerCase().includes(${JSON.stringify(
      placeholder.toLowerCase(),
    )}));
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`;
  if (!(await cdp.evaluate(expression))) {
    throw new Error(`Input with placeholder containing "${placeholder}" not found`);
  }
}

async function chooseSelectOption(cdp, triggerText, optionText) {
  const open = await cdp.evaluate(`(() => {
    const trigger = [...document.querySelectorAll('button')].find((el) =>
      (el.textContent || '').includes(${JSON.stringify(triggerText)})
    );
    if (!trigger) return false;
    trigger.click();
    return true;
  })()`);
  if (!open) throw new Error(`Select trigger "${triggerText}" not found`);
  await sleep(350);

  const chosen = await cdp.evaluate(`(() => {
    const options = [...document.querySelectorAll('[role="option"]')];
    const option = options.find((el) =>
      (el.textContent || '').trim().toLowerCase() === ${JSON.stringify(optionText.toLowerCase())}
    );
    if (!option) return false;
    option.click();
    return true;
  })()`);
  if (!chosen) throw new Error(`Option "${optionText}" not found for "${triggerText}"`);
  await sleep(700);
}

async function goto(cdp, pathname) {
  cdp.events = cdp.events.filter((e) => e.method !== 'Page.loadEventFired');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${APP_PORT}${pathname}` });
  await cdp.waitForEvent('Page.loadEventFired', 120000);
  await waitFor(
    cdp,
    `document.body && document.body.innerText.length > 20`,
    `body content on ${pathname}`,
  );
  await sleep(1200); // let the initial list request settle
}

async function openFilters(cdp) {
  const opened = await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!opened) throw new Error('Filters button not found');
  await sleep(500);
}

async function changeRowsPerPage(cdp, nextLabel) {
  const opened = await cdp.evaluate(`(() => {
    const label = [...document.querySelectorAll('label')].find((el) => (el.textContent || '').includes('Rows per page'));
    const trigger = label && label.parentElement ? label.parentElement.querySelector('button') : null;
    if (!trigger) return false;
    trigger.click();
    return true;
  })()`);
  if (!opened) throw new Error('Rows per page selector not found');
  await sleep(350);
  const chosen = await cdp.evaluate(`(() => {
    const option = [...document.querySelectorAll('[role="option"]')].find((el) => (el.textContent || '').trim() === ${JSON.stringify(nextLabel)});
    if (!option) return false;
    option.click();
    return true;
  })()`);
  if (!chosen) throw new Error(`Rows per page option ${nextLabel} not found`);
  await sleep(1200);
}

async function expectParams(pathname, expected, label) {
  const query = queryAfter(pathname);
  if (!query) return crash(`${label}: no request captured for ${pathname}`);
  for (const [key, value] of Object.entries(expected)) {
    const actual = query.get(key);
    if (String(actual) !== String(value)) {
      return crash(`${label}: expected ${key}=${value}, got ${actual} (${query.toString()})`);
    }
  }
  console.log(`  ✓ ${label} → ${query.toString()}`);
}

// Snapshot the request count before an interaction so we assert the newest query.
let requestCursor = 0;
function markRequests() {
  requestCursor = mockRequests.length;
}
function queryAfter(pathname) {
  const recent = mockRequests.slice(requestCursor);
  const matches = recent.filter((r) => r.path === pathname);
  return matches.length ? new URLSearchParams(matches[matches.length - 1].search) : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
let chromeProcess;
let devProcess;
let chromeProfile;
const envLocalPath = path.join(ROOT, '.env.local');
const nextEnvPath = path.join(ROOT, 'next-env.d.ts');
const tsconfigPath = path.join(ROOT, 'tsconfig.json');
let previousEnvLocal = null;
let previousNextEnv = null;
let previousTsconfig = null;

try {
  await new Promise((resolve) => mockServer.listen(API_PORT, '127.0.0.1', resolve));
  console.log(`✓ mock API on :${API_PORT}`);

  // NEXT_PUBLIC_* values are inlined at compile time. Use .env.local (highest
  // precedence) so the dev server definitely talks to the mock, and drop the
  // turbopack dev cache so a previously-compiled API URL is not reused.
  if (existsSync(envLocalPath)) previousEnvLocal = readFileSync(envLocalPath, 'utf8');
  if (existsSync(nextEnvPath)) previousNextEnv = readFileSync(nextEnvPath, 'utf8');
  if (existsSync(tsconfigPath)) previousTsconfig = readFileSync(tsconfigPath, 'utf8');
  writeFileSync(
    envLocalPath,
    `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:${API_PORT}\nNEXT_PUBLIC_IMAGE_UPLOAD_BASE_URL=http://127.0.0.1:${API_PORT}\n`,
  );
  rmSync(DIST_DIR, { recursive: true, force: true });

  console.log('… building with mock API URL');
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    env: {
      ...process.env,
      NEXT_DIST_DIR: '.next-smoke',
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_IMAGE_UPLOAD_BASE_URL: `http://127.0.0.1:${API_PORT}`,
    },
    stdio: 'inherit',
  });
  if (build.status !== 0) throw new Error('production build failed');

  // Production mode avoids the dev-only HMR websocket, which headless Chrome
  // cannot complete in this sandbox.
  devProcess = spawn('npm', ['run', 'start'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      NEXT_DIST_DIR: '.next-smoke',
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_IMAGE_UPLOAD_BASE_URL: `http://127.0.0.1:${API_PORT}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  devProcess.stdout.on('data', () => {});
  devProcess.stderr.on('data', () => {});

  console.log('… waiting for app server');
  const waitStart = Date.now();
  let up = false;
  while (Date.now() - waitStart < 120000) {
    try {
      const response = await fetch(`http://127.0.0.1:${APP_PORT}/login`);
      if (response.ok) {
        up = true;
        break;
      }
    } catch {}
    await sleep(1000);
  }
  if (!up) throw new Error('dev server did not start');
  console.log(`✓ dev server on :${APP_PORT}`);

  chromeProfile = mkdtempSync(path.join(tmpdir(), 'dsh-chrome-'));
  chromeProcess = spawn(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-allow-origins=*',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${chromeProfile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let target;
  const cdpStart = Date.now();
  while (Date.now() - cdpStart < 30000) {
    try {
      target = await getJson(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' });
      break;
    } catch {
      await sleep(500);
    }
  }
  if (!target?.webSocketDebuggerUrl) throw new Error('could not start headless Chrome');
  console.log('✓ headless Chrome');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new Cdp(ws);
  globalThis.__smokeCdp = cdp;

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  const tokenPayload = Buffer.from(
    JSON.stringify({ sub: 'admin-1', role: 'SUPER_ADMIN', permissions: ALL_PERMISSIONS }),
  ).toString('base64url');
  const token = `header.${tokenPayload}.signature`;

  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__smokeErrors = [];
      window.addEventListener('error', (e) => window.__smokeErrors.push(String(e.message || e.error)));
      window.addEventListener('unhandledrejection', (e) => window.__smokeErrors.push('rejection: ' + String(e.reason && (e.reason.stack || e.reason.message || e.reason))));
      localStorage.setItem('token', ${JSON.stringify(token)});
      localStorage.setItem('public_sector_role', 'SUPER_ADMIN');
      localStorage.setItem('public_sector_permissions', ${JSON.stringify(JSON.stringify(ALL_PERMISSIONS))});
      document.cookie = 'public_sector_token=' + encodeURIComponent(${JSON.stringify(token)}) + '; path=/';
    `,
  });

  // ---- Agent Management: search, status filter, page reset, pagination ----
  console.log('\nAgent Management');
  await goto(cdp, '/dashboard/agent-management');
  await waitFor(cdp, `document.body.innerText.includes('Agent Management')`, 'Agent Management heading');
  await waitFor(cdp, `document.querySelectorAll('tbody tr').length > 1`, 'agent rows');
  await waitFor(cdp, `document.body.innerText.includes('Rows per page')`, 'agent pagination');

  // Pagination: next page must request page=2.
  markRequests();
  await cdp.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('nav[aria-label="Pagination"] button')];
    const next = buttons[buttons.length - 1];
    if (next) next.click();
  })()`);
  await sleep(1400);
  await expectParams('/admin/agents', { page: 2 }, 'agent next page');

  // A filter change while on page 2 must snap back to page 1.
  await openFilters(cdp);
  markRequests();
  await chooseSelectOption(cdp, 'All Statuses', 'APPROVED');
  await sleep(1400);
  await expectParams('/admin/agents', { page: 1, status: 'APPROVED' }, 'agent status filter resets to page 1');

  markRequests();
  await setInput(cdp, 'Search by name', 'Agent 4');
  await sleep(1400);
  await expectParams('/admin/agents', { page: 1, q: 'Agent 4' }, 'agent search');

  markRequests();
  await chooseSelectOption(cdp, 'APPROVED', 'REJECTED');
  await sleep(1400);
  await expectParams('/admin/agents', { page: 1, status: 'REJECTED' }, 'agent status change keeps page 1');

  // ---- Team / Admins: q + isActive contract ----
  console.log('\nTeam → Admins');
  await goto(cdp, '/dashboard/team');
  await waitFor(cdp, `document.body.innerText.includes('Admins')`, 'team tabs');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Admins');
    if (tab) tab.click();
  })()`);
  await sleep(1500);
  const filterButtonClicked = await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (!button) return false;
    button.click();
    return true;
  })()`);
  if (!filterButtonClicked) await crash('admins: Filters button not found');
  await sleep(500);

  markRequests();
  await setInput(cdp, 'Search email or name', 'Admin 1');
  await sleep(1400);
  await expectParams('/admin/admins', { page: 1, q: 'Admin 1' }, 'admin search uses q');

  markRequests();
  await chooseSelectOption(cdp, 'All Statuses', 'Suspended');
  await sleep(1400);
  await expectParams('/admin/admins', { page: 1, isActive: false }, 'admin status maps to isActive');

  // ---- Customers → IPPIS: employeeStatus contract ----
  console.log('\nCustomers → IPPIS Records');
  await goto(cdp, '/dashboard/clients');
  await waitFor(cdp, `document.body.innerText.includes('IPPIS Records')`, 'client tabs');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'IPPIS Records');
    if (tab) tab.click();
  })()`);
  await sleep(1200);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await chooseSelectOption(cdp, 'All Statuses', 'Ex Employee');
  await sleep(1400);
  await expectParams('/admin/ippis-records', { page: 1, employeeStatus: 'INACTIVE' }, 'ippis status maps to employeeStatus');

  // ---- Loan products catalog: disbursement date param ----
  console.log('\nLoan Products → Loans Catalog');
  await goto(cdp, '/dashboard/loan-terms');
  await waitFor(cdp, `document.body.innerText.length > 100`, 'loan terms page');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes('Loans Database'))
      || [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Loans Catalog');
    if (tab) tab.click();
  })()`);
  await sleep(1000);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await chooseSelectOption(cdp, 'All Agencies', 'NSCDC');
  await sleep(1400);
  await expectParams('/admin/loans', { page: 1, agency: 'NSCDC' }, 'loan agency filter');

  // The disbursement date filter is a flatpickr range; the param names are
  // asserted through the builder unit tests, this checks the agency flow.

  // ---- Loan Requests: status + page reset ----
  console.log('\nLoan Requests');
  await goto(cdp, '/dashboard/loan-requests');
  await waitFor(cdp, `document.body.innerText.includes('Loan Requests')`, 'loan request page');
  await sleep(1000);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await chooseSelectOption(cdp, 'All Statuses', 'CONFIRMED');
  await sleep(1400);
  await expectParams('/admin/loan-requests', { page: 1, status: 'CONFIRMED' }, 'loan request status filter');

  // ---- Audit logs: action + page reset ----
  console.log('\nReports → Audit Logs');
  await goto(cdp, '/dashboard/reports');
  await waitFor(cdp, `document.body.innerText.includes('Audit')`, 'reports tabs');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim().includes('Audit'));
    if (tab) tab.click();
  })()`);
  await sleep(1200);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await chooseSelectOption(cdp, 'All Actions', 'Admin Invite Created');
  await sleep(1400);
  await expectParams('/admin/audit-logs', { page: 1, action: 'admin.invite.created' }, 'audit action filter');

  // ---- Recruitment applications: q ----
  console.log('\nAgent Recruitment');
  await goto(cdp, '/dashboard/invites');
  await waitFor(cdp, `document.body.innerText.includes('Recruitment')`, 'recruitment page');
  await sleep(1000);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await setInput(cdp, 'Search by name or email', 'Applicant 1');
  await sleep(1400);
  await expectParams('/admin/agent-recruitment-applications', { page: 1, q: 'Applicant 1' }, 'recruitment search');

  // ---- Invites: status + email search ----
  console.log('\nTeam → Invites');
  await goto(cdp, '/dashboard/team');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Invites');
    if (tab) tab.click();
  })()`);
  await sleep(1200);
  await cdp.evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === 'Filters');
    if (button) button.click();
  })()`);
  await sleep(500);

  markRequests();
  await setInput(cdp, 'Search email', 'invite1@');
  await sleep(1400);
  await expectParams('/admin/invites', { page: 1, q: 'invite1@' }, 'invite search');

  // ---- Reconciliation: status filter + pagination ----
  console.log('\nReports → Finance Reconciliation');
  await goto(cdp, '/dashboard/reports');
  await cdp.evaluate(`(() => {
    const tab = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes('Finance Reconciliation'));
    if (tab) tab.click();
  })()`);
  await sleep(1500);
  await waitFor(cdp, `document.body.innerText.includes('Finance Reconciliation')`, 'reconciliation page');

  // Pagination next page, then a filter change must reset to page 1.
  markRequests();
  await cdp.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('nav[aria-label="Pagination"] button')];
    const next = buttons[buttons.length - 1];
    if (next) next.click();
  })()`);
  await sleep(1200);
  await expectParams('/admin/reconciliation', { page: 2 }, 'reconciliation next page');

  await openFilters(cdp);
  markRequests();
  await chooseSelectOption(cdp, 'All Statuses', 'Under Paid');
  await sleep(1200);
  await expectParams('/admin/reconciliation', { page: 1, status: 'UNDER_PAID' }, 'reconciliation status resets to page 1');

  // ---- Client Loans: rows-per-page must drive limit ----
  console.log('\nClient Loans');
  await goto(cdp, '/dashboard/loan-requests?tab=client-loans&clientId=client-1');
  await waitFor(cdp, `document.querySelectorAll('tbody tr').length > 1`, 'client loan rows');
  await waitFor(cdp, `document.body.innerText.includes('Rows per page')`, 'client loans pagination');

  markRequests();
  await changeRowsPerPage(cdp, '50');
  await expectParams('/admin/client-loans', { page: 1, limit: 50, clientId: 'client-1' }, 'client loans rows-per-page maps to limit');

  // ---- Uploads batches: page size wiring ----
  console.log('\nUploads');
  await goto(cdp, '/dashboard/uploads');
  await waitFor(cdp, `document.body.innerText.includes('Upload Batches')`, 'upload batches');
  await waitFor(cdp, `document.body.innerText.includes('Rows per page')`, 'upload pagination');
  const pageText = await cdp.evaluate(`(() => {
    const paragraph = [...document.querySelectorAll('p')].find((el) => (el.textContent || '').includes('Showing'));
    return paragraph ? paragraph.textContent.trim() : null;
  })()`);
  if (!pageText || !pageText.includes('of 60')) {
    await crash(`uploads: expected "of 60" in pagination, got "${pageText}"`);
  } else {
    console.log(`  ✓ ${pageText}`);
  }

  if (!process.exitCode) console.log('\n✓ All filter & pagination smoke checks passed');
} catch (error) {
  console.error(`\n✗ ${error.stack || error.message}`);
  const cdp = globalThis.__smokeCdp;
  if (cdp) {
    try {
      const url = await cdp.evaluate('location.href');
      const text = await cdp.evaluate('document.body ? document.body.innerText : ""');
      console.error(`\nURL: ${url}`);
      console.error('BODY:', String(text).slice(0, 1500));
      try {
        const resources = await cdp.evaluate(`performance.getEntriesByType('resource').map((r) => r.name).slice(-15)`);
        console.error('RESOURCES:', resources);
      } catch {}
      const requests = cdp.events.filter((e) => e.method === 'Network.requestWillBeSent');
      console.error('NETWORK:', requests.map((e) => e.params?.request?.url).filter((u) => !u.includes('/_next/') && !u.includes('font')));
      const logs = cdp.events.filter((e) => e.method === 'Log.entryAdded');
      console.error('LOG:', logs.slice(-10).map((e) => e.params?.entry?.text));
      const problems = cdp.events.filter(
        (e) =>
          e.method === 'Runtime.exceptionThrown' ||
          e.method === 'Network.loadingFailed' ||
          (e.method === 'Runtime.consoleAPICalled' && e.params?.type === 'error'),
      );
      for (const problem of problems.slice(-8)) {
        console.error('BROWSER:', JSON.stringify(problem.params).slice(0, 700));
      }
    } catch (e) {
      console.error('Could not dump browser state:', e.message);
    }
  }
  console.error('\nMOCK REQUESTS:', mockRequests.slice(-15));
  process.exitCode = 1;
} finally {
  try { chromeProcess?.kill('SIGKILL'); } catch {}
  try { devProcess?.kill('SIGTERM'); } catch {}
  try { mockServer.close(); } catch {}
  if (chromeProfile) {
    try { rmSync(chromeProfile, { recursive: true, force: true }); } catch {}
  }
  try { rmSync(DIST_DIR, { recursive: true, force: true }); } catch {}
  try {
    if (previousEnvLocal === null) rmSync(envLocalPath, { force: true });
    else writeFileSync(envLocalPath, previousEnvLocal);
  } catch {}
  // `next build` rewrites next-env.d.ts to point at the (temporary) smoke
  // distDir; restore the real .next references.
  try {
    if (previousNextEnv !== null) writeFileSync(nextEnvPath, previousNextEnv);
  } catch {}
  // `next build` also adds the temporary distDir to tsconfig's include list.
  try {
    if (previousTsconfig !== null) writeFileSync(tsconfigPath, previousTsconfig);
  } catch {}
}
