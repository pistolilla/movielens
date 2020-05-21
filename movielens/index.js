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
            <button type="button" class="close" data-dismiss="alert">&times;</button>
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

var app = new Vue({
	el: '#app',
    router: router,
    data: {
        // gifs
        showRecommendationsGif: false,
        showResultsGif: false,
        showInfoGif: true,
        showGenresGif: false,
        // controls
        search: "",
        // collections
        genres: [],
        results: [],
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
    },
    // listeners
    watch: {
        genres: {
            handler: function(val, oldval) {
                this.getMovies();
            },
            deep: true
        }
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