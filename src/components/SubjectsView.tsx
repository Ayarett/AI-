import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import type { Lang, StudyProfile, SubjectDefinition } from '../types/platform';
import {
  getSchoolStageInfo,
  getSectionsForGradeAndProfile,
  getSubjectsForGrade,
  OFFICIAL_SOURCES,
} from '../data/curriculum';
import { t } from '../i18n/translations';
import { SubjectIllustration } from './SubjectIllustration';

interface SubjectsViewProps {
  interfaceLang: Lang;
  schoolLang: Lang;
  grade: number;
  profile: StudyProfile;
  onChangeGradeAndProfile: (grade: number, profile: StudyProfile) => void;
  onStudyTopic: (subjectId: string, grade: number, topicTitle: string) => void;
  onRunDiagnostic: (subjectId: string, grade: number) => void;
}

const STAGE_CHIPS = [
  { id: '1-4', representativeGrade: 1, kk: '1–4 сынып', ru: '1–4 кл.' },
  { id: '5-6', representativeGrade: 5, kk: '5–6 сынып', ru: '5–6 кл.' },
  { id: '7', representativeGrade: 7, kk: '7 сынып', ru: '7 кл.' },
  { id: '8-9', representativeGrade: 8, kk: '8–9 сынып', ru: '8–9 кл.' },
  { id: '10-11', representativeGrade: 10, kk: '10–11 сынып', ru: '10–11 кл.' },
] as const;

