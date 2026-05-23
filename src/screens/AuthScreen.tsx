import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import type { AuthUser } from '../api/auth';
import { login, register } from '../api/auth';
import { AuthTextField } from '../components/AuthTextField';
import { LogoMark } from '../components/LogoMark';
import { colors } from '../theme/colors';

type Tab = 'login' | 'register';

type Props = {
  onAuthenticated: (user: AuthUser) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  async function handleSubmit() {
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const user =
        tab === 'login'
          ? await login(email.trim(), password)
          : await register(
              name.trim(),
              email.trim(),
              password,
              passwordConfirmation,
            );
      onAuthenticated(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LogoMark />
          <Text style={styles.welcome}>
            Welcome back! Log in to find your next task.
          </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, tab === 'login' && styles.tabActive]}
                onPress={() => {
                  setTab('login');
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === 'login' && styles.tabTextActive,
                  ]}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === 'register' && styles.tabActive]}
                onPress={() => {
                  setTab('register');
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === 'register' && styles.tabTextActive,
                  ]}
                >
                  Register
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {tab === 'register' ? (
              <AuthTextField
                label="Full Name"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Jane Doe"
                autoCapitalize="words"
                textContentType="name"
              />
            ) : null}

            <AuthTextField
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <AuthTextField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder={tab === 'register' ? 'At least 8 characters' : '••••••••'}
              secure
              rightLabel={tab === 'login' ? 'Forgot Password?' : undefined}
              onRightLabelPress={() => {}}
              textContentType={tab === 'login' ? 'password' : 'newPassword'}
            />

            {tab === 'register' ? (
              <AuthTextField
                label="Confirm Password"
                icon="lock-closed-outline"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="Repeat your password"
                secure
                textContentType="newPassword"
              />
            ) : null}

            <Pressable
              style={styles.termsRow}
              onPress={() => setTermsAccepted((v) => !v)}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
              >
                {termsAccepted ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </Pressable>

            <Pressable
              style={[styles.submit, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {tab === 'login' ? 'Log In' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </Pressable>

            <Text style={styles.footer}>
              Quest responsibly. T-Quest is a secure marketplace for errands and
              freelance tasks.
            </Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textMuted,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.tabBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.card,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.text,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  termsLink: {
    color: colors.text,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: colors.textLight,
  },
});
