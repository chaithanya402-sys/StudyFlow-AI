/**
 * StudyFlow AI - Verified Machine Learning Inference Engine
 * 
 * Separate Supervised ML Target Pipelines:
 * Target A: Final Examination Score Prediction (Continuous Ridge Regressor Pipeline)
 *   Trained on N=2,000 Historical Assessment Benchmark Dataset (80/20 held-out split)
 *   Held-out Test Evaluation: MAE = 2.52 marks, RMSE = 3.19 marks, R² = 0.8946
 * 
 * Target B: Student Placement Outcome Prediction (L2 Regularized Logistic Regression Pipeline)
 *   Trained on N=2,000 Campus Placement Benchmark Dataset (80/20 held-out split)
 *   Held-out Test Evaluation: Accuracy = 93.75%, Precision = 96.83%, Recall = 93.49%, F1 = 95.13%, ROC-AUC = 0.9805
 */

const fs = require('fs');
const path = require('path');

// Target A Parameters from data/models/best_final_exam_model.joblib
const EXAM_SCALER_MEAN = [70.9038125, 66.536875, 7.63120625, 69.084125, 77.5526875];
const EXAM_SCALER_SCALE = [10.06623088, 10.52764707, 1.06247293, 10.27761392, 12.44881692];
const EXAM_RIDGE_COEFS = [3.48773948, 2.63080648, 1.85585238, 1.2072115, 1.28327233];
const EXAM_RIDGE_INTERCEPT = 71.3293125;
const EXAM_METRICS = {
  mae: 2.52,
  rmse: 3.19,
  r2Score: 0.895,
  modelVersion: 'Supervised Ridge Regressor v1.0',
  dataset: 'Historical Continuous Academic Assessment Cohort (N=2,000)'
};

// Target B Parameters from data/models/best_placement_model.joblib
const PLACEMENT_MEAN = [7.46003125, 1.59875, 3.72875, 1.441875, 71.75625, 72.5825, 67.91625, 0.914375, 75.97825625, 75.5199125];
const PLACEMENT_SCALE = [0.99740203, 1.08004557, 1.13585802, 1.12321925, 11.55181094, 12.74978211, 12.83468877, 1.06221154, 10.43968388, 10.32397718];
const PLACEMENT_COEFS = [1.30832772, 0.52479856, 0.43718532, 0.24122479, 0.61361368, 0.48477717, 0.14010112, -3.12540152, 0.04481285, 0.04265352];
const PLACEMENT_INTERCEPT = 1.89289169;
const PLACEMENT_METRICS = {
  accuracy: 93.75,
  precision: 96.83,
  recall: 93.49,
  f1Score: 95.13,
  rocAuc: 0.9805,
  modelVersion: 'Logistic Regression Pipeline v1.0',
  dataset: 'StudyFlow AI Campus Placement Benchmark Cohort (N=2,000)'
};

/**
 * Predict Final Examination Score (Target A - Regression)
 * Requires 5 features: internals, quiz, cgpa, assignments, attendance
 */
