import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.login({ username, password });
      navigate('/products');
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Вход</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button}>Войти</button>
        </form>
        <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0b0f19' },
  card: { background: '#1a1f2e', padding: '30px', borderRadius: '12px', width: '350px', color: '#e7eaf3' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #2a2f3e', background: '#0f1526', color: '#e7eaf3' },
  button: { width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  error: { color: '#f87171', marginBottom: '15px' }
};

export default Login;