import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContactSecurite } from '../types';

// Données mockées pour l'exemple
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
  },
  {
    id: 3,
    nom: "Claire Ndiaye",
    telephone: "06 55 66 77 88",
    relation: "Collègue",
    estNotifiable: false
  }
];

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<ContactSecurite[]>(mockContacts);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactSecurite | null>(null);
  
  // Formulaire
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [relation, setRelation] = useState('');
  const [estNotifiable, setEstNotifiable] = useState(true);

  const resetForm = () => {
    setNom('');
    setTelephone('');
    setRelation('');
    setEstNotifiable(true);
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (contact: ContactSecurite) => {
    setEditingContact(contact);
    setNom(contact.nom);
    setTelephone(contact.telephone);
    setRelation(contact.relation);
    setEstNotifiable(contact.estNotifiable);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!nom || !telephone) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et le téléphone');
      return;
    }

    if (editingContact) {
      // Modification
      setContacts(contacts.map(c => 
        c.id === editingContact.id 
          ? { ...c, nom, telephone, relation, estNotifiable }
          : c
      ));
      Alert.alert('Succès', 'Contact modifié');
    } else {
      // Ajout
      const newContact: ContactSecurite = {
        id: Date.now(),
        nom,
        telephone,
        relation,
        estNotifiable
      };
      setContacts([...contacts, newContact]);
      Alert.alert('Succès', 'Contact ajouté');
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer ce contact ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setContacts(contacts.filter(c => c.id !== id));
            Alert.alert('Succès', 'Contact supprimé');
          }
        }
      ]
    );
  };

  const toggleNotifiable = (id: number) => {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, estNotifiable: !c.estNotifiable } : c
    ));
  };

  const renderContact = ({ item }: { item: ContactSecurite }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactAvatar}>
          <Text style={styles.avatarText}>{item.nom.charAt(0)}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactNom}>{item.nom}</Text>
          <Text style={styles.contactRelation}>{item.relation}</Text>
          <Text style={styles.contactTel}>{item.telephone}</Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <View style={styles.notificationSwitch}>
          <Text style={styles.switchLabel}>Notifier en cas d'alerte</Text>
          <Switch
            value={item.estNotifiable}
            onValueChange={() => toggleNotifiable(item.id)}
            trackColor={{ false: "#ddd", true: "#e91e63" }}
            thumbColor={item.estNotifiable ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff1744" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts de confiance</Text>
        <Text style={styles.subtitle}>
          Ces personnes seront notifiées en cas d'alerte SOS
        </Text>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucun contact</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des contacts de confiance pour recevoir vos alertes SOS
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal d'ajout/modification */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Modifier' : 'Ajouter'} un contact
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={nom}
                onChangeText={setNom}
              />

              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Relation (soeur, amie, etc.)"
                value={relation}
                onChangeText={setRelation}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Notifier en cas d'alerte</Text>
                <Switch
                  value={estNotifiable}
                  onValueChange={setEstNotifiable}
                  trackColor={{ false: "#ddd", true: "#e91e63" }}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#e91e63',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  list: {
    padding: 15,
    paddingBottom: 80, // Ajouté pour laisser de la place au bouton +
  },
  contactCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  contactHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactNom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactRelation: {
    fontSize: 14,
    color: '#e91e63',
    marginBottom: 2,
  },
  contactTel: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  notificationSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: 10,
    marginRight: 10,
  },
  deleteButton: {
    padding: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
  addButton: {
  position: 'absolute',
  bottom: 100,  // Plus haut (était à 30)
  right: 20,
  backgroundColor: '#e91e63',
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,  // Plus d'ombre pour être visible
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  zIndex: 1000,
},
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
    minHeight: 400,
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
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});