export function SubjectsView({
  interfaceLang,
  schoolLang,
  grade,
  profile,
  onChangeGradeAndProfile,
  onStudyTopic,
  onRunDiagnostic,
}: SubjectsViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectDefinition | null>(null);
  const subjects = getSubjectsForGrade(grade);
  const stageInfo = getSchoolStageInfo(grade);
  const effectiveProfile: StudyProfile = grade >= 10 ? profile : 'general';

  if (selectedSubject) {
    const sections = getSectionsForGradeAndProfile(
      selectedSubject,
      grade,
      effectiveProfile
    );
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setSelectedSubject(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {interfaceLang === 'kk' ? 'Барлық пәндерге оралу' : 'Ко всем предметам'}
          </span>
        </button>

        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <SubjectIllustration
              iconKey={selectedSubject.iconKey}
              className="w-16 h-16 shrink-0"
            />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                {grade} {interfaceLang === 'kk' ? 'сынып' : 'класс'} ·{' '}
                {schoolLang === 'kk' ? 'Қазақ тілінде оқыту' : 'Русский язык обучения'}
              </p>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                {selectedSubject.name[interfaceLang]}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {selectedSubject.name[interfaceLang === 'kk' ? 'ru' : 'kk']}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                onStudyTopic(
                  selectedSubject.id,
                  grade,
                  sections[0]?.topics[0]?.title[interfaceLang] ??
                    selectedSubject.name[interfaceLang]
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t(interfaceLang, 'studyTopic')}</span>
            </button>
            <button
              type="button"
              onClick={() => onRunDiagnostic(selectedSubject.id, grade)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 hover:border-sky-500 rounded-xl transition-colors cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{t(interfaceLang, 'checkKnowledge')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>{t(interfaceLang, 'needsReview')}</span>
              </div>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
                {interfaceLang === 'kk'
                  ? 'Бұл сынып пен пән бойынша нақты бөлімдер әлі ресми дереккөзбен тексерілуде. Сіз AI мұғалімнен кез келген тақырып бойынша сұрай аласыз.'
                  : 'Детальные разделы для этого класса пока проходят сверку с официальной программой РК (NEEDS_REVIEW). Вы можете задать вопрос AI-учителю по любой теме.'}
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div
                key={section.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-zinc-50">
                    {section.title[interfaceLang]}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    {section.profileFocus === 'humanitarian'
                      ? t(interfaceLang, 'profileHumanitarian')
                      : section.profileFocus === 'physmath'
                        ? t(interfaceLang, 'profilePhysmath')
                        : interfaceLang === 'kk'
                          ? 'Негізгі бөлім'
                          : 'Базовый раздел'}
                  </span>
                </div>

                <div className="space-y-4">
                  {section.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
                            {topic.title[interfaceLang]}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                            {topic.status === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t(interfaceLang, 'verified')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {t(interfaceLang, 'needsReview')}
                              </span>
                            )}
                            <span aria-hidden="true">·</span>
                            <span>
                              {interfaceLang === 'kk' ? 'Деңгей' : 'Сложность'}: {topic.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onStudyTopic(
                                selectedSubject.id,
                                grade,
                                topic.title[interfaceLang]
                              )
                            }
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer"
                          >
                            {t(interfaceLang, 'studyTopic')}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRunDiagnostic(selectedSubject.id, grade)}
                            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-300 dark:border-zinc-700 hover:border-sky-500 rounded-xl cursor-pointer"
                          >
                            {t(interfaceLang, 'checkKnowledge')}
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-zinc-400">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-0.5">
                            {interfaceLang === 'kk' ? 'Оқу мақсаты:' : 'Цель обучения:'}
                          </span>
                          {topic.learningObjective[interfaceLang]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-0.5">
                            {interfaceLang === 'kk' ? 'Күтілетін нәтиже:' : 'Ожидаемый результат:'}
                          </span>
                          {topic.expectedResult[interfaceLang]}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                        <span>
                          {interfaceLang === 'kk' ? 'Алдыңғы тақырыппен байланыс' : 'Связь с предыдущими'}:{' '}
                          {topic.prerequisites[interfaceLang]}
                        </span>
                        <a
                          href={topic.officialSource}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400 hover:underline"
                        >
                          <span>
                            {interfaceLang === 'kk' ? 'Ресми дереккөз' : 'Официальный источник'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
            {t(interfaceLang, 'navSubjects')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            {stageInfo.label[interfaceLang]} · {stageInfo.note[interfaceLang]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={grade}
            onChange={(e) => {
              const g = Number(e.target.value);
              onChangeGradeAndProfile(g, g < 10 ? 'general' : profile);
            }}
            aria-label={t(interfaceLang, 'gradeLabel')}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          >
            {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                {g} {interfaceLang === 'kk' ? 'сынып' : 'класс'}
              </option>
            ))}
          </select>

          {grade >= 10 && (
            <select
              value={profile}
              onChange={(e) =>
                onChangeGradeAndProfile(grade, e.target.value as StudyProfile)
              }
              aria-label={t(interfaceLang, 'profileLabel')}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <option value="general">{t(interfaceLang, 'profileGeneral')}</option>
              <option value="humanitarian">{t(interfaceLang, 'profileHumanitarian')}</option>
              <option value="physmath">{t(interfaceLang, 'profilePhysmath')}</option>
            </select>
          )}
        </div>
      </div>

      {/* Stage quick-tabs: 1-4, 5-6, 7, 8-9, 10-11 */}
      <div className="flex flex-wrap gap-2">
        {STAGE_CHIPS.map((st) => {
          const active = stageInfo.id === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() =>
                onChangeGradeAndProfile(
                  st.representativeGrade,
                  st.representativeGrade < 10 ? 'general' : profile
                )
              }
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                active
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-sky-400'
              }`}
            >
              {st[interfaceLang]}
            </button>
          );
        })}
      </div>

      {grade >= 10 && effectiveProfile !== 'general' && (
        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 text-xs text-slate-700 dark:text-zinc-300">
          {effectiveProfile === 'humanitarian'
            ? interfaceLang === 'kk'
              ? 'Қоғамдық-гуманитарлық бағыт (10–11 сынып): қазақ/орыс тілдері, әдебиет, тарих және мәтіндік талдау тереңдетілген. Барлық негізгі пәндер сақталады.'
              : 'Гуманитарное направление (10–11 классы): углублённые языки, литература, история и работа с текстами. Все основные предметы сохраняются.'
            : interfaceLang === 'kk'
              ? 'Физика-математикалық бағыт (10–11 сынып): алгебра және анализ бастамалары, геометрия, физика және информатика бойынша күрделі есептер басым.'
              : 'Физико-математическое направление (10–11 классы): углублённая математика, алгебра, геометрия, физика и информатика. Все основные предметы сохраняются.'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subj) => {
          const sections = getSectionsForGradeAndProfile(subj, grade, effectiveProfile);
          const topicsCount = sections.reduce((sum, s) => sum + s.topics.length, 0);
          return (
            <button
              key={subj.id}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className="text-left p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-sky-500/70 dark:hover:border-sky-500/60 hover:shadow-sm transition-all flex items-start gap-4 cursor-pointer"
            >
              <SubjectIllustration iconKey={subj.iconKey} className="w-12 h-12 shrink-0" />
              <div className="min-w-0 space-y-1">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50 leading-snug">
                  {subj.name[interfaceLang]}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {subj.name[interfaceLang === 'kk' ? 'ru' : 'kk']}
                </p>
                <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold pt-1 tabular-nums">
                  {topicsCount > 0
                    ? `${topicsCount} ${interfaceLang === 'kk' ? 'тексерілген тақырып' : 'тем в базе'}`
                    : 'NEEDS_REVIEW'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
          {interfaceLang === 'kk'
            ? 'ҚР ресми нормативтік дереккөздері (2026–2027)'
            : 'Нормативные источники Республики Казахстан (2026–2027)'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {OFFICIAL_SOURCES.map((src) => (
            <a
              key={src.id}
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 hover:text-sky-700 dark:hover:text-sky-400"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{src.title[interfaceLang]}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
