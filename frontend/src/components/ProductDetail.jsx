import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await api.getProductById(id);
      setProduct(data);
      setFormData(data);
      setLoading(false);
    } catch (err) {
      navigate('/products');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProduct(id, formData);
      setProduct(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.container}>Загрузка...</div>;
  if (!product) return <div style={styles.container}>Товар не найден</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/products')} style={styles.backBtn}>← Назад</button>
      
      {!editing ? (
        <div style={styles.card}>
          <h1>{product.name}</h1>
          <p style={styles.price}>{product.price} ₽</p>
          <p><strong>Категория:</strong> {product.category}</p>
          <p><strong>В наличии:</strong> {product.stock}</p>
          <p><strong>ID:</strong> {product.id}</p>
          <div>
            <button onClick={() => setEditing(true)} style={{ ...styles.button, background: '#f59e0b' }}>Редактировать</button>
            <button onClick={handleDelete} style={{ ...styles.button, background: '#dc2626' }}>Удалить</button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <h2>Редактировать</h2>
          <form onSubmit={handleUpdate}>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required style={styles.input} />
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={styles.input} />
            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} style={styles.input} />
            <button type="submit" style={{ ...styles.button, background: '#6366f1' }}>Сохранить</button>
            <button type="button" onClick={() => setEditing(false)} style={{ ...styles.button, background: '#6b7280' }}>Отмена</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#0b0f19', minHeight: '100vh', color: '#e7eaf3' },
  card: { background: '#1a1f2e', padding: '24px', borderRadius: '12px' },
  price: { fontSize: '28px', fontWeight: 'bold', color: '#4ade80' },
  button: { padding: '8px 16px', marginRight: '10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  backBtn: { padding: '8px 16px', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #2a2f3e', background: '#0f1526', color: '#e7eaf3' }
};

export default ProductDetail;