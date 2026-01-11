import React, { useState } from 'react';
import axios from 'axios';

function CreateMove({ groupId, onMoveCreated, user }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newMove = {
      name: name,
      description: description,
      created_by: user.id
    };

    axios.post(`http://localhost:5000/api/groups/${groupId}/moves`, newMove)
      .then(response => {
        alert('Move created successfully!');
        setName('');
        setDescription('');
        setShowForm(false);
        onMoveCreated();
      })
      .catch(error => {
        console.error('Error creating move:', error);
        alert('Failed to create move');
      });
  };

  return (
    <div>
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md"
        >
          + Add New Move
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-2xl font-bold mb-5 text-gray-800">Create New Move</h3>
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
                placeholder="e.g., Pizza Night, Beach Trip"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this activity..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Create Move
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateMove; 