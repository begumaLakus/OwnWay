import api from '../screens/api';
import { personalityQuestions } from '../data/questions';

/**
 * RIASEC kategori puanlarını backend'in beklediği alan adlarına dönüştürür.
 */
export function computeRiasecPayload(answers, questions = personalityQuestions) {
  const categoryScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  questions.forEach((q) => {
    categoryScores[q.category] += answers[q.id] || 0;
  });

  return {
    realistic: categoryScores.R,
    investigative: categoryScores.I,
    artistic: categoryScores.A,
    social: categoryScores.S,
    enterprising: categoryScores.E,
    conventional: categoryScores.C,
  };
}

export function extractTopCareers(apiData) {
  const { core = [], alternatives = [] } = apiData || {};
  return [...core, ...alternatives].slice(0, 3);
}

export async function submitCareerTest(answers, token) {
  const payload = computeRiasecPayload(answers);

  const response = await api.post('/career/submit-test', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.data?.success) {
    throw new Error(response.data?.error || response.data?.message || 'Test gönderilemedi');
  }

  return {
    ...response.data.data,
    topCareers: extractTopCareers(response.data.data),
  };
}
