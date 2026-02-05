import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import api from '../../lib/api/client';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { FormInput } from '../../components/common/FormInput';
import { registerForPushNotificationsAsync } from '../../utils/notifications';

const signupSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'Password must contain at least one letter and one number'),
    phone: z.string().min(10, 'Valid phone number is required'),
    fcmToken: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupForm) => {
        setLoading(true);
        setError(null);
        try {
            const fcmToken = await registerForPushNotificationsAsync();
            await api.post('/auth/signup', { ...data, role: 'user', fcmToken });
            router.push({
                pathname: '/verify-otp',
                params: { email: data.email }
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join our community</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.name?.message}
                            />
                        )}
                    />

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
                        name="phone"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                            <FormInput
                                ref={ref}
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="phone-pad"
                                error={errors.phone?.message}
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
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/login')}>
                        <Text style={styles.linkText}>Already have an account? Login</Text>
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
