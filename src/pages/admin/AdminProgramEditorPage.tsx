import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, ChevronRight, GripVertical, Clock, MapPin, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgramStore, ProgramDay, DaySection, Exercise } from '@/stores/programStore';
import { categoryInfo, difficultyInfo, ProgramCategory, ProgramDifficulty } from '@/types/training';
import { cn } from '@/lib/utils';

const ICONS = ['⚽', '🏃', '💪', '⚡', '🎯', '🧘', '🏋️', '🔥', '⭐', '🏆'];

export const AdminProgramEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { language, getLocalizedText } = useTranslation();
  const { profile } = useAuthStore();

  // Локалізація
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'newProgram': { uk: 'Нова програма', en: 'New Program', cs: 'Nový program' },
      'editProgram': { uk: 'Редагування програми', en: 'Edit Program', cs: 'Upravit program' },
      'save': { uk: 'Зберегти', en: 'Save', cs: 'Uložit' },
      'info': { uk: 'Інформація', en: 'Info', cs: 'Informace' },
      'days': { uk: 'Дні', en: 'Days', cs: 'Dny' },
      'icon': { uk: 'Іконка', en: 'Icon', cs: 'Ikona' },
      'titleUk': { uk: 'Назва (українською)', en: 'Title (Ukrainian)', cs: 'Název (ukrajinsky)' },
      'titleEn': { uk: 'Назва (англійською)', en: 'Title (English)', cs: 'Název (anglicky)' },
      'titleCs': { uk: 'Назва (чеською)', en: 'Title (Czech)', cs: 'Název (česky)' },
      'description': { uk: 'Опис', en: 'Description', cs: 'Popis' },
      'category': { uk: 'Категорія', en: 'Category', cs: 'Kategorie' },
      'difficulty': { uk: 'Складність', en: 'Difficulty', cs: 'Obtížnost' },
      'duration': { uk: 'Тривалість (днів)', en: 'Duration (days)', cs: 'Délka (dní)' },
      'active': { uk: 'Активна', en: 'Active', cs: 'Aktivní' },
      'activeDesc': { uk: 'Програма видима для користувачів', en: 'Program is visible to users', cs: 'Program je viditelný pro uživatele' },
      'featured': { uk: 'Рекомендована', en: 'Featured', cs: 'Doporučený' },
      'featuredDesc': { uk: 'Показувати на головній', en: 'Show on homepage', cs: 'Zobrazit na hlavní stránce' },
      'premium': { uk: 'Преміум', en: 'Premium', cs: 'Premium' },
      'premiumDesc': { uk: 'Платна програма', en: 'Paid program', cs: 'Placený program' },
      'addDay': { uk: 'Додати день', en: 'Add Day', cs: 'Přidat den' },
      'newDay': { uk: 'Новий день', en: 'New Day', cs: 'Nový den' },
      'editDay': { uk: 'Редагувати день', en: 'Edit Day', cs: 'Upravit den' },
      'dayNumber': { uk: 'День №', en: 'Day #', cs: 'Den č.' },
      'title': { uk: 'Назва', en: 'Title', cs: 'Název' },
      'intensity': { uk: 'Інтенсивність', en: 'Intensity', cs: 'Intenzita' },
      'location': { uk: 'Локація', en: 'Location', cs: 'Místo' },
      'intensityLow': { uk: 'Легка', en: 'Low', cs: 'Nízká' },
      'intensityMedium': { uk: 'Середня', en: 'Medium', cs: 'Střední' },
      'intensityHigh': { uk: 'Висока', en: 'High', cs: 'Vysoká' },
      'locationHome': { uk: 'Дім', en: 'Home', cs: 'Doma' },
      'locationField': { uk: 'Поле', en: 'Field', cs: 'Hřiště' },
      'locationGym': { uk: 'Зал', en: 'Gym', cs: 'Posilovna' },
      'newSection': { uk: 'Нова секція', en: 'New Section', cs: 'Nová sekce' },
      'section': { uk: 'Секція', en: 'Section', cs: 'Sekce' },
      'exercise': { uk: 'Вправа', en: 'Exercise', cs: 'Cvičení' },
      'newExercise': { uk: 'Нова вправа', en: 'New Exercise', cs: 'Nový cvik' },
      'editExercise': { uk: 'Редагувати вправу', en: 'Edit Exercise', cs: 'Upravit cvik' },
      'type': { uk: 'Тип', en: 'Type', cs: 'Typ' },
      'typeCheckbox': { uk: 'Галочка', en: 'Checkbox', cs: 'Zaškrtávátko' },
      'typeInput': { uk: 'Ввід', en: 'Input', cs: 'Vstup' },
      'typeTimer': { uk: 'Таймер', en: 'Timer', cs: 'Časovač' },
      'timerDuration': { uk: 'Тривалість (сек)', en: 'Duration (sec)', cs: 'Délka (sek)' },
      'sets': { uk: 'Підходи', en: 'Sets', cs: 'Série' },
      'reps': { uk: 'Повторення', en: 'Reps', cs: 'Opakování' },
      'descriptionSteps': { uk: 'Опис (кроки)', en: 'Description (steps)', cs: 'Popis (kroky)' },
      'addStep': { uk: 'Додати крок', en: 'Add step', cs: 'Přidat krok' },
      'accessDenied': { uk: 'Доступ заборонено', en: 'Access Denied', cs: 'Přístup odepřen' },
      'min': { uk: 'хв', en: 'min', cs: 'min' },
    };
    return texts[key]?.[language] || texts[key]?.uk || key;
  };
  const { 
    currentProgram, 
    currentDays,
    currentSections,
    currentExercises,
    isAdmin,
    isLoading, 
    loadProgramDetails, 
    checkAdminStatus,
    createProgram, 
    updateProgram,
    createDay,
    updateDay,
    deleteDay,
    createSection,
    updateSection,
    deleteSection,
    createExercise,
    updateExercise,
    deleteExercise,
    clearCurrentProgram 
  } = useProgramStore();

  const isNew = programId === 'new';
  
  // Form state
  const [formData, setFormData] = useState({
    title_uk: '',
    title_en: '',
    title_cs: '',
    description_uk: '',
    description_en: '',
    description_cs: '',
    category: 'technique' as ProgramCategory,
    difficulty: 'intermediate' as ProgramDifficulty,
    duration_days: 30,
    icon: '⚽',
    is_active: true,
    is_featured: false,
    is_premium: false,
    price_usd: 0,
  });

  const [activeTab, setActiveTab] = useState<'info' | 'days'>('info');
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  
  // Modals
  const [showDayModal, setShowDayModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingDay, setEditingDay] = useState<ProgramDay | null>(null);
  const [editingSection, setEditingSection] = useState<DaySection | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Day form
  const [dayForm, setDayForm] = useState({
    day_number: 1,
    title_uk: '',
    title_en: '',
    title_cs: '',
    focus_uk: '',
    intensity: 'medium' as 'low' | 'medium' | 'high',
    location: 'home' as 'home' | 'field' | 'gym',
    duration_minutes: 45,
  });

  // Section form
  const [sectionForm, setSectionForm] = useState({
    title_uk: '',
    title_en: '',
    title_cs: '',
    duration_minutes: 10,
    order_index: 0,
  });

  // Exercise form
  const [exerciseForm, setExerciseForm] = useState({
    title_uk: '',
    title_en: '',
    title_cs: '',
    description_uk: [''],
    sets_uk: '',
    reps_uk: '',
    rest_seconds: 30,
    exercise_type: 'checkbox' as 'checkbox' | 'input' | 'timer',
    input_label_uk: '',
    note_uk: '',
    timer_duration: 60,
    order_index: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      checkAdminStatus(profile.id);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!isNew && programId) {
      loadProgramDetails(programId);
    }
    return () => clearCurrentProgram();
  }, [programId, isNew]);

  useEffect(() => {
    if (currentProgram && !isNew) {
      setFormData({
        title_uk: currentProgram.title_uk,
        title_en: currentProgram.title_en || '',
        title_cs: currentProgram.title_cs || '',
        description_uk: currentProgram.description_uk || '',
        description_en: currentProgram.description_en || '',
        description_cs: currentProgram.description_cs || '',
        category: currentProgram.category as ProgramCategory,
        difficulty: currentProgram.difficulty as ProgramDifficulty,
        duration_days: currentProgram.duration_days,
        icon: currentProgram.icon,
        is_active: currentProgram.is_active,
        is_featured: currentProgram.is_featured,
        is_premium: currentProgram.is_premium,
        price_usd: currentProgram.price_usd || 0,
      });
    }
  }, [currentProgram, isNew]);

  // If not admin, show access denied
  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center py-12">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'uk' ? 'Доступ заборонено' : 'Access Denied'}
          </h2>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    if (!profile?.id || !formData.title_uk) return;
    
    setSaving(true);
    
    if (isNew) {
      const program = await createProgram({
        ...formData,
        created_by: profile.id,
      });
      if (program) {
        navigate(`/admin/programs/${program.id}`, { replace: true });
      }
    } else if (programId) {
      await updateProgram(programId, formData);
    }
    
    setSaving(false);
  };

  const toggleDayExpand = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  // Day handlers
  const handleAddDay = () => {
    const nextDayNumber = currentDays.length > 0 
      ? Math.max(...currentDays.map(d => d.day_number)) + 1 
      : 1;
    
    setDayForm({
      day_number: nextDayNumber,
      title_uk: `День ${nextDayNumber}`,
      title_en: `Day ${nextDayNumber}`,
      title_cs: `Den ${nextDayNumber}`,
      focus_uk: '',
      intensity: 'medium',
      location: 'home',
      duration_minutes: 45,
    });
    setEditingDay(null);
    setShowDayModal(true);
  };

  const handleSaveDay = async () => {
    if (!programId || isNew) return;
    
    if (editingDay) {
      await updateDay(editingDay.id, dayForm);
    } else {
      await createDay({ program_id: programId, ...dayForm });
    }
    setShowDayModal(false);
  };

  // Section handlers
  const handleAddSection = (dayId: string) => {
    const daySections = currentSections[dayId] || [];
    setSectionForm({
      title_uk: '',
      title_en: '',
      title_cs: '',
      duration_minutes: 10,
      order_index: daySections.length,
    });
    setCurrentDayId(dayId);
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!currentDayId) return;
    
    if (editingSection) {
      await updateSection(editingSection.id, sectionForm);
    } else {
      await createSection({ day_id: currentDayId, ...sectionForm });
    }
    setShowSectionModal(false);
  };

  // Exercise handlers
  const handleAddExercise = (sectionId: string) => {
    const sectionExercises = currentExercises[sectionId] || [];
    setExerciseForm({
      title_uk: '',
      title_en: '',
      title_cs: '',
      description_uk: [''],
      sets_uk: '',
      reps_uk: '',
      rest_seconds: 30,
      exercise_type: 'checkbox',
      input_label_uk: '',
      note_uk: '',
      timer_duration: 60,
      order_index: sectionExercises.length,
    });
    setCurrentSectionId(sectionId);
    setEditingExercise(null);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setExerciseForm({
      title_uk: exercise.title_uk,
      title_en: exercise.title_en || '',
      title_cs: exercise.title_cs || '',
      description_uk: exercise.description_uk || [''],
      sets_uk: exercise.sets_uk || '',
      reps_uk: exercise.reps_uk || '',
      rest_seconds: exercise.rest_seconds || 30,
      exercise_type: exercise.exercise_type as 'checkbox' | 'input' | 'timer',
      input_label_uk: exercise.input_label_uk || '',
      note_uk: exercise.note_uk || '',
      timer_duration: exercise.timer_duration || 60,
      order_index: exercise.order_index,
    });
    setCurrentSectionId(exercise.section_id);
    setEditingExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async () => {
    if (!currentSectionId) return;
    
    const exerciseData = {
      ...exerciseForm,
      description_uk: exerciseForm.description_uk.filter(d => d.trim() !== ''),
    };
    
    if (editingExercise) {
      await updateExercise(editingExercise.id, exerciseData);
    } else {
      await createExercise({ section_id: currentSectionId, ...exerciseData });
    }
    setShowExerciseModal(false);
  };

  const addDescriptionStep = () => {
    setExerciseForm({
      ...exerciseForm,
      description_uk: [...exerciseForm.description_uk, ''],
    });
  };

  const updateDescriptionStep = (index: number, value: string) => {
    const newDesc = [...exerciseForm.description_uk];
    newDesc[index] = value;
    setExerciseForm({ ...exerciseForm, description_uk: newDesc });
  };

  const removeDescriptionStep = (index: number) => {
    const newDesc = exerciseForm.description_uk.filter((_, i) => i !== index);
    setExerciseForm({ ...exerciseForm, description_uk: newDesc });
  };

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/programs')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-violet-500 font-medium">Admin</span>
              </div>
              <h1 className="font-bold text-lg">
                {isNew 
                  ? (language === 'uk' ? 'Нова програма' : 'New Program')
                  : (language === 'uk' ? 'Редагування' : 'Edit Program')
                }
              </h1>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title_uk}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '...' : (language === 'uk' ? 'Зберегти' : 'Save')}
          </button>
        </div>

        {/* Tabs */}
        {!isNew && (
          <div className="flex border-t">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'info' 
                  ? 'border-violet-600 text-violet-600' 
                  : 'border-transparent text-gray-500'
              )}
            >
              {language === 'uk' ? 'Інформація' : 'Info'}
            </button>
            <button
              onClick={() => setActiveTab('days')}
              className={cn(
                'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'days' 
                  ? 'border-violet-600 text-violet-600' 
                  : 'border-transparent text-gray-500'
              )}
            >
              {language === 'uk' ? 'Дні' : 'Days'} ({currentDays.length})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {(activeTab === 'info' || isNew) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Icon Selection */}
            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'uk' ? 'Іконка' : 'Icon'}
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setFormData({ ...formData, icon })}
                    className={cn(
                      'w-12 h-12 text-2xl rounded-xl border-2 transition-all',
                      formData.icon === icon 
                        ? 'border-violet-500 bg-violet-50' 
                        : 'border-gray-200'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </Card>

            {/* Title */}
            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'uk' ? 'Назва (українською)' : 'Title (Ukrainian)'} *
              </label>
              <input
                type="text"
                value={formData.title_uk}
                onChange={(e) => setFormData({ ...formData, title_uk: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                placeholder={language === 'uk' ? 'Введіть назву...' : 'Enter title...'}
              />
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">English</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Česky</label>
                  <input
                    type="text"
                    value={formData.title_cs}
                    onChange={(e) => setFormData({ ...formData, title_cs: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'uk' ? 'Опис' : 'Description'}
              </label>
              <textarea
                value={formData.description_uk}
                onChange={(e) => setFormData({ ...formData, description_uk: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 outline-none resize-none"
                rows={3}
              />
            </Card>

            {/* Category & Difficulty */}
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Категорія' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProgramCategory })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {getLocalizedText(info.label)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Складність' : 'Difficulty'}
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as ProgramDifficulty })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    {Object.entries(difficultyInfo).map(([key, info]) => (
                      <option key={key} value={key}>
                        {getLocalizedText(info.label)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Duration */}
            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'uk' ? 'Тривалість (днів)' : 'Duration (days)'}
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })}
                min={1}
                max={365}
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </Card>

            {/* Toggles */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {language === 'uk' ? 'Активна' : 'Active'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'uk' ? 'Програма видима для користувачів' : 'Program is visible to users'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {language === 'uk' ? 'Featured' : 'Featured'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'uk' ? 'Показувати на головній' : 'Show on homepage'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    💎 {language === 'uk' ? 'Premium' : 'Premium'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'uk' ? 'Платна програма' : 'Paid program'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'days' && !isNew && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Add Day Button */}
            <button
              onClick={handleAddDay}
              className="w-full p-4 border-2 border-dashed border-violet-300 rounded-xl text-violet-600 font-medium hover:bg-violet-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'uk' ? 'Додати день' : 'Add Day'}
            </button>

            {/* Days List */}
            {currentDays.map((day) => {
              const daySections = currentSections[day.id] || [];
              const isExpanded = expandedDays.has(day.id);

              return (
                <Card key={day.id} className="overflow-hidden">
                  {/* Day Header */}
                  <div 
                    className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleDayExpand(day.id)}
                  >
                    <span className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                      day.intensity === 'low' && 'bg-green-100 text-green-600',
                      day.intensity === 'medium' && 'bg-amber-100 text-amber-600',
                      day.intensity === 'high' && 'bg-red-100 text-red-600',
                    )}>
                      {day.day_number}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{day.title_uk}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {day.duration_minutes} {language === 'uk' ? 'хв' : 'min'}
                        <MapPin className="w-3 h-3 ml-2" />
                        {day.location === 'home' ? '🏠' : day.location === 'field' ? '⚽' : '🏋️'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDay(day.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {/* Sections */}
                      {daySections.map((section) => {
                        const sectionExercises = currentExercises[section.id] || [];
                        
                        return (
                          <div key={section.id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-800">{section.title_uk}</h5>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Exercises */}
                            <div className="space-y-1">
                              {sectionExercises.map((exercise) => (
                                <div 
                                  key={exercise.id}
                                  className="flex items-center gap-2 p-2 bg-white rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleEditExercise(exercise)}
                                >
                                  <GripVertical className="w-3 h-3 text-gray-300" />
                                  <span className="flex-1">{exercise.title_uk}</span>
                                  {exercise.exercise_type === 'timer' && <span className="text-xs text-blue-500">⏱</span>}
                                  {exercise.exercise_type === 'input' && <span className="text-xs text-purple-500">📝</span>}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteExercise(exercise.id);
                                    }}
                                    className="p-1 hover:bg-red-100 rounded text-red-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              onClick={() => handleAddExercise(section.id)}
                              className="w-full mt-2 p-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-violet-300 hover:text-violet-600"
                            >
                              + {language === 'uk' ? 'Вправа' : 'Exercise'}
                            </button>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => handleAddSection(day.id)}
                        className="w-full p-2 border border-dashed border-violet-300 rounded-lg text-sm text-violet-600 hover:bg-violet-50"
                      >
                        + {language === 'uk' ? 'Секція' : 'Section'}
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Day Modal */}
      {showDayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingDay ? getText('editDay') : getText('newDay')}
              </h3>
              <button onClick={() => setShowDayModal(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('dayNumber')}</label>
                <input
                  type="number"
                  value={dayForm.day_number}
                  onChange={(e) => setDayForm({ ...dayForm, day_number: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('title')}</label>
                <input
                  type="text"
                  value={dayForm.title_uk}
                  onChange={(e) => setDayForm({ ...dayForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('intensity')}</label>
                  <select
                    value={dayForm.intensity}
                    onChange={(e) => setDayForm({ ...dayForm, intensity: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="low">{getText('intensityLow')}</option>
                    <option value="medium">{getText('intensityMedium')}</option>
                    <option value="high">{getText('intensityHigh')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('location')}</label>
                  <select
                    value={dayForm.location}
                    onChange={(e) => setDayForm({ ...dayForm, location: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="home">🏠 {getText('locationHome')}</option>
                    <option value="field">⚽ {getText('locationField')}</option>
                    <option value="gym">🏋️ {getText('locationGym')}</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSaveDay}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700"
              >
                {getText('save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">{getText('newSection')}</h3>
              <button onClick={() => setShowSectionModal(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('title')}</label>
                <input
                  type="text"
                  value={sectionForm.title_uk}
                  onChange={(e) => setSectionForm({ ...sectionForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder={language === 'uk' ? 'Розминка, Основна частина...' : 'Warm-up, Main part...'}
                />
              </div>
              <button
                onClick={handleSaveSection}
                disabled={!sectionForm.title_uk}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50"
              >
                {getText('save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-lg">
                {editingExercise ? getText('editExercise') : getText('newExercise')}
              </h3>
              <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('title')} *</label>
                <input
                  type="text"
                  value={exerciseForm.title_uk}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'checkbox', label: `✓ ${getText('typeCheckbox')}` },
                    { value: 'input', label: `📝 ${getText('typeInput')}` },
                    { value: 'timer', label: `⏱ ${getText('typeTimer')}` },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setExerciseForm({ ...exerciseForm, exercise_type: type.value as any })}
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium',
                        exerciseForm.exercise_type === type.value
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {exerciseForm.exercise_type === 'timer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('timerDuration')}</label>
                  <input
                    type="number"
                    value={exerciseForm.timer_duration}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, timer_duration: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('sets')}</label>
                  <input
                    type="text"
                    value={exerciseForm.sets_uk}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets_uk: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder={language === 'uk' ? '3 підходи' : '3 sets'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getText('reps')}</label>
                  <input
                    type="text"
                    value={exerciseForm.reps_uk}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps_uk: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder={language === 'uk' ? '10 разів' : '10 reps'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getText('descriptionSteps')}</label>
                {exerciseForm.description_uk.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="w-6 h-10 flex items-center justify-center text-sm text-gray-400">{index + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateDescriptionStep(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                    {exerciseForm.description_uk.length > 1 && (
                      <button onClick={() => removeDescriptionStep(index)} className="p-2 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addDescriptionStep} className="text-sm text-violet-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> {getText('addStep')}
                </button>
              </div>

              <button
                onClick={handleSaveExercise}
                disabled={!exerciseForm.title_uk}
                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50"
              >
                {getText('save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramEditorPage;

