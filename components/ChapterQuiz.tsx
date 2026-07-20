"use client";

import { useState } from "react";
import type { QuizQ } from "@/lib/recap";

// Self-check quiz: pick an answer, get instant feedback plus the reasoning.
// No score, no storage — the point is understanding, not grading.
function Question({ item, num }: { item: QuizQ; num: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="quiz-q">
      <p className="qq-text">
        <span className="qq-num">{num}</span>
        {item.q}
      </p>
      <div className="qq-opts">
        {item.options.map((opt, i) => {
          const isAnswer = i === item.answer;
          const state = !answered
            ? ""
            : isAnswer
              ? " correct"
              : i === picked
                ? " wrong"
                : " dim";
          return (
            <button
              type="button"
              className={`quiz-opt${state}`}
              key={i}
              onClick={() => setPicked(i)}
              disabled={answered}
            >
              <span className="qo-mark" aria-hidden>
                {answered && isAnswer ? "✓" : answered && i === picked ? "✕" : ""}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="quiz-why">
          <strong>{picked === item.answer ? "בדיוק." : "לא בדיוק."}</strong> {item.why}
        </p>
      )}
    </div>
  );
}

export default function ChapterQuiz({ quiz }: { quiz: QuizQ[] }) {
  return (
    <div className="quiz">
      {quiz.map((item, i) => (
        <Question key={i} item={item} num={i + 1} />
      ))}
    </div>
  );
}
