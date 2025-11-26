// src/screens/Home/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../styles/colors';

// serviço da Fake API (ver src/services/PaymentApi.js)
// se não existir, as funções devem dar fallback; aqui suponho que existam
import { payParkingSession, getWallet, updateWallet } from '../../services/PaymentApi';

const STORAGE_KEY = '@parking_spots_v3';
const HIDDEN_KEY = '@hidden_spots_v1';
const BALANCE_KEY = '@user_balance';
const USER_ID = 1;

const DEFAULT_PIN_IMAGE = { uri: 'https://cdn-icons-png.flaticon.com/512/684/684908.png' };
const RATE_PER_MINUTE = 0.1;

const INITIAL_SPOTS = [
  { id: 1, title: 'Vaga Quadra Unimar', description: 'Vaga disponível', latitude: -22.2328, longitude: -49.9762 },
  { id: 2, title: 'Vaga Refeitório', description: 'Vaga disponível', latitude: -22.2336, longitude: -49.9770 },
  { id: 3, title: 'Vaga Campo Futebol', description: 'Vaga disponível', latitude: -22.2340, longitude: -49.9768 },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function formatTotalTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `/ ${hours}:${minutes < 10 ? '0' : ''}${minutes} HR`;
  return `/ ${minutes}:00 MIN`;
}

