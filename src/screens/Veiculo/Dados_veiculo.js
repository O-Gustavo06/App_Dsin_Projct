// src/screens/Veiculo/Dados_veiculo.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../styles/colors';

const VEHICLE_KEY = '@vehicle_data';

export default function DadosVeiculo({ navigation }) {
  const [vehicle, setVehicle] = useState({ IdVeiculo: '', Placa: '', Modelo: '', Cor: '' });
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState(vehicle);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(VEHICLE_KEY);
        if (raw) setVehicle(JSON.parse(raw));
        else {
          const sample = { IdVeiculo: '12345', Placa: 'ABC1D23', Modelo: 'Gol 1.0', Cor: 'Prata' };
          setVehicle(sample);
          await AsyncStorage.setItem(VEHICLE_KEY, JSON.stringify(sample));
        }
      } catch (err) {
        console.warn('Erro ao carregar vehicle:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openEdit = () => {
    setForm(vehicle);
    setEditVisible(true);
  };

  const saveVehicle = async () => {
    // validações simples
    if (!form.Placa || !form.Modelo) {
      Alert.alert('Atenção', 'Placa e Modelo são campos obrigatórios.');
      return;
    }

    try {
      await AsyncStorage.setItem(VEHICLE_KEY, JSON.stringify(form));
      setVehicle(form);
      setEditVisible(false);
      Alert.alert('Sucesso', 'Dados do veículo atualizados.');
    } catch (err) {
      console.error('Erro ao salvar vehicle', err);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.loadingText}>Carregando dados do veículo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Veículos</Text>
        <TouchableOpacity onPress={openEdit} style={styles.iconBtn}>
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.cardTop}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/252/252025.png' }}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.modelText}>{vehicle.Modelo || '-'}</Text>
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Placa</Text>
                <Text style={styles.badgeValue}>{vehicle.Placa || '-'}</Text>
              </View>

              <View style={[styles.badge, { marginLeft: 8 }]}>
                <Text style={styles.badgeText}>Cor</Text>
                <Text style={styles.badgeValue}>{vehicle.Cor || '-'}</Text>
              </View>
            </View>

            <Text style={styles.idText}>ID: {vehicle.IdVeiculo || '-'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailList}>
          <DetailRow icon="card" label="IdVeiculo" value={vehicle.IdVeiculo} />
          <DetailRow icon="pricetag" label="Placa" value={vehicle.Placa} />
          <DetailRow icon="car" label="Modelo" value={vehicle.Modelo} />
          <DetailRow icon="color-palette" label="Cor" value={vehicle.Cor} />
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editBtnText}>Editar informações</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar veículo</Text>

            <TextInput
              style={styles.input}
              placeholder="IdVeiculo"
              value={form.IdVeiculo}
              onChangeText={(t) => setForm(s => ({ ...s, IdVeiculo: t }))}
              keyboardType="default"
            />

            <TextInput
              style={styles.input}
              placeholder="Placa"
              value={form.Placa}
              onChangeText={(t) => setForm(s => ({ ...s, Placa: t }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Modelo"
              value={form.Modelo}
              onChangeText={(t) => setForm(s => ({ ...s, Modelo: t }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Cor"
              value={form.Cor}
              onChangeText={(t) => setForm(s => ({ ...s, Cor: t }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={saveVehicle}>
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={COLORS.primary} style={{ width: 26 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  containerCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: '#666' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },

  cardContainer: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#f3f6fb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatar: { width: 60, height: 60 },
  infoColumn: { flex: 1 },
  modelText: { fontSize: 20, fontWeight: '800', color: '#111' },
  row: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  badge: { backgroundColor: '#f4f6fb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#666' },
  badgeValue: { fontSize: 14, fontWeight: '700', color: '#222' },
  idText: { marginTop: 10, fontSize: 12, color: '#777' },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
  detailList: { },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  detailLabel: { fontSize: 12, color: '#666' },
  detailValue: { fontSize: 16, fontWeight: '700', color: '#222' },

  editBtn: { marginTop: 16, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  editBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 8 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: '#fafafa' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalCancel: { flex: 1, padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  modalCancelText: { color: '#666', fontWeight: '700' },
  modalSave: { flex: 1, padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  modalSaveText: { color: '#fff', fontWeight: '800' },
});
