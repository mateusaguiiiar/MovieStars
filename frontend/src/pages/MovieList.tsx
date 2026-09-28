import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Movie {
  sk_movie_id: string;
  titulo: string;
  ano_lancamento: number;
  nome_genero: string;
}

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [busca, setBusca] = useState(''); // Novo estado para a barra de pesquisa

  useEffect(() => {
    async function fetchMovies() {
      try {
        // Envia o termo de busca como query parameter. 
        const parametros = busca ? { search: busca } : {};
        
        const response = await api.get('/movies', { params: parametros });
        setMovies(response.data);
      } catch (error) {
        console.error('Erro ao buscar filmes:', error);
      }
    }
    
    // Truque de debounce: aguarda 500ms após a última digitação para fazer a requisição
    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 500);

    // Limpa o timer se o usuário continuar digitando
    return () => clearTimeout(delayDebounceFn);
  }, [busca]); // O useEffect agora reage sempre que 'busca' muda

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Catálogo de Filmes</h1>
      
      {/* Botão de Adicionar Filme */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/movies/new" style={{ 
          background: '#28a745', color: 'white', padding: '10px 15px', 
          textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' 
        }}>
          + Adicionar Novo Filme
        </Link>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text"
          placeholder="Buscar filme por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            padding: '12px',
            width: '100%',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
      </div>

      {/* LISTAGEM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {movies.map((movie) => (
          <div 
            key={movie.sk_movie_id} 
            style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}
          >
            <h3 style={{ margin: '0 0 10px 0' }}>
              {movie.titulo} ({movie.ano_lancamento})
            </h3>
            <p style={{ margin: '0 0 10px 0' }}>Gênero: {movie.nome_genero}</p>
            <Link to={`/movies/${movie.sk_movie_id}`} style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>
              Ver Detalhes →
            </Link>
          </div>
        ))}
        
        {movies.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666' }}>Nenhum filme encontrado com esse nome.</p>
        )}
      </div>
    </div>
  );
}