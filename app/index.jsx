import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TaskItem from '../src/components/TaskItem';
import { loadTasks, saveTasks } from '../src/storage/taskStorage';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]); // start empty, nanti di-load
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Load tasks sekali saat pertama mount
  useEffect(() => {
    (async () => {
      const data = await loadTasks();
      if (data && data.length > 0) {
        setTasks(data);
      }
    })();
  }, []);

  // Toggle Done <-> Pending
  const handleToggle = async (task) => {
    const nextStatus =
      task.status === 'todo' ? 'pending' :
        task.status === 'pending' ? 'done' :
          'todo';

    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: nextStatus } : t
    );

    setTasks(updated);
    await saveTasks(updated);
  };

  // Hapus task
  const handleDelete = async (task) => {
    const updated = tasks.filter((t) => t.id !== task.id);
    setTasks(updated);
    await saveTasks(updated);
  };

  // Filter status + kategori
  const filteredTasks = tasks.filter((t) => {
    const statusMatch =
      statusFilter === 'All' ||
      (statusFilter === 'Todo' && t.status === 'todo') ||
      (statusFilter === 'Pending' && t.status === 'pending') ||
      (statusFilter === 'Done' && t.status === 'done');

    const categoryMatch =
      categoryFilter === 'All' || t.category === categoryFilter;

    return statusMatch && categoryMatch;
  });


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>TaskMate – Daftar Tugas</Text>

      {/* Filter Status */}
      <View style={styles.filterRow}>
        {['All', 'Todo', 'Done', 'Pending'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, statusFilter === f && styles.filterActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Kategori */}
      <View style={styles.filterRow}>
        {['All', 'Mobile', 'RPL', 'IoT'].map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterButton, categoryFilter === c && styles.filterActive]}
            onPress={() => setCategoryFilter(c)}
          >
            <Text style={[styles.filterText, categoryFilter === c && styles.filterTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Tidak ada tugas</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { fontSize: 20, fontWeight: '700', padding: 16 },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  filterActive: { backgroundColor: '#3b82f6' },
  filterText: { fontWeight: '600', color: '#334155' },
  filterTextActive: { color: '#fff' },
});
