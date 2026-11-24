import { useState } from 'react';
import type { FormEvent } from 'react';
import { Bell, Check, Plus, Trash2 } from 'lucide-react';
import type {
  Lang,
  ScheduleConfig,
  ScheduleLesson,
  StudentTask,
} from '../types/platform';
import { getSubjectName, getSubjectsForGrade } from '../data/curriculum';
import { t } from '../i18n/translations';
import { apiFetch } from '../utils/apiClient';

interface ScheduleViewProps {
  interfaceLang: Lang;
  schoolLang: Lang;
  grade: number;
  isGuest?: boolean;
  config: ScheduleConfig;
  lessons: ScheduleLesson[];
  tasks: StudentTask[];
  onScheduleUpdated: (config: ScheduleConfig, lessons: ScheduleLesson[]) => void;
  onTasksUpdated: (tasks: StudentTask[]) => void;
}

const START_PRESETS = ['08:00', '11:30', '14:00', '15:30'];

const DAYS = [
  { id: 1, kk: 'Дүйсенбі', ru: 'Понедельник' },
  { id: 2, kk: 'Сейсенбі', ru: 'Вторник' },
  { id: 3, kk: 'Сәрсенбі', ru: 'Среда' },
  { id: 4, kk: 'Бейсенбі', ru: 'Четверг' },
  { id: 5, kk: 'Жұма', ru: 'Пятница' },
  { id: 6, kk: 'Сенбі', ru: 'Суббота' },
];

