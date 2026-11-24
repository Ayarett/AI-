import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDown, ArrowUp, Download, Printer, Save, Trash2 } from 'lucide-react';
import type {
  Lang,
  PresentationSlide,
  TeacherMaterial,
  TeacherToolType,
} from '../types/platform';
import { getSubjectName, getSubjectsForGrade } from '../data/curriculum';
import { t } from '../i18n/translations';
import { apiFetch } from '../utils/apiClient';
import { downloadHtmlFile, slugifyFilename } from '../utils/htmlSanitizer';

interface TeacherStudioViewProps {
  interfaceLang: Lang;
  aiConfigured: boolean;
  isGuest?: boolean;
  defaultSubjects: string[];
  defaultClasses: number[];
  materials: TeacherMaterial[];
  onMaterialsUpdated: (materials: TeacherMaterial[]) => void;
}

const TOOL_OPTIONS: Array<{ id: TeacherToolType; kk: string; ru: string }> = [
  { id: 'presentation', kk: 'Презентация жасау', ru: 'Создание презентации' },
  { id: 'lesson_plan', kk: 'Сабақ жоспары (ҚМЖ)', ru: 'План урока (КСП)' },
  { id: 'test', kk: 'Тест (жауап кілтімен)', ru: 'Тест с ключом ответов' },
  { id: 'independent_work', kk: 'Өзіндік жұмыс', ru: 'Самостоятельная работа' },
  { id: 'control_work', kk: 'Бақылау жұмысы', ru: 'Контрольная работа' },
  { id: 'worksheet', kk: 'Жұмыс парағы', ru: 'Рабочий лист' },
  { id: 'rubric', kk: 'Бағалау критерийлері', ru: 'Критерии оценивания' },
  { id: 'differentiated', kk: 'Деңгейлік тапсырмалар', ru: 'Дифференцированные задания' },
  { id: 'questions', kk: 'Тақырыптық сұрақтар', ru: 'Вопросы по теме' },
  { id: 'summary', kk: 'Қысқаша конспект', ru: 'Краткий конспект' },
];

