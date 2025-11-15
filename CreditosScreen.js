// CreditosScreen.js
import React, { useState } from 'react'; // 1. Importei o useState
import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView, 
    TouchableOpacity, 
    StatusBar,
    TextInput, // 2. Importei o TextInput
    Alert // 3. Importei o Alert para validar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Cores (pode importar de um arquivo global se tiver)
const COLORS = {
    primary: '#1A73E8',
    secondary: '#1A2E4C',
    white: '#FFFFFF',
    background: '#F7F9FC',
};

export default function CreditosScreen({ navigation }) {
    
    // 4. Criei um estado para guardar o valor personalizado
    const [customAmount, setCustomAmount] = useState('');

    const handlePurchase = (amount) => {
        // Converte o número para formato de moeda BRL (ex: R$ 5,00)
        const formattedAmount = Number(amount).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });

        console.log('Comprar', formattedAmount);
        Alert.alert(
            'Compra Simulada',
            `Simulação de compra de ${formattedAmount}`
        );
    };

    // 5. Nova função para lidar com o valor personalizado
    const handleCustomPurchase = () => {
        // Substitui vírgula por ponto e converte para número
        const amount = parseFloat(customAmount.replace(',', '.'));

        // Validação
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Valor Inválido', 'Por favor, insira um valor numérico válido.');
            return;
        }

        // Se for válido, chama a função de compra
        handlePurchase(amount);
        setCustomAmount(''); // Limpa o campo após a compra
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comprar Créditos</Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.balanceText}>Seu saldo atual: R$ 5,00</Text>
                
                <Text style={styles.sectionTitle}>Escolha um valor rápido:</Text>
                
                {/* CORREÇÃO: Corrigi os valores que a função recebia */}
                <TouchableOpacity style={styles.optionButton} onPress={() => handlePurchase(5)}>
                    <Text style={styles.optionText}>R$ 5,00</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.optionButton} onPress={() => handlePurchase(10)}>
                    <Text style={styles.optionText}>R$ 10,00</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton} onPress={() => handlePurchase(20)}>
                    <Text style={styles.optionText}>R$ 20,00</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton} onPress={() => handlePurchase(50)}>
                    <Text style={styles.optionText}>R$ 50,00</Text>
                </TouchableOpacity>
                
                {/* --- 6. NOVA SEÇÃO PARA VALOR PERSONALIZADO --- */}
                
                <Text style={styles.sectionTitle}> Adicione uma valor especifico(R$):</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Ex: 15,00"
                    keyboardType="numeric" // Abre o teclado numérico
                    value={customAmount}
                    onChangeText={setCustomAmount}
                />

                <TouchableOpacity style={styles.customButton} onPress={handleCustomPurchase}>
                    <Text style={styles.customButtonText}>Comprar Valor Inserido</Text>
                </TouchableOpacity>
                
                {/* CORREÇÃO: Removi o botão em branco que estava aqui */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: COLORS.secondary,
        height: 100,
    },
    backButton: {
        position: 'absolute',
        left: 25,
        top: 40,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 50,
    },
    balanceText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 15,
        color: '#555',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    optionButton: {
        backgroundColor: COLORS.white,
        padding: 11,
        borderRadius: 10,
        borderWidth: 0,
        borderColor: '#DDD',
        marginBottom: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },

    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 18,
        textAlign: 'center',
        color: '#333',
        marginBottom: 15,
    },
    customButton: {
        backgroundColor: COLORS.primary, 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
    },
    customButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.white,
    },
});