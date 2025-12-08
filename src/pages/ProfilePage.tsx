import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Globe, Bell, LogOut, ChevronRight, 
  Shield, HelpCircle, Mail, Check, Camera, Loader2,
  Eye, EyeOff, X, CreditCard, Cake
} from 'lucide-react';
import { Card, Avatar, Button, Input } from '@/components/ui';
import { NotificationSettings, FitnessTrackerSettings } from '@/components/settings';
import { SubscriptionManager } from '@/components/subscription';
import { useTranslation, languageOptions } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { Language } from '@/types/database';
import { cn } from '@/lib/utils';
import { getAgeCategory, AGE_CATEGORIES, formatAge, formatBirthDate } from '@/lib/ageCategories';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { profile, signOut, updateProfile } = useAuthStore();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit profile state
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editBirthDate, setEditBirthDate] = useState(profile?.birth_date || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Age category info
  const userAgeCategory = profile?.birth_date ? getAgeCategory(profile.birth_date) : null;
  const userAgeCategoryInfo = userAgeCategory ? AGE_CATEGORIES[userAgeCategory] : null;
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'profile.editSuccess': { uk: 'Профіль оновлено', en: 'Profile updated', cs: 'Profil aktualizován' },
      'profile.passwordSuccess': { uk: 'Пароль змінено', en: 'Password changed', cs: 'Heslo změněno' },
      'profile.passwordMismatch': { uk: 'Паролі не співпадають', en: 'Passwords do not match', cs: 'Hesla se neshodují' },
      'profile.passwordWeak': { uk: 'Пароль має бути мінімум 6 символів', en: 'Password must be at least 6 characters', cs: 'Heslo musí mít alespoň 6 znaků' },
      'profile.currentPassword': { uk: 'Поточний пароль', en: 'Current password', cs: 'Současné heslo' },
      'profile.newPassword': { uk: 'Новий пароль', en: 'New password', cs: 'Nové heslo' },
      'profile.confirmPassword': { uk: 'Підтвердіть пароль', en: 'Confirm password', cs: 'Potvrďte heslo' },
      'profile.privacy': { uk: 'Приватність', en: 'Privacy', cs: 'Soukromí' },
      'profile.showInLeaderboard': { uk: 'Показувати в рейтингу команди', en: 'Show in team leaderboard', cs: 'Zobrazit v žebříčku týmu' },
      'profile.uploadAvatar': { uk: 'Змінити фото', en: 'Change photo', cs: 'Změnit fotku' },
      'profile.name': { uk: "Ім'я", en: 'Name', cs: 'Jméno' },
      'profile.darkMode': { uk: 'Темна тема', en: 'Dark mode', cs: 'Tmavý režim' },
      'profile.lightMode': { uk: 'Світла тема', en: 'Light mode', cs: 'Světlý režim' },
      'profile.birthDate': { uk: 'Дата народження', en: 'Birth date', cs: 'Datum narození' },
      'profile.ageCategory': { uk: 'Вікова категорія', en: 'Age category', cs: 'Věková kategorie' },
      'profile.notSet': { uk: 'Не вказано', en: 'Not set', cs: 'Nenastaveno' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const updates: { full_name: string; birth_date?: string } = { 
      full_name: editName.trim() 
    };
    
    if (editBirthDate) {
      updates.birth_date = editBirthDate;
    }
    
    const { error } = await updateProfile(updates);
    
    if (error) {
      setError(error);
    } else {
      setSuccess(getText('profile.editSuccess'));
      setShowEditModal(false);
      setTimeout(() => setSuccess(null), 3000);
    }
    
    setIsLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      console.log('Upload result:', { uploadError, uploadData });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Update profile
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
      
      if (updateError) {
        throw new Error(updateError);
      }
      
      setSuccess(getText('profile.editSuccess'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar');
    }

    setUploadingAvatar(false);
  };

  const handleChangePassword = async () => {
    setError(null);
    
    if (newPassword.length < 6) {
      setError(getText('profile.passwordWeak'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(getText('profile.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(getText('profile.passwordSuccess'));
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    }

    setIsLoading(false);
  };

  const handleTogglePrivacy = async () => {
    const newValue = !profile?.show_in_leaderboard;
    console.log('Toggling privacy to:', newValue);
    const result = await updateProfile({ 
      show_in_leaderboard: newValue 
    });
    console.log('Update result:', result);
  };

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: t('profile.editProfile'),
      onClick: () => {
        setEditName(profile?.full_name || '');
        setShowEditModal(true);
      },
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: t('profile.language'),
      value: languageOptions.find(l => l.value === language)?.label,
      onClick: () => setShowLanguageModal(true),
    },
    {
      icon: profile?.show_in_leaderboard ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />,
      label: getText('profile.privacy'),
      value: profile?.show_in_leaderboard 
        ? (language === 'uk' ? 'Видимий' : language === 'cs' ? 'Viditelný' : 'Visible')
        : (language === 'uk' ? 'Прихований' : language === 'cs' ? 'Skrytý' : 'Hidden'),
      onClick: handleTogglePrivacy,
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: language === 'uk' ? 'Мої підписки' : language === 'cs' ? 'Moje předplatné' : 'My Subscriptions',
      onClick: () => navigate('/app/subscriptions'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: t('profile.changePassword'),
      onClick: () => setShowPasswordModal(true),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: language === 'uk' ? 'Допомога' : language === 'cs' ? 'Nápověda' : 'Help & Support',
      onClick: () => {},
    },
  ];

  const roleLabels = {
    player: t('auth.rolePlayer'),
    parent: t('auth.roleParent'),
    coach: t('auth.roleCoach'),
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-success-500" />
            <p className="text-success-700 text-sm flex-1">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="text-center p-6">
          <div className="relative inline-block">
            <Avatar 
              name={profile?.full_name}
              src={profile?.avatar_url}
              size="xl"
              className="mx-auto mb-2"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-2 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            {profile?.full_name || 'Guest'}
          </h2>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
            <Mail className="w-4 h-4" />
            {profile?.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {profile?.role ? roleLabels[profile.role] : 'User'}
            </span>
            {userAgeCategoryInfo && (
              <span 
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${userAgeCategoryInfo.color}20`, color: userAgeCategoryInfo.color }}
              >
                <span>{userAgeCategoryInfo.icon}</span>
                {userAgeCategoryInfo.label[language]}
              </span>
            )}
          </div>
          {profile?.birth_date && (
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
              <Cake className="w-4 h-4" />
              {formatAge(profile.birth_date, language)} • {formatBirthDate(profile.birth_date, language)}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <SubscriptionManager />
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {language === 'uk' ? 'Сповіщення' : language === 'cs' ? 'Oznámení' : 'Notifications'}
        </h3>
        {profile?.id && <NotificationSettings playerId={profile.id} />}
      </motion.div>

      {/* Fitness Trackers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          ⌚ {language === 'uk' ? 'Фітнес-трекери' : language === 'cs' ? 'Fitness trackery' : 'Fitness Trackers'}
        </h3>
        {profile?.id && <FitnessTrackerSettings playerId={profile.id} />}
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="font-bold text-gray-900 mb-3">{t('profile.settings')}</h3>
        <Card padding="none">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={cn(
                'w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors',
                index !== menuItems.length - 1 && 'border-b border-gray-100'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-500">{item.icon}</div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-sm text-gray-400">{item.value}</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </button>
          ))}
        </Card>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="danger"
          className="w-full"
          leftIcon={<LogOut className="w-5 h-5" />}
          onClick={handleSignOut}
        >
          {t('auth.logout')}
        </Button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-xs text-gray-400">
        Football Trainer Pro v1.0.0
      </p>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('profile.editProfile')}
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('profile.name')}
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={getText('profile.name')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('profile.birthDate')}
                  </label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min="1950-01-01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />
                  {editBirthDate && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>{AGE_CATEGORIES[getAgeCategory(editBirthDate)].icon}</span>
                      {getText('profile.ageCategory')}: {AGE_CATEGORIES[getAgeCategory(editBirthDate)].label[language]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveProfile}
                  disabled={!editName.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('profile.changePassword')}
                </h2>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('profile.newPassword')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getText('profile.confirmPassword')}
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPasswordModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleChangePassword}
                  disabled={!newPassword || !confirmPassword || isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowLanguageModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold text-center">{t('profile.language')}</h3>
              </div>
              <div className="p-2">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setLanguage(option.value as Language);
                      setShowLanguageModal(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl transition-colors',
                      language === option.value ? 'bg-primary-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.flag}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    {language === option.value && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowLanguageModal(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
