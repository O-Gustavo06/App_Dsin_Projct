import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Logo = ({ size = 100, color = '#FFD700' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./logoOn.png')}
          style={{
            width: size,
            height: size,
            resizeMode: 'contain'
          }}
        />
        <View style={[styles.circle, { width: size * 1.5, height: size * 1.5 }]} />
      </View>
      <Text style={[styles.text, { fontSize: size * 0.3, color }]}>On Park</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFD700',
    opacity: 0.3,
  },
  text: {
    marginTop: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});