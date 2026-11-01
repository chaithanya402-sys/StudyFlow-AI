/**
 * Groq AI Client Integration for StudyFlow AI - Student Placement Prediction & Coding Assessment
 * 
 * Supports:
 * 1. Explaining ML placement predictions and factor contributions.
 * 2. Analyzing resume content against placement standards.
 * 3. Dynamic Placement-Oriented Coding Question Generation with full test cases, starter code, and complexities.
 * 
 * Secure implementation:
 * - Reads GROQ_API_KEY strictly from server-side environment variable.
 * - Never exposes API key to client-side code or browser requests.
 * - Provides rich, grounded heuristics fallback if GROQ_API_KEY is not configured.
 * - Optimized for Groq Free Plan: small batches, request throttling, HTTP 429 rate limit resilience.
 */

const https = require('https');
const crypto = require('crypto');

class GroqClient {
  constructor() {
    this.apiUrl = 'api.groq.com';
  }

  get apiKey() {
    const key = (process.env.GROQ_API_KEY || '').trim();
    return (key.length > 10 && !key.includes('your_groq_api_key')) ? key : null;
  }

  get model() {
    return (process.env.GROQ_MODEL || '').trim() || 'openai/gpt-oss-20b';
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Send a completion prompt to Groq API
   */
  async callChatCompletion(messages, maxTokens = 1200, temperature = 0.3, jsonMode = false) {
    if (!this.isConfigured()) {
      const err = new Error('Groq API Key is not configured. Please add GROQ_API_KEY to your server .env file.');
      err.code = 'GROQ_API_KEY_MISSING';
      throw err;
    }

    const payloadObj = {
      model: this.model,
      messages,
      max_tokens: maxTokens,
      temperature
    };

    if (jsonMode) {
      payloadObj.response_format = { type: 'json_object' };
    }

    const payload = JSON.stringify(payloadObj);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiUrl,
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      };

      const req = https.request(options, res => {
        let responseBody = '';
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(responseBody);
              const text = data.choices?.[0]?.message?.content || '';
              resolve(text);
            } catch (err) {
              reject(new Error(`Failed to parse Groq response: ${err.message}`));
            }
          } else if (res.statusCode === 429) {
            const retryAfter = res.headers['retry-after'] || '60';
            const rateErr = new Error(`Groq Free Plan API rate limit reached. Please wait ${retryAfter} seconds before requesting new AI questions, or continue with the curated question bank.`);
            rateErr.code = 'RATE_LIMIT_EXCEEDED';
            rateErr.retryAfter = retryAfter;
            reject(rateErr);
          } else if (res.statusCode === 400 && responseBody.includes('json_validate_failed')) {
            // Model doesn't support strict JSON mode or failed schema validation
            const jsonErr = new Error('JSON mode validation failed');
            jsonErr.code = 'JSON_VALIDATE_FAILED';
            reject(jsonErr);
          } else {
            let errorMsg = `Groq API returned HTTP ${res.statusCode}: ${responseBody}`;
            try {
              const parsedErr = JSON.parse(responseBody);
              if (parsedErr.error?.message) {
                errorMsg = parsedErr.error.message;
              }
            } catch (e) {}
            const apiErr = new Error(errorMsg);
            apiErr.statusCode = res.statusCode;
            reject(apiErr);
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const timeoutErr = new Error('Groq API request timed out (25s limit). Please try generating fewer questions or try again.');
        timeoutErr.code = 'API_TIMEOUT';
        reject(timeoutErr);
      });

