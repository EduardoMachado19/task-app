import React, { useState, useEffect } from 'react';
import { Text, View, Button, FlatList, Modal, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const TASKS = [
  { nome: "Estudar", descricao: "Estudar para DevInHouse", status: false, data: "16/09/2024" },
  { nome: "Projeto", descricao: "Finalizar projeto React Native", status: true, data: "20/09/2024" }
];

const TaskCard = ({ task, toggleStatus }) => (
  <TouchableOpacity onPress={() => toggleStatus(task)}>
    <View
      style={{
        padding: 10,
        margin: 10,
        borderColor: 'black',
        borderWidth: 1,
        backgroundColor: task.status ? '#d4edda' : '#f8d7da' // Verde para concluído, vermelho claro para pendente
      }}>
      <Text>{task.nome}</Text>
      <Text>{task.descricao}</Text>
      <Text>{task.data}</Text>
      <Text>{task.status ? 'Concluída' : 'Pendente'}</Text>
    </View>
  </TouchableOpacity>
);

const Tarefas = ({ addActivity }) => {
  const [tasks, setTasks] = useState(TASKS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ nome: '', descricao: '', data: '', status: false });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    };
    loadTasks();
  }, []);

  const saveTask = async () => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setModalVisible(false);
  };

  const toggleStatus = async (task) => {
    const updatedTasks = tasks.map(t =>
      t.nome === task.nome ? { ...t, status: !t.status } : t
    );

    const updatedTask = updatedTasks.find(t => t.nome === task.nome); // Tarefa atualizada
    setTasks(updatedTasks);

    // Adiciona a tarefa atualizada ao histórico de atividades
    addActivity({ ...updatedTask, date: new Date() });

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };



  const filteredTasks = tasks.filter(task =>
    task.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Buscar tarefa"
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Nova Tarefa" onPress={() => setModalVisible(true)} />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => <TaskCard task={item} toggleStatus={toggleStatus} />}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ padding: 20 }}>
          <TextInput
            placeholder="Nome da Tarefa"
            onChangeText={(text) => setNewTask({ ...newTask, nome: text })}
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
          />
          <TextInput
            placeholder="Descrição"
            onChangeText={(text) => setNewTask({ ...newTask, descricao: text })}
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
          />
          <TextInput
            placeholder="Data"
            onChangeText={(text) => setNewTask({ ...newTask, data: text })}
            style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            <Button title="Salvar" onPress={saveTask} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const LastActivity = ({ activities }) => (
  <View style={{ flex: 1, padding: 20 }}>
    {activities.length === 0 ? (
      <Text style={{ textAlign: 'center' }}>Não há atividades recentes na aplicação</Text>
    ) : (
      <FlatList
        data={activities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, marginBottom: 10, borderColor: 'gray', borderWidth: 1 }}>
            <Text>{item.nome} - {item.status ? 'Concluída' : 'Pendente'}</Text>
            <Text>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
      />
    )}
  </View>
);

const Messages = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Não há mensagens para serem lidas.</Text>
  </View>
);

const App = () => {
  const [activities, setActivities] = useState([]);

  const addActivity = (task) => {
    setActivities([{ ...task }, ...activities]); // Adiciona a tarefa com a data de modificação
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Tarefas') {
              iconName = 'tasks';
            } else if (route.name === 'Últimas Atividades') {
              iconName = 'history';
            } else if (route.name === 'Mensagens') {
              iconName = 'envelope';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Tarefas" children={() => <Tarefas addActivity={addActivity} />} />
        <Tab.Screen name="Últimas Atividades" children={() => <LastActivity activities={activities} />} />
        <Tab.Screen name="Mensagens" component={Messages} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
