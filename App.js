import React, {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import call from 'react-native-phone-call';

import Contacts from 'react-native-contacts';
import ListItem from './components/ListItem';

const App = () => {
  let [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
      }).then(() => {
        loadContacts();
      });
    } else {
      loadContacts();
    }
  }, []);

  const triggerCall = (contact) => {
    console.log('call');
    const args = {
      number: `${contact.phoneNumbers[0].number}`,
      prompt: true,
    };
    call(args).catch(console.error);
  };

  const loadContacts = () => {
    Contacts.getAll((err, contacts) => {
      contacts.sort(
        (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
      );
      if (err === 'denied') {
        alert('Permission to access contacts was denied');
      } else {
        setContacts(contacts);
      }
    });
  };

  const search = (text) => {
    const phoneNumberRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    if (text === '' || text === null) {
      loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contacts.getContactsByPhoneNumber(text, (err, contacts) => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
      });
    } else {
      Contacts.getContactsMatchingString(text, (err, contacts) => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
      });
    }
  };

  const openContact = (contact) => {
    Contacts.getContactsByPhoneNumber(contact, () => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.header}>Contact List</Text>
        <TextInput
          onChangeText={search}
          placeholder="Search"
          style={styles.searchBar}
        />
        <FlatList
          data={contacts}
          renderItem={(contact) => {
            return (
              <View>
                <View>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => triggerCall(contact.item)}>
                    <Icon name="phone" size={30} color="green" />
                  </TouchableOpacity>
                </View>
                <View>
                  <ListItem
                    key={contact.item.recordID}
                    item={contact.item}
                    onPress={openContact}
                  />
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.recordID}
        />
      </View>
    </SafeAreaView>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4591ed',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 20,
  },
  buttonStyle: {
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  searchBar: {
    backgroundColor: '#f0eded',
    paddingHorizontal: 30,
    paddingVertical: Platform.OS === 'android' ? undefined : 15,
  },
});
