import React, { useState, useEffect } from 'react';
import { api } from '../api';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, userData) => {
    try {
      const updated = await api.updateUser(id, userData);
      setUsers(users.map(u => u.id === id ? updated : u));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Заблокировать пользователя?')) return;
    try {
      await api.blockUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <h2>Управление пользователями</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Возраст</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editingUser?.id === user.id ? (
                  <input
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                ) : user.username}
              </td>
              <td>
                {editingUser?.id === user.id ? (
                  <input
                    type="number"
                    value={editingUser.age}
                    onChange={(e) => setEditingUser({ ...editingUser, age: e.target.value })}
                  />
                ) : user.age}
              </td>
              <td>
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                ) : user.role}
              </td>
              <td style={{ color: user.isActive ? '#4ade80' : '#f87171' }}>
                {user.isActive ? 'Активен' : 'Заблокирован'}
              </td>
              <td>
                {editingUser?.id === user.id ? (
                  <>
                    <button onClick={() => handleUpdate(user.id, editingUser)} style={styles.saveBtn}>Сохранить</button>
                    <button onClick={() => setEditingUser(null)} style={styles.cancelBtn}>Отмена</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingUser(user)} style={styles.editBtn}>Ред</button>
                    {user.isActive && (
                      <button onClick={() => handleBlock(user.id)} style={styles.blockBtn}>Блок</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: '#0b0f19', minHeight: '100vh', color: '#e7eaf3' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#1a1f2e', borderRadius: '12px' },
  editBtn: { padding: '5px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  blockBtn: { padding: '5px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { padding: '5px 10px', background: '#4ade80', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  cancelBtn: { padding: '5px 10px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default UsersList;