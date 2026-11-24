import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Layers,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type {
  CharacterExpression,
  CharacterGender,
  CharacterOutfit,
  Lang,
  StudyProfile,
  UserProfile,
  UserRole,
} from '../types/platform';
import {
  getSchoolStageInfo,
  getSubjectsForGrade,
  SUBJECT_CATALOG,
} from '../data/curriculum';
import { t } from '../i18n/translations';
import { TeacherCharacter3D } from './TeacherCharacter3D';
import type { TeacherDisplayMode } from './TeacherCharacter3D';
import { KazakhOrnamentStrip } from './KazakhOrnamentAccent';
import { apiFetch, setInMemoryToken } from '../utils/apiClient';

interface WelcomeAuthViewProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  aiConfigured: boolean;
  savedUsernames: Array<{ username: string; displayName: string; role: UserRole }>;
  onAuthenticated: (user: UserProfile) => void;
  onEnterGuest: (role: UserRole, targetTab?: string) => void;
  initialAuthMode?: AuthMode;
}

type AuthMode = 'welcome' | 'register' | 'login' | 'recover';

export function WelcomeAuthView({
  lang,
  onChangeLang,
  aiConfigured,
  savedUsernames,
  onAuthenticated,
  onEnterGuest,
  initialAuthMode = 'welcome',
}: WelcomeAuthViewProps) {
  const [mode, setMode] = useState<AuthMode>(initialAuthMode);
  const [charDisplayMode, setCharDisplayMode] = useState<TeacherDisplayMode>('both');
  const [charGender, setCharGender] = useState<CharacterGender>('female');
  const [charOutfit, setCharOutfit] = useState<CharacterOutfit>('classic');
  const [charExpr, setCharExpr] = useState<CharacterExpression>('greeting');

  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [interfaceLang, setInterfaceLang] = useState<Lang>(lang);
  const [schoolLang, setSchoolLang] = useState<Lang>(lang);
  const [grade, setGrade] = useState<number>(7);
  const [profile, setProfile] = useState<StudyProfile>('general');
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>(['math']);
  const [teacherClasses, setTeacherClasses] = useState<number[]>([7, 8, 9]);
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stageInfo = getSchoolStageInfo(grade);
  const stageSubjectsCount = getSubjectsForGrade(grade).length;

  const toggleTeacherSubject = (id: string) => {
    setTeacherSubjects((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id]
    );
  };

  const toggleTeacherClass = (cls: number) => {
    setTeacherClasses((prev) =>
      prev.includes(cls)
        ? prev.length > 1
          ? prev.filter((x) => x !== cls)
          : prev
        : [...prev, cls].sort((a, b) => a - b)
    );
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().replace(/\s+/g, '_');
    const cleanDisplayName = displayName.trim();
    const cleanRecovery = recoveryPhrase.trim();

    if (cleanUsername.length < 3) {
      setError(
        lang === 'kk'
          ? 'Логин кемінде 3 таңбадан тұруы тиіс.'
          : 'Логин должен содержать минимум 3 символа.'
      );
      return;
    }
    if (cleanDisplayName.length < 2) {
      setError(
        lang === 'kk'
          ? 'Атыңызды енгізіңіз (кемінде 2 әріп).'
          : 'Введите имя (минимум 2 символа).'
      );
      return;
    }

    setLoading(true);
    try {
      const effectiveProfile: StudyProfile = grade >= 10 ? profile : 'general';
      const res = await apiFetch<{ user: UserProfile; token: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            username: cleanUsername,
            displayName: cleanDisplayName,
            password,
            recoveryPhrase: cleanRecovery,
            role,
            interfaceLang,
            schoolLang,
            grade,
            profile: effectiveProfile,
            characterGender: charGender,
            characterOutfit: charOutfit,
            teacherSubjects,
            teacherClasses,
          }),
        }
      );
      setInMemoryToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ user: UserProfile; token: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username: username.trim(), password }),
        }
      );
      setInMemoryToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await apiFetch<{ ok: boolean }>('/api/auth/recover', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          recoveryPhrase: recoveryPhrase.trim(),
          newPassword,
        }),
      });
      setNotice(
        lang === 'kk'
          ? 'Құпиясөз жаңартылды. Енді жаңа құпиясөзбен кіре аласыз.'
          : 'Пароль обновлён. Теперь вы можете войти с новым паролем.'
      );
      setMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка восстановления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-[#faf8f3] to-white dark:from-[#090d16] dark:via-[#0c1220] dark:to-[#090d16] text-slate-900 dark:text-zinc-50 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-sky-200/70 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => {
              setMode('welcome');
              setError(null);
            }}
            className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white flex items-center justify-center text-sm font-black shadow-sm">
              Ұ
            </span>
            <span>AI Ұстаз</span>
          </button>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => onEnterGuest('student', 'subjects')}
              className="hover:text-sky-700 dark:hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(lang, 'navSubjects')}
            </button>
            <button
              type="button"
              onClick={() => onEnterGuest('student', 'tutor')}
              className="hover:text-sky-700 dark:hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(lang, 'navTutor')}
            </button>
            <button
              type="button"
              onClick={() => onEnterGuest('student', 'diagnostics')}
              className="hover:text-sky-700 dark:hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'kk' ? 'Диагностика' : 'Диагностика'}
            </button>
            <button
              type="button"
              onClick={() => onEnterGuest('teacher', 'studio')}
              className="hover:text-indigo-700 dark:hover:text-indigo-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(lang, 'navTeacherStudio')}
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-zinc-700 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChangeLang('kk')}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  lang === 'kk'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                ҚАЗ
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('ru')}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  lang === 'ru'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                РУС
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setInterfaceLang(lang);
                setSchoolLang(lang);
                setError(null);
              }}
              className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(lang, 'register')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t(lang, 'login')}
            </button>
          </div>
        </div>
        <KazakhOrnamentStrip />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8 md:py-12">
        {mode === 'welcome' && (
          <div className="space-y-14">
            {/* Hero Section */}
            <section className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex md:hidden items-center gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => onChangeLang('kk')}
                    className={
                      lang === 'kk' ? 'text-sky-700 dark:text-sky-400' : 'text-slate-500'
                    }
                  >
                    Қазақша
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => onChangeLang('ru')}
                    className={
                      lang === 'ru' ? 'text-sky-700 dark:text-sky-400' : 'text-slate-500'
                    }
                  >
                    Русский
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'kk'
                        ? 'Қазақстан мектептері · 1–11 сыныптар (2026–2027)'
                        : 'Школы Казахстана · 1–11 классы (2026–2027)'}
                    </span>
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    {lang === 'kk' ? 'Тіркелусіз барлығына ашық' : 'Открыто для всех без регистрации'}
                  </span>
                </div>

                <h1
                  className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-zinc-50"
                  style={{ textWrap: 'balance' }}
                >
                  {t(lang, 'heroTitle')}
                </h1>

                <p className="text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  {t(lang, 'heroSubtitle')}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onEnterGuest('student', 'tutor')}
                    className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-2xl shadow-sm transition-all cursor-pointer"
                  >
                    {lang === 'kk'
                      ? 'Оқушы: AI мұғалімді ашу'
                      : 'Ученик · Открыть обучение без входа'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('teacher', 'studio')}
                    className="px-6 py-3.5 text-sm font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl transition-colors cursor-pointer"
                  >
                    {lang === 'kk'
                      ? 'Мұғалім студиясын ашу'
                      : 'Учитель · Открыть студию без входа'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterfaceLang(lang);
                      setSchoolLang(lang);
                      setMode('register');
                    }}
                    className="px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-2xl transition-colors cursor-pointer"
                  >
                    {lang === 'kk' ? 'Аккаунт ашу / Кіру' : 'Личный аккаунт'}
                  </button>
                </div>

                {!aiConfigured && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {t(lang, 'aiNotConnected')}
                  </p>
                )}

                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 pt-1">
                  {t(lang, 'authorCredit')}
                </p>
              </div>

              {/* Interactive Human 3D Teachers Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 shadow-sm p-4 space-y-3">
                  <TeacherCharacter3D
                    gender={charGender}
                    outfit={charOutfit}
                    expression={charExpr}
                    displayMode={charDisplayMode}
                    hintText={t(lang, 'teacher3dHint')}
                    className="w-full h-80 sm:h-88 rounded-2xl bg-gradient-to-b from-sky-50 via-amber-50/30 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
                  />

                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setCharDisplayMode('both')}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                            charDisplayMode === 'both'
                              ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 shadow-sm'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {lang === 'kk' ? 'Екеуі' : 'Оба учителя'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCharDisplayMode('single');
                            setCharGender('female');
                          }}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                            charDisplayMode === 'single' && charGender === 'female'
                              ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 shadow-sm'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {lang === 'kk' ? 'Мұғалім әйел' : 'Учитель-женщина'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCharDisplayMode('single');
                            setCharGender('male');
                          }}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                            charDisplayMode === 'single' && charGender === 'male'
                              ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 shadow-sm'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {lang === 'kk' ? 'Мұғалім ер' : 'Учитель-мужчина'}
                        </button>
                      </div>

                      <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl gap-1">
                        {(['classic', 'academic', 'tech'] as const).map((o, idx) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setCharOutfit(o)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                              charOutfit === o
                                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 shadow-sm'
                                : 'text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {lang === 'kk' ? `Стиль ${idx + 1}` : `Образ ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { id: 'greeting', ru: 'Машет рукой', kk: 'Қол бұлғау' },
                          { id: 'explaining', ru: 'Объясняет у доски', kk: 'Түсіндіруде' },
                          { id: 'happy', ru: 'Радуется', kk: 'Қуану' },
                          { id: 'thinking', ru: 'Думает', kk: 'Ойлану' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCharExpr(item.id)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                            charExpr === item.id
                              ? 'border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40'
                              : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {item[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dual Audience Showcase: For Schoolchildren & For Teachers */}
            <section className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 p-6 md:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {lang === 'kk' ? '1–11 сынып оқушыларына' : 'Для школьников 1–11 классов'}
                    </span>
                    <h2 className="font-display text-xl font-extrabold">
                      {lang === 'kk' ? 'Оқушының жеке кеңістігі' : 'Удобная учёба каждый день'}
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onEnterGuest('student', 'subjects')}
                    className="text-left p-3.5 rounded-2xl bg-sky-50/70 dark:bg-zinc-950 border border-sky-100 dark:border-zinc-800 hover:border-sky-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      {lang === 'kk' ? 'Сынып бойынша пәндер' : 'Ступени 1–4, 5–6, 7, 8–9, 10–11'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? '1–9 сыныпта жалпы бағдарлама, 10–11 сыныпта бағыт таңдау.'
                        : 'В 1–9 классах единая программа, в 10–11 — выбор направления.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('student', 'tutor')}
                    className="text-left p-3.5 rounded-2xl bg-teal-50/70 dark:bg-zinc-950 border border-teal-100 dark:border-zinc-800 hover:border-teal-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      {t(lang, 'navTutor')}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Күрделі есептер мен ережелерді қадамдап түсіндіреді.'
                        : 'Понятные пошаговые объяснения по вашим темам и задачам.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('student', 'diagnostics')}
                    className="text-left p-3.5 rounded-2xl bg-amber-50/70 dark:bg-zinc-950 border border-amber-100 dark:border-zinc-800 hover:border-amber-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                      {t(lang, 'navDiagnostics')}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Олқылықтарды тауып, қайталау жоспарын жасайды.'
                        : 'Находит пробелы без стресса и строит маршрут повторения.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('student', 'schedule')}
                    className="text-left p-3.5 rounded-2xl bg-sky-50/70 dark:bg-zinc-950 border border-sky-100 dark:border-zinc-800 hover:border-sky-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      {t(lang, 'navSchedule')}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Қоңырау кестесі, үй тапсырмасы және БЖБ/ТЖБ ескертпелері.'
                        : 'Смены звонков, домашка, СОР и СОЧ в одном расписании.'}
                    </p>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-indigo-200/80 dark:border-zinc-800 p-6 md:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {lang === 'kk' ? 'Мұғалімдер мен педагогтарға' : 'Для учителей и педагогов'}
                    </span>
                    <h2 className="font-display text-xl font-extrabold">
                      {lang === 'kk' ? 'Мұғалімнің цифрлық студиясы' : 'Быстрая подготовка к урокам'}
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onEnterGuest('teacher', 'studio')}
                    className="text-left p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-800 hover:border-indigo-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100">
                      {lang === 'kk' ? 'Презентациялар (слайд редактор)' : 'Презентации со слайдами'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Слайдтарды өңдеу, орнын ауыстыру және HTML-ге сақтау.'
                        : 'Генерация слайдов, редактирование текста, сортировка и экспорт.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('teacher', 'studio')}
                    className="text-left p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-800 hover:border-indigo-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100">
                      {lang === 'kk' ? 'ҚМЖ және сабақ жоспарлары' : 'Поурочные планы (ҚМЖ)'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Оқу мақсаттары мен сабақ кезеңдері көрсетілген дайын құрылым.'
                        : 'Готовая структура урока с целями обучения и этапами занятия.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('teacher', 'studio')}
                    className="text-left p-3.5 rounded-2xl bg-amber-50/70 dark:bg-zinc-950 border border-amber-100 dark:border-zinc-800 hover:border-amber-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100">
                      {lang === 'kk' ? 'Тесттер, БЖБ/ТЖБ және рубрикалар' : 'Тесты с ключами, СОР/СОЧ, рубрики'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Жауап кілті, бағалау критерийі және деңгейлік тапсырмалар.'
                        : 'Автогенерация вариантов, ключей ответов и критериев оценивания.'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterGuest('teacher', 'curriculum')}
                    className="text-left p-3.5 rounded-2xl bg-teal-50/70 dark:bg-zinc-950 border border-teal-100 dark:border-zinc-800 hover:border-teal-400 space-y-1 transition-colors cursor-pointer"
                  >
                    <p className="font-bold text-slate-900 dark:text-zinc-100">
                      {lang === 'kk' ? '1–11 сынып оқу базасы' : 'Справочник программы 1–11'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">
                      {lang === 'kk'
                        ? 'Қазақ және орыс мектептеріне арналған пәндер мен ресми сілтемелер.'
                        : 'Разбивка по ступеням, целям обучения и приказам РК.'}
                    </p>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {mode === 'register' && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                {t(lang, 'register')}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {lang === 'kk' ? 'Аккаунтыңыз бар ма? Кіру' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                  role === 'student'
                    ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Оқушы / Ученик
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                  role === 'teacher'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Мұғалім / Учитель
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {lang === 'kk' ? 'Атыңыз' : 'Имя'}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={lang === 'kk' ? 'Мысалы, Әлия' : 'Например, Алия'}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {lang === 'kk' ? 'Логин (бос орынсыз, 3+ таңба)' : 'Логин (без пробелов, от 3 символов)'}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="aliya_7b"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {lang === 'kk' ? 'Құпиясөз (кемінде 6 таңба)' : 'Пароль (от 6 символов)'}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {lang === 'kk' ? 'Қалпына келтіру сөзі (3+ таңба)' : 'Кодовое слово (от 3 символов)'}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={recoveryPhrase}
                    onChange={(e) => setRecoveryPhrase(e.target.value)}
                    placeholder={lang === 'kk' ? 'Мысалы, сүйікті кітап' : 'Например, любимая книга'}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {t(lang, 'interfaceLangLabel')}
                  </label>
                  <select
                    value={interfaceLang}
                    onChange={(e) => setInterfaceLang(e.target.value as Lang)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                  >
                    <option value="kk">Қазақша</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      {t(lang, 'schoolLangLabel')}
                    </label>
                    <select
                      value={schoolLang}
                      onChange={(e) => setSchoolLang(e.target.value as Lang)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                    >
                      <option value="kk">Қазақ тілінде оқытатын мектеп</option>
                      <option value="ru">Русский язык обучения</option>
                    </select>
                  </div>
                )}
              </div>

              {role === 'student' ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        {t(lang, 'gradeLabel')} (1–11)
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => {
                          const g = Number(e.target.value);
                          setGrade(g);
                          if (g < 10) setProfile('general');
                        }}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                      >
                        {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                          <option key={g} value={g}>
                            {g} {lang === 'kk' ? 'сынып' : 'класс'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {grade >= 10 ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                          {t(lang, 'profileLabel')}
                        </label>
                        <select
                          value={profile}
                          onChange={(e) => setProfile(e.target.value as StudyProfile)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                        >
                          <option value="general">{t(lang, 'profileGeneral')}</option>
                          <option value="humanitarian">{t(lang, 'profileHumanitarian')}</option>
                          <option value="physmath">{t(lang, 'profilePhysmath')}</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                          {lang === 'kk' ? 'Оқу бағдарламасы (бағыты)' : 'Программа обучения'}
                        </label>
                        <div className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-sky-200 dark:border-zinc-700 bg-sky-50/70 dark:bg-zinc-950 text-sky-900 dark:text-sky-300">
                          {t(lang, 'profileGeneral')}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-zinc-950 border border-sky-200/70 dark:border-zinc-800 text-xs space-y-1">
                    <p className="font-bold text-slate-900 dark:text-zinc-100">
                      {stageInfo.label[lang]} · {stageSubjectsCount}{' '}
                      {lang === 'kk' ? 'пән' : 'предметов'}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-400">{stageInfo.note[lang]}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                      {lang === 'kk' ? 'Пәндеріңіз' : 'Преподаваемые предметы'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
                      {SUBJECT_CATALOG.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleTeacherSubject(s.id)}
                          className={`px-2.5 py-1 text-xs rounded-xl border cursor-pointer ${
                            teacherSubjects.includes(s.id)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {s.name[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                      {lang === 'kk' ? 'Сыныптар' : 'Классы'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleTeacherClass(c)}
                          className={`w-8 h-8 text-xs font-semibold rounded-xl border cursor-pointer tabular-nums ${
                            teacherClasses.includes(c)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {lang === 'kk'
                  ? 'Кәмелетке толмағандардың қауіпсіздігі үшін үй мекенжайы, телефон немесе артық жеке деректер сұралмайды.'
                  : 'Для безопасности несовершеннолетних мы не запрашиваем адрес, телефон или лишние персональные данные.'}
              </p>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-60 rounded-2xl transition-all cursor-pointer"
              >
                {loading
                  ? lang === 'kk'
                    ? 'Тіркелуде...'
                    : 'Создание аккаунта...'
                  : t(lang, 'startLearning')}
              </button>
            </form>
          </div>
        )}

        {mode === 'login' && (
          <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                {t(lang, 'login')}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {t(lang, 'register')}
              </button>
            </div>

            {savedUsernames.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {lang === 'kk'
                    ? 'Осы құрылғыдағы аккаунттар (құпиясөзбен кіру):'
                    : 'Аккаунты на этом устройстве (выберите логин):'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedUsernames.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => setUsername(acc.username)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-sky-600 cursor-pointer"
                    >
                      {acc.displayName} ({acc.username})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {notice && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{notice}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  {lang === 'kk' ? 'Құпиясөз' : 'Пароль'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:border-sky-600"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-60 rounded-2xl transition-all cursor-pointer"
              >
                {loading ? '...' : t(lang, 'login')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('recover');
                  setError(null);
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                {t(lang, 'recoverTitle')}
              </button>
            </form>
          </div>
        )}

        {mode === 'recover' && (
          <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 shadow-sm p-6 md:p-8 space-y-5">
            <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-zinc-50">
              {t(lang, 'recoverTitle')}
            </h1>
            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  {lang === 'kk' ? 'Қалпына келтіру сөзі' : 'Кодовое слово'}
                </label>
                <input
                  type="text"
                  required
                  value={recoveryPhrase}
                  onChange={(e) => setRecoveryPhrase(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  {lang === 'kk' ? 'Жаңа құпиясөз' : 'Новый пароль (от 6 символов)'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer"
                >
                  {lang === 'kk' ? 'Жаңарту' : 'Сбросить пароль'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2.5 text-sm border border-slate-300 dark:border-zinc-700 rounded-xl cursor-pointer"
                >
                  {lang === 'kk' ? 'Артқа' : 'Назад'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-sky-200/70 dark:border-zinc-800 py-5 px-6 text-xs text-slate-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-900/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>AI Ұстаз · {t(lang, 'authorCredit')}</span>
          <span>1–11 классы · Қазақша / Русский</span>
        </div>
      </footer>
    </div>
  );
}
