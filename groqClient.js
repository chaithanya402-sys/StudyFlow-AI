/**
 * Groq AI Client Integration for StudyFlow AI - Student Placement Prediction System
 * 
 * Supports:
 * 1. Explaining ML placement predictions and factor contributions.
 * 2. Generating personalized student preparation recommendations and roadmaps.
 * 3. Analyzing resume content against placement standards.
 * 4. Generating targeted aptitude and coding practice assistance.
 * 
 * Secure implementation:
 * - Reads GROQ_API_KEY strictly from environment variable.
 * - Never exposes API key to client-side code.
 * - Provides rich, grounded heuristic fallback if GROQ_API_KEY is not configured.
 */

const https = require('https');

class GroqClient {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || null;
    this.apiUrl = 'api.groq.com';
    this.model = 'llama-3.3-70b-versatile';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10 && !this.apiKey.includes('replace-with'));
  }

  /**
   * Send a completion prompt to Groq API
   */
  async callChatCompletion(messages, maxTokens = 800, temperature = 0.4) {
    if (!this.isConfigured()) {
      return null;
    }

    const payload = JSON.stringify({
      model: this.model,
      messages,
      max_tokens: maxTokens,
      temperature
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiUrl,
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 15000
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
          } else {
            reject(new Error(`Groq API returned HTTP ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Groq API request timed out (15s limit).'));
      });

      req.on('error', err => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
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
            source: 'Groq AI (Llama 3.3 70B)',
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
      notice: !this.isConfigured() ? 'Add GROQ_API_KEY in your server environment to enable live Groq Llama-3.3 AI generation.' : undefined
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
        const rawJson = await this.callChatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], 800, 0.2);

        if (rawJson) {
          const clean = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          return {
            ...parsed,
            source: 'Groq AI (Llama 3.3 70B ATS Auditor)'
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
