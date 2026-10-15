import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";

const source = fs.readFileSync("google-apps-script/Code.gs", "utf8");
const assertions = [];
const testCode = `
(function(){
  function assert(name, condition) { if (!condition) throw new Error('FAIL: ' + name); __results.push('PASS: ' + name); }
  assert('normalizeEmail accepts valid email', normalizeEmail_(' Test@Example.com ') === 'test@example.com');
  assert('normalizeEmail rejects invalid email', normalizeEmail_('not-an-email') === '');
  assert('normalizeRole accepts admin', normalizeRole_('ADMIN') === 'admin');
  assert('normalizeRole rejects unknown role', normalizeRole_('owner') === '');
  assert('priority defaults to NORMAL', normalizePriority_('') === 'NORMAL');
  assert('priority accepts URGENT', normalizePriority_('urgent') === 'URGENT');
  assert('priority rejects arbitrary input', normalizePriority_('critical-now') === '');
  assert('ISO date validator accepts leap date', isValidIsoDate_('2028-02-29') === true);
  assert('ISO date validator rejects invalid date', isValidIsoDate_('2027-02-29') === false);
  assert('safeCell blocks formula injection', safeCell_('=IMPORTXML("x")').charAt(0) === "'");
  assert('HTML escape protects markup', htmlEscape_('<script>') === '&lt;script&gt;');
  const otp = generatePortalOtp_();
  assert('generated OTP is six digits', /^\\d{6}$/.test(otp));
  assert('generated OTP is in 100000-999999 range', Number(otp) >= 100000 && Number(otp) <= 999999);
})();
`;

const context = {
  __results: assertions,
  console,
  Date,
  JSON,
  Math,
  RegExp,
  String,
  Number,
  Boolean,
  Object,
  Array,
  Error,
  isNaN,
  parseInt,
  PropertiesService: {
    getScriptProperties() {
      return {
        getProperty(name) { return name === 'INCENTIFY_PORTAL_SECRET' ? 'test-secret' : ''; },
        setProperty() {},
      };
    },
  },
  Utilities: {
    Charset: { UTF_8: 'UTF_8' },
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    getUuid() { return crypto.randomUUID(); },
    computeDigest(_algorithm, value) {
      const bytes = crypto.createHash('sha256').update(String(value), 'utf8').digest();
      return [...bytes].map((v) => (v > 127 ? v - 256 : v));
    },
  },
};

vm.createContext(context);
try {
  vm.runInContext(`${source}\n${testCode}`, context, { timeout: 3000 });
  for (const line of assertions) console.log(line);
  console.log(`\nV12 pure backend tests passed: ${assertions.length} checks.`);
} catch (error) {
  console.error(error?.stack || String(error));
  process.exit(1);
}
