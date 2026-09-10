import { checkOperator, checkTarget, targetFor, IMPERSONATION_TARGETS } from "./impersonation";
const NAILA = "905d2f66-321b-480e-8c8e-8081a2c225b9";
const AYMAN = "0081a009-e9f4-447f-b1a2-b6cf87707f4a";
const cases: [string, unknown, unknown][] = [
  ["operator: the named account",        checkOperator("alfawakhry@icloud.com"), null],
  ["operator: same, different case",     checkOperator("AlFawakhry@iCloud.com"), null],
  ["operator: the OTHER admin is refused", checkOperator("abdelrahman@hyrde.net"), "not_the_operator"],
  ["operator: a random user",            checkOperator("someone@example.com"), "not_the_operator"],
  ["operator: signed out",               checkOperator(null), "not_signed_in"],
  ["target: Naila allowed",              checkTarget(NAILA), null],
  ["target: Ayman allowed",              checkTarget(AYMAN), null],
  ["target: any other account refused",  checkTarget("99435957-24f7-4420-8c2a-b7179e80e822"), "wrong_target"],
  ["target: empty refused",              checkTarget(""), "wrong_target"],
  ["only two targets exist",             IMPERSONATION_TARGETS.length, 2],
  ["unknown id resolves to nothing",     targetFor("nope"), null],
];
let bad = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(40)} ${ok ? "" : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
}
console.log(bad ? `\n${bad} FAILING` : "\nall pass");
process.exit(bad ? 1 : 0);
