import { useState } from 'react';
import type {
  CharacterGender,
  CharacterOutfit,
  Lang,
  StudyProfile,
  UserProfile,
} from '../types/platform';
import { getSchoolStageInfo } from '../data/curriculum';
import { t } from '../i18n/translations';
import { apiFetch } from '../utils/apiClient';
import { TeacherCharacter3D } from './TeacherCharacter3D';

interface SettingsViewProps {
  user: UserProfile;
  isGuest?: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogout: () => void;
  onDeleted: () => void;
  onOpenAuth?: () => void;
}

export function SettingsView({
  user,
  isGuest = false,
  isDark,
  onToggleDark,
  onUserUpdated,
  onLogout,
  onDeleted,
  onOpenAuth,
}: SettingsViewProps) {
  const lang = user.interfaceLang;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [interfaceLang, setInterfaceLang] = useState<Lang>(user.interfaceLang);
  const [schoolLang, setSchoolLang] = useState<Lang>(user.schoolLang);
  const [grade, setGrade] = useState<number>(user.grade);
  const [profile, setProfile] = useState<StudyProfile>(user.profile);
  const [charGender, setCharGender] = useState<CharacterGender>(user.characterGender);
  const [charOutfit, setCharOutfit] = useState<CharacterOutfit>(user.characterOutfit);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stageInfo = getSchoolStageInfo(grade);

  const handleSave = async () => {
    setSaving(true);
    setSavedNotice(false);
    try {
      if (isGuest) {
        onUserUpdated({
          ...user,
          displayName: displayName.trim() || user.displayName,
          interfaceLang,
          schoolLang,
          grade,
          profile: grade < 10 ? 'general' : profile,
          characterGender: charGender,
          characterOutfit: charOutfit,
        });
        setSavedNotice(true);
        return;
      }
      const res = await apiFetch<{ user: UserProfile }>('/api/account/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName,
          interfaceLang,
          schoolLang,
          grade,
          profile: grade < 10 ? 'general' : profile,
          characterGender: charGender,
          characterOutfit: charOutfit,
        }),
      });
      onUserUpdated(res.user);
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isGuest) return;
    await apiFetch<{ ok: boolean }>('/api/account', { method: 'DELETE' });
    onDeleted();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
          {t(lang, 'navSettings')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
          {lang === 'kk'
            ? 'Тілдерді, сыныпты, 3D кейіпкерді және аккаунт қауіпсіздігін басқару'
            : 'Управление языками, классом, 3D-учителем и безопасностью аккаунта'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-7 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {lang === 'kk' ? 'Атыңыз' : 'Имя'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {t(lang, 'interfaceLangLabel')}
              </label>
              <select
                value={interfaceLang}
                onChange={(e) => setInterfaceLang(e.target.value as Lang)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                <option value="kk">Қазақша</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            {user.role === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {t(lang, 'schoolLangLabel')}
                </label>
                <select
                  value={schoolLang}
                  onChange={(e) => setSchoolLang(e.target.value as Lang)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="kk">Қазақ тілінде оқытатын мектеп</option>
                  <option value="ru">Русский язык обучения</option>
                </select>
              </div>
            )}
          </div>

          {user.role === 'student' && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t(lang, 'gradeLabel')}
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      const g = Number(e.target.value);
                      setGrade(g);
                      if (g < 10) setProfile('general');
                    }}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
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
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t(lang, 'profileLabel')}
                    </label>
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value as StudyProfile)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    >
                      <option value="general">{t(lang, 'profileGeneral')}</option>
                      <option value="humanitarian">{t(lang, 'profileHumanitarian')}</option>
                      <option value="physmath">{t(lang, 'profilePhysmath')}</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {lang === 'kk' ? 'Оқу бағыты' : 'Направление'}
                    </label>
                    <div className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-sky-200 dark:border-zinc-700 bg-sky-50/60 dark:bg-zinc-950 text-sky-900 dark:text-sky-300">
                      {t(lang, 'profileGeneral')}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {stageInfo.label[lang]} — {stageInfo.note[lang]}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
              {lang === 'kk' ? 'Күндізгі / Түнгі тақырып' : 'Оформление интерфейса'}
            </span>
            <button
              type="button"
              onClick={onToggleDark}
              className="px-3.5 py-1.5 text-xs font-semibold border border-slate-300 dark:border-zinc-700 rounded-xl cursor-pointer"
            >
              {isDark
                ? lang === 'kk'
                  ? 'Жарық тақырыпқа ауысу'
                  : 'Включить светлую тему'
                : lang === 'kk'
                  ? 'Қараңғы тақырыпқа ауысу'
                  : 'Включить тёмную тему'}
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl cursor-pointer"
            >
              {saving ? '...' : lang === 'kk' ? 'Сақтау' : 'Сохранить изменения'}
            </button>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-600">
                {lang === 'kk' ? 'Сақталды' : 'Сохранено'}
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-5 rounded-3xl bg-white dark:bg-zinc-900 border border-sky-200/80 dark:border-zinc-800 p-5 space-y-3">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-zinc-50">
            {lang === 'kk' ? '3D Кейіпкер баптауы' : 'Внешность 3D-учителя'}
          </h2>
          <TeacherCharacter3D
            gender={charGender}
            outfit={charOutfit}
            expression="greeting"
            hintText={t(lang, 'teacher3dHint')}
            className="w-full h-56 rounded-2xl bg-gradient-to-b from-sky-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCharGender('female')}
              className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                charGender === 'female'
                  ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-zinc-700'
              }`}
            >
              {lang === 'kk' ? 'Мұғалім әйел' : 'Учитель-женщина'}
            </button>
            <button
              type="button"
              onClick={() => setCharGender('male')}
              className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                charGender === 'male'
                  ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-zinc-700'
              }`}
            >
              {lang === 'kk' ? 'Мұғалім ер' : 'Учитель-мужчина'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['classic', 'academic', 'tech'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setCharOutfit(o)}
                className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                  charOutfit === o
                    ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                {o === 'classic'
                  ? lang === 'kk'
                    ? 'Классика'
                    : 'Классик'
                  : o === 'academic'
                    ? 'Академик'
                    : 'Техно'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
            {isGuest
              ? lang === 'kk'
                ? `${user.displayName} (Ашық қолжетімділік режимі)`
                : `${user.displayName} (Открытый режим без регистрации)`
              : `${user.displayName} (@${user.username})`}
          </p>
          <p className="text-xs text-slate-500">{t(lang, 'authorCredit')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isGuest ? (
            <>
              <button
                type="button"
                onClick={onOpenAuth ?? onLogout}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl cursor-pointer"
              >
                {lang === 'kk' ? 'Аккаунтқа кіру / Тіркелу' : 'Войти или создать аккаунт'}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-xl cursor-pointer"
              >
                {lang === 'kk' ? 'Басты бетке өту' : 'На главную страницу'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-zinc-700 hover:border-slate-500 rounded-xl cursor-pointer"
              >
                {t(lang, 'switchAccount')} / {t(lang, 'logout')}
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer"
                >
                  {t(lang, 'deleteAccount')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer"
                >
                  {lang === 'kk' ? 'Толық жоюды растау' : 'Подтвердить удаление'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
