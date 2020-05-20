var routes = [
    {
        path: '/scratchvue/', component: {
            template: "<div><h1>Home</h1><p>This is home page</p></div>"
        }
    },
    {
        path: '/scratchvue/about', component: {
            template: "<div><h1>About</h1><p>This is about page</p></div>"
        }
    },
    {
        path: '/scratchvue/contact', component: {
            template: "<div><h1>Contact</h1><p>This is contact page</p></div>"
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