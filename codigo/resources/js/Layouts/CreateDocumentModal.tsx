import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';

interface CreateDocumentModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const submit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Enviar documento');
};
export default function CreateDocumentModal({ isVisible, onClose }: CreateDocumentModalProps) {
  if (!isVisible) return null; // No renderizar si no es visible

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className=" w-[30vw] bg-white py-2 px-4 transition-opacity duration-300 ease-in-out rounded-lg" onClick={(e) => e.stopPropagation()}>
        <header className='flex justify-between items-center'>
            <h1 className="text-lg font-semibold">Crear Documento</h1>
            <button type='button' onClick={onClose} className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"> <Icon icon="bx:x" /> </button>
        </header>
        <main>
            <form onSubmit={submit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block mb-1">Nombre:</label>
                    <input type="text" id="name" name="name" className="w-full p-2 rounded text-primary" />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block mb-1">Descripción:</label>
                    <textarea id="description" name="description" rows={4} className="w-full p-2 rounded text-primary" style={{ resize: 'none' }}></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="priority" className="block mb-1">Prioridad:</label>
                    <select id="priority" name="priority" className="w-full p-2 rounded text-primary">
                        <option value="1">Baja</option>
                        <option value="2">Media</option>
                        <option value="3">Alta</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="document" className='flex items-center justify-center cursor-pointer border border-gray-600 rounded-md p-4 text-gray-600 hover:bg-gray-200'> 
                        <Icon className="text-2xl" icon="mdi:file-upload-outline" />
                        <span className="ml-2">Sube tu archivo</span>
                    </label>
                    <input hidden type="file" id="document" name="document" className="w-full p-2 rounded text-primary" />
                </div>
                <div className="flex items-center justify-end mt-2">
                    <button type='submit' className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Crear</button>
                </div>
            </form>
        </main>
      </div>
    </div>
  );
}