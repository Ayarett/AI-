export type Lang = 'kk' | 'ru';
export type UserRole = 'student' | 'teacher';
export type StudyProfile = 'general' | 'humanitarian' | 'physmath';
export type DifficultyLevel = 'basic' | 'medium' | 'advanced';
export type CurriculumStatus = 'VERIFIED' | 'NEEDS_REVIEW';
export type CharacterGender = 'female' | 'male';
export type CharacterOutfit = 'classic' | 'academic' | 'tech';
export type CharacterExpression = 'idle' | 'greeting' | 'explaining' | 'happy' | 'thinking' | 'calm';

export type QuestionFormat =
  | 'mcq'
  | 'short_answer'
  | 'calculation'
  | 'matching'
  | 'text_analysis'
  | 'logic';

export interface BilingualText {
  kk: string;
  ru: string;
}

export interface CurriculumTopic {
  id: string;
  title: BilingualText;
  subtopics?: BilingualText[];
  learningObjective: BilingualText;
  expectedResult: BilingualText;
  difficulty: DifficultyLevel;
  exerciseTypes: string[];
  prerequisites: BilingualText;
  officialSource: string;
  status: CurriculumStatus;
}

export interface CurriculumSection {
  id: string;
  title: BilingualText;
  profileFocus: StudyProfile | 'all';
  topics: CurriculumTopic[];
}

export interface SubjectDefinition {
  id: string;
  name: BilingualText;
  iconKey:
    | 'alphabet'
    | 'kazakh'
    | 'russian'
    | 'english'
    | 'literature'
    | 'math'
    | 'algebra'
    | 'geometry'
    | 'informatics'
    | 'science'
    | 'world'
    | 'history_kz'
    | 'history_world'
    | 'physics'
    | 'chemistry'
    | 'biology'
    | 'geography'
    | 'law'
    | 'music'
    | 'art_craft'
    | 'nvtp';
  minGrade: number;
  maxGrade: number;
  onlyGrades?: number[];
  weeklyHoursGuide: {
    general?: string;
    humanitarian?: string;
    physmath?: string;
  };
  officialSource: string;
  sectionsByGradeRange: Record<string, CurriculumSection[]>;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  interfaceLang: Lang;
  schoolLang: Lang;
  grade: number;
  profile: StudyProfile;
  characterGender: CharacterGender;
  characterOutfit: CharacterOutfit;
  teacherSubjects: string[];
  teacherClasses: number[];
  createdAt: string;
}

export interface ScheduleConfig {
  startTime: string;
  lessonDuration: number;
  defaultBreak: number;
  breakAfterSecond: number;
  breakAfterThird: number;
}

export interface ScheduleLesson {
  id: string;
  dayOfWeek: number; // 1 = Mon .. 6 = Sat
  lessonIndex: number; // 1..8
  subjectId: string;
  room: string;
  note?: string;
}

export interface StudentTask {
  id: string;
  type: 'homework' | 'control_work';
  subjectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface DiagnosticQuestion {
  id: string;
  subjectId: string;
  grade: number;
  sectionId?: string;
  topicId?: string;
  profile?: StudyProfile | 'all';
  difficulty: DifficultyLevel;
  format: QuestionFormat;
  goalCode: string;
  goalLabel: BilingualText;
  prompt: BilingualText;
  passage?: BilingualText;
  options?: BilingualText[];
  matchingPairs?: Array<{ left: BilingualText; right: BilingualText }>;
  correctAnswer: string;
  explanation: BilingualText;
  variantGroup: 1 | 2;
}

export interface DiagnosticTopicBreakdown {
  goalLabel: string;
  correct: number;
  total: number;
  category: 'mastered' | 'review' | 'extra_prep';
}

export interface DiagnosticAttempt {
  id: string;
  subjectId: string;
  subjectName: string;
  targetGrade: number;
  scope: 'subject' | 'section' | 'topic' | 'previous_grade';
  difficulty: DifficultyLevel;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  breakdown: DiagnosticTopicBreakdown[];
  learningPlan: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  subjectId: string;
  grade: number;
  topicTitle: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export type TeacherToolType =
  | 'presentation'
  | 'lesson_plan'
  | 'test'
  | 'independent_work'
  | 'control_work'
  | 'worksheet'
  | 'rubric'
  | 'differentiated'
  | 'questions'
  | 'summary';

export interface PresentationSlide {
  id: string;
  type: 'title' | 'objectives' | 'explanation' | 'examples' | 'visual' | 'questions' | 'summary';
  title: string;
  content: string;
  speakerNotes?: string;
}

export interface TeacherMaterial {
  id: string;
  toolType: TeacherToolType;
  title: string;
  subjectId: string;
  grade: number;
  lang: Lang;
  topic: string;
  slides?: PresentationSlide[];
  contentMarkdown: string;
  answerKey?: string;
  createdAt: string;
  updatedAt: string;
}
