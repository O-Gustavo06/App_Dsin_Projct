// HomeScreen.js
import React, { useState, useEffect } from 'react';
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
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';


const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const COLORS = {
    primary: '#1A73E8',
    secondary: '#1A2E4C',
    white: '#FFFFFF',
    background: '#F7F9FC',
};

const formatTotalTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `/ ${hours}:${minutes < 10 ? '0' : ''}${minutes} HR`;
    }
    return `/ ${minutes}:00 MIN`;
};

export default function HomeScreen({ navigation }) {    
    const [showSplash, setShowSplash] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [time, setTime] = useState(0);
    const [totalTime, setTotalTime] = useState(2); // minutos
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuTopRight, setMenuTopRight] = useState(false);

    const [inputTime, setInputTime] = useState('30');

    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 1200);
        return () => clearTimeout(t);
    }, []);

    // solicitar permissão de localização no Android (evita comportamentos inesperados no MapView)
    //useEffect(() => {
        //async function requestLocationPermission() {
            //if (Platform.OS === 'android') {
                //try {
                    //await PermissionsAndroid.request(
                        //PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        //{
                            //title: 'Permissão de Localização',
                            //message: 'O app precisa de acesso à localização para mostrar sua posição no mapa.',
                            //buttonNeutral: 'Perguntar depois',
                            //buttonNegative: 'Cancelar',
                            //buttonPositive: 'OK',
                        //}
                    //);
                //} catch (err) {
                    //console.warn('Erro ao solicitar permissão de localização', err);
                //}
            //}
       // }
        //requestLocationPermission();
    //}, []);

    useEffect(() => {
        let interval = null;
        if (sessionActive) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime >= totalTime * 60 - 1) {
                        clearInterval(interval);
                        setSessionActive(false);
                        Alert.alert('Tempo Esgotado!', 'Sua sessão de estacionamento terminou.');
                        return 0;
                    }
                    return prevTime + 1;
                });
            }, 1000);
        } else {
            setTime(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessionActive, totalTime]);

    const handleFabPress = () => {
        if (sessionActive) {
            setSessionActive(false);
            setSelectedSpot(null);
            setInputTime('30');
        } else if (selectedSpot) {
            const minutes = parseInt(inputTime, 10);
            if (isNaN(minutes) || minutes <= 0) {
                Alert.alert('Tempo Inválido', 'Por favor, insira um número válido de minutos.');
                return;
            }
            setSessionActive(true);
            setTime(0);
            setTotalTime(minutes);
        } else {
            Alert.alert('Selecione uma vaga', 'Por favor, selecione uma vaga antes de iniciar a sessão.');
        }
    };

    const handleAddTime = () => {
        if (!sessionActive) {
            Alert.alert('Erro', 'Você só pode adicionar tempo a uma sessão ativa.');
            return;
        }
        setTotalTime(prevTotal => prevTotal + 10);
        Alert.alert('Tempo Adicionado', '+10 minutos foram adicionados à sua sessão.');
    };

    const handleRefresh = () => {
        Alert.alert('Atualizado', 'Os dados da sessão foram atualizados.');
    };

    const handleSelectSpot = (spotName) => {
        setSelectedSpot(spotName);
    };

    const sheetTitle = selectedSpot ? `Vaga Selecionada: ${selectedSpot}` : 'VAGAS DISPONÍVEIS:';
    const fabText = sessionActive ? 'STOP SESSION' : 'START NEW SESSION';
    const fabIcon = sessionActive ? 'stop' : 'car-sport';
    const isFabDisabled = !selectedSpot && !sessionActive;

    if (showSplash) {
        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1A2E4C" />

            <View style={styles.header}>

                <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
                    PROJECT DSIN
                </Text>


            </View>
            <View style={styles.menuBar}>
                <TouchableOpacity style={styles.menuBarItem} onPress={() => { setSelectedSpot(null); }}>
                    <Ionicons name="map" size={18} color="#fff" />
                    <Text style={styles.menuBarText}>Mapa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBarItem} onPress={() => { setMenuOpen(true); }}>
                    <Ionicons name="menu" size={18} color="#fff" />
                    <Text style={styles.menuBarText}>Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBarItem} onPress={() => { navigation.navigate('Creditos'); }}>
                    <Ionicons name="card" size={18} color="#fff" />
                    <Text style={styles.menuBarText}>Creditos</Text>
                </TouchableOpacity>
            </View>
            {menuOpen && (
                <View style={styles.menuOverlay}>
                    <View style={styles.menu}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                            <TouchableOpacity onPress={() => setMenuOpen(false)}>
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                        </View> 
                        
                        {/* Itens do menu agora estão aqui */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); }}>
                            <Ionicons name="time" size={18} color="#555" />
                            <Text style={styles.menuItemText}>Histórico</Text>
                        </TouchableOpacity>
                    
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); }}>
                            <Ionicons name="information-circle" size={18} color="#555" />
                            <Text style={styles.menuItemText}>Sobre</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); }}>
                            <Ionicons name="close" size={22} color="#333" />
                            <Text style={styles.menuItemText}>Fechar Menu</Text>
                        </TouchableOpacity>                      
                    </View>
                </View>        
            )}

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: -22.2334,
                    longitude: -49.9766,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                toolbarEnabled={false}
            >
                <Marker
                    coordinate={{ latitude: -22.2328, longitude: -49.9762 }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title="Vaga próxima a quadra da unimar"
                    description="Vaga disponível"
                    onPress={() => handleSelectSpot('Vaga 1')}
                >
                    <Image source={{ uri: 'https://via.placeholder.com/28' }} style={{ width: 28, height: 28 }} />
                </Marker>

                <Marker
                    coordinate={{ latitude: -22.2336, longitude: -49.9770 }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title="Vaga Próxima ao Refeitorio"
                    description="Vaga disponível"
                    onPress={() => handleSelectSpot('Vaga 2')}
                >
                    <Image source={{ uri: 'https://via.placeholder.com/28' }} style={{ width: 28, height: 28 }} />
                </Marker>

                <Marker
                    coordinate={{ latitude: -22.2340, longitude: -49.9768 }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title="Vaga próxima ao campo de futebol"
                    description="Vaga disponível"
                    onPress={() => handleSelectSpot('Vaga 3')}
                >
                    <Image source={{ uri: 'https://via.placeholder.com/28' }} style={{ width: 28, height: 28 }} />
                </Marker>
            </MapView>

            {sessionActive && (
                <View style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                        <Text style={styles.sessionTitle}>Tempo utilizado</Text>
                        <TouchableOpacity onPress={handleRefresh}>
                            <Ionicons name="refresh" size={24} color="#A9B4C5" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sessionTimeContainer}>
                        <Text style={styles.sessionTime}>{formatTime(time)}</Text>
                        <Text style={styles.sessionTimeTotal}>{formatTotalTime(totalTime)}</Text>
                    </View>

                    <View style={styles.sessionDetails}>
                        <Text style={styles.sessionPlate}>{selectedSpot || 'ABC-1234'}</Text>
                        <TouchableOpacity onPress={handleAddTime} style={styles.addTimeBtn}>
                            <Ionicons name="add-circle" size={34} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sessionCost}>R$ 3.75</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.fab, isFabDisabled && styles.fabDisabled]}
                onPress={handleFabPress}
                disabled={isFabDisabled}
            >
                <Ionicons name={fabIcon} size={40} color="white" />
                <Text style={styles.fabText}>{fabText}</Text>
            </TouchableOpacity>

            <View style={styles.bottomSheet}>
                <Text style={styles.sheetTitle}>{sheetTitle}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <TextInput
                        style={{
                            flex: 0.4,
                            height: 40,
                            borderColor: '#DDD',
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            backgroundColor: '#FFF',
                            marginRight: 10,
                        }}
                        keyboardType="numeric"
                        value={inputTime}
                        onChangeText={setInputTime}
                        placeholder="Minutos"
                    />
                    <TouchableOpacity
                        style={{
                            flex: 0.6,
                            height: 40,
                            backgroundColor: COLORS.primary,
                            borderRadius: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            if (!selectedSpot) {
                                Alert.alert('Selecione uma vaga', 'Escolha uma vaga antes de iniciar.');
                                return;
                            }
                            handleFabPress();
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>{sessionActive ? 'Parar' : 'Iniciar'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.spotItem} onPress={() => handleSelectSpot('Vaga 1')}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/24' }}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: selectedSpot === 'Vaga 1' ? COLORS.primary : '#34C759',
                            resizeMode: 'contain',
                        }}
                    />
                    <Text style={styles.spotText}>Vaga próxima a quadra da unimar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.spotItem} onPress={() => handleSelectSpot('Vaga 2')}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/24' }}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: selectedSpot === 'Vaga 2' ? COLORS.primary : '#34C759',
                            resizeMode: 'contain',
                        }}
                    />
                    <Text style={styles.spotText}>Existe uma vaga próxima à cantina Bloco 4</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.spotItem} onPress={() => handleSelectSpot('Vaga 3')}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/24' }}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: selectedSpot === 'Vaga 3' ? COLORS.primary : '#34C759',
                            resizeMode: 'contain',
                        }}
                    />
                    <Text style={styles.spotText}>Existe uma vaga próxima ao campo de futebol</Text>
                </TouchableOpacity>

                <View style={styles.sheetIcons}>
                    <Ionicons name="search" size={24} color="gray" />
                    <Ionicons name="chevron-forward" size={24} color="gray" />
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        backgroundColor: COLORS.secondary,
        height: 80,
        width: '100%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        left: 100,
        right: 100,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    headerSide: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        flex: 1,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
    },
    mapText: {
        color: '#888',
        fontSize: 18,
        fontWeight: '500',
    },
    pin1: { position: 'absolute', top: '30%', left: '25%' },
    pin2: { position: 'absolute', top: '40%', right: '30%' },
    pin3: { position: 'absolute', bottom: '45%', right: '40%' },
    menuOverlay: {
        position: 'absolute',
        top: 65,
        left: 10,
        zIndex: 40,
    },
    menu: {
        width: 220,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 8,
    },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    menuTitle: { fontSize: 16, fontWeight: '700' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    menuItemText: { marginLeft: 10, fontSize: 14, color: '#333' },
    topRightMenu: {
        position: 'absolute',
        top: 65,
        right: 10,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    topRightItem: { paddingVertical: 8, paddingHorizontal: 12 },
    topRightText: { color: '#333' },
    menuBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#1A2E4C', paddingVertical: 8 },
    menuBarItem: { flexDirection: 'row', alignItems: 'center' },
    menuBarText: { color: '#fff', marginLeft: 6 },
    sessionCard: {
        position: 'absolute',
        top: 80,
        left: 30,
        right: 30,
        backgroundColor: COLORS.secondary,
        borderRadius: 15,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sessionTitle: {
        color: '#A9B4C5',
        fontSize: 16,
    },
    sessionTimeContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 10,
    },
    sessionTime: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
    },
    sessionTimeTotal: {
        color: '#A9B4C5',
        fontSize: 16,
        marginLeft: 8,
    },
    sessionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
    },
    sessionPlate: {
        color: 'white',
        fontSize: 20,
        fontWeight: '500',
    },
    addTimeBtn: {
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionCost: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 230,
        alignSelf: 'center',
        backgroundColor: COLORS.primary,
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 3,
        borderColor: COLORS.secondary,
    },
    fabDisabled: {
        backgroundColor: '#9E9E9E',
    },
    fabText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        paddingTop: 40,
        height: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 20,
        borderTopWidth: 3,
        borderColor: COLORS.primary,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    spotItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    spotText: {
        fontSize: 16,
        color: '#555',
        marginLeft: 15,
    },
    sheetIcons: {
        position: 'absolute',
        top: 25,
        right: 25,
        flexDirection: 'row',
        width: 60,
        justifyContent: 'space-between',
    },
});