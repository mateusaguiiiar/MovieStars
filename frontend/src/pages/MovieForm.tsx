import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export function MovieForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [titulo, setTitulo] = useState('');
  const [ano, setAno] = useState('');
  const [duracao, setDuracao] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [urlPoster, setUrlPoster] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isEditing) {
      api.get(`/movies/${id}`)
        .then(response => {
          const movie = response.data;
          setTitulo(movie.titulo || '');
          setAno(movie.ano_lancamento?.toString() || '');
          setDuracao(movie.duracao_minutos?.toString() || '');
          setSinopse(movie.sinopse || '');
          setUrlPoster(movie.url_poster || '');
        })
        .catch(err => {
          console.error('Erro ao carregar dados para edição:', err);
          setErro('Não foi possível carregar os dados do filme.');
        });
    }
  }, [id, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    try {
      if (isEditing) {
        await api.patch(`/movies/${id}`, {
          titulo: titulo,
          ano_lancamento: Number(ano),
          duracao_minutos: Number(duracao),
          sinopse: sinopse,
          url_poster: urlPoster || null,
        });
      } else {
        const idAutomatico = crypto.randomUUID();
        await api.post('/movies', {
          id_filme: idAutomatico,
          titulo: titulo,
          ano_lancamento: Number(ano),
          duracao_minutos: Number(duracao),
          sinopse: sinopse,
          url_poster: urlPoster || null,
        });
      }
      
      navigate('/');
    } catch (err) {
      const error = err as any;
      console.error(error);
      
      if (error.response?.data?.detail) {
        const detalhes = error.response.data.detail;
        if (Array.isArray(detalhes)) {
          const camposErro = detalhes.map((d: any) => d.loc[d.loc.length - 1]).join(', ');
          setErro(`O backend rejeitou a operação. Verifique os campos: ${camposErro}`);
        } else {
          setErro('Erro de validação no backend.');
        }
      } else {
        setErro('Erro ao salvar o filme. Verifique se o servidor backend está rodando.');
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>← Voltar ao Catálogo</Link>
      
      <h1 style={{ marginTop: '20px' }}>{isEditing ? 'Editar Filme' : 'Cadastrar Novo Filme'}</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título</label>
          <input 
            type="text" 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ano de Lançamento</label>
            <input 
              type="number" 
              value={ano} 
              onChange={e => setAno(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Duração (minutos)</label>
            <input 
              type="number" 
              value={duracao} 
              onChange={e => setDuracao(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>URL do Poster (Opcional)</label>
          <input 
            type="url" 
            value={urlPoster} 
            onChange={e => setUrlPoster(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sinopse</label>
          <textarea 
            value={sinopse} 
            onChange={e => setSinopse(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
          />
        </div>

        {erro && <p style={{ color: 'red', margin: '0', fontWeight: 'bold' }}>{erro}</p>}

        <button 
          type="submit" 
          style={{ padding: '12px', background: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#000' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          {isEditing ? 'Salvar Alterações' : 'Salvar Filme'}
        </button>
      </form>
    </div>
  );
}