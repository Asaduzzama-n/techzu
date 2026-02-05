import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api/client';
import { AuthData, ApiResponse } from '../../types';
import Colors from '@/constants/Colors';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(120); // 2 minutes
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if last digit filled
        if (index === 5 && text) {
            // Optional: could trigger verify here, but button press is safer/clearer
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            Alert.alert('Error', 'Please enter a complete 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post<ApiResponse<AuthData>>('/auth/verify-account', {
                email,
                oneTimeCode: otpString,
                type: 'account_activation'
            });

            const authData = response.data.data;
            if (authData) {
                await setAuth(authData.accessToken, authData.refreshToken || '', authData.role, authData.user!);
                Alert.alert('Success', 'Account verified successfully!');
                router.replace('/(tabs)');
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResendLoading(true);
        try {
            await api.post('/auth/resend-otp', {
                email,
                type: 'account_activation'
            });
            Alert.alert('Success', 'A new OTP has been sent to your email.');
            setTimer(120);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref }}
                                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        {timer > 0 ? (
                            <Text style={styles.timerText}>Resend OTP in {formatTime(timer)}</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                {resendLoading ? (
                                    <ActivityIndicator color={Colors.light.primary} />
                                ) : (
                                    <Text style={styles.resendText}>Resend OTP</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: Colors.light.primary },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 10
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#f9f9f9',
        color: '#333'
    },
    otpInputFilled: {
        borderColor: Colors.light.primary,
        backgroundColor: '#fff'
    },
    button: { backgroundColor: Colors.light.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    disabledButton: { backgroundColor: '#666' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resendContainer: { marginTop: 30, alignItems: 'center' },
    timerText: { color: '#666', fontSize: 14 },
    resendText: { color: Colors.light.primary, fontSize: 16, fontWeight: 'bold' },
});
