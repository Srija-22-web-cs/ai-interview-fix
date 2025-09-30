import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // The ID of the candidate currently active in the Interviewee tab
  activeCandidateId: null,
  // Dictionary of all candidates for quick lookup and persistence
  candidates: {},
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    // 1. Initial Candidate Setup (after resume upload)
    startNewSession: (state, action) => {
      const newId = Date.now().toString();
      state.activeCandidateId = newId;
      state.candidates[newId] = {
        id: newId,
        profile: action.payload.profile, // { name, email, phone }
        history: [], // [{ qId, question, answer, score, critique, level, timeLimit }]
        status: 'in-progress', // 'in-progress', 'paused', 'completed'
        progress: 0, // Current question index (0 to 5)
        finalScore: null,
        summary: null,
        lastActive: Date.now(), // For sorting in the dashboard
      };
    },
    // 2. Update Profile Fields (for missing data)
    updateProfile: (state, action) => {
      const { id, field, value } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].profile[field] = value;
      }
    },
    // 3. Record Answer and Score
    recordAnswer: (state, action) => {
      const { id, answerData } = action.payload;
      const candidate = state.candidates[id];
      if (candidate && candidate.status === 'in-progress') {
        candidate.history.push(answerData);
        candidate.progress += 1; // Move to the next question
        candidate.lastActive = Date.now();
      }
    },
    // 4. Finalize Interview
    completeInterview: (state, action) => {
      const { id, finalScore, summary } = action.payload;
      const candidate = state.candidates[id];
      if (candidate) {
        candidate.status = 'completed';
        candidate.finalScore = finalScore;
        candidate.summary = summary;
      }
    },
    // 5. Pause/Resume Session
    pauseSession: (state) => {
      // Pause the session if it's currently running
      if (state.activeCandidateId && state.candidates[state.activeCandidateId]?.status === 'in-progress') {
        state.candidates[state.activeCandidateId].status = 'paused';
      }
    },
    resumeSession: (state, action) => {
      // Resume the session by setting it to 'in-progress' and making it active
      const { id } = action.payload;
      if (state.candidates[id] && state.candidates[id].status === 'paused') {
        state.activeCandidateId = id;
        state.candidates[id].status = 'in-progress';
      }
    },
    // 6. Utility for cleanup/start new
    clearActiveSession: (state) => {
      state.activeCandidateId = null;
    }
  },
});

export const {
  startNewSession,
  updateProfile,
  recordAnswer,
  completeInterview,
  pauseSession,
  resumeSession,
  clearActiveSession,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
