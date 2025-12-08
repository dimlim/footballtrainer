// @ts-nocheck
// Explosiveness Training Program - 30 days
// Original program from the app

import { TrainingProgram, TrainingDay, Section, Intensity, Location } from '@/types/training';

export const explosivenessProgram: TrainingProgram = {
  id: 'explosiveness-30',
  title: {
    uk: 'Вибуховість 30 днів',
    en: '30-Day Explosiveness',
    cs: '30denní Výbušnost'
  },
  description: {
    uk: 'Інтенсивна програма для розвитку вибухової сили, швидкості старту та спринтерських якостей',
    en: 'Intensive program for developing explosive power, starting speed and sprinting abilities',
    cs: 'Intenzivní program pro rozvoj výbušné síly, startovní rychlosti a sprintérských schopností'
  },
  category: 'explosiveness',
  difficulty: 'intermediate',
  durationDays: 30,
  icon: '⚡',
  color: 'amber',
  isPublic: true,
  days: []
};

// Import existing training days from the original file
// We'll re-export them here with the program structure

// Day 1
const day1: TrainingDay = {
  id: 'exp-day-1',
  dayNumber: 1,
  title: {
    uk: 'Легке відновлення + Тести',
    en: 'Light Recovery + Tests',
    cs: 'Lehké zotavení + Testy'
  },
  intensity: 'low',
  location: 'home',
  durationMinutes: 45,
  focus: {
    uk: "Оцінка рівня, активація м'язів",
    en: 'Level assessment, muscle activation',
    cs: 'Hodnocení úrovně, aktivace svalů'
  },
  sections: [
    {
      id: 'exp-d1-s1',
      title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
      durationMinutes: 10,
      exercises: [
        {
          id: 'exp-d1-e1',
          title: {
            uk: 'Ходьба з високим підніманням коліна',
            en: 'High knee walking',
            cs: 'Chůze s vysokým zvedáním kolen'
          },
          description: {
            uk: ['Коліно піднімай до рівня пояса', 'Руки працюють як при бігу', 'Перші 30 сек повільно, потім швидше'],
            en: ['Raise knee to waist level', 'Arms work as when running', 'First 30 sec slowly, then faster'],
            cs: ['Zvedni koleno do úrovně pasu', 'Paže pracují jako při běhu', 'Prvních 30 s pomalu, pak rychleji']
          },
          type: 'checkbox',
          timerDuration: 120,
          note: {
            uk: 'Спина пряма, дивись вперед',
            en: 'Keep back straight, look forward',
            cs: 'Záda rovná, dívej se dopředu'
          }
        },
        {
          id: 'exp-d1-e2',
          title: {
            uk: 'Обертання суглобів',
            en: 'Joint rotations',
            cs: 'Rotace kloubů'
          },
          description: {
            uk: ['Гомілкостоп: по 10 обертань кожною ногою', 'Коліна: 10 кіл вправо, 10 вліво', 'Таз: 10 обертань в кожну сторону', 'Плечі: 10 обертань назад, 10 вперед'],
            en: ['Ankles: 10 rotations each leg', 'Knees: 10 circles right, 10 left', 'Hips: 10 rotations each direction', 'Shoulders: 10 back, 10 forward'],
            cs: ['Kotníky: 10 rotací každou nohou', 'Kolena: 10 kruhů vpravo, 10 vlevo', 'Boky: 10 rotací každým směrem', 'Ramena: 10 vzad, 10 vpřed']
          },
          type: 'checkbox',
          timerDuration: 180
        },
        {
          id: 'exp-d1-e3',
          title: {
            uk: 'Динамічна розтяжка',
            en: 'Dynamic stretching',
            cs: 'Dynamické protahování'
          },
          description: {
            uk: ['Випади вперед з поворотом: 8 на кожну ногу', 'Махи ногою вперед-назад: 10 на кожну', 'Махи в сторону: 10 на кожну'],
            en: ['Forward lunges with twist: 8 each leg', 'Leg swings forward-back: 10 each', 'Side swings: 10 each'],
            cs: ['Výpady vpřed s rotací: 8 na každou nohu', 'Kyvadlové pohyby vpřed-vzad: 10 na každou', 'Kyvadlové do strany: 10 na každou']
          },
          type: 'checkbox',
          timerDuration: 300,
          note: {
            uk: 'Коліно не виходить за носок',
            en: 'Knee does not go past toe',
            cs: 'Koleno nepřesahuje špičku'
          }
        }
      ]
    },
    {
      id: 'exp-d1-s2',
      title: { uk: 'Тест балансу та координації', en: 'Balance & Coordination Test', cs: 'Test rovnováhy a koordinace' },
      durationMinutes: 15,
      exercises: [
        {
          id: 'exp-d1-e4',
          title: { uk: 'Баланс на правій нозі', en: 'Right leg balance', cs: 'Rovnováha na pravé noze' },
          description: {
            uk: ['Стань на праву ногу, ліву підігни', 'Руки в сторони або на поясі', 'Засікай час - скільки устоїш'],
            en: ['Stand on right leg, bend left', 'Arms to sides or on hips', 'Time how long you can hold'],
            cs: ['Stůj na pravé noze, levou pokrč', 'Paže do stran nebo v bok', 'Měř čas, jak dlouho vydržíš']
          },
          type: 'input',
          inputLabel: { uk: 'сек (кращий час)', en: 'sec (best time)', cs: 's (nejlepší čas)' },
          sets: { uk: '3 спроби', en: '3 attempts', cs: '3 pokusy' },
          restSeconds: 30,
          timerDuration: 60,
          note: { uk: 'Запиши кращий результат!', en: 'Record your best result!', cs: 'Zapiš svůj nejlepší výsledek!' }
        },
        {
          id: 'exp-d1-e5',
          title: { uk: 'Баланс на лівій нозі', en: 'Left leg balance', cs: 'Rovnováha na levé noze' },
          description: {
            uk: ['Те саме для лівої ноги'],
            en: ['Same for left leg'],
            cs: ['Totéž pro levou nohu']
          },
          type: 'input',
          inputLabel: { uk: 'сек (кращий час)', en: 'sec (best time)', cs: 's (nejlepší čas)' },
          sets: { uk: '3 спроби', en: '3 attempts', cs: '3 pokusy' },
          restSeconds: 30,
          timerDuration: 60
        },
        {
          id: 'exp-d1-e6',
          title: { uk: 'Присідання з контролем', en: 'Controlled squats', cs: 'Kontrolované dřepy' },
          description: {
            uk: ['Вниз: повільно рахуй 1-2-3-4', 'Вгору: швидко, вистрибуй', 'Руки вперед для балансу'],
            en: ['Down: slowly count 1-2-3-4', 'Up: quickly, jump', 'Arms forward for balance'],
            cs: ['Dolů: pomalu počítej 1-2-3-4', 'Nahoru: rychle, vyskoč', 'Paže dopředu pro rovnováhu']
          },
          type: 'checkbox',
          sets: { uk: '3x10', en: '3x10', cs: '3x10' },
          restSeconds: 60,
          note: { uk: 'Коліна не виходять за носки', en: 'Knees do not go past toes', cs: 'Kolena nepřesahují špičky' }
        },
        {
          id: 'exp-d1-e7',
          title: { uk: 'Годинник (координація стоп)', en: 'Clock (foot coordination)', cs: 'Hodiny (koordinace nohou)' },
          description: {
            uk: ['Стій на лівій нозі', "Правою ногою 'малюй' годинник:", '12 годин (вперед), 3 (вправо), 6 (назад), 9 (вліво)', 'Повтори 5 кіл, потім зміни ногу'],
            en: ['Stand on left leg', "Draw a clock with right foot:", '12 (forward), 3 (right), 6 (back), 9 (left)', 'Repeat 5 circles, then switch'],
            cs: ['Stůj na levé noze', 'Pravou nohou "kresli" hodiny:', '12 (vpřed), 3 (vpravo), 6 (vzad), 9 (vlevo)', 'Opakuj 5 kruhů, pak změň']
          },
          type: 'checkbox',
          timerDuration: 240,
          note: { uk: 'Коло робиш якомога більшим!', en: 'Make circles as big as possible!', cs: 'Dělej kruhy co největší!' }
        },
        {
          id: 'exp-d1-e8',
          title: { uk: 'Віджимання від підлоги', en: 'Push-ups', cs: 'Kliky' },
          description: {
            uk: ['Тіло пряме, лікті під 45°', 'Вниз до торкання грудьми', 'Вгору повністю випрямляй руки'],
            en: ['Body straight, elbows at 45°', 'Down until chest touches', 'Up fully extend arms'],
            cs: ['Tělo rovné, lokty pod 45°', 'Dolů dokud se hrudník nedotkne', 'Nahoru plně natáhni paže']
          },
          type: 'input',
          inputLabel: { uk: 'кількість разів', en: 'number of reps', cs: 'počet opakování' },
          note: { uk: 'Максимум з правильною технікою', en: 'Maximum with proper form', cs: 'Maximum se správnou technikou' }
        }
      ]
    },
    {
      id: 'exp-d1-s3',
      title: { uk: "М'яч + координація", en: 'Ball + Coordination', cs: 'Míč + Koordinace' },
      durationMinutes: 15,
      exercises: [
        {
          id: 'exp-d1-e9',
          title: { uk: 'Жонглювання (права нога)', en: 'Juggling (right foot)', cs: 'Žonglování (pravá noha)' },
          description: {
            uk: ['Підйом стопи (шнурки)', "М'яч не вище коліна", 'Рахуй вголос'],
            en: ['Instep (laces)', 'Ball not higher than knee', 'Count out loud'],
            cs: ['Nárt (tkaničky)', 'Míč ne výše než koleno', 'Počítej nahlas']
          },
          type: 'checkbox',
          reps: { uk: '20 торкань', en: '20 touches', cs: '20 doteků' },
          timerDuration: 120,
          note: { uk: 'Удар серединою підйому', en: 'Hit with middle of instep', cs: 'Úder středem nártu' }
        },
        {
          id: 'exp-d1-e10',
          title: { uk: 'Жонглювання (ліва нога)', en: 'Juggling (left foot)', cs: 'Žonglování (levá noha)' },
          description: {
            uk: ['Те саме лівою ногою'],
            en: ['Same with left foot'],
            cs: ['Totéž levou nohou']
          },
          type: 'checkbox',
          reps: { uk: '20 торкань', en: '20 touches', cs: '20 doteků' },
          timerDuration: 120
        },
        {
          id: 'exp-d1-e11',
          title: { uk: 'Жонглювання (чергування)', en: 'Juggling (alternating)', cs: 'Žonglování (střídání)' },
          description: {
            uk: ['Права-ліва-права-ліва', "Запиши максимальну серію без падіння м'яча!"],
            en: ['Right-left-right-left', 'Record max series without dropping!'],
            cs: ['Pravá-levá-pravá-levá', 'Zapiš max sérii bez pádu míče!']
          },
          type: 'input',
          inputLabel: { uk: 'макс. серія', en: 'max series', cs: 'max série' },
          reps: { uk: '30 торкань', en: '30 touches', cs: '30 doteků' }
        },
        {
          id: 'exp-d1-e12',
          title: { uk: 'Пас в стіну + контроль', en: 'Wall pass + control', cs: 'Přihrávka na zeď + kontrola' },
          description: {
            uk: ['Відстань 3-4 метри', 'Пас правою → Контроль лівою', 'Пас лівою → Контроль правою'],
            en: ['Distance 3-4 meters', 'Pass right → Control left', 'Pass left → Control right'],
            cs: ['Vzdálenost 3-4 metry', 'Přihrávka pravou → Kontrola levou', 'Přihrávka levou → Kontrola pravou']
          },
          type: 'checkbox',
          sets: { uk: '3x20', en: '3x20', cs: '3x20' },
          restSeconds: 30,
          timerDuration: 300,
          note: { uk: "М'яко приймай підошвою", en: 'Soft control with sole', cs: 'Měkká kontrola podrážkou' }
        },
        {
          id: 'exp-d1-e13',
          title: { uk: "Вісімка м'яча навколо ніг", en: 'Figure 8 around legs', cs: 'Osmička kolem nohou' },
          description: {
            uk: ['Ноги ширше плечей', "Котиш м'яч підошвою 'вісімкою'", '30 сек права, 30 сек ліва'],
            en: ['Legs wider than shoulders', 'Roll ball with sole in figure 8', '30 sec right, 30 sec left'],
            cs: ['Nohy šířeji než ramena', 'Kutálej míč podrážkou do osmičky', '30 s pravá, 30 s levá']
          },
          type: 'checkbox',
          timerDuration: 180,
          note: { uk: "М'яч не повинен відкотитися", en: 'Ball should not roll away', cs: 'Míč se nesmí odkutálet' }
        }
      ]
    },
    {
      id: 'exp-d1-s4',
      title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
      durationMinutes: 5,
      exercises: [
        {
          id: 'exp-d1-e14',
          title: { uk: 'Статична розтяжка', en: 'Static stretching', cs: 'Statické protahování' },
          description: {
            uk: ['Квадріцепс: 30 сек кожна нога', 'Задня поверхня: 30 сек', 'Литки: 30 сек', 'Сідниці: 30 сек'],
            en: ['Quadriceps: 30 sec each leg', 'Hamstrings: 30 sec', 'Calves: 30 sec', 'Glutes: 30 sec'],
            cs: ['Čtyřhlavý: 30 s každá noha', 'Zadní strana: 30 s', 'Lýtka: 30 s', 'Hýždě: 30 s']
          },
          type: 'checkbox',
          timerDuration: 240
        },
        {
          id: 'exp-d1-e15',
          title: { uk: 'Глибоке дихання', en: 'Deep breathing', cs: 'Hluboké dýchání' },
          description: {
            uk: ['Вдих носом (1-4)', 'Затримка (1-2)', 'Видих ротом (1-6)', '5 повторів'],
            en: ['Inhale through nose (1-4)', 'Hold (1-2)', 'Exhale through mouth (1-6)', '5 reps'],
            cs: ['Nádech nosem (1-4)', 'Výdrž (1-2)', 'Výdech ústy (1-6)', '5 opakování']
          },
          type: 'checkbox',
          timerDuration: 60
        }
      ]
    }
  ]
};

