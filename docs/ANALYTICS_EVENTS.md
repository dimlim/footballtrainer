# Analytics Events Documentation

## DataLayer Events for Google Tag Manager / GA4

Всі події пушаться в `window.dataLayer` у форматі:
```javascript
{
  event: 'event_name',
  ...eventParams,
  timestamp: '2024-01-01T12:00:00.000Z'
}
```

---

## 📱 User Events

### `user_registration`
**Коли:** При успішній реєстрації нового користувача
**Файл:** `src/stores/authStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `method` | string | Метод реєстрації: `email`, `google` |
| `user_role` | string | Роль: `player`, `coach`, `parent` |

---

### `user_login`
**Коли:** При успішному вході в акаунт
**Файл:** `src/stores/authStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `method` | string | Метод входу: `email`, `google` |

---

### `user_logout`
**Коли:** При виході з акаунту
**Файл:** `src/stores/authStore.ts`

*Без додаткових параметрів*

---

### `profile_update`
**Коли:** При оновленні профілю користувача
**Файл:** `src/stores/authStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `updated_fields` | string | Список оновлених полів через кому |

---

## 🏋️ Training Events

### `program_start`
**Коли:** При початку нової програми тренувань
**Файл:** `src/stores/playerProgramStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `program_id` | string | UUID програми |
| `program_name` | string | Назва програми |
| `program_category` | string | Категорія: `explosiveness`, `endurance`, etc. |

---

### `program_complete`
**Коли:** При завершенні всієї програми
**Файл:** `src/stores/playerProgramStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `program_id` | string | UUID програми |
| `program_name` | string | Назва програми |
| `days_completed` | number | Кількість завершених днів |

---

### `training_day_start`
**Коли:** При відкритті сторінки тренувального дня
**Файл:** `src/pages/ProgramDayPage.tsx`

| Параметр | Тип | Опис |
|----------|-----|------|
| `program_id` | string | UUID програми |
| `day_number` | number | Номер дня |

---

### `training_day_complete`
**Коли:** При завершенні тренувального дня (100% вправ)
**Файл:** `src/stores/progressStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `program_id` | string | UUID програми |
| `day_number` | number | Номер дня |
| `xp_earned` | number | Отримано XP |
| `duration_seconds` | number | Тривалість (опціонально) |

---

### `exercise_complete`
**Коли:** При виконанні окремої вправи
**Файл:** `src/stores/progressStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `exercise_id` | string | UUID вправи |
| `exercise_type` | string | Тип: `standard`, `timer`, `measurement` |
| `xp_earned` | number | Отримано XP |

---

### `measurement_saved`
**Коли:** При збереженні результату вимірювання
**Файл:** `src/stores/progressStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `exercise_id` | string | UUID вправи |
| `measurement_value` | string | Значення вимірювання |

---

## 🏆 Achievement Events

### `achievement_unlocked`
**Коли:** При отриманні нового досягнення
**Файл:** `src/stores/achievementStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `achievement_id` | string | ID досягнення |
| `achievement_name` | string | Назва досягнення |
| `xp_reward` | number | XP нагорода |

---

## 👥 Team Events

### `team_create`
**Коли:** При створенні нової команди
**Файл:** `src/stores/teamStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `team_id` | string | UUID команди |
| `team_name` | string | Назва команди |

---

### `team_join`
**Коли:** При приєднанні до команди
**Файл:** `src/stores/teamStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `team_id` | string | UUID команди |
| `join_method` | string | Метод: `code`, `invite` |

---

### `team_leave`
**Коли:** При виході з команди
**Файл:** `src/stores/teamStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `team_id` | string | UUID команди |

---

## 📊 Engagement Events

### `page_view`
**Коли:** При переході на сторінку
**Файл:** `src/App.tsx` або окремі сторінки

| Параметр | Тип | Опис |
|----------|-----|------|
| `page_name` | string | Назва сторінки |
| `page_url` | string | URL сторінки |

---

### `streak_update`
**Коли:** При оновленні серії тренувань
**Файл:** `src/stores/progressStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `current_streak` | number | Поточна серія |
| `is_new_record` | boolean | Чи це новий рекорд |

---

### `level_up`
**Коли:** При підвищенні рівня
**Файл:** `src/stores/progressStore.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `new_level` | number | Новий рівень |
| `total_xp` | number | Загальний XP |

---

## ⌚ Fitness Tracker Events

### `fitness_tracker_connect`
**Коли:** При підключенні фітнес-трекера
**Файл:** `src/hooks/useFitnessTracker.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `provider` | string | Провайдер: `web`, `apple_health`, `google_fit` |

---

### `fitness_tracker_disconnect`
**Коли:** При відключенні фітнес-трекера
**Файл:** `src/hooks/useFitnessTracker.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `provider` | string | Провайдер |

