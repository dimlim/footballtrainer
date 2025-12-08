import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Trophy, Users, Clipboard, ChevronLeft } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/lib/i18n';
import type { UserRole } from '@/types/database';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const roles: { value: UserRole; icon: React.ReactNode; labelKey: string; descKey: string }[] = [
  { 
    value: 'player', 
    icon: <Trophy className="w-6 h-6" />, 
    labelKey: 'auth.rolePlayer',
    descKey: 'auth.rolePlayerDesc',
  },
  { 
    value: 'parent', 
    icon: <Users className="w-6 h-6" />, 
    labelKey: 'auth.roleParent',
    descKey: 'auth.roleParentDesc',
  },
  { 
    value: 'coach', 
    icon: <Clipboard className="w-6 h-6" />, 
    labelKey: 'auth.roleCoach',
    descKey: 'auth.roleCoachDesc',
  },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { signUp, isLoading } = useAuthStore();
  
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleBack = () => {
    setStep('role');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    const result = await signUp(email, password, fullName, selectedRole);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.registerTitle')}
              </h1>
              <p className="text-gray-500">
                {t('auth.selectRole')}
              </p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <Card
                  key={role.value}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary-300 hover:shadow-md',
                    'flex items-center gap-4 p-4'
                  )}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {t(role.labelKey as any)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t(role.descKey as any)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              {t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                {t('auth.login')}
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{t('common.back')}</span>
            </button>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.registerTitle')}
              </h1>
              <p className="text-gray-500">
                {t(`auth.role${selectedRole?.charAt(0).toUpperCase()}${selectedRole?.slice(1)}` as any)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <Input
                type="text"
                label={t('auth.fullName')}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-5 h-5" />}
                autoComplete="name"
              />

              <Input
                type="email"
                label={t('auth.email')}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                autoComplete="email"
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
                autoComplete="new-password"
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label={t('auth.confirmPassword')}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {t('auth.createAccount')}
              </Button>

              <p className="text-center text-gray-500 text-sm">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {t('auth.login')}
                </button>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

