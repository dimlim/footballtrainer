// Training Program Data
// Based on original 30-day football training plan

export type Intensity = 'low' | 'medium' | 'high';
export type Location = 'home' | 'field' | 'gym';
export type ExerciseType = 'checkbox' | 'input' | 'timer';

export interface LocalizedText {
  uk: string;
  en: string;
  cs: string;
}

export interface LocalizedArray {
  uk: string[];
  en: string[];
  cs: string[];
}

export interface Exercise {
  id: string;
  title: LocalizedText;
  description?: LocalizedArray;
  sets?: LocalizedText;
  reps?: LocalizedText;
  restSeconds?: number;
  type: ExerciseType;
  inputLabel?: LocalizedText;
  note?: LocalizedText;
  timerDuration?: number;
}

export interface Section {
  id: string;
  title: LocalizedText;
  durationMinutes?: number;
  exercises: Exercise[];
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  title: LocalizedText;
  intensity: Intensity;
  location: Location;
  durationMinutes: number;
  focus: LocalizedText;
  sections: Section[];
}

// Full 30-day training program
export const trainingProgram: TrainingDay[] = [
  // ============================================
  // DAY 1: Light Recovery + Tests
  // ============================================
  {
    id: 'day-1',
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
        id: 'd1-s1',
        title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
        durationMinutes: 10,
        exercises: [
          {
            id: 'd1-e1',
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
            id: 'd1-e2',
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
            id: 'd1-e3',
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
        id: 'd1-s2',
        title: { uk: 'Тест балансу та координації', en: 'Balance & Coordination Test', cs: 'Test rovnováhy a koordinace' },
        durationMinutes: 15,
        exercises: [
          {
            id: 'd1-e4',
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
            id: 'd1-e5',
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
            id: 'd1-e6',
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
            id: 'd1-e7',
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
            id: 'd1-e8',
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
        id: 'd1-s3',
        title: { uk: "М'яч + координація", en: 'Ball + Coordination', cs: 'Míč + Koordinace' },
        durationMinutes: 15,
        exercises: [
          {
            id: 'd1-e9',
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
            id: 'd1-e10',
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
            id: 'd1-e11',
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
            id: 'd1-e12',
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
            id: 'd1-e13',
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
        id: 'd1-s4',
        title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
        durationMinutes: 5,
        exercises: [
          {
            id: 'd1-e14',
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
            id: 'd1-e15',
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
  },

  // ============================================
  // DAY 2: Light Technique (Morning)
  // ============================================
  {
    id: 'day-2',
    dayNumber: 2,
    title: {
      uk: 'Легка техніка (Ранок)',
      en: 'Light Technique (Morning)',
      cs: 'Lehká technika (Ráno)'
    },
    intensity: 'low',
    location: 'home',
    durationMinutes: 45,
    focus: {
      uk: "Активація м'язів перед вечірнім тренуванням",
      en: 'Muscle activation before evening training',
      cs: 'Aktivace svalů před večerním tréninkem'
    },
    sections: [
      {
        id: 'd2-s1',
        title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
        durationMinutes: 8,
        exercises: [
          {
            id: 'd2-e1',
            title: { uk: 'Легкий біг на місці', en: 'Light jogging in place', cs: 'Lehký běh na místě' },
            description: {
              uk: ['1 хв: повільно', '2 хв: середній темп', '3 хв: чергуй 20 сек швидко / 10 сек повільно'],
              en: ['1 min: slow', '2 min: medium pace', '3 min: alternate 20 sec fast / 10 sec slow'],
              cs: ['1 min: pomalu', '2 min: střední tempo', '3 min: střídej 20 s rychle / 10 s pomalu']
            },
            type: 'checkbox',
            timerDuration: 180
          },
          {
            id: 'd2-e2',
            title: { uk: 'Обертання суглобів', en: 'Joint rotations', cs: 'Rotace kloubů' },
            description: {
              uk: ['Повний комплекс обертань (як у День 1)'],
              en: ['Full rotation complex (as in Day 1)'],
              cs: ['Kompletní rotace (jako v Den 1)']
            },
            type: 'checkbox',
            timerDuration: 300
          }
        ]
      },
      {
        id: 'd2-s2',
        title: { uk: 'Швидкість роботи ніг', en: 'Foot speed', cs: 'Rychlost nohou' },
        durationMinutes: 12,
        exercises: [
          {
            id: 'd2-e3',
            title: { uk: 'Швидкі ноги на місці', en: 'Quick feet in place', cs: 'Rychlé nohy na místě' },
            description: {
              uk: ['Переступай ногами якнайшвидше', 'Стопи підіймай тільки 2-3 см', 'Корпус трохи нахилений вперед'],
              en: ['Step as fast as possible', 'Lift feet only 2-3 cm', 'Body slightly leaning forward'],
              cs: ['Přešlapuj co nejrychleji', 'Zvedej nohy jen 2-3 cm', 'Tělo mírně nakloněné vpřed']
            },
            type: 'checkbox',
            sets: { uk: '6x10с', en: '6x10s', cs: '6x10s' },
            restSeconds: 30,
            timerDuration: 60,
            note: { uk: 'Уяви, що стоїш на гарячій підлозі', en: 'Imagine standing on hot floor', cs: 'Představ si, že stojíš na horké podlaze' }
          },
          {
            id: 'd2-e4',
            title: { uk: 'Уявна драбинка', en: 'Imaginary ladder', cs: 'Imaginární žebřík' },
            description: {
              uk: ['Прохід 1: Дві ноги в кожен квадрат', 'Прохід 2: Одна нога в квадрат', 'Прохід 3: Дві всередину, дві назовні', 'Прохід 4-5: Бічні кроки'],
              en: ['Pass 1: Two feet in each square', 'Pass 2: One foot per square', 'Pass 3: Two in, two out', 'Pass 4-5: Side steps'],
              cs: ['Průchod 1: Obě nohy do každého čtverce', 'Průchod 2: Jedna noha na čtverec', 'Průchod 3: Dvě dovnitř, dvě ven', 'Průchod 4-5: Boční kroky']
            },
            type: 'checkbox',
            sets: { uk: '5 проходів', en: '5 passes', cs: '5 průchodů' },
            restSeconds: 45,
            timerDuration: 300
          },
          {
            id: 'd2-e5',
            title: { uk: 'Скакалка без скакалки', en: 'Jump rope without rope', cs: 'Švihadlo bez švihadla' },
            description: {
              uk: ['Уяви, що крутиш скакалку', 'Стрибки на носках, легкі, пружинисті'],
              en: ['Imagine spinning a rope', 'Jump on toes, light, bouncy'],
              cs: ['Představ si, že točíš švihadlem', 'Skoky na špičkách, lehké, pružné']
            },
            type: 'checkbox',
            sets: { uk: '4x30с', en: '4x30s', cs: '4x30s' },
            restSeconds: 30,
            timerDuration: 120
          }
        ]
      },
      {
        id: 'd2-s3',
        title: { uk: 'Координація + баланс', en: 'Coordination + Balance', cs: 'Koordinace + Rovnováha' },
        durationMinutes: 10,
        exercises: [
          {
            id: 'd2-e6',
            title: { uk: 'Фламінго з нахилами', en: 'Flamingo with leans', cs: 'Plameňák s úklony' },
            description: {
              uk: ['Стань на одну ногу, інша зігнута назад', "Зроби 8 повільних нахилів корпусом вперед (як птах п'є воду)", 'Намагайся торкнутися підлоги пальцями'],
              en: ['Stand on one leg, other bent back', 'Make 8 slow forward leans (like bird drinking)', 'Try to touch floor with fingers'],
              cs: ['Stůj na jedné noze, druhá pokrčená vzad', 'Udělej 8 pomalých předklonů (jako pták pije)', 'Zkus se dotknout podlahy prsty']
            },
            type: 'checkbox',
            sets: { uk: '3 підходи', en: '3 sets', cs: '3 sady' },
            restSeconds: 45,
            timerDuration: 180,
            note: { uk: 'Дивись в одну точку на підлозі', en: 'Look at one point on floor', cs: 'Dívej se na jeden bod na podlaze' }
          },
          {
            id: 'd2-e7',
            title: { uk: 'Хрест (координація кроків)', en: 'Cross (step coordination)', cs: 'Kříž (koordinace kroků)' },
            description: {
              uk: ['Стоїш в центрі', 'ШВИДКИЙ крок вперед -> назад в центр', 'ШВИДКИЙ крок назад -> в центр', 'ШВИДКИЙ крок вправо -> в центр', 'ШВИДКИЙ крок вліво -> в центр'],
              en: ['Stand in center', 'FAST step forward -> back to center', 'FAST step back -> to center', 'FAST step right -> to center', 'FAST step left -> to center'],
              cs: ['Stůj uprostřed', 'RYCHLÝ krok vpřed -> zpět do středu', 'RYCHLÝ krok vzad -> do středu', 'RYCHLÝ krok vpravo -> do středu', 'RYCHLÝ krok vlevo -> do středu']
            },
            type: 'checkbox',
            sets: { uk: '4 проходи', en: '4 passes', cs: '4 průchody' },
            restSeconds: 60,
            timerDuration: 240
          },
          {
            id: 'd2-e8',
            title: { uk: 'Присідання на одній нозі (з підтримкою)', en: 'Single leg squat (with support)', cs: 'Dřep na jedné noze (s oporou)' },
            description: {
              uk: ['Тримайся руками за стілець', 'Одна нога витягнута вперед', 'Присідаєш на другій максимально низько', 'Повільно вниз (3с), швидко вгору (1с)'],
              en: ['Hold onto chair', 'One leg extended forward', 'Squat on other as low as possible', 'Slow down (3s), fast up (1s)'],
              cs: ['Drž se židle', 'Jedna noha natažená vpřed', 'Dřep na druhé co nejníže', 'Pomalu dolů (3s), rychle nahoru (1s)']
            },
            type: 'checkbox',
            sets: { uk: '3x5/нога', en: '3x5/leg', cs: '3x5/noha' },
            restSeconds: 90,
            timerDuration: 180
          }
        ]
      },
      {
        id: 'd2-s4',
        title: { uk: 'Вибухова сила (легка версія)', en: 'Explosive power (light)', cs: 'Výbušná síla (lehká)' },
        durationMinutes: 10,
        exercises: [
          {
            id: 'd2-e9',
            title: { uk: 'Присідання з вистрибуванням', en: 'Jump squats', cs: 'Dřepy s výskokem' },
            description: {
              uk: ['Присів до паралелі', 'ВИБУХОВО вистрибуєш вгору', "Руки махають вгору, м'яко приземляєшся"],
              en: ['Squat to parallel', 'EXPLODE up', 'Arms swing up, land softly'],
              cs: ['Dřep do rovnoběžky', 'VÝBUŠNĚ vyskoč', 'Paže máchnou nahoru, měkké přistání']
            },
            type: 'checkbox',
            sets: { uk: '3x6', en: '3x6', cs: '3x6' },
            restSeconds: 90,
            timerDuration: 180,
            note: { uk: "Уяви, що дістаєш м'яч з верхньої полиці", en: 'Imagine reaching ball from top shelf', cs: 'Představ si, že bereš míč z horní police' }
          },
          {
            id: 'd2-e10',
            title: { uk: 'Випади-кроки назад', en: 'Reverse lunge steps', cs: 'Výpady krokem vzad' },
            description: {
              uk: ['Крок назад -> опускаєшся в випад', 'Повертаєшся, потім інша нога', 'Чергуєш: права-ліва (всього 16 разів)'],
              en: ['Step back -> lower into lunge', 'Return, then other leg', 'Alternate: right-left (16 total)'],
              cs: ['Krok vzad -> spusť se do výpadu', 'Vrať se, pak druhá noha', 'Střídej: pravá-levá (celkem 16)']
            },
            type: 'checkbox',
            sets: { uk: '3x16', en: '3x16', cs: '3x16' },
            restSeconds: 60,
            timerDuration: 180
          }
        ]
      },
      {
        id: 'd2-s5',
        title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
        durationMinutes: 5,
        exercises: [
          {
            id: 'd2-e11',
            title: { uk: 'Легка ходьба + Розтяжка', en: 'Light walk + Stretching', cs: 'Lehká chůze + Protahování' },
            description: {
              uk: ['2 хв ходьба по кімнаті', "3 хв розтяжка основних м'язів"],
              en: ['2 min walking around room', '3 min stretching main muscles'],
              cs: ['2 min chůze po místnosti', '3 min protahování hlavních svalů']
            },
            type: 'checkbox',
            timerDuration: 300
          }
        ]
      }
    ]
  },

  // ============================================
  // DAY 3: Intensive - Explosive Speed
  // ============================================
  {
    id: 'day-3',
    dayNumber: 3,
    title: {
      uk: 'Інтенсив: Вибухова швидкість',
      en: 'Intensive: Explosive Speed',
      cs: 'Intenzivní: Výbušná rychlost'
    },
    intensity: 'high',
    location: 'field',
    durationMinutes: 55,
    focus: {
      uk: 'Максимум швидкості та вибуховості!',
      en: 'Maximum speed and explosiveness!',
      cs: 'Maximum rychlosti a výbušnosti!'
    },
    sections: [
      {
        id: 'd3-s1',
        title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
        durationMinutes: 12,
        exercises: [
          {
            id: 'd3-e1',
            title: { uk: 'Легкий біг', en: 'Light jog', cs: 'Lehký běh' },
            description: {
              uk: ['2 кола по полю', 'Перше коло дуже легко', 'Друге коло поступово прискорюєшся'],
              en: ['2 laps around field', 'First lap very easy', 'Second lap gradually accelerate'],
              cs: ['2 kola po hřišti', 'První kolo velmi lehce', 'Druhé kolo postupně zrychluj']
            },
            type: 'checkbox',
            timerDuration: 240
          },
          {
            id: 'd3-e2',
            title: { uk: 'Біг з завданнями', en: 'Running drills', cs: 'Běh s úkoly' },
            description: {
              uk: ['Захльост гомілки (15м)', 'Високе підіймання коліна (15м)', 'Бічні кроки правим боком (15м)', 'Бічні кроки лівим боком (15м)', 'Біг спиною вперед (15м)'],
              en: ['Butt kicks (15m)', 'High knees (15m)', 'Side steps right (15m)', 'Side steps left (15m)', 'Backpedal (15m)'],
              cs: ['Zakopávání (15m)', 'Vysoká kolena (15m)', 'Boční kroky vpravo (15m)', 'Boční kroky vlevo (15m)', 'Běh pozadu (15m)']
            },
            type: 'checkbox',
            timerDuration: 300
          },
          {
            id: 'd3-e3',
            title: { uk: 'Динамічні випади + махи', en: 'Dynamic lunges + swings', cs: 'Dynamické výpady + máchy' },
            description: {
              uk: ['10 випадів кожною ногою вперед', 'Махи ногою вперед-назад (10)', 'Махи в сторону (10)'],
              en: ['10 lunges each leg forward', 'Leg swings front-back (10)', 'Side swings (10)'],
              cs: ['10 výpadů každou nohou vpřed', 'Máchy nohou vpřed-vzad (10)', 'Máchy do strany (10)']
            },
            type: 'checkbox',
            timerDuration: 180
          }
        ]
      },
      {
        id: 'd3-s2',
        title: { uk: 'Стартова швидкість 0-10м', en: 'Starting speed 0-10m', cs: 'Startovní rychlost 0-10m' },
        durationMinutes: 12,
        exercises: [
          {
            id: 'd3-e4',
            title: { uk: 'Старт зі стійки', en: 'Standing start', cs: 'Start ze stoje' },
            description: {
              uk: ['Стоячи, одна нога попереду', "По команді 'СТАРТ!' - вибух вперед", 'Перші 3 кроки - МАКСИМАЛЬНО потужні!'],
              en: ['Standing, one foot forward', "On 'START!' - explode forward", 'First 3 steps - MAXIMUM power!'],
              cs: ['Stoj, jedna noha vpředu', "Na 'START!' - výbuch vpřed", 'První 3 kroky - MAXIMÁLNÍ síla!']
            },
            type: 'checkbox',
            sets: { uk: '2 рази', en: '2 times', cs: '2krát' },
            restSeconds: 90,
            timerDuration: 180,
            note: { uk: 'Корпус нахилений, не випрямляйся одразу', en: 'Body leaning, dont straighten immediately', cs: 'Tělo nakloněné, nevzpřimuj se hned' }
          },
          {
            id: 'd3-e5',
            title: { uk: 'Старт з присіду', en: 'Squat start', cs: 'Start z dřepu' },
            description: {
              uk: ['Сів у глибокий присід, руки між ніг', 'Вибух вгору і вперед'],
              en: ['Sit in deep squat, hands between legs', 'Explode up and forward'],
              cs: ['Sedni do hlubokého dřepu, ruce mezi nohy', 'Výbuch nahoru a vpřed']
            },
            type: 'checkbox',
            sets: { uk: '2 рази', en: '2 times', cs: '2krát' },
            restSeconds: 90,
            timerDuration: 180
          },
          {
            id: 'd3-e6',
            title: { uk: 'Старт лежачи на животі', en: 'Prone start', cs: 'Start vleže na břiše' },
            description: {
              uk: ['Ляж на живіт, руки біля грудей', 'Швидко встань і біжи'],
              en: ['Lie on stomach, hands by chest', 'Quickly get up and run'],
              cs: ['Lehni si na břicho, ruce u hrudníku', 'Rychle vstaň a běž']
            },
            type: 'checkbox',
            sets: { uk: '2 рази', en: '2 times', cs: '2krát' },
            restSeconds: 90,
            timerDuration: 180
          },
          {
            id: 'd3-e7',
            title: { uk: 'Стрибок в довжину з місця', en: 'Standing long jump', cs: 'Skok do dálky z místa' },
            description: {
              uk: ['Присів, руки назад', 'Вибух: махи руками вперед, стрибаєш максимально далеко', "М'яко приземляєшся"],
              en: ['Squat, arms back', 'Explode: swing arms forward, jump max distance', 'Land softly'],
              cs: ['Dřep, paže vzad', 'Výbuch: máchni pažemi vpřed, skoč co nejdále', 'Měkké přistání']
            },
            type: 'input',
            inputLabel: { uk: 'см (кращий)', en: 'cm (best)', cs: 'cm (nejlepší)' },
            sets: { uk: '6 спроб', en: '6 attempts', cs: '6 pokusů' },
            restSeconds: 120,
            timerDuration: 300,
            note: { uk: 'Кожна спроба - намагайся побити попередню!', en: 'Each try - beat the previous!', cs: 'Každý pokus - překonej předchozí!' }
          }
        ]
      },
      {
        id: 'd3-s3',
        title: { uk: 'Прискорення 10-25м', en: 'Acceleration 10-25m', cs: 'Zrychlení 10-25m' },
        durationMinutes: 15,
        exercises: [
          {
            id: 'd3-e8',
            title: { uk: 'Спринт 20 метрів (на час)', en: '20m sprint (timed)', cs: 'Sprint 20 metrů (na čas)' },
            description: {
              uk: ['Старт зі стійки', 'Біжиш НА МАКСИМУМ 20м', 'Не гальмуй різко після фінішу'],
              en: ['Standing start', 'Run MAXIMUM 20m', 'Dont brake sharply after finish'],
              cs: ['Start ze stoje', 'Běž MAXIMUM 20m', 'Nezastavuj prudce po cíli']
            },
            type: 'input',
            inputLabel: { uk: 'сек (кращий)', en: 'sec (best)', cs: 's (nejlepší)' },
            sets: { uk: '6 спроб', en: '6 attempts', cs: '6 pokusů' },
            restSeconds: 180,
            timerDuration: 600,
            note: { uk: 'ПОВНИЙ відпочинок 3 хв між спробами!', en: 'FULL rest 3 min between attempts!', cs: 'PLNÝ odpočinek 3 min mezi pokusy!' }
          },
          {
            id: 'd3-e9',
            title: { uk: 'Челнок 5м-10м-5м', en: 'Shuttle 5m-10m-5m', cs: 'Člunkový běh 5m-10m-5m' },
            description: {
              uk: ['Старт від 0 -> до 5м (торкнись)', 'Назад до 0 (торкнись)', 'До 10м (торкнись)', 'Назад до 0 (фініш)'],
              en: ['Start from 0 -> to 5m (touch)', 'Back to 0 (touch)', 'To 10m (touch)', 'Back to 0 (finish)'],
              cs: ['Start od 0 -> k 5m (dotkni se)', 'Zpět k 0 (dotkni se)', 'K 10m (dotkni se)', 'Zpět k 0 (cíl)']
            },
            type: 'checkbox',
            sets: { uk: '4 рази', en: '4 times', cs: '4krát' },
            restSeconds: 180,
            timerDuration: 400,
            note: { uk: 'Розворот на зовнішній нозі, вибуховий перший крок', en: 'Turn on outside foot, explosive first step', cs: 'Obrat na vnější noze, výbušný první krok' }
          }
        ]
      },
      {
        id: 'd3-s4',
        title: { uk: 'Зміна напрямку', en: 'Direction change', cs: 'Změna směru' },
        durationMinutes: 8,
        exercises: [
          {
            id: 'd3-e10',
            title: { uk: 'Зигзаги між конусами', en: 'Zigzag between cones', cs: 'Cikcak mezi kužely' },
            description: {
              uk: ['5 конусів через 3-4 метри', 'Біжиш змійкою', 'Останній конус -> спринт прямо 5м'],
              en: ['5 cones 3-4m apart', 'Run in snake pattern', 'Last cone -> sprint straight 5m'],
              cs: ['5 kuželů po 3-4 metrech', 'Běž hadovitě', 'Poslední kužel -> sprint rovně 5m']
            },
            type: 'checkbox',
            sets: { uk: '4 проходи', en: '4 passes', cs: '4 průchody' },
            restSeconds: 120,
            timerDuration: 300,
            note: { uk: 'На максимальній швидкості!', en: 'At maximum speed!', cs: 'Na maximální rychlost!' }
          }
        ]
      },
      {
        id: 'd3-s5',
        title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
        durationMinutes: 8,
        exercises: [
          {
            id: 'd3-e11',
            title: { uk: 'Легкий біг + Розтяжка', en: 'Light jog + Stretching', cs: 'Lehký běh + Protahování' },
            description: {
              uk: ['3 хв легкий біг', '2 хв ходьба з глибоким диханням', '3 хв розтяжка (квадріцепс, задня поверхня, литки)'],
              en: ['3 min light jog', '2 min walk with deep breathing', '3 min stretching (quads, hamstrings, calves)'],
              cs: ['3 min lehký běh', '2 min chůze s hlubokým dýcháním', '3 min protahování (čtyřhlavý, zadní strana, lýtka)']
            },
            type: 'checkbox',
            timerDuration: 480
          }
        ]
      }
    ]
  }
];

// Generate remaining days (4-30) based on schedule pattern
const schedulePattern = [
  { type: 'recovery', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Відновлення', titleEn: 'Recovery', titleCs: 'Zotavení', focusUk: 'Активне відновлення', focusEn: 'Active recovery', focusCs: 'Aktivní zotavení' },
  { type: 'pre-train', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Перед тренуванням', titleEn: 'Pre-training', titleCs: 'Před tréninkem', focusUk: 'Підготовка до вечірнього тренування', focusEn: 'Preparation for evening training', focusCs: 'Příprava na večerní trénink' },
  { type: 'intensive', location: 'field' as Location, intensity: 'high' as Intensity, titleUk: 'Інтенсив: Швидкість', titleEn: 'Intensive: Speed', titleCs: 'Intenzivní: Rychlost', focusUk: 'Швидкість та вибуховість', focusEn: 'Speed and explosiveness', focusCs: 'Rychlost a výbušnost' },
  { type: 'pre-train', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Перед тренуванням', titleEn: 'Pre-training', titleCs: 'Před tréninkem', focusUk: 'Підготовка до вечірнього тренування', focusEn: 'Preparation for evening training', focusCs: 'Příprava na večerní trénink' },
  { type: 'coordination', location: 'home' as Location, intensity: 'medium' as Intensity, titleUk: 'Координація', titleEn: 'Coordination', titleCs: 'Koordinace', focusUk: 'Координація та баланс', focusEn: 'Coordination and balance', focusCs: 'Koordinace a rovnováha' },
  { type: 'intensive', location: 'field' as Location, intensity: 'high' as Intensity, titleUk: 'Інтенсив або Гра', titleEn: 'Intensive or Game', titleCs: 'Intenzivní nebo Hra', focusUk: 'Матч або інтенсивне тренування', focusEn: 'Match or intensive training', focusCs: 'Zápas nebo intenzivní trénink' },
  { type: 'rest', location: 'home' as Location, intensity: 'low' as Intensity, titleUk: 'Відпочинок', titleEn: 'Rest Day', titleCs: 'Odpočinek', focusUk: 'Повний відпочинок', focusEn: 'Full rest', focusCs: 'Plný odpočinek' },
];

// Create basic exercises for generated days
const createBasicExercises = (dayNum: number, type: string): Section[] => {
  if (type === 'rest') {
    return [{
      id: `d${dayNum}-s1`,
      title: { uk: 'Відпочинок', en: 'Rest', cs: 'Odpočinek' },
      exercises: [{
        id: `d${dayNum}-e1`,
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
      id: `d${dayNum}-s1`,
      title: { uk: 'Розминка', en: 'Warmup', cs: 'Rozcvička' },
      durationMinutes: 10,
      exercises: [
        {
          id: `d${dayNum}-e1`,
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
          id: `d${dayNum}-e2`,
          title: { uk: 'Обертання суглобів', en: 'Joint rotations', cs: 'Rotace kloubů' },
          description: {
            uk: ['Повний комплекс обертань всіх суглобів'],
            en: ['Full rotation complex for all joints'],
            cs: ['Kompletní rotace všech kloubů']
          },
          type: 'checkbox',
          timerDuration: 180
        },
        {
          id: `d${dayNum}-e3`,
          title: { uk: 'Динамічна розтяжка', en: 'Dynamic stretching', cs: 'Dynamické protahování' },
          description: {
            uk: ['Випади, махи ногами, нахили'],
            en: ['Lunges, leg swings, bends'],
            cs: ['Výpady, máchy nohou, úklony']
          },
          type: 'checkbox',
          timerDuration: 180
        }
      ]
    },
    {
      id: `d${dayNum}-s2`,
      title: { uk: 'Основна частина', en: 'Main part', cs: 'Hlavní část' },
      durationMinutes: 25,
      exercises: [
        {
          id: `d${dayNum}-e4`,
          title: { uk: 'Вправа 1', en: 'Exercise 1', cs: 'Cvik 1' },
          description: {
            uk: ['Детальний опис буде додано'],
            en: ['Detailed description will be added'],
            cs: ['Podrobný popis bude přidán']
          },
          type: 'checkbox',
          sets: { uk: '3x10', en: '3x10', cs: '3x10' }
        },
        {
          id: `d${dayNum}-e5`,
          title: { uk: 'Вправа 2', en: 'Exercise 2', cs: 'Cvik 2' },
          description: {
            uk: ['Детальний опис буде додано'],
            en: ['Detailed description will be added'],
            cs: ['Podrobný popis bude přidán']
          },
          type: 'checkbox',
          sets: { uk: '3x10', en: '3x10', cs: '3x10' }
        },
        {
          id: `d${dayNum}-e6`,
          title: { uk: 'Вправа 3', en: 'Exercise 3', cs: 'Cvik 3' },
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
      id: `d${dayNum}-s3`,
      title: { uk: 'Заминка', en: 'Cooldown', cs: 'Zklidnění' },
      durationMinutes: 5,
      exercises: [
        {
          id: `d${dayNum}-e7`,
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

// Generate days 4-30
for (let i = 4; i <= 30; i++) {
  const patternIndex = (i - 1) % 7;
  const template = schedulePattern[patternIndex];
  
  trainingProgram.push({
    id: `day-${i}`,
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

// Helper to get training day by number
export const getTrainingDay = (dayNumber: number): TrainingDay | undefined => {
  return trainingProgram.find(d => d.dayNumber === dayNumber);
};

// Helper to get training day by id
export const getTrainingDayById = (id: string): TrainingDay | undefined => {
  return trainingProgram.find(d => d.id === id);
};

