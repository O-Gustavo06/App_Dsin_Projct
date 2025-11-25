// src/screens/Tickets/TicketsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Keyboard,
  Modal,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import COLORS from '../../styles/colors';
import { getWallet, addBalance } from '../../services/PaymentApi';

const BALANCE_KEY = '@user_balance';
const USER_ID = 1;

// UTIL: formata moeda
const formatBRL = (v = 0) => Number(v).toFixed(2).replace('.', ',');

export default function TicketsScreen({ navigation }) {
  const [customAmount, setCustomAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment modal state
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' | 'credit' | 'debit'

  // PIX state
  const [pixCode, setPixCode] = useState(null);
  const [pixPaid, setPixPaid] = useState(false);

  // Card state (fake)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // local first
        const rawLocal = await AsyncStorage.getItem(BALANCE_KEY);
        if (rawLocal !== null) {
          const val = Number(rawLocal);
          setUserBalance(isNaN(val) ? 0 : val);
        }

        // try remote
        try {
          const wallet = await getWallet(USER_ID);
          if (wallet && typeof wallet.balance !== 'undefined') {
            const remoteBalance = Number(wallet.balance);
            setUserBalance(remoteBalance);
            await AsyncStorage.setItem(BALANCE_KEY, String(remoteBalance));
          }
        } catch (err) {
          // API might be not configured; keep local
          // console.log('Wallet API unreachable', err.message || err);
        }
      } catch (err) {
        setUserBalance(0);
      }
    })();
  }, []);

  // helper to persist local and optionally call API (via addBalance)
  const applyBalanceIncrease = async (amount) => {
    setIsProcessing(true);
    try {
      try {
        // try via API
        const resp = await addBalance(USER_ID, amount);
        const newBalance = Number(resp.balance);
        setUserBalance(newBalance);
        await AsyncStorage.setItem(BALANCE_KEY, String(newBalance));
      } catch (apiErr) {
        // fallback local
        const newLocal = Math.round((userBalance + amount) * 100) / 100;
        setUserBalance(newLocal);
        await AsyncStorage.setItem(BALANCE_KEY, String(newLocal));
      }
      Alert.alert('Sucesso', `R$ ${formatBRL(amount)} adicionados ao saldo.`);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível adicionar créditos.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick add handlers
  const handleQuickAdd = (v) => {
    setSelectedAmount(v);
    setPaymentMethod('pix'); // default
    setPayModalVisible(true);
  };

  const handleCustomAdd = () => {
    const parsed = parseFloat(customAmount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Valor inválido', 'Insira um valor válido, ex: 15,00');
      return;
    }
    setSelectedAmount(parsed);
    setPaymentMethod('pix');
    setPayModalVisible(true);
    Keyboard.dismiss();
  };

  // ----- Payment flows -----

  // PIX: generate fake code
  const startPixFlow = () => {
    // create a fake pix code (UUID-like simple)
    const code = `PIX|${Date.now()}|R${selectedAmount.toFixed(2)}`;
    setPixCode(code);
    setPixPaid(false);
  };

  // simulate confirming pix payment (user can press "Simular recebimento")
  const confirmPixPayment = async () => {
    setIsProcessing(true);
    try {
      // simple delay to simulate network
      await new Promise((r) => setTimeout(r, 1000));

      // apply balance (in this flow, PIX means user paid to us and we add credit)
      await applyBalanceIncrease(selectedAmount);
      setPixPaid(true);
      setPayModalVisible(false);
      setPixCode(null);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao processar PIX (simulado).');
    } finally {
      setIsProcessing(false);
    }
  };

  // Card: simple validation and fake processing
  const startCardPayment = async () => {
    // quick validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 12) {
      Alert.alert('Cartão inválido', 'Informe um número de cartão válido (simulação).');
      return;
    }
    if (!cardName) {
      Alert.alert('Nome inválido', 'Informe o nome do titular.');
      return;
    }
    if (!cardExpiry || !/\d{2}\/\d{2}/.test(cardExpiry)) {
      Alert.alert('Validade inválida', 'Informe formato MM/AA (simulação).');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      Alert.alert('CVV inválido', 'Informe um CVV válido.');
      return;
    }

    setIsProcessing(true);

    try {
      // simulate processing time
      await new Promise((r) => setTimeout(r, 1500));

      // simulate random success/fail (90% success)
      const success = Math.random() < 0.9;

      if (success) {
        // credit the balance (simulating a top-up purchase)
        await applyBalanceIncrease(selectedAmount);
        setPayModalVisible(false);
        clearCardForm();
      } else {
        Alert.alert('Pagamento recusado', 'Operadora recusou o pagamento (simulado).');
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha no processamento do pagamento (simulado).');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCardForm = () => {
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
  };

  // final confirm button: delegate to method
  const handleConfirmPayment = async () => {
    if (!selectedAmount || selectedAmount <= 0) {
      Alert.alert('Erro', 'Valor inválido.');
      return;
    }

    if (paymentMethod === 'pix') {
      startPixFlow();
    } else {
      // credit or debit: use same fake flow
      await startCardPayment();
    }
  };

  // copy PIX code to clipboard
  const copyPix = async () => {
    if (pixCode) {
      try {
        await Clipboard.setString(pixCode);
        Alert.alert('Copiado', 'Código PIX copiado para a área de transferência.');
      } catch {
        Alert.alert('Erro', 'Não foi possível copiar o código.');
      }
    }
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
        <Text style={styles.balanceLabel}>Saldo atual:</Text>
        <Text style={styles.balanceValue}>R$ {formatBRL(userBalance)}</Text>

        <Text style={styles.sectionTitle}>Adicionar créditos rápido:</Text>
        <View style={styles.quickButtonsRow}>
          {[5, 10, 20, 50].map((v) => (
            <TouchableOpacity key={v} style={styles.optionButton} onPress={() => handleQuickAdd(v)}>
              <Text style={styles.optionText}>R$ {v},00</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Ou insira um valor:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15,00"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={setCustomAmount}
        />

        <TouchableOpacity style={styles.customButton} onPress={handleCustomAdd} disabled={isProcessing}>
          <Text style={styles.customButtonText}>{isProcessing ? 'Processando...' : 'Continuar para pagamento'}</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 20, color: '#666' }}>
          Métodos suportados (simulados): PIX — Cartão de Crédito — Cartão de Débito
        </Text>
      </View>

      {/* PAYMENT MODAL */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>Pagamento - R$ {formatBRL(selectedAmount)}</Text>

            <View style={{ marginVertical: 8 }}>
              <Text style={{ marginBottom: 6 }}>Escolha o método:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={[modalStyles.methodButton, paymentMethod === 'pix' && modalStyles.methodSelected]}
                  onPress={() => setPaymentMethod('pix')}
                >
                  <Text style={modalStyles.methodText}>PIX</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.methodButton, paymentMethod === 'credit' && modalStyles.methodSelected]}
                  onPress={() => setPaymentMethod('credit')}
                >
                  <Text style={modalStyles.methodText}>Cartão Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.methodButton, paymentMethod === 'debit' && modalStyles.methodSelected]}
                  onPress={() => setPaymentMethod('debit')}
                >
                  <Text style={modalStyles.methodText}>Cartão Débito</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* PIX UI */}
            {paymentMethod === 'pix' && (
              <View style={{ marginTop: 10 }}>
                {!pixCode ? (
                  <>
                    <Text style={{ marginBottom: 8 }}>Gerar código PIX para pagamento instantâneo.</Text>
                    <TouchableOpacity style={modalStyles.actionButton} onPress={handleConfirmPayment}>
                      <Text style={modalStyles.actionText}>Gerar PIX</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                      Depois de gerar, simule que o pagamento foi efetivado clicando em "Simular recebimento".
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{ alignItems: 'center', marginVertical: 8 }}>
                      <Text style={{ fontWeight: '700', marginBottom: 6 }}>Código PIX:</Text>
                      <Text selectable style={{ fontSize: 12 }}>{pixCode}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TouchableOpacity style={modalStyles.copyButton} onPress={copyPix}>
                        <Text style={modalStyles.copyText}>Copiar código</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={modalStyles.actionButton} onPress={confirmPixPayment} disabled={isProcessing}>
                        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.actionText}>Simular recebimento</Text>}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* CARD UI */}
            {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
              <View style={{ marginTop: 10 }}>
                <TextInput
                  style={styles.cardInput}
                  placeholder="Número do cartão"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
                <TextInput
                  style={styles.cardInput}
                  placeholder="Nome no cartão"
                  value={cardName}
                  onChangeText={setCardName}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TextInput
                    style={[styles.cardInput, { flex: 1, marginRight: 8 }]}
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                  />
                  <TextInput
                    style={[styles.cardInput, { width: 100 }]}
                    placeholder="CVV"
                    keyboardType="numeric"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={modalStyles.actionButton} onPress={handleConfirmPayment} disabled={isProcessing}>
                  {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.actionText}>Pagar</Text>}
                </TouchableOpacity>

                <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                  Esta é uma simulação: números e validações são fictícios.
                </Text>
              </View>
            )}

            <TouchableOpacity style={{ marginTop: 12, alignSelf: 'center' }} onPress={() => { setPayModalVisible(false); setPixCode(null); }}>
              <Text style={{ color: '#666' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    height: 100,
    justifyContent: 'center',
  },

  backButton: { position: 'absolute', left: 20, top: 40 },

  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },

  container: { flex: 1, padding: 24 },

  balanceLabel: { fontSize: 14, color: '#555', textAlign: 'center' },

  balanceValue: { fontSize: 30, color: COLORS.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },

  sectionTitle: { fontSize: 15, color: '#444', fontWeight: 'bold', marginBottom: 10 },

  quickButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  optionButton: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    minWidth: '23%',
    alignItems: 'center',
    borderColor: '#DDD',
    borderWidth: 1,
  },

  optionText: { fontWeight: 'bold', color: COLORS.primary },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderColor: '#DDD',
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
  },

  customButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },

  customButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  cardInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderColor: '#DDD',
    borderWidth: 1,
    marginBottom: 10,
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '92%', backgroundColor: '#fff', padding: 18, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },

  methodButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 8, alignItems: 'center' },
  methodSelected: { borderColor: COLORS.primary, backgroundColor: '#f0f8ff' },
  methodText: { fontWeight: '700', color: '#333' },

  actionButton: { marginTop: 10, backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },

  copyButton: { marginTop: 8, backgroundColor: '#eee', padding: 10, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 6 },
  copyText: { color: '#333', fontWeight: '700' },
});
