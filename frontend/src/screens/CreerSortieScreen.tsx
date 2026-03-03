import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import SortieService from '../services/SortieService';
import { useUser } from '../context/UserContext';

export default function CreerSortieScreen({ navigation, route }: any) {
  const { user } = useUser();
  const { userId, userNom } = route.params;

  const [titre, setTitre] = useState('');
  const [lieuRdv, setLieuRdv] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [heure, setHeure] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreerSortie = async () => {
    if (!titre || !lieuRdv || !destination) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const nouvelleSortie = {
      idCreateur: userId,
      createurNom: userNom,
      titre,
      date: date,
      heureDebut: heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      lieuRdv,
      destination,
      statut: 'prevue' as const,
      participants: [{
        idUtilisateur: userId,
        nom: userNom,
        statut: 'accepte' as const,
        aPartagePosition: false
      }],
      notes: notes || undefined
    };

    await SortieService.saveSortie(nouvelleSortie);
    
    Alert.alert(
      'Succès',
      'Sortie créée !',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setHeure(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Titre de la sortie *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Soirée entre filles"
          value={titre}
          onChangeText={setTitre}
        />

        <Text style={styles.label}>Lieu de rendez-vous *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Place de l'Indépendance"
          value={lieuRdv}
          onChangeText={setLieuRdv}
        />

        <Text style={styles.label}>Destination *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ngor, Almadies"
          value={destination}
          onChangeText={setDestination}
        />

        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('fr-FR')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Heure *</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.dateText}>
            {heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={heure}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.label}>Notes (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Infos supplémentaires..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.createButton} onPress={handleCreerSortie}>
          <Text style={styles.createButtonText}>Créer la sortie</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  createButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});