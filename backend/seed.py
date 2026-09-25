import csv
import sqlite3
import os

PASTA_CSVS = "data" 

TABLES_FILES = [
    ("dim_movies", os.path.join(PASTA_CSVS, "dim_movies.csv")),
    ("dim_genres", os.path.join(PASTA_CSVS, "dim_genres.csv")),
    ("dim_companies", os.path.join(PASTA_CSVS, "dim_companies.csv")),
    ("dim_people", os.path.join(PASTA_CSVS, "dim_people.csv")),
    ("bridge_movie_genre", os.path.join(PASTA_CSVS, "bridge_movie_genre.csv")),
    ("bridge_movie_company", os.path.join(PASTA_CSVS, "bridge_movie_company.csv")),
    ("bridge_movie_person", os.path.join(PASTA_CSVS, "bridge_movie_person.csv")),
    ("fact_movies_performance", os.path.join(PASTA_CSVS, "fact_movies_performance.csv")),
    ("dim_reviews", os.path.join(PASTA_CSVS, "dim_reviews.csv")),
    ("movie_reviews", os.path.join(PASTA_CSVS, "movies_reviews.csv")),
]

def clean_value(val):
    val = val.strip()
    return None if val == "" else val

def popular_banco():
    db_path = "rocketlab.db"
    
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados {db_path} não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        for table_name, file_path in TABLES_FILES:
            if not os.path.exists(file_path):
                print(f"Aviso: Arquivo {file_path} não encontrado. Pulando...")
                continue

            with open(file_path, mode="r", encoding="utf-8") as f:
                reader = csv.reader(f)
                headers = next(reader)
                
                placeholders = ", ".join(["?"] * len(headers))
                columns = ", ".join(headers)
                query = f"INSERT OR IGNORE INTO {table_name} ({columns}) VALUES ({placeholders})"
                
                rows = [[clean_value(cell) for cell in row] for row in reader]
                
                cursor.executemany(query, rows)
                print(f"Sucesso: {len(rows)} registros inseridos na tabela '{table_name}'.")

        conn.commit()
        print("\nCarga de dados concluída com sucesso! Banco populado.")

    except Exception as e:
        conn.rollback()
        print(f"Erro durante a inserção: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    popular_banco()