import type { DiagnosticAttempt, Lang, StudentTask } from '../types/platform';
import { t } from '../i18n/translations';

interface ProgressViewProps {
  interfaceLang: Lang;
  diagnostics: DiagnosticAttempt[];
  tasks: StudentTask[];
  onGoToDiagnostics: () => void;
  onStudyTopic: (subjectId: string, grade: number, topicTitle: string) => void;
}

export function ProgressView({
  interfaceLang,
  diagnostics,
  tasks,
  onGoToDiagnostics,
  onStudyTopic,
}: ProgressViewProps) {
  const completedTasks = tasks.filter((tItem) => tItem.completed).length;
  const avgScore =
    diagnostics.length > 0
      ? Math.round(
          diagnostics.reduce((sum, d) => sum + d.percentage, 0) / diagnostics.length
        )
      : 0;

  const masteredTopics = new Set<string>();
  const reviewTopics: Array<{ label: string; subjectId: string; grade: number }> = [];

  for (const attempt of diagnostics) {
    for (const item of attempt.breakdown) {
      if (item.category === 'mastered') {
        masteredTopics.add(item.goalLabel);
      } else if (!reviewTopics.some((r) => r.label === item.goalLabel)) {
        reviewTopics.push({
          label: item.goalLabel,
          subjectId: attempt.subjectId,
          grade: attempt.targetGrade,
        });
      }
    }
  }

  const chronological = [...diagnostics].slice(0, 8).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-zinc-50">
          {t(interfaceLang, 'navProgress')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
          {interfaceLang === 'kk'
            ? 'Жеке оқу динамикасы: тек өзіңіздің алдыңғы нәтижелеріңізбен салыстыру'
            : 'Личная динамика: сравнение только с вашими собственными прошлыми результатами'}
        </p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <p className="text-xs text-slate-500">
            {interfaceLang === 'kk' ? 'Өтілген диагностикалар' : 'Пройдено диагностик'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">{diagnostics.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <p className="text-xs text-slate-500">
            {interfaceLang === 'kk' ? 'Орташа нәтиже' : 'Средний результат'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
            {avgScore}%
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <p className="text-xs text-slate-500">
            {interfaceLang === 'kk' ? 'Меңгерілген тақырыптар' : 'Освоено целей'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {masteredTopics.size}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <p className="text-xs text-slate-500">
            {interfaceLang === 'kk' ? 'Аяқталған тапсырмалар' : 'Выполнено заданий'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">
            {completedTasks} / {tasks.length}
          </p>
        </div>
      </div>

      {chronological.length > 1 && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
            {interfaceLang === 'kk' ? 'Нәтижелер динамикасы' : 'Динамика ваших результатов'}
          </h2>
          <svg viewBox="0 0 600 160" className="w-full h-40" aria-label="График личного прогресса">
            <line x1="20" y1="30" x2="580" y2="30" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeDasharray="4 4" />
            <line x1="20" y1="80" x2="580" y2="80" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeDasharray="4 4" />
            <line x1="20" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" />
            <polyline
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chronological
                .map((d, idx) => {
                  const x =
                    20 +
                    (idx / Math.max(1, chronological.length - 1)) * 560;
                  const y = 130 - (d.percentage / 100) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {chronological.map((d, idx) => {
              const x =
                20 + (idx / Math.max(1, chronological.length - 1)) * 560;
              const y = 130 - (d.percentage / 100) * 100;
              return (
                <g key={d.id}>
                  <circle cx={x} cy={y} r="5" fill="#2563EB" />
                  <text
                    x={x}
                    y={Math.max(16, y - 10)}
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-zinc-400 text-[10px] font-mono"
                  >
                    {d.percentage}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
            {interfaceLang === 'kk'
              ? 'Қайталау ұсынылатын тақырыптар'
              : 'Темы для повторения и укрепления'}
          </h2>
          {reviewTopics.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {diagnostics.length === 0
                ? interfaceLang === 'kk'
                  ? 'Алдымен білім диагностикасынан өтіңіз.'
                  : 'Пройдите первую диагностику, чтобы увидеть персональные рекомендации.'
                : interfaceLang === 'kk'
                  ? 'Барлық тексерілген тақырыптар жақсы меңгерілген!'
                  : 'Все проверенные темы освоены уверенно!'}
            </p>
          ) : (
            <div className="space-y-2">
              {reviewTopics.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStudyTopic(item.subjectId, item.grade, item.label)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                  >
                    {t(interfaceLang, 'studyTopic')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
              {interfaceLang === 'kk' ? 'Диагностикалар тарихы' : 'История диагностик'}
            </h2>
            <button
              type="button"
              onClick={onGoToDiagnostics}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {interfaceLang === 'kk' ? 'Жаңасын өту' : 'Новая проверка'}
            </button>
          </div>

          {diagnostics.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {interfaceLang === 'kk'
                ? 'Тарих әзірге бос.'
                : 'История диагностик пока пуста.'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {diagnostics.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-zinc-100">
                      {d.subjectName} · {d.targetGrade} {interfaceLang === 'kk' ? 'сынып' : 'кл.'}
                    </p>
                    <p className="text-slate-500 tabular-nums mt-0.5">
                      {new Date(d.createdAt).toLocaleDateString()} · {d.correctCount}/{d.totalQuestions}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm tabular-nums text-blue-600 dark:text-blue-400">
                    {d.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
