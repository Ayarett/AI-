import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import {
  createSessionToken,
  createUser,
  deleteUserAccount,
  findUserById,
  findUserByUsername,
  getUserWorkspace,
  resetUserPassword,
  updateUserProfile,
  updateUserWorkspace,
  verifySecret,
  verifySessionToken,
} from "./server/storage.ts";
import { getSubjectById, getSubjectsForGrade } from "./src/data/curriculum.ts";
import { DIAGNOSTIC_QUESTIONS } from "./src/data/diagnosticsBank.ts";
import type {
  ChatThread,
  DiagnosticAttempt,
  DiagnosticTopicBreakdown,
  DifficultyLevel,
  Lang,
  PresentationSlide,
  ScheduleConfig,
  ScheduleLesson,
  StudentTask,
  StudyProfile,
  TeacherMaterial,
  TeacherToolType,
  UserProfile,
  UserRole,
} from "./src/types/platform";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";
const FALLBACK_MODEL_NAME = "gemini-3.1-flash-lite";
const SESSION_COOKIE_NAME = "ai_ustaz_session";

interface AuthedRequest extends Request {
  authUser?: UserProfile;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || "local"}:${req.path}`;
    const now = Date.now();
    const current = rateBuckets.get(key);
    if (!current || now > current.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxRequests) {
      res.status(429).json({
        error: "Слишком много запросов. Подождите немного и повторите попытку.",
      });
      return;
    }
    current.count += 1;
    next();
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) result[key] = decodeURIComponent(val);
  }
  return result;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const isHttps =
    req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Max-Age=1209600",
    "SameSite=None",
    "Partitioned",
  ];
  if (isHttps || process.env.NODE_ENV === "production") {
    parts.push("Secure");
  } else {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=None; Partitioned; Secure`
  );
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Требуется вход в аккаунт." });
    return;
  }
  const userId = verifySessionToken(token);
  if (!userId) {
    res.status(401).json({ error: "Сессия истекла. Войдите снова." });
    return;
  }
  const record = findUserById(userId);
  if (!record) {
    res.status(401).json({ error: "Аккаунт не найден." });
    return;
  }
  req.authUser = record.profile;
  next();
}

function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const userId = verifySessionToken(token);
    if (userId) {
      const record = findUserById(userId);
      if (record) {
        req.authUser = record.profile;
      }
    }
  }
  next();
}

function sanitizeErrorDetail(raw: string): string {
  return raw
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[REDACTED_KEY]")
    .slice(0, 220);
}

function formatGeminiError(error: unknown): { status: number; message: string; detail?: string } {
  const errObj = error as { status?: number; message?: string };
  const raw = error instanceof Error ? error.message : String(error);
  const code = errObj?.status;
  const safeDetail = sanitizeErrorDetail(raw);
  console.error("[AI Ұстаз Gemini]", code ?? "ERR", safeDetail);
  if (
    code === 403 ||
    code === 401 ||
    raw.includes("PERMISSION_DENIED") ||
    raw.includes("403") ||
    raw.includes("API_KEY_INVALID") ||
    raw.includes("API key not valid")
  ) {
    return {
      status: 403,
      message: "Проверьте Gemini API ключ в панели Settings → Secrets.",
      detail: safeDetail,
    };
  }
  if (code === 429 || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
    return {
      status: 429,
      message: "Превышена квота Gemini API. Попробуйте чуть позже.",
      detail: safeDetail,
    };
  }
  if (code === 404 || raw.includes("NOT_FOUND")) {
    return {
      status: 404,
      message: "Запрошенная модель Gemini недоступна.",
      detail: safeDetail,
    };
  }
  if (code === 400 || raw.includes("INVALID_ARGUMENT")) {
    return {
      status: 400,
      message: "Запрос отклонён Gemini API (проверьте корректность GEMINI_API_KEY или формат параметров).",
      detail: safeDetail,
    };
  }
  if (
    code === 503 ||
    raw.includes("UNAVAILABLE") ||
    raw.includes("high demand")
  ) {
    return {
      status: 503,
      message: "Сервис AI временно испытывает высокую нагрузку. Повторите запрос через пару секунд.",
      detail: safeDetail,
    };
  }
  return {
    status: 502,
    message: "Не удалось получить ответ от AI. Проверьте подключение и повторите запрос.",
    detail: safeDetail,
  };
}

