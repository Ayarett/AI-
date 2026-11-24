import type {
  CurriculumSection,
  Lang,
  StudyProfile,
  SubjectDefinition,
} from '../types/platform';

export const OFFICIAL_SOURCES = [
  {
    id: 'goso',
    title: {
      kk: 'ҚР Мемлекеттік жалпыға міндетті білім беру стандарты (МЖМБС)',
      ru: 'Государственный общеобязательный стандарт образования РК (ГОСО)',
    },
    url: 'https://adilet.zan.kz/rus/docs/V2200029031',
    code: 'V2200029031',
  },
  {
    id: 'typ_prog',
    title: {
      kk: 'Жалпы білім беретін пәндер бойынша үлгілік оқу бағдарламалары',
      ru: 'Типовые учебные программы по общеобразовательным предметам',
    },
    url: 'https://adilet.zan.kz/rus/docs/V2200029767',
    code: 'V2200029767',
  },
  {
    id: 'typ_plan',
    title: {
      kk: 'Бастауыш, негізгі орта және жалпы орта білім берудің үлгілік оқу жоспарлары',
      ru: 'Типовые учебные планы начального, основного среднего и общего среднего образования',
    },
    url: 'https://adilet.zan.kz/rus/docs/V1200008170',
    code: 'V1200008170',
  },
  {
    id: 'order_289',
    title: {
      kk: 'Үлгілік оқу жоспарларына өзгерістер, 2026 ж. 2 қазандағы №289-НҚ бұйрық',
      ru: 'Изменения к типовым учебным планам, приказ №289-НҚ от 2 октября 2026 года',
    },
    url: 'https://old.adilet.zan.kz/rus/docs/V2600040094',
    code: 'V2600040094',
  },
  {
    id: 'imp_2026',
    title: {
      kk: '2026–2027 оқу жылына арналған әдістемелік нұсқау хат',
      ru: 'Инструктивно-методическое письмо на 2026–2027 учебный год',
    },
    url: 'https://www.gov.kz/api/v1/public/assets/2026/11/10/59e3d43f22c96f39b748ef4e8a855833a1b0b8573ad43fd81e4bf93827275dca_original.1967079.pdf',
    code: 'IMP-2026-2027',
  },
] as const;

