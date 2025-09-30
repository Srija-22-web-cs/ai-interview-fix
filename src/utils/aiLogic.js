import { MOCK_QUESTIONS, INTERVIEW_SETTINGS, TOTAL_QUESTIONS } from './constants';

/**
 * Finds the next question based on the current progress index.
 * @param {number} currentQIndex - The index of the question to retrieve (0 to TOTAL_QUESTIONS - 1).
 */
export const getNextQuestion = (currentQIndex) => {
  if (currentQIndex >= TOTAL_QUESTIONS) {
    return null; // Interview complete
  }
  
  const question = MOCK_QUESTIONS[currentQIndex];
  
  // Find the corresponding time limit from constants
  const setting = INTERVIEW_SETTINGS.find(s => s.level === question.level);
  
  return {
    ...question,
    // Safely assign time limit, defaulting to 60s if config is missing
    timeLimit: setting ? setting.timeLimit : 60, 
  };
};

/**
 * Mocks the AI judging an answer and generating a score (0-10) and critique.
 * @param {string} question - The question asked.
 * @param {string} answer - The candidate's answer.
 * @param {string} level - The difficulty level (Easy, Medium, Hard).
 */
export const judgeAnswer = async (question, answer, level) => {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 800)); 

    // MOCK SCORING LOGIC: Score is heavily based on answer length and difficulty
    const answerLength = answer.length;
    let baseScore = 0;
    
    if (level === 'Easy') {
        baseScore = answerLength > 20 ? 8 : (answerLength > 5 ? 5 : 2);
    } else if (level === 'Medium') {
        baseScore = answerLength > 50 ? 7 : (answerLength > 15 ? 4 : 1);
    } else { // Hard
        baseScore = answerLength > 80 ? 9 : (answerLength > 30 ? 5 : 1);
    }
    
    // Introduce slight randomness for score variance (0-10)
    const score = Math.min(10, Math.max(0, Math.floor(baseScore + (Math.random() * 2 - 1))));

    let critique = '';
    if (score >= 9) {
        critique = 'Outstanding and detailed response. Excellent technical grasp.';
    } else if (score >= 7) {
        critique = 'Solid answer, demonstrated good knowledge but could benefit from more specific examples.';
    } else if (score >= 4) {
        critique = 'A reasonable attempt, but the core concept was partially missed or the answer was too brief.';
    } else {
        critique = 'Answer was very minimal or incorrect. Requires fundamental review of the topic.';
    }

    return { score, critique };
};

/**
 * Mocks the AI calculating the final score and summary.
 * @param {Array<Object>} history - The full history of the candidate's answers and scores.
 */
export const calculateFinalResult = (history) => {
  const totalScore = history.reduce((sum, item) => sum + item.score, 0);
  const maxPossibleScore = history.length * 10;
  const finalScore = Math.round((totalScore / maxPossibleScore) * 100);

  // MOCK SUMMARY LOGIC
  let performanceLevel;
  let focusAreas;
  
  if (finalScore >= 80) {
      performanceLevel = 'Exceptional';
      focusAreas = 'Strong across all areas, particularly Node.js optimization and React architecture.';
  } else if (finalScore >= 60) {
      performanceLevel = 'Good';
      focusAreas = 'Demonstrated solid understanding of React fundamentals, but struggled slightly with Hard-level backend concepts.';
  } else if (finalScore >= 40) {
      performanceLevel = 'Average';
      focusAreas = 'Inconsistent performance. Core concepts understood, but advanced knowledge is lacking in both React and Node.';
  } else {
      performanceLevel = 'Below Average';
      focusAreas = 'Requires significant review of full stack principles and technical depth.';
  }


  const summary = `Candidate performance level: **${performanceLevel}** (${finalScore}%). They exhibited a total score of ${totalScore} out of ${maxPossibleScore} points. Focus Areas: ${focusAreas}`;

  return { finalScore, summary };
};