// Add day 1 to the program
explosivenessProgram.days.push(day1);

// Schedule pattern for generating remaining days
const schedulePattern = [
  { type: 'recovery', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Відновлення', titleEn: 'Recovery', titleCs: 'Zotavení', focusUk: 'Активне відновлення', focusEn: 'Active recovery', focusCs: 'Aktivní zotavení' },
  { type: 'pre-train', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Перед тренуванням', titleEn: 'Pre-training', titleCs: 'Před tréninkem', focusUk: 'Підготовка до вечірнього тренування', focusEn: 'Preparation for evening training', focusCs: 'Příprava na večerní trénink' },
  { type: 'intensive', location: 'field' as Location, intensity: 'high' as Intensity, titleUk: 'Інтенсив: Швидкість', titleEn: 'Intensive: Speed', titleCs: 'Intenzivní: Rychlost', focusUk: 'Швидкість та вибуховість', focusEn: 'Speed and explosiveness', focusCs: 'Rychlost a výbušnost' },
  { type: 'pre-train', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Перед тренуванням', titleEn: 'Pre-training', titleCs: 'Před tréninkem', focusUk: 'Підготовка до вечірнього тренування', focusEn: 'Preparation for evening training', focusCs: 'Příprava na večerní trénink' },
  { type: 'coordination', location: 'home' as Location, intensity: 'medium' as Intensity, titleUk: 'Координація', titleEn: 'Coordination', titleCs: 'Koordinace', focusUk: 'Координація та баланс', focusEn: 'Coordination and balance', focusCs: 'Koordinace a rovnováha' },
  { type: 'intensive', location: 'field' as Location, intensity: 'high' as Intensity, titleUk: 'Інтенсив або Гра', titleEn: 'Intensive or Game', titleCs: 'Intenzivní nebo Hra', focusUk: 'Матч або інтенсивне тренування', focusEn: 'Match or intensive training', focusCs: 'Zápas nebo intenzivní trénink' },
  { type: 'rest', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Відпочинок', titleEn: 'Rest Day', titleCs: 'Odpočinek', focusUk: 'Повний відпочинок', focusEn: 'Full rest', focusCs: 'Plný odpočinek' },
];

// Helper to create basic exercises for generated days
const createBasicExercises = (dayNum: number, type: string): Section[] => {
  if (type === 'rest') {
    return [{
      id: `exp-d${dayNum}-s1`,
      title: { uk: 'Відпочинок', en: 'Rest', cs: 'Odpočinek' },
      exercises: [{
        id: `exp-d${dayNum}-e1`,
        title: { uk: 'День відпочинку', en: 'Rest day', cs: 'Den odpočinku' },
        description: {
          uk: ['Повний відпочинок від фізичних навантажень', 'Можна легку прогулянку', 'Достатньо сну та правильне харчування'],
          en: ['Full rest from physical activity', 'Light walk is ok', 'Enough sleep and proper nutrition'],
          cs: ['Plný odpočinek od fyzické aktivity', 'Lehká procházka je ok', 'Dostatek spánku a správná výživa']
        },
        type: 'checkbox'
      }]
    }];
  }

  return [
    {
      id: `exp-d${dayNum}-s1`,
      title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
      durationMinutes: 10,
      exercises: [
        {
          id: `exp-d${dayNum}-e1`,
          title: { uk: 'Легкий біг / ходьба', en: 'Light jog / walk', cs: 'Lehký běh / chůze' },
          description: {
            uk: ['3-5 хвилин легкого бігу або швидкої ходьби'],
            en: ['3-5 minutes of light jogging or brisk walking'],
            cs: ['3-5 minut lehkého běhu nebo rychlé chůze']
          },
          type: 'checkbox',
          timerDuration: 240
        },
        {
          id: `exp-d${dayNum}-e2`,
          title: { uk: 'Обертання суглобів', en: 'Joint rotations', cs: 'Rotace kloubů' },
          description: {
            uk: ['Повний комплекс обертань всіх суглобів'],
            en: ['Full rotation complex for all joints'],
            cs: ['Kompletní rotace všech kloubů']
          },
          type: 'checkbox',
          timerDuration: 180
        }
      ]
    },
    {
      id: `exp-d${dayNum}-s2`,
      title: { uk: 'Основна частина', en: 'Main part', cs: 'Hlavní část' },
      durationMinutes: 25,
      exercises: [
        {
          id: `exp-d${dayNum}-e3`,
          title: { uk: 'Вправа 1', en: 'Exercise 1', cs: 'Cvik 1' },
          description: {
            uk: ['Детальний опис буде додано'],
            en: ['Detailed description will be added'],
            cs: ['Podrobný popis bude přidán']
          },
          type: 'checkbox',
          sets: { uk: '3x10', en: '3x10', cs: '3x10' }
        }
      ]
    },
    {
      id: `exp-d${dayNum}-s3`,
      title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
      durationMinutes: 5,
      exercises: [
        {
          id: `exp-d${dayNum}-e4`,
          title: { uk: 'Статична розтяжка', en: 'Static stretching', cs: 'Statické protahování' },
          description: {
            uk: ['Розтяжка всіх основних груп м\'язів по 30 секунд'],
            en: ['Stretch all major muscle groups for 30 seconds each'],
            cs: ['Protahování všech hlavních svalových skupin po 30 sekundách']
          },
          type: 'checkbox',
          timerDuration: 240
        }
      ]
    }
  ];
};

// Generate days 2-30
for (let i = 2; i <= 30; i++) {
  const patternIndex = (i - 1) % 7;
  const template = schedulePattern[patternIndex];
  
  explosivenessProgram.days.push({
    id: `exp-day-${i}`,
    dayNumber: i,
    title: {
      uk: template.titleUk,
      en: template.titleEn,
      cs: template.titleCs
    },
    intensity: template.intensity,
    location: template.location,
    durationMinutes: template.intensity === 'high' ? 55 : template.type === 'rest' ? 0 : 40,
    focus: {
      uk: template.focusUk,
      en: template.focusEn,
      cs: template.focusCs
    },
    sections: createBasicExercises(i, template.type)
  });
}

export default explosivenessProgram;

