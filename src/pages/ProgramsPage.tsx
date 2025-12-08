import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Calendar, ChevronRight, Zap, Plus, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgramStore, Program } from '@/stores/programStore';
import { usePlayerProgramStore } from '@/stores/playerProgramStore';
import { categoryInfo, difficultyInfo, ProgramCategory, ProgramDifficulty } from '@/types/training';
import { cn } from '@/lib/utils';

// Default images for categories
const categoryImages: Record<string, string> = {
  explosiveness: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  endurance: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  technique: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  strength: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  agility: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
};

export const ProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { programs, isLoading, loadPrograms } = useProgramStore();
  const { playerPrograms, loadPlayerPrograms, addProgram, removeProgram, hasProgram } = usePlayerProgramStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProgramDifficulty | 'all'>('all');
  const [addingProgram, setAddingProgram] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
    if (profile?.id) {
      loadPlayerPrograms(profile.id);
    }
  }, [loadPrograms, loadPlayerPrograms, profile?.id]);

  // Get localized text
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'title': { uk: 'Програми тренувань', en: 'Training Programs', cs: 'Tréninkové programy' },
      'subtitle': { uk: 'Обери програму та почни тренуватись', en: 'Choose a program and start training', cs: 'Vyber program a začni trénovat' },
      'search': { uk: 'Пошук програм...', en: 'Search programs...', cs: 'Hledat programy...' },
      'category': { uk: 'Категорія', en: 'Category', cs: 'Kategorie' },
      'level': { uk: 'Рівень', en: 'Level', cs: 'Úroveň' },
      'all': { uk: 'Всі', en: 'All', cs: 'Vše' },
      'allLevels': { uk: 'Всі рівні', en: 'All levels', cs: 'Všechny úrovně' },
      'noPrograms': { uk: 'Програм не знайдено', en: 'No programs found', cs: 'Žádné programy nenalezeny' },
      'days': { uk: 'днів', en: 'days', cs: 'dní' },
      'add': { uk: 'Додати', en: 'Add', cs: 'Přidat' },
      'added': { uk: 'Додано', en: 'Added', cs: 'Přidáno' },
      'back': { uk: 'Назад', en: 'Back', cs: 'Zpět' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  // Get program title
  const getProgramTitle = (program: Program) => {
    if (language === 'uk') return program.title_uk;
    if (language === 'cs') return program.title_cs || program.title_uk;
    return program.title_en || program.title_uk;
  };

  // Get program description
  const getProgramDescription = (program: Program) => {
    if (language === 'uk') return program.description_uk || '';
    if (language === 'cs') return program.description_cs || program.description_uk || '';
    return program.description_en || program.description_uk || '';
  };

  // Filter programs
  const filteredPrograms = useMemo(() => {
    let filtered = programs;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        getProgramTitle(p).toLowerCase().includes(query) ||
        getProgramDescription(p).toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }
    
    return filtered;
  }, [programs, searchQuery, selectedCategory, selectedDifficulty, language]);

  const categories: (ProgramCategory | 'all')[] = ['all', 'explosiveness', 'endurance', 'technique', 'strength', 'agility', 'recovery'];
  
  const getCategoryLabel = (cat: ProgramCategory | 'all') => {
    if (cat === 'all') return getText('all');
    const info = categoryInfo[cat];
    if (language === 'uk') return info.label.uk;
    if (language === 'cs') return info.label.cs;
    return info.label.en;
  };

  const getDifficultyLabel = (diff: ProgramDifficulty | 'all') => {
    if (diff === 'all') return getText('allLevels');
    const info = difficultyInfo[diff];
    if (language === 'uk') return info.label.uk;
    if (language === 'cs') return info.label.cs;
    return info.label.en;
  };

  // Handle add/remove program
  const handleToggleProgram = async (e: React.MouseEvent, program: Program) => {
    e.stopPropagation();
    if (!profile?.id || addingProgram) return;

    setAddingProgram(program.id);
    
    if (hasProgram(program.id)) {
      await removeProgram(profile.id, program.id);
    } else {
      await addProgram(profile.id, program.id);
    }
    
    setAddingProgram(null);
  };

  const handleProgramClick = (program: Program) => {
    navigate(`/app/program/${program.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-primary-100 mb-3 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {getText('back')}
          </button>
          <h1 className="text-2xl font-black mb-2">{getText('title')}</h1>
          <p className="text-primary-100 text-sm">{getText('subtitle')}</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getText('search')}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-primary-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            {/* Categories */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {getText('category')}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {cat !== 'all' && <span>{categoryInfo[cat].icon}</span>}
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {getText('level')}
              </p>
              <div className="flex gap-2">
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedDifficulty === diff
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {getDifficultyLabel(diff)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Programs List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">{getText('noPrograms')}</p>
          </motion.div>
        ) : (
          filteredPrograms.map((program, index) => {
            const isAdded = hasProgram(program.id);
            const isAddingThis = addingProgram === program.id;
            
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card
                  onClick={() => handleProgramClick(program)}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                  padding="none"
                >
                  {/* Program Header with Image */}
                  <div className="relative h-44 overflow-hidden">
                    {/* Background Image */}
                    <img 
                      src={program.cover_image || categoryImages[program.category]} 
                      alt={getProgramTitle(program)}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl drop-shadow-lg">{program.icon || '⚽'}</span>
                          <div>
                            <h3 className="text-xl font-black text-white drop-shadow-lg">
                              {getProgramTitle(program)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
                                program.difficulty === 'beginner' && 'bg-green-500/80 text-white',
                                program.difficulty === 'intermediate' && 'bg-amber-500/80 text-white',
                                program.difficulty === 'advanced' && 'bg-red-500/80 text-white',
                              )}>
                                {getDifficultyLabel(program.difficulty as ProgramDifficulty)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {getProgramDescription(program)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{program.duration_days} {getText('days')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          <span>{getCategoryLabel(program.category as ProgramCategory)}</span>
                        </div>
                      </div>
                      
                      {/* Add/Remove Button */}
                      <button
                        onClick={(e) => handleToggleProgram(e, program)}
                        disabled={isAddingThis}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          isAdded
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        )}
                      >
                        {isAddingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            {getText('added')}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            {getText('add')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;
