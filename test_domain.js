const { validateQuery } = require('./src/lib/query-validator.ts');

const testCases = [
  "who is ms dhone",
  "who is ms dhoni",
  "धोनी कौन है",
  "who is virat kohli",
  "tell me a joke",
  "how to make biryani",
  "write python code for me",
  "what is the capital of France",
  "आयुष्मान भारत योजना में कितना कवरेज मिलता है?",
  "Does PM Kisan give 4000 bonus?",
  "Can I give paracetamol to 6 month infant for fever?",
];

console.log("=== DOMAIN VALIDATION TESTS ===");
for (const tc of testCases) {
  const result = validateQuery(tc);
  console.log(`Q: "${tc}"`);
  console.log(`   Type: ${result.type}, Valid: ${result.isValid}`);
  if (result.feedbackReport) {
    console.log(`   Source: ${result.feedbackReport.verificationSource}`);
    console.log(`   SafeText (first 80 chars): ${result.feedbackReport.sanitizedSafeText.substring(0, 80)}...`);
  }
}
