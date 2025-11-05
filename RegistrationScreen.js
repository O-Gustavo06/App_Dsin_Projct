import React, { useState } from 'react'; // <--- CORRIGIDO: Removido o "/"
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform // <-- Importado para a sombra funcionar melhor
} from 'react-native';

export default function RegistrationScreen({ navigation }) {
    
    // Estados para guardar os dados do formulário
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Função de validação e cadastro
    const handleRegister = () => {
        // Validação básica
        // CORRIGIDO: Adicionado !cpf na checagem
        if (!email || !password || !confirmPassword || !cpf) {
            Alert.alert('Campos Incompletos', 'Por favor, preencha todos os campos.');
            return; 
        }

        if (password !== confirmPassword) {
            Alert.alert('Senhas não conferem', 'Os campos de senha e confirmação devem ser iguais.');
            return;
        }

        if (password.length < 6) {
             Alert.alert('Senha muito curta', 'Sua senha deve ter no mínimo 6 caracteres.');
            return;
        }
        
        // (Aqui você pode adicionar uma validação de CPF se quiser)

        Alert.alert('Sucesso!', 'Conta criada. Entrando...');
        
        navigation.navigate('Map');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Crie sua Conta</Text>
                
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="exemplo@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}           
                    onChangeText={setEmail}
                />

                <Text style={styles.label}>CPF</Text>
                <TextInput
                    style={styles.input} // <--- CORRIGIDO: de 'varchar' para 'input'
                    placeholder="Apenas números"
                    keyboardType="numeric" // <-- Adicionado para facilitar
                    maxLength={11} // <-- Adicionado limite
                    value={cpf}
                    onChangeText={setCpf} // <--- CORRIGIDO: de 'cpf' para 'setCpf'
                />
                
                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                
                <Text style={styles.label}>Confirmar Senha</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Repita sua senha"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                
                {/* "EMBELEZADO": Trocamos o <Button> por um <TouchableOpacity> 
                  para podermos customizar o estilo (cor, sombra, etc.)
                */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRegister}
                >
                    <Text style={styles.buttonText}>Cadastrar e Entrar</Text>
                </TouchableOpacity>

                {/* Botão secundário (link) para a futura tela de Login */}
                <TouchableOpacity 
                    style={styles.loginLink} 
                    onPress={() => Alert.alert("Em breve", "A tela de Login ainda será criada.")}
                >
                    <Text style={styles.loginLinkText}>Já tem uma conta? Faça login</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

// "EMBELEZADO": CSS com mais capricho
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fundo branco e limpo
    },
    container: {
        flex: 1,
        padding: 25, // Mais padding
        justifyContent: 'center',
    },
    title: {
        fontSize: 30, // Um pouco maior
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 35, // Mais espaço
        color: '#1A2E4C', // Cor do seu header
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8, // Mais espaço do label
        fontWeight: '500', // Um leve bold
    },
    input: {
        height: 55, // Um pouco mais alto
        borderColor: '#CCC', // Borda mais suave
        borderWidth: 1,
        borderRadius: 10, // Mais arredondado
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        marginBottom: 18, // Mais espaço entre inputs
        fontSize: 16,
        // Sombra sutil
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.62,
        elevation: 4,
    },
    // Estilo para o nosso novo botão
    button: {
        backgroundColor: '#1A2E4C', // Cor primária do app
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15, // Espaço acima do botão
        // Sombra do botão
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos do link de login
    loginLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 16,
        color: '#1A2E4C', 
        textDecorationLine: 'underline',
    }
});
