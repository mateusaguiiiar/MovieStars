import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

interface Review {
  sk_review_id: string;
  nota: number;
  comentario: string;
}

interface Movie {
  sk_movie_id: string;
  titulo: string;
  ano_lancamento: number;
  duracao_minutos?: number;
  sinopse: string;
  nome_genero?: string;
  url_poster?: string;
  media_notas?: number;
  reviews: Review[];
}

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário de nova avaliação
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');

  // Função para buscar os detalhes do filme
  async function fetchMovieDetails() {
    try {
      const response = await api.get(`/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do filme:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  // Função para enviar nova avaliação
  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    setErroAvaliacao('');
    setEnviando(true);

    try {
      await api.post(`/movies/${id}/reviews`, {
        nota: Number(nota),
        comentario: comentario,
      });

      // Limpa o formulário e recarrega os detalhes para atualizar a lista e a média
      setComentario('');
      setNota('5');
      fetchMovieDetails();
    } catch (err: any) {
      console.error(err);
      setErroAvaliacao('Erro ao enviar avaliação. Verifique os dados.');
    } finally {
      setEnviando(false);
    }
  }

  // FUNÇÃO DE EXCLUIR FILME
  async function handleDeleteMovie() {
    const confirmado = window.confirm('Tem certeza que deseja excluir este filme permanentemente?');
    if (!confirmado) return;

    try {
      await api.delete(`/movies/${id}`);
      // Se der certo, redireciona para a página inicial
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir o filme:', error);
      alert('Não foi possível excluir o filme.');
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Carregando detalhes...</div>;
  }

  if (!movie) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Filme não encontrado.</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Voltar ao Catálogo</Link>
        
        {/* BOTÃO DE EXCLUIR */}
        <button 
          onClick={handleDeleteMovie}
          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🗑️ Excluir Filme
        </button>
      </div>

      <h1>{movie.titulo} ({movie.ano_lancamento})</h1>
      {movie.nome_genero && <p style={{ color: '#555', fontStyle: 'italic' }}>Gênero: {movie.nome_genero}</p>}
      
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Sinopse</h3>
        <p>{movie.sinopse || 'Nenhuma sinopse cadastrada.'}</p>
        <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
          ⭐ Média de Notas: {movie.media_notas ? movie.media_notas.toFixed(1) : 'Sem avaliações'}
        </p>
      </div>

      <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* SEÇÃO DE AVALIAÇÕES */}
      <h2>Avaliações dos Usuários</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        {movie.reviews && movie.reviews.length > 0 ? (
          movie.reviews.map((rev) => (
            <div key={rev.sk_review_id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Nota: {rev.nota} / 5</p>
              <p style={{ margin: '0' }}>{rev.comentario}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#666' }}>Ainda não há avaliações para este filme. Seja o primeiro a avaliar!</p>
        )}
      </div>

      {/* FORMULÁRIO DE NOVA AVALIAÇÃO */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
        <h3>Adicionar uma Resenha</h3>
        <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nota (1 a 5):</label>
            <select 
              value={nota} 
              onChange={e => setNota(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
            >
              <option value="1">1 Estrela</option>
              <option value="2">2 Estrelas</option>
              <option value="3">3 Estrelas</option>
              <option value="4">4 Estrelas</option>
              <option value="5">5 Estrelas</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comentário:</label>
            <textarea 
              value={comentario} 
              onChange={e => setComentario(e.target.value)} 
              required
              placeholder="Escreva sua opinião sobre o filme..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            />
          </div>

          {erroAvaliacao && <p style={{ color: 'red', margin: '0' }}>{erroAvaliacao}</p>}

          <button 
            type="submit" 
            disabled={enviando}
            style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {enviando ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </form>
      </div>
    </div>
  );
}