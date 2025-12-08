import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, Reorder } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useCoachProgramStore, CustomDaySection, CustomExercise } from '@/stores/coachProgramStore';
import { cn } from '@/lib/utils';

export const DayEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { programId, dayId } = useParams<{ programId: string; dayId: string }>();
  const { language } = useTranslation();
  const { 
    currentProgram,
    currentDays,
    currentSections,
    currentExercises,
    isLoading,
    loadProgramDetails,
    createSection,
    updateSection,
    deleteSection,
    createExercise,
    updateExercise,
    deleteExercise,
  } = useCoachProgramStore();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomDaySection | null>(null);
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

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
    sets_en: '',
    sets_cs: '',
    reps_uk: '',
    reps_en: '',
    reps_cs: '',
    rest_seconds: 30,
    exercise_type: 'checkbox' as 'checkbox' | 'input' | 'timer',
    input_label_uk: '',
    note_uk: '',
    timer_duration: 60,
    order_index: 0,
  });

  const currentDay = currentDays.find(d => d.id === dayId);
  const sections = dayId ? (currentSections[dayId] || []) : [];

  useEffect(() => {
    if (programId && !currentProgram) {
      loadProgramDetails(programId);
    }
  }, [programId, currentProgram, loadProgramDetails]);

  useEffect(() => {
    // Expand all sections by default
    if (sections.length > 0) {
      setExpandedSections(new Set(sections.map(s => s.id)));
    }
  }, [sections.length]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddSection = () => {
    const nextOrder = sections.length;
    setSectionForm({
      title_uk: '',
      title_en: '',
      title_cs: '',
      duration_minutes: 10,
      order_index: nextOrder,
    });
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section: CustomDaySection) => {
    setSectionForm({
      title_uk: section.title_uk,
      title_en: section.title_en || '',
      title_cs: section.title_cs || '',
      duration_minutes: section.duration_minutes || 10,
      order_index: section.order_index,
    });
    setEditingSection(section);
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!dayId) return;
    
    if (editingSection) {
      await updateSection(editingSection.id, sectionForm);
    } else {
      await createSection({
        day_id: dayId,
        ...sectionForm,
      });
    }
    setShowSectionModal(false);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm(language === 'uk' ? 'Видалити цю секцію?' : 'Delete this section?')) {
      await deleteSection(sectionId);
    }
  };

  const handleAddExercise = (sectionId: string) => {
    const sectionExercises = currentExercises[sectionId] || [];
    const nextOrder = sectionExercises.length;
    
    setExerciseForm({
      title_uk: '',
      title_en: '',
      title_cs: '',
      description_uk: [''],
      sets_uk: '',
      sets_en: '',
      sets_cs: '',
      reps_uk: '',
      reps_en: '',
      reps_cs: '',
      rest_seconds: 30,
      exercise_type: 'checkbox',
      input_label_uk: '',
      note_uk: '',
      timer_duration: 60,
      order_index: nextOrder,
    });
    setCurrentSectionId(sectionId);
    setEditingExercise(null);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (exercise: CustomExercise) => {
    setExerciseForm({
      title_uk: exercise.title_uk,
      title_en: exercise.title_en || '',
      title_cs: exercise.title_cs || '',
      description_uk: exercise.description_uk || [''],
      sets_uk: exercise.sets_uk || '',
      sets_en: exercise.sets_en || '',
      sets_cs: exercise.sets_cs || '',
      reps_uk: exercise.reps_uk || '',
      reps_en: exercise.reps_en || '',
      reps_cs: exercise.reps_cs || '',
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
      await createExercise({
        section_id: currentSectionId,
        ...exerciseData,
      });
    }
    setShowExerciseModal(false);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (window.confirm(language === 'uk' ? 'Видалити цю вправу?' : 'Delete this exercise?')) {
      await deleteExercise(exerciseId);
    }
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

  const getSectionTitle = (section: CustomDaySection) => {
    if (language === 'uk') return section.title_uk;
    if (language === 'cs') return section.title_cs || section.title_uk;
    return section.title_en || section.title_uk;
  };

  const getExerciseTitle = (exercise: CustomExercise) => {
    if (language === 'uk') return exercise.title_uk;
    if (language === 'cs') return exercise.title_cs || exercise.title_uk;
    return exercise.title_en || exercise.title_uk;
  };

  if (isLoading) {
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
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/coach/programs/${programId}`)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">
              {currentDay ? (language === 'uk' ? currentDay.title_uk : currentDay.title_en || currentDay.title_uk) : ''}
            </h1>
            <p className="text-sm text-gray-500">
              {language === 'uk' ? 'День' : 'Day'} {currentDay?.day_number}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add Section Button */}
        <button
          onClick={handleAddSection}
          className="w-full p-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'uk' ? 'Додати секцію' : 'Add Section'}
        </button>

        {/* Sections */}
        {sections.map((section) => {
          const sectionExercises = currentExercises[section.id] || [];
          const isExpanded = expandedSections.has(section.id);

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                {/* Section Header */}
                <div 
                  className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <GripVertical className="w-5 h-5 text-gray-300" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {getSectionTitle(section)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {section.duration_minutes} {language === 'uk' ? 'хв' : 'min'}
                      <span className="mx-1">•</span>
                      {sectionExercises.length} {language === 'uk' ? 'вправ' : 'exercises'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSection(section);
                    }}
                    className="p-2 hover:bg-white rounded-lg text-gray-500"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
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

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 space-y-2">
                    {/* Exercises */}
                    {sectionExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {getExerciseTitle(exercise)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            {exercise.exercise_type === 'timer' && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">⏱ Таймер</span>
                            )}
                            {exercise.exercise_type === 'input' && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">📝 Ввід</span>
                            )}
                            {exercise.sets_uk && <span>🔄 {exercise.sets_uk}</span>}
                            {exercise.reps_uk && <span>{exercise.reps_uk}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditExercise(exercise)}
                          className="p-2 hover:bg-white rounded-lg text-gray-500"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Add Exercise Button */}
                    <button
                      onClick={() => handleAddExercise(section.id)}
                      className="w-full p-2.5 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'uk' ? 'Додати вправу' : 'Add Exercise'}
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>{language === 'uk' ? 'Додайте першу секцію' : 'Add your first section'}</p>
          </div>
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingSection 
                  ? (language === 'uk' ? 'Редагувати секцію' : 'Edit Section')
                  : (language === 'uk' ? 'Нова секція' : 'New Section')
                }
              </h3>
              <button onClick={() => setShowSectionModal(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Назва' : 'Title'} *
                </label>
                <input
                  type="text"
                  value={sectionForm.title_uk}
                  onChange={(e) => setSectionForm({ ...sectionForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder={language === 'uk' ? 'Розминка, Основна частина...' : 'Warm-up, Main part...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Тривалість (хв)' : 'Duration (min)'}
                </label>
                <input
                  type="number"
                  value={sectionForm.duration_minutes}
                  onChange={(e) => setSectionForm({ ...sectionForm, duration_minutes: parseInt(e.target.value) || 5 })}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>

              <button
                onClick={handleSaveSection}
                disabled={!sectionForm.title_uk}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {language === 'uk' ? 'Зберегти' : 'Save'}
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
                {editingExercise 
                  ? (language === 'uk' ? 'Редагувати вправу' : 'Edit Exercise')
                  : (language === 'uk' ? 'Нова вправа' : 'New Exercise')
                }
              </h3>
              <button onClick={() => setShowExerciseModal(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Назва вправи' : 'Exercise Title'} *
                </label>
                <input
                  type="text"
                  value={exerciseForm.title_uk}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, title_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  placeholder={language === 'uk' ? 'Присідання, Біг...' : 'Squats, Running...'}
                />
              </div>

              {/* Exercise Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Тип вправи' : 'Exercise Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'checkbox', label: language === 'uk' ? '✓ Галочка' : '✓ Checkbox' },
                    { value: 'input', label: language === 'uk' ? '📝 Ввід' : '📝 Input' },
                    { value: 'timer', label: language === 'uk' ? '⏱ Таймер' : '⏱ Timer' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setExerciseForm({ ...exerciseForm, exercise_type: type.value as 'checkbox' | 'input' | 'timer' })}
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium transition-all',
                        exerciseForm.exercise_type === type.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Duration (if timer type) */}
              {exerciseForm.exercise_type === 'timer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Тривалість таймера (сек)' : 'Timer Duration (sec)'}
                  </label>
                  <input
                    type="number"
                    value={exerciseForm.timer_duration}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, timer_duration: parseInt(e.target.value) || 30 })}
                    min={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  />
                </div>
              )}

              {/* Input Label (if input type) */}
              {exerciseForm.exercise_type === 'input' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Підпис поля вводу' : 'Input Label'}
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.input_label_uk}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, input_label_uk: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder={language === 'uk' ? 'Час (сек), Кількість...' : 'Time (sec), Count...'}
                  />
                </div>
              )}

              {/* Sets & Reps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Підходи' : 'Sets'}
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.sets_uk}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets_uk: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder="3 підходи"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'uk' ? 'Повторення' : 'Reps'}
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.reps_uk}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps_uk: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    placeholder="10 разів"
                  />
                </div>
              </div>

              {/* Rest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Відпочинок (сек)' : 'Rest (sec)'}
                </label>
                <input
                  type="number"
                  value={exerciseForm.rest_seconds}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, rest_seconds: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
              </div>

              {/* Description Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Опис (кроки)' : 'Description (steps)'}
                </label>
                {exerciseForm.description_uk.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="w-6 h-10 flex items-center justify-center text-sm text-gray-400">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateDescriptionStep(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      placeholder={language === 'uk' ? 'Крок...' : 'Step...'}
                    />
                    {exerciseForm.description_uk.length > 1 && (
                      <button
                        onClick={() => removeDescriptionStep(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addDescriptionStep}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'uk' ? 'Додати крок' : 'Add step'}
                </button>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'uk' ? 'Примітка' : 'Note'}
                </label>
                <textarea
                  value={exerciseForm.note_uk}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, note_uk: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none"
                  rows={2}
                  placeholder={language === 'uk' ? 'Додаткова інформація...' : 'Additional info...'}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveExercise}
                disabled={!exerciseForm.title_uk}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
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

export default DayEditorPage;

