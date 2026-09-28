import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

interface Review {
  sk_movie_review_id: string;
  nome: string;
  nota: number;
  comentario: string;
}

interface MovieFull {
  sk_movie_id: string;
  titulo: string;
  ano_lancamento: number;
  sinopse: string;
  url_poster: string;
  nota_media: number | null;
  reviews: Review[];
}

export function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieFull | null>(null);
  
  // Estados para o formulário de nova avaliação
  const [nome, setNome] = useState('');
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  // Função para buscar os detalhes (separada para podermos recarregar após avaliar)
  async function fetchMovieDetails() {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    }
  }

  useEffect(() => {
    if (id) fetchMovieDetails();
  }, [id]);

  // Função disparada ao enviar o formulário
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault(); // Evita que a página recarregue
    setErro('');

    try {
      await api.post(`/movies/${id}/reviews`, {
        nome,
        nota,
        comentario
      });
      
      // Limpa o formulário e recarrega os dados do filme para mostrar a nova avaliação
      setNome('');
      setNota(5);
      setComentario('');
      fetchMovieDetails();
    } catch (error: any) {
      setErro(error.response?.data?.detail?.[0]?.msg || 'Erro ao enviar avaliação.');
    }
  }

  if (!movie) return <div style={{ padding: '20px' }}>Carregando...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Voltar ao Catálogo</Link>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {movie.url_poster && (
          <img src={movie.url_poster} alt={`Poster de ${movie.titulo}`} style={{ width: '200px', borderRadius: '8px' }} />
        )}
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>{movie.titulo} ({movie.ano_lancamento})</h1>
          <p><strong>Nota Média:</strong> {movie.nota_media ? movie.nota_media.toFixed(1) : 'Sem avaliações'} / 5.0</p>
          <p><strong>Sinopse:</strong> {movie.sinopse || 'Sinopse indisponível.'}</p>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* SEÇÃO DO FORMULÁRIO */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Deixe sua Avaliação</h3>
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Seu Nome" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="number" 
            min="1" 
            max="5" 
            value={nota} 
            onChange={e => setNota(Number(e.target.value))} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <textarea 
            placeholder="Seu comentário" 
            value={comentario} 
            onChange={e => setComentario(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
          />
          {erro && <p style={{ color: 'red', margin: '0' }}>{erro}</p>}
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Enviar Avaliação
          </button>
        </form>
      </div>

      {/* SEÇÃO DA LISTA DE AVALIAÇÕES */}
      <h2>Avaliações</h2>
      {movie.reviews.length === 0 ? (
        <p>Ainda não há avaliações para este filme.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {movie.reviews.map(review => (
            <div key={review.sk_movie_review_id} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <strong>{review.nome}</strong> deu nota <strong>{review.nota}/5</strong>
              <p style={{ margin: '10px 0 0 0' }}>"{review.comentario}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
