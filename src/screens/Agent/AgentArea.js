// src/screens/Agent/AgentArea.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../styles/colors';

// Import try-catch: se o módulo não estiver disponível, Camera será undefined
let CameraModule;
try {
  CameraModule = require('expo-camera').Camera;
} catch (e) {
  CameraModule = undefined;
}

export default function AgentArea({ navigation }) {
  const Camera = CameraModule; // pode ser undefined
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(Camera ? Camera.Constants.Type.back : null);
  const [flash, setFlash] = useState(Camera ? Camera.Constants.FlashMode.off : null);
  const [isReady, setIsReady] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!Camera) {
        // não faz requests se Camera não existe
        setHasCameraPermission(false);
        return;
      }
      try {
        const cam = await require('expo-camera').requestCameraPermissionsAsync();
        setHasCameraPermission(cam.status === 'granted');

        const media = await MediaLibrary.requestPermissionsAsync();
        setHasMediaLibraryPermission(media.status === 'granted');
      } catch (err) {
        console.warn('Permission request error', err);
        setHasCameraPermission(false);
      }
    })();
  }, []);

  const handleFlip = () => {
    if (!Camera) return;
    setType((prev) =>
      prev === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    if (!Camera) return;
    setFlash((prev) =>
      prev === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7, skipProcessing: true });
      if (result && result.uri) setPhotoUri(result.uri);
    } catch (err) {
      console.warn('takePicture error', err);
      Alert.alert('Erro', 'Falha ao tirar a foto.');
    } finally {
      setIsTaking(false);
    }
  };

  const saveToGallery = async () => {
    if (!photoUri) return;
    if (!hasMediaLibraryPermission) {
      Alert.alert('Permissão', 'Permissão para salvar na galeria é necessária.');
      return;
    }
    try {
      const asset = await MediaLibrary.createAssetAsync(photoUri);
      await MediaLibrary.createAlbumAsync('OnPark', asset, false).catch(() => {});
      Alert.alert('Salvo', 'Foto salva na galeria.');
      setPhotoUri(null);
    } catch (err) {
      console.warn('saveToGallery error', err);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    }
  };

  const discardPhoto = () => setPhotoUri(null);

  // --- Se Camera não existir, mostre uma tela informativa (evita crash) ---
  if (!Camera) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Módulo de Câmera indisponível</Text>
        <Text style={{ textAlign: 'center', color: '#666', marginHorizontal: 18, marginBottom: 18 }}>
          O módulo nativo de câmera não está disponível neste build do app. Isso pode acontecer se você estiver usando
          o Expo Go e a versão do SDK instalada exigir um custom dev client.
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.primary, marginBottom: 12 }]}
          onPress={() => {
            // abrir docs do expo sobre dev clients
            Linking.openURL('https://docs.expo.dev/development/introduction/');
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Como habilitar a câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ccc' }]}
          onPress={() => {
            // exibir instrução curta via alert
            Alert.alert(
              'Solução rápida',
              'Execute no terminal:\n\nnpx expo install expo-camera expo-media-library\nnpx expo run:android (ou npx expo run:ios)\n\nIsso fará um build local (dev client) com os módulos nativos.'
            );
          }}
        >
          <Text style={{ fontWeight: '700' }}>Mostrar instruções</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.primary }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- se chegou aqui, Camera está disponível ---
  if (hasCameraPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Sem acesso à câmera.</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => require('expo-camera').requestCameraPermissionsAsync()}>
          <Text style={{ fontWeight: '700' }}>Solicitar Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photoUri) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={[styles.previewBtn, { backgroundColor: '#ccc' }]} onPress={discardPhoto}>
            <Ionicons name="trash" size={20} />
            <Text style={{ marginLeft: 8 }}>Descartar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewBtn, { backgroundColor: COLORS.primary }]} onPress={saveToGallery}>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 8 }}>Salvar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setPhotoUri(null)} style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.primary }}>Voltar à câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Área do Agente</Text>
      </View>

      <View style={styles.cameraWrapper}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={type}
          flashMode={flash}
          onCameraReady={() => setIsReady(true)}
        />

        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleFlip} disabled={!isReady}>
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.captureBtn]} onPress={takePicture} disabled={!isReady || isTaking}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash} disabled={!isReady}>
            <Ionicons name={flash === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash'} size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 70, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerBtn: { position: 'absolute', left: 12, top: 20, padding: 8 },
  cameraWrapper: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 },
  iconBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  actionBtn: { padding: 12, borderRadius: 8, minWidth: 220, alignItems: 'center' },

  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  previewImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  previewActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 24, marginTop: 12 },
  previewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, minWidth: 140 },
});
