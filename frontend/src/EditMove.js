import React, { useState } from 'react';
import axios from 'axios';

function EditMove({ move, onMoveUpdated, onCancel }) {
  const [name, setName] = useState(move.name);
  const [description, setDescription] = useState(move.description);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedMove = {
      name: name,
      description: description
    };

    axios.put(`http://localhost:5000/api/moves/${move.id}`, updatedMove, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        alert('Move updated successfully!');
        onMoveUpdated();
      })
      .catch(error => {
        console.error('Error updating move:', error);
        alert('Failed to update move');
      });
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
      <h3 className="text-2xl font-bold mb-5 text-gray-800">Edit Move</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Move Name
          </label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            type="submit"
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Update Move
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMove; 