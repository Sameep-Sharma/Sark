"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { CheckCircle2, Circle, FilePenLine, ImageUp, Plus, Save, Trash2 } from "lucide-react";
import { SmoothInput } from "@/components/ui/smooth-input";

import type { QuizQuestionWithAnswer, ResultInvite } from "@/lib/quiz/types";

type AdminQuiz = {
  id: string;
  name: string;
  config: {
    title: string;
    description: string;
    duration: string;
    durationSeconds: number;
    startsAt: string;
    rules: string[];
    highlights: Array<{ label: string; value: string }>;
  };
  questions: QuizQuestionWithAnswer[];
  resultInvite: ResultInvite;
  isActive: boolean;
};

type QuizPanelProps = {
  initialQuizzes: AdminQuiz[];
};

const emptyQuiz: Omit<AdminQuiz, "id"> = {
  name: "",
  config: {
    title: "",
    description: "",
    duration: "18 min",
    durationSeconds: 1080,
    startsAt: toDateTimeInputValue(new Date().toISOString()),
    rules: ["Answer every question before final submission."],
    highlights: [],
  },
  questions: [
    {
      id: "question-1",
      category: "General",
      difficulty: "Core",
      prompt: "",
      description: "",
      options: [
        { id: "a", label: "" },
        { id: "b", label: "" },
        { id: "c", label: "" },
        { id: "d", label: "" },
      ],
      answer: "a",
    },
  ],
  resultInvite: {
    title: "",
    description: "",
    image: false,
  },
  isActive: false,
};

