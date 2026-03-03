import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Text,
  Vibration,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactSecurite } from '../types';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SOSFloatingButton = () => {
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [contacts, setContacts] = useState<ContactSecurite[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Charger les contacts au démarrage
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      // Pour l'instant, on utilise des données mockées
      // Plus tard, on chargera depuis AsyncStorage ou une API
      const mockContacts: ContactSecurite[] = [
        {
          id: 1,
          nom: "Julie Martin",
          telephone: "06 12 34 56 78",
          relation: "Soeur",
          estNotifiable: true
        },
        {
          id: 2,
          nom: "Marie Diop",
          telephone: "06 98 76 54 32",
          relation: "Amie",
          estNotifiable: true
        }
      ];
      setContacts(mockContacts);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    }
  };

  // Animation de pulsation
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    
    if (!isActivating) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isActivating]);

  // Compte à rebours
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate(100);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setCountdown(3);
      activerSOS();
    }
  }, [showCountdown, countdown]);

  const handleSOSPress = () => {
    // Vérifier si on a des contacts
    const contactsNotifiables = contacts.filter(c => c.estNotifiable);
    
    if (contactsNotifiables.length === 0) {
      Alert.alert(
        '⚠️ Attention',
        'Vous n\'avez aucun contact de confiance configuré. Ajoutez-en dans l\'onglet Contacts.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Ajouter', onPress: () => console.log('Naviguer vers contacts') }
        ]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      '🚨 ALERTE SOS',
      `${contactsNotifiables.length} contact(s) seront notifiés. Voulez-vous continuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déclencher',
          style: 'destructive',
          onPress: () => {
            setShowCountdown(true);
            setCountdown(3);
          }
        }
      ]
    );
  };

  const handleSOSLongPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Vibration.vibrate([0, 500, 200, 500]);
    setIsActivating(true);
    activerSOS();
  };

  const activerSOS = async () => {
    try {
      setIsActivating(true);

      // 1. Demander la permission de localisation
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Erreur', 'Besoin de votre position pour l\'alerte');
        setIsActivating(false);
        return;
      }

      // 2. Obtenir la position
      const location = await Location.getCurrentPositionAsync({});
      
      // 3. Obtenir l'adresse
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const adresse = addresses.length > 0 
        ? `${addresses[0].street || ''} ${addresses[0].city || ''}`.trim()
        : 'Position inconnue';

      // 4. Demander permission notifications
      await Notifications.requestPermissionsAsync();

      // 5. Notifier les contacts (simulé pour l'instant)
      const contactsNotifies = contacts.filter(c => c.estNotifiable);
      
      for (const contact of contactsNotifies) {
        console.log(`📱 Notification envoyée à ${contact.nom} (${contact.telephone})`);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 ALERTE SOS',
            body: `${contact.nom}, votre contact a besoin d'aide ! Position: ${adresse}`,
            data: { type: 'sos' },
          },
          trigger: null,
        });
      }

      // 6. Afficher confirmation
      Alert.alert(
        '✅ ALERTE ENVOYÉE',
        `${contactsNotifies.length} contact(s) ont été notifiés.\nPosition: ${adresse}`,
        [{ text: 'OK' }]
      );

      console.log('SOS activé à:', location.coords);
      
    } catch (error) {
      console.error('Erreur SOS:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'alerte');
    } finally {
      setIsActivating(false);
    }
  };

  if (showCountdown) {
    return (
      <View style={styles.countdownContainer}>
        <Animated.View style={[styles.countdownCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </Animated.View>
        <Text style={styles.countdownLabel}>Alerte dans...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, isActivating && styles.buttonActivating]}
        onPress={handleSOSPress}
        onLongPress={handleSOSLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        disabled={isActivating}
      >
        <Ionicons name="warning" size={40} color="white" />
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 999,
  },
  button: {
    backgroundColor: '#ff1744',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonActivating: {
    backgroundColor: '#b71c1c',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  countdownContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff1744',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  countdownText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  countdownLabel: {
    marginTop: 5,
    color: '#666',
    fontSize: 12,
  },
});

export default SOSFloatingButton;