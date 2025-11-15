// LoginScreen.js
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TextInput, 
    TouchableOpacity, 
    Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importando ícones
import { emailValidator, passwordValidator } from './validators.js'; // Importando nossos validadores

// As cores que você definiu no seu App.js, para manter a consistência
const COLORS = {
    primary: '#1A73E8',
    secondary: '#1A2E4C',
    white: '#FFFFFF',
    background: '#F7F9FC',
};

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // 1. Validar os inputs
        const emailError = emailValidator(email);
        const passwordError = passwordValidator(password);

        if (emailError || passwordError) {
            Alert.alert('Erro no Login', emailError || passwordError);
            return; // Para a execução se houver erro
        }

        // 2. Se tudo estiver OK, navega para a Home
        // (Aqui é onde você, no futuro, chamaria o Firebase ou sua API)
        console.log('Login com:', email, password);
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            {/* Logo Simples */}
            <Ionicons name="car-sport-outline" size={80} color={COLORS.primary} />
            
            <Text style={styles.title}>On Park</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

            {/* Campo de E-mail */}
            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            {/* Campo de Senha */}
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    secureTextEntry={true} // Para esconder a senha
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            {/* Botão de Login */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            {/* Links Finais */}
            <TouchableOpacity onPress={() => Alert.alert('WIP', 'Tela de "Esqueci a senha" em construção.')}>
                <Text style={styles.linkText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            {/* Criação da conta */}
            <TouchableOpacity onPress={() => navigation.navigate('Criacao')}>
                <Text style={styles.linkText}>Criar sua conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background, // Cor de fundo
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.secondary, 
        marginTop: 10,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        width: '100%',
        height: 50,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: COLORS.primary, // Cor principal
        width: '100%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: COLORS.primary,
        marginTop: 20,
        fontSize: 14,
    }
});