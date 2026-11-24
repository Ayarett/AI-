import type { ClientDiagnosticQuestion, ContentLang } from '../types/platform';
import { pickLocalizedText } from '../data/curriculum';

const STORAGE_PREFIX = 'ai_ustaz_student_history_v1_';

export interface StudentAnswerHistoryEntry {
  id: string;
  subjectId: string;
  grade: number;
  goalLabel: string;
  promptSnippet: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface WeakTopicRecord {
  topic: string;
  misses: number;
  lastMissedAt: string;
}

export interface StudentSubjectAdaptation {
  weakTopics: WeakTopicRecord[];
  masteredTopics: string[];
  askedPrompts: string[];
  history: StudentAnswerHistoryEntry[];
}

type StudentAdaptationStore = Record<string, StudentSubjectAdaptation>;

function storageKey(profileKey: string): string {
  const safeKey = profileKey.trim() || 'guest';
  return `${STORAGE_PREFIX}${safeKey}`;
}

function readStore(profileKey: string): StudentAdaptationStore {
  try {
    const raw = localStorage.getItem(storageKey(profileKey));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StudentAdaptationStore;
  } catch {
    return {};
  }
}

function writeStore(profileKey: string, store: StudentAdaptationStore): void {
  try {
    localStorage.setItem(storageKey(profileKey), JSON.stringify(store));
  } catch {
    // Ignore quota errors
  }
}

export interface AdaptationPromptContext {
  weakTopics: string[];
  masteredTopics: string[];
  previousQuestions: string[];
  totalAnswered: number;
}

export function getStudentAdaptationContext(
  profileKey: string,
  subjectId: string
): AdaptationPromptContext {
  const store = readStore(profileKey);
  const entry = store[subjectId];
  if (!entry) {
    return {
      weakTopics: [],
      masteredTopics: [],
      previousQuestions: [],
      totalAnswered: 0,
    };
  }
  const sortedWeak = [...(entry.weakTopics ?? [])]
    .sort((a, b) => b.misses - a.misses || b.lastMissedAt.localeCompare(a.lastMissedAt))
    .map((w) => w.topic)
    .slice(0, 8);

  return {
    weakTopics: sortedWeak,
    masteredTopics: (entry.masteredTopics ?? []).slice(0, 10),
    previousQuestions: (entry.askedPrompts ?? []).slice(0, 30),
    totalAnswered: (entry.history ?? []).length,
  };
}

export function getAllWeakTopicsForProfile(profileKey: string): Array<{
  subjectId: string;
  topic: string;
  misses: number;
}> {
  const store = readStore(profileKey);
  const out: Array<{ subjectId: string; topic: string; misses: number }> = [];
  for (const [subjectId, data] of Object.entries(store)) {
    for (const w of data.weakTopics ?? []) {
      out.push({ subjectId, topic: w.topic, misses: w.misses });
    }
  }
  return out.sort((a, b) => b.misses - a.misses).slice(0, 12);
}

export function recordDiagnosticResults(
  profileKey: string,
  params: {
    subjectId: string;
    grade: number;
    questions: ClientDiagnosticQuestion[];
    reviewDetails: Array<{ questionId: string; isCorrect: boolean }>;
    contentLang: ContentLang;
  }
): void {
  const store = readStore(profileKey);
  const current: StudentSubjectAdaptation = store[params.subjectId] ?? {
    weakTopics: [],
    masteredTopics: [],
    askedPrompts: [],
    history: [],
  };

  const correctnessById = new Map<string, boolean>(
    params.reviewDetails.map((r) => [r.questionId, r.isCorrect])
  );

  const weakMap = new Map<string, WeakTopicRecord>(
    current.weakTopics.map((w) => [w.topic.toLowerCase(), { ...w }])
  );
  const masteredSet = new Set<string>(current.masteredTopics);
  const topicAttemptStats = new Map<string, { label: string; correct: number; total: number }>();

  const now = new Date().toISOString();
  const newHistoryEntries: StudentAnswerHistoryEntry[] = [];
  const newPrompts: string[] = [];

  for (const q of params.questions) {
    const isCorrect = correctnessById.get(q.id) ?? false;
    const goalLabel = pickLocalizedText(q.goalLabel, params.contentLang).trim() || q.goalCode;
    const promptText = pickLocalizedText(q.prompt, params.contentLang)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    if (promptText) {
      newPrompts.push(promptText);
    }

    newHistoryEntries.push({
      id: `${q.id}-${Date.now()}`,
      subjectId: params.subjectId,
      grade: params.grade,
      goalLabel,
      promptSnippet: promptText,
      isCorrect,
      timestamp: now,
    });

    const key = goalLabel.toLowerCase();
    const stat = topicAttemptStats.get(key) ?? { label: goalLabel, correct: 0, total: 0 };
    stat.total += 1;
    if (isCorrect) stat.correct += 1;
    topicAttemptStats.set(key, stat);

    if (!isCorrect) {
      const prev = weakMap.get(key);
      weakMap.set(key, {
        topic: goalLabel,
        misses: (prev?.misses ?? 0) + 1,
        lastMissedAt: now,
      });
      masteredSet.delete(goalLabel);
    }
  }

  // If a topic was answered completely right in this run, reduce misses or mark mastered
  for (const [key, stat] of topicAttemptStats.entries()) {
    if (stat.total > 0 && stat.correct === stat.total) {
      const existingWeak = weakMap.get(key);
      if (existingWeak) {
        if (existingWeak.misses <= 1) {
          weakMap.delete(key);
          masteredSet.add(stat.label);
        } else {
          weakMap.set(key, {
            ...existingWeak,
            misses: existingWeak.misses - 1,
          });
        }
      } else {
        masteredSet.add(stat.label);
      }
    }
  }

  const dedupedPrompts = Array.from(
    new Set([...newPrompts, ...current.askedPrompts])
  ).slice(0, 40);

  store[params.subjectId] = {
    weakTopics: Array.from(weakMap.values())
      .sort((a, b) => b.misses - a.misses || b.lastMissedAt.localeCompare(a.lastMissedAt))
      .slice(0, 20),
    masteredTopics: Array.from(masteredSet).slice(0, 20),
    askedPrompts: dedupedPrompts,
    history: [...newHistoryEntries, ...current.history].slice(0, 80),
  };

  writeStore(profileKey, store);
}