---

### `workout_session_start`
**Коли:** При старті сесії тренування
**Файл:** `src/hooks/useFitnessTracker.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `program_id` | string | UUID програми (опціонально) |
| `day_key` | string | Ключ дня (опціонально) |

---

### `workout_session_end`
**Коли:** При завершенні сесії тренування
**Файл:** `src/hooks/useFitnessTracker.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `duration_seconds` | number | Тривалість |
| `steps` | number | Кроки |
| `calories_burned` | number | Калорії |
| `heart_rate_avg` | number | Середній пульс (опціонально) |

---

## 🔔 Notification Events

### `notification_permission`
**Коли:** При запиті дозволу на сповіщення
**Файл:** `src/hooks/usePushNotifications.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `permission_granted` | boolean | Чи надано дозвіл |

---

### `notification_subscribe`
**Коли:** При підписці на push-сповіщення
**Файл:** `src/hooks/usePushNotifications.ts`

*Без додаткових параметрів*

---

### `notification_unsubscribe`
**Коли:** При відписці від push-сповіщень
**Файл:** `src/hooks/usePushNotifications.ts`

*Без додаткових параметрів*

---

### `notification_click`
**Коли:** При кліку на сповіщення
**Файл:** `public/sw-custom.js`

| Параметр | Тип | Опис |
|----------|-----|------|
| `notification_type` | string | Тип сповіщення |

---

## 📲 App Events

### `app_install`
**Коли:** При встановленні PWA
**Файл:** `src/App.tsx`

| Параметр | Тип | Опис |
|----------|-----|------|
| `platform` | string | Платформа: `pwa` |

---

### `app_update`
**Коли:** При оновленні додатку
**Файл:** `src/App.tsx`

| Параметр | Тип | Опис |
|----------|-----|------|
| `version` | string | Версія додатку |

---

### `offline_mode`
**Коли:** При зміні статусу онлайн/оффлайн
**Файл:** `src/hooks/useOffline.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `is_offline` | boolean | Чи оффлайн режим |

---

### `sync_complete`
**Коли:** При завершенні синхронізації даних
**Файл:** `src/hooks/useOffline.ts`

| Параметр | Тип | Опис |
|----------|-----|------|
| `items_synced` | number | Кількість синхронізованих елементів |

---

## ❌ Error Events

### `app_error`
**Коли:** При виникненні помилки
**Файл:** Будь-який файл

| Параметр | Тип | Опис |
|----------|-----|------|
| `error_type` | string | Тип помилки |
| `error_message` | string | Повідомлення |
| `error_context` | string | Контекст (опціонально) |

---

## 💰 E-Commerce Events (для майбутніх преміум програм)

### `view_item`
**Коли:** При перегляді програми
**Файл:** `src/pages/ProgramDetailPage.tsx`

| Параметр | Тип | Опис |
|----------|-----|------|
| `item_id` | string | UUID програми |
| `item_name` | string | Назва програми |
| `item_category` | string | `training_program` |
| `is_premium` | boolean | Чи преміум |
| `price` | number | Ціна (опціонально) |
| `currency` | string | `USD` |

---

### `begin_checkout`
**Коли:** При початку оплати
**Файл:** Сторінка оплати

| Параметр | Тип | Опис |
|----------|-----|------|
| `item_id` | string | UUID програми |
| `item_name` | string | Назва програми |
| `price` | number | Ціна |
| `currency` | string | `USD` |

---

### `purchase`
**Коли:** При успішній оплаті
**Файл:** Сторінка оплати

| Параметр | Тип | Опис |
|----------|-----|------|
| `transaction_id` | string | ID транзакції |
| `item_id` | string | UUID програми |
| `item_name` | string | Назва програми |
| `price` | number | Ціна |
| `currency` | string | `USD` |

---

## 🔧 Налаштування GTM

### Рекомендовані тригери:

1. **All Pages** - для `page_view`
2. **Custom Event** - для кожного event name
3. **DOM Ready** - для ініціалізації

### Рекомендовані теги GA4:

```
GA4 Configuration Tag:
- Measurement ID: G-XXXXXXXXXX

GA4 Event Tags:
- Trigger: Custom Event = event_name
- Event Parameters: з dataLayer
```

### Debug Mode:

В development режимі всі події логуються в консоль:
```
📊 DataLayer Push: event_name { params }
```

---

## 📁 Файл аналітики

`src/lib/analytics.ts` - містить всі функції для пушу подій

### Використання:

```typescript
import { trackExerciseComplete, trackDayComplete } from '@/lib/analytics';

// При виконанні вправи
trackExerciseComplete('exercise-123', 'standard', 10);

// При завершенні дня
trackDayComplete('program-123', 5, 50);
```

