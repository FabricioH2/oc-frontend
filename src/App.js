import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Construir la URL de la API basada en el hostname
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    
    // Si estamos en localhost, usar la API local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/comments';
    }
    
    // En OpenShift, reemplazar 'frontend' por 'backend-api'
    const apiHost = hostname.replace('frontend', 'backend-api');
    return `https://${apiHost}/api/comments`;
  };

  // Cargar comentarios
  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl());
      
      if (!response.ok) {
        throw new Error('Error al cargar los comentarios');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('Error al conectar con la API de comentarios.');
    } finally {
      setLoading(false);
    }
  };

  // Enviar comentario
  const sendComment = async () => {
    const author = name.trim();
    const text = comment.trim();

    if (!author || !text) {
      alert('Por favor, completa ambos campos.');
      return;
    }

    try {
      setSending(true);
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: author, comment: text }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el comentario');
      }

      // Limpiar formulario
      setName('');
      setComment('');
      
      // Recargar comentarios
      await loadComments();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      alert('No se pudo enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // Cargar comentarios al montar el componente
  useEffect(() => {
    loadComments();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>💬 Sistema de Comentarios</h1>
        
        <div className="comments-section">
          {loading && <p className="loading">Cargando comentarios...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && comments.length === 0 && (
            <p className="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          )}
          {!loading && !error && comments.map((c, index) => (
            <div key={index} className="comment">
              <strong>{c.name}</strong>
              <p>{c.comment}</p>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2>Escribe tu Comentario</h2>
          <input
            type="text"
            id="name"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={sending}
          />
          <textarea
            id="comment"
            placeholder="¡Escribe tu comentario aquí!"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={sending}
          />
          <button onClick={sendComment} disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar Comentario'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