export default function HomeScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [time, setTime] = useState(0);
  const [totalTime, setTotalTime] = useState(2);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [inputTime, setInputTime] = useState('30');
  const [spots, setSpots] = useState([]);
  const [hiddenSpots, setHiddenSpots] = useState(new Set());

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sessionMinutesUsed, setSessionMinutesUsed] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [isPaying, setIsPaying] = useState(false);

  const mapCenterRef = useRef({
    latitude: -22.2334,
    longitude: -49.9766,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const selectedSpotRef = useRef(selectedSpot);
  useEffect(() => { selectedSpotRef.current = selectedSpot; }, [selectedSpot]);

  const loadSpots = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setSpots(JSON.parse(stored));
      else {
        setSpots(INITIAL_SPOTS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SPOTS));
      }
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setSpots(INITIAL_SPOTS);
    }
  };

  const loadHidden = async () => {
    try {
      const raw = await AsyncStorage.getItem(HIDDEN_KEY);
      if (raw) setHiddenSpots(new Set(JSON.parse(raw)));
      else setHiddenSpots(new Set());
    } catch (err) {
      console.warn('Erro ao carregar hidden spots', err);
      setHiddenSpots(new Set());
    }
  };

  const loadBalance = async () => {
    try {
      const raw = await AsyncStorage.getItem(BALANCE_KEY);
      if (raw) {
        const val = Number(raw);
        setUserBalance(isNaN(val) ? 0 : val);
      } else {
        setUserBalance(0);
        await AsyncStorage.setItem(BALANCE_KEY, '0');
      }

      try {
        const wallet = await getWallet(USER_ID);
        if (wallet && typeof wallet.balance !== 'undefined') {
          const remote = Number(wallet.balance);
          setUserBalance(isNaN(remote) ? 0 : remote);
          await AsyncStorage.setItem(BALANCE_KEY, String(remote));
        }
      } catch (err) {
        // fallback: manter saldo local
      }
    } catch (err) {
      console.warn('Erro ao carregar balance', err);
      setUserBalance(0);
    }
  };

  useEffect(() => {
    loadSpots();
    loadHidden();
    loadBalance();
    const t = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(t);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSpots();
      loadHidden();
      loadBalance();
    }, [])
  );

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify([...hiddenSpots]));
      } catch (e) {
        console.warn('Erro ao salvar hidden spots', e);
      }
    })();
  }, [hiddenSpots]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(BALANCE_KEY, String(userBalance));
      } catch (e) {
        console.warn('Erro ao salvar balance local', e);
      }
    })();
  }, [userBalance]);

  // Timer
  useEffect(() => {
    let interval = null;
    if (sessionActive) {
      interval = setInterval(() => {
        setTime(prev => {
          const next = prev + 1;
          if (next >= totalTime * 60) {
            // fim da sessão
            const sel = selectedSpotRef.current;
            if (sel && sel.id != null) {
              setHiddenSpots(prevSet => {
                const s = new Set(prevSet);
                if (s.has(sel.id)) s.delete(sel.id);
                return s;
              });
            }
            if (interval) clearInterval(interval);
            setSessionActive(false);
            setSelectedSpot(null);
            const usedMinutes = Math.ceil(next / 60);
            setSessionMinutesUsed(usedMinutes);
            setPaymentModalVisible(true);
            Alert.alert('Fim do Tempo', 'Sua sessão encerrou e será cobrada.');
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      setTime(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [sessionActive, totalTime]);

  // Handlers mapa / vaga
  const onMarkerAction = (spot) => {
    Alert.alert(
      spot.title,
      'Escolha uma ação',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: hiddenSpots.has(spot.id) ? 'Mostrar' : 'Ocultar', onPress: () => toggleHideSpot(spot.id) },
        { text: 'Selecionar', onPress: () => handleSelectSpot(spot) }
      ]
    );
  };

  const toggleHideSpot = (spotId) => {
    setHiddenSpots(prev => {
      const s = new Set(prev);
      if (s.has(spotId)) s.delete(spotId);
      else s.add(spotId);
      return s;
    });
  };

  const handleSelectSpot = (spot) => {
    if (selectedSpot && selectedSpot.id === spot.id) setSelectedSpot(null);
    else setSelectedSpot({ id: spot.id, title: spot.title });
  };

  const handleFabPress = () => {
    if (sessionActive) {
      const sel = selectedSpotRef.current;
      if (sel && sel.id != null) {
        setHiddenSpots(prevSet => {
          const s = new Set(prevSet);
          if (s.has(sel.id)) s.delete(sel.id);
          return s;
        });
      }
      setSessionActive(false);
      const usedMinutes = Math.ceil(time / 60);
      const finalUsed = usedMinutes > 0 ? usedMinutes : 1;
      setSessionMinutesUsed(finalUsed);
      setPaymentModalVisible(true);
      setSelectedSpot(null);
      return;
    }

    if (!selectedSpot) {
      Alert.alert('Atenção', 'Selecione uma vaga no mapa.');
      return;
    }

    const minutes = parseInt(inputTime, 10);
    if (isNaN(minutes) || minutes <= 0) { Alert.alert('Erro', 'Insira minutos válidos.'); return; }

    setHiddenSpots(prev => {
      const s = new Set(prev);
      s.add(selectedSpot.id);
      return s;
    });
    setSessionActive(true);
    setTime(0);
    setTotalTime(minutes);
  };

  const handleAddTime = () => {
    if (sessionActive) {
      setTotalTime(prev => prev + 10);
      Alert.alert('+10 Min', 'Tempo adicionado com sucesso.');
    }
  };

  const createSpotAt = async (latitude, longitude) => {
    const newSpot = { id: Date.now(), title: `Vaga ${spots.length + 1}`, description: 'Vaga criada manualmente', latitude, longitude };
    const updated = [...spots, newSpot];
    setSpots(updated);
    setSelectedSpot({ id: newSpot.id, title: newSpot.title });
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (err) { console.error('Erro ao salvar vaga:', err); }
  };

  const handleMapLongPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    Alert.alert(
      'Criar Vaga',
      'Deseja realmente criar uma nova vaga neste local?',
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sim, Criar', onPress: () => createSpotAt(latitude, longitude) }]
    );
  };

  const showAllHidden = () => {
    setHiddenSpots(new Set());
    Alert.alert('OK', 'Todas as vagas ocultas foram exibidas.');
  };

  const calcFare = (minutes) => {
    const fare = minutes * RATE_PER_MINUTE;
    return Math.round(fare * 100) / 100;
  };

  const handlePayWithTickets = async () => {
    setIsPaying(true);
    const fare = calcFare(sessionMinutesUsed);

    try {
      try {
        const apiRes = await payParkingSession(USER_ID, fare, 'balance');
        if (!apiRes || apiRes.status !== 'approved') {
          const msg = (apiRes && apiRes.message) ? apiRes.message : 'Pagamento negado pela API';
          Alert.alert('Pagamento não aprovado', msg);
          setIsPaying(false);
          return;
        }

        try {
          const wallet = await getWallet(USER_ID);
          const currentRemote = wallet && wallet.balance ? Number(wallet.balance) : 0;
          const newRemote = Math.round((currentRemote - fare) * 100) / 100;
          await updateWallet(USER_ID, newRemote);
          setUserBalance(newRemote);
          await AsyncStorage.setItem(BALANCE_KEY, String(newRemote));
        } catch (syncErr) {
          const newLocal = Math.round((userBalance - fare) * 100) / 100;
          setUserBalance(newLocal);
          await AsyncStorage.setItem(BALANCE_KEY, String(newLocal));
        }

        setPaymentModalVisible(false);
        Alert.alert('Pagamento aprovado', `Transação: ${apiRes.transactionId || 'N/A'}`);
      } catch (apiErr) {
        if (userBalance >= fare) {
          const newLocal = Math.round((userBalance - fare) * 100) / 100;
          setUserBalance(newLocal);
          await AsyncStorage.setItem(BALANCE_KEY, String(newLocal));
          setPaymentModalVisible(false);
          Alert.alert('Pagamento local efetuado', `Pagamento de R$ ${fare.toFixed(2)} deduzido do seu saldo local.`);
        } else {
          Alert.alert('Pagamento falhou', 'API de pagamento indisponível e saldo local insuficiente.');
        }
      }
    } catch (err) {
      console.error('Erro no pagamento', err);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancelPayment = () => {
    setPaymentModalVisible(false);
  };

  const goToTickets = () => {
    setPaymentModalVisible(false);
    navigation.navigate('Tickets');
  };

  if (showSplash) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const fabIcon = sessionActive ? 'stop' : 'car-sport';
  const fabText = sessionActive ? 'PARAR' : 'INICIAR';
  const fareToPay = calcFare(sessionMinutesUsed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROJECT DSIN</Text>
      </View>

      <View style={styles.menuBar}>
        <TouchableOpacity
          style={styles.menuBarItem}
          onPress={() => navigation.navigate('DadosVeiculo')}
        >
          <Ionicons name="menu" size={18} color="#fff" />
          <Text style={styles.menuBarText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBarItem} onPress={() => navigation.navigate('Tickets')}>
          <Ionicons name="card" size={18} color="#fff" />
          <Text style={styles.menuBarText}>Tickets</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <MapView
          style={styles.map}
          initialRegion={mapCenterRef.current}
          showsUserLocation
          showsMyLocationButton
          onLongPress={handleMapLongPress}
          onRegionChangeComplete={(region) => (mapCenterRef.current = region)}
        >
          {spots.map((spot) => {
            if (hiddenSpots.has(spot.id)) return null;
            return (
              <Marker
                key={spot.id}
                coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                title={spot.title}
                description={spot.description}
                onPress={() => onMarkerAction(spot)}
                anchor={{ x: 0.5, y: 1 }}
              >
                <Image source={DEFAULT_PIN_IMAGE} style={{ width: 35, height: 35, resizeMode: 'contain' }} />
              </Marker>
            );
          })}
        </MapView>

        <TouchableOpacity style={styles.centerCreateButton} onLongPress={() => {
          Alert.alert(
            'Criar vaga no centro do mapa',
            `Deseja criar uma vaga em:\nLat: ${mapCenterRef.current.latitude.toFixed(6)}\nLng: ${mapCenterRef.current.longitude.toFixed(6)} ?`,
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sim, Criar', onPress: () => createSpotAt(mapCenterRef.current.latitude, mapCenterRef.current.longitude) }]
          );
        }} delayLongPress={700}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.showAllButton} onPress={showAllHidden}>
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {sessionActive && (
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>Tempo Decorrido</Text>
          </View>

          <View style={styles.sessionTimeContainer}>
            <Text style={styles.sessionTime}>{formatTime(time)}</Text>
            <Text style={styles.sessionTimeTotal}>{formatTotalTime(totalTime)}</Text>
          </View>

          <View style={styles.sessionDetails}>
            <Text style={styles.sessionPlate}>{selectedSpot ? selectedSpot.title : 'Vaga Selecionada'}</Text>
            <TouchableOpacity onPress={handleAddTime}>
              <Ionicons name="add-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, (!selectedSpot && !sessionActive) && styles.fabDisabled]}
        onPress={handleFabPress}
        disabled={!selectedSpot && !sessionActive}
      >
        <Ionicons name={fabIcon} size={30} color="white" />
        <Text style={styles.fabText}>{fabText}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>{selectedSpot ? `Vaga: ${selectedSpot.title}` : 'VAGAS DISPONÍVEIS:'}</Text>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputTime}
            onChangeText={setInputTime}
            placeholder="Min"
          />
          <TouchableOpacity
            style={styles.btnStart}
            onPress={() => {
              if (!selectedSpot) Alert.alert('Erro', 'Selecione uma vaga');
              else handleFabPress();
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{sessionActive ? 'PARAR' : 'INICIAR'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {spots.map((spot) => {
            const isHidden = hiddenSpots.has(spot.id);
            return (
              <TouchableOpacity
                key={spot.id}
                style={[styles.spotItem, isHidden ? { opacity: 0.5 } : null]}
                onPress={() => handleSelectSpot(spot)}
              >
                <Image source={DEFAULT_PIN_IMAGE} style={{ width: 24, height: 24, marginRight: 10, resizeMode: 'contain' }} />
                <Text style={{ fontSize: 14, color: '#333' }}>{spot.title}</Text>

                <TouchableOpacity onPress={() => toggleHideSpot(spot.id)} style={{ marginLeft: 10 }}>
                  <Ionicons name={isHidden ? 'eye-off' : 'eye'} size={20} color={isHidden ? 'gray' : COLORS.primary} />
                </TouchableOpacity>

                {selectedSpot && selectedSpot.id === spot.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* PAYMENT MODAL */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <Text style={modalStyles.title}>Pagamento da Sessão</Text>

            <View style={{ marginVertical: 8 }}>
              <Text>Tempo usado: {sessionMinutesUsed} minuto(s)</Text>
              <Text>Tarifa: R$ {RATE_PER_MINUTE.toFixed(2)} / min</Text>
              <Text style={{ fontWeight: '700', marginTop: 6 }}>Total: R$ {fareToPay.toFixed(2)}</Text>
              <Text style={{ marginTop: 6 }}>Seu saldo: R$ {userBalance.toFixed(2)}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity
                style={[modalStyles.button, (userBalance < fareToPay || isPaying) && modalStyles.buttonDisabled]}
                onPress={handlePayWithTickets}
                disabled={userBalance < fareToPay || isPaying}
              >
                <Text style={modalStyles.buttonText}>{isPaying ? 'Processando...' : 'Pagar com Tickets'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={modalStyles.buttonAlt} onPress={goToTickets}>
                <Text style={modalStyles.buttonAltText}>Ir para Tickets</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop: 12, alignSelf: 'center' }} onPress={handleCancelPayment}>
              <Text style={{ color: '#666' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  menuBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: COLORS.secondary },
  menuBarItem: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 8 },
  menuBarText: { color: 'white', fontSize: 12, marginLeft: 6 },
  map: { flex: 1 },
  centerCreateButton: { position: 'absolute', right: 16, bottom: 340, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  showAllButton: { position: 'absolute', right: 16, bottom: 400, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  sessionCard: { position: 'absolute', top: 120, left: 20, right: 20, backgroundColor: COLORS.secondary, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  sessionTitle: { color: '#ccc' },
  sessionTimeContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  sessionTime: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  sessionTimeTotal: { color: '#ccc', marginBottom: 5, marginLeft: 5 },
  sessionDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sessionPlate: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 240, alignSelf: 'center', width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 4, borderColor: COLORS.secondary },
  fabDisabled: { backgroundColor: 'gray' },
  fabText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', height: 280, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 10 },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  btnStart: { width: 100, backgroundColor: COLORS.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  spotItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  button: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: 'white', fontWeight: '700' },
  buttonAlt: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonAltText: { color: COLORS.primary, fontWeight: '700' },
});
