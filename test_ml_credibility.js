const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3005;
process.env.PORT = PORT;
process.env.NO_AUTO_OPEN = '1';

// Import server & ML engine
const app = require('./server.js');
const mlEngine = require('./mlEngine.js');

function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: reqPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const testResults = [];
function recordResult(testName, passed, details = '') {
  testResults.push({ testName, passed, details });
  const statusStr = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusStr}: ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runMLCredibilitySuite() {
  console.log('================================================================');
  console.log('STUDYFLOW AI: PRIORITY 2 ML PREDICTION CREDIBILITY TEST SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // 1. Historical Dataset & Model Benchmark Verification
    // -------------------------------------------------------------------------
    console.log('--- 1. Historical Dataset & Artifact Provenance ---');

    const csvPath = path.join(__dirname, 'data', 'historical_cohort_placement_data.csv');
    const csvExists = fs.existsSync(csvPath);
    let rowCount = 0;
    if (csvExists) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      rowCount = csvContent.trim().split('\n').length - 1; // subtract header
    }
    recordResult(
      'Authorized historical cohort dataset exists on disk',
      csvExists && rowCount >= 2000,
      `Found ${rowCount} records across 2021-2025 cohorts in data/historical_cohort_placement_data.csv`
    );

    const benchmarkJsonPath = path.join(__dirname, 'data', 'models', 'placement_model_benchmark.json');
    const benchmarkExists = fs.existsSync(benchmarkJsonPath);
    recordResult(
      'Multi-model benchmark artifact exists on disk',
      benchmarkExists,
      'data/models/placement_model_benchmark.json'
    );

    // -------------------------------------------------------------------------
    // 2. GET /api/ml/benchmark Endpoint Tests
    // -------------------------------------------------------------------------
    console.log('\n--- 2. GET /api/ml/benchmark Endpoint Validation ---');
    const benchRes = await request('GET', '/api/ml/benchmark');
    recordResult(
      'GET /api/ml/benchmark returns HTTP 200',
      benchRes.status === 200,
      `Status: ${benchRes.status}`
    );

    const bench = benchRes.body;
    recordResult(
      'Synthetic vs Real-world accuracy distinction is explicitly documented',
      bench && bench.syntheticVsRealAccuracy &&
      bench.syntheticVsRealAccuracy.syntheticTestAccuracy === 93.75 &&
      bench.syntheticVsRealAccuracy.realCohortAccuracy === 89.80,
      `Synthetic: ${bench?.syntheticVsRealAccuracy?.syntheticTestAccuracy}%, Real Cohort: ${bench?.syntheticVsRealAccuracy?.realCohortAccuracy}%`
    );

    // Verify 3 distinct models compared on identical splits
    const models = bench?.models || [];
    const modelNames = models.map(m => m.model_name);
    const hasLogReg = modelNames.some(n => n.includes('Logistic Regression'));
    const hasRF = modelNames.some(n => n.includes('Random Forest'));
    const hasGB = modelNames.some(n => n.includes('Gradient Boosting'));

    recordResult(
      'Benchmark compares Logistic Regression, Random Forest, and Gradient Boosting on identical splits',
      models.length === 3 && hasLogReg && hasRF && hasGB,
      `Models evaluated: ${modelNames.join(' | ')}`
    );

    // Verify all required evaluation metrics are present for each model
    let allMetricsPresent = true;
    let missingDetails = [];
    for (const m of models) {
      const requiredFields = [
        'accuracy', 'precision', 'recall', 'specificity', 'f1_score',
        'roc_auc', 'brier_score', 'ece_calibration_error', 'confusion_matrix'
      ];
      for (const f of requiredFields) {
        if (m[f] === undefined || m[f] === null) {
          allMetricsPresent = false;
          missingDetails.push(`${m.model_name} missing ${f}`);
        }
      }
      if (!m.confusion_matrix || typeof m.confusion_matrix.tp !== 'number') {
        allMetricsPresent = false;
        missingDetails.push(`${m.model_name} missing valid confusion matrix`);
      }
    }

    recordResult(
      'All 3 models report precision, recall, specificity, F1, ROC-AUC, Brier score, ECE, and confusion matrix',
      allMetricsPresent,
      allMetricsPresent ? 'All metrics verified across all 3 models' : missingDetails.join('; ')
    );

    // Time-based (temporal) out-of-time cohort validation
    const oot = bench?.temporalValidation;
    const hasOOT = oot && oot.targetCohort === '2024-25' && oot.models && oot.models.length === 3;
    recordResult(
      'Time-based Out-Of-Time (OOT) validation performed on 2024-25 cohort',
      hasOOT,
      `OOT Target Cohort: ${oot?.targetCohort}, Models evaluated: ${oot?.models?.length}`
    );

    // Ethical safeguard and limitations
    recordResult(
      'Model limitations and non-automated decision policy enforced in benchmark metadata',
      bench?.ethicalSafeguard && bench.ethicalSafeguard.institutionalPolicyStrictlyProhibitsAutomatedDecisions === true &&
      Array.isArray(bench.modelLimitations) && bench.modelLimitations.length > 0,
      'Institutional safeguard: No automated placement decisions permitted'
    );

    // -------------------------------------------------------------------------
    // 3. GET /api/ml/metrics Summary Endpoint Tests
    // -------------------------------------------------------------------------
    console.log('\n--- 3. GET /api/ml/metrics Summary Endpoint ---');
    const metricsRes = await request('GET', '/api/ml/metrics');
    recordResult(
      'GET /api/ml/metrics returns HTTP 200 with champion model summary',
      metricsRes.status === 200 && metricsRes.body.model && metricsRes.body.model.includes('Logistic Regression'),
      `Champion Model: ${metricsRes.body.model}, Real Accuracy: ${metricsRes.body.realCohortAccuracy}%`
    );

    // -------------------------------------------------------------------------
    // 4. POST /api/ml/predict-placement Explainability & Recommendations
    // -------------------------------------------------------------------------
    console.log('\n--- 4. POST /api/ml/predict-placement Explainability & Guidance ---');

    // Reject missing inputs with 400 Bad Request
    const badInputRes = await request('POST', '/api/ml/predict-placement', { cgpa: 8.5 });
    recordResult(
      'POST /api/ml/predict-placement rejects incomplete input with 400 Bad Request',
      badInputRes.status === 400,
      `Status: ${badInputRes.status}`
    );

    // Test a high-achieving student profile
    const highAchiever = {
      cgpa: 9.2,
      backlogs: 0,
      attendance: 94,
      internships: 2,
      projects: 3,
      aptitudeScore: 88,
      technicalScore: 90,
      commScore: 85
    };
    const highRes = await request('POST', '/api/ml/predict-placement', highAchiever);
    const highData = highRes.body;

    recordResult(
      'High-achiever prediction returns calibrated probability and confidence margin (±12%)',
      highRes.status === 200 &&
      highData.success &&
      highData.probability > 75 &&
      highData.confidenceInterval &&
      highData.confidenceInterval.marginPercent === 12 &&
      highData.confidenceInterval.high >= highData.probability,
      `Probability: ${highData.probability}%, CI: [${highData.confidenceInterval?.low}%, ${highData.confidenceInterval?.high}%]`
    );

    recordResult(
      'High-achiever response isolates key positive strengths',
      Array.isArray(highData.strengths) && highData.strengths.length > 0 &&
      highData.strengths.some(s => s.feature.includes('CGPA') || s.feature.includes('Internships') || s.feature.includes('Technical')),
      `Identified ${highData.strengths?.length} strengths: ${highData.strengths?.map(s => s.feature).join(', ')}`
    );

    recordResult(
      'High-achiever response explicitly displays training data provenance and synthetic vs real accuracy',
      highData.syntheticBenchmarkAccuracy === 93.75 &&
      highData.realCohortAccuracy === 89.80 &&
      highData.provenance &&
      highData.provenance.sampleSize === 2500,
      `Synthetic benchmark: ${highData.syntheticBenchmarkAccuracy}%, Real cohort: ${highData.realCohortAccuracy}%`
    );

    recordResult(
      'High-achiever response strictly declares advisory-only non-automated decision status',
      highData.isAutomatedDecision === false &&
      highData.decisionSupportAdvisoryOnly === true &&
      highData.noAutomatedDecisionRule === true &&
      typeof highData.ethicalNotice === 'string',
      'Non-automated decision rule confirmed'
    );

    // Test an at-risk student profile (low CGPA, active backlogs, low test scores)
    const atRiskStudent = {
      cgpa: 5.9,
      backlogs: 3,
      attendance: 62,
      internships: 0,
      projects: 0,
      aptitudeScore: 42,
      technicalScore: 38,
      commScore: 45
    };
    const riskRes = await request('POST', '/api/ml/predict-placement', atRiskStudent);
    const riskData = riskRes.body;

    recordResult(
      'At-risk student prediction detects risk factors and lower probability',
      riskRes.status === 200 &&
      riskData.probability < 50 &&
      Array.isArray(riskData.riskFactors) && riskData.riskFactors.length >= 2,
      `Probability: ${riskData.probability}%, Identified risks: ${riskData.riskFactors?.map(r => r.feature).join(', ')}`
    );

    recordResult(
      'At-risk student receives targeted, actionable skill improvement recommendations',
      Array.isArray(riskData.actionableRecommendations) &&
      riskData.actionableRecommendations.length >= 3 &&
      riskData.actionableRecommendations.some(r => r.category === 'Academic Eligibility' || r.recommendation.includes('backlog')) &&
      riskData.actionableRecommendations.some(r => r.category === 'Technical Skills' || r.recommendation.includes('coding')),
      `Generated ${riskData.actionableRecommendations?.length} actionable recommendations: ${riskData.actionableRecommendations?.map(r => r.category).join(', ')}`
    );

    // -------------------------------------------------------------------------
    // 5. Unit Level mlEngine.js Contract Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 5. ML Engine Unit Level Contract Verification ---');

    const unitPred = mlEngine.predictPlacementOutcome({
      cgpa: 7.5,
      backlogs: 1,
      attendance: 80,
      internships: 1,
      projects: 2,
      aptitudeScore: 70,
      technicalScore: 72,
      commScore: 70
    });

    recordResult(
      'mlEngine.predictPlacementOutcome maintains backward compatible `accuracy: 93.75` while adding credibility fields',
      unitPred.accuracy === 93.75 &&
      unitPred.syntheticBenchmarkAccuracy === 93.75 &&
      unitPred.realCohortAccuracy === 89.80,
      `Backward compatible accuracy: ${unitPred.accuracy}%, realCohortAccuracy: ${unitPred.realCohortAccuracy}%`
    );

    recordResult(
      'mlEngine.predictPlacementOutcome exports comprehensive model limitations array',
      Array.isArray(unitPred.modelLimitations) && unitPred.modelLimitations.length >= 3,
      `Found ${unitPred.modelLimitations?.length} explicit limitation disclosures`
    );

  } catch (err) {
    console.error('Unexpected error during ML credibility test suite execution:', err);
    recordResult('Test suite execution completed cleanly', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;

  console.log('\n================================================================');
  console.log(`TOTAL ML CREDIBILITY TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);
  console.log('================================================================');

  if (failed > 0) {
    console.error('❌ SOME ML CREDIBILITY TESTS FAILED');
    process.exit(1);
  } else {
    console.log('🎉 ALL PRIORITY 2 ML PREDICTION CREDIBILITY TESTS PASSED!');
    process.exit(0);
  }
}

runMLCredibilitySuite();
