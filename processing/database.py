# Download data: http://files.grouplens.org/datasets/movielens/ml-latest-small.zip
# %%
import os, re
import sqlite3
import pandas as pd

# %% Constants
THIS_DIR = os.path.dirname(os.path.realpath(__file__))
PARENT_DIR = os.path.dirname(THIS_DIR)
DB_FILE = os.path.join(PARENT_DIR, 'data', 'db1.sqlite')
DDL_FILE = os.path.join(THIS_DIR, "ddl.sql.txt")

# %% Some functions
def insertInto(myTable, tuples):
    slots = ", ".join(["?"] * len(tuples[0]))
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.executemany("INSERT INTO {} VALUES ({})".format(myTable, slots), tuples)
    conn.commit()
    conn.close()

def dbQuery(sql):
    conn = sqlite3.connect(DB_FILE)
    for row in conn.execute(sql):
        yield row
    conn.close()

def dbExecute(sql):
    conn = sqlite3.connect(DB_FILE)
    conn.execute(sql)
    conn.commit()
    conn.close()

# %% Database init
def initDB():
    conn = sqlite3.connect(DB_FILE)
    print(".. initializing {}".format(DB_FILE))
    with open(DDL_FILE) as f:
        for line in f:
            conn.execute(line)
        conn.close()

# %% Database dump
def populateDB():
    # Database dump: movie
    df = pd.read_csv(os.path.join(PARENT_DIR, 'data', 'movies.csv'))
    subset = df[['movieId', 'title']]
    tuples = [tuple(x) for x in subset.values]
    insertInto("movie", tuples)

    # Database dump: genre
    subset = df[['movieId', 'genres']]
    # Spliting values in column
    column = subset.pop('genres').str.split('|')
    subset = subset.join(column)
    # Ungroup column
    subset = subset.explode('genres').reset_index(drop=True)
    tuples = [tuple(x) for x in subset.values]
    insertInto("genre", tuples)

    # Database dump: movie
    df = pd.read_csv(os.path.join(PARENT_DIR, 'data', 'links.csv'))
    subset = df[['movieId', 'imdbId', 'tmdbId']]
    tuples = [tuple(x) for x in subset.values]
    insertInto("link", tuples)

    # DB Corrections
    sql = "UPDATE genre SET genre = '(not specified)' WHERE genre = '(no genres listed)'"
    dbExecute(sql)


# %% Retrieve Genres
def getGenres():
    sql = '''
    SELECT DISTINCT genre
    FROM genre
    ORDER BY genre LIKE ('(%)'), genre
    '''
    for (genre, ) in dbQuery(sql):
        yield genre

# %% Retrieve Movies
def getMovies(search='', genres=[], limit=100):
    genres = "','".join(genres)
    sfilter = "1" # No search filters
    if len(search) > 0:
        if re.match(r'^".+"$', search):
            search = search.replace('"', "") + " (%"
        else:
            search = "%{}%".format(search.replace(" ", "%"))
        sfilter = "LOWER(title) LIKE ('{}')".format(search.lower())
        print(sfilter)
    sql = '''
    SELECT movieId, title,
        GROUP_CONCAT(genre) AS genre,
        'tt' || SUBSTR('0000000' || imdbId, -7) AS imdbId
    FROM movie
        LEFT JOIN genre USING(movieId)
        LEFT JOIN link USING(movieId)
    WHERE genre IN ('{}') AND {}
    GROUP BY movieId
    LIMIT {}
    '''.format(genres, sfilter, limit)
    for (movieId, title, genre, imdbId) in dbQuery(sql):
        yield {
            "movieId": movieId,
            "title": title,
            "imdbId": imdbId,
            "genre": genre.split(",")}

def getMoviesById(ids=[]):
    idstr = ",".join(map(str, ids))
    sql = '''
    SELECT movieId, title,
        GROUP_CONCAT(genre) AS genre,
        'tt' || SUBSTR('0000000' || imdbId, -7) AS imdbId
    FROM movie
        LEFT JOIN genre USING(movieId)
        LEFT JOIN link USING(movieId)
    WHERE movieId IN ({})
    GROUP BY movieId
    '''.format(idstr)
    for (movieId, title, genre, imdbId) in dbQuery(sql):
        yield {
            "movieId": movieId,
            "title": title,
            "imdbId": imdbId,
            "genre": genre.split(",")}

# %%
if __name__ == "__main__":
    initDB()
    populateDB()

# %% Tests
#print([x for x in getMovies('the part II', genres=['Western', 'Comedy'])])
#print([x for x in getGenres()])
#print([x for x in getMoviesById([15, 16, 17, 1])])

# %%
