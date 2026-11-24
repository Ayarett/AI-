import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquarePlus, Send, Trash2 } from 'lucide-react';
import type {
  CharacterExpression,
  CharacterGender,
  CharacterOutfit,
  ChatThread,
  Lang,
  StudyProfile,
} from '../types/platform';
import { getSubjectsForGrade, resolveSubjectContentLang } from '../data/curriculum';
import { t } from '../i18n/translations';
import { apiFetch } from '../utils/apiClient';
import { getStudentAdaptationContext } from '../utils/studentHistory';
import { TeacherCharacter3D } from './TeacherCharacter3D';

interface AiTutorViewProps {
  profileKey?: string;
  interfaceLang: Lang;
  schoolLang: Lang;
  userGrade: number;
  profile?: StudyProfile;
  isGuest?: boolean;
  charGender: CharacterGender;
  charOutfit: CharacterOutfit;
  aiConfigured: boolean;
  initialSubjectId?: string;
  initialGrade?: number;
  initialTopicTitle?: string;
  threads: ChatThread[];
  onThreadsChange: (threads: ChatThread[]) => void;
}

export function AiTutorView({
  profileKey = 'guest',
  interfaceLang,
  schoolLang,
  userGrade,
  profile = 'general',
  isGuest = false,
  charGender,
  charOutfit,
  aiConfigured,
  initialSubjectId,
  initialGrade,
  initialTopicTitle,
  threads,
  onThreadsChange,
}: AiTutorViewProps) {
  const [grade, setGrade] = useState<number>(initialGrade ?? userGrade);
  const subjects = getSubjectsForGrade(grade);
  const [subjectId, setSubjectId] = useState<string>(
    initialSubjectId && subjects.some((s) => s.id === initialSubjectId)
      ? initialSubjectId
      : subjects[0]?.id ?? 'math'
  );
  const [topicTitle, setTopicTitle] = useState<string>(initialTopicTitle ?? '');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expression, setExpression] = useState<CharacterExpression>('greeting');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSubjectId) {
      const targetG = initialGrade ?? userGrade;
      setGrade(targetG);
      setSubjectId(initialSubjectId);
      if (initialTopicTitle) setTopicTitle(initialTopicTitle);
      setActiveThreadId(null);
    }
  }, [initialSubjectId, initialGrade, initialTopicTitle, userGrade]);

  const activeThread = threads.find((th) => th.id === activeThreadId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length, loading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    setExpression('thinking');

    try {
      const history = activeThread
        ? activeThread.messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          }))
        : [];
      const adaptation = getStudentAdaptationContext(profileKey, subjectId);
      const res = await apiFetch<{ thread: ChatThread; chatThreads: ChatThread[] }>(
        '/api/ai/tutor',
        {
          method: 'POST',
          body: JSON.stringify({
            threadId: activeThreadId,
            subjectId,
            grade,
            profile: grade < 10 ? 'general' : profile,
            interfaceLang,
            schoolLang,
            topicTitle,
            message: trimmed,
            history,
            weakTopics: adaptation.weakTopics,
          }),
        }
      );
      if (isGuest) {
        const nextThreads = [
          res.thread,
          ...threads.filter((th) => th.id !== res.thread.id),
        ].slice(0, 30);
        onThreadsChange(nextThreads);
      } else {
        onThreadsChange(res.chatThreads);
      }
      setActiveThreadId(res.thread.id);
      setInput('');
      setExpression('explaining');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка AI-учителя');
      setExpression('calm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleClearOrNew = async () => {
    if (activeThreadId) {
      if (isGuest) {
        onThreadsChange(threads.filter((th) => th.id !== activeThreadId));
      } else {
        try {
          const res = await apiFetch<{ chatThreads: ChatThread[] }>(
            `/api/ai/threads/${activeThreadId}`,
            { method: 'DELETE' }
          );
          onThreadsChange(res.chatThreads);
        } catch {
          // Ignore deletion error
        }
      }
    }
    setActiveThreadId(null);
    setInput('');
    setError(null);
    setExpression('greeting');
  };

  const tutorContentLang = resolveSubjectContentLang(subjectId, interfaceLang);
  const starterPrompts =
    tutorContentLang === 'en'
      ? [
          'Explain this grammar or vocabulary topic with clear B1/B2 examples',
          'Give me 2 grade-appropriate practice exercises and check my answers',
          'Show common mistakes students make on this topic and how to avoid them',
        ]
      : tutorContentLang === 'kk'
        ? [
            'Осы тақырыпты сынып деңгейіне сай мысалдармен түсіндірші',
            'Маған 2 жаттығу тапсырмасын беріп, жауабымды тексерші',
            'Осы тақырыпта жиі кездесетін қателерді талдап көрсетші',
          ]
        : [
            'Объясни эту тему строго по программе класса с яркими примерами',
            'Дай мне 2 тренировочных задания моего класса и проверь моё решение',
            'Покажи пошаговый разбор типичной ошибки по этой теме',
          ];

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 p-4 space-y-3">
          <TeacherCharacter3D
            gender={charGender}
            outfit={charOutfit}
            expression={expression}
            hintText={t(interfaceLang, 'teacher3dHint')}
            className="w-full h-64 rounded-2xl bg-gradient-to-b from-sky-50 via-amber-50/20 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
          />

          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  {t(interfaceLang, 'gradeLabel')}
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setGrade(g);
                    const nextSubjs = getSubjectsForGrade(g);
                    if (!nextSubjs.some((s) => s.id === subjectId)) {
                      setSubjectId(nextSubjs[0]?.id ?? 'math');
                    }
                  }}
                  className="w-full px-2.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
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
                  className="w-full px-2.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name[schoolLang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
                {interfaceLang === 'kk' ? 'Тақырып (қалауыңызша)' : 'Тема (необязательно)'}
              </label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder={
                  interfaceLang === 'kk' ? 'Мысалы: Квадрат теңдеу' : 'Например: Квадратные уравнения'
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
              {interfaceLang === 'kk' ? 'Сұхбаттар тарихы' : 'Сохранённые диалоги'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setActiveThreadId(null);
                setExpression('greeting');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{t(interfaceLang, 'newChat')}</span>
            </button>
          </div>

          {threads.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {interfaceLang === 'kk'
                ? 'Сұхбаттар осы жерде сақталады.'
                : 'История ваших диалогов с учителем появится здесь.'}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {threads.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(th.id);
                    setGrade(th.grade);
                    setSubjectId(th.subjectId);
                    setTopicTitle(th.topicTitle);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    th.id === activeThreadId
                      ? 'border-blue-600/50 bg-blue-50/40 dark:bg-blue-950/20 font-semibold'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400'
                  }`}
                >
                  <div className="truncate text-slate-900 dark:text-zinc-100">{th.topicTitle}</div>
                  <div className="text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                    {th.grade} {interfaceLang === 'kk' ? 'сынып' : 'кл.'} · {th.messages.length} сообщ.
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col min-h-[520px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50 truncate">
              {t(interfaceLang, 'navTutor')}
            </h1>
            {!aiConfigured && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t(interfaceLang, 'aiNotConnected')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearOrNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t(interfaceLang, 'clearChat')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="space-y-5 py-6">
              <div className="space-y-1.5">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-zinc-50">
                  {interfaceLang === 'kk'
                    ? 'Сұрағыңызды жазыңыз — бірге талдаймыз'
                    : 'Задайте любой вопрос — разберём тему шаг за шагом'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
                  {interfaceLang === 'kk'
                    ? 'Мен дайын жауапты жай ғана көшіруге емес, шешу жолын түсінуге көмектесемін.'
                    : 'Я объясняю ход решения, показываю примеры и помогаю исправить ошибки без сложных терминов.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5">
                {starterPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(p)}
                    className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-600/60 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeThread.messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLastAssistant =
                !isUser && idx === activeThread.messages.length - 1;
              return (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  {isLastAssistant && !loading && (
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          setInput('');
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer"
                      >
                        {t(interfaceLang, 'anotherQuestion')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              {interfaceLang === 'kk'
                ? 'AI Ұстаз түсіндірме дайындауда...'
                : 'AI Ұстаз готовит объяснение...'}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={
              interfaceLang === 'kk'
                ? 'Тақырып немесе есеп бойынша сұрақ жазыңыз...'
                : 'Напишите вопрос по теме или задаче...'
            }
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-zinc-800 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">
              {interfaceLang === 'kk' ? 'Жіберу' : 'Отправить'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
