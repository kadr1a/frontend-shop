import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '' });
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadUserRole();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const me = await api.getMe();
      setUserRole(me.role);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createProduct(formData);
      setProducts([...products, created]);
      setShowForm(false);
      setFormData({ name: '', price: '', category: '', stock: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.container}>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Товары</h1>
        <div>
          {(userRole === 'seller' || userRole === 'admin') && (
            <button onClick={() => setShowForm(!showForm)} style={styles.button}>
              {showForm ? 'Отмена' : '+ Добавить'}
            </button>
          )}
          {userRole === 'admin' && (
            <button onClick={() => navigate('/users')} style={{ ...styles.button, background: '#8b5cf6' }}>
              Пользователи
            </button>
          )}
          <button onClick={handleLogout} style={{ ...styles.button, background: '#dc2626' }}>Выйти</button>
        </div>
      </div>

      {showForm && (userRole === 'seller' || userRole === 'admin') && (
        <div style={styles.formCard}>
          <h3>Новый товар</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Цена"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Количество"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Создать</button>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div style={styles.empty}>Товаров пока нет</div>
      ) : (
        <div style={styles.grid}>
          {products.map(product => (
            <div key={product.id} style={styles.card}>
              <h3>{product.name}</h3>
              <p style={styles.price}>{product.price} ₽</p>
              <p>{product.category}</p>
              <p>В наличии: {product.stock}</p>
              <div>
                <button
                  onClick={() => navigate(`/products/${product.id}`)}
                  style={{ ...styles.smallBtn, background: '#3b82f6' }}
                >
                  Подробнее
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{ ...styles.smallBtn, background: '#dc2626' }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#0b0f19',
    minHeight: '100vh',
    color: '#e7eaf3'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#1a1f2e',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #2a2f3e'
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4ade80'
  },
  button: {
    padding: '10px 20px',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  smallBtn: {
    padding: '5px 12px',
    marginRight: '8px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  formCard: {
    background: '#1a1f2e',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  input: {
    padding: '10px',
    marginRight: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #2a2f3e',
    background: '#0f1526',
    color: '#e7eaf3'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af'
  }
};