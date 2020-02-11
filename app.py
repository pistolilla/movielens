from flask import Flask, render_template, flash, request, jsonify, Markup
from processing.database import *

app = Flask(__name__)

@app.before_first_request
def startup():
    pass

@app.route("/")
def main():
	return render_template('index.html')

@app.route("/api/genres")
def genres():
	res = getGenres()
	return jsonify(list(res))

@app.route("/api/movies", methods=['POST'])
def movies():
	# reading params
	#print(request.get_json())
	try:
		jsonobj = request.get_json()
		genres = jsonobj['genres']
		search = jsonobj['search']
	except:
		raise Exception("Invalid input")
	# querying
	res = getMovies(search, genres=genres)
	return jsonify(list(res))

if __name__=='__main__':
	app.run(debug=True)
