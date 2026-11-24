import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import type {
  ChatThread,
  DiagnosticAttempt,
  Lang,
  ScheduleConfig,
  ScheduleLesson,
  StudentTask,
  StudyProfile,
  TeacherMaterial,
  UserProfile,
  UserRole,
} from './types/platform';
import {
  getSchoolStageInfo,
  getSubjectName,
  getSubjectsForGrade,
} from './data/curriculum';
import { t } from './i18n/translations';
import { apiFetch, setInMemoryToken } from './utils/apiClient';
import { WelcomeAuthView } from './components/WelcomeAuthView';
import { SubjectsView } from './components/SubjectsView';
import { AiTutorView } from './components/AiTutorView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { ScheduleView } from './components/ScheduleView';
import { ProgressView } from './components/ProgressView';
import { TeacherStudioView } from './components/TeacherStudioView';
import { SettingsView } from './components/SettingsView';
import { TeacherCharacter3D } from './components/TeacherCharacter3D';
import { SubjectIllustration } from './components/SubjectIllustration';
import { KazakhOrnamentStrip } from './components/KazakhOrnamentAccent';

type StudentSection =
  | 'home'
  | 'subjects'
  | 'tutor'
  | 'diagnostics'
  | 'schedule'
  | 'progress'
  | 'settings';

type TeacherSection = 'overview' | 'studio' | 'curriculum' | 'settings';

interface WorkspaceState {
  scheduleConfig: ScheduleConfig;
  scheduleLessons: ScheduleLesson[];
  tasks: StudentTask[];
  diagnostics: DiagnosticAttempt[];
  chatThreads: ChatThread[];
  teacherMaterials: TeacherMaterial[];
}

const DEFAULT_WORKSPACE: WorkspaceState = {
  scheduleConfig: {
    startTime: '08:00',
    lessonDuration: 40,
    defaultBreak: 5,
    breakAfterSecond: 10,
    breakAfterThird: 10,
  },
  scheduleLessons: [],
  tasks: [],
  diagnostics: [],
  chatThreads: [],
  teacherMaterials: [],
};

const SAVED_ACCOUNTS_KEY = 'ai_ustaz_accounts_preview_v1';
const THEME_KEY = 'ai_ustaz_theme_v1';
const GUEST_PROFILE_KEY = 'ai_ustaz_guest_profile_v1';
const GUEST_WORKSPACE_KEY = 'ai_ustaz_guest_workspace_v1';

const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'guest',
  username: 'guest',
  displayName: 'Қонақ / Гость',
  role: 'student',
  interfaceLang: 'ru',
  schoolLang: 'ru',
  grade: 7,
  profile: 'general',
  characterGender: 'female',
  characterOutfit: 'classic',
  teacherSubjects: ['math', 'physics', 'informatics'],
  teacherClasses: [5, 6, 7, 8, 9],
  createdAt: '2026-09-01T00:00:00.000Z',
};

function loadGuestProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return DEFAULT_GUEST_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...DEFAULT_GUEST_PROFILE,
      ...parsed,
      id: 'guest',
      username: 'guest',
      grade: Math.min(11, Math.max(1, Number(parsed.grade) || 7)),
      profile:
        (Number(parsed.grade) || 7) < 10
          ? 'general'
          : parsed.profile === 'humanitarian' || parsed.profile === 'physmath'
            ? parsed.profile
            : 'general',
    };
  } catch {
    return DEFAULT_GUEST_PROFILE;
  }
}

function loadGuestWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(GUEST_WORKSPACE_KEY);
    if (!raw) return DEFAULT_WORKSPACE;
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      scheduleConfig: parsed.scheduleConfig ?? DEFAULT_WORKSPACE.scheduleConfig,
      scheduleLessons: Array.isArray(parsed.scheduleLessons) ? parsed.scheduleLessons : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
      chatThreads: Array.isArray(parsed.chatThreads) ? parsed.chatThreads : [],
      teacherMaterials: Array.isArray(parsed.teacherMaterials) ? parsed.teacherMaterials : [],
    };
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

