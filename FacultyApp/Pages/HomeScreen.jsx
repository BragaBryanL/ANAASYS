import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { UserContext } from './components/UserContext'; // Import UserContext
import BottomBar from './components/BottomBar';

// Dummy data for consultations
const consultationData = [
  { id: '1', firstName: 'John', lastName: 'Doe', concern: 'Need help with project', status: 'Cater' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', concern: 'Questions about assignment', status: 'Cater' },
  { id: '3', firstName: 'Emily', lastName: 'Johnson', concern: 'Clarification on topics', status: 'Cater' },
  { id: '4', firstName: 'Michael', lastName: 'Brown', concern: 'Need guidance on thesis', status: 'Cater' },
  { id: '5', firstName: 'Alice', lastName: 'Davis', concern: 'Help with project presentation', status: 'Cater' },
  { id: '6', firstName: 'Chris', lastName: 'Garcia', concern: 'Understanding class materials', status: 'Cater' },
  { id: '7', firstName: 'David', lastName: 'Martinez', concern: 'Advice on internship', status: 'Catered' },
  { id: '8', firstName: 'Sarah', lastName: 'Rodriguez', concern: 'Feedback on assignment', status: 'Catered' },
  { id: '9', firstName: 'James', lastName: 'Wilson', concern: 'Preparation for exams', status: 'Catered' },
  { id: '10', firstName: 'Laura', lastName: 'Lee', concern: 'Assistance with research', status: 'Catered' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useContext(UserContext); // Access user info from context

  const [filter, setFilter] = useState('All'); // State for filter option

  // Filter the consultation data based on the selected filter
  const filteredData = filter === 'All' ? consultationData : consultationData.filter(item => item.status === filter);

  const handleCater = (id) => {
    // Logic for marking the consultation as catered
    console.log(`Catered consultation with ID: ${id}`);
    // You would also update the consultation status here in a real app
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {item.lastName.charAt(0).toUpperCase()}{item.firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.concern}>{item.concern}</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {item.status === 'Cater' ? (
          <TouchableOpacity style={styles.buttonCater} onPress={() => handleCater(item.id)}>
            <Text style={styles.buttonText}>Cater</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonCatered} disabled>
            <Text style={styles.buttonText}>Catered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'All' && styles.activeFilter]}
          onPress={() => setFilter('All')}>
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Cater' && styles.activeFilter]}
          onPress={() => setFilter('Cater')}>
          <Text style={styles.filterButtonText}>Cater</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Catered' && styles.activeFilter]}
          onPress={() => setFilter('Catered')}>
          <Text style={styles.filterButtonText}>Catered</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <BottomBar />
      <Button title="Logout" onPress={() => {
        // Clear user context on logout
        navigation.navigate('Login');
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 5,
  },
  filterButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  activeFilter: {
    backgroundColor: '#0056b3',
  },
  listContainer: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 20,
    elevation: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  concern: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonCater: {
    backgroundColor: '#007BFF', // Blue color for "Cater" button
    borderRadius: 4,
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonCatered: {
    backgroundColor: 'gray', // Green color for "Done" button
    borderRadius: 4,
    padding: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
