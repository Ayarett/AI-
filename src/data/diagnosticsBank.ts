import type {
  DifficultyLevel,
  DiagnosticQuestion,
  StudyProfile,
} from '../types/platform';

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // Grade 1-4 Math
  {
    id: 'q-math-14-1',
    subjectId: 'math',
    grade: 3,
    difficulty: 'basic',
    format: 'calculation',
    goalCode: 'MATH-14-OPS',
    goalLabel: { kk: 'Амалдар реті', ru: 'Порядок действий' },
    prompt: {
      kk: 'Өрнектің мәнін табыңыз: 24 + 6 × 3',
      ru: 'Найдите значение выражения: 24 + 6 × 3',
    },
    correctAnswer: '42',
    explanation: {
      kk: 'Алдымен көбейту орындалады: 6 × 3 = 18, содан кейін 24 + 18 = 42.',
      ru: 'Сначала выполняется умножение: 6 × 3 = 18, затем сложение: 24 + 18 = 42.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-math-14-2',
    subjectId: 'math',
    grade: 3,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'MATH-14-OPS',
    goalLabel: { kk: 'Амалдар реті', ru: 'Порядок действий' },
    prompt: {
      kk: '(15 + 9) : 4 өрнегінде бірінші қай амал орындалады?',
      ru: 'Какое действие выполняется первым в выражении (15 + 9) : 4?',
    },
    options: [
      { kk: 'Қосу (жақша ішінде)', ru: 'Сложение (в скобках)' },
      { kk: 'Бөлу', ru: 'Деление' },
      { kk: 'Екеуі де бірдей', ru: 'Не имеет значения' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Жақша ішіндегі амал әрқашан бірінші орындалады.',
      ru: 'Действие внутри скобок всегда выполняется в первую очередь.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-math-14-3',
    subjectId: 'math',
    grade: 4,
    difficulty: 'medium',
    format: 'logic',
    goalCode: 'MATH-14-OPS',
    goalLabel: { kk: 'Амалдар реті', ru: 'Порядок действий' },
    prompt: {
      kk: 'Дүкенде 4 қорапта 8 данадан қарындаш және тағы 12 дана бөлек қарындаш бар. Барлығы неше қарындаш?',
      ru: 'В магазине 4 коробки по 8 карандашей и ещё 12 отдельных карандашей. Сколько всего карандашей?',
    },
    correctAnswer: '44',
    explanation: {
      kk: '4 × 8 + 12 = 32 + 12 = 44 қарындаш.',
      ru: '4 × 8 + 12 = 32 + 12 = 44 карандаша.',
    },
    variantGroup: 2,
  },
  {
    id: 'q-math-14-4',
    subjectId: 'math',
    grade: 4,
    difficulty: 'basic',
    format: 'calculation',
    goalCode: 'MATH-14-OPS',
    goalLabel: { kk: 'Амалдар реті', ru: 'Порядок действий' },
    prompt: {
      kk: 'Есептеңіз: (50 − 14) : 6 + 7',
      ru: 'Вычислите: (50 − 14) : 6 + 7',
    },
    correctAnswer: '13',
    explanation: {
      kk: '50 − 14 = 36; 36 : 6 = 6; 6 + 7 = 13.',
      ru: '50 − 14 = 36; 36 : 6 = 6; 6 + 7 = 13.',
    },
    variantGroup: 2,
  },

  // Grade 5-6 Math
  {
    id: 'q-math-56-1',
    subjectId: 'math',
    grade: 5,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'MATH-56-FRAC',
    goalLabel: { kk: 'Жай бөлшектер', ru: 'Обыкновенные дроби' },
    prompt: {
      kk: '1/4 + 2/4 қосындысы неге тең?',
      ru: 'Чему равна сумма 1/4 + 2/4?',
    },
    options: [
      { kk: '3/4', ru: '3/4' },
      { kk: '3/8', ru: '3/8' },
      { kk: '2/4', ru: '2/4' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Бөлімдері бірдей бөлшектерді қосқанда алымдары қосылады, бөлімі өзгермейді.',
      ru: 'При сложении дробей с одинаковым знаменателем складываются числители, а знаменатель остаётся прежним.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-math-56-2',
    subjectId: 'math',
    grade: 6,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'MATH-56-PCT',
    goalLabel: { kk: 'Процент және пропорция', ru: 'Проценты и пропорции' },
    prompt: {
      kk: '200 санының 25%-ын табыңыз.',
      ru: 'Найдите 25% от числа 200.',
    },
    correctAnswer: '50',
    explanation: {
      kk: '25% — бұл 0,25 немесе 1/4 бөлік. 200 × 0,25 = 50.',
      ru: '25% — это 0,25 или 1/4 числа. 200 × 0,25 = 50.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-math-56-3',
    subjectId: 'math',
    grade: 6,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'MATH-56-PCT',
    goalLabel: { kk: 'Процент және пропорция', ru: 'Проценты и пропорции' },
    prompt: {
      kk: 'Кітаптың бағасы 1200 теңге. 10% жеңілдіктен кейін кітап неше теңге тұрады?',
      ru: 'Книга стоит 1200 тенге. Сколько она будет стоить после скидки 10%?',
    },
    correctAnswer: '1080',
    explanation: {
      kk: '1200 × 0,10 = 120 теңге жеңілдік. 1200 − 120 = 1080 теңге.',
      ru: '10% от 1200 = 120 тенге. Новая цена: 1200 − 120 = 1080 тенге.',
    },
    variantGroup: 2,
  },
  {
    id: 'q-math-56-4',
    subjectId: 'math',
    grade: 5,
    difficulty: 'advanced',
    format: 'calculation',
    goalCode: 'MATH-56-FRAC',
    goalLabel: { kk: 'Жай бөлшектер', ru: 'Обыкновенные дроби' },
    prompt: {
      kk: '0,5 + 1/4 өрнегін ондық бөлшек түрінде есептеңіз (нүкте арқылы жазыңыз, мыс: 0.75).',
      ru: 'Вычислите 0.5 + 1/4 в виде десятичной дроби (запишите через точку, например 0.75).',
    },
    correctAnswer: '0.75',
    explanation: {
      kk: '1/4 = 0.25, сондықтан 0.5 + 0.25 = 0.75.',
      ru: '1/4 = 0.25, следовательно 0.5 + 0.25 = 0.75.',
    },
    variantGroup: 2,
  },

  // Grade 7-9 Algebra
  {
    id: 'q-alg-79-1',
    subjectId: 'algebra',
    grade: 8,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'ALG-QUAD',
    goalLabel: { kk: 'Квадрат теңдеулер', ru: 'Квадратные уравнения' },
    prompt: {
      kk: 'x² − 5x + 6 = 0 теңдеуінің дискриминантын табыңыз.',
      ru: 'Найдите дискриминант квадратного уравнения x² − 5x + 6 = 0.',
    },
    correctAnswer: '1',
    explanation: {
      kk: 'D = b² − 4ac = (−5)² − 4·1·6 = 25 − 24 = 1.',
      ru: 'D = b² − 4ac = (−5)² − 4·1·6 = 25 − 24 = 1.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-alg-79-2',
    subjectId: 'algebra',
    grade: 8,
    difficulty: 'medium',
    format: 'mcq',
    goalCode: 'ALG-QUAD',
    goalLabel: { kk: 'Квадрат теңдеулер', ru: 'Квадратные уравнения' },
    prompt: {
      kk: 'x² − 7x + 12 = 0 теңдеуінің түбірлерінің қосындысы неге тең (Виет теоремасы бойынша)?',
      ru: 'Чему равна сумма корней уравнения x² − 7x + 12 = 0 по теореме Виета?',
    },
    options: [
      { kk: '7', ru: '7' },
      { kk: '−7', ru: '−7' },
      { kk: '12', ru: '12' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Келтірілген квадрат теңдеуде x₁ + x₂ = −p = −(−7) = 7.',
      ru: 'В приведённом уравнении x² + px + q = 0 сумма корней равна −p = 7.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-alg-79-3',
    subjectId: 'algebra',
    grade: 7,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'ALG-FSU',
    goalLabel: { kk: 'Қысқаша көбейту формулалары', ru: 'Формулы сокращённого умножения' },
    prompt: {
      kk: '(a − 3)² өрнегі қай көпмүшеге тең?',
      ru: 'Какому многочлену равно выражение (a − 3)²?',
    },
    options: [
      { kk: 'a² − 6a + 9', ru: 'a² − 6a + 9' },
      { kk: 'a² − 9', ru: 'a² − 9' },
      { kk: 'a² − 3a + 9', ru: 'a² − 3a + 9' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Айырманың квадраты: (a − b)² = a² − 2ab + b² = a² − 6a + 9.',
      ru: 'Квадрат разности: (a − b)² = a² − 2ab + b² = a² − 6a + 9.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-alg-79-4',
    subjectId: 'algebra',
    grade: 8,
    difficulty: 'advanced',
    format: 'calculation',
    goalCode: 'ALG-QUAD',
    goalLabel: { kk: 'Квадрат теңдеулер', ru: 'Квадратные уравнения' },
    prompt: {
      kk: 'x² − 9 = 0 теңдеуінің оң түбірін табыңыз.',
      ru: 'Найдите положительный корень уравнения x² − 9 = 0.',
    },
    correctAnswer: '3',
    explanation: {
      kk: 'x² = 9 ⇒ x = ±3. Оң түбір: 3.',
      ru: 'x² = 9 ⇒ x = 3 или x = −3. Положительный корень: 3.',
    },
    variantGroup: 2,
  },
  {
    id: 'q-alg-79-5',
    subjectId: 'algebra',
    grade: 7,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'ALG-FSU',
    goalLabel: { kk: 'Қысқаша көбейту формулалары', ru: 'Формулы сокращённого умножения' },
    prompt: {
      kk: 'Формула арқылы тиімді есептеңіз: 25² − 15²',
      ru: 'Вычислите рациональным способом: 25² − 15²',
    },
    correctAnswer: '400',
    explanation: {
      kk: 'a² − b² = (a − b)(a + b) = (25 − 15)(25 + 15) = 10 × 40 = 400.',
      ru: 'a² − b² = (25 − 15)(25 + 15) = 10 × 40 = 400.',
    },
    variantGroup: 2,
  },

  // Geometry
  {
    id: 'q-geom-8-1',
    subjectId: 'geometry',
    grade: 8,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'GEOM-PYTH',
    goalLabel: { kk: 'Пифагор теоремасы', ru: 'Теорема Пифагора' },
    prompt: {
      kk: 'Тікбұрышты үшбұрыштың катеттері 3 см және 4 см. Гипотенузасы неше см?',
      ru: 'Катеты прямоугольного треугольника равны 3 см и 4 см. Найдите гипотенузу (в см).',
    },
    correctAnswer: '5',
    explanation: {
      kk: 'c = √(3² + 4²) = √(9 + 16) = √25 = 5 см.',
      ru: 'c = √(3² + 4²) = √(9 + 16) = √25 = 5 см.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-geom-8-2',
    subjectId: 'geometry',
    grade: 8,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'GEOM-PYTH',
    goalLabel: { kk: 'Пифагор теоремасы', ru: 'Теорема Пифагора' },
    prompt: {
      kk: 'Гипотенузасы 13 см, ал бір катеті 5 см болса, екінші катетін табыңыз.',
      ru: 'Гипотенуза равна 13 см, один из катетов равен 5 см. Найдите второй катет (в см).',
    },
    correctAnswer: '12',
    explanation: {
      kk: 'b = √(13² − 5²) = √(169 − 25) = √144 = 12 см.',
      ru: 'b = √(13² − 5²) = √(169 − 25) = √144 = 12 см.',
    },
    variantGroup: 2,
  },

  // Grade 10-11 Algebra and Analysis
  {
    id: 'q-algan-10-1',
    subjectId: 'algebra_analysis',
    grade: 10,
    difficulty: 'medium',
    format: 'mcq',
    goalCode: 'ALGAN-DERIV',
    goalLabel: { kk: 'Функцияның туындысы', ru: 'Производная функции' },
    prompt: {
      kk: 'f(x) = x³ + 2x функциясының туындысын табыңыз.',
      ru: 'Найдите производную функции f(x) = x³ + 2x.',
    },
    options: [
      { kk: '3x² + 2', ru: '3x² + 2' },
      { kk: '3x + 2', ru: '3x + 2' },
      { kk: 'x² + 2', ru: 'x² + 2' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: '(xⁿ)′ = n·xⁿ⁻¹, (kx)′ = k. Сондықтан f′(x) = 3x² + 2.',
      ru: 'По правилу дифференцирования степенной функции: (x³)′ = 3x², (2x)′ = 2.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-algan-10-2',
    subjectId: 'algebra_analysis',
    grade: 10,
    difficulty: 'advanced',
    format: 'calculation',
    goalCode: 'ALGAN-DERIV',
    goalLabel: { kk: 'Функцияның туындысы', ru: 'Производная функции' },
    prompt: {
      kk: 'f(x) = x² − 6x + 5 функциясының минимум нүктесін (x₀) табыңыз.',
      ru: 'Найдите точку минимума x₀ функции f(x) = x² − 6x + 5.',
    },
    correctAnswer: '3',
    explanation: {
      kk: 'f′(x) = 2x − 6 = 0 ⇒ x₀ = 3.',
      ru: 'Находим производную: f′(x) = 2x − 6. Приравниваем к нулю: 2x − 6 = 0 ⇒ x₀ = 3.',
    },
    variantGroup: 2,
  },

  // Physics
  {
    id: 'q-phys-7-1',
    subjectId: 'physics',
    grade: 7,
    difficulty: 'basic',
    format: 'calculation',
    goalCode: 'PHYS-MECH',
    goalLabel: { kk: 'Жылдамдық және күш', ru: 'Скорость и законы Ньютона' },
    prompt: {
      kk: 'Велосипедші 120 метр жолды 20 секундта жүріп өтті. Оның жылдамдығы қандай (м/с)?',
      ru: 'Велосипедист проехал 120 метров за 20 секунд. Найдите его скорость (в м/с).',
    },
    correctAnswer: '6',
    explanation: {
      kk: 'v = s / t = 120 / 20 = 6 м/с.',
      ru: 'v = s / t = 120 / 20 = 6 м/с.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-phys-9-2',
    subjectId: 'physics',
    grade: 9,
    difficulty: 'medium',
    format: 'calculation',
    goalCode: 'PHYS-MECH',
    goalLabel: { kk: 'Жылдамдық және күш', ru: 'Скорость и законы Ньютона' },
    prompt: {
      kk: 'Массасы 4 кг дене 3 м/с² үдеумен қозғалады. Оған әсер ететін теңәсерлі күшті табыңыз (Н).',
      ru: 'Тело массой 4 кг движется с ускорением 3 м/с². Найдите силу, действующую на тело (в Н).',
    },
    correctAnswer: '12',
    explanation: {
      kk: 'Ньютонның екінші заңы бойынша F = m · a = 4 · 3 = 12 Н.',
      ru: 'По второму закону Ньютона F = m · a = 4 · 3 = 12 Н.',
    },
    variantGroup: 2,
  },

  // Informatics & Digital Literacy
  {
    id: 'q-inf-6-1',
    subjectId: 'informatics',
    grade: 6,
    difficulty: 'basic',
    format: 'calculation',
    goalCode: 'INF-BIN',
    goalLabel: { kk: 'Екілік кодтау және Python', ru: 'Двоичное кодирование и Python' },
    prompt: {
      kk: '2 байтта неше бит бар?',
      ru: 'Сколько бит содержится в 2 байтах?',
    },
    correctAnswer: '16',
    explanation: {
      kk: '1 байт = 8 бит, сондықтан 2 байт = 16 бит.',
      ru: '1 байт = 8 бит, поэтому 2 байта = 16 бит.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-inf-8-2',
    subjectId: 'informatics',
    grade: 8,
    difficulty: 'medium',
    format: 'short_answer',
    goalCode: 'INF-BIN',
    goalLabel: { kk: 'Екілік кодтау және Python', ru: 'Двоичное кодирование и Python' },
    prompt: {
      kk: 'Python тілінде x = 10; if x > 5: print("A") else: print("B") коды не шығарады?',
      ru: 'Что выведет код на Python: x = 10; if x > 5: print("A") else: print("B")?',
    },
    correctAnswer: 'A',
    explanation: {
      kk: '10 > 5 шарты ақиқат, сондықтан "A" шығарылады.',
      ru: 'Условие 10 > 5 истинно, поэтому выполнится ветка if и выведется A.',
    },
    variantGroup: 2,
  },
  {
    id: 'q-inf-10-3',
    subjectId: 'informatics',
    grade: 10,
    difficulty: 'medium',
    format: 'mcq',
    goalCode: 'INF-AI',
    goalLabel: { kk: 'ЖИ және деректер этикасы', ru: 'Основы ИИ и этика данных' },
    prompt: {
      kk: 'Оқу барысында жасанды интеллект жауабын қолданғанда қай әрекет академиялық адалдыққа сәйкес келеді?',
      ru: 'Какое действие соответствует академической честности при использовании ИИ в учёбе?',
    },
    options: [
      { kk: 'Деректерді тексеріп, шешім барысын өзі түсіну', ru: 'Проверить факты и разобраться в ходе решения' },
      { kk: 'Тексермей толық көшіріп тапсыру', ru: 'Сдать ответ без проверки и понимания' },
      { kk: 'Жалған дереккөз қосу', ru: 'Добавить вымышленные источники' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'ЖИ — оқу көмекшісі, ал фактілер мен қорытындыны тексеру оқушының жауапкершілігінде.',
      ru: 'ИИ помогает понять материал, но проверка фактов и самостоятельное осмысление обязательны.',
    },
    variantGroup: 1,
  },

  // History of Kazakhstan
  {
    id: 'q-hkz-7-1',
    subjectId: 'history_kz',
    grade: 7,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'HKZ-KHAN',
    goalLabel: { kk: 'Қазақ хандығы', ru: 'Казахское ханство' },
    prompt: {
      kk: 'Қазақ хандығы қай жылы құрылды?',
      ru: 'В каком году было образовано Казахское ханство?',
    },
    options: [
      { kk: '1465 ж.', ru: '1465 г.' },
      { kk: '1219 ж.', ru: '1219 г.' },
      { kk: '1723 ж.', ru: '1723 г.' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Мұхаммед Хайдар Дулатидің «Тарих-и Рашиди» еңбегі бойынша Қазақ хандығы 1465 жылы құрылды.',
      ru: 'Согласно труду М.Х. Дулати «Тарих-и Рашиди», Казахское ханство образовано в 1465 году.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-hkz-9-2',
    subjectId: 'history_kz',
    grade: 9,
    difficulty: 'medium',
    format: 'matching',
    goalCode: 'HKZ-ALASH',
    goalLabel: { kk: 'Алаш қозғалысы және Тәуелсіздік', ru: 'Движение Алаш и Независимость' },
    prompt: {
      kk: 'Тарихи тұлғалар мен олардың қызметін сәйкестендіріңіз (формат: 1-A,2-B)',
      ru: 'Сопоставьте исторических деятелей и их роль (введите индекс верного ответа: 0 — Әлихан Бөкейхан = «Алаш» жетекшісі)',
    },
    options: [
      { kk: 'Әлихан Бөкейхан — «Алаш» үкіметінің төрағасы', ru: 'Алихан Бокейхан — председатель правительства «Алаш»' },
      { kk: 'Керей сұлтан — XX ғасыр саясаткері', ru: 'Султан Керей — политик XX века' },
      { kk: 'Абылай хан — 1991 жылғы актінің авторы', ru: 'Абылай хан — автор акта 1991 года' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Әлихан Бөкейхан — 1917 жылы құрылған Алаш Орда үкіметінің төрағасы.',
      ru: 'Алихан Бокейхан возглавлял правительство Алаш-Орды, созданное в 1917 году.',
    },
    variantGroup: 2,
  },

  // Chemistry & Biology & Law
  {
    id: 'q-chem-8-1',
    subjectId: 'chemistry',
    grade: 8,
    difficulty: 'basic',
    format: 'calculation',
    goalCode: 'CHEM-ATOM',
    goalLabel: { kk: 'Атом құрылысы', ru: 'Строение атома' },
    prompt: {
      kk: 'Оттегінің (O) реттік нөмірі 8. Оның атомының ядросында неше протон бар?',
      ru: 'Порядковый номер кислорода (O) равен 8. Сколько протонов в ядре его атома?',
    },
    correctAnswer: '8',
    explanation: {
      kk: 'Протон саны элементтің периодтық жүйедегі реттік нөміріне тең (Z = 8).',
      ru: 'Число протонов в ядре равно порядковому номеру элемента в таблице Менделеева (8).',
    },
    variantGroup: 1,
  },
  {
    id: 'q-bio-7-1',
    subjectId: 'biology',
    grade: 7,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'BIO-CELL',
    goalLabel: { kk: 'Жасуша және фотосинтез', ru: 'Клетка и фотосинтез' },
    prompt: {
      kk: 'Өсімдік жасушасында фотосинтез процесі қай органоидта жүреді?',
      ru: 'В каком органоиде растительной клетки происходит фотосинтез?',
    },
    options: [
      { kk: 'Хлоропласт', ru: 'Хлоропласт' },
      { kk: 'Рибосома', ru: 'Рибосома' },
      { kk: 'Гольджи аппараты', ru: 'Аппарат Гольджи' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Фотосинтез хлорофилл пигменті бар хлоропластарда жүзеге асады.',
      ru: 'Фотосинтез протекает в хлоропластах, содержащих хлорофилл.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-law-9-1',
    subjectId: 'law_basics',
    grade: 9,
    difficulty: 'medium',
    format: 'mcq',
    goalCode: 'LAW-CONST',
    goalLabel: { kk: 'ҚР Конституциясы', ru: 'Конституция РК' },
    prompt: {
      kk: 'Қазақстан Республикасының қолданыстағы Конституциясы қай жылы қабылданды?',
      ru: 'В каком году была принята действующая Конституция Республики Казахстан?',
    },
    options: [
      { kk: '1995 жылғы 30 тамыз', ru: '30 августа 1995 года' },
      { kk: '1991 жылғы 16 желтоқсан', ru: '16 декабря 1991 года' },
      { kk: '1993 жылғы 28 қаңтар', ru: '28 января 1993 года' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'ҚР Конституциясы 1995 жылғы 30 тамызда республикалық референдумда қабылданды.',
      ru: 'Действующая Конституция РК принята на республиканском референдуме 30 августа 1995 года.',
    },
    variantGroup: 1,
  },

  // Kazakh, Russian, English Languages
  {
    id: 'q-kz-5-1',
    subjectId: 'kazakh_lang',
    grade: 5,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'KZ-HARMONY',
    goalLabel: { kk: 'Үндестік заңы және септіктер', ru: 'Сингармонизм и падежи' },
    prompt: {
      kk: '«Мектеп» сөзіне барыс септігінің қай жалғауы дұрыс жалғанады?',
      ru: 'Какое окончание дательно-направительного падежа (Барыс септік) правильно для слова «мектеп»?',
    },
    options: [
      { kk: 'мектепке', ru: 'мектепке' },
      { kk: 'мектепқа', ru: 'мектепқа' },
      { kk: 'мектепге', ru: 'мектепге' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Түбір жіңішке (е) және қатаң дыбысқа (п) аяқталғандықтан -ке жалғауы жалғанады.',
      ru: 'Основа мягкая и оканчивается на глухой согласный «п», поэтому добавляется -ке.',
    },
    variantGroup: 1,
  },
  {
    id: 'q-ru-6-1',
    subjectId: 'russian_lang',
    grade: 6,
    difficulty: 'medium',
    format: 'text_analysis',
    goalCode: 'RU-ORTHO',
    goalLabel: { kk: 'Орфография және пунктуация', ru: 'Орфография и пунктуация' },
    passage: {
      kk: 'Қысқа үзінді: «Күзгі орман тыныш, бірақ жел ағаш жапырақтарын сыбдырлатады».',
      ru: 'Прочитайте предложение: «Солнце уже садилось за горизонт, и лёгкий ветер шелестел листвой».',
    },
    prompt: {
      kk: 'Бұл сөйлем қандай сөйлем түріне жатады?',
      ru: 'Укажите вид этого предложения по структуре:',
    },
    options: [
      { kk: 'Салалас құрмалас сөйлем', ru: 'Сложносочинённое предложение' },
      { kk: 'Жай сөйлем', ru: 'Простое предложение' },
      { kk: 'Атаулы сөйлем', ru: 'Назывное предложение' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Екі тең дәрежелі жай сөйлем жалғаулық арқылы байланысқан.',
      ru: 'Две грамматические основы соединены сочинительным союзом «и».',
    },
    variantGroup: 1,
  },
  {
    id: 'q-eng-5-1',
    subjectId: 'english_lang',
    grade: 5,
    difficulty: 'basic',
    format: 'mcq',
    goalCode: 'ENG-TENSE',
    goalLabel: { kk: 'Ағылшын тілі шақтары', ru: 'Времена английского языка' },
    prompt: {
      kk: 'Дұрыс нұсқаны таңдаңыз: She ___ to school every day.',
      ru: 'Выберите правильную форму: She ___ to school every day.',
    },
    options: [
      { kk: 'goes', ru: 'goes' },
      { kk: 'go', ru: 'go' },
      { kk: 'going', ru: 'going' },
    ],
    correctAnswer: '0',
    explanation: {
      kk: 'Present Simple шағында 3-жақ жекеше түрде (he/she/it) етістікке -s/-es жалғанады.',
      ru: 'В Present Simple для местоимения she к глаголу добавляется окончание -es (goes).',
    },
    variantGroup: 1,
  },
];

export function selectDiagnosticQuestions(params: {
  subjectId: string;
  targetGrade: number;
  difficulty: DifficultyLevel;
  variantGroup?: 1 | 2;
  profile?: StudyProfile;
}): DiagnosticQuestion[] {
  const { subjectId, targetGrade, difficulty, variantGroup } = params;

  // Prefer exact subject + close grade
  const bySubject = DIAGNOSTIC_QUESTIONS.filter((q) => q.subjectId === subjectId);
  const pool = bySubject.length > 0 ? bySubject : DIAGNOSTIC_QUESTIONS;

  const scored = pool
    .map((q) => {
      let score = 0;
      if (q.subjectId === subjectId) score += 20;
      score -= Math.abs(q.grade - targetGrade) * 2;
      if (q.difficulty === difficulty) score += 8;
      if (variantGroup && q.variantGroup === variantGroup) score += 10;
      return { q, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.q);

  // Return at least 3 questions when available so mastery is never judged by 1 question
  return scored.slice(0, Math.min(5, Math.max(3, scored.length)));
}
