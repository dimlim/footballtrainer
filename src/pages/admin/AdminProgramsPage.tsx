// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, MoreVertical, Shield, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgramStore, Program } from '@/stores/programStore';
import { categoryInfo } from '@/types/training';
import { cn } from '@/lib/utils';

export const AdminProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, getLocalizedText } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    programs, 
    allRequests,
    isAdmin,
    isLoading, 
    loadPrograms, 
    loadAllRequests,
    checkAdminStatus,
    deleteProgram, 
    updateProgram,
    updateRequestStatus,
  } = useProgramStore();
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'requests'>('programs');

  useEffect(() => {
    if (profile?.id) {
      checkAdminStatus(profile.id);
      loadPrograms();
      loadAllRequests();
    }
  }, [profile?.id]);

  // If not admin, show access denied
  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center py-12">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'uk' ? 'Доступ заборонено' : 'Access Denied'}
          </h2>
          <p className="text-gray-500">
            {language === 'uk' 
              ? 'Тільки адміністратори можуть керувати програмами'
              : 'Only administrators can manage programs'}
          </p>
        </Card>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    await deleteProgram(id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (program: Program) => {
    await updateProgram(program.id, { is_active: !program.is_active });
  };

  const handleToggleFeatured = async (program: Program) => {
    await updateProgram(program.id, { is_featured: !program.is_featured });
  };

  const getTitle = (program: Program) => {
    if (language === 'uk') return program.title_uk;
    if (language === 'cs') return program.title_cs || program.title_uk;
    return program.title_en || program.title_uk;
  };

  const pendingRequests = allRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium text-violet-200">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-black mb-1">
            {language === 'uk' ? 'Управління програмами' : 'Program Management'}
          </h1>
          <p className="text-violet-200 text-sm">
            {language === 'uk' ? 'Створюйте та керуйте тренувальними програмами' : 'Create and manage training programs'}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('programs')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'programs' ? 'bg-violet-100 text-violet-700' : 'text-gray-500'
            )}
          >
            {language === 'uk' ? 'Програми' : 'Programs'} ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors relative',
              activeTab === 'requests' ? 'bg-violet-100 text-violet-700' : 'text-gray-500'
            )}
          >
            {language === 'uk' ? 'Запити' : 'Requests'}
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'programs' && (
          <>
            {/* Create New Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                onClick={() => navigate('/admin/programs/new')}
                className="p-5 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-violet-300 bg-violet-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
                    <Plus className="w-7 h-7 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-violet-900">
                      {language === 'uk' ? 'Створити нову програму' : 'Create New Program'}
                    </h3>
                    <p className="text-sm text-violet-600">
                      {language === 'uk' ? 'Додайте нову тренувальну програму' : 'Add a new training program'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Programs List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : programs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500">
                  {language === 'uk' ? 'Ще немає програм' : 'No programs yet'}
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
                  <Card className={cn('overflow-hidden', !program.is_active && 'opacity-60')}>
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
                              {program.is_featured && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400/30 text-white flex items-center gap-1">
                                  <Star className="w-3 h-3" fill="currentColor" />
                                  Featured
                                </span>
                              )}
                              {!program.is_active && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-400/30 text-white">
                                  {language === 'uk' ? 'Неактивна' : 'Inactive'}
                                </span>
                              )}
                              {program.is_premium && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/30 text-white">
                                  💎 Premium
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
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-10 py-1 min-w-[180px]">
                              <button
                                onClick={() => {
                                  navigate(`/admin/programs/${program.id}`);
                                  setMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                {language === 'uk' ? 'Редагувати' : 'Edit'}
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleActive(program);
                                  setMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                {program.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {program.is_active 
                                  ? (language === 'uk' ? 'Деактивувати' : 'Deactivate')
                                  : (language === 'uk' ? 'Активувати' : 'Activate')
                                }
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleFeatured(program);
                                  setMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Star className="w-4 h-4" />
                                {program.is_featured 
                                  ? (language === 'uk' ? 'Зняти з Featured' : 'Remove Featured')
                                  : (language === 'uk' ? 'Зробити Featured' : 'Make Featured')
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
                      onClick={() => navigate(`/admin/programs/${program.id}`)}
                    >
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                          {categoryInfo[program.category as keyof typeof categoryInfo]?.icon} {' '}
                          {getLocalizedText(categoryInfo[program.category as keyof typeof categoryInfo]?.label)}
                        </span>
                        <span className="text-xs">
                          {new Date(program.created_at).toLocaleDateString(
                            language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US'
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {allRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {language === 'uk' ? 'Немає запитів' : 'No requests'}
                </p>
              </motion.div>
            ) : (
              allRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{request.title}</h3>
                        {request.description && (
                          <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        )}
                      </div>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        request.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                        request.status === 'approved' && 'bg-green-100 text-green-700',
                        request.status === 'rejected' && 'bg-red-100 text-red-700',
                        request.status === 'completed' && 'bg-blue-100 text-blue-700',
                      )}>
                        {request.status}
                      </span>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                        >
                          {language === 'uk' ? 'Схвалити' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                        >
                          {language === 'uk' ? 'Відхилити' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))
            )}
          </>
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
                ? 'Ця дія незворотна. Всі дані програми буде видалено.'
                : 'This action cannot be undone. All program data will be deleted.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium hover:bg-gray-50"
              >
                {language === 'uk' ? 'Скасувати' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
              >
                {language === 'uk' ? 'Видалити' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
};

export default AdminProgramsPage;

