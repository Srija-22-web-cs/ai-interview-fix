export const ROLE_TITLE = 'Full Stack Developer (React/Node)';

export const INTERVIEW_SETTINGS = [
  // Timer: Easy 20 seconds
  { level: 'Easy', count: 2, timeLimit: 20 }, 
  // Timer: Medium 60 seconds
  { level: 'Medium', count: 2, timeLimit: 60 },
  // Timer: Hard 120 seconds
  { level: 'Hard', count: 2, timeLimit: 120 },
];

export const TOTAL_QUESTIONS = INTERVIEW_SETTINGS.reduce((sum, item) => sum + item.count, 0);

export const REQUIRED_PROFILE_FIELDS = ['name', 'email', 'phone'];

// Placeholder questions for the MOCK interview logic
export const MOCK_QUESTIONS = [
  { id: 1, level: 'Easy', text: 'What is the purpose of the virtual DOM in React and how does it improve performance?' },
  { id: 2, level: 'Easy', text: 'Explain the difference between `let`, `const`, and `var` in JavaScript.' },
  { id: 3, level: 'Medium', text: 'Describe a real-world use case for React Hooks like `useEffect` or `useCallback` and their dependency arrays.' },
  { id: 4, level: 'Medium', text: 'How do you handle asynchronous operations in Node.js, and what is the advantage of using Promises/async-await over traditional callbacks?' },
  { id: 5, level: 'Hard', text: 'Design a high-level schema for a social media feed and explain how you would optimize database queries for read performance.' },
  { id: 6, level: 'Hard', text: 'Discuss the concept of event loop blocking in Node.js and provide strategies to prevent it in a high-traffic server.' },
];