function predictFinalExamScore(features = {}) {
  const { internals, quiz, cgpa, assignments, attendance } = features;

  const missing = [];
  if (internals === undefined || internals === null || isNaN(Number(internals))) missing.push('Internal Assessments');
  if (quiz === undefined || quiz === null || isNaN(Number(quiz))) missing.push('Quizzes & Midterms');
  if (cgpa === undefined || cgpa === null || isNaN(Number(cgpa))) missing.push('Current CGPA');
  if (assignments === undefined || assignments === null || isNaN(Number(assignments))) missing.push('Assignment Completion');
  if (attendance === undefined || attendance === null || isNaN(Number(attendance))) missing.push('Lecture Attendance');

  if (missing.length > 0) {
    return {
      available: false,
      reason: `Missing verified records: ${missing.join(', ')}. Complete academic profile to calculate genuine ML projection.`,
      missingFeatures: missing
    };
  }

  const inInternal = Math.min(100, Math.max(0, Number(internals)));
  const inQuiz = Math.min(100, Math.max(0, Number(quiz)));
  const inCgpa = Math.min(10, Math.max(0, Number(cgpa)));
  const inAssignments = Math.min(100, Math.max(0, Number(assignments)));
  const inAttendance = Math.min(100, Math.max(0, Number(attendance)));

  const inputs = [inInternal, inQuiz, inCgpa, inAssignments, inAttendance];
  
  // Standardize using trained scaler parameters
  let rawScore = EXAM_RIDGE_INTERCEPT;
  const contributions = [];
  const featureNames = [
    'Internal Assessments',
    'Quizzes & Midterms',
    'Academic CGPA Standing',
    'Coursework Assignment Completion',
    'Lecture Attendance Compliance'
  ];
  const weightsPct = [33.3, 25.1, 17.7, 11.5, 12.4];

  for (let i = 0; i < inputs.length; i++) {
    const z = (inputs[i] - EXAM_SCALER_MEAN[i]) / EXAM_SCALER_SCALE[i];
    const impact = EXAM_RIDGE_COEFS[i] * z;
    rawScore += impact;
    contributions.push({
      feature: `${featureNames[i]} (${weightsPct[i]}%)`,
      value: inputs[i],
      weight: weightsPct[i],
      impact: Math.round(impact * 10) / 10
    });
  }

  const roundedScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

  let grade = 'B (Good)';
  if (roundedScore >= 90) grade = 'O (Outstanding)';
  else if (roundedScore >= 80) grade = 'A+ (Distinction)';
  else if (roundedScore >= 70) grade = 'A (Very Good)';
  else if (roundedScore >= 60) grade = 'B (Good)';
  else if (roundedScore >= 50) grade = 'C (Pass / Satisfactory)';
  else grade = 'D / F (At-Risk / Remedial)';

  const ciMin = Math.round(Math.max(0, roundedScore - EXAM_METRICS.mae) * 10) / 10;
  const ciMax = Math.round(Math.min(100, roundedScore + EXAM_METRICS.mae) * 10) / 10;

  return {
    available: true,
    predictedScore: roundedScore,
    grade,
    confidenceInterval: { min: ciMin, max: ciMax },
    contributions,
    inputs: {
      internals: inInternal,
      quiz: inQuiz,
      cgpa: inCgpa,
      assignments: inAssignments,
      attendance: inAttendance
    },
    ...EXAM_METRICS
  };
}

/**
 * Predict Student Campus Placement Probability (Target B - Classification)
 * Requires placement features: cgpa, internships, projects, workshops_certifications,
 * aptitude_score, technical_score, communication_score, backlogs, ssc_percentage, hsc_percentage
 */
function predictPlacementOutcome(features = {}) {
  const cgpa = features.cgpa !== undefined && features.cgpa !== null ? Number(features.cgpa) : null;
  if (cgpa === null || isNaN(cgpa)) {
    return {
      available: false,
      reason: 'Valid CGPA is required to evaluate placement probability.'
    };
  }

  const internships = Number(features.internships || 0);
  const projects = Number(features.projects || 0);
  const certs = Number(features.workshopsCertifications || features.certifications || 0);
  const aptitude = Number(features.aptitudeScore !== undefined && features.aptitudeScore !== null ? features.aptitudeScore : 70);
  const tech = Number(features.technicalScore !== undefined && features.technicalScore !== null ? features.technicalScore : 70);
  const comm = Number(features.communicationScore !== undefined && features.communicationScore !== null ? features.communicationScore : 70);
  const backlogs = Number(features.backlogs || 0);
  const ssc = Number(features.tenthPct || features.sscPercentage || 75);
  const hsc = Number(features.twelfthPct || features.hscPercentage || 75);

  const inputs = [cgpa, internships, projects, certs, aptitude, tech, comm, backlogs, ssc, hsc];

  let logit = PLACEMENT_INTERCEPT;
  for (let i = 0; i < inputs.length; i++) {
    const z = (inputs[i] - PLACEMENT_MEAN[i]) / PLACEMENT_SCALE[i];
    logit += PLACEMENT_COEFS[i] * z;
  }

  const prob = 1.0 / (1.0 + Math.exp(-logit));
  const probabilityPct = Math.min(99, Math.max(1, Math.round(prob * 100)));
  const status = backlogs > 0 ? 'Remedial Review' : (probabilityPct >= 75 ? 'Placement Ready' : 'In Process');
  const predictionStatus = backlogs > 0 ? 'At Risk' : (probabilityPct >= 75 ? 'Placement Ready' : 'In Progress');

  return {
    available: true,
    probability: probabilityPct,
    status,
    predictionStatus,
    logit: Math.round(logit * 100) / 100,
    ...PLACEMENT_METRICS
  };
}

module.exports = {
  predictFinalExamScore,
  predictPlacementOutcome,
  EXAM_METRICS,
  PLACEMENT_METRICS
};
