import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Calendar, Clock, MapPin, Trophy,
  Edit2, Trash2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTranslation } from '@/lib/i18n';
import { 
  TeamSchedule, 
  TeamEvent,
  DayOfWeek,
  TrainingDayType,
  IntensityLevel,
  DAY_NAMES_FULL,
  TRAINING_DAY_TYPE_LABELS,
  TRAINING_DAY_TYPE_ICONS,
  INTENSITY_LABELS
} from '@/types/schedule';
import { format } from 'date-fns';

interface TeamScheduleManagerProps {
  teamId: string;
}

export const TeamScheduleManager: React.FC<TeamScheduleManagerProps> = ({ teamId }) => {
  const { language } = useTranslation();
  const { 
    teamSchedule, 
    teamEvents,
    loadTeamSchedule, 
    loadTeamEvents,
    addTeamScheduleEntry,
    updateTeamScheduleEntry,
    deleteTeamScheduleEntry,
    addTeamEvent,
    updateTeamEvent,
    deleteTeamEvent
  } = useScheduleStore();
  
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TeamSchedule | null>(null);
  const [editingEvent, setEditingEvent] = useState<TeamEvent | null>(null);
  
  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 1 as DayOfWeek,
    event_type: 'team_training' as TrainingDayType,
    start_time: '18:00',
    end_time: '19:30',
    title: '',
    description: '',
    location: '',
    intensity: 'medium' as IntensityLevel
  });
  
  const [eventForm, setEventForm] = useState({
    event_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '12:00',
    event_type: 'match_day' as TrainingDayType,
    title: '',
    description: '',
    location: '',
    opponent: '',
    intensity: 'high' as IntensityLevel
  });
  
  useEffect(() => {
    loadTeamSchedule(teamId);
    loadTeamEvents(teamId);
  }, [teamId]);
  
  const dayNames = DAY_NAMES_FULL[language as keyof typeof DAY_NAMES_FULL] || DAY_NAMES_FULL.en;
  const dayTypeLabels = TRAINING_DAY_TYPE_LABELS[language as keyof typeof TRAINING_DAY_TYPE_LABELS] || TRAINING_DAY_TYPE_LABELS.en;
  const intensityLabels = INTENSITY_LABELS[language as keyof typeof INTENSITY_LABELS] || INTENSITY_LABELS.en;
  
  const handleSaveSchedule = async () => {
    if (editingSchedule) {
      await updateTeamScheduleEntry(editingSchedule.id, {
        ...scheduleForm,
        team_id: teamId
      });
      setEditingSchedule(null);
    } else {
      await addTeamScheduleEntry({
        ...scheduleForm,
        team_id: teamId
      });
    }
    setShowAddSchedule(false);
    resetScheduleForm();
  };
  
  const handleSaveEvent = async () => {
    if (editingEvent) {
      await updateTeamEvent(editingEvent.id, {
        ...eventForm,
        team_id: teamId
      });
      setEditingEvent(null);
    } else {
      await addTeamEvent({
        ...eventForm,
        team_id: teamId
      });
    }
    setShowAddEvent(false);
    resetEventForm();
  };
  
  const handleEditSchedule = (schedule: TeamSchedule) => {
    setScheduleForm({
      day_of_week: schedule.day_of_week,
      event_type: schedule.event_type,
      start_time: schedule.start_time,
      end_time: schedule.end_time || '',
      title: schedule.title || '',
      description: schedule.description || '',
      location: schedule.location || '',
      intensity: schedule.intensity
    });
    setEditingSchedule(schedule);
    setShowAddSchedule(true);
  };
  
  const handleEditEvent = (event: TeamEvent) => {
    setEventForm({
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      event_type: event.event_type,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      opponent: event.opponent || '',
      intensity: event.intensity
    });
    setEditingEvent(event);
    setShowAddEvent(true);
  };
  
  const resetScheduleForm = () => {
    setScheduleForm({
      day_of_week: 1,
      event_type: 'team_training',
      start_time: '18:00',
      end_time: '19:30',
      title: '',
      description: '',
      location: '',
      intensity: 'medium'
    });
  };
  
  const resetEventForm = () => {
    setEventForm({
      event_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '10:00',
      end_time: '12:00',
      event_type: 'match_day',
      title: '',
      description: '',
      location: '',
      opponent: '',
      intensity: 'high'
    });
  };
  
  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      weeklySchedule: {
        uk: 'Тижневий розклад',
        en: 'Weekly Schedule',
        cs: 'Týdenní rozvrh'
      },
      events: {
        uk: 'Події та матчі',
        en: 'Events & Matches',
        cs: 'Události a zápasy'
      },
      addTraining: {
        uk: 'Додати тренування',
        en: 'Add Training',
        cs: 'Přidat trénink'
      },
      addEvent: {
        uk: 'Додати подію',
        en: 'Add Event',
        cs: 'Přidat událost'
      },
      dayOfWeek: {
        uk: 'День тижня',
        en: 'Day of Week',
        cs: 'Den v týdnu'
      },
      type: {
        uk: 'Тип',
        en: 'Type',
        cs: 'Typ'
      },
      time: {
        uk: 'Час',
        en: 'Time',
        cs: 'Čas'
      },
      title: {
        uk: 'Назва',
        en: 'Title',
        cs: 'Název'
      },
      location: {
        uk: 'Місце',
        en: 'Location',
        cs: 'Místo'
      },
      intensity: {
        uk: 'Інтенсивність',
        en: 'Intensity',
        cs: 'Intenzita'
      },
      date: {
        uk: 'Дата',
        en: 'Date',
        cs: 'Datum'
      },
      opponent: {
        uk: 'Суперник',
        en: 'Opponent',
        cs: 'Soupeř'
      },
      save: {
        uk: 'Зберегти',
        en: 'Save',
        cs: 'Uložit'
      },
      cancel: {
        uk: 'Скасувати',
        en: 'Cancel',
        cs: 'Zrušit'
      },
      noSchedule: {
        uk: 'Розклад ще не створено',
        en: 'No schedule yet',
        cs: 'Rozvrh ještě není vytvořen'
      },
      noEvents: {
        uk: 'Немає запланованих подій',
        en: 'No events scheduled',
        cs: 'Žádné naplánované události'
      }
    };
    return texts[key]?.[language] || texts[key]?.['en'] || key;
  };
  
  return (
    <div className="space-y-6">
      {/* Weekly Schedule Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getText('weeklySchedule')}
          </h3>
          <Button
            size="sm"
            onClick={() => {
              resetScheduleForm();
              setEditingSchedule(null);
              setShowAddSchedule(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            {getText('addTraining')}
          </Button>
        </div>
        
        {teamSchedule.length > 0 ? (
          <div className="space-y-2">
            {teamSchedule
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map(schedule => (
                <Card key={schedule.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {TRAINING_DAY_TYPE_ICONS[schedule.event_type]}
                      </span>
                      <div>
                        <div className="font-medium">
                          {dayNames[schedule.day_of_week]}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {schedule.start_time}
                          {schedule.end_time && ` - ${schedule.end_time}`}
                          {schedule.location && (
                            <>
                              <MapPin className="w-3 h-3 ml-2" />
                              {schedule.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTeamScheduleEntry(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            {getText('noSchedule')}
          </Card>
        )}
      </div>
      
      {/* Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getText('events')}
          </h3>
          <Button
            size="sm"
            onClick={() => {
              resetEventForm();
              setEditingEvent(null);
              setShowAddEvent(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            {getText('addEvent')}
          </Button>
        </div>
        
        {teamEvents.length > 0 ? (
          <div className="space-y-2">
            {teamEvents.map(event => (
              <Card key={event.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {TRAINING_DAY_TYPE_ICONS[event.event_type]}
                    </span>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(event.event_date), 'dd.MM.yyyy')}
                        {event.start_time && (
                          <>
                            <Clock className="w-3 h-3 ml-2" />
                            {event.start_time}
                          </>
                        )}
                        {event.opponent && (
                          <>
                            <Trophy className="w-3 h-3 ml-2" />
                            vs {event.opponent}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTeamEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            {getText('noEvents')}
          </Card>
        )}
      </div>
      
      {/* Add/Edit Schedule Modal */}
      <AnimatePresence>
        {showAddSchedule && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingSchedule ? 'Edit' : getText('addTraining')}
                </h3>
                <button onClick={() => setShowAddSchedule(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('dayOfWeek')}</label>
                  <select
                    value={scheduleForm.day_of_week}
                    onChange={(e) => setScheduleForm(f => ({ ...f, day_of_week: parseInt(e.target.value) as DayOfWeek }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map(day => (
                      <option key={day} value={day}>{dayNames[day]}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">{getText('time')} (start)</label>
                    <Input
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm(f => ({ ...f, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{getText('time')} (end)</label>
                    <Input
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm(f => ({ ...f, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('location')}</label>
                  <Input
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Stadium, Field..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('intensity')}</label>
                  <select
                    value={scheduleForm.intensity}
                    onChange={(e) => setScheduleForm(f => ({ ...f, intensity: e.target.value as IntensityLevel }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    {(['very_low', 'low', 'medium', 'high', 'very_high'] as IntensityLevel[]).map(level => (
                      <option key={level} value={level}>{intensityLabels[level]}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddSchedule(false)} className="flex-1">
                  {getText('cancel')}
                </Button>
                <Button onClick={handleSaveSchedule} className="flex-1">
                  <Save className="w-4 h-4 mr-1" />
                  {getText('save')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingEvent ? 'Edit' : getText('addEvent')}
                </h3>
                <button onClick={() => setShowAddEvent(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('title')}</label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Match vs Team..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('type')}</label>
                  <select
                    value={eventForm.event_type}
                    onChange={(e) => setEventForm(f => ({ ...f, event_type: e.target.value as TrainingDayType }))}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="match_day">{dayTypeLabels.match_day}</option>
                    <option value="team_training">{dayTypeLabels.team_training}</option>
                    <option value="match_prep">{dayTypeLabels.match_prep}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('date')}</label>
                  <Input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm(f => ({ ...f, event_date: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">{getText('time')} (start)</label>
                    <Input
                      type="time"
                      value={eventForm.start_time}
                      onChange={(e) => setEventForm(f => ({ ...f, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{getText('time')} (end)</label>
                    <Input
                      type="time"
                      value={eventForm.end_time}
                      onChange={(e) => setEventForm(f => ({ ...f, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                
                {eventForm.event_type === 'match_day' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">{getText('opponent')}</label>
                    <Input
                      value={eventForm.opponent}
                      onChange={(e) => setEventForm(f => ({ ...f, opponent: e.target.value }))}
                      placeholder="Team name..."
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">{getText('location')}</label>
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Stadium, Field..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddEvent(false)} className="flex-1">
                  {getText('cancel')}
                </Button>
                <Button onClick={handleSaveEvent} className="flex-1">
                  <Save className="w-4 h-4 mr-1" />
                  {getText('save')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamScheduleManager;