async function generateContentSmart(
  ai: GoogleGenAI,
  params: {
    contents: string;
    config?: Record<string, unknown>;
  }
) {
  const modelsToTry = [MODEL_NAME, FALLBACK_MODEL_NAME, "gemini-3.8-flash", MODEL_NAME];
  const failures: string[] = [];
  let lastError: unknown;
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const cfg = { ...(params.config ?? {}) };
      if (model !== MODEL_NAME && "thinkingConfig" in cfg) {
        delete cfg.thinkingConfig;
      }
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        config: Object.keys(cfg).length > 0 ? cfg : undefined,
      });
    } catch (err) {
      lastError = err;
      const errObj = err as { status?: number };
      const raw = err instanceof Error ? err.message : String(err);
      const code = errObj?.status;
      failures.push(`${model}:${code ?? "ERR"}`);
      console.warn(`[AI Ұстаз Gemini] attempt ${i + 1} (${model}) failed:`, code ?? "ERR", sanitizeErrorDetail(raw));
      const isTransient =
        code === 503 ||
        code === 500 ||
        code === 502 ||
        code === 504 ||
        raw.includes("UNAVAILABLE") ||
        raw.includes("503") ||
        raw.includes("high demand");
      if (!isTransient) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  console.error("[AI Ұстаз Gemini] all models failed:", failures.join(", "));
  throw lastError;
}