function computeBellSlots(cfg: ScheduleConfig): Array<{ index: number; start: string; end: string }> {
  const [hStr, mStr] = cfg.startTime.split(':');
  let minutes = (Number(hStr) || 8) * 60 + (Number(mStr) || 0);
  const slots: Array<{ index: number; start: string; end: string }> = [];

  const fmt = (mins: number) => {
    const wrapped = ((mins % 1440) + 1440) % 1440;
    const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
    const mm = String(wrapped % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  for (let i = 1; i <= 7; i++) {
    const start = fmt(minutes);
    const end = fmt(minutes + cfg.lessonDuration);
    slots.push({ index: i, start, end });
    const breakLen =
      i === 2
        ? cfg.breakAfterSecond
        : i === 3
          ? cfg.breakAfterThird
          : cfg.defaultBreak;
    minutes += cfg.lessonDuration + breakLen;
  }

  return slots;
}

export function ScheduleView({
  interfaceLang,
  schoolLang,
  grade,
  isGuest = false,
  config,
  lessons,
  tasks,
  onScheduleUpdated,
  onTasksUpdated,
}: ScheduleViewProps) {
  const subjects = getSubjectsForGrade(grade);
  const [localConfig, setLocalConfig] = useState<ScheduleConfig>(config);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [lessonIndex, setLessonIndex] = useState<number>(1);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? 'math');
  const [room, setRoom] = useState('');
  const [saving, setSaving] = useState(false);

  // Task composer
  const [taskType, setTaskType] = useState<'homework' | 'control_work'>('homework');
  const [taskSubjectId, setTaskSubjectId] = useState<string>(subjects[0]?.id ?? 'math');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Honest browser notification permission check
  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    notificationsSupported ? Notification.permission : 'unsupported'
  );

  const slots = computeBellSlots(localConfig);

  const persistSchedule = async (nextCfg: ScheduleConfig, nextLessons: ScheduleLesson[]) => {
    if (isGuest) {
      onScheduleUpdated(nextCfg, nextLessons);
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch<{
        scheduleConfig: ScheduleConfig;
        scheduleLessons: ScheduleLesson[];
      }>('/api/student/schedule', {
        method: 'PUT',
        body: JSON.stringify({
          scheduleConfig: nextCfg,
          scheduleLessons: nextLessons,
        }),
      });
      onScheduleUpdated(res.scheduleConfig, res.scheduleLessons);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    const filtered = lessons.filter(
      (l) => !(l.dayOfWeek === dayOfWeek && l.lessonIndex === lessonIndex)
    );
    const nextLesson: ScheduleLesson = {
      id: crypto.randomUUID(),
      dayOfWeek,
      lessonIndex,
      subjectId,
      room: room.trim() || '—',
    };
    const nextLessons = [...filtered, nextLesson].sort(
      (a, b) => a.dayOfWeek - b.dayOfWeek || a.lessonIndex - b.lessonIndex
    );
    await persistSchedule(localConfig, nextLessons);
    setRoom('');
  };

  const handleDeleteLesson = async (id: string) => {
    const nextLessons = lessons.filter((l) => l.id !== id);
    await persistSchedule(localConfig, nextLessons);
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    if (isGuest) {
      const nextTask: StudentTask = {
        id: crypto.randomUUID(),
        type: taskType,
        subjectId: taskSubjectId,
        title: taskTitle.trim(),
        dueDate: taskDueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      onTasksUpdated([nextTask, ...tasks].slice(0, 100));
      setTaskTitle('');
      return;
    }
    const res = await apiFetch<{ tasks: StudentTask[] }>('/api/student/tasks', {
      method: 'POST',
      body: JSON.stringify({
        type: taskType,
        subjectId: taskSubjectId,
        title: taskTitle.trim(),
        dueDate: taskDueDate,
      }),
    });
    onTasksUpdated(res.tasks);
    setTaskTitle('');
  };

  const toggleTask = async (task: StudentTask) => {
    if (isGuest) {
      onTasksUpdated(
        tasks.map((tItem) =>
          tItem.id === task.id ? { ...tItem, completed: !tItem.completed } : tItem
        )
      );
      return;
    }
    const res = await apiFetch<{ tasks: StudentTask[] }>(
      `/api/student/tasks/${task.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      }
    );
    onTasksUpdated(res.tasks);
  };

  const removeTask = async (taskId: string) => {
    if (isGuest) {
      onTasksUpdated(tasks.filter((tItem) => tItem.id !== taskId));
      return;
    }
    const res = await apiFetch<{ tasks: StudentTask[] }>(
      `/api/student/tasks/${taskId}`,
      { method: 'DELETE' }
    );
    onTasksUpdated(res.tasks);
  };

  const requestNotifications = async () => {
    if (!notificationsSupported) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      new Notification('AI Ұстаз', {
        body:
          interfaceLang === 'kk'
            ? 'Еске салғыштар браузерде белсендірілді.'
            : 'Уведомления о расписании включены в этом браузере.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-zinc-50">
            {t(interfaceLang, 'scheduleTitle')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            {interfaceLang === 'kk'
              ? 'Қоңырау кестесі, апталық сабақтар және үй тапсырмаларын бақылау'
              : 'Настройка времени звонков, расписание уроков на неделю, домашние задания и контрольные'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notificationsSupported ? (
            <button
              type="button"
              onClick={requestNotifications}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-zinc-700 hover:border-blue-600 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {notifPermission === 'granted'
                  ? interfaceLang === 'kk'
                    ? 'Еске салғыш қосулы'
                    : 'Уведомления включены'
                  : notifPermission === 'denied'
                    ? interfaceLang === 'kk'
                      ? 'Браузерде бұғатталған'
                      : 'Заблокировано в браузере'
                    : interfaceLang === 'kk'
                      ? 'Еске салғышты қосу'
                      : 'Включить уведомления браузера'}
              </span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              {interfaceLang === 'kk'
                ? 'Push-хабарлама бұл браузерде қолжетімсіз'
                : 'Системные уведомления не поддерживаются этим браузером'}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
          {interfaceLang === 'kk' ? 'Қоңырау кестесінің баптаулары' : 'Время начала дня и перемены'}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {START_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const next = { ...localConfig, startTime: preset };
                setLocalConfig(next);
                void persistSchedule(next, lessons);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold font-mono tabular-nums rounded-lg border cursor-pointer ${
                localConfig.startTime === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}
            >
              {preset}
            </button>
          ))}

          <input
            type="time"
            value={localConfig.startTime}
            onChange={(e) => setLocalConfig({ ...localConfig, startTime: e.target.value })}
            aria-label="Своё время начала"
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
          />
        </div>

        <div className="grid sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">
              {interfaceLang === 'kk' ? 'Сабақ (мин)' : 'Урок (мин)'}
            </label>
            <input
              type="number"
              min={20}
              max={60}
              value={localConfig.lessonDuration}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, lessonDuration: Number(e.target.value) || 40 })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">
              {interfaceLang === 'kk' ? 'Қарапайым үзіліс (мин)' : 'Обычная перемена (мин)'}
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={localConfig.defaultBreak}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, defaultBreak: Number(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">
              {interfaceLang === 'kk' ? '2-сабақтан кейін (мин)' : 'После 2-го урока (мин)'}
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={localConfig.breakAfterSecond}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, breakAfterSecond: Number(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">
              {interfaceLang === 'kk' ? '3-сабақтан кейін (мин)' : 'После 3-го урока (мин)'}
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={localConfig.breakAfterThird}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, breakAfterThird: Number(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 tabular-nums"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void persistSchedule(localConfig, lessons)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-lg cursor-pointer"
        >
          {saving
            ? '...'
            : interfaceLang === 'kk'
              ? 'Қоңырау баптауларын сақтау'
              : 'Сохранить расписание звонков'}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
            {interfaceLang === 'kk' ? 'Апталық сабақ кестесі' : 'Недельное расписание'}
          </h2>

          <form onSubmit={handleAddLesson} className="grid sm:grid-cols-5 gap-2.5">
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            >
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d[interfaceLang]}
                </option>
              ))}
            </select>

            <select
              value={lessonIndex}
              onChange={(e) => setLessonIndex(Number(e.target.value))}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono tabular-nums"
            >
              {slots.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.index}. {s.start}–{s.end}
                </option>
              ))}
            </select>

            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 sm:col-span-2"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name[schoolLang]}
                </option>
              ))}
            </select>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder={interfaceLang === 'kk' ? 'Каб.' : 'Каб.'}
                className="w-16 px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
              <button
                type="submit"
                aria-label="Добавить урок"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayLessons = lessons.filter((l) => l.dayOfWeek === day.id);
              if (dayLessons.length === 0) return null;
              return (
                <div key={day.id} className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                    {day[interfaceLang]}
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl">
                    {dayLessons.map((l) => {
                      const slot = slots.find((s) => s.index === l.lessonIndex);
                      return (
                        <div
                          key={l.id}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono tabular-nums text-slate-500 shrink-0">
                              {l.lessonIndex}. {slot ? `${slot.start}–${slot.end}` : ''}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                              {getSubjectName(l.subjectId, schoolLang)}
                            </span>
                            <span className="text-slate-500 shrink-0">
                              {interfaceLang === 'kk' ? 'каб.' : 'каб.'} {l.room}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleDeleteLesson(l.id)}
                            aria-label="Удалить урок"
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {lessons.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                {interfaceLang === 'kk'
                  ? 'Кесте бос. Жоғарыдағы форма арқылы пәндерді қосыңыз.'
                  : 'Расписание пока пусто. Добавьте уроки через форму выше.'}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-zinc-50">
            {interfaceLang === 'kk'
              ? 'Үй тапсырмалары және бақылау жұмыстары'
              : 'Домашние задания и контрольные'}
          </h2>

          <form onSubmit={handleAddTask} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={taskType}
                onChange={(e) =>
                  setTaskType(e.target.value as 'homework' | 'control_work')
                }
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                <option value="homework">
                  {interfaceLang === 'kk' ? 'Үй тапсырмасы' : 'Домашнее задание'}
                </option>
                <option value="control_work">
                  {interfaceLang === 'kk' ? 'Бақылау / БЖБ' : 'Контрольная / СОР'}
                </option>
              </select>

              <select
                value={taskSubjectId}
                onChange={(e) => setTaskSubjectId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name[schoolLang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={
                  interfaceLang === 'kk' ? 'Мысалы: §14, №125 есеп' : 'Например: §14, упр. 125'
                }
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
              />
              <button
                type="submit"
                aria-label="Добавить задание"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
              >
                <button
                  type="button"
                  onClick={() => void toggleTask(task)}
                  className="flex items-start gap-2.5 text-left min-w-0 cursor-pointer"
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`font-medium truncate ${
                        task.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-slate-500 tabular-nums mt-0.5">
                      {getSubjectName(task.subjectId, schoolLang)} ·{' '}
                      {task.type === 'control_work'
                        ? interfaceLang === 'kk'
                          ? 'Бақылау'
                          : 'Контрольная'
                        : interfaceLang === 'kk'
                          ? 'Үй жұмысы'
                          : 'ДЗ'}{' '}
                      · {task.dueDate}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void removeTask(task.id)}
                  aria-label="Удалить задачу"
                  className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
