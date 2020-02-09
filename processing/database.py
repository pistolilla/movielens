# %%
import os
import sqlite3
import pandas as pd

# %%
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

# %% Database init
conn = sqlite3.connect(DB_FILE)
with open(DDL_FILE) as f:
    for line in f:
        conn.execute(line)
    conn.close()

# %% Csv read
df = pd.read_csv(os.path.join(PARENT_DIR, 'data', 'movies.csv'))
df

# %% Database dump: movie
subset = df[['movieId', 'title']]
tuples = [tuple(x) for x in subset.values]
insertInto("movie", tuples)

# %% Database dump: genre
subset = df[['movieId', 'genres']]
# Spliting values in column
column = subset.pop('genres').str.split('|')
subset = subset.join(column)
# Ungroup column
subset = subset.explode('genres').reset_index(drop=True)
tuples = [tuple(x) for x in subset.values]
insertInto("genre", tuples)

# %% public functions
def getMovies(search='', genres=[]):
    gfilter = "1" # No genre filters
    if len(genres) > 0:
        gfilter = "genre IN ('{}')".format("','".join(genres))
    sfilter = "1" # No genre filters
    if len(search) > 0:
        sfilter = "LOWER(title) LIKE ('%{}%')".format(search.lower())
    sql = '''
    SELECT movieId, title, genre
    FROM movie
    LEFT JOIN genre USING(movieId)
    WHERE {} AND {}
    '''.format(gfilter, sfilter)
    return dbQuery(sql)

# %%
[x for x in getMovies('BAD BoYS', genres=['Western', 'Comedy'])]

# %%
