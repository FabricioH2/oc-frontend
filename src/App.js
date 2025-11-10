import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Log inicial para verificar que el componente se está ejecutando
  console.log('App component mounted. Hostname:', window.location.hostname);

  // Construir la URL de la API basada en el hostname
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    
    // Si estamos en localhost, usar la API local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/comments';
    }
    
    // En OpenShift, construir la URL del backend-api
    // El hostname típico es: oc-frontend-ffisa-dev.apps.cluster.com
    // Necesitamos: oc-backend-api-ffisa-dev.apps.cluster.com
    
    // Dividir el hostname en partes
    const parts = hostname.split('.');
    
    if (parts.length > 0) {
      // Obtener la primera parte (ej: "oc-frontend-ffisa-dev")
      const firstPart = parts[0];
      
      // Reemplazar "frontend" por "backend-api" en la primera parte
      if (firstPart.includes('frontend')) {
        const apiFirstPart = firstPart.replace('frontend', 'backend-api');
        // Reconstruir el hostname completo
        parts[0] = apiFirstPart;
        const apiHost = parts.join('.');
        const apiUrl = `https://${apiHost}/api/comments`;
        console.log('API URL construida:', apiUrl);
        return apiUrl;
      }
      
      // Si no contiene "frontend", intentar reemplazar "oc-frontend" por "oc-backend-api"
      if (firstPart.startsWith('oc-frontend')) {
        const apiFirstPart = firstPart.replace('oc-frontend', 'oc-backend-api');
        parts[0] = apiFirstPart;
        const apiHost = parts.join('.');
        const apiUrl = `https://${apiHost}/api/comments`;
        console.log('API URL construida:', apiUrl);
        return apiUrl;
      }
    }

    // Fallback: intentar con el mismo dominio pero cambiando el subdominio
    const fallbackUrl = `https://oc-backend-api-ffisa-dev.${hostname.split('.').slice(1).join('.')}/api/comments`;
    console.log('API URL (fallback):', fallbackUrl);
    return fallbackUrl;
  };

  // Cargar comentarios
  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl();
      console.log('Intentando cargar comentarios desde:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Respuesta recibida:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Comentarios cargados:', data);
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      const apiUrl = getApiUrl();
      setError(`Error al conectar con la API: ${err.message}. URL intentada: ${apiUrl}`);
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
      const apiUrl = getApiUrl();
      console.log('Enviando comentario a:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: author, comment: text }),
      });

      console.log('Respuesta al enviar comentario:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Limpiar formulario
      setName('');
      setComment('');
      
      // Recargar comentarios
      await loadComments();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      alert(`No se pudo enviar el comentario: ${err.message}. Revisa la consola para más detalles.`);
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

