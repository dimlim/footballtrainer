// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Users, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { useCoachProgramStore, CustomProgram } from '@/stores/coachProgramStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface TeamAssignment {
  id: string;
  team_id: string;
  program_id: string;
  assigned_at: string;
  is_active: boolean;
}

export const TeamProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { currentTeam, loadTeamMembers } = useTeamStore();
  const { programs, loadCoachPrograms } = useCoachProgramStore();
  
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadCoachPrograms(profile.id);
    }
    if (teamId) {
      loadAssignments();
    }
  }, [profile?.id, teamId]);

  const loadAssignments = async () => {
    if (!teamId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('team_program_assignments')
      .select('*')
      .eq('team_id', teamId);

    if (!error && data) {
      setAssignments(data);
    }
    setIsLoading(false);
  };

  const assignProgram = async (programId: string) => {
    if (!teamId || !profile?.id) return;

    const { error } = await supabase
      .from('team_program_assignments')
      .insert({
        team_id: teamId,
        program_id: programId,
        assigned_by: profile.id,
      });

    if (!error) {
      await loadAssignments();
      setShowAssignModal(false);
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    if (!window.confirm(language === 'uk' ? 'Видалити призначення?' : 'Remove assignment?')) {
      return;
    }

    const { error } = await supabase
      .from('team_program_assignments')
      .delete()
      .eq('id', assignmentId);

    if (!error) {
      await loadAssignments();
    }
  };

  const getTitle = (program: CustomProgram) => {
    if (language === 'uk') return program.title_uk;
    if (language === 'cs') return program.title_cs || program.title_uk;
    return program.title_en || program.title_uk;
  };

  const assignedProgramIds = new Set(assignments.map(a => a.program_id));
  const availablePrograms = programs.filter(p => !assignedProgramIds.has(p.id));
  const assignedPrograms = programs.filter(p => assignedProgramIds.has(p.id));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/app/team')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">
              {language === 'uk' ? 'Програми команди' : 'Team Programs'}
            </h1>
            <p className="text-sm text-gray-500">
              {currentTeam?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Assign Button */}
        <button
          onClick={() => setShowAssignModal(true)}
          className="w-full p-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'uk' ? 'Призначити програму' : 'Assign Program'}
        </button>

        {/* Assigned Programs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : assignedPrograms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>{language === 'uk' ? 'Немає призначених програм' : 'No programs assigned'}</p>
          </div>
        ) : (
          assignedPrograms.map((program) => {
            const assignment = assignments.find(a => a.program_id === program.id);
            
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                      'bg-gradient-to-br from-indigo-100 to-purple-100'
                    )}>
                      {program.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {getTitle(program)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {program.duration_days} {language === 'uk' ? 'днів' : 'days'}
                      </p>
                    </div>
                    <button
                      onClick={() => assignment && removeAssignment(assignment.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-lg">
                {language === 'uk' ? 'Оберіть програму' : 'Select Program'}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {availablePrograms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{language === 'uk' ? 'Всі програми вже призначені' : 'All programs already assigned'}</p>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      navigate('/app/coach/programs/new');
                    }}
                    className="mt-4 text-indigo-600 font-medium"
                  >
                    {language === 'uk' ? 'Створити нову програму' : 'Create New Program'}
                  </button>
                </div>
              ) : (
                availablePrograms.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => assignProgram(program.id)}
                    className="w-full p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{program.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{getTitle(program)}</h4>
                      <p className="text-sm text-gray-500">
                        {program.duration_days} {language === 'uk' ? 'днів' : 'days'}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamProgramsPage;

