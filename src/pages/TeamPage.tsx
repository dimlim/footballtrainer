// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Copy, Check, Trash2, LogOut, 
  Trophy, Flame, Target, ChevronRight, UserPlus,
  Loader2, X, AlertTriangle, Crown, Medal, Eye, EyeOff, ClipboardList, Activity, Calendar
} from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore, TeamMember } from '@/stores/teamStore';
import { TeamScheduleManager } from '@/components/schedule';
import { cn } from '@/lib/utils';

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile, updateProfile } = useAuthStore();
  const {
    teams,
    currentTeam,
    members,
    isLoading,
    error,
    loadCoachTeams,
    loadPlayerTeams,
    createTeam,
    deleteTeam,
    loadTeamMembers,
    removeMember,
    joinTeam,
    setCurrentTeam,
    clearError,
  } = useTeamStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'leaderboard' | 'schedule'>('team');

  const isCoach = profile?.role === 'coach';

  useEffect(() => {
    if (profile?.id) {
      if (isCoach) {
        loadCoachTeams(profile.id);
      } else {
        loadPlayerTeams(profile.id);
      }
    }
  }, [profile?.id, isCoach]);

  useEffect(() => {
    if (currentTeam) {
      loadTeamMembers(currentTeam.id);
    }
  }, [currentTeam?.id]);

  // Leaderboard sorted by XP
  const leaderboard = useMemo(() => {
    const visibleMembers = members.filter(m => {
      // Coach sees everyone
      if (isCoach) return true;
      // Player sees themselves always
      if (m.player_id === profile?.id) return true;
      // Player sees others only if they opted in
      return m.profile?.show_in_leaderboard !== false;
    });

    return [...visibleMembers].sort((a, b) => 
      (b.stats?.total_xp || 0) - (a.stats?.total_xp || 0)
    );
  }, [members, isCoach, profile?.id]);

  // Find current player's rank
  const myRank = useMemo(() => {
    const allSorted = [...members].sort((a, b) => 
      (b.stats?.total_xp || 0) - (a.stats?.total_xp || 0)
    );
    return allSorted.findIndex(m => m.player_id === profile?.id) + 1;
  }, [members, profile?.id]);

  const handleCreateTeam = async () => {
    if (!profile?.id || !newTeamName.trim()) return;
    
    const { team } = await createTeam(profile.id, newTeamName.trim());
    if (team) {
      setShowCreateModal(false);
      setNewTeamName('');
      setCurrentTeam(team);
    }
  };

  const handleJoinTeam = async () => {
    if (!profile?.id || !joinCode.trim()) return;
    
    const { error } = await joinTeam(profile.id, joinCode.trim());
    if (!error) {
      setShowJoinModal(false);
      setJoinCode('');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
    setShowDeleteConfirm(null);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
    setSelectedMember(null);
  };

  const handleToggleVisibility = async () => {
    if (!profile) return;
    await updateProfile({ show_in_leaderboard: !profile.show_in_leaderboard });
  };

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'team.title': { uk: 'Команда', en: 'Team', cs: 'Tým' },
      'team.myTeams': { uk: 'Мої команди', en: 'My Teams', cs: 'Moje týmy' },
      'team.createTeam': { uk: 'Створити команду', en: 'Create Team', cs: 'Vytvořit tým' },
      'team.joinTeam': { uk: 'Приєднатися', en: 'Join Team', cs: 'Připojit se' },
      'team.teamCode': { uk: 'Код команди', en: 'Team Code', cs: 'Kód týmu' },
      'team.members': { uk: 'Учасники', en: 'Members', cs: 'Členové' },
      'team.noMembers': { uk: 'Поки немає учасників', en: 'No members yet', cs: 'Zatím žádní členové' },
      'team.inviteHint': { uk: 'Поділіться кодом команди, щоб гравці могли приєднатися', en: 'Share team code for players to join', cs: 'Sdílejte kód týmu, aby se hráči mohli připojit' },
      'team.enterCode': { uk: 'Введіть код команди', en: 'Enter team code', cs: 'Zadejte kód týmu' },
      'team.teamName': { uk: 'Назва команди', en: 'Team name', cs: 'Název týmu' },
      'team.delete': { uk: 'Видалити команду', en: 'Delete Team', cs: 'Smazat tým' },
      'team.deleteConfirm': { uk: 'Ви впевнені? Всі дані команди буде видалено.', en: 'Are you sure? All team data will be deleted.', cs: 'Jste si jisti? Všechna data týmu budou smazána.' },
      'team.leave': { uk: 'Покинути команду', en: 'Leave Team', cs: 'Opustit tým' },
      'team.remove': { uk: 'Видалити з команди', en: 'Remove from team', cs: 'Odebrat z týmu' },
      'team.noTeams': { uk: 'У вас поки немає команд', en: 'You have no teams yet', cs: 'Zatím nemáte žádné týmy' },
      'team.noTeamsHint': { uk: 'Створіть команду або попросіть тренера надіслати код запрошення', en: 'Create a team or ask your coach for an invite code', cs: 'Vytvořte tým nebo požádejte trenéra o kód pozvánky' },
      'team.xp': { uk: 'XP', en: 'XP', cs: 'XP' },
      'team.streak': { uk: 'Серія', en: 'Streak', cs: 'Série' },
      'team.exercises': { uk: 'Вправ', en: 'Exercises', cs: 'Cviků' },
      'team.leaderboard': { uk: 'Рейтинг', en: 'Leaderboard', cs: 'Žebříček' },
      'team.yourRank': { uk: 'Твоя позиція', en: 'Your rank', cs: 'Tvoje pozice' },
      'team.privacy': { uk: 'Приватність', en: 'Privacy', cs: 'Soukromí' },
      'team.showStats': { uk: 'Показувати мої дані іншим', en: 'Show my stats to others', cs: 'Zobrazit mé statistiky ostatním' },
      'team.hidden': { uk: 'Приховано', en: 'Hidden', cs: 'Skryto' },
      'team.you': { uk: '(ти)', en: '(you)', cs: '(ty)' },
      'team.programs': { uk: 'Програми', en: 'Programs', cs: 'Programy' },
      'team.assignPrograms': { uk: 'Призначити програми', en: 'Assign Programs', cs: 'Přiřadit programy' },
      'team.schedule': { uk: 'Розклад', en: 'Schedule', cs: 'Rozvrh' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>;
  };

  if (isLoading && teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900">{getText('team.title')}</h1>
          <p className="text-gray-500 text-sm">{getText('team.myTeams')}</p>
        </div>
        <div className="flex gap-2">
          {isCoach ? (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              {getText('team.createTeam')}
            </Button>
          ) : (
            <Button onClick={() => setShowJoinModal(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-1" />
              {getText('team.joinTeam')}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teams List */}
      {teams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 mb-2">{getText('team.noTeams')}</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {getText('team.noTeamsHint')}
            </p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  currentTeam?.id === team.id && 'ring-2 ring-primary-500 border-primary-200'
                )}
                onClick={() => setCurrentTeam(currentTeam?.id === team.id ? null : team)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{team.name}</h3>
                      <p className="text-xs text-gray-500">
                        {getText('team.teamCode')}: <span className="font-mono font-bold">{team.code}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    currentTeam?.id === team.id && 'rotate-90'
                  )} />
                </div>

                {/* Expanded Team Details */}
                <AnimatePresence>
                  {currentTeam?.id === team.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-gray-100 space-y-4">
                        {/* Code Copy */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono text-lg font-bold text-center tracking-widest">
                            {team.code}
                          </div>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(team.code);
                            }}
                            className="shrink-0"
                          >
                            {copiedCode ? (
                              <Check className="w-4 h-4 text-success-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {getText('team.inviteHint')}
                        </p>

                        {/* Tabs */}
                        {(members.length > 0 || isCoach) && (
                          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveTab('team'); }}
                              className={cn(
                                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'team' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                              )}
                            >
                              {getText('team.members')}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveTab('leaderboard'); }}
                              className={cn(
                                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                                activeTab === 'leaderboard' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                              )}
                            >
                              {getText('team.leaderboard')}
                            </button>
                            {isCoach && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveTab('schedule'); }}
                                className={cn(
                                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1',
                                  activeTab === 'schedule' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                                )}
                              >
                                <Calendar className="w-4 h-4" />
                                {getText('team.schedule')}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Privacy Toggle for Players */}
                        {!isCoach && (
                          <div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              {profile?.show_in_leaderboard ? (
                                <Eye className="w-4 h-4 text-primary-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-700">{getText('team.showStats')}</span>
                            </div>
                            <button
                              onClick={handleToggleVisibility}
                              className={cn(
                                'w-12 h-6 rounded-full transition-colors relative',
                                profile?.show_in_leaderboard ? 'bg-primary-500' : 'bg-gray-300'
                              )}
                            >
                              <div className={cn(
                                'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                                profile?.show_in_leaderboard ? 'translate-x-6' : 'translate-x-0.5'
                              )} />
                            </button>
                          </div>
                        )}

                        {/* Your Rank (Player only) */}
                        {!isCoach && myRank > 0 && (
                          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-primary-100 text-sm">{getText('team.yourRank')}</p>
                                <p className="text-3xl font-black">#{myRank}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-primary-100 text-sm">XP</p>
                                <p className="text-2xl font-bold">
                                  {members.find(m => m.player_id === profile?.id)?.stats?.total_xp || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content */}
                        <div className="pt-2">
                          {/* Team Members Tab */}
                          {activeTab === 'team' && (
                            <>
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {getText('team.members')} ({members.length})
                              </h4>

                              {members.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">
                                  {getText('team.noMembers')}
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {members.map((member) => {
                                    const isMe = member.player_id === profile?.id;
                                    const canSee = isCoach || isMe || member.profile?.show_in_leaderboard !== false;
                                    
                                    return (
                                      <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isCoach) setSelectedMember(member);
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                            {member.profile?.full_name?.charAt(0) || '?'}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-900">
                                              {member.profile?.full_name || 'Unknown'}
                                              {isMe && <span className="text-primary-500 text-xs ml-1">{getText('team.you')}</span>}
                                            </p>
                                            {canSee ? (
                                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                  <Trophy className="w-3 h-3 text-amber-500" />
                                                  {member.stats?.total_xp || 0} XP
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Flame className="w-3 h-3 text-orange-500" />
                                                  {member.stats?.current_streak || 0}
                                                </span>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-400">{getText('team.hidden')}</p>
                                            )}
                                          </div>
                                        </div>
                                        {isCoach && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}

                          {/* Leaderboard Tab */}
                          {activeTab === 'leaderboard' && (
                            <>
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                {getText('team.leaderboard')}
                              </h4>

                              <div className="space-y-2">
                                {leaderboard.map((member, idx) => {
                                  const isMe = member.player_id === profile?.id;
                                  const rank = idx + 1;
                                  
                                  return (
                                    <div
                                      key={member.id}
                                      className={cn(
                                        'flex items-center justify-between p-3 rounded-xl',
                                        isMe ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50',
                                        rank <= 3 && 'border-2',
                                        rank === 1 && 'border-yellow-300 bg-yellow-50',
                                        rank === 2 && 'border-gray-300 bg-gray-100',
                                        rank === 3 && 'border-amber-300 bg-amber-50'
                                      )}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center gap-3">
                                        {getRankIcon(rank)}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                          {member.profile?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {member.profile?.full_name || 'Unknown'}
                                            {isMe && <span className="text-primary-500 text-xs ml-1">{getText('team.you')}</span>}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Flame className="w-3 h-3 text-orange-500" />
                                            {member.stats?.current_streak || 0} {getText('team.streak').toLowerCase()}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-lg text-gray-900">{member.stats?.total_xp || 0}</p>
                                        <p className="text-xs text-gray-500">XP</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {/* Schedule Tab (Coach only) */}
                          {activeTab === 'schedule' && isCoach && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <TeamScheduleManager teamId={team.id} />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                          {isCoach && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/app/coach/team/${team.id}/programs`);
                                }}
                              >
                                <ClipboardList className="w-4 h-4 mr-1" />
                                {getText('team.assignPrograms')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/app/coach/activity');
                                }}
                              >
                                <Activity className="w-4 h-4 mr-1" />
                                {getText('coach.activity')}
                              </Button>
                            </>
                          )}
                          <div className="flex gap-2">
                          {isCoach ? (
                            <Button
                              variant="danger"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(team.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {getText('team.delete')}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                // leaveTeam logic
                              }}
                            >
                              <LogOut className="w-4 h-4 mr-1" />
                              {getText('team.leave')}
                            </Button>
                          )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {getText('team.createTeam')}
              </h2>
              <Input
                placeholder={getText('team.teamName')}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateTeam}
                  disabled={!newTeamName.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {getText('team.joinTeam')}
              </h2>
              <Input
                placeholder={getText('team.enterCode')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="mb-4 font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowJoinModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleJoinTeam}
                  disabled={joinCode.length !== 6 || isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : getText('team.joinTeam')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {getText('team.delete')}
                </h2>
                <p className="text-gray-500 text-sm">
                  {getText('team.deleteConfirm')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDeleteTeam(showDeleteConfirm)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Details Modal (Coach only) */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
                  {selectedMember.profile?.full_name?.charAt(0) || '?'}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedMember.profile?.full_name || 'Unknown'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {selectedMember.profile?.email}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <div className="font-bold text-amber-700">{selectedMember.stats?.total_xp || 0}</div>
                  <div className="text-xs text-amber-600">{getText('team.xp')}</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="font-bold text-orange-700">{selectedMember.stats?.current_streak || 0}</div>
                  <div className="text-xs text-orange-600">{getText('team.streak')}</div>
                </div>
                <div className="bg-primary-50 rounded-xl p-3 text-center">
                  <Target className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <div className="font-bold text-primary-700">{selectedMember.stats?.total_exercises || 0}</div>
                  <div className="text-xs text-primary-600">{getText('team.exercises')}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedMember(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleRemoveMember(selectedMember.id)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : getText('team.remove')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
