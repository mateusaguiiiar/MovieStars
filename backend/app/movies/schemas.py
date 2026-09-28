from pydantic import BaseModel, Field
from typing import List, Optional

# Schemas para Leitura (Saída da API)
class MovieBasic(BaseModel):
    sk_movie_id: str
    titulo: str
    diretor: Optional[str] = "Não informado"
    ano_lancamento: Optional[int]
    nome_genero: Optional[str] = "Não informado"
    
    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    sk_movie_review_id: str
    nome: str
    nota: float
    comentario: str

    class Config:
        from_attributes = True

class MovieDetail(MovieBasic):
    sinopse: Optional[str]
    url_poster: Optional[str]
    nota_media: Optional[float] = None
    reviews: List[ReviewResponse] = []

# Schemas para Escrita (Entrada da API)
class ReviewCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    nota: float = Field(..., ge=1.0, le=5.0, description="A nota deve ser entre 1 e 5 estrelas")
    comentario: str = Field(..., min_length=5, max_length=4000)

class MovieCreate(BaseModel):
    id_filme: str = Field(..., description="ID original do filme (ex: tt1234567)")
    titulo: str = Field(..., min_length=1, max_length=500)
    ano_lancamento: Optional[int] = None
    duracao_minutos: Optional[int] = None
    sinopse: Optional[str] = None
    url_poster: Optional[str] = None

class MovieUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=500)
    ano_lancamento: Optional[int] = None
    duracao_minutos: Optional[int] = None
    sinopse: Optional[str] = None
    url_poster: Optional[str] = None