import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import type {
  CharacterExpression,
  CharacterGender,
  CharacterOutfit,
  ClientDiagnosticQuestion,
  ContentLang,
  DiagnosticAttempt,
  DifficultyLevel,
  Lang,
  StudyProfile,
} from '../types/platform';
import {
  getSubjectsForGrade,
  pickLocalizedText,
  resolveSubjectContentLang,
} from '../data/curriculum';
import { t } from '../i18n/translations';
import { apiFetch } from '../utils/apiClient';
import {
  getStudentAdaptationContext,
  recordDiagnosticResults,
} from '../utils/studentHistory';
import { TeacherCharacter3D } from './TeacherCharacter3D';

interface DiagnosticsViewProps {
  profileKey: string;
  interfaceLang: Lang;
  schoolLang: Lang;
  userGrade: number;
  profile: StudyProfile;
  charGender: CharacterGender;
  charOutfit: CharacterOutfit;
  initialSubjectId?: string;
  initialGrade?: number;
  onAttemptSaved: (attempts: DiagnosticAttempt[]) => void;
  onStudyWeakTopic: (subjectId: string, grade: number, topicTitle: string) => void;
}

interface ReviewItem {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export function DiagnosticsView({
  profileKey,
  interfaceLang,
  schoolLang,
  userGrade,
  profile,
  charGender,
  charOutfit,
  initialSubjectId,
  initialGrade,
  onAttemptSaved,
  onStudyWeakTopic,
}: DiagnosticsViewProps) {
  const [targetGrade, setTargetGrade] = useState<number>(initialGrade ?? userGrade);
  const subjects = getSubjectsForGrade(targetGrade);
  const [subjectId, setSubjectId] = useState<string>(
    initialSubjectId && subjects.some((s) => s.id === initialSubjectId)
      ? initialSubjectId
      : subjects[0]?.id ?? 'math'
  );
  const [scope, setScope] = useState<'subject' | 'section' | 'topic' | 'previous_grade'>('subject');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  const [questions, setQuestions] = useState<ClientDiagnosticQuestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeContentLang, setActiveContentLang] = useState<ContentLang>(
    resolveSubjectContentLang(subjectId, schoolLang)
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    attempt: DiagnosticAttempt;
    reviewDetails: ReviewItem[];
  } | null>(null);
  const [charExpr, setCharExpr] = useState<CharacterExpression>('idle');
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    if (initialGrade) {
      setTargetGrade(initialGrade);
    }
    if (initialSubjectId) {
      setSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, initialGrade]);

  const adaptation = useMemo(
    () => getStudentAdaptationContext(profileKey, subjectId),
    [profileKey, subjectId, historyVersion]
  );

  const expectedContentLang = resolveSubjectContentLang(subjectId, schoolLang);

  const startTest = async () => {
    if (generating) return;
    setError(null);
    setResult(null);
    setGenerating(true);
    setCharExpr('thinking');

    try {
      const latestAdaptation = getStudentAdaptationContext(profileKey, subjectId);
      const res = await apiFetch<{
        diagnosticSessionId: string;
        diagnosticToken: string;
        contentLang: ContentLang;
        questions: ClientDiagnosticQuestion[];
      }>('/api/diagnostics/generate', {
        method: 'POST',
        body: JSON.stringify({
          subjectId,
          targetGrade,
          scope,
          difficulty,
          interfaceLang,
          schoolLang,
          profile,
          weakTopics: latestAdaptation.weakTopics,
          previousQuestions: latestAdaptation.previousQuestions,
        }),
      });

      setSessionId(res.diagnosticSessionId);
      setSessionToken(res.diagnosticToken);
      setActiveContentLang(res.contentLang ?? expectedContentLang);
      setQuestions(res.questions);
      setAnswers({});
      setCharExpr('explaining');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : interfaceLang === 'kk'
            ? 'Диагностика сұрақтарын жасау сәтсіз аяқталды.'
            : 'Не удалось сгенерировать вопросы диагностики.'
      );
      setCharExpr('calm');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    setCharExpr('thinking');
    try {
      const res = await apiFetch<{
        attempt: DiagnosticAttempt;
        reviewDetails: ReviewItem[];
        diagnostics: DiagnosticAttempt[];
      }>('/api/diagnostics/submit', {
        method: 'POST',
        body: JSON.stringify({
          diagnosticSessionId: sessionId,
          diagnosticToken: sessionToken,
          subjectId,
          targetGrade,
          scope,
          difficulty,
          answers,
          interfaceLang,
          schoolLang,
        }),
      });

      recordDiagnosticResults(profileKey, {
        subjectId,
        grade: targetGrade,
        questions,
        reviewDetails: res.reviewDetails,
        contentLang: res.attempt.contentLang ?? activeContentLang,
      });
      setHistoryVersion((v) => v + 1);
      setResult({ attempt: res.attempt, reviewDetails: res.reviewDetails });
      onAttemptSaved(res.diagnostics);
      setCharExpr(res.attempt.percentage >= 70 ? 'happy' : 'calm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка проверки диагностики');
      setCharExpr('calm');
    } finally {
      setSubmitting(false);
    }
  };

  const contentUiLabels = {
    answerPlaceholder:
      activeContentLang === 'en'
        ? 'Type your answer...'
        : activeContentLang === 'kk'
          ? 'Жауабыңызды жазыңыз...'
          : 'Введите ответ (слово или число)...',
    correctLabel:
      activeContentLang === 'en'
        ? 'Correct answer'
        : activeContentLang === 'kk'
          ? 'Дұрыс жауап'
          : 'Правильный ответ',
    taskLabel:
      activeContentLang === 'en'
        ? 'Question'
        : activeContentLang === 'kk'
          ? 'Тапсырма'
          : 'Задание',
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-zinc-50">
                {t(interfaceLang, 'diagTitle')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                {interfaceLang === 'kk'
                  ? 'Әр іске қосқанда AI таңдалған сынып бағдарламасы мен сіздің әлсіз тақырыптарыңызға сай 10 жаңа тапсырма дайындайды.'
                  : 'При каждом запуске ИИ формирует 10 уникальных заданий строго по программе выбранного класса с учётом ваших пробелов.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  {interfaceLang === 'kk' ? 'Тексеру түрі' : 'Режим проверки'}
                </label>
                <select
                  value={scope}
                  onChange={(e) => {
                    const nextScope = e.target.value as typeof scope;
                    setScope(nextScope);
                    if (nextScope === 'previous_grade' && userGrade > 1) {
                      setTargetGrade(userGrade - 1);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="subject">
                    {interfaceLang === 'kk' ? 'Бүкіл пән бойынша' : 'По всему предмету'}
                  </option>
                  <option value="section">
                    {interfaceLang === 'kk' ? 'Бөлім бойынша' : 'По отдельному разделу'}
                  </option>
                  <option value="topic">
                    {interfaceLang === 'kk' ? 'Нақты тақырып' : 'По конкретной теме'}
                  </option>
                  <option value="previous_grade">
                    {interfaceLang === 'kk' ? 'Өткен сынып материалы' : 'Материал прошлых классов'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  {t(interfaceLang, 'gradeLabel')}
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setTargetGrade(g);
                    const list = getSubjectsForGrade(g);
                    if (!list.some((s) => s.id === subjectId)) {
                      setSubjectId(list[0]?.id ?? 'math');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      {g} {interfaceLang === 'kk' ? 'сынып' : 'класс'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  {interfaceLang === 'kk' ? 'Пән' : 'Предмет'}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[schoolLang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  {interfaceLang === 'kk' ? 'Күрделілік' : 'Сложность'}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="basic">{interfaceLang === 'kk' ? 'Базалық' : 'Базовый'}</option>
                  <option value="medium">{interfaceLang === 'kk' ? 'Орташа' : 'Средний'}</option>
                  <option value="advanced">{interfaceLang === 'kk' ? 'Жоғары' : 'Повышенный'}</option>
                </select>
              </div>
            </div>

            {adaptation.weakTopics.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    {interfaceLang === 'kk'
                      ? 'Дербес бейімделу белсенді:'
                      : 'Индивидуальная адаптация включена:'}
                  </span>{' '}
                  {interfaceLang === 'kk'
                    ? `Алдыңғы қателер бойынша басым тақырыптар: ${adaptation.weakTopics.slice(0, 3).join(', ')}.`
                    : `В новом тесте приоритетно будут проверены ваши слабые темы: ${adaptation.weakTopics.slice(0, 3).join(', ')}.`}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={generating}
                onClick={() => void startTest()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {generating
                    ? interfaceLang === 'kk'
                      ? '10 тапсырма дайындалуда...'
                      : 'Генерация 10 заданий...'
                    : questions.length > 0
                      ? interfaceLang === 'kk'
                        ? 'Диагностиканы қайта бастау (жаңа 10 сұрақ)'
                        : 'Начать заново (новые 10 вопросов)'
                      : interfaceLang === 'kk'
                        ? 'Диагностиканы бастау (10 сұрақ)'
                        : 'Начать диагностику (10 вопросов)'}
                </span>
              </button>

              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {expectedContentLang === 'ru'
                  ? 'Язык теста: Русский'
                  : expectedContentLang === 'en'
                    ? 'Test language: English'
                    : 'Тест тілі: Қазақша'}
              </span>
            </div>

            {error && questions.length === 0 && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium flex flex-wrap items-center justify-between gap-2">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => void startTest()}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  {interfaceLang === 'kk' ? 'Қайталау' : 'Повторить'}
                </button>
              </div>
            )}
          </div>

          {questions.length > 0 && !result && (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-medium">
                      {idx + 1} / {questions.length} ·{' '}
                      {pickLocalizedText(q.goalLabel, activeContentLang)}
                    </span>
                    <span>{q.format}</span>
                  </div>

                  {q.passage && (
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {pickLocalizedText(q.passage, activeContentLang)}
                    </p>
                  )}

                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50 leading-relaxed">
                    {pickLocalizedText(q.prompt, activeContentLang)}
                  </p>

                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = answers[q.id] === String(optIdx);
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: String(optIdx),
                              }))
                            }
                            className={`w-full text-left px-4 py-2.5 text-sm rounded-xl border transition-colors cursor-pointer ${
                              selected
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-medium'
                                : 'border-slate-200 dark:border-zinc-700 hover:border-slate-400'
                            }`}
                          >
                            {pickLocalizedText(opt, activeContentLang)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[q.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      placeholder={contentUiLabels.answerPlaceholder}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  )}
                </div>
              ))}

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmit()}
                className="w-full py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                {submitting
                  ? interfaceLang === 'kk'
                    ? 'Тексерілуде...'
                    : 'Проверка и составление плана...'
                  : interfaceLang === 'kk'
                    ? 'Диагностиканы аяқтау'
                    : 'Завершить и получить отчёт'}
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {result.attempt.subjectName} · {result.attempt.targetGrade}{' '}
                      {interfaceLang === 'kk' ? 'сынып' : 'класс'}
                    </p>
                    <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50 tabular-nums mt-1">
                      {result.attempt.percentage}% ({result.attempt.correctCount} /{' '}
                      {result.attempt.totalQuestions})
                    </h2>
                  </div>

                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => void startTest()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                    <span>
                      {interfaceLang === 'kk'
                        ? 'Жаңа тапсырмалармен қайта өту'
                        : 'Повторная диагностика (новые задания)'}
                    </span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <p className="text-xs text-slate-500">{interfaceLang === 'kk' ? 'Дұрыс жауап' : 'Верных ответов'}</p>
                    <p className="text-lg font-bold text-emerald-600 tabular-nums">{result.attempt.correctCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <p className="text-xs text-slate-500">{interfaceLang === 'kk' ? 'Қате саны' : 'Ошибок'}</p>
                    <p className="text-lg font-bold text-amber-600 tabular-nums">{result.attempt.wrongCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <p className="text-xs text-slate-500">{interfaceLang === 'kk' ? 'Орындалуы' : 'Выполнение'}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-50 tabular-nums">{result.attempt.percentage}%</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
                    {interfaceLang === 'kk' ? 'Тақырыптар бойынша қорытынды' : 'Оценка по учебным целям'}
                  </h3>
                  {result.attempt.breakdown.map((b, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {b.goalLabel}
                        </p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {b.correct} / {b.total}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold ${
                            b.category === 'mastered'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : b.category === 'review'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {b.category === 'mastered'
                            ? t(interfaceLang, 'mastered')
                            : b.category === 'review'
                              ? t(interfaceLang, 'reviewNeeded')
                              : t(interfaceLang, 'extraPrep')}
                        </span>
                        {b.category !== 'mastered' && (
                          <button
                            type="button"
                            onClick={() =>
                              onStudyWeakTopic(subjectId, targetGrade, b.goalLabel)
                            }
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            {t(interfaceLang, 'studyTopic')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
                    {interfaceLang === 'kk'
                      ? 'Дербес оқу жоспары'
                      : 'Персональный план обучения'}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {result.attempt.learningPlan}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
                    {interfaceLang === 'kk' ? 'Жауаптарды талдау' : 'Разбор заданий'}
                  </h3>
                  {result.reviewDetails.map((item, idx) => (
                    <div
                      key={item.questionId}
                      className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>
                          {contentUiLabels.taskLabel} #{idx + 1} ·{' '}
                          {contentUiLabels.correctLabel}: {item.correctAnswer}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 pl-6">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 p-4 space-y-3">
          <TeacherCharacter3D
            gender={charGender}
            outfit={charOutfit}
            expression={charExpr}
            hintText={t(interfaceLang, 'teacher3dHint')}
            className="w-full h-64 rounded-2xl bg-gradient-to-b from-sky-50 via-amber-50/20 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
          />
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            {charExpr === 'happy'
              ? interfaceLang === 'kk'
                ? 'Тамаша нәтиже! Біліміңіз сенімді дамып келеді.'
                : 'Отличная работа! Ваши знания по выбранным целям уверенно растут.'
              : charExpr === 'calm'
                ? interfaceLang === 'kk'
                  ? 'Қателік — оқу процесінің қалыпты бөлігі. Бірге қайталап, бекітеміз.'
                  : 'Ошибки — естественная часть учёбы. Спокойно разберём пробелы по шагам.'
                : interfaceLang === 'kk'
                  ? 'Пән мен деңгейді таңдап, диагностиканы бастаңыз.'
                  : 'Выберите предмет, уровень сложности и начните проверку.'}
          </p>
        </div>
      </div>
    </div>
  );
}
