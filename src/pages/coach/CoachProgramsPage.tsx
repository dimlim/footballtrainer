// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Users, Eye, EyeOff, Calendar, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useCoachProgramStore, CustomProgram } from '@/stores/coachProgramStore';
import { categoryInfo, difficultyInfo } from '@/types/training';
import { cn } from '@/lib/utils';

export const CoachProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, getLocalizedText } = useTranslation();
  const { profile } = useAuthStore();
  const { programs, isLoading, loadCoachPrograms, deleteProgram, updateProgram } = useCoachProgramStore();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadCoachPrograms(profile.id);
    }
  }, [profile?.id, loadCoachPrograms]);

  const handleDelete = async (id: string) => {
    await deleteProgram(id);
    setDeleteConfirm(null);
  };

  const handleTogglePublic = async (program: CustomProgram) => {
    await updateProgram(program.id, { is_public: !program.is_public });
  };

  const getTitle = (program: CustomProgram) => {
    if (language === 'uk') return program.title_uk;
    if (language === 'cs') return program.title_cs || program.title_uk;
    return program.title_en || program.title_uk;
  };

  const getDescription = (program: CustomProgram) => {
    if (language === 'uk') return program.description_uk;
    if (language === 'cs') return program.description_cs || program.description_uk;
    return program.description_en || program.description_uk;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-black mb-1">
            {language === 'uk' ? 'Мої програми' : language === 'cs' ? 'Moje programy' : 'My Programs'}
          </h1>
          <p className="text-indigo-200 text-sm">
            {language === 'uk' ? 'Створюйте та керуйте тренувальними програмами' : language === 'cs' ? 'Vytvářejte a spravujte tréninkové programy' : 'Create and manage training programs'}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 -mt-4 space-y-4">
        {/* Create New Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            onClick={() => navigate('/app/coach/programs/new')}
            className="p-5 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-indigo-300 bg-indigo-50/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Plus className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">
                  {language === 'uk' ? 'Створити нову програму' : language === 'cs' ? 'Vytvořit nový program' : 'Create New Program'}
                </h3>
                <p className="text-sm text-indigo-600">
                  {language === 'uk' ? 'Додайте власну програму тренувань' : language === 'cs' ? 'Přidejte vlastní tréninkový program' : 'Add your own training program'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Programs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : programs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">
              {language === 'uk' ? 'У вас ще немає програм' : language === 'cs' ? 'Zatím nemáte žádné programy' : 'You have no programs yet'}
            </p>
          </motion.div>
        ) : (
          programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card className="overflow-hidden">
                {/* Program Header */}
                <div className={cn(
                  'p-4 bg-gradient-to-r',
                  program.category === 'explosiveness' && 'from-amber-500 to-orange-500',
                  program.category === 'endurance' && 'from-green-500 to-emerald-500',
                  program.category === 'technique' && 'from-blue-500 to-cyan-500',
                  program.category === 'strength' && 'from-red-500 to-rose-500',
                  program.category === 'agility' && 'from-purple-500 to-violet-500',
                  program.category === 'recovery' && 'from-teal-500 to-cyan-500',
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{program.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {getTitle(program)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {program.duration_days} {language === 'uk' ? 'днів' : 'days'}
                          </span>
                          {program.is_public ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-400/30 text-white flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {language === 'uk' ? 'Публічна' : 'Public'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-400/30 text-white flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              {language === 'uk' ? 'Приватна' : 'Private'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === program.id ? null : program.id);
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-white" />
                      </button>
                      
                      {menuOpen === program.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-10 py-1 min-w-[160px]">
                          <button
                            onClick={() => {
                              navigate(`/app/coach/programs/${program.id}`);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            {language === 'uk' ? 'Редагувати' : 'Edit'}
                          </button>
                          <button
                            onClick={() => {
                              handleTogglePublic(program);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {program.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {program.is_public 
                              ? (language === 'uk' ? 'Зробити приватною' : 'Make Private')
                              : (language === 'uk' ? 'Зробити публічною' : 'Make Public')
                            }
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm(program.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {language === 'uk' ? 'Видалити' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Program Details */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/app/coach/programs/${program.id}`)}
                >
                  {getDescription(program) && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {getDescription(program)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(program.created_at).toLocaleDateString(
                          language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US'
                        )}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                      {categoryInfo[program.category as keyof typeof categoryInfo]?.icon} {' '}
                      {getLocalizedText(categoryInfo[program.category as keyof typeof categoryInfo]?.label || { uk: program.category, en: program.category, cs: program.category })}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {language === 'uk' ? 'Видалити програму?' : 'Delete Program?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'uk' 
                ? 'Ця дія незворотна. Всі дні та вправи також будуть видалені.'
                : 'This action cannot be undone. All days and exercises will also be deleted.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
              >
                {language === 'uk' ? 'Скасувати' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                {language === 'uk' ? 'Видалити' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setMenuOpen(null)} 
        />
      )}
    </div>
  );
};

export default CoachProgramsPage;