function normalizeAnswer(val: string): string {
  return val.trim().toLowerCase().replace(",", ".").replace(/\s+/g, " ");
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      model: MODEL_NAME,
      aiConfigured: getGeminiClient() !== null,
    });
  });

  // --- AUTH ---
  app.post("/api/auth/register", rateLimit(20, 60_000), (req: Request, res: Response) => {
    const body = req.body as {
      username?: unknown;
      displayName?: unknown;
      password?: unknown;
      recoveryPhrase?: unknown;
      role?: unknown;
      interfaceLang?: unknown;
      schoolLang?: unknown;
      grade?: unknown;
      profile?: unknown;
      characterGender?: unknown;
      characterOutfit?: unknown;
      teacherSubjects?: unknown;
      teacherClasses?: unknown;
    };

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const recoveryPhrase =
      typeof body.recoveryPhrase === "string" ? body.recoveryPhrase.trim() : "";

    if (
      username.length < 3 ||
      username.length > 32 ||
      !/^[\p{L}\p{N}_.@+-]+$/u.test(username)
    ) {
      res.status(400).json({
        error:
          body.interfaceLang === "kk"
            ? "Логин 3–32 таңбадан тұруы тиіс (бос орынсыз: әріптер, сандар, _ . @ -)."
            : "Логин должен содержать от 3 до 32 символов без пробелов (буквы, цифры, _ . @ -).",
      });
      return;
    }
    if (displayName.length < 2 || displayName.length > 50) {
      res.status(400).json({ error: "Укажите имя (от 2 до 50 символов)." });
      return;
    }
    if (password.length < 6 || password.length > 100) {
      res.status(400).json({ error: "Пароль должен содержать минимум 6 символов." });
      return;
    }
    if (recoveryPhrase.length < 3 || recoveryPhrase.length > 60) {
      res.status(400).json({
        error: "Укажите кодовое слово для восстановления доступа (минимум 3 символа).",
      });
      return;
    }

    const role: UserRole = body.role === "teacher" ? "teacher" : "student";
    const interfaceLang: Lang = body.interfaceLang === "kk" ? "kk" : "ru";
    const schoolLang: Lang = body.schoolLang === "kk" ? "kk" : "ru";
    const gradeRaw = Number(body.grade);
    const grade = Number.isInteger(gradeRaw) && gradeRaw >= 1 && gradeRaw <= 11 ? gradeRaw : 7;

    let profile: StudyProfile = "general";
    if (
      grade >= 10 &&
      (body.profile === "humanitarian" || body.profile === "physmath")
    ) {
      profile = body.profile;
    }

    const characterGender =
      body.characterGender === "male" ? "male" : "female";
    const characterOutfit =
      body.characterOutfit === "academic" || body.characterOutfit === "tech"
        ? body.characterOutfit
        : "classic";

    const teacherSubjects = Array.isArray(body.teacherSubjects)
      ? body.teacherSubjects.filter((s): s is string => typeof s === "string").slice(0, 15)
      : ["math"];
    const teacherClasses = Array.isArray(body.teacherClasses)
      ? body.teacherClasses
          .map(Number)
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= 11)
      : [7, 8, 9];

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      username,
      displayName,
      role,
      interfaceLang,
      schoolLang,
      grade,
      profile,
      characterGender,
      characterOutfit,
      teacherSubjects: teacherSubjects.length > 0 ? teacherSubjects : ["math"],
      teacherClasses: teacherClasses.length > 0 ? teacherClasses : [7],
      createdAt: new Date().toISOString(),
    };

    try {
      const created = createUser(newProfile, password, recoveryPhrase);
      const token = createSessionToken(created.id);
      setSessionCookie(req, res, token);
      res.status(201).json({ user: created, token });
    } catch (err) {
      if (err instanceof Error && err.message === "USERNAME_EXISTS") {
        res.status(409).json({ error: "Этот логин уже занят. Выберите другой." });
        return;
      }
      res.status(500).json({ error: "Не удалось создать аккаунт." });
    }
  });

  app.post("/api/auth/login", rateLimit(25, 60_000), (req: Request, res: Response) => {
    const body = req.body as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      res.status(400).json({ error: "Введите логин и пароль." });
      return;
    }

    const record = findUserByUsername(username);
    if (!record || !verifySecret(password, record.passwordHash)) {
      res.status(401).json({ error: "Неверный логин или пароль." });
      return;
    }

    const token = createSessionToken(record.profile.id);
    setSessionCookie(req, res, token);
    res.json({ user: record.profile, token });
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.post("/api/auth/recover", rateLimit(15, 60_000), (req: Request, res: Response) => {
    const body = req.body as {
      username?: unknown;
      recoveryPhrase?: unknown;
      newPassword?: unknown;
    };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const recoveryPhrase =
      typeof body.recoveryPhrase === "string" ? body.recoveryPhrase.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!username || !recoveryPhrase || newPassword.length < 6) {
      res.status(400).json({
        error: "Заполните логин, кодовое слово и новый пароль (от 6 символов).",
      });
      return;
    }

    const ok = resetUserPassword(username, recoveryPhrase, newPassword);
    if (!ok) {
      res.status(400).json({
        error: "Не удалось восстановить доступ: проверьте логин и кодовое слово.",
      });
      return;
    }

    res.json({ ok: true });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token) {
      res.json({ user: null });
      return;
    }
    const userId = verifySessionToken(token);
    if (!userId) {
      res.json({ user: null });
      return;
    }
    const record = findUserById(userId);
    res.json({ user: record ? record.profile : null });
  });

  app.patch("/api/account/preferences", requireAuth, (req: AuthedRequest, res: Response) => {
    const user = req.authUser!;
    const body = req.body as Partial<UserProfile>;

    const updated = updateUserProfile(user.id, (prev) => {
      const nextGrade =
        typeof body.grade === "number" &&
        Number.isInteger(body.grade) &&
        body.grade >= 1 &&
        body.grade <= 11
          ? body.grade
          : prev.grade;

      let nextProfile = prev.profile;
      if (nextGrade < 10) {
        nextProfile = "general";
      } else if (
        body.profile === "general" ||
        body.profile === "humanitarian" ||
        body.profile === "physmath"
      ) {
        nextProfile = body.profile;
      }

      return {
        ...prev,
        displayName:
          typeof body.displayName === "string" && body.displayName.trim().length >= 2
            ? body.displayName.trim().slice(0, 50)
            : prev.displayName,
        interfaceLang:
          body.interfaceLang === "kk" || body.interfaceLang === "ru"
            ? body.interfaceLang
            : prev.interfaceLang,
        schoolLang:
          body.schoolLang === "kk" || body.schoolLang === "ru"
            ? body.schoolLang
            : prev.schoolLang,
        grade: nextGrade,
        profile: nextProfile,
        characterGender:
          body.characterGender === "male" || body.characterGender === "female"
            ? body.characterGender
            : prev.characterGender,
        characterOutfit:
          body.characterOutfit === "classic" ||
          body.characterOutfit === "academic" ||
          body.characterOutfit === "tech"
            ? body.characterOutfit
            : prev.characterOutfit,
        teacherSubjects: Array.isArray(body.teacherSubjects)
          ? body.teacherSubjects.filter((s): s is string => typeof s === "string").slice(0, 15)
          : prev.teacherSubjects,
        teacherClasses: Array.isArray(body.teacherClasses)
          ? body.teacherClasses
              .map(Number)
              .filter((n) => Number.isInteger(n) && n >= 1 && n <= 11)
          : prev.teacherClasses,
      };
    });

    res.json({ user: updated });
  });

  app.delete("/api/account", requireAuth, (req: AuthedRequest, res: Response) => {
    const user = req.authUser!;
    deleteUserAccount(user.id);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // --- STUDENT WORKSPACE ---
  app.get("/api/student/workspace", requireAuth, (req: AuthedRequest, res: Response) => {
    const ws = getUserWorkspace(req.authUser!.id);
    res.json(ws);
  });

  app.put("/api/student/schedule", requireAuth, (req: AuthedRequest, res: Response) => {
    const body = req.body as {
      scheduleConfig?: ScheduleConfig;
      scheduleLessons?: ScheduleLesson[];
    };

    const updated = updateUserWorkspace(req.authUser!.id, (ws) => {
      const nextConfig = body.scheduleConfig
        ? {
            startTime:
              typeof body.scheduleConfig.startTime === "string" &&
              /^\d{2}:\d{2}$/.test(body.scheduleConfig.startTime)
                ? body.scheduleConfig.startTime
                : ws.scheduleConfig.startTime,
            lessonDuration: Math.min(
              60,
              Math.max(20, Number(body.scheduleConfig.lessonDuration) || 40)
            ),
            defaultBreak: Math.min(
              30,
              Math.max(0, Number(body.scheduleConfig.defaultBreak) ?? 5)
            ),
            breakAfterSecond: Math.min(
              30,
              Math.max(0, Number(body.scheduleConfig.breakAfterSecond) ?? 10)
            ),
            breakAfterThird: Math.min(
              30,
              Math.max(0, Number(body.scheduleConfig.breakAfterThird) ?? 10)
            ),
          }
        : ws.scheduleConfig;

      const nextLessons = Array.isArray(body.scheduleLessons)
        ? body.scheduleLessons
            .filter(
              (l) =>
                l &&
                typeof l.id === "string" &&
                typeof l.subjectId === "string" &&
                l.dayOfWeek >= 1 &&
                l.dayOfWeek <= 6 &&
                l.lessonIndex >= 1 &&
                l.lessonIndex <= 10
            )
            .slice(0, 80)
        : ws.scheduleLessons;

      return {
        ...ws,
        scheduleConfig: nextConfig,
        scheduleLessons: nextLessons,
      };
    });

    res.json({
      scheduleConfig: updated.scheduleConfig,
      scheduleLessons: updated.scheduleLessons,
    });
  });

  app.post("/api/student/tasks", requireAuth, (req: AuthedRequest, res: Response) => {
    const body = req.body as {
      type?: unknown;
      subjectId?: unknown;
      title?: unknown;
      dueDate?: unknown;
    };

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title || title.length > 160) {
      res.status(400).json({ error: "Введите название задания (до 160 символов)." });
      return;
    }

    const task: StudentTask = {
      id: crypto.randomUUID(),
      type: body.type === "control_work" ? "control_work" : "homework",
      subjectId: typeof body.subjectId === "string" ? body.subjectId : "math",
      title,
      dueDate:
        typeof body.dueDate === "string" && body.dueDate
          ? body.dueDate
          : new Date().toISOString().slice(0, 10),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      tasks: [task, ...ws.tasks].slice(0, 100),
    }));

    res.status(201).json({ task, tasks: updated.tasks });
  });

  app.patch("/api/student/tasks/:id", requireAuth, (req: AuthedRequest, res: Response) => {
    const taskId = req.params.id;
    const body = req.body as { completed?: unknown };

    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      tasks: ws.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: Boolean(body.completed) } : t
      ),
    }));

    res.json({ tasks: updated.tasks });
  });

  app.delete("/api/student/tasks/:id", requireAuth, (req: AuthedRequest, res: Response) => {
    const taskId = req.params.id;
    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      tasks: ws.tasks.filter((t) => t.id !== taskId),
    }));
    res.json({ tasks: updated.tasks });
  });

  // --- DIAGNOSTICS ---
  app.post(
    "/api/diagnostics/submit",
    optionalAuth,
    rateLimit(25, 60_000),
    async (req: AuthedRequest, res: Response) => {
      const authUser = req.authUser;
      const body = req.body as {
        subjectId?: unknown;
        targetGrade?: unknown;
        scope?: unknown;
        difficulty?: unknown;
        answers?: unknown;
        interfaceLang?: unknown;
        schoolLang?: unknown;
      };

      const interfaceLang: Lang = authUser
        ? authUser.interfaceLang
        : body.interfaceLang === "kk"
          ? "kk"
          : "ru";
      const subjectId = typeof body.subjectId === "string" ? body.subjectId : "math";
      const targetGrade = Math.min(
        11,
        Math.max(1, Number(body.targetGrade) || authUser?.grade || 7)
      );
      const scope =
        body.scope === "section" ||
        body.scope === "topic" ||
        body.scope === "previous_grade"
          ? body.scope
          : "subject";
      const difficulty: DifficultyLevel =
        body.difficulty === "basic" || body.difficulty === "advanced"
          ? body.difficulty
          : "medium";
      const answers =
        body.answers && typeof body.answers === "object"
          ? (body.answers as Record<string, string>)
          : {};

      const questionIds = Object.keys(answers);
      const questions = DIAGNOSTIC_QUESTIONS.filter((q) =>
        questionIds.includes(q.id)
      );

      if (questions.length === 0) {
        res.status(400).json({ error: "Ответьте хотя бы на один вопрос диагностики." });
        return;
      }

      let correctCount = 0;
      const goalGroups = new Map<
        string,
        { label: string; correct: number; total: number }
      >();

      const reviewDetails: Array<{
        questionId: string;
        isCorrect: boolean;
        correctAnswer: string;
        explanation: string;
      }> = [];

      for (const q of questions) {
        const userAns = normalizeAnswer(String(answers[q.id] ?? ""));
        const expected = normalizeAnswer(q.correctAnswer);
        const isCorrect = userAns.length > 0 && userAns === expected;
        if (isCorrect) correctCount += 1;

        const goalLabel = q.goalLabel[interfaceLang];
        const prev = goalGroups.get(q.goalCode) ?? {
          label: goalLabel,
          correct: 0,
          total: 0,
        };
        prev.total += 1;
        if (isCorrect) prev.correct += 1;
        goalGroups.set(q.goalCode, prev);

        reviewDetails.push({
          questionId: q.id,
          isCorrect,
          correctAnswer:
            q.options && !Number.isNaN(Number(q.correctAnswer))
              ? q.options[Number(q.correctAnswer)]?.[interfaceLang] ??
                q.correctAnswer
              : q.correctAnswer,
          explanation: q.explanation[interfaceLang],
        });
      }

      const breakdown: DiagnosticTopicBreakdown[] = Array.from(
        goalGroups.values()
      ).map((g) => {
        const ratio = g.total > 0 ? g.correct / g.total : 0;
        const category =
          ratio >= 0.75 ? "mastered" : ratio >= 0.4 ? "review" : "extra_prep";
        return {
          goalLabel: g.label,
          correct: g.correct,
          total: g.total,
          category,
        };
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      const subjectObj = getSubjectById(subjectId);
      const subjectName = subjectObj
        ? subjectObj.name[interfaceLang]
        : subjectId;

      const weakLabels = breakdown
        .filter((b) => b.category !== "mastered")
        .map((b) => b.goalLabel);

      let learningPlan = "";
      const ai = getGeminiClient();
      if (ai) {
        try {
          const langPrompt =
            interfaceLang === "kk" ? "Қазақ тілінде" : "На русском языке";
          const planResp = await generateContentSmart(ai, {
            contents: `${langPrompt}. Создай персональный план обучения из 4 шагов для ученика ${targetGrade} класса по предмету «${subjectName}». Процент выполнения диагностики: ${percentage}%. Слабые темы: ${
              weakLabels.length > 0 ? weakLabels.join(", ") : "нет критических пробелов, можно углубить знания"
            }. Пиши доброжелательно, поддерживающе, без сравнений с другими учениками. Включи: 1) объяснение слабой темы простыми словами, 2) короткий пример, 3) 2 тренировочных упражнения, 4) совет перед повторной диагностикой.`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
          learningPlan = (planResp.text ?? "").trim();
        } catch (err) {
          formatGeminiError(err);
          learningPlan = "";
        }
      }

      if (!learningPlan) {
        learningPlan =
          interfaceLang === "kk"
            ? "AI API қосылмағандықтан немесе уақытша қолжетімсіз болғандықтан, дербес оқу жоспарын жасау үшін Settings → Secrets бөлімінде GEMINI_API_KEY тексеріңіз. Қазір төмендегі қателерді талдап, «AI мұғалім» бөлімінде тақырыпты қайталай аласыз."
            : "Персональный ИИ-план временно недоступен (проверьте GEMINI_API_KEY в Settings → Secrets). Вы можете разобрать ошибки ниже и повторить темы в разделе «AI-учитель».";
      }

      const attempt: DiagnosticAttempt = {
        id: crypto.randomUUID(),
        subjectId,
        subjectName,
        targetGrade,
        scope,
        difficulty,
        totalQuestions: questions.length,
        correctCount,
        wrongCount: questions.length - correctCount,
        percentage,
        breakdown,
        learningPlan,
        createdAt: new Date().toISOString(),
      };

      if (authUser) {
        const updated = updateUserWorkspace(authUser.id, (ws) => ({
          ...ws,
          diagnostics: [attempt, ...ws.diagnostics].slice(0, 50),
        }));

        res.json({
          attempt,
          reviewDetails,
          diagnostics: updated.diagnostics,
        });
        return;
      }

      res.json({
        attempt,
        reviewDetails,
        diagnostics: [attempt],
      });
    }
  );

  // --- AI TUTOR ---
  app.post(
    "/api/ai/tutor",
    optionalAuth,
    rateLimit(40, 60_000),
    async (req: AuthedRequest, res: Response) => {
      const authUser = req.authUser;
      const body = req.body as {
        threadId?: unknown;
        subjectId?: unknown;
        grade?: unknown;
        profile?: unknown;
        interfaceLang?: unknown;
        schoolLang?: unknown;
        topicTitle?: unknown;
        message?: unknown;
        history?: unknown;
      };

      const interfaceLang: Lang = authUser
        ? authUser.interfaceLang
        : body.interfaceLang === "kk"
          ? "kk"
          : "ru";
      const schoolLang: Lang = authUser
        ? authUser.schoolLang
        : body.schoolLang === "kk"
          ? "kk"
          : "ru";

      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 3000) {
        res.status(400).json({ error: "Введите вопрос (от 1 до 3000 символов)." });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            interfaceLang === "kk"
              ? "AI API қосылмаған (GEMINI_API_KEY орнатылмаған). Settings → Secrets бөлімінде кілтті қосыңыз."
              : "AI API не подключён (не настроен GEMINI_API_KEY). Добавьте ключ в Settings → Secrets.",
        });
        return;
      }

      const subjectId = typeof body.subjectId === "string" ? body.subjectId : "math";
      const grade = Math.min(11, Math.max(1, Number(body.grade) || authUser?.grade || 7));
      const profile: StudyProfile =
        grade < 10
          ? "general"
          : authUser
            ? authUser.profile
            : body.profile === "humanitarian" || body.profile === "physmath"
              ? body.profile
              : "general";
      const topicTitle =
        typeof body.topicTitle === "string" ? body.topicTitle.trim() : "";
      const subjectObj = getSubjectById(subjectId);
      const validGradeSubjects = getSubjectsForGrade(grade);
      const allowedSubject = validGradeSubjects.find((s) => s.id === subjectId);
      const subjectName = allowedSubject
        ? allowedSubject.name[schoolLang]
        : subjectObj?.name[schoolLang] ?? subjectId;

      const ws = authUser ? getUserWorkspace(authUser.id) : null;
      const existingThread =
        ws && typeof body.threadId === "string"
          ? ws.chatThreads.find((t) => t.id === body.threadId)
          : undefined;

      const guestHistory = Array.isArray(body.history)
        ? body.history
            .filter(
              (m): m is { role: "user" | "assistant"; content: string } =>
                Boolean(m) &&
                typeof m === "object" &&
                ((m as { role?: unknown }).role === "user" ||
                  (m as { role?: unknown }).role === "assistant") &&
                typeof (m as { content?: unknown }).content === "string"
            )
            .slice(-10)
        : [];

      const historyMessages = existingThread
        ? existingThread.messages.slice(-10)
        : guestHistory;

      const systemInstruction = [
        `Ты — AI Ұстаз, доброжелательный, терпеливый и грамотный цифровой учитель для школьников Казахстана.`,
        `Отвечай на языке интерфейса пользователя: ${
          interfaceLang === "kk" ? "Қазақ тілі" : "Русский язык"
        }.`,
        `Контекст ученика: ${grade} класс, язык обучения школы — ${
          schoolLang === "kk" ? "казахский" : "русский"
        }, направление — ${profile}, предмет — «${subjectName}»${
          topicTitle ? `, тема — «${topicTitle}»` : ""
        }.`,
        `Академическая честность и педагогика:`,
        `- Адаптируй сложность объяснений строго под возраст ученика ${grade} класса.`,
        `- Не используй сложные термины без простого пояснения и примера.`,
        `- По математическим, физическим и химическим задачам показывай пошаговый ход решения и проверку результата.`,
        `- Если ученик просит просто готовое списанное решение, помоги разобраться в принципе и предложи 1 похожее тренировочное задание.`,
        `- Никогда не выдумывай несуществующие приказы, номера официальных тем или фальшивые факты. Если не уверен — честно скажи об этом.`,
        `- Соблюдай безопасность несовершеннолетних: никаких опасных рекомендаций.`,
      ].join("\n");

      const conversationText = historyMessages
        .map((m) => `${m.role === "user" ? "Ученик" : "AI Ұстаз"}: ${m.content.slice(0, 2000)}`)
        .join("\n\n");

      const fullContents = conversationText
        ? `${conversationText}\n\nУченик: ${message}`
        : message;

      try {
        const response = await generateContentSmart(ai, {
          contents: fullContents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const replyText = (response.text ?? "").trim();
        if (!replyText) {
          res.status(502).json({ error: "AI вернул пустой ответ. Повторите запрос." });
          return;
        }

        const now = new Date().toISOString();
        const userMsg = {
          id: crypto.randomUUID(),
          role: "user" as const,
          content: message,
          createdAt: now,
        };
        const aiMsg = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: replyText,
          createdAt: now,
        };

        if (authUser) {
          let savedThread: ChatThread;
          const nextWs = updateUserWorkspace(authUser.id, (curr) => {
            if (existingThread) {
              const nextThreads = curr.chatThreads.map((t) => {
                if (t.id !== existingThread.id) return t;
                savedThread = {
                  ...t,
                  messages: [...t.messages, userMsg, aiMsg].slice(-40),
                  updatedAt: now,
                };
                return savedThread;
              });
              return { ...curr, chatThreads: nextThreads };
            }
            savedThread = {
              id: crypto.randomUUID(),
              subjectId,
              grade,
              topicTitle: topicTitle || subjectName,
              messages: [userMsg, aiMsg],
              updatedAt: now,
            };
            return {
              ...curr,
              chatThreads: [savedThread, ...curr.chatThreads].slice(0, 30),
            };
          });

          res.json({
            thread: savedThread!,
            chatThreads: nextWs.chatThreads,
          });
          return;
        }

        const guestThreadId =
          typeof body.threadId === "string" && body.threadId
            ? body.threadId
            : crypto.randomUUID();
        const guestThread: ChatThread = {
          id: guestThreadId,
          subjectId,
          grade,
          topicTitle: topicTitle || subjectName,
          messages: [
            ...guestHistory.map((m, idx) => ({
              id: `h-${idx}-${Date.now()}`,
              role: m.role,
              content: m.content,
              createdAt: now,
            })),
            userMsg,
            aiMsg,
          ].slice(-40),
          updatedAt: now,
        };

        res.json({
          thread: guestThread,
          chatThreads: [guestThread],
        });
      } catch (err) {
        const formatted = formatGeminiError(err);
        res.status(formatted.status).json({
          error: formatted.message,
          detail: formatted.detail,
        });
      }
    }
  );

  app.delete("/api/ai/threads/:id", requireAuth, (req: AuthedRequest, res: Response) => {
    const threadId = req.params.id;
    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      chatThreads: ws.chatThreads.filter((t) => t.id !== threadId),
    }));
    res.json({ chatThreads: updated.chatThreads });
  });

  // --- TEACHER STUDIO ---
  app.get("/api/teacher/materials", requireAuth, (req: AuthedRequest, res: Response) => {
    const ws = getUserWorkspace(req.authUser!.id);
    res.json({ materials: ws.teacherMaterials });
  });

  app.post(
    "/api/teacher/materials/generate",
    optionalAuth,
    rateLimit(25, 60_000),
    async (req: AuthedRequest, res: Response) => {
      const authUser = req.authUser;

      const body = req.body as {
        toolType?: unknown;
        subjectId?: unknown;
        grade?: unknown;
        lang?: unknown;
        topic?: unknown;
        questionCount?: unknown;
        difficulty?: unknown;
        questionTypes?: unknown;
      };

      const toolType: TeacherToolType =
        typeof body.toolType === "string"
          ? (body.toolType as TeacherToolType)
          : "lesson_plan";
      const subjectId = typeof body.subjectId === "string" ? body.subjectId : "math";
      const grade = Math.min(11, Math.max(1, Number(body.grade) || 7));
      const lang: Lang = body.lang === "kk" ? "kk" : "ru";
      const topic = typeof body.topic === "string" ? body.topic.trim() : "";

      if (!topic || topic.length > 200) {
        res.status(400).json({ error: "Укажите тему урока (до 200 символов)." });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            "AI API не подключён (отсутствует GEMINI_API_KEY). Укажите ключ в Settings → Secrets.",
        });
        return;
      }

      const subjectObj = getSubjectById(subjectId);
      const subjectName = subjectObj ? subjectObj.name[lang] : subjectId;
      const langLabel = lang === "kk" ? "қазақ тілінде" : "на русском языке";

      try {
        let slides: PresentationSlide[] | undefined;
        let contentMarkdown = "";
        let answerKey: string | undefined;
        let title = `${subjectName} (${grade} кл.) — ${topic}`;

        if (toolType === "presentation") {
          const resp = await generateContentSmart(ai, {
            contents: `Создай структуру учебной презентации ${langLabel} для ${grade} класса по предмету «${subjectName}», тема: «${topic}». Обязательно включи слайды типов: title, objectives, explanation, examples, visual (подсказка для иллюстрации/схемы), questions, summary.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  slides: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        speakerNotes: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });

          const parsed = JSON.parse((resp.text ?? "{}").trim()) as {
            title?: string;
            slides?: Array<{
              type?: string;
              title?: string;
              content?: string;
              speakerNotes?: string;
            }>;
          };

          if (parsed.title) title = parsed.title;
          slides = (parsed.slides ?? []).map((s) => ({
            id: crypto.randomUUID(),
            type:
              s.type === "title" ||
              s.type === "objectives" ||
              s.type === "explanation" ||
              s.type === "examples" ||
              s.type === "visual" ||
              s.type === "questions" ||
              s.type === "summary"
                ? s.type
                : "explanation",
            title: s.title ?? "Слайд",
            content: s.content ?? "",
            speakerNotes: s.speakerNotes ?? "",
          }));
          contentMarkdown = slides
            .map((s, idx) => `## ${idx + 1}. ${s.title}\n\n${s.content}`)
            .join("\n\n");
        } else if (toolType === "test") {
          const count = Math.min(15, Math.max(3, Number(body.questionCount) || 6));
          const difficulty =
            typeof body.difficulty === "string" ? body.difficulty : "medium";
          const qTypes =
            typeof body.questionTypes === "string"
              ? body.questionTypes
              : "выбор ответа и краткий ответ";

          const resp = await generateContentSmart(ai, {
            contents: `Создай тест ${langLabel} для ${grade} класса по предмету «${subjectName}», тема: «${topic}». Количество заданий: ${count}, сложность: ${difficulty}, типы заданий: ${qTypes}. Верни отдельно текст теста для учеников и отдельный ключ ответов с краткими пояснениями.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  testContent: { type: Type.STRING },
                  answerKey: { type: Type.STRING },
                },
              },
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });

          const parsed = JSON.parse((resp.text ?? "{}").trim()) as {
            title?: string;
            testContent?: string;
            answerKey?: string;
          };
          if (parsed.title) title = parsed.title;
          contentMarkdown = parsed.testContent ?? "";
          answerKey = parsed.answerKey ?? "";
        } else {
          const toolLabels: Record<TeacherToolType, string> = {
            presentation: "Презентация",
            lesson_plan: "Поурочный план (КСП)",
            test: "Тест",
            independent_work: "Самостоятельная работа",
            control_work: "Контрольная работа (СОР/СОЧ-формат)",
            worksheet: "Рабочий лист для ученика",
            rubric: "Критерии и дескрипторы оценивания",
            differentiated: "Дифференцированные задания (уровни A, B, C)",
            questions: "Банк открытых и проверяющих вопросов по таксономии Блума",
            summary: "Краткий опорный конспект урока",
          };
          const resp = await generateContentSmart(ai, {
            contents: `Создай учебный материал типа «${toolLabels[toolType]}» ${langLabel} для ${grade} класса по предмету «${subjectName}», тема: «${topic}». Ориентируйся на педагогические стандарты РК, не выдумывай номера официальных приказов. Оформи чётко по разделам.`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
          contentMarkdown = (resp.text ?? "").trim();
        }

        const now = new Date().toISOString();
        const material: TeacherMaterial = {
          id: crypto.randomUUID(),
          toolType,
          title,
          subjectId,
          grade,
          lang,
          topic,
          slides,
          contentMarkdown,
          answerKey,
          createdAt: now,
          updatedAt: now,
        };

        if (authUser) {
          const updated = updateUserWorkspace(authUser.id, (ws) => ({
            ...ws,
            teacherMaterials: [material, ...ws.teacherMaterials].slice(0, 60),
          }));

          res.status(201).json({ material, materials: updated.teacherMaterials });
          return;
        }

        res.status(201).json({ material, materials: [material] });
      } catch (err) {
        const formatted = formatGeminiError(err);
        res.status(formatted.status).json({
          error: formatted.message,
          detail: formatted.detail,
        });
      }
    }
  );

  app.put("/api/teacher/materials/:id", requireAuth, (req: AuthedRequest, res: Response) => {
    const matId = req.params.id;
    const body = req.body as {
      title?: unknown;
      contentMarkdown?: unknown;
      answerKey?: unknown;
      slides?: unknown;
    };

    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      teacherMaterials: ws.teacherMaterials.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          title: typeof body.title === "string" ? body.title.trim() || m.title : m.title,
          contentMarkdown:
            typeof body.contentMarkdown === "string"
              ? body.contentMarkdown
              : m.contentMarkdown,
          answerKey:
            typeof body.answerKey === "string" ? body.answerKey : m.answerKey,
          slides: Array.isArray(body.slides)
            ? (body.slides as PresentationSlide[])
            : m.slides,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    const material = updated.teacherMaterials.find((m) => m.id === matId) ?? null;
    res.json({ material, materials: updated.teacherMaterials });
  });

  app.delete("/api/teacher/materials/:id", requireAuth, (req: AuthedRequest, res: Response) => {
    const matId = req.params.id;
    const updated = updateUserWorkspace(req.authUser!.id, (ws) => ({
      ...ws,
      teacherMaterials: ws.teacherMaterials.filter((m) => m.id !== matId),
    }));
    res.json({ materials: updated.teacherMaterials });
  });

  // --- VITE / STATIC ---
  const distDir = path.resolve(__dirname, "dist");
  const isTsxDev =
    process.env.npm_lifecycle_event === "dev" ||
    process.execArgv.some((a) => a.includes("tsx")) ||
    (process.env._ ?? "").includes("tsx");
  const useProdStatic =
    process.env.NODE_ENV === "production" ||
    (!isTsxDev && fs.existsSync(distDir));

  if (!useProdStatic) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Ustaz server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
