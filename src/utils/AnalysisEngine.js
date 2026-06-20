/**
 * AI Resume Analyzer - Analysis Engine
 * Supports local heuristics analysis (no key) and live Gemini API analysis.
 */

// Preset target companies and their engineering culture / expectations
export const COMPANY_PROFILES = {
  Google: {
    name: 'Google',
    seniorPersona: 'Principal Software Engineer (L8)',
    culture: 'Highly algorithmic, engineering excellence, massive scale, deep technical depth, and monorepo structure. Emphasizes distributed systems design, data structures, and cross-team alignment.',
    interviewFocus: 'Focuses on coding (algorithms, time/space complexity) and System Design at scale. Google looks for "Googlyness" (collaborative, thrives in ambiguity) and solid architectural reasoning.',
    techKeywords: ['distributed systems', 'mapreduce', 'protobuf', 'grpc', 'kubernetes', 'golang', 'java', 'c++', 'scalability', 'algorithms', 'concurrency']
  },
  Apple: {
    name: 'Apple',
    seniorPersona: 'Senior Staff Engineer (ICT5/ICT6)',
    culture: 'Extreme attention to detail, privacy-focused, cross-functional collaboration, clean API boundaries, and product perfection. High emphasis on memory safety, optimization, and system responsiveness.',
    interviewFocus: 'Checks for strong coding fundamentals, deep platform knowledge (iOS, macOS, CoreOS, or specific Web technologies), concurrency, memory optimization, and strict product-oriented design decisions.',
    techKeywords: ['swift', 'objective-c', 'c++', 'performance optimization', 'metal', 'security', 'privacy', 'memory management', 'apis', 'cocoa', 'firmware']
  },
  Netflix: {
    name: 'Netflix',
    seniorPersona: 'Principal Engineer (L7)',
    culture: 'Freedom and Responsibility (F&R) framework. High ownership, high compensation, bias for action, and zero tolerance for micro-management. Focuses on cloud-native architecture, resilience (chaos engineering), and high observability.',
    interviewFocus: 'Heavy emphasis on culture fit, high-level system design, decision-making under uncertainty, handling huge traffic volume, observability, and concrete architectural trade-offs.',
    techKeywords: ['chaos engineering', 'aws', 'microservices', 'cassandra', 'kafka', 'java', 'nodejs', 'cdn', 'observability', 'metrics', 'resilience', 'scale']
  },
  Stripe: {
    name: 'Stripe',
    seniorPersona: 'Staff Engineer (L6)',
    culture: 'Developer experience (DX) first, clean API design, rigorous writing culture, precision, and bulletproof reliability. Engineering is treated as craft, requiring highly readable, idiomatic code.',
    interviewFocus: 'Strong practical coding test, API design evaluations (very detailed), system reliability, payment processing safety, and clear, written technical communication.',
    techKeywords: ['ruby', 'typescript', 'golang', 'api design', 'developer experience', 'dx', 'idempotency', 'distributed databases', 'reliability', 'security', 'fintech']
  },
  Meta: {
    name: 'Meta',
    seniorPersona: 'Production Engineering / Staff Engineer (E7)',
    culture: 'Ship fast, focus on high-impact work, developer efficiency, and product-mindedness. High scale but with extreme iteration speed. Focuses on horizontal scale and quick product rollouts.',
    interviewFocus: 'System design (horizontal scalability), coding speed, product sense, infrastructure tooling, and a strong track record of launching features to billions of users.',
    techKeywords: ['react', 'graphql', 'hack', 'php', 'distributed systems', 'efficiency', 'ab testing', 'telemetry', 'scale', 'product engineering', 'systems programming']
  }
};

// Preset default Job Roles
export const PRESET_ROLES = [
  { id: 'fullstack', title: 'Senior Full Stack Engineer' },
  { id: 'backend', title: 'Senior Backend Engineer (Distributed Systems)' },
  { id: 'frontend', title: 'Staff Frontend Engineer (UI Infrastructure)' },
  { id: 'ai-ml', title: 'Senior AI/ML Systems Engineer' },
  { id: 'site-reliability', title: 'Senior Site Reliability Engineer (SRE)' }
];

/**
 * Local Heuristics Analysis
 * Parses inputs and outputs a simulated report
 */
