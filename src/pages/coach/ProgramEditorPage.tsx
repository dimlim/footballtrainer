// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, ChevronRight, GripVertical, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useCoachProgramStore, CustomProgramDay } from '@/stores/coachProgramStore';
import { categoryInfo, difficultyInfo, ProgramCategory, ProgramDifficulty } from '@/types/training';
import { cn } from '@/lib/utils';

const ICONS = ['⚽', '🏃', '💪', '⚡', '🎯', '🧘', '🏋️', '🔥', '⭐', '🏆'];

export const ProgramEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { language, getLocalizedText } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    currentProgram, 
    currentDays,
    isLoading, 
    loadProgramDetails, 
    createProgram, 
    updateProgram,
    createDay,
    updateDay,
    deleteDay,
    clearCurrentProgram 
  } = useCoachProgramStore();

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
    is_public: false,
  });

  const [activeTab, setActiveTab] = useState<'info' | 'days'>('info');
  const [saving, setSaving] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingDay, setEditingDay] = useState<CustomProgramDay | null>(null);

  // Day form state
  const [dayForm, setDayForm] = useState({
    day_number: 1,
    title_uk: '',
    title_en: '',
    title_cs: '',
    focus_uk: '',
    focus_en: '',
    focus_cs: '',
    intensity: 'medium' as 'low' | 'medium' | 'high',
    location: 'home' as 'home' | 'field' | 'gym',
    duration_minutes: 45,
  });

  useEffect(() => {
    if (!isNew && programId) {
      loadProgramDetails(programId);
    }
    return () => clearCurrentProgram();
  }, [programId, isNew, loadProgramDetails, clearCurrentProgram]);

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
        is_public: currentProgram.is_public,
      });
    }
  }, [currentProgram, isNew]);

  const handleSave = async () => {
    if (!profile?.id || !formData.title_uk) return;
    
    setSaving(true);
    
    if (isNew) {
      const program = await createProgram({
        coach_id: profile.id,
        ...formData,
      });
      if (program) {
        navigate(`/app/coach/programs/${program.id}`, { replace: true });
      }
    } else if (programId) {
      await updateProgram(programId, formData);
    }
    
    setSaving(false);
  };

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
      focus_en: '',
      focus_cs: '',
      intensity: 'medium',
      location: 'home',
      duration_minutes: 45,
    });
    setEditingDay(null);
    setShowDayModal(true);
  };

  const handleEditDay = (day: CustomProgramDay) => {
    setDayForm({
      day_number: day.day_number,
      title_uk: day.title_uk,
      title_en: day.title_en || '',
      title_cs: day.title_cs || '',
      focus_uk: day.focus_uk || '',
      focus_en: day.focus_en || '',
      focus_cs: day.focus_cs || '',
      intensity: day.intensity as 'low' | 'medium' | 'high',
      location: day.location as 'home' | 'field' | 'gym',
      duration_minutes: day.duration_minutes,
    });
    setEditingDay(day);
    setShowDayModal(true);
  };

  const handleSaveDay = async () => {
    if (!programId || isNew) return;
    
    if (editingDay) {
      await updateDay(editingDay.id, dayForm);
    } else {
      await createDay({
        program_id: programId,
        ...dayForm,
      });
    }
    
    setShowDayModal(false);
  };

  const handleDeleteDay = async (dayId: string) => {
    if (window.confirm(language === 'uk' ? 'Видалити цей день?' : 'Delete this day?')) {
      await deleteDay(dayId);
    }
  };

  const getDayTitle = (day: CustomProgramDay) => {
    if (language === 'uk') return day.title_uk;
    if (language === 'cs') return day.title_cs || day.title_uk;
    return day.title_en || day.title_uk;
  };

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
              onClick={() => navigate('/app/coach/programs')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">
              {isNew 
                ? (language === 'uk' ? 'Нова програма' : 'New Program')
                : (language === 'uk' ? 'Редагування' : 'Edit Program')
              }
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title_uk}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {language === 'uk' ? 'Інформація' : 'Info'}
            </button>
            <button
              onClick={() => setActiveTab('days')}
              className={cn(
                'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'days' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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
                    placeholder="English title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Česky</label>
                  <input
                    type="text"
                    value={formData.title_cs}
                    onChange={(e) => setFormData({ ...formData, title_cs: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Český název"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                rows={3}
                placeholder={language === 'uk' ? 'Опишіть програму...' : 'Describe the program...'}
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </Card>

            {/* Public Toggle */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {language === 'uk' ? 'Публічна програма' : 'Public Program'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'uk' ? 'Інші користувачі зможуть бачити цю програму' : 'Other users will be able to see this program'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
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
              className="w-full p-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'uk' ? 'Додати день' : 'Add Day'}
            </button>

            {/* Days List */}
            {currentDays.map((day) => (
              <Card 
                key={day.id}
                className="p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-300">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div 
                    className="flex-1"
                    onClick={() => navigate(`/app/coach/programs/${programId}/day/${day.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        day.intensity === 'low' && 'bg-green-100 text-green-600',
                        day.intensity === 'medium' && 'bg-amber-100 text-amber-600',
                        day.intensity === 'high' && 'bg-red-100 text-red-600',
                      )}>
                        {day.day_number}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{getDayTitle(day)}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {day.duration_minutes} {language === 'uk' ? 'хв' : 'min'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {day.location === 'home' ? '🏠' : day.location === 'field' ? '⚽' : '🏋️'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditDay(day)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}

            {currentDays.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>{language === 'uk' ? 'Додайте перший день тренувань' : 'Add your first training day'}</p>
              </div>
            )}
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
                {editingDay 
                  ? (language === 'uk' ? 'Редагувати день' : 'Edit Day')
                  : (language === 'uk' ? 'Новий день' : 'New Day')
                }
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Day Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Номер дня' : 'Day Number'}
                </label>
                <input
                  type="number"
                  value={dayForm.day_number}
                  onChange={(e) => setDayForm({ ...dayForm, day_number: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Назва' : 'Title'}
                </label>
                <input
                  type="text"
                  value={dayForm.title_uk}
                  onChange={(e) => setDayForm({ ...dayForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder={language === 'uk' ? 'Назва дня...' : 'Day title...'}
                />
              </div>

              {/* Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Фокус' : 'Focus'}
                </label>
                <input
                  type="text"
                  value={dayForm.focus_uk}
                  onChange={(e) => setDayForm({ ...dayForm, focus_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder={language === 'uk' ? 'На що фокус...' : 'What to focus on...'}
                />
              </div>

              {/* Intensity & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Інтенсивність' : 'Intensity'}
                  </label>
                  <select
                    value={dayForm.intensity}
                    onChange={(e) => setDayForm({ ...dayForm, intensity: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="low">{language === 'uk' ? 'Легка' : 'Low'}</option>
                    <option value="medium">{language === 'uk' ? 'Середня' : 'Medium'}</option>
                    <option value="high">{language === 'uk' ? 'Висока' : 'High'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Локація' : 'Location'}
                  </label>
                  <select
                    value={dayForm.location}
                    onChange={(e) => setDayForm({ ...dayForm, location: e.target.value as 'home' | 'field' | 'gym' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="home">🏠 {language === 'uk' ? 'Дім' : 'Home'}</option>
                    <option value="field">⚽ {language === 'uk' ? 'Поле' : 'Field'}</option>
                    <option value="gym">🏋️ {language === 'uk' ? 'Зал' : 'Gym'}</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Тривалість (хв)' : 'Duration (min)'}
                </label>
                <input
                  type="number"
                  value={dayForm.duration_minutes}
                  onChange={(e) => setDayForm({ ...dayForm, duration_minutes: parseInt(e.target.value) || 30 })}
                  min={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveDay}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {language === 'uk' ? 'Зберегти' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProgramEditorPage;

