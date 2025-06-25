import { useState } from 'react';
import { supabase } from '../supabase';

export default function ClienteForm({ onNext }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSave = async () => {
    const { error } = await supabase.from('clientes').insert([{ nombre, telefono }]);
    if (error) alert('Error al guardar cliente');
    else onNext();
  };

  return (
    <div>
      <h3>Agregar Cliente</h3>
      <input placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} />
      <input placeholder="Teléfono" onChange={(e) => setTelefono(e.target.value)} />
      <button onClick={handleSave}>Guardar Cliente</button>
    </div>
  );
}