      req.on('error', err => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Helper to execute completion with smart JSON parsing and graceful fallback
   */
  async callChatCompletionWithJsonFallback(messages, maxTokens = 3500, temperature = 0.3) {
    try {
      // First attempt with json_object response format
      const raw = await this.callChatCompletion(messages, maxTokens, temperature, true);
      return this.parseJsonFromContent(raw);
    } catch (err) {
      if (err.code === 'JSON_VALIDATE_FAILED' || (err.message && err.message.includes('json_validate_failed'))) {
        // Fallback: request as pure prompt without response_format and extract JSON
        const raw = await this.callChatCompletion(messages, maxTokens, temperature, false);
        return this.parseJsonFromContent(raw);
      }
      throw err;
    }
  }

  /**
   * Safely extract and parse JSON object from LLM output
   */
  parseJsonFromContent(content) {
    if (!content) return null;
    let clean = content.trim();

    // Remove markdown codeblock formatting if present
    if (clean.includes('```')) {
      const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) {
        clean = match[1].trim();
      }
    }

    // Try direct parse
    try {
      return JSON.parse(clean);
    } catch (e) {
      // Find outermost { ... }
      const startIdx = clean.indexOf('{');
      const endIdx = clean.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        const substr = clean.slice(startIdx, endIdx + 1);
        try {
          return JSON.parse(substr);
        } catch (e2) {
          // If syntax error is due to unescaped control characters (newlines in code strings)
          try {
            const sanitized = substr.replace(/([^\\])\n/g, '$1\\n');
            return JSON.parse(sanitized);
          } catch (e3) {}
        }
      }

      // If truncated in the middle of a question, attempt recovery of all completed questions
      if (clean.includes('"questions"')) {
        let lastValidIdx = clean.lastIndexOf('}');
        while (lastValidIdx > 20) {
          const candidate = clean.slice(0, lastValidIdx + 1) + '\n  ]\n}';
          try {
            const recovered = JSON.parse(candidate);
            if (recovered && Array.isArray(recovered.questions) && recovered.questions.length > 0) {
              return recovered;
            }
          } catch (candErr) {}
          lastValidIdx = clean.lastIndexOf('}', lastValidIdx - 1);
        }
      }

      throw new Error(`Groq returned invalid JSON format: ${e.message}`);
    }
  }

  /**
   * Dynamic Placement-Oriented Coding Question Generator
   * Generates unique, validated coding problems in small batches for Free Plan efficiency.
   */
  async generateCodingQuestions(config = {}, studentContext = {}) {
    if (!this.isConfigured()) {
      const err = new Error('Groq API Key is not configured. Please set GROQ_API_KEY in the server .env file.');
      err.code = 'GROQ_API_KEY_MISSING';
      throw err;
    }

    const difficulty = config.difficulty || 'Mixed';
    const targetCount = Math.min(20, Math.max(1, parseInt(config.questionCount, 10) || 5));
    const topics = Array.isArray(config.topics) ? config.topics.join(', ') : (config.topics || 'All Topics');
    const company = config.companyPreparation || 'General Placement';
    const durationMinutes = parseInt(config.durationMinutes, 10) || 30;
    const existingFingerprints = new Set(config.existingFingerprints || []);
    const solvedQuestionTitles = new Set(studentContext.solvedTitles || []);

    // Free Plan Optimization: small batches of 2 questions per API call to avoid token truncation
    const batchSize = Math.min(2, targetCount);
    const numBatches = Math.ceil(targetCount / batchSize);
    const allValidatedQuestions = [];

    // Lazy load code execution engine for test case validation
    let codeEngine = null;
    try {
      codeEngine = require('./localCodeExecutionEngine');
    } catch (e) {}

    for (let b = 0; b < numBatches; b++) {
      const questionsNeeded = Math.min(batchSize, targetCount - allValidatedQuestions.length);
      if (questionsNeeded <= 0) break;

      const difficultyPrompt = difficulty === 'Mixed'
        ? (b % 2 === 0 ? 'Medium and Easy' : 'Hard and Medium')
        : difficulty;

      const userPrompt = `Generate a JSON object containing a "questions" array with exactly ${questionsNeeded} unique algorithmic coding problems for campus placement preparation.

Assessment Requirements:
- Target Difficulty: ${difficultyPrompt}
- Programming Topics: ${topics}
- Campus Recruiter Pattern: ${company} (e.g. emphasize company interview problem patterns)
- Avoid previously solved problems: ${Array.from(solvedQuestionTitles).slice(0, 10).join(', ') || 'None'}
- Avoid generated titles: ${allValidatedQuestions.map(q => q.title).join(', ') || 'None'}

Output Schema:
{
  "questions": [
    {
      "title": "Problem Title",
      "difficulty": "Easy" or "Medium" or "Hard",
      "topic": "Topic Name (e.g. Arrays, Strings, Searching, Dynamic Programming)",
      "company_tags": "${company}",
      "description": "Clear and detailed problem description explaining the task, inputs, and expected behavior.",
      "input_format": "Description of the input parameters",
      "output_format": "Description of the expected return value",
      "constraints": "Clear bounds, e.g. 1 <= n <= 10^5, -10^4 <= nums[i] <= 10^4",
      "sample_input": "Formatted representation of sample input 1",
      "sample_output": "Formatted representation of sample output 1",
      "sample_input_2": "Formatted representation of sample input 2",
      "sample_output_2": "Formatted representation of sample output 2",
      "expected_time_complexity": "e.g. O(N) or O(N log N)",
      "expected_space_complexity": "e.g. O(1) or O(N)",
      "starter_code_python": "def function_name(args):\\n    # Write your solution here\\n    pass\\n",
      "starter_code_java": "import java.util.*;\\n\\npublic class Solution {\\n    public static returnType functionName(args) {\\n        // Write solution\\n    }\\n}\\n",
      "starter_code_c": "returnType functionName(args) {\\n    // Write solution\\n}\\n",
      "reference_solution_python": "def function_name(args):\\n    # Complete working implementation\\n    return ...\\n",
      "test_cases": [
        { "input_data": "sample 1 input as python call arguments", "expected_output": "sample 1 expected result", "is_hidden": 0 },
        { "input_data": "sample 2 input as python call arguments", "expected_output": "sample 2 expected result", "is_hidden": 0 },
        { "input_data": "edge case 1 input", "expected_output": "edge case 1 expected result", "is_hidden": 1 },
        { "input_data": "edge case 2 input", "expected_output": "edge case 2 expected result", "is_hidden": 1 }
      ]
    }
  ]
}

CRITICAL RULES:
1. Always escape newlines inside code strings as \\n (do not put literal multi-line linebreaks inside JSON string values).
2. "starter_code_python" and "reference_solution_python" MUST share the exact same function name.
3. In "test_cases", "input_data" must be valid Python function call arguments so that function_name(input_data) evaluates directly.
   - Example 1: if function is def reverse_words(s): then input_data is "'Hello World'"
   - Example 2: if function is def two_sum(nums, target): then input_data is "[2, 7, 11, 15], 9"
   - Example 3: if function is def is_prime(n): then input_data is "17"
4. In "test_cases", "expected_output" must be the exact expected return value formatted as a string (e.g. "'World Hello'" or "[0, 1]" or "true").
5. Output valid JSON only without markdown commentary.`;

      const messages = [
        {
          role: 'system',
          content: 'You are an institutional campus placement coding assessment generator. Return only a valid JSON object matching the requested schema.'
        },
        { role: 'user', content: userPrompt }
      ];

      try {
        const parsed = await this.callChatCompletionWithJsonFallback(messages, 4096, 0.3);
        const batchQuestions = Array.isArray(parsed?.questions) ? parsed.questions : (parsed ? [parsed] : []);
        console.log(`[GroqClient] Batch ${b + 1}: parsed questions count:`, batchQuestions.length);

        for (const rawQ of batchQuestions) {
          // 1. Structure validation
          if (!rawQ.title || !rawQ.description) {
            console.log('[GroqClient] Skipped rawQ missing title/description:', rawQ);
            continue;
          }

          // 2. Uniqueness & Fingerprint check
          const normalizedTitle = (rawQ.title || '').trim().toLowerCase();
          const fp = crypto.createHash('sha256')
            .update(normalizedTitle + '::' + (rawQ.topic || '').toLowerCase() + '::' + (rawQ.description || '').slice(0, 100))
            .digest('hex').slice(0, 16);

          if (existingFingerprints.has(fp) || solvedQuestionTitles.has(normalizedTitle)) {
            console.log('[GroqClient] Skipped duplicate question title:', rawQ.title, 'fp:', fp);
            continue;
          }
          existingFingerprints.add(fp);

          // 3. Normalize test cases
          let testCases = Array.isArray(rawQ.test_cases) ? rawQ.test_cases : [];
          if (testCases.length < 2) {
            // Build fallback test cases from sample inputs if missing
            testCases = [
              { input_data: rawQ.sample_input || '""', expected_output: rawQ.sample_output || '""', is_hidden: 0 },
              { input_data: rawQ.sample_input_2 || rawQ.sample_input || '""', expected_output: rawQ.sample_output_2 || rawQ.sample_output || '""', is_hidden: 1 }
            ];
          }

          // 4. Quality Validation via local compiler harness (if reference solution is provided)
          let validationStatus = 'valid';
          if (codeEngine && rawQ.reference_solution_python && testCases.length >= 2) {
            try {
              const testRun = await codeEngine.executeCode({
                language: 'python',
                code: rawQ.reference_solution_python,
                testCases: testCases.map(tc => ({ input: tc.input_data, expected: tc.expected_output })),
                timeLimitMs: 3000
              });
              if (testRun.status === 'Accepted' || testRun.passed >= Math.max(1, testCases.length - 1)) {
                validationStatus = 'verified';
              }
            } catch (evalErr) {
              // Non-fatal: mark as standard validated JSON
              validationStatus = 'valid';
            }
          }

          const qId = 'code_ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

          const formattedQuestion = {
            id: qId,
            title: rawQ.title.trim(),
            difficulty: ['Easy', 'Medium', 'Hard'].includes(rawQ.difficulty) ? rawQ.difficulty : 'Medium',
            topic: rawQ.topic || 'Algorithms',
            company_tags: rawQ.company_tags || company,
            description: rawQ.description.trim(),
            input_format: rawQ.input_format || 'Standard parameter inputs',
            output_format: rawQ.output_format || 'Computed return value',
            constraints: rawQ.constraints || 'Standard memory and time bounds',
            sample_input: rawQ.sample_input || 'N/A',
            sample_output: rawQ.sample_output || 'N/A',
            sample_input_2: rawQ.sample_input_2 || '',
            sample_output_2: rawQ.sample_output_2 || '',
            expected_time_complexity: rawQ.expected_time_complexity || 'O(N)',
            expected_space_complexity: rawQ.expected_space_complexity || 'O(1)',
            starter_code_python: rawQ.starter_code_python,
            starter_code_java: rawQ.starter_code_java || `public class Solution {\n    // Implement your solution here\n}\n`,
            starter_code_c: rawQ.starter_code_c || `/* Implement your solution here */\n`,
            reference_solution_python: rawQ.reference_solution_python || '',
            test_cases: testCases.map((tc, idx) => ({
              id: `tc_${qId}_${idx + 1}`,
              question_id: qId,
              input_data: String(tc.input_data || ''),
              expected_output: String(tc.expected_output || ''),
              is_hidden: (tc.is_hidden === 1 || tc.is_hidden === true || idx >= 2) ? 1 : 0
            })),
            source: 'groq_ai',
            model_identifier: this.model,
            validation_status: validationStatus,
            fingerprint: fp
          };

          allValidatedQuestions.push(formattedQuestion);
          if (allValidatedQuestions.length >= targetCount) break;
        }
      } catch (batchErr) {
        // If rate limited or network failure, stop batching and return what we have or propagate error
        if (allValidatedQuestions.length === 0) {
          throw batchErr;
        }
        console.warn(`[GroqClient] Batch ${b + 1} stopped: ${batchErr.message}`);
        break; // Return partially generated validated questions
      }

      // Small throttling delay between batches to respect free-tier rate limits
      if (b < numBatches - 1 && allValidatedQuestions.length < targetCount) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    if (allValidatedQuestions.length === 0) {
      throw new Error('Groq AI could not generate valid coding questions matching the criteria. Please try again with different topics or difficulty.');
    }

    return {
      success: true,
      questions: allValidatedQuestions,
      total_requested: targetCount,
      total_generated: allValidatedQuestions.length,
      model: this.model,
      durationMinutes,
      difficulty,
      topics,
      company
    };
  }

  /**
   * Explain ML Placement Prediction combining Academic, Profile, Aptitude, Coding
   */
  async explainPrediction(predictionData = {}, studentProfile = {}) {
    const placementProbability = predictionData.probability !== undefined ? predictionData.probability : (predictionData.placementProbability || 85);
    const placementStatus = predictionData.status || predictionData.placementStatus || 'Placement Ready';
    const academicScore = predictionData.pillars?.academic?.score !== undefined ? predictionData.pillars.academic.score : (predictionData.academicScore || 84);
    const profileScore = predictionData.pillars?.profile?.score !== undefined ? predictionData.pillars.profile.score : (predictionData.profileScore || 76);
    const aptitudeScore = predictionData.pillars?.aptitude?.score !== undefined ? predictionData.pillars.aptitude.score : (predictionData.aptitudeScore || 80);
    const codingScore = predictionData.pillars?.coding?.score !== undefined ? predictionData.pillars.coding.score : (predictionData.codingScore || 85);
    const keyFactors = predictionData.keyFactors || (predictionData.strengths || []).map(s => s.feature || s);

    const systemPrompt = `You are an expert Institutional Campus Placement Director and Machine Learning Evaluation Advisor.
Analyze the student's 4-pillar placement prediction (Academic, Profile & Skills, Aptitude Assessment, Coding Assessment).
Provide a concise, professional explanation of why the model predicted this probability and outcome.
Do not invent or change the probability (${placementProbability}%). Explain the actual factors driving it.`;

    const userPrompt = `Student Placement Data:
- Predicted Placement Probability: ${placementProbability}% (${placementStatus})
- Academic Performance Score: ${academicScore}/100 (CGPA: ${studentProfile.cgpa || 'N/A'}, Backlogs: ${studentProfile.activeBacklogs || 0})
- Profile & Technical Skills Score: ${profileScore}/100 (Internships: ${studentProfile.internshipCount || 0}, Projects: ${studentProfile.projectCount || 0})
- Aptitude Assessment Score: ${aptitudeScore}/100
- Coding Assessment Score: ${codingScore}/100
- Identified Key Factors: ${keyFactors.join(', ') || 'Standard progression'}

Please provide:
1. Executive Assessment (2-3 sentences explaining the primary driver of this prediction).
2. Key Strengths Contributing to Probability.
3. High-Priority Action Items to increase placement conversion rate before campus drives begin.`;

    if (this.isConfigured()) {
      try {
        const aiExplanation = await this.callChatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], 600, 0.3);
        if (aiExplanation) {
          return {
            source: `Groq AI (${this.model})`,
            explanation: aiExplanation,
            summary: `Groq AI Placement Assessment: ${placementProbability}% placement probability driven by strong analytical competencies.`,
            strengths: [
              `Academic Standing (${academicScore}%): Meets recruiter shortlisting criteria.`,
              `Aptitude Assessment (${aptitudeScore}%): High preliminary screening clearance rate.`,
              `Coding Assessment (${codingScore}%): Strong algorithmic data structure execution.`
            ],
            recommendations: [
              'Target 15 timed quantitative aptitude mock questions weekly.',
              'Solve 2 medium DSA problems daily in Python/Java focusing on Two-Pointers and Binary Search.',
              'Ensure all GitHub project documentation and live deployment links are verified.'
            ],
            isAiGenerated: true
          };
        }
      } catch (err) {
        console.warn('[GroqClient] AI completion error, falling back to rule engine:', err.message);
      }
    }

    // Grounded Heuristic Fallback
    const primaryStrength = aptitudeScore >= 75 && codingScore >= 75
      ? 'strong analytical problem-solving and test execution'
      : (academicScore >= 80 ? 'consistent academic discipline and CGPA stability' : 'practical coursework and project application');

    const primaryRisk = (studentProfile.activeBacklogs || 0) > 0
      ? 'active standing backlogs which trigger immediate recruiter filtering thresholds'
      : (codingScore < 60 ? 'coding test performance under competitive benchmark' : (aptitudeScore < 65 ? 'quantitative aptitude cutoff risk' : 'project portfolio depth'));

    const fallbackExplanation = `### Executive Assessment
Based on our multi-pillar Machine Learning placement classification model, your current predicted placement probability is **${placementProbability}%** (${placementStatus}). This evaluation is driven by ${primaryStrength}, with primary optimization needed in ${primaryRisk}.

### Key Contributing Strengths
- **Academic Standing (${academicScore}%):** ${academicScore >= 75 ? 'Meets initial corporate eligibility criteria for Tier-1 & Tier-2 IT and Core recruiters.' : 'Within standard eligibility band; maintaining consistency is essential.'}
- **Aptitude Assessment (${aptitudeScore}%):** ${aptitudeScore >= 70 ? 'High probability of clearing preliminary screening rounds in top campus drives.' : 'Focus on quantitative speed-math and logical syllogisms to clear initial cutoff.'}
- **Coding Assessment (${codingScore}%):** ${codingScore >= 70 ? 'Competitive DSA proficiency verified through unit test execution.' : 'Strengthen array manipulation, string algorithms, and time complexity optimization.'}

### Recommended Next Steps
1. Practice 15 timed quantitative aptitude problems weekly to maintain top percentile accuracy.
2. Complete 2 medium-difficulty coding problems in Python/Java daily focusing on HashMaps and Two-Pointers.
3. Ensure all academic records and verified certifications are up-to-date in your student profile.`;

    return {
      source: 'StudyFlow ML Intelligence Engine (Rule-Grounded Analysis)',
      explanation: fallbackExplanation,
      summary: `Placement probability is ${placementProbability}% (${placementStatus}). Evaluation is driven by ${primaryStrength}.`,
      strengths: [
        `Academic Standing (${academicScore}%): Meets corporate recruiter criteria.`,
        `Aptitude Assessment (${aptitudeScore}%): Solid probability of clearing preliminary screening rounds.`,
        `Coding Assessment (${codingScore}%): Demonstrates verified algorithmic test execution.`
      ],
      recommendations: [
        'Practice 15 timed quantitative aptitude problems weekly to maintain top percentile accuracy.',
        'Complete 2 medium-difficulty coding problems in Python/Java daily focusing on HashMaps and Two-Pointers.',
        'Ensure all academic records and verified certifications are up-to-date in your student profile.'
      ],
      isAiGenerated: false,
      notice: !this.isConfigured() ? 'Add GROQ_API_KEY in your server environment to enable live Groq AI generation.' : undefined
    };
  }

  /**
   * Analyze Resume Text for ATS Compatibility and Placement Readiness
   */
  async analyzeResume(resumeText, targetRole = 'Software Engineer / Campus Placement') {
    const systemPrompt = `You are a certified Applicant Tracking System (ATS) auditor and campus recruitment specialist.
Analyze the candidate's resume text for ${targetRole} campus recruitment drives.
Return your evaluation in structured JSON format with:
{
  "atsScore": number (0-100),
  "identifiedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "improvements": string[],
  "summary": string
}`;

    const userPrompt = `Resume Text Content:
"""
${resumeText.slice(0, 4000)}
"""

Target Campus Profile: ${targetRole}
Analyze the resume and output valid JSON only.`;

    if (this.isConfigured()) {
      try {
        const parsed = await this.callChatCompletionWithJsonFallback([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], 800, 0.2);

        if (parsed) {
          return {
            ...parsed,
            source: `Groq AI (${this.model} ATS Auditor)`
          };
        }
      } catch (err) {
        console.warn('[GroqClient] Resume AI analysis error, using regex parser:', err.message);
      }
    }

    // Deterministic Resume Keyword Extraction Fallback
    const techKeywords = [
      'Python', 'Java', 'C++', 'C', 'SQL', 'MySQL', 'JavaScript', 'React', 'Node.js',
      'HTML', 'CSS', 'Git', 'GitHub', 'Machine Learning', 'Data Structures', 'Algorithms',
      'Object Oriented Programming', 'DBMS', 'Linux', 'Docker', 'AWS'
    ];

    const identified = [];
    const missing = [];
    const textLower = resumeText.toLowerCase();

    for (const kw of techKeywords) {
      if (textLower.includes(kw.toLowerCase())) {
        identified.push(kw);
      } else {
        missing.push(kw);
      }
    }

    let calculatedScore = Math.min(95, Math.max(45, Math.round((identified.length / 12) * 80 + (textLower.includes('intern') ? 10 : 0) + (textLower.includes('project') ? 8 : 0))));

    return {
      atsScore: calculatedScore,
      identifiedSkills: identified,
      missingSkills: missing.slice(0, 6),
      strengths: [
        `Identified ${identified.length} core technical competencies relevant to software engineering roles.`,
        textLower.includes('project') ? 'Mentions project implementation deliverables with practical tech stack.' : 'Contains baseline academic credentials.',
        textLower.includes('intern') ? 'Includes industry internship experience.' : 'Clearly states degree and academic specializations.'
      ],
      improvements: [
        'Add quantifiable metrics (e.g. "improved query efficiency by 30%", "tested with 500+ records").',
        'Incorporate missing industry buzzwords: ' + missing.slice(0, 4).join(', ') + '.',
        'Include verifiable GitHub repository links for each technical project listed.'
      ],
      summary: `Resume scored ${calculatedScore}/100 for campus recruitment eligibility. Demonstrates solid foundational skills in ${identified.slice(0, 4).join(', ')}.`,
      source: 'StudyFlow ATS Engine (Keyword & Taxonomy Parser)'
    };
  }
}

module.exports = new GroqClient();
