import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialProduct?.name || '');
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : '');
    setCategory(initialProduct?.category || '');
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : '');
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Редактирование товара' : 'Добавление товара';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!trimmedName) {
      alert('Введите название');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert('Введите корректную цену');
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      price: parsedPrice,
      category: category.trim() || 'Другое',
      stock: parsedStock || 0
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" onClick={onClose}>X</button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название
            <input 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Например, Ноутбук"
              autoFocus
            />
          </label>
          <label className="label">
            Цена
            <input 
              className="input" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              placeholder="Например, 1000"
              inputMode="numeric"
            />
          </label>
          <label className="label">
            Категория
            <input 
              className="input" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              placeholder="Например, Электроника"
            />
          </label>
          <label className="label">
            Количество на складе
            <input 
              className="input" 
              value={stock} 
              onChange={e => setStock(e.target.value)} 
              placeholder="Например, 10"
              inputMode="numeric"
            />
          </label>
          <div className="modalFooter">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btnPrimary">
              {mode === 'edit' ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}