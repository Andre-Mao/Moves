import React, { useState } from 'react';
import axios from 'axios';

function CreateMove({ groupId, onMoveCreated, user }){
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
                onMoveCreated(); // refresh the list
            })
            .catch(error => {
                console.error('Error creating move:', error);
                alert('Failed to create move');
            });
    };

    return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>Add New Move</button>
      ) : (
        <div>
          <h3>Create New Move</h3>
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
            <button type="submit">Create Move</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateMove;