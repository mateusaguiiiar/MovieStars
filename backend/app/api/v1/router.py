from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db 
from app.movies.models import DimMovie, MovieReview
from app.movies.schemas import MovieBasic, MovieDetail, ReviewCreate, MovieCreate, MovieUpdate

api_router = APIRouter(prefix="/movies", tags=["Catálogo de Filmes"])

@api_router.get("", response_model=list[MovieBasic])
async def listar_filmes(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Paginação: quantos registros pular"),
    limit: int = Query(20, ge=1, le=100, description="Paginação: limite por página"),
    search: str | None = Query(None, description="Busca por título do filme")
):
    """
    Retorna o catálogo de filmes de forma paginada.
    """
    query = select(DimMovie)
    
    if search:
        query = query.where(DimMovie.titulo.icontains(search))
        
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    filmes = result.scalars().all()
    
    return filmes

@api_router.get("/{movie_id}", response_model=MovieDetail)
async def detalhar_filme(movie_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retorna os detalhes completos de um filme específico, incluindo suas resenhas e a média de notas.
    """
    # Busca o filme pelo ID e já carrega as resenhas associadas (selectinload)
    query = (
        select(DimMovie)
        .where(DimMovie.sk_movie_id == movie_id)
        .options(selectinload(DimMovie.reviews))
    )
    
    result = await db.execute(query)
    filme = result.scalars().first()
    
    # Validação HTTP clássica: se o ID não existir, retorna erro 404 (Not Found)
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado no catálogo")
        
    # Calcula a nota média dinamicamente a partir das resenhas
    nota_media = None
    if filme.reviews:
        nota_media = sum(r.nota for r in filme.reviews) / len(filme.reviews)
    
    # Monta o dicionário de resposta combinando os dados do banco com a nota média calculada
    return {
        "sk_movie_id": filme.sk_movie_id,
        "titulo": filme.titulo,
        "ano_lancamento": filme.ano_lancamento,
        "sinopse": filme.sinopse,
        "url_poster": filme.url_poster,
        "nota_media": nota_media,
        "reviews": filme.reviews
    }

@api_router.post("/{movie_id}/reviews", response_model=ReviewCreate, status_code=201)
async def criar_avaliacao(
    movie_id: str, 
    review: ReviewCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Adiciona uma nova avaliação (1 a 5 estrelas) a um filme existente.
    """
    # Verifica se o filme existe antes de avaliar
    query = select(DimMovie).where(DimMovie.sk_movie_id == movie_id)
    result = await db.execute(query)
    filme = result.scalars().first()
    
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado para avaliação")
    
    # Cria a nova resenha usando os dados validados pelo Pydantic
    nova_resenha = MovieReview(
        sk_movie_id=movie_id,
        nome=review.nome,
        nota=review.nota,
        comentario=review.comentario
    )
    
    # Adiciona no banco e salva as alterações
    db.add(nova_resenha)
    await db.commit()
    
    return review

@api_router.post("", response_model=MovieBasic, status_code=201)
async def criar_filme(filme: MovieCreate, db: AsyncSession = Depends(get_db)):
    """Adiciona um novo filme ao catálogo."""
    # Verifica se o id_filme já existe para evitar duplicações
    query = select(DimMovie).where(DimMovie.id_filme == filme.id_filme)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Já existe um filme com este ID")
        
    novo_filme = DimMovie(**filme.model_dump())
    db.add(novo_filme)
    await db.commit()
    await db.refresh(novo_filme)
    return novo_filme

@api_router.patch("/{movie_id}", response_model=MovieBasic)
async def atualizar_filme(movie_id: str, atualizacao: MovieUpdate, db: AsyncSession = Depends(get_db)):
    """Atualiza os dados de um filme existente. Envie apenas os campos que deseja alterar."""
    query = select(DimMovie).where(DimMovie.sk_movie_id == movie_id)
    result = await db.execute(query)
    filme = result.scalars().first()
    
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
        
    # Atualiza apenas os campos que foram enviados na requisição (exclude_unset=True)
    dados_atualizacao = atualizacao.model_dump(exclude_unset=True)
    for key, value in dados_atualizacao.items():
        setattr(filme, key, value)
        
    await db.commit()
    await db.refresh(filme)
    return filme

@api_router.delete("/{movie_id}", status_code=204)
async def deletar_filme(movie_id: str, db: AsyncSession = Depends(get_db)):
    """Remove um filme do catálogo permanentemente."""
    query = select(DimMovie).where(DimMovie.sk_movie_id == movie_id)
    result = await db.execute(query)
    filme = result.scalars().first()
    
    if not filme:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
        
    await db.delete(filme)
    await db.commit()
    return None
