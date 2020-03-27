import os
from flask import Flask, render_template, flash, request, jsonify, Markup
from flask_cors import CORS, cross_origin
import pandas as pd
from processing import database, model

# Constants
THIS_DIR = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.before_first_request
def startup():
    global ratingsdf
    ratingsdf = pd.read_csv(os.path.join(THIS_DIR, "data", "ratings.csv"))
    ratingsdf = ratingsdf[['userId', 'movieId', 'rating']]

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/movielens")
def movielens():
    return render_template('movielens.html')

@app.route("/movielens/api/genres")
@cross_origin()
def genres():
    res = database.getGenres()
    return jsonify(list(res))

@app.route("/movielens/api/movies", methods=['POST'])
@cross_origin()
def movies():
    # reading params
    try:
        jsonobj = request.get_json()
        genres = jsonobj['genres']
        search = jsonobj['search']
    except:
        raise Exception("Invalid input")
    # querying
    res = database.getMovies(search=search, genres=genres)
    return jsonify(list(res))

@app.route("/movielens/api/recommendations", methods=['POST'])
@cross_origin()
def recommendations():
    # reading params
    try:
        items = request.get_json()
    except:
        raise Exception("Invalid input")
    # data wrangling
    inputdf = pd.DataFrame(items)
    inputdf['userId'] = 0
    # merging with all users
    inputdf = pd.concat([inputdf, ratingsdf], sort=False)

    # getting recommendations
    ids = model.getRecommendedMovies(inputdf, userId=0, limit=10)
    # querying movies by Id
    res = database.getMoviesById(ids=ids)
    # sorting by recommendation score
    res = sorted(res, key=lambda x: ids.index(x['movieId']))
    return jsonify(list(res))

if __name__=='__main__':
    #app.run(debug=True, port=8080)
    app.run()
