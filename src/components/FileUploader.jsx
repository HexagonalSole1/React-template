import { useState } from 'react';
import { supabase } from '../supabase';

export default function FileUploader({ tipo, onNext }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Selecciona un archivo');
    const fileName = `${tipo}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('archivos').upload(fileName, file);

    if (error) alert('Error al subir archivo');
    else onNext();
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Subir {tipo}</button>
    </div>
  );
}
