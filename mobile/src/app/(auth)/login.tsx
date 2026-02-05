import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api/client';
import { useState } from 'react';
import { AuthData, ApiResponse } from '../../types';
import Colors from '@/constants/Colors';
import { FormInput } from '../../components/common/FormInput';
import { registerForPushNotificationsAsync } from '../../utils/notifications';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fcmToken: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError(null);
        try {
            // Get FCM token before login
            const fcmToken = await registerForPushNotificationsAsync();
            const loginData = { ...data, fcmToken };

            const response = await api.post<ApiResponse<AuthData>>('/auth/login', loginData);
            const authData = response.data.data;
            if (authData) {
                console.log(authData)
                await setAuth(authData.accessToken, authData.refreshToken || '', authData.role, authData.user!);
                router.replace('/(tabs)');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || '';
            if (err.response?.status === 403 && (message.toLowerCase().includes('unverified') || message.toLowerCase().includes('verify'))) {
                router.push({
                    pathname: '/verify-otp',
                    params: { email: data.email }
                });
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Mini Social</Text>
                    <Text style={styles.subtitle}>Welcome back!</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                label="Email"
                                placeholder="Enter your email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                label="Password"
                                placeholder="Enter your password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                isPassword
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: Colors.light.primary },
    subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#666' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 10 },
    button: { backgroundColor: Colors.light.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    errorText: { color: 'red', marginBottom: 10 },
    linkText: { color: Colors.light.primary, textAlign: 'center', marginTop: 20 },
});