function loadSavedAccounts(): Array<{ username: string; displayName: string; role: UserRole }> {
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestProfile, setGuestProfile] = useState<UserProfile>(loadGuestProfile);
  const [guestWorkspace, setGuestWorkspace] = useState<WorkspaceState>(loadGuestWorkspace);
  const [openAccessActive, setOpenAccessActive] = useState(true);
  const [welcomeAuthMode, setWelcomeAuthMode] = useState<'welcome' | 'register' | 'login'>('login');

  const [aiConfigured, setAiConfigured] = useState(true);
  const [booting, setBooting] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceState>(DEFAULT_WORKSPACE);
  const [savedAccounts, setSavedAccounts] = useState(loadSavedAccounts);

  const [studentTab, setStudentTab] = useState<StudentSection>('home');
  const [teacherTab, setTeacherTab] = useState<TeacherSection>('overview');
  const [teacherBrowseGrade, setTeacherBrowseGrade] = useState<number>(7);
  const [teacherBrowseProfile, setTeacherBrowseProfile] = useState<StudyProfile>('general');

  const [tutorContext, setTutorContext] = useState<{
    subjectId?: string;
    grade?: number;
    topicTitle?: string;
  }>({});
  const [diagContext, setDiagContext] = useState<{
    subjectId?: string;
    grade?: number;
  }>({});

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  const loadWorkspace = useCallback(async () => {
    try {
      const ws = await apiFetch<WorkspaceState>('/api/student/workspace');
      setWorkspace(ws);
    } catch {
      setWorkspace(DEFAULT_WORKSPACE);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [health, me] = await Promise.all([
          apiFetch<{ ok: boolean; aiConfigured: boolean }>('/api/health'),
          apiFetch<{ user: UserProfile | null }>('/api/auth/me'),
        ]);
        if (!active) return;
        setAiConfigured(health.aiConfigured);
        if (me.user) {
          setUser(me.user);
          setTeacherBrowseGrade(me.user.teacherClasses[0] ?? 7);
          await loadWorkspace();
        }
      } catch {
        // Ignore startup check failure
      } finally {
        if (active) setBooting(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadWorkspace]);

  const rememberAccountLabel = (profile: UserProfile) => {
    setSavedAccounts((prev) => {
      const next = [
        { username: profile.username, displayName: profile.displayName, role: profile.role },
        ...prev.filter((a) => a.username !== profile.username),
      ].slice(0, 5);
      try {
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(guestProfile));
    } catch {
      // Ignore
    }
  }, [guestProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify(guestWorkspace));
    } catch {
      // Ignore
    }
  }, [guestWorkspace]);

  const handleAuthenticated = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setOpenAccessActive(false);
    rememberAccountLabel(loggedInUser);
    setStudentTab('home');
    setTeacherTab('overview');
    setTeacherBrowseGrade(loggedInUser.teacherClasses[0] ?? 7);
    setTeacherBrowseProfile('general');
    await loadWorkspace();
  };

  const handleEnterGuest = (nextRole: UserRole, targetTab?: string) => {
    setGuestProfile((prev) => ({
      ...prev,
      role: nextRole,
    }));
    if (nextRole === 'student') {
      const validStudentTabs: StudentSection[] = [
        'home',
        'subjects',
        'tutor',
        'diagnostics',
        'schedule',
        'progress',
        'settings',
      ];
      setStudentTab(
        targetTab && validStudentTabs.includes(targetTab as StudentSection)
          ? (targetTab as StudentSection)
          : 'home'
      );
    } else {
      const validTeacherTabs: TeacherSection[] = [
        'overview',
        'studio',
        'curriculum',
        'settings',
      ];
      setTeacherTab(
        targetTab && validTeacherTabs.includes(targetTab as TeacherSection)
          ? (targetTab as TeacherSection)
          : 'studio'
      );
    }
    setOpenAccessActive(true);
  };

  const handleLogout = async () => {
    if (!user) {
      setOpenAccessActive(false);
      setWelcomeAuthMode('welcome');
      return;
    }
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setInMemoryToken(null);
    setUser(null);
    setOpenAccessActive(false);
    setWelcomeAuthMode('welcome');
    setWorkspace(DEFAULT_WORKSPACE);
  };

  const handleGradeAndProfileChange = async (nextGrade: number, nextProfile: StudyProfile) => {
    if (!user) {
      setGuestProfile((prev) => ({
        ...prev,
        grade: nextGrade,
        profile: nextGrade < 10 ? 'general' : nextProfile,
      }));
      return;
    }
    const res = await apiFetch<{ user: UserProfile }>('/api/account/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ grade: nextGrade, profile: nextProfile }),
    });
    setUser(res.user);
  };

  const openStudyTopic = (subjectId: string, grade: number, topicTitle: string) => {
    setTutorContext({ subjectId, grade, topicTitle });
    setStudentTab('tutor');
  };

  const openDiagnostic = (subjectId: string, grade: number) => {
    setDiagContext({ subjectId, grade });
    setStudentTab('diagnostics');
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-sm text-slate-500">
        AI Ұстаз…
      </div>
    );
  }

  if (!user && !openAccessActive) {
    return (
      <WelcomeAuthView
        key={welcomeAuthMode}
        lang={guestProfile.interfaceLang}
        onChangeLang={(nextLang) =>
          setGuestProfile((prev) => ({
            ...prev,
            interfaceLang: nextLang,
            schoolLang: nextLang,
          }))
        }
        aiConfigured={aiConfigured}
        savedUsernames={savedAccounts}
        onAuthenticated={handleAuthenticated}
        onEnterGuest={handleEnterGuest}
        initialAuthMode={welcomeAuthMode}
      />
    );
  }

  const isGuest = !user;
  const activeUser = user ?? guestProfile;
  const activeWorkspace = user ? workspace : guestWorkspace;
  const updateActiveWorkspace = user ? setWorkspace : setGuestWorkspace;

  const lang = activeUser.interfaceLang;
  const isTeacher = activeUser.role === 'teacher';
  const gradeSubjects = getSubjectsForGrade(activeUser.grade);
  const stageInfo = getSchoolStageInfo(activeUser.grade);

  const studentNavItems: Array<{ id: StudentSection; label: string; icon: typeof Home }> = [
    { id: 'home', label: t(lang, 'navHome'), icon: Home },
    { id: 'subjects', label: t(lang, 'navSubjects'), icon: BookOpen },
    { id: 'tutor', label: t(lang, 'navTutor'), icon: MessageSquare },
    { id: 'diagnostics', label: t(lang, 'navDiagnostics'), icon: ClipboardCheck },
    { id: 'schedule', label: t(lang, 'navSchedule'), icon: Calendar },
    { id: 'progress', label: t(lang, 'navProgress'), icon: LineChart },
    { id: 'settings', label: t(lang, 'navSettings'), icon: Settings },
  ];

  const teacherNavItems: Array<{ id: TeacherSection; label: string; icon: typeof Home }> = [
    { id: 'overview', label: t(lang, 'navTeacherOverview'), icon: Home },
    { id: 'studio', label: t(lang, 'navTeacherStudio'), icon: GraduationCap },
    { id: 'curriculum', label: t(lang, 'navTeacherCurriculum'), icon: BookOpen },
    { id: 'settings', label: t(lang, 'navSettings'), icon: Settings },
  ];

  const pendingHomeworks = activeWorkspace.tasks.filter(
    (tk) => tk.type === 'homework' && !tk.completed
  );
  const upcomingControls = activeWorkspace.tasks.filter(
    (tk) => tk.type === 'control_work' && !tk.completed
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-[#faf8f3] to-white dark:from-[#090d16] dark:via-[#0c1220] dark:to-[#090d16] text-slate-900 dark:text-zinc-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex w-64 shrink-0 flex-col border-r ${
          isTeacher
            ? 'border-indigo-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900'
            : 'border-sky-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-xl text-white flex items-center justify-center text-xs font-black ${
                isTeacher
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600'
                  : 'bg-gradient-to-br from-sky-500 to-teal-500'
              }`}
            >
              Ұ
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              AI Ұстаз
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            {isTeacher ? t(lang, 'teacherRole') : `${activeUser.grade} ${lang === 'kk' ? 'сынып' : 'кл.'}`}
          </span>
        </div>

        {isGuest && (
          <div className="px-3 pt-3">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() =>
                  setGuestProfile((prev) => ({ ...prev, role: 'student' }))
                }
                className={`py-1.5 rounded-lg cursor-pointer ${
                  !isTeacher
                    ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                {lang === 'kk' ? 'Оқушы' : 'Ученик'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGuestProfile((prev) => ({ ...prev, role: 'teacher' }))
                }
                className={`py-1.5 rounded-lg cursor-pointer ${
                  isTeacher
                    ? 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                {lang === 'kk' ? 'Мұғалім' : 'Учитель'}
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {isTeacher
            ? teacherNavItems.map((item) => {
                const Icon = item.icon;
                const active = teacherTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTeacherTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-indigo-50/70 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })
            : studentNavItems.map((item) => {
                const Icon = item.icon;
                const active = studentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStudentTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-sky-50/70 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
        </nav>

        <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 space-y-2 text-xs">
          <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">
            {activeUser.displayName}
          </div>
          <p className="text-slate-500 dark:text-zinc-400 truncate">
            {t(lang, 'authorCredit')}
          </p>
          {isGuest ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setWelcomeAuthMode('login');
                  setOpenAccessActive(false);
                }}
                className="w-full py-2 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 cursor-pointer"
              >
                {t(lang, 'login')} / {t(lang, 'register')}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-400 text-slate-600 dark:text-zinc-300 cursor-pointer"
              >
                {lang === 'kk' ? 'Басты бет' : 'На главную'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-slate-400 text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t(lang, 'switchAccount')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0">
        <header className="shrink-0 border-b border-sky-200/70 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
          <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden font-display text-base font-extrabold shrink-0">
              AI Ұстаз
            </span>
            <span className="hidden lg:inline text-sm font-medium text-slate-600 dark:text-zinc-400 truncate">
              {isTeacher
                ? `${t(lang, 'teacherRole')} · ${activeUser.displayName}`
                : `${activeUser.displayName} · ${activeUser.grade} ${
                    lang === 'kk' ? 'сынып' : 'класс'
                  } · ${
                    activeUser.schoolLang === 'kk'
                      ? 'Қазақ мектебі'
                      : 'Русский язык обучения'
                  }`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGuest && (
              <button
                type="button"
                onClick={() =>
                  setGuestProfile((prev) => ({
                    ...prev,
                    role: prev.role === 'teacher' ? 'student' : 'teacher',
                  }))
                }
                className="lg:hidden px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                {isTeacher
                  ? lang === 'kk'
                    ? 'Оқушы'
                    : 'Ученик'
                  : lang === 'kk'
                    ? 'Мұғалім'
                    : 'Учитель'}
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                const nextLang: Lang = lang === 'kk' ? 'ru' : 'kk';
                if (!user) {
                  setGuestProfile((prev) => ({
                    ...prev,
                    interfaceLang: nextLang,
                  }));
                  return;
                }
                const res = await apiFetch<{ user: UserProfile }>(
                  '/api/account/preferences',
                  {
                    method: 'PATCH',
                    body: JSON.stringify({ interfaceLang: nextLang }),
                  }
                );
                setUser(res.user);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              {lang === 'kk' ? 'РУС' : 'ҚАЗ'}
            </button>
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Переключить тему"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() =>
                isTeacher ? setTeacherTab('settings') : setStudentTab('settings')
              }
              aria-label={t(lang, 'navSettings')}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t(lang, 'logout')}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          </div>
          <KazakhOrnamentStrip />
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6">
          {!isTeacher && studentTab === 'home' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6 items-center rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 shadow-sm p-6">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-sky-700 dark:text-sky-400">
                      {stageInfo.label[lang]} ·{' '}
                      {activeUser.schoolLang === 'kk'
                        ? t(lang, 'schoolLangKk')
                        : t(lang, 'schoolLangRu')}
                    </p>
                    {isGuest && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                        {lang === 'kk' ? 'Барлығына ашық' : 'Открыто для всех'}
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-zinc-50">
                    {t(lang, 'welcomeGreeting')}, {activeUser.displayName}!
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                    {lang === 'kk'
                      ? 'Бүгін қай пәнді талдаймыз? Тақырыпты оқып, AI мұғалімге сұрақ қойыңыз, білім деңгейіңізді тексеріңіз немесе мұғалім студиясын ашыңыз.'
                      : 'Выберите предмет, задайте вопрос AI-учителю, пройдите диагностику или перейдите в студию учителя — всё работает сразу без регистрации.'}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setStudentTab('tutor')}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl shadow-sm cursor-pointer"
                    >
                      {t(lang, 'navTutor')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentTab('diagnostics')}
                      className="px-5 py-2.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:border-sky-500 rounded-xl cursor-pointer"
                    >
                      {t(lang, 'navDiagnostics')}
                    </button>
                    {isGuest && (
                      <button
                        type="button"
                        onClick={() => {
                          setGuestProfile((prev) => ({ ...prev, role: 'teacher' }));
                          setTeacherTab('studio');
                        }}
                        className="px-5 py-2.5 text-sm font-semibold text-indigo-800 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-xl cursor-pointer"
                      >
                        {t(lang, 'navTeacherStudio')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <TeacherCharacter3D
                    gender={activeUser.characterGender}
                    outfit={activeUser.characterOutfit}
                    displayMode="both"
                    expression="greeting"
                    hintText={t(lang, 'teacher3dHint')}
                    className="w-full h-64 rounded-2xl bg-gradient-to-b from-sky-50 via-amber-50/20 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Сынып пәндері' : 'Предметов в программе'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {gradeSubjects.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Үй тапсырмалары' : 'Активные ДЗ'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {pendingHomeworks.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Алдағы бақылаулар' : 'Предстоящие контрольные'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-amber-600">
                    {upcomingControls.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Диагностикалар' : 'Диагностик пройдено'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-emerald-600">
                    {activeWorkspace.diagnostics.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-zinc-50">
                    {t(lang, 'navSubjects')} ({activeUser.grade} {lang === 'kk' ? 'сынып' : 'класс'})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStudentTab('subjects')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {lang === 'kk' ? 'Барлығын ашу →' : 'Открыть все →'}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradeSubjects.slice(0, 6).map((subj) => (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => setStudentTab('subjects')}
                      className="text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-600/60 flex items-center gap-3.5 cursor-pointer"
                    >
                      <SubjectIllustration iconKey={subj.iconKey} className="w-11 h-11 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50 truncate">
                          {subj.name[lang]}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {subj.name[lang === 'kk' ? 'ru' : 'kk']}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold">
                      {lang === 'kk' ? 'Кесте және тапсырмалар' : 'Расписание и задания'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStudentTab('schedule')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
                    >
                      {lang === 'kk' ? 'Кестені ашу' : 'Открыть'}
                    </button>
                  </div>
                  {activeWorkspace.tasks.length === 0 && activeWorkspace.scheduleLessons.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      {lang === 'kk'
                        ? '«Менің кестем» бөлімінде сабақтар мен үй тапсырмаларын қосыңыз.'
                        : 'Добавьте уроки и домашние задания в разделе «Моё расписание».'}
                    </p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {activeWorkspace.tasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                        >
                          <span className={task.completed ? 'line-through text-slate-400' : 'font-medium'}>
                            {task.title} ({getSubjectName(task.subjectId, lang)})
                          </span>
                          <span className="text-slate-500 font-mono tabular-nums">{task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold">
                      {lang === 'kk' ? 'Оқу тарихы' : 'История обучения'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStudentTab('progress')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
                    >
                      {t(lang, 'navProgress')}
                    </button>
                  </div>
                  {activeWorkspace.diagnostics.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      {lang === 'kk'
                        ? 'Алғашқы диагностика нәтижелері осы жерде пайда болады.'
                        : 'Здесь появятся результаты ваших диагностик и прогресс.'}
                    </p>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {activeWorkspace.diagnostics.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                        >
                          <span className="font-medium">
                            {d.subjectName} · {d.targetGrade} {lang === 'kk' ? 'сынып' : 'кл.'}
                          </span>
                          <span className="font-mono font-bold tabular-nums text-blue-600">
                            {d.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isTeacher && studentTab === 'subjects' && (
            <SubjectsView
              interfaceLang={lang}
              schoolLang={activeUser.schoolLang}
              grade={activeUser.grade}
              profile={activeUser.profile}
              onChangeGradeAndProfile={handleGradeAndProfileChange}
              onStudyTopic={openStudyTopic}
              onRunDiagnostic={openDiagnostic}
            />
          )}

          {!isTeacher && studentTab === 'tutor' && (
            <AiTutorView
              interfaceLang={lang}
              schoolLang={activeUser.schoolLang}
              userGrade={activeUser.grade}
              profile={activeUser.profile}
              isGuest={isGuest}
              charGender={activeUser.characterGender}
              charOutfit={activeUser.characterOutfit}
              aiConfigured={aiConfigured}
              initialSubjectId={tutorContext.subjectId}
              initialGrade={tutorContext.grade}
              initialTopicTitle={tutorContext.topicTitle}
              threads={activeWorkspace.chatThreads}
              onThreadsChange={(chatThreads) =>
                updateActiveWorkspace((prev) => ({ ...prev, chatThreads }))
              }
            />
          )}

          {!isTeacher && studentTab === 'diagnostics' && (
            <DiagnosticsView
              interfaceLang={lang}
              schoolLang={activeUser.schoolLang}
              userGrade={activeUser.grade}
              profile={activeUser.profile}
              charGender={activeUser.characterGender}
              charOutfit={activeUser.characterOutfit}
              initialSubjectId={diagContext.subjectId}
              initialGrade={diagContext.grade}
              onAttemptSaved={(diagnostics) =>
                updateActiveWorkspace((prev) => ({
                  ...prev,
                  diagnostics: isGuest
                    ? [diagnostics[0], ...prev.diagnostics.filter((d) => d.id !== diagnostics[0]?.id)].slice(0, 50)
                    : diagnostics,
                }))
              }
              onStudyWeakTopic={openStudyTopic}
            />
          )}

          {!isTeacher && studentTab === 'schedule' && (
            <ScheduleView
              interfaceLang={lang}
              schoolLang={activeUser.schoolLang}
              grade={activeUser.grade}
              isGuest={isGuest}
              config={activeWorkspace.scheduleConfig}
              lessons={activeWorkspace.scheduleLessons}
              tasks={activeWorkspace.tasks}
              onScheduleUpdated={(scheduleConfig, scheduleLessons) =>
                updateActiveWorkspace((prev) => ({
                  ...prev,
                  scheduleConfig,
                  scheduleLessons,
                }))
              }
              onTasksUpdated={(tasks) =>
                updateActiveWorkspace((prev) => ({ ...prev, tasks }))
              }
            />
          )}

          {!isTeacher && studentTab === 'progress' && (
            <ProgressView
              interfaceLang={lang}
              diagnostics={activeWorkspace.diagnostics}
              tasks={activeWorkspace.tasks}
              onGoToDiagnostics={() => setStudentTab('diagnostics')}
              onStudyTopic={openStudyTopic}
            />
          )}

          {!isTeacher && studentTab === 'settings' && (
            <SettingsView
              user={activeUser}
              isGuest={isGuest}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
              onUserUpdated={isGuest ? setGuestProfile : setUser}
              onLogout={handleLogout}
              onOpenAuth={() => {
                setWelcomeAuthMode('register');
                setOpenAccessActive(false);
              }}
              onDeleted={() => {
                setInMemoryToken(null);
                setUser(null);
              }}
            />
          )}

          {/* TEACHER DASHBOARD */}
          {isTeacher && teacherTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6 items-center rounded-3xl bg-white dark:bg-zinc-900 border border-indigo-200/80 dark:border-zinc-800 shadow-sm p-6">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {lang === 'kk' ? 'Педагог кабинеті' : 'Личный кабинет учителя'}
                  </p>
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold">
                    {t(lang, 'welcomeGreeting')}, {activeUser.displayName}!
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                    {lang === 'kk'
                      ? 'Презентациялар, ҚМЖ жоспарлары, тесттер, жұмыс парақтары және деңгейлік тапсырмаларды дайындап сақтаңыз.'
                      : 'Готовьте презентации со слайдами, поурочные планы, тесты с ключами ответов, рабочие листы и дифференцированные задания.'}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setTeacherTab('studio')}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-sm cursor-pointer"
                    >
                      {t(lang, 'navTeacherStudio')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherTab('curriculum')}
                      className="px-5 py-2.5 text-sm font-semibold border border-slate-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl cursor-pointer"
                    >
                      {t(lang, 'navTeacherCurriculum')}
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <TeacherCharacter3D
                    gender={activeUser.characterGender}
                    outfit={activeUser.characterOutfit}
                    expression="explaining"
                    hintText={t(lang, 'teacher3dHint')}
                    className="w-full h-60 rounded-2xl bg-gradient-to-b from-indigo-50/80 via-amber-50/20 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Сақталған материалдар' : 'Сохранённых материалов'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-indigo-600">
                    {activeWorkspace.teacherMaterials.length}
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Пәндер саны' : 'Ваши предметы'}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums mt-1">
                    {activeUser.teacherSubjects.length}
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs text-slate-500">
                    {lang === 'kk' ? 'Сыныптар' : 'Классы'}
                  </p>
                  <p className="text-sm font-bold font-mono tabular-nums mt-2">
                    {activeUser.teacherClasses.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isTeacher && teacherTab === 'studio' && (
            <TeacherStudioView
              interfaceLang={lang}
              aiConfigured={aiConfigured}
              isGuest={isGuest}
              defaultSubjects={activeUser.teacherSubjects}
              defaultClasses={activeUser.teacherClasses}
              materials={activeWorkspace.teacherMaterials}
              onMaterialsUpdated={(teacherMaterials) =>
                updateActiveWorkspace((prev) => ({ ...prev, teacherMaterials }))
              }
            />
          )}

          {isTeacher && teacherTab === 'curriculum' && (
            <SubjectsView
              interfaceLang={lang}
              schoolLang={activeUser.schoolLang}
              grade={teacherBrowseGrade}
              profile={teacherBrowseProfile}
              onChangeGradeAndProfile={(nextGrade, nextProfile) => {
                setTeacherBrowseGrade(nextGrade);
                setTeacherBrowseProfile(nextProfile);
              }}
              onStudyTopic={() => setTeacherTab('studio')}
              onRunDiagnostic={() => setTeacherTab('studio')}
            />
          )}

          {isTeacher && teacherTab === 'settings' && (
            <SettingsView
              user={activeUser}
              isGuest={isGuest}
              isDark={isDark}
              onToggleDark={() => setIsDark((d) => !d)}
              onUserUpdated={isGuest ? setGuestProfile : setUser}
              onLogout={handleLogout}
              onOpenAuth={() => {
                setWelcomeAuthMode('register');
                setOpenAccessActive(false);
              }}
              onDeleted={() => {
                setInMemoryToken(null);
                setUser(null);
              }}
            />
          )}
        </main>

        <footer className="max-w-6xl w-full mx-auto px-4 md:px-6 py-4 border-t border-slate-200/70 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <span>AI Ұстаз · 1–11</span>
          <span>{t(lang, 'authorCredit')}</span>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Мобильная навигация"
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around px-1 z-40"
      >
        {(isTeacher
          ? teacherNavItems
          : studentNavItems.slice(0, 6)
        ).map((item) => {
          const Icon = item.icon;
          const active = isTeacher
            ? teacherTab === item.id
            : studentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                isTeacher
                  ? setTeacherTab(item.id as TeacherSection)
                  : setStudentTab(item.id as StudentSection)
              }
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-1.5 text-[10px] font-medium cursor-pointer ${
                active
                  ? isTeacher
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
