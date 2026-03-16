
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Alert,
    ScrollView // Adicionado para evitar que o teclado cubra os inputs
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    primary: '#1A73E8',
    secondary: '#1A2E4C',
    white: '#FFFFFF',
    background: '#F7F9FC',
};

// Validadores simples (você pode movê-los para o validators.js depois)
const nameValidator = (name) => {
    if (!name) return "O nome não pode estar vazio.";
    return '';
};

const emailValidator = (email) => {
    if (!email) return "O e-mail não pode estar vazio.";
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) return 'Ooops! Precisamos de um e-mail válido.';
    return '';
};

const passwordValidator = (password) => {
    if (!password) return "A senha não pode estar vazia.";
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    return '';
};

// Componente da tela de Criação
export default function CriacaoScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleCreateAccount = () => {
        // 1. Validar todos os campos
        const nameError = nameValidator(name);
        const emailError = emailValidator(email);
        const passwordError = passwordValidator(password);

        if (nameError || emailError || passwordError) {
            Alert.alert('Erro no Cadastro', nameError || emailError || passwordError);
            return;
        }

        // 2. Validar se as senhas coincidem
        if (password !== confirmPassword) {
            Alert.alert('Erro no Cadastro', 'As senhas não coincidem.');
            return;
        }

        // 3. Se tudo estiver OK, prossiga
        // (Aqui você chamaria o Firebase/API para criar o usuário)
        console.log('Conta criada com:', name, email, password);
        
        Alert.alert(
            'Sucesso!',
            'Sua conta foi criada. Você será redirecionado para o login.',
            [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]
        );
    };

    return (
        // Usamos ScrollView para que a tela role quando o teclado aparecer
        <ScrollView contentContainerStyle={styles.container}>
            
            <Text style={styles.title}>Crie sua Conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para começar.</Text>

            {/* Campo de Nome */}
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                />
            </View>

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
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            {/* Campo de Confirmar Senha */}
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#888" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Senha"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            {/* Botão de Criar Conta */}
            <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
                <Text style={styles.buttonText}>Criar Conta</Text>
            </TouchableOpacity>

            {/* Link para voltar ao Login */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Já tem uma conta? Faça Login</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

// Estilos (praticamente os mesmos do LoginScreen para consistência)
const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Importante para o ScrollView
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.primary,
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
        paddingBottom: 20, // Espaço extra no final
    }
});