export const SUBJECT_CATALOG: SubjectDefinition[] = [
  {
    id: 'alippe',
    name: { kk: 'Әліппе', ru: 'Әліппе (Букварь)' },
    iconKey: 'alphabet',
    minGrade: 1,
    maxGrade: 1,
    onlyGrades: [1],
    weeklyHoursGuide: { general: '6 сағат/апта · 6 ч/нед (ТҮОЖ бойынша)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1': [
        {
          id: 'alippe-1-prep',
          title: { kk: 'Әліппеге дейінгі кезең', ru: 'Добукварный период' },
          profileFocus: 'all',
          topics: [
            {
              id: 'alippe-sounds',
              title: { kk: 'Дыбыс және әріп. Буын', ru: 'Звук и буква. Слог' },
              learningObjective: {
                kk: '1.1.9.1 Сөздегі дыбыс түрлерін (дауысты, дауыссыз) ажырату және дұрыс дыбыстау',
                ru: 'Различать гласные и согласные звуки в слове, делить слова на слоги',
              },
              expectedResult: {
                kk: 'Оқушы сөзді буынға бөліп, дыбыстық талдау жасайды',
                ru: 'Ученик делит слово на слоги и выполняет простой звуковой анализ',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Ауызша сөйлеу дағдысы', ru: 'Базовая устная речь' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
        {
          id: 'alippe-1-main',
          title: { kk: 'Әліппе кезеңі', ru: 'Букварный период' },
          profileFocus: 'all',
          topics: [
            {
              id: 'alippe-vowels',
              title: { kk: 'Дауысты дыбыстар мен әріптер', ru: 'Гласные звуки и буквы' },
              learningObjective: {
                kk: '1.2.1.2 Оқу түрлерін (буындап оқу, тұтас оқу) қолдану',
                ru: 'Применять слоговое и плавное чтение простых слов',
              },
              expectedResult: {
                kk: 'Қысқа сөздер мен сөйлемдерді буындап оқиды',
                ru: 'Читает короткие слова и предложения по слогам',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'short_answer'],
              prerequisites: { kk: 'Дыбыс және буын', ru: 'Звук и слог' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'kazakh_lang',
    name: { kk: 'Қазақ тілі', ru: 'Казахский язык' },
    iconKey: 'kazakh',
    minGrade: 1,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: 'ТҮОЖ-ға сәйкес (оқыту тіліне байланысты)',
      humanitarian: 'Тереңдетілген тілдік талдау және жазылым',
      physmath: 'Базалық мемлекеттік стандарт көлемінде',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'kz-1-4-phonetics',
          title: { kk: 'Фонетика және орфография негіздері', ru: 'Основы фонетики и орфографии' },
          profileFocus: 'all',
          topics: [
            {
              id: 'kz-1-4-vowels',
              title: { kk: 'Жуан және жіңішке дауыстылар', ru: 'Твёрдые и мягкие гласные' },
              learningObjective: {
                kk: 'Сөздегі жуан және жіңішке дауысты дыбыстарды ажыратып, үндестік заңын сақтап жазу',
                ru: 'Различать твёрдые и мягкие гласные казахского языка и соблюдать сингармонизм',
              },
              expectedResult: {
                kk: 'Түбір мен қосымшаны үндестік заңына сай байланыстырады',
                ru: 'Правильно присоединяет окончания с учётом закона сингармонизма',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching', 'short_answer'],
              prerequisites: { kk: 'Әріптерді тану', ru: 'Знание казахского алфавита' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '5-7': [
        {
          id: 'kz-5-7-morph',
          title: { kk: 'Сөз таптары және сөзжасам', ru: 'Части речи и словообразование' },
          profileFocus: 'all',
          topics: [
            {
              id: 'kz-5-7-nouns',
              title: { kk: 'Зат есім және септік жалғаулары', ru: 'Имя существительное и падежные окончания' },
              learningObjective: {
                kk: 'Мәтін мазмұнын түсіну, септік жалғауларын стильдік талапқа сай қолдану',
                ru: 'Понимать содержание текста и корректно применять 7 падежей казахского языка',
              },
              expectedResult: {
                kk: 'Сөйлемде септік жалғауларын дұрыс жалғайды',
                ru: 'Безошибочно образует падежные формы существительных в речи и письме',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'short_answer', 'text_analysis'],
              prerequisites: { kk: 'Үндестік заңы', ru: 'Закон сингармонизма' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '8-9': [
        {
          id: 'kz-8-9-syntax',
          title: { kk: 'Синтаксис және сөйлеу мәдениеті', ru: 'Синтаксис и культура речи' },
          profileFocus: 'all',
          topics: [
            {
              id: 'kz-8-9-complex',
              title: { kk: 'Құрмалас сөйлем түрлері', ru: 'Виды сложных предложений' },
              learningObjective: {
                kk: 'Салалас және сабақтас құрмалас сөйлемдердің жасалу жолын талдау және қолдану',
                ru: 'Анализировать и использовать сложносочинённые и сложноподчинённые предложения',
              },
              expectedResult: {
                kk: 'Эссе мен талдау мәтіндерінде құрмалас сөйлемдерді сауатты қолданады',
                ru: 'Грамотно строит сложные конструкции и расставляет знаки препинания',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'text_analysis', 'short_answer'],
              prerequisites: { kk: 'Жай сөйлем синтаксисі', ru: 'Синтаксис простого предложения' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '10-11': [
        {
          id: 'kz-10-11-style',
          title: { kk: 'Стилистика, риторика және академиялық жазылым', ru: 'Стилистика, риторика и академическое письмо' },
          profileFocus: 'humanitarian',
          topics: [
            {
              id: 'kz-10-11-essay',
              title: { kk: 'Аргументативті эссе және стильдік нормалар', ru: 'Аргументативное эссе и стилистические нормы' },
              learningObjective: {
                kk: 'Әлеуметтік-қоғамдық тақырыптарда дәлелді пікір білдіру, функционалдық стильдерді салыстыру',
                ru: 'Формулировать аргументированную позицию и различать функциональные стили речи',
              },
              expectedResult: {
                kk: 'Мәтінге лингвистикалық талдау жасап, құрылымды эссе жазады',
                ru: 'Выполняет стилистический анализ и пишет аргументированное эссе',
              },
              difficulty: 'advanced',
              exerciseTypes: ['text_analysis', 'short_answer', 'mcq'],
              prerequisites: { kk: 'Синтаксис және пунктуация', ru: 'Синтаксис и пунктуация' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'literary_reading',
    name: { kk: 'Әдебиеттік оқу', ru: 'Литературное чтение' },
    iconKey: 'literature',
    minGrade: 1,
    maxGrade: 4,
    weeklyHoursGuide: { general: 'ТҮОЖ-ға сәйкес (бастауыш сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'lit-read-1-4',
          title: { kk: 'Мәтінді түсініп оқу және кейіпкерлер', ru: 'Осознанное чтение и анализ героев' },
          profileFocus: 'all',
          topics: [
            {
              id: 'lit-read-main-idea',
              title: { kk: 'Шығарманың негізгі ойын анықтау', ru: 'Определение главной мысли произведения' },
              learningObjective: {
                kk: 'Көркем мәтіннің тақырыбы мен негізгі ойын анықтау, кейіпкердің іс-әрекетін бағалау',
                ru: 'Определять тему и главную мысль текста, характеризовать поступки героев',
              },
              expectedResult: {
                kk: 'Оқыған мәтіннің мазмұнын жоспар бойынша мазмұндайды',
                ru: 'Пересказывает текст по плану и отвечает на вопросы по содержанию',
              },
              difficulty: 'basic',
              exerciseTypes: ['text_analysis', 'mcq'],
              prerequisites: { kk: 'Сауатты оқу дағдысы', ru: 'Навык чтения' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'kazakh_lit',
    name: { kk: 'Қазақ әдебиеті', ru: 'Казахская литература' },
    iconKey: 'literature',
    minGrade: 5,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: 'ТҮОЖ бойынша',
      humanitarian: 'Тереңдетілген әдеби талдау және сыни оқу',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '5-7': [
        {
          id: 'kzlit-5-7',
          title: { kk: 'Ауыз әдебиеті және классикалық мұра', ru: 'Устное народное творчество и классика' },
          profileFocus: 'all',
          topics: [
            {
              id: 'kzlit-5-7-epos',
              title: { kk: 'Батырлар жыры мен ертегілер жанры', ru: 'Героический эпос и жанр сказки' },
              learningObjective: {
                kk: 'Әдеби шығарманың жанрлық ерекшелігі мен көркемдегіш құралдарын анықтау',
                ru: 'Определять жанровые особенности и изобразительные средства произведения',
              },
              expectedResult: {
                kk: 'Шығармадан эпитет, теңеу, гиперболаны табады',
                ru: 'Находит в тексте эпитеты, сравнения и гиперболу',
              },
              difficulty: 'medium',
              exerciseTypes: ['text_analysis', 'mcq'],
              prerequisites: { kk: 'Әдебиеттік оқу (1–4)', ru: 'Литературное чтение (1–4)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '8-11': [
        {
          id: 'kzlit-8-11',
          title: { kk: 'XIX–XX ғасырлардағы қазақ әдебиеті', ru: 'Казахская литература XIX–XX веков' },
          profileFocus: 'humanitarian',
          topics: [
            {
              id: 'kzlit-abai',
              title: { kk: 'Абай Құнанбайұлының шығармашылығы мен қара сөздері', ru: 'Творчество и «Слова назидания» Абая Кунанбайулы' },
              learningObjective: {
                kk: 'Шығарманың идеялық-тақырыптық мазмұнын тарихи дәуірмен байланыстырып талдау',
                ru: 'Анализировать идейно-тематическое содержание произведений в историческом контексте',
              },
              expectedResult: {
                kk: 'Абай қара сөздерінің философиялық мәнін дәйексөзбен талдайды',
                ru: 'Интерпретирует философские мотивы с опорой на текст',
              },
              difficulty: 'advanced',
              exerciseTypes: ['text_analysis', 'short_answer'],
              prerequisites: { kk: 'Әдебиет теориясы негіздері', ru: 'Основы теории литературы' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'russian_lang',
    name: { kk: 'Орыс тілі', ru: 'Русский язык' },
    iconKey: 'russian',
    minGrade: 1,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: 'По ТУП (с учётом языка обучения школы)',
      humanitarian: 'Углублённая стилистика и анализ текста',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'ru-1-4',
          title: { kk: 'Фонетика, лексика және орфография', ru: 'Фонетика, лексика и орфография' },
          profileFocus: 'all',
          topics: [
            {
              id: 'ru-1-4-spelling',
              title: { kk: 'Екпінді және екпінсіз дауыстылар', ru: 'Безударные гласные в корне слова' },
              learningObjective: {
                kk: 'Түбірдегі екпінсіз дауысты дыбыстарды тексеру тәсілін қолдану',
                ru: 'Проверять безударные гласные в корне слова путём подбора проверочных слов',
              },
              expectedResult: {
                kk: 'Тексерілетін дауыстыларды қатесіз жазады',
                ru: 'Грамотно применяет правило проверки безударных гласных',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'short_answer'],
              prerequisites: { kk: 'Алфавит және екпін', ru: 'Алфавит и ударение' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '5-11': [
        {
          id: 'ru-5-11-syntax',
          title: { kk: 'Морфология, синтаксис және стильдер', ru: 'Морфология, синтаксис и стили речи' },
          profileFocus: 'humanitarian',
          topics: [
            {
              id: 'ru-5-11-punct',
              title: { kk: 'Құрмалас сөйлемдегі тыныс белгілері', ru: 'Пунктуация в сложном предложении и причастные обороты' },
              learningObjective: {
                kk: 'Сөйлем құрылымын талдау, тыныс белгілерін мағыналық және грамматикалық негізде қою',
                ru: 'Определять грамматические основы и аргументированно расставлять знаки препинания',
              },
              expectedResult: {
                kk: 'Күрделі синтаксистік құрылымдарды дұрыс ресімдейді',
                ru: 'Безошибочно оформляет сложные предложения и обособленные конструкции',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'text_analysis', 'short_answer'],
              prerequisites: { kk: 'Жай сөйлем мүшелері', ru: 'Члены простого предложения' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'russian_lit',
    name: { kk: 'Орыс әдебиеті', ru: 'Русская литература' },
    iconKey: 'literature',
    minGrade: 5,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: 'По ТУП',
      humanitarian: 'Углублённый интерпретационный анализ',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '5-11': [
        {
          id: 'rulit-5-11',
          title: { kk: 'Көркем мәтін поэтикасы және талдау', ru: 'Поэтика художественного текста и анализ' },
          profileFocus: 'humanitarian',
          topics: [
            {
              id: 'rulit-genre',
              title: { kk: 'Шығарма композициясы және конфликт', ru: 'Композиция и конфликт в художественном произведении' },
              learningObjective: {
                kk: 'Шығарма сюжетінің элементтері мен авторлық позицияны талдау',
                ru: 'Выявлять элементы сюжета, композиции и авторскую позицию в тексте',
              },
              expectedResult: {
                kk: 'Эпизодқа дәлелді әдеби талдау жасайды',
                ru: 'Строит связный анализ фрагмента с аргументацией из текста',
              },
              difficulty: 'medium',
              exerciseTypes: ['text_analysis', 'mcq'],
              prerequisites: { kk: 'Әдебиеттік оқу', ru: 'Литературное чтение' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'english_lang',
    name: { kk: 'Шет тілі (ағылшын тілі)', ru: 'Иностранный язык (английский язык)' },
    iconKey: 'english',
    minGrade: 1,
    maxGrade: 11,
    weeklyHoursGuide: { general: 'ТҮОЖ бойынша (CEFR A1 → B2)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'eng-1-4',
          title: { kk: 'Бастапқы сөздік қор және қарапайым сөйлемдер', ru: 'Базовая лексика и простые конструкции (Pre-A1/A1)' },
          profileFocus: 'all',
          topics: [
            {
              id: 'eng-1-4-tobe',
              title: { kk: 'To be етістігі және танысу диалогтары', ru: 'Глагол to be и базовые диалоги знакомства' },
              learningObjective: {
                kk: 'Қарапайым ақпарат сұрау және өзі туралы қысқаша айту (am / is / are)',
                ru: 'Использовать формы глагола to be (am/is/are) в простых утвердительных и вопросительных предложениях',
              },
              expectedResult: {
                kk: 'Күнделікті тақырыптарда қысқа диалог құрастырады',
                ru: 'Составляет короткие фразы о себе, семье и школе',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching', 'short_answer'],
              prerequisites: { kk: 'Ағылшын әліпбиі', ru: 'Английский алфавит' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '5-11': [
        {
          id: 'eng-5-11',
          title: { kk: 'Грамматикалық шақтар және оқылым дағдылары', ru: 'Времена глагола и чтение с пониманием (A2–B2)' },
          profileFocus: 'all',
          topics: [
            {
              id: 'eng-tenses',
              title: { kk: 'Present Simple, Past Simple және Present Perfect', ru: 'Сравнение Present Simple, Past Simple и Present Perfect' },
              learningObjective: {
                kk: 'Мәтін мен сөйлеуде шақтарды мағынасына қарай дұрыс таңдау',
                ru: 'Выбирать корректную видовременную форму в зависимости от контекста и маркеров времени',
              },
              expectedResult: {
                kk: 'Оқиға уақытын ажыратып, грамматикалық форманы дәл қолданады',
                ru: 'Различает завершённое действие, регулярное действие и результат к настоящему моменту',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'short_answer', 'text_analysis'],
              prerequisites: { kk: 'Базалық етістіктер', ru: 'Базовые глаголы и лексика A1' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'math',
    name: { kk: 'Математика', ru: 'Математика' },
    iconKey: 'math',
    minGrade: 1,
    maxGrade: 6,
    weeklyHoursGuide: {
      general: '4–5 сағат/апта · 4–5 ч/нед (1–6 сынып)',
      physmath: '5–6 сыныптарда логикалық және олимпиадалық есептермен күшейтілген',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'math-1-4-num',
          title: { kk: 'Сандар, амалдар және мәтіндік есептер', ru: 'Числа, арифметика и текстовые задачи' },
          profileFocus: 'all',
          topics: [
            {
              id: 'math-1-4-ops',
              title: { kk: 'Көбейту кестесі, бөлу және амалдар реті', ru: 'Умножение, деление и порядок действий' },
              learningObjective: {
                kk: 'Жақшалы және жақшасыз өрнектердегі амалдардың орындалу ретін анықтау және есептеу',
                ru: 'Определять порядок действий в выражениях со скобками и без скобок, решать составные задачи',
              },
              expectedResult: {
                kk: 'Көп таңбалы сандармен арифметикалық амалдарды орындайды',
                ru: 'Уверенно вычисляет значения выражений и проверяет ответ',
              },
              difficulty: 'basic',
              exerciseTypes: ['calculation', 'mcq', 'logic'],
              prerequisites: { kk: 'Қосу және азайту', ru: 'Сложение и вычитание в пределах 100' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '5-6': [
        {
          id: 'math-5-6-fractions',
          title: { kk: 'Бөлшектер, пропорция және теңдеулер', ru: 'Дроби, проценты, пропорции и линейные уравнения' },
          profileFocus: 'all',
          topics: [
            {
              id: 'math-5-6-frac',
              title: { kk: 'Жай және ондық бөлшектерге амалдар қолдану', ru: 'Действия с обыкновенными и десятичными дробями' },
              learningObjective: {
                kk: 'Бөлімдері әртүрлі бөлшектерді қосу, азайту, көбейту және процентке есептер шығару',
                ru: 'Выполнять арифметические действия с обыкновенными и десятичными дробями, находить проценты от числа',
              },
              expectedResult: {
                kk: 'Бөлшектер мен проценттерге байланысты өмірлік есептерді шешеді',
                ru: 'Решает расчётные задачи с дробями и процентами с проверкой',
              },
              difficulty: 'medium',
              exerciseTypes: ['calculation', 'mcq', 'short_answer'],
              prerequisites: { kk: 'Натурал сандардың бөлінгіштігі', ru: 'Делимость натуральных чисел' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'algebra',
    name: { kk: 'Алгебра', ru: 'Алгебра' },
    iconKey: 'algebra',
    minGrade: 7,
    maxGrade: 9,
    weeklyHoursGuide: {
      general: '3 сағат/апта · 3 ч/нед (7–9 сынып)',
      physmath: 'Күрделі теңдеулер мен параметрлік есептермен тереңдетілген',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-9': [
        {
          id: 'alg-7-9-poly',
          title: { kk: 'Қысқаша көбейту формулалары және квадрат теңдеулер', ru: 'Формулы сокращённого умножения и квадратные уравнения' },
          profileFocus: 'all',
          topics: [
            {
              id: 'alg-7-9-quad',
              title: { kk: 'Квадрат теңдеулер. Дискриминант және Виет теоремасы', ru: 'Квадратные уравнения. Дискриминант и теорема Виета' },
              learningObjective: {
                kk: '8.2.2.3 Квадрат теңдеулерді дискриминант және Виет теоремасы арқылы шешу',
                ru: 'Решать полные и приведённые квадратные уравнения через дискриминант и теорему Виета',
              },
              expectedResult: {
                kk: 'Түбірлер санын дискриминант бойынша анықтап, теңдеуді тексереді',
                ru: 'Определяет количество корней по дискриминанту и проверяет корни подстановкой',
              },
              difficulty: 'medium',
              exerciseTypes: ['calculation', 'mcq', 'short_answer'],
              prerequisites: { kk: 'Сызықтық теңдеулер (7-сынып)', ru: 'Линейные уравнения (7 класс)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
            {
              id: 'alg-7-9-fs',
              title: { kk: 'Қысқаша көбейту формулалары (7-сынып)', ru: 'Формулы сокращённого умножения (7 класс)' },
              learningObjective: {
                kk: '7.2.1.10 (a±b)² және a²−b² формулаларын өрнектерді ықшамдауда қолдану',
                ru: 'Применять формулы (a±b)² и a²−b² для преобразования алгебраических выражений',
              },
              expectedResult: {
                kk: 'Көпмүшені көбейткіштерге жіктейді',
                ru: 'Раскладывает многочлены на множители и упрощает выражения',
              },
              difficulty: 'basic',
              exerciseTypes: ['calculation', 'mcq'],
              prerequisites: { kk: 'Бірмүше және көпмүше', ru: 'Одночлены и многочлены' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'algebra_analysis',
    name: { kk: 'Алгебра және анализ бастамалары', ru: 'Алгебра и начала анализа' },
    iconKey: 'algebra',
    minGrade: 10,
    maxGrade: 11,
    weeklyHoursGuide: {
      humanitarian: 'Қоғамдық-гуманитарлық бағыт (стандартты жүктеме)',
      physmath: 'Жаратылыстану-математикалық бағыт (күшейтілген жүктеме)',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '10-11': [
        {
          id: 'algan-10-11-deriv',
          title: { kk: 'Туынды, интеграл және тригонометрия', ru: 'Производная, первообразная и тригонометрия' },
          profileFocus: 'all',
          topics: [
            {
              id: 'algan-deriv',
              title: { kk: 'Функцияның туындысы және экстремумдары', ru: 'Производная функции, монотонность и экстремумы' },
              learningObjective: {
                kk: '10.4.1.17 Туынды көмегімен функцияның өсу, кему аралықтарын және экстремумдарын табу',
                ru: 'Находить производные элементарных функций и исследовать функцию на монотонность и экстремумы',
              },
              expectedResult: {
                kk: 'Туындыны есептеп, ең үлкен және ең кіші мәндерді табады',
                ru: 'Находит критические точки и определяет наибольшее/наименьшее значение на отрезке',
              },
              difficulty: 'advanced',
              exerciseTypes: ['calculation', 'mcq', 'logic'],
              prerequisites: { kk: 'Функциялар және шектер', ru: 'Функции и графики (9 класс)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'geometry',
    name: { kk: 'Геометрия', ru: 'Геометрия' },
    iconKey: 'geometry',
    minGrade: 7,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '2 сағат/апта · 2 ч/нед',
      physmath: 'Дәлелдеу есептері мен стереометрия тереңдетілген',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-9': [
        {
          id: 'geom-7-9',
          title: { kk: 'Планиметрия: үшбұрыштар және Пифагор теоремасы', ru: 'Планиметрия: треугольники и теорема Пифагора' },
          profileFocus: 'all',
          topics: [
            {
              id: 'geom-pythagoras',
              title: { kk: 'Тікбұрышты үшбұрыш. Пифагор теоремасы', ru: 'Прямоугольный треугольник и теорема Пифагора' },
              learningObjective: {
                kk: '8.1.3.3 Пифагор теоремасын дәлелдеу және есептер шығаруда қолдану',
                ru: 'Применять теорему Пифагора и соотношения между сторонами и углами треугольника',
              },
              expectedResult: {
                kk: 'Гипотенуза мен катеттерді дәл есептейді',
                ru: 'Вычисляет неизвестные стороны и решает прикладные задачи по чертежу',
              },
              difficulty: 'medium',
              exerciseTypes: ['calculation', 'mcq'],
              prerequisites: { kk: 'Үшбұрыштар теңдігі белгілері', ru: 'Признаки равенства треугольников' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '10-11': [
        {
          id: 'geom-10-11',
          title: { kk: 'Стереометрия: көпжақтар және айналу денелері', ru: 'Стереометрия: многогранники и тела вращения' },
          profileFocus: 'physmath',
          topics: [
            {
              id: 'geom-stereo-vol',
              title: { kk: 'Призма, пирамида және цилиндрдің көлемі', ru: 'Объёмы и площади поверхности призмы, пирамиды и цилиндра' },
              learningObjective: {
                kk: 'Кеңістіктік фигуралардың бетінің ауданы мен көлемін табу формулаларын қолдану',
                ru: 'Вычислять площади боковой/полной поверхности и объёмы пространственных тел',
              },
              expectedResult: {
                kk: 'Кеңістік есептерінде қима салып, көлемді есептейді',
                ru: 'Решает стереометрические задачи с сечениями',
              },
              difficulty: 'advanced',
              exerciseTypes: ['calculation', 'mcq'],
              prerequisites: { kk: 'Планиметрия (7–9)', ru: 'Планиметрия (7–9)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'digital_literacy',
    name: { kk: 'Цифрлық сауаттылық', ru: 'Цифровая грамотность' },
    iconKey: 'informatics',
    minGrade: 1,
    maxGrade: 4,
    weeklyHoursGuide: { general: '1 сағат/апта · 1 ч/нед (1–4 сынып)' },
    officialSource: 'https://www.gov.kz/api/v1/public/assets/2026/11/10/59e3d43f22c96f39b748ef4e8a855833a1b0b8573ad43fd81e4bf93827275dca_original.1967079.pdf',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'dig-1-4',
          title: { kk: 'Алгоритмдер, киберқауіпсіздік және ЖИ негіздері', ru: 'Алгоритмы, кибербезопасность и основы ИИ' },
          profileFocus: 'all',
          topics: [
            {
              id: 'dig-safety-ai',
              title: { kk: 'Желідегі қауіпсіздік және алгоритмдік ойлау', ru: 'Безопасность в сети и первые алгоритмы' },
              learningObjective: {
                kk: 'Қауіпсіз құпиясөздер мен жеке деректерді қорғау ережелерін сақтау, қарапайым циклдік алгоритм құру',
                ru: 'Соблюдать правила цифровой гигиены, не раскрывать личные данные и составлять линейные/циклические алгоритмы',
              },
              expectedResult: {
                kk: 'Оқушы қауіпсіз әрекеттерді ажыратып, қадамдық алгоритм құрады',
                ru: 'Отличает безопасные действия в сети и строит последовательность команд',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'logic', 'matching'],
              prerequisites: { kk: 'Компьютермен бастапқы таныстық', ru: 'Базовое знакомство с устройствами' },
              officialSource: 'https://www.gov.kz/api/v1/public/assets/2026/11/10/59e3d43f22c96f39b748ef4e8a855833a1b0b8573ad43fd81e4bf93827275dca_original.1967079.pdf',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'informatics',
    name: { kk: 'Информатика', ru: 'Информатика' },
    iconKey: 'informatics',
    minGrade: 5,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '1–2 сағат/апта · 1–2 ч/нед',
      physmath: 'Алгоритмдеу, Python және ЖИ жүйелерін тереңдету (2026–2027 жж. өзгерістер)',
    },
    officialSource: 'https://old.adilet.zan.kz/rus/docs/V2600040094',
    sectionsByGradeRange: {
      '5-7': [
        {
          id: 'inf-5-7',
          title: { kk: 'Ақпаратты кодтау, Python және алгоритмдер', ru: 'Представление информации, алгоритмы и Python' },
          profileFocus: 'all',
          topics: [
            {
              id: 'inf-5-7-binary',
              title: { kk: 'Екілік кодтау, ақпарат өлшем бірліктері және тармақталу', ru: 'Двоичное кодирование и условные операторы в Python' },
              learningObjective: {
                kk: 'Ақпараттың өлшем бірліктерін (бит, байт, КБ) түрлендіру және if/else тармақталу алгоритмін жазу',
                ru: 'Переводить единицы измерения информации и программировать ветвление (if/else) на Python',
              },
              expectedResult: {
                kk: 'Өлшем бірліктерін есептеп, қарапайым бағдарлама жазады',
                ru: 'Конвертирует единицы информации и читает код с условиями',
              },
              difficulty: 'medium',
              exerciseTypes: ['calculation', 'mcq', 'logic'],
              prerequisites: { kk: 'Цифрлық сауаттылық (1–4)', ru: 'Цифровая грамотность (1–4)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '8-11': [
        {
          id: 'inf-8-11-ai',
          title: { kk: 'Деректер қоры, ЖИ этикасы және бағдарламалау (2026–2027)', ru: 'Алгоритмы, базы данных и основы ИИ (обновление 2026–2027)' },
          profileFocus: 'physmath',
          topics: [
            {
              id: 'inf-ai-ethics',
              title: { kk: 'Жасанды интеллект, деректерді талдау және цифрлық этика', ru: 'Принципы работы ИИ, работа с данными и этика' },
              learningObjective: {
                kk: 'Машиналық оқыту мен ЖИ модельдерінің негізгі қағидаларын және академиялық адалдық талаптарын түсіну',
                ru: 'Понимать базовые принципы машинного обучения, проверку достоверности данных и этику использования ИИ',
              },
              expectedResult: {
                kk: 'ЖИ нәтижелерін сыни бағалап, деректермен жұмыс алгоритмін құрады',
                ru: 'Критически проверяет ответы ИИ и корректно формулирует алгоритмы обработки данных',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'logic', 'short_answer'],
              prerequisites: { kk: 'Python негіздері', ru: 'Основы программирования на Python' },
              officialSource: 'https://old.adilet.zan.kz/rus/docs/V2600040094',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'natural_science',
    name: { kk: 'Жаратылыстану', ru: 'Естествознание' },
    iconKey: 'science',
    minGrade: 1,
    maxGrade: 6,
    weeklyHoursGuide: { general: '1–2 сағат/апта · 1–2 ч/нед (1–6 сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-6': [
        {
          id: 'nat-1-6',
          title: { kk: 'Тірі табиғат, заттар және Жер ғаламшары', ru: 'Живая природа, вещества и планета Земля' },
          profileFocus: 'all',
          topics: [
            {
              id: 'nat-water-cycle',
              title: { kk: 'Табиғаттағы су айналымы және агрегаттық күйлер', ru: 'Круговорот воды в природе и агрегатные состояния' },
              learningObjective: {
                kk: 'Заттардың үш күйін (қатты, сұйық, газ) және табиғаттағы су айналымы кезеңдерін сипаттау',
                ru: 'Описывать три агрегатных состояния вещества и процессы испарения, конденсации и осадков',
              },
              expectedResult: {
                kk: 'Бақылау тәжірибесінің нәтижесін түсіндіреді',
                ru: 'Объясняет физические явления природы на бытовых примерах',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Бақылау дағдылары', ru: 'Начальные наблюдения за природой' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'world_cognition',
    name: { kk: 'Дүниетану', ru: 'Познание мира' },
    iconKey: 'world',
    minGrade: 1,
    maxGrade: 4,
    weeklyHoursGuide: { general: '1 сағат/апта · 1 ч/нед (1–4 сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-4': [
        {
          id: 'world-1-4',
          title: { kk: 'Мен және қоғам. Қазақстан картасы', ru: 'Я и общество. Родной край и Казахстан' },
          profileFocus: 'all',
          topics: [
            {
              id: 'world-symbols',
              title: { kk: 'Қазақстанның мемлекеттік рәміздері және қоғам', ru: 'Государственные символы Казахстана и правила безопасности' },
              learningObjective: {
                kk: 'Қазақстан Республикасының мемлекеттік рәміздерін тану және қоғамдық тәртіп ережелерін білу',
                ru: 'Знать государственные символы РК, родной край и правила безопасного поведения',
              },
              expectedResult: {
                kk: 'Рәміздердің мағынасын түсіндіреді',
                ru: 'Описывает значение государственных символов и ориентируется на карте',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Бастапқы дүниетаным', ru: 'Базовый кругозор' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'history_kz',
    name: { kk: 'Қазақстан тарихы', ru: 'История Казахстана' },
    iconKey: 'history_kz',
    minGrade: 5,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '2 сағат/апта · 2 ч/нед',
      humanitarian: 'Дереккөздермен тереңдетілген талдау және хронология',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '5-7': [
        {
          id: 'hkz-5-7',
          title: { kk: 'Ежелгі және ортағасырлық Қазақстан', ru: 'Древний и средневековый Казахстан' },
          profileFocus: 'all',
          topics: [
            {
              id: 'hkz-khanate',
              title: { kk: 'Қазақ хандығының құрылуы (1465 ж.)', ru: 'Образование Казахского ханства (1465 г.)' },
              learningObjective: {
                kk: 'Керей мен Жәнібек сұлтандардың рөлін және Қазақ хандығының құрылуының тарихи маңызын анықтау',
                ru: 'Определять исторические предпосылки, роль Керея и Жанибека и значение образования Казахского ханства',
              },
              expectedResult: {
                kk: 'Негізгі оқиғалар мен даталарды хронологиялық ретпен орналастырады',
                ru: 'Соотносит исторические события, даты и персоналии',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'matching', 'text_analysis'],
              prerequisites: { kk: 'Ақ Орда және Моғолстан', ru: 'Ак-Орда и Могулистан' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '8-11': [
        {
          id: 'hkz-8-11',
          title: { kk: 'Жаңа заман және Тәуелсіз Қазақстан', ru: 'Новое время и Независимый Казахстан' },
          profileFocus: 'humanitarian',
          topics: [
            {
              id: 'hkz-alash',
              title: { kk: 'ХХ ғасыр басындағы «Алаш» қозғалысы және Тәуелсіздік', ru: 'Движение «Алаш» и провозглашение Независимости РК' },
              learningObjective: {
                kk: '«Алаш» партиясының бағдарламалық мақсаттарын және 1991 жылғы Тәуелсіздік актісінің маңызын талдау',
                ru: 'Анализировать программные идеи деятелей «Алаш» и ключевые этапы становления независимого Казахстана',
              },
              expectedResult: {
                kk: 'Тарихи деректер негізінде себеп-салдарлық байланыс орнатады',
                ru: 'Устанавливает причинно-следственные связи исторических процессов',
              },
              difficulty: 'advanced',
              exerciseTypes: ['text_analysis', 'mcq', 'short_answer'],
              prerequisites: { kk: 'Қазақ хандығы тарихы', ru: 'История Казахского ханства' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'history_world',
    name: { kk: 'Дүниежүзі тарихы', ru: 'Всемирная история' },
    iconKey: 'history_world',
    minGrade: 5,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '1–1.5 сағат/апта',
      humanitarian: 'Салыстырмалы тарихи талдаумен тереңдетілген',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '5-11': [
        {
          id: 'hw-5-11',
          title: { kk: 'Өркениеттер дамуы және жаңа дәуір', ru: 'История цивилизаций и переход к Новому времени' },
          profileFocus: 'all',
          topics: [
            {
              id: 'hw-silk-road',
              title: { kk: 'Ұлы Жібек жолы және ортағасырлық өркениеттер', ru: 'Великий Шёлковый путь и взаимодействие цивилизаций' },
              learningObjective: {
                kk: 'Сауда жолдарының мәдени, ғылыми және экономикалық байланыстарға әсерін бағалау',
                ru: 'Оценивать роль Великого Шёлкового пути в культурном и экономическом обмене Евразии',
              },
              expectedResult: {
                kk: 'Өркениеттер арасындағы өзара ықпалдастық мысалдарын келтіреді',
                ru: 'Приводит примеры технологического и культурного обмена между регионами',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'text_analysis'],
              prerequisites: { kk: 'Ежелгі дүние тарихы', ru: 'История древнего мира' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'law_basics',
    name: { kk: 'Құқық негіздері', ru: 'Основы права' },
    iconKey: 'law',
    minGrade: 9,
    maxGrade: 11,
    onlyGrades: [9, 10, 11],
    weeklyHoursGuide: {
      general: '1 сағат/апта · 1 ч/нед (9–11 сынып)',
      humanitarian: 'Құқықтық кейстерді талдаумен тереңдетілген',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '9-11': [
        {
          id: 'law-const',
          title: { kk: 'Конституциялық құқық және адам құқықтары', ru: 'Конституционное право и права человека в РК' },
          profileFocus: 'all',
          topics: [
            {
              id: 'law-constitution',
              title: { kk: 'ҚР Конституциясы — мемлекеттің Ата Заңы', ru: 'Конституция Республики Казахстан: права и обязанности граждан' },
              learningObjective: {
                kk: 'Қазақстан Республикасы Конституциясының негізгі қағидаларын және кәмелетке толмағандардың құқықтарын түсіндіру',
                ru: 'Различать конституционные права, свободы и обязанности граждан, включая права несовершеннолетних',
              },
              expectedResult: {
                kk: 'Құқықтық жағдаяттарды заң нормалары негізінде шешеді',
                ru: 'Анализирует простые правовые ситуации с опорой на Конституцию РК',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'text_analysis', 'logic'],
              prerequisites: { kk: 'Қазақстан тарихы (8-сынып)', ru: 'История Казахстана (8 класс)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'physics',
    name: { kk: 'Физика', ru: 'Физика' },
    iconKey: 'physics',
    minGrade: 7,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '2 сағат/апта (7–9)',
      physmath: '3–4 сағат/апта (есептер мен зертханалық жұмыстар)',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-9': [
        {
          id: 'phys-7-9',
          title: { kk: 'Механика: қозғалыс, күш және энергия', ru: 'Механика: движение, силы и энергия' },
          profileFocus: 'all',
          topics: [
            {
              id: 'phys-velocity',
              title: { kk: 'Бірқалыпты қозғалыс жылдамдығы және Ньютон заңдары', ru: 'Скорость движения, плотность и законы Ньютона' },
              learningObjective: {
                kk: 'v = s / t және F = m · a формулаларын ХБЖ бірліктерінде есептер шығаруға қолдану',
                ru: 'Применять формулы v = s / t, ρ = m / V и F = m · a с переводом величин в СИ',
              },
              expectedResult: {
                kk: 'Физикалық шамаларды ХБЖ-ға келтіріп, формула арқылы есептейді',
                ru: 'Переводит единицы измерения в СИ и решает расчётные задачи',
              },
              difficulty: 'medium',
              exerciseTypes: ['calculation', 'mcq', 'short_answer'],
              prerequisites: { kk: 'Жаратылыстану (5–6)', ru: 'Естествознание (5–6)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
      '10-11': [
        {
          id: 'phys-10-11',
          title: { kk: 'Молекулалық физика және электродинамика', ru: 'Молекулярная физика и электродинамика' },
          profileFocus: 'physmath',
          topics: [
            {
              id: 'phys-ohm',
              title: { kk: 'Тұрақты ток заңдары және Ом заңы', ru: 'Закон Ома для участка и полной цепи' },
              learningObjective: {
                kk: 'Толық тізбек үшін Ом заңын және өткізгіштерді тізбектей/параллель жалғауды есептеу',
                ru: 'Рассчитывать силу тока, напряжение и эквивалентное сопротивление в смешанных цепях',
              },
              expectedResult: {
                kk: 'Электр тізбегінің сұлбасын талдап, қуат пен ток күшін табады',
                ru: 'Анализирует схемы и вычисляет параметры электрической цепи',
              },
              difficulty: 'advanced',
              exerciseTypes: ['calculation', 'mcq'],
              prerequisites: { kk: 'Электр құбылыстары (8-сынып)', ru: 'Электрические явления (8 класс)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'chemistry',
    name: { kk: 'Химия', ru: 'Химия' },
    iconKey: 'chemistry',
    minGrade: 7,
    maxGrade: 11,
    weeklyHoursGuide: {
      general: '2 сағат/апта · 2 ч/нед',
      physmath: 'Стехиометрия және органикалық синтез есептері',
    },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-11': [
        {
          id: 'chem-base',
          title: { kk: 'Атом құрылысы, периодтық жүйе және химиялық реакциялар', ru: 'Строение атома, периодическая система и реакции' },
          profileFocus: 'all',
          topics: [
            {
              id: 'chem-periodic',
              title: { kk: 'Менделеевтің периодтық жүйесі және химиялық байланыс', ru: 'Периодический закон и типы химической связи' },
              learningObjective: {
                kk: 'Элементтің периодтық жүйедегі орны бойынша атом құрылысын және байланыс түрін анықтау',
                ru: 'Определять число протонов/электронов по порядковому номеру и тип химической связи (ионная, ковалентная)',
              },
              expectedResult: {
                kk: 'Зат формуласы бойынша байланыс түрін және валенттілікті табады',
                ru: 'Определяет тип связи и составляет уравнения простых реакций',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'matching', 'calculation'],
              prerequisites: { kk: 'Заттар және қоспалар (7-сынып)', ru: 'Вещества и смеси (7 класс)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'biology',
    name: { kk: 'Биология', ru: 'Биология' },
    iconKey: 'biology',
    minGrade: 7,
    maxGrade: 11,
    weeklyHoursGuide: { general: '2 сағат/апта · 2 ч/нед' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-11': [
        {
          id: 'bio-cell',
          title: { kk: 'Жасушалық биология, зат алмасу және генетика', ru: 'Клеточная биология, обмен веществ и генетика' },
          profileFocus: 'all',
          topics: [
            {
              id: 'bio-photosynthesis',
              title: { kk: 'Жасуша органоидтары және фотосинтез', ru: 'Строение клетки и процесс фотосинтеза' },
              learningObjective: {
                kk: 'Өсімдік пен жануар жасушаларының айырмашылығын және хлоропласт қызметін түсіндіру',
                ru: 'Сравнивать органоиды растительной и животной клетки, объяснять этапы фотосинтеза',
              },
              expectedResult: {
                kk: 'Жасуша құрылымдары мен олардың қызметін сәйкестендіреді',
                ru: 'Соотносит органоиды с их функциями',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'matching', 'short_answer'],
              prerequisites: { kk: 'Жаратылыстану (5–6)', ru: 'Естествознание (5–6)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'geography',
    name: { kk: 'География', ru: 'География' },
    iconKey: 'geography',
    minGrade: 7,
    maxGrade: 11,
    weeklyHoursGuide: { general: '2 сағат/апта · 2 ч/нед' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '7-11': [
        {
          id: 'geo-kz',
          title: { kk: 'Литосфера, климат және Қазақстанның экономикалық географиясы', ru: 'Литосфера, климат и география Казахстана' },
          profileFocus: 'all',
          topics: [
            {
              id: 'geo-climate-kz',
              title: { kk: 'Қазақстанның табиғат зоналары мен климаттық белдеулері', ru: 'Природные зоны и резко континентальный климат Казахстана' },
              learningObjective: {
                kk: 'Қазақстан аумағындағы табиғат зоналарының таралу заңдылықтарын карта бойынша талдау',
                ru: 'Объяснять факторы формирования климата и размещение природных зон Казахстана',
              },
              expectedResult: {
                kk: 'Табиғат зоналарын орналасу ретімен (солтүстіктен оңтүстікке) анықтайды',
                ru: 'Определяет последовательность природных зон с севера на юг и их ресурсы',
              },
              difficulty: 'medium',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Карта және масштаб', ru: 'План и географическая карта' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'VERIFIED',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'music',
    name: { kk: 'Музыка', ru: 'Музыка' },
    iconKey: 'music',
    minGrade: 1,
    maxGrade: 7,
    weeklyHoursGuide: { general: '1 сағат/апта · 1 ч/нед (1–7 сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-7': [
        {
          id: 'music-kz',
          title: { kk: 'Қазақтың дәстүрлі күй өнері және музыкалық сауат', ru: 'Традиционное казахское искусство кюя и музыкальная грамота' },
          profileFocus: 'all',
          topics: [
            {
              id: 'music-instruments',
              title: { kk: 'Қазақтың ұлттық аспаптары (домбыра, қобыз, жетіген)', ru: 'Казахские народные инструменты и жанр кюя' },
              learningObjective: {
                kk: 'Ұлттық аспаптардың дыбыс ерекшеліктері мен шертпе, төкпе күй дәстүрлерін ажырату',
                ru: 'Различать тембры казахских народных инструментов и особенности домбровых кюев',
              },
              expectedResult: {
                kk: 'Күй өнерінің негізгі өкілдері мен аспаптарды атайды',
                ru: 'Называет традиционные инструменты и известных кюйши',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Тыңдау мәдениеті', ru: 'Начальное музыкальное восприятие' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'NEEDS_REVIEW',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'art_craft',
    name: { kk: 'Көркем еңбек', ru: 'Художественный труд' },
    iconKey: 'art_craft',
    minGrade: 1,
    maxGrade: 7,
    weeklyHoursGuide: { general: '1 сағат/апта · 1 ч/нед (1–7 сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '1-7': [
        {
          id: 'craft-ornament',
          title: { kk: 'Сәндік-қолданбалы өнер және дизайн негіздері', ru: 'Декоративно-прикладное искусство и основы дизайна' },
          profileFocus: 'all',
          topics: [
            {
              id: 'craft-patterns',
              title: { kk: 'Қазақтың ою-өрнек композициясы және түстану', ru: 'Симметрия и цветоведение в казахском орнаменте' },
              learningObjective: {
                kk: 'Жылы және суық түстер үйлесімін, ою-өрнек элементтерінің симметриясын жобалауда қолдану',
                ru: 'Применять законы цветоведения и симметрии при создании декоративной композиции',
              },
              expectedResult: {
                kk: 'Түс шеңбері мен ою түрлерін ажыратады',
                ru: 'Различает тёплые и холодные оттенки и виды орнамента',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'matching'],
              prerequisites: { kk: 'Негізгі геометриялық пішіндер', ru: 'Простые геометрические формы' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'NEEDS_REVIEW',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'nvtp',
    name: {
      kk: 'Алғашқы әскери және технологиялық дайындық (АӘД)',
      ru: 'Начальная военная и технологическая подготовка (НВТП)',
    },
    iconKey: 'nvtp',
    minGrade: 10,
    maxGrade: 11,
    weeklyHoursGuide: { general: '1 сағат/апта · 1 ч/нед (10–11 сынып)' },
    officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
    sectionsByGradeRange: {
      '10-11': [
        {
          id: 'nvtp-10-11',
          title: { kk: 'Азаматтық қорғаныс, қауіпсіздік және робототехника негіздері', ru: 'Гражданская защита, безопасность и технологическая подготовка' },
          profileFocus: 'all',
          topics: [
            {
              id: 'nvtp-safety',
              title: { kk: 'Төтенше жағдайлардағы әрекеттер және алғашқы көмек', ru: 'Действия при чрезвычайных ситуациях и основы первой помощи' },
              learningObjective: {
                kk: 'Төтенше жағдайлар кезінде қауіпсіздік ережелерін сақтау және алғашқы медициналық көмек көрсету негіздерін меңгеру',
                ru: 'Знать алгоритмы безопасного поведения при ЧС и базовые приёмы первой помощи',
              },
              expectedResult: {
                kk: 'Қауіпсіздік алгоритмін дұрыс ретімен анықтайды',
                ru: 'Определяет порядок действий при оказании первой помощи',
              },
              difficulty: 'basic',
              exerciseTypes: ['mcq', 'logic'],
              prerequisites: { kk: 'Биология (анатомия негіздері)', ru: 'Биология (основы анатомии)' },
              officialSource: 'https://adilet.zan.kz/rus/docs/V2200029767',
              status: 'NEEDS_REVIEW',
            },
          ],
        },
      ],
    },
  },
];

export function getSubjectsForGrade(grade: number): SubjectDefinition[] {
  return SUBJECT_CATALOG.filter((subj) => {
    if (subj.onlyGrades && subj.onlyGrades.length > 0) {
      return subj.onlyGrades.includes(grade);
    }
    return grade >= subj.minGrade && grade <= subj.maxGrade;
  });
}

export function getSectionsForGradeAndProfile(
  subject: SubjectDefinition,
  grade: number,
  profile: StudyProfile
): CurriculumSection[] {
  const keys = Object.keys(subject.sectionsByGradeRange);
  const matched: CurriculumSection[] = [];

  for (const key of keys) {
    if (key.includes('-')) {
      const [minStr, maxStr] = key.split('-');
      const minG = Number(minStr);
      const maxG = Number(maxStr);
      if (grade >= minG && grade <= maxG) {
        matched.push(...subject.sectionsByGradeRange[key]);
      }
    } else if (Number(key) === grade) {
      matched.push(...subject.sectionsByGradeRange[key]);
    }
  }

  // Never hide core subjects based on profile; prioritize matching profile sections first
  return matched.sort((a, b) => {
    const aMatch = a.profileFocus === profile ? 0 : 1;
    const bMatch = b.profileFocus === profile ? 0 : 1;
    return aMatch - bMatch;
  });
}

export function getSubjectById(subjectId: string): SubjectDefinition | undefined {
  return SUBJECT_CATALOG.find((s) => s.id === subjectId);
}

export function getSubjectName(subjectId: string, lang: Lang): string {
  const subj = getSubjectById(subjectId);
  return subj ? subj.name[lang] : subjectId;
}

export interface SchoolStageInfo {
  id: '1-4' | '5-6' | '7' | '8-9' | '10-11';
  label: { kk: string; ru: string };
  note: { kk: string; ru: string };
  allowsProfileChoice: boolean;
}

export function getSchoolStageInfo(grade: number): SchoolStageInfo {
  if (grade <= 4) {
    return {
      id: '1-4',
      label: {
        kk: '1–4 сыныптар · Бастауыш мектеп',
        ru: '1–4 классы · Начальная школа',
      },
      note: {
        kk: 'Қалыпты жалпы бағдарлама (1-сыныпта Әліппе, Математика, Дүниетану, Жаратылыстану)',
        ru: 'Обычная общая программа (в 1 классе Әліппе, Математика, Познание мира, Естествознание)',
      },
      allowsProfileChoice: false,
    };
  }
  if (grade <= 6) {
    return {
      id: '5-6',
      label: {
        kk: '5–6 сыныптар · Негізгі мектеп',
        ru: '5–6 классы · Основная школа',
      },
      note: {
        kk: 'Қалыпты жалпы бағдарлама (Математика, Жаратылыстану, Информатика, Тарих)',
        ru: 'Обычная общая программа (Математика, Естествознание, Информатика, История)',
      },
      allowsProfileChoice: false,
    };
  }
  if (grade === 7) {
    return {
      id: '7',
      label: {
        kk: '7-сынып · Негізгі мектеп',
        ru: '7 класс · Основная школа',
      },
      note: {
        kk: 'Қалыпты жалпы бағдарлама (Алгебра, Геометрия, Физика, Химия, Биология, География басталады)',
        ru: 'Обычная общая программа (добавляются Алгебра, Геометрия, Физика, Химия, Биология, География)',
      },
      allowsProfileChoice: false,
    };
  }
  if (grade <= 9) {
    return {
      id: '8-9',
      label: {
        kk: '8–9 сыныптар · Негізгі мектеп',
        ru: '8–9 классы · Основная школа',
      },
      note: {
        kk: 'Қалыпты жалпы бағдарлама (негізгі ғылымдар, 9-сыныпта Құқық негіздері қосылады)',
        ru: 'Обычная общая программа (фундаментальные науки, в 9 классе добавляются Основы права)',
      },
      allowsProfileChoice: false,
    };
  }
  return {
    id: '10-11',
    label: {
      kk: '10–11 сыныптар · Жоғары мектеп',
      ru: '10–11 классы · Старшая школа',
    },
    note: {
      kk: 'Тек 10–11 сыныптарда бағытты таңдау бар: қалыпты, гуманитарлық немесе физика-математикалық',
      ru: 'Только в 10–11 классах выбирается направление: обычное, гуманитарное или физико-математическое',
    },
    allowsProfileChoice: true,
  };
}

