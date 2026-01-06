import React, { useState } from 'react';
import axios from 'axios';

function EditMove({ move, onMoveUpdated, onCancel }){
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
    <div>
      <h3>Edit Move</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Update Move</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default EditMove;