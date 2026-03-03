import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import IncidentService from '../services/IncidentService';

interface SignalerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const typesIncident = [
  { id: 'agression', label: 'Agression', icon: 'warning', color: '#ff1744' },
  { id: 'harcelement', label: 'Harcèlement', icon: 'hand-left', color: '#ff9100' },
  { id: 'suspicious', label: 'Comportement suspect', icon: 'eye', color: '#ffc400' },
  { id: 'accident', label: 'Accident', icon: 'car', color: '#2196f3' },
  { id: 'autre', label: 'Autre', icon: 'help', color: '#9c27b0' },
];

export default function SignalerModal({ visible, onClose, onSuccess, userId }: SignalerModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'incident');
      return;
    }

    setIsLoading(true);

    try {
      // Obtenir la position actuelle
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      // Sauvegarder l'incident
      await IncidentService.saveIncident({
        typeIncident: selectedType as any,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        description: description || 'Aucune description',
        idSignaleur: userId,
      });

      Alert.alert('Merci 🙏', 'Votre signalement a été enregistré et aidera la communauté');
      
      // Réinitialiser le formulaire
      setSelectedType('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur signalement:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Signaler un incident</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Type d'incident</Text>
            <View style={styles.typesContainer}>
              {typesIncident.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonSelected,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={24} 
                    color={selectedType === type.id ? 'white' : type.color} 
                  />
                  <Text style={[
                    styles.typeText,
                    selectedType === type.id && styles.typeTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description (optionnelle)</Text>
            <TextInput
              style={styles.input}
              placeholder="Décrivez ce qui s'est passé..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Envoi en cours...' : 'Signaler'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  typeButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: 10,
  },
  typeButtonSelected: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  typeText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  typeTextSelected: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});