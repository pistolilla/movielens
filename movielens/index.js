var routes = [
    {
        path: '/movielens/', component: {
            template: ""
        }
    },
    {
        path: '/movielens/about', component: {
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
  base: '/'
});

var app = new Vue({
	el: '#app',
  	router: router
});