export function analyzeLocalHeuristics(resumeText, jobDescription, companyKey) {
  const company = COMPANY_PROFILES[companyKey] || COMPANY_PROFILES.Google;
  const lowerResume = (resumeText || '').toLowerCase();
  const lowerJD = (jobDescription || '').toLowerCase();

  // Match resume against company keywords
  const matchedCompanyKeywords = company.techKeywords.filter(keyword => 
    lowerResume.includes(keyword)
  );

  // Match resume against job description terms to calculate score
  const jdKeywords = ['react', 'vue', 'angular', 'node', 'express', 'nest', 'django', 'python', 'go', 'golang', 'rust', 'java', 'spring', 'c++', 'sql', 'postgres', 'mysql', 'mongodb', 'redis', 'kafka', 'rabbitmq', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'git', 'testing', 'jest', 'cypress', 'graphql', 'rest', 'microservices', 'system design', 'distributed', 'security', 'oauth', 'performance', 'optimization', 'monitoring', 'prometheus', 'grafana'];
  
  const matchedJdKeywords = jdKeywords.filter(keyword => 
    lowerJD.includes(keyword) && lowerResume.includes(keyword)
  );

  const missingJdKeywords = jdKeywords.filter(keyword => 
    lowerJD.includes(keyword) && !lowerResume.includes(keyword)
  );

  // Score Calculation logic (base score + matching multipliers)
  let baseScore = 65;
  if (lowerResume.length > 500) baseScore += 5;
  baseScore += Math.min(matchedJdKeywords.length * 2, 20);
  baseScore += Math.min(matchedCompanyKeywords.length * 1.5, 10);
  
  // Cap score between 45 and 96
  const finalScore = Math.max(45, Math.min(baseScore, 96));

  // Determine Verdict
  let verdict = 'Needs Optimization';
  if (finalScore >= 80) verdict = 'Strong Match';
  else if (finalScore >= 65) verdict = 'Moderate Match';

  // Build Senior Engineer Persona letter
  const personaLetter = `Hey there,

As a ${company.seniorPersona} here at ${company.name}, I spent some time reviewing your resume against the target role. 

Your technical background shows some solid foundation, particularly with ${matchedJdKeywords.slice(0, 3).join(', ') || 'your core coding stack'}. However, evaluating this from our senior rubrics, I noticed a few gaps. At ${company.name}, we don't just look for developers who write code—we need engineers who understand systemic impacts, scalability trade-offs, and how to operate independently under high levels of ambiguity.

Your experiences with ${matchedCompanyKeywords.slice(0, 2).join(', ') || 'deployment pipelines'} show promise, but to compete for a senior position here, you really need to emphasize *quantifiable architectural impact*. Tell me *how much* you improved latency, how many concurrent users your system supported, or how you negotiated technical debt with product leads. 

Review the list of improvements and missing keywords I compiled below. Let's get these refined so you stand out in the pile.

Best,
The ${company.name} Engineering Team`;

  // Build Dynamic suggestions
  const suggestions = [
    'Add concrete business and performance metrics to your bullet points (e.g. latency reduced by X%, cloud spend reduced by Y%).',
    `Deepen descriptions of system design decisions, highlighting why you chose specific architectural patterns (e.g., Redis caching layer instead of direct DB calls).`,
    'Rework your intro/summary section to lead with leadership, technical ownership, and mentor roles.'
  ];

  if (matchedCompanyKeywords.length < 3) {
    suggestions.push(`Integrate keywords matching ${company.name}'s engineering DNA, specifically terms like: ${company.techKeywords.slice(0, 4).join(', ')}.`);
  }

  // Missing components
  const missingParts = [
    ...missingJdKeywords.slice(0, 3).map(k => `${k.toUpperCase()} integration details`),
    'Explicit system scalability metrics (e.g., scale of database, QPS, user base)',
    'Experience leading cross-functional alignment or mentoring junior engineers'
  ];

  // Resume bullet diff optimizer
  const originalBullet = "Responsible for building the user dashboard and setting up APIs.";
  const optimizedBullet = `Engineered a scalable user dashboard and optimized core REST APIs utilizing Node.js and Redis cache, decreasing initial load times by 38% and accommodating a 2.5x surge in concurrent user traffic.`;

  return {
    score: finalScore,
    verdict,
    summary: personaLetter,
    suggestions,
    missingParts,
    companyPrep: {
      culture: company.culture,
      interviewPrep: company.interviewFocus
    },
    resumeDiff: {
      original: originalBullet,
      optimized: optimizedBullet
    }
  };
}

/**
 * Gemini Live API Analysis
 */
export async function analyzeWithGemini(resumeText, jobDescription, companyKey, apiKey) {
  const company = COMPANY_PROFILES[companyKey] || COMPANY_PROFILES.Google;
  
  const prompt = `
You are a highly respected ${company.seniorPersona} at ${company.name}.
Analyze this candidate's resume for the following job description under the culture of ${company.name}.
You must evaluate their experience strictly from the perspective of a top senior engineer of this company, giving candid, high-level, and accurate professional feedback.

RESUME TEXT:
"""
${resumeText}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription}
"""

TARGET COMPANY DETAILS:
- Name: ${company.name}
- Persona: ${company.seniorPersona}
- Culture Profile: ${company.culture}
- Interview Expectations: ${company.interviewFocus}

You must return a single JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Return ONLY the raw JSON string matching this exact structure:
{
  "score": <integer score between 1 and 100 based on how well they fit the senior standards of ${company.name}>,
  "verdict": "<'Strong Match', 'Moderate Match', or 'Needs Optimization'>",
  "summary": "<Candid, professional assessment review letter written in the first person as the ${company.seniorPersona} of ${company.name}. Be detailed, direct, constructive, and sound like a seasoned developer. Address their specific resume highlights and deficits.>",
  "suggestions": [
    "<detailed improvement suggestion 1>",
    "<detailed improvement suggestion 2>",
    "<detailed improvement suggestion 3>"
  ],
  "missingParts": [
    "<specific tech stack, architectural detail, or leadership detail missing based on the JD or company culture>",
    "<another missing detail>"
  ],
  "companyPrep": {
    "culture": "<Short summary of the company culture relevant to this analysis>",
    "interviewPrep": "<Specific advice on how to pass the technical/system design loop at this company for this role>"
  },
  "resumeDiff": {
    "original": "<An actual weak bullet point extracted from the candidate's resume or a simulated representation of a weak area>",
    "optimized": "<How a top Senior Engineer at ${company.name} would rewrite that exact bullet point, showing quantifiable impact, scale, and senior-level ownership>"
  }
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.contents[0].parts[0].text;
    
    // Parse response
    const parsedData = JSON.parse(responseText.trim());
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
