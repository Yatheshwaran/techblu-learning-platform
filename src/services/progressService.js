import { supabase } from "../lib/supabaseClient";

// Convert language + question index into a unique question ID
export function getQuestionId(language, index) {
  const offsets = {
    python: 0,
    javascript: 10,
    java: 20,
    cpp: 30,
    c: 40,
  };

  return offsets[language] + index + 1;
}

// Convert language + index into the key used by the frontend
export function getProgressKey(language, index) {
  return `${language}-${index}`;
}

// Load logged-in user's completed questions
export async function loadUserProgress(userId) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("question_id, completed")
    .eq("user_id", userId)
    .eq("completed", true);

  if (error) {
    throw error;
  }

  const progress = {};

  data.forEach((row) => {
    progress[row.question_id] = true;
  });

  return progress;
}

// Save a completed question
export async function saveQuestionProgress(userId, questionId) {
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,question_id",
      }
    );

  if (error) {
    throw error;
  }
}