const API_URL = "https://pistolilla.pythonanywhere.com";

var routes = [
    {
        path: '/', component: {
            template: "<div></div>"
        }
    },
    {
        path: '/about', component: {
            template: `<div id="aboutbox" class="alert alert-dismissible alert-primary m-2">
            AI Movies Recommender is fueled with the MovieLens Dataset from <a href="https://grouplens.org/" target="_blank">Group Lens</a>. Source code and more details <a href="https://github.com/pistolilla/movielens" target="_blank">here</a>.
            </div>`
        }
    }
];

var router = new VueRouter({
    routes: routes,
    mode: 'history',
    base: '/movielens'
});

Vue.component('star-rating', VueStarRating.default);

var app = new Vue({
	el: '#app',
    router: router,
    data: {
        // gifs
        showRecommendationsGif: false,
        showResultsGif: false,
        showInfoGif: false,
        showGenresGif: false,
        // controls
        search: "",
        info: null,
        // collections
        genres: [],
        results: [],
        rated: [],
        recommendations: [],
    },
    methods: {
        // common
        prepend: function(adp, str) {
            return String(adp) + String(str);
        },
        sayHi: function(str) {
            console.log("hola " + str);
        },
        // api calls
        getMovies: function() {
            this.results = [];
            this.showResultsGif = true;
            axios({
                method: "POST",
                url: `${API_URL}/movielens/api/movies`,
                data: {
                    genres: this.genres.filter(obj => obj.checked).map(obj => obj.value),
                    search: this.search,
                }
            })
            .then(function(response) {
                this.app.results = response.data;
            })
            .catch(error => console.log(error))
            .finally(() => { this.showResultsGif = false });
        },
        getInfo: function(obj) {
            this.info = null;
            this.showInfoGif = true;
            // populate infobox
            var url = "https://www.omdbapi.com"
            var apikey = "54e36e8c";
            axios.get(`${url}?i=${obj.imdbId}&apikey=${apikey}`)
            .then(function(response) {
                this.app.info = response.data;
                this.app.info["user"] = { movieId: obj.movieId, rating: 2.5 };
            })
            .catch(error => console.log(error))
            .finally(() => { this.showInfoGif = false });
        },
        addRated: function(obj) {
            var ratedImdbIds = this.rated.map(obj => obj.movieId);
            if (ratedImdbIds.includes(obj.user.movieId)) {
                alert(`"${obj.Title}" is already in your ratings list`);
                return;
            }
            this.rated.push({
                movieId: obj.user.movieId,
                rating: obj.user.rating,
                title: obj.Title
            });
        },
        deleteRated: function(obj) {
            const index = this.rated.indexOf(obj);
            this.rated.splice(index, 1);
        },
        getRecommendations: function() {
            var min = 3;
            if (this.rated.length < min) {
                alert(`Please rate at least ${min} movies (the more the better)`);
                return;
            }
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            this.recommendations = [];
            this.showRecommendationsGif = true;
            axios({
                method: "POST",
                url: `${API_URL}/movielens/api/recommendations`,
                data: this.rated
            })
            .then(function(response) {
                this.app.recommendations = response.data;
            })
            .catch(error => console.log(error))
            .finally(() => { this.showRecommendationsGif = false });
        }
    },
    // listeners
    watch: {
        genres: {
            handler: function(val, oldval) {
                this.getMovies();
            },
            deep: true
        },
    },
    created() {
        axios.get(`${API_URL}/movielens/api/genres`)
        .then(function(response) {
            this.app.genres = response.data.map(function(obj) {
                return { value: obj, checked: true };
            });
        })
        .catch(error => console.log(error));
    },
});