export function TeacherStudioView({
  interfaceLang,
  aiConfigured,
  isGuest = false,
  defaultSubjects,
  defaultClasses,
  materials,
  onMaterialsUpdated,
}: TeacherStudioViewProps) {
  const [toolType, setToolType] = useState<TeacherToolType>('presentation');
  const [grade, setGrade] = useState<number>(defaultClasses[0] ?? 7);
  const subjectsForGrade = getSubjectsForGrade(grade);
  const [subjectId, setSubjectId] = useState<string>(
    defaultSubjects.find((id) => subjectsForGrade.some((s) => s.id === id)) ??
      subjectsForGrade[0]?.id ??
      'math'
  );
  const [materialLang, setMaterialLang] = useState<Lang>(interfaceLang);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(6);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionTypes, setQuestionTypes] = useState('выбор ответа и краткий ответ');

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<TeacherMaterial | null>(
    materials[0] ?? null
  );

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || generating) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await apiFetch<{
        material: TeacherMaterial;
        materials: TeacherMaterial[];
      }>('/api/teacher/materials/generate', {
        method: 'POST',
        body: JSON.stringify({
          toolType,
          subjectId,
          grade,
          lang: materialLang,
          topic: topic.trim(),
          questionCount,
          difficulty,
          questionTypes,
        }),
      });
      if (isGuest) {
        const nextList = [
          res.material,
          ...materials.filter((m) => m.id !== res.material.id),
        ].slice(0, 60);
        onMaterialsUpdated(nextList);
      } else {
        onMaterialsUpdated(res.materials);
      }
      setActiveMaterial(res.material);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!activeMaterial) return;
    if (isGuest) {
      const updatedMat: TeacherMaterial = {
        ...activeMaterial,
        updatedAt: new Date().toISOString(),
      };
      const nextList = materials.map((m) =>
        m.id === updatedMat.id ? updatedMat : m
      );
      onMaterialsUpdated(nextList);
      setActiveMaterial(updatedMat);
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch<{
        material: TeacherMaterial;
        materials: TeacherMaterial[];
      }>(`/api/teacher/materials/${activeMaterial.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: activeMaterial.title,
          contentMarkdown: activeMaterial.contentMarkdown,
          answerKey: activeMaterial.answerKey,
          slides: activeMaterial.slides,
        }),
      });
      onMaterialsUpdated(res.materials);
      if (res.material) setActiveMaterial(res.material);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isGuest) {
      const nextList = materials.filter((m) => m.id !== id);
      onMaterialsUpdated(nextList);
      if (activeMaterial?.id === id) {
        setActiveMaterial(nextList[0] ?? null);
      }
      return;
    }
    const res = await apiFetch<{ materials: TeacherMaterial[] }>(
      `/api/teacher/materials/${id}`,
      { method: 'DELETE' }
    );
    onMaterialsUpdated(res.materials);
    if (activeMaterial?.id === id) {
      setActiveMaterial(res.materials[0] ?? null);
    }
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    if (!activeMaterial?.slides) return;
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= activeMaterial.slides.length) return;
    const copy = [...activeMaterial.slides];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, item);
    setActiveMaterial({ ...activeMaterial, slides: copy });
  };

  const updateSlide = (index: number, patch: Partial<PresentationSlide>) => {
    if (!activeMaterial?.slides) return;
    const copy = activeMaterial.slides.map((s, idx) =>
      idx === index ? { ...s, ...patch } : s
    );
    setActiveMaterial({ ...activeMaterial, slides: copy });
  };

  const exportPresentationHtml = (mat: TeacherMaterial) => {
    const slidesHtml = (mat.slides ?? [])
      .map(
        (s, idx) => `
      <section style="min-height:85vh;padding:48px;margin:24px auto;max-width:960px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;page-break-after:always;">
        <p style="font-size:12px;color:#4f46e5;font-weight:700;margin-bottom:8px;">Слайд ${idx + 1} · ${s.type}</p>
        <h2 style="font-size:32px;margin:0 0 18px 0;color:#0f172a;">${s.title.replace(/</g, '&lt;')}</h2>
        <div style="font-size:18px;line-height:1.65;white-space:pre-wrap;color:#334155;">${s.content.replace(/</g, '&lt;')}</div>
        ${s.speakerNotes ? `<p style="margin-top:24px;padding-top:12px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b;">Заметки: ${s.speakerNotes.replace(/</g, '&lt;')}</p>` : ''}
      </section>`
      )
      .join('');

    const doc = `<!DOCTYPE html><html lang="${mat.lang}"><head><meta charset="UTF-8"><title>${mat.title.replace(/</g, '&lt;')}</title></head><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:24px;">${slidesHtml}</body></html>`;
    downloadHtmlFile(slugifyFilename(mat.title), doc);
  };

  const exportDocumentHtml = (mat: TeacherMaterial) => {
    const doc = `<!DOCTYPE html><html lang="${mat.lang}"><head><meta charset="UTF-8"><title>${mat.title.replace(/</g, '&lt;')}</title></head><body style="font-family:system-ui,sans-serif;max-width:820px;margin:40px auto;padding:24px;line-height:1.6;color:#0f172a;"><h1>${mat.title.replace(/</g, '&lt;')}</h1><pre style="white-space:pre-wrap;font-family:inherit;">${mat.contentMarkdown.replace(/</g, '&lt;')}</pre>${mat.answerKey ? `<hr/><h2>Ключ ответов</h2><pre style="white-space:pre-wrap;font-family:inherit;">${mat.answerKey.replace(/</g, '&lt;')}</pre>` : ''}</body></html>`;
    downloadHtmlFile(slugifyFilename(mat.title), doc);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-zinc-50">
            {t(interfaceLang, 'navTeacherStudio')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            {interfaceLang === 'kk'
              ? '10 оқу құралы: презентациялар, тесттер, ҚМЖ, жұмыс парақтары және критерийлер'
              : 'Подготовка, редактирование и сохранение учебных материалов по 10 форматам'}
          </p>
        </div>

        {!aiConfigured && (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {t(interfaceLang, 'aiNotConnected')}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {interfaceLang === 'kk' ? 'Материал түрі' : 'Инструмент'}
              </label>
              <select
                value={toolType}
                onChange={(e) => setToolType(e.target.value as TeacherToolType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                {TOOL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt[interfaceLang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {t(interfaceLang, 'gradeLabel')}
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setGrade(g);
                    const nextList = getSubjectsForGrade(g);
                    if (!nextList.some((s) => s.id === subjectId)) {
                      setSubjectId(nextList[0]?.id ?? 'math');
                    }
                  }}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {interfaceLang === 'kk' ? 'Материал тілі' : 'Язык материала'}
                </label>
                <select
                  value={materialLang}
                  onChange={(e) => setMaterialLang(e.target.value as Lang)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="kk">Қазақша</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {interfaceLang === 'kk' ? 'Пән' : 'Предмет'}
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                {subjectsForGrade.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[materialLang]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {interfaceLang === 'kk' ? 'Сабақ тақырыбы' : 'Тема урока'}
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  interfaceLang === 'kk'
                    ? 'Мысалы: Пифагор теоремасы'
                    : 'Например: Теорема Пифагора'
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>

            {toolType === 'test' && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">
                    {interfaceLang === 'kk' ? 'Сұрақ саны' : 'Вопросов'}
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value) || 6)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">
                    {interfaceLang === 'kk' ? 'Деңгей' : 'Сложность'}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    <option value="basic">База</option>
                    <option value="medium">Средняя</option>
                    <option value="advanced">Высокая</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">
                    {interfaceLang === 'kk' ? 'Түрі' : 'Тип'}
                  </label>
                  <input
                    type="text"
                    value={questionTypes}
                    onChange={(e) => setQuestionTypes(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              {generating
                ? interfaceLang === 'kk'
                  ? 'Дайындалуда...'
                  : 'Генерация материала...'
                : interfaceLang === 'kk'
                  ? 'Материалды жасау'
                  : 'Создать материал'}
            </button>
          </form>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
              {t(interfaceLang, 'navTeacherLibrary')} ({materials.length})
            </h2>
            {materials.length === 0 ? (
              <p className="text-xs text-slate-500">
                {interfaceLang === 'kk'
                  ? 'Сақталған материалдар осы жерде көрсетіледі.'
                  : 'Созданные материалы сохраняются здесь для повторного открытия и правки.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      activeMaterial?.id === m.id
                        ? 'border-indigo-600/50 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMaterial(m)}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {m.title}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {getSubjectName(m.subjectId, interfaceLang)} · {m.grade}{' '}
                        {interfaceLang === 'kk' ? 'сынып' : 'кл.'}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(m.id)}
                      aria-label="Удалить материал"
                      className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          {!activeMaterial ? (
            <div className="py-16 text-center space-y-2">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-zinc-50">
                {interfaceLang === 'kk'
                  ? 'Редактор бос'
                  : 'Выберите или создайте материал'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {interfaceLang === 'kk'
                  ? 'Сол жақтан пәнді, сыныпты және тақырыпты таңдаңыз — жасалған слайдтар мен мәтінді толық өңдей аласыз.'
                  : 'После генерации вы сможете редактировать текст, менять порядок слайдов презентации, сохранять и экспортировать HTML или печатный PDF.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
                <input
                  type="text"
                  value={activeMaterial.title}
                  onChange={(e) =>
                    setActiveMaterial({ ...activeMaterial, title: e.target.value })
                  }
                  className="font-display text-lg font-bold bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none rounded-lg px-2 py-1 -mx-2 flex-1 min-w-[200px]"
                />

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveEdits}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? '...' : interfaceLang === 'kk' ? 'Сақтау' : 'Сохранить'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      activeMaterial.slides
                        ? exportPresentationHtml(activeMaterial)
                        : exportDocumentHtml(activeMaterial)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{interfaceLang === 'kk' ? 'HTML жүктеу' : 'Экспорт HTML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-lg cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {activeMaterial.slides && activeMaterial.slides.length > 0 ? (
                <div className="space-y-4">
                  {activeMaterial.slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {interfaceLang === 'kk' ? 'Слайд' : 'Слайд'} {idx + 1} · {slide.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSlide(idx, -1)}
                            disabled={idx === 0}
                            aria-label="Переместить выше"
                            className="p-1 rounded border border-slate-200 dark:border-zinc-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(idx, 1)}
                            disabled={idx === activeMaterial.slides!.length - 1}
                            aria-label="Переместить ниже"
                            className="p-1 rounded border border-slate-200 dark:border-zinc-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSlide(idx, { title: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950"
                      />
                      <textarea
                        rows={3}
                        value={slide.content}
                        onChange={(e) => updateSlide(idx, { content: e.target.value })}
                        className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    rows={14}
                    value={activeMaterial.contentMarkdown}
                    onChange={(e) =>
                      setActiveMaterial({
                        ...activeMaterial,
                        contentMarkdown: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 font-mono"
                  />

                  {activeMaterial.answerKey !== undefined && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {interfaceLang === 'kk' ? 'Жауап кілті' : 'Ключ ответов'}
                      </label>
                      <textarea
                        rows={5}
                        value={activeMaterial.answerKey}
                        onChange={(e) =>
                          setActiveMaterial({
                            ...activeMaterial,
                            answerKey: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