export function QuizPanel({ initialQuizzes }: QuizPanelProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [editingId, setEditingId] = useState<string | null>(initialQuizzes[0]?.id ?? null);
  const [draft, setDraft] = useState<Omit<AdminQuiz, "id">>(() => cloneQuiz(initialQuizzes[0] ?? emptyQuiz));
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingQuiz = useMemo(() => quizzes.find((quiz) => quiz.id === editingId), [editingId, quizzes]);
  const durationMinutes = Math.max(1, Math.round(draft.config.durationSeconds / 60));

  function startNewQuiz() {
    setEditingId(null);
    setDraft(cloneQuiz(emptyQuiz));
    setMessage(null);
  }

  function editQuiz(quiz: AdminQuiz) {
    setEditingId(quiz.id);
    setDraft(cloneQuiz(quiz));
    setMessage(null);
  }

  async function refreshQuizzes() {
    const response = await fetch("/api/admin/quizzes", { cache: "no-store" });
    const result = (await response.json()) as { ok: boolean; quizzes?: AdminQuiz[]; message?: string };

    if (!response.ok || !result.ok || !result.quizzes) {
      throw new Error(result.message ?? "Unable to refresh quizzes.");
    }

    setQuizzes(result.quizzes);
    return result.quizzes;
  }

  async function saveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(editingId ? `/api/admin/quizzes/${editingId}` : "/api/admin/quizzes", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializeDraft(draft)),
      });
      const result = (await response.json()) as { ok: boolean; quizId?: string; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to save quiz.");
      }

      const nextQuizzes = await refreshQuizzes();
      const nextId = editingId ?? result.quizId ?? nextQuizzes[0]?.id ?? null;
      const savedQuiz = nextQuizzes.find((quiz) => quiz.id === nextId);

      setEditingId(nextId);
      if (savedQuiz) {
        setDraft(cloneQuiz(savedQuiz));
      }
      setMessage("Quiz saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save quiz.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(quiz: AdminQuiz) {
    setActiveUpdatingId(quiz.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !quiz.isActive }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to update active quiz.");
      }

      const nextQuizzes = await refreshQuizzes();
      const nextEditing = nextQuizzes.find((item) => item.id === editingId);

      if (nextEditing) {
        setDraft(cloneQuiz(nextEditing));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update active quiz.");
    } finally {
      setActiveUpdatingId(null);
    }
  }

  async function deleteQuiz(quiz: AdminQuiz) {
    if (!window.confirm(`Delete "${quiz.name}" and its leaderboard entries?`)) {
      return;
    }

    setDeletingId(quiz.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/quizzes/${quiz.id}`, { method: "DELETE" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to delete quiz.");
      }

      const nextQuizzes = await refreshQuizzes();
      const nextQuiz = nextQuizzes[0] ?? null;
      setEditingId(nextQuiz?.id ?? null);
      setDraft(cloneQuiz(nextQuiz ?? emptyQuiz));
      setMessage("Quiz deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete quiz.");
    } finally {
      setDeletingId(null);
    }
  }

  function updateQuestion(index: number, updates: Partial<QuizQuestionWithAnswer>) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...updates } : question,
      ),
    }));
  }

  function updateOption(questionIndex: number, optionIndex: number, label: string) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex
          ? {
            ...question,
            options: question.options.map((option, itemIndex) => (itemIndex === optionIndex ? { ...option, label } : option)),
          }
          : question,
      ),
    }));
  }

  function updateDurationMinutes(value: string) {
    const minutes = Math.max(1, Number(value) || 1);

    setDraft((current) => ({
      ...current,
      config: {
        ...current.config,
        duration: `${minutes} min`,
        durationSeconds: Math.round(minutes * 60),
      },
    }));
  }

  async function uploadInviteImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    const image = await readFileAsDataUrl(file);
    setDraft((current) => ({ ...current, resultInvite: { ...current.resultInvite, image } }));
    setMessage(null);
  }

  function addQuestion() {
    setDraft((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          ...emptyQuiz.questions[0],
          id: `question-${current.questions.length + 1}`,
          options: emptyQuiz.questions[0].options.map((option) => ({ ...option })),
        },
      ],
    }));
  }

  function removeQuestion(index: number) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.filter((_question, questionIndex) => questionIndex !== index),
    }));
  }

  return (
    <section className="admin-quiz-panel" id="quiz-panel">
      <div className="admin-section-heading">
        <div>
          <p>Quiz panel</p>
          <h2>Create, edit, and activate quizzes</h2>
        </div>
        <button type="button" className="quiz-secondary-button" onClick={startNewQuiz}>
          <Plus />
          New quiz
        </button>
      </div>

      <div className="admin-quiz-grid">
        <aside className="admin-quiz-list" aria-label="Existing quizzes">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <article key={quiz.id} className={quiz.id === editingId ? "is-selected" : ""}>
                <button type="button" onClick={() => editQuiz(quiz)}>
                  <FilePenLine />
                  <span>
                    <strong>{quiz.name}</strong>
                    <small>{quiz.questions.length} questions</small>
                  </span>
                </button>
                <div className="admin-quiz-row-actions">
                  <button
                    type="button"
                    className={`admin-active-toggle ${quiz.isActive ? "is-active" : ""}`}
                    onClick={() => void toggleActive(quiz)}
                    disabled={activeUpdatingId === quiz.id}
                    aria-pressed={quiz.isActive}
                  >
                    {quiz.isActive ? <CheckCircle2 /> : <Circle />}
                    {quiz.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    className="admin-delete-button"
                    onClick={() => void deleteQuiz(quiz)}
                    disabled={deletingId === quiz.id}
                    aria-label={`Delete ${quiz.name}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-empty-state">No quizzes have been added yet.</p>
          )}
        </aside>

        <form className="admin-quiz-editor" onSubmit={saveQuiz}>
          <div className="admin-editor-title">
            <div>
              <p>{editingQuiz ? "Editing quiz" : "New quiz"}</p>
              <h3>{draft.name || "Untitled quiz"}</h3>
            </div>
            <label className="admin-inline-toggle">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Make active after save
            </label>
          </div>

          <div className="admin-form-grid">
            <Field label="Quiz name" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} />
            <Field
              label="Title"
              value={draft.config.title}
              onChange={(value) => setDraft((current) => ({ ...current, config: { ...current.config, title: value } }))}
            />
            <Field label="Duration minutes" type="number" value={String(durationMinutes)} onChange={updateDurationMinutes} />
            <Field
              label="Start date and time"
              type="datetime-local"
              value={draft.config.startsAt}
              onChange={(value) => setDraft((current) => ({ ...current, config: { ...current.config, startsAt: value } }))}
            />
          </div>

          <label className="admin-field admin-field--wide">
            <span>Description</span>
            <textarea
              value={draft.config.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, config: { ...current.config, description: event.target.value } }))
              }
            />
          </label>

          <label className="admin-field admin-field--wide">
            <span>Rules, one per line</span>
            <textarea
              value={draft.config.rules.join("\n")}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  config: { ...current.config, rules: event.target.value.split("\n").map((rule) => rule.trim()).filter(Boolean) },
                }))
              }
            />
          </label>

          <div className="admin-form-grid">
            <Field
              label="Result invite title"
              value={draft.resultInvite.title}
              onChange={(value) => setDraft((current) => ({ ...current, resultInvite: { ...current.resultInvite, title: value } }))}
            />
            <Field
              label="Result invite description"
              value={draft.resultInvite.description}
              onChange={(value) =>
                setDraft((current) => ({ ...current, resultInvite: { ...current.resultInvite, description: value } }))
              }
            />
          </div>

          <div className="admin-upload-field">
            <label className="admin-file-upload">
              <ImageUp />
              <span>Upload result invite image</span>
              <input type="file" accept="image/*" onChange={(event) => void uploadInviteImage(event)} />
            </label>
            {draft.resultInvite.image ? (
              <div className="admin-image-preview">
                <Image src={draft.resultInvite.image} alt="Result invite preview" width={96} height={96} unoptimized />
                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() => setDraft((current) => ({ ...current, resultInvite: { ...current.resultInvite, image: false } }))}
                  aria-label="Remove result invite image"
                >
                  <Trash2 />
                </button>
              </div>
            ) : null}
          </div>

          <div className="admin-question-header">
            <h4>Questions</h4>
            <button type="button" className="quiz-secondary-button" onClick={addQuestion}>
              <Plus />
              Add question
            </button>
          </div>

          {draft.questions.map((question, questionIndex) => (
            <fieldset className="admin-question-card" key={`${question.id}-${questionIndex}`}>
              <legend>Question {questionIndex + 1}</legend>
              <button type="button" className="admin-icon-button" onClick={() => removeQuestion(questionIndex)} disabled={draft.questions.length <= 1}>
                <Trash2 />
              </button>

              <div className="admin-form-grid">
                <Field label="Question id" value={question.id} onChange={(value) => updateQuestion(questionIndex, { id: value })} />
                <Field label="Category" value={question.category} onChange={(value) => updateQuestion(questionIndex, { category: value })} />
                <label className="admin-field">
                  <span>Difficulty</span>
                  <select
                    value={question.difficulty}
                    onChange={(event) => updateQuestion(questionIndex, { difficulty: event.target.value as QuizQuestionWithAnswer["difficulty"] })}
                  >
                    <option value="Core">Core</option>
                    <option value="Applied">Applied</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Correct option</span>
                  <select value={question.answer} onChange={(event) => updateQuestion(questionIndex, { answer: event.target.value })}>
                    {question.options.map((option, optionIndex) => (
                      <option key={option.id} value={option.id}>
                        {String.fromCharCode(65 + optionIndex)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="admin-field admin-field--wide">
                <span>Prompt</span>
                <textarea value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} />
              </label>

              <label className="admin-field admin-field--wide">
                <span>Description</span>
                <textarea
                  value={question.description ?? ""}
                  onChange={(event) => updateQuestion(questionIndex, { description: event.target.value })}
                />
              </label>

              <div className="admin-options-grid">
                {question.options.map((option, optionIndex) => (
                  <Field
                    key={option.id}
                    label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    value={option.label}
                    onChange={(value) => updateOption(questionIndex, optionIndex, value)}
                  />
                ))}
              </div>
            </fieldset>
          ))}

          <div className="admin-editor-actions">
            {message ? <p>{message}</p> : null}
            <button type="submit" className="quiz-primary-button" disabled={isSaving}>
              <Save />
              {isSaving ? "Saving" : "Save quiz"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "datetime-local";
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <SmoothInput type={type} value={value} min={type === "number" ? 1 : undefined} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function cloneQuiz(quiz: Omit<AdminQuiz, "id"> | AdminQuiz): Omit<AdminQuiz, "id"> {
  return JSON.parse(
    JSON.stringify({
      name: quiz.name,
      config: {
        title: quiz.config.title,
        description: quiz.config.description,
        duration: quiz.config.duration,
        durationSeconds: quiz.config.durationSeconds,
        startsAt: toDateTimeInputValue(quiz.config.startsAt),
        rules: quiz.config.rules,
        highlights: quiz.config.highlights,
      },
      questions: quiz.questions,
      resultInvite: quiz.resultInvite,
      isActive: quiz.isActive,
    }),
  ) as Omit<AdminQuiz, "id">;
}

function serializeDraft(draft: Omit<AdminQuiz, "id">) {
  return {
    ...draft,
    config: {
      ...draft.config,
      startsAt: new Date(draft.config.startsAt).toISOString(),
    },
  };
}

function toDateTimeInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return toDateTimeInputValue(new Date().toISOString());
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
