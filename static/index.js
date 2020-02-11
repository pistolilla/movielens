// global
var ratings = new Set();

// Read URL parameters
$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return (results !== null) ? decodeURI(results[1]) || 0 : false;
}
// Ajax errors handler
$.ajaxError = function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    alert("An unexpected error ocurred, please read js console");
    console.log("Request Failed: " + err);
}

// Movies Handler
$.getMovies = function() {
    // clearing and showing gifs
    $("#results").empty();
    $('#resultsgif').show();

    /// creating JSON object from controls
    // genres
    var genres = [];
    $(".genreswitch input:checked").each(function(index, obj) {
        var genre = obj.id.replace("g_", "");
        genres.push(genre);
    });
    // search
    var search = $('#search').val();
    // json body
    var body = JSON.stringify({ search, genres });

    // movies
    $.ajax({
        type: 'POST', contentType: "application/json", dataType: 'json',
        url: '/api/movies', data: body})
    .done(function(result) {
        $('#resultsgif').hide();
        // labeling given result length
        if(result.length == 0) {
            $("#results").append('<p class="m-1">No results found</p>');
        } else {
            //$("#resultshead").html(`Catalog (${result.length})`);
        }
        // iterating through results
        $.each(result, function(i, field) {
            // populating container
            htmlblock = `
            <button type="button" class="btn btn-secondary btn-block text-left m-0" id="m_${field.movieId}" data-movieid="${field.movieId}" data-imdbid="${field.imdbId}">${field.title}</button>
            `;
            $("#results").append(htmlblock);
        });
    })
    .fail($.ajaxError);
}

// Movies Info Handler
$.getInfo = function(event) {
    // clearing and showing gifs
    $("#info").empty();
    $('#infogif').show();
    var movieId = $(this).attr('data-movieid');
    var imdbId = $(this).attr('data-imdbid');
    var title = $(this).html();

    // populate infobox
    var url = "http://www.omdbapi.com"
    var apikey = "54e36e8c";
    $.getJSON(`${url}?i=${imdbId}&apikey=${apikey}`)
    .done(function(result) {
        $('#infogif').hide();
        $("#infoimg").html(`
            <a href="https://www.imdb.com/title/${imdbId}" target="_blank"><img class="img-fluid" src="${result.Poster}" /></a>
        `);
        $("#info").html(`
        <b>${title}</b><br/>
        ${result.Plot}<br/>
        <button type="button" class="btn btn-success btn-block m-0 mt-1 ratingbtn" id="ratingbtn" data-movieid="${movieId}" data-title="${title}">Rate this movie</button>
        `);
    })
    .fail($.ajaxError);
}

// DocumentReady
$(function() {
    //// init
    $('.loadinggif').hide();

    // if about undefined
    if ($.urlParam('about') == 0)
        $('#aboutbox').hide();

    // populate genres
    $.getJSON("/api/genres")
    .done(function(result) {
        // iterating through results
        $.each(result, function(i, value) {
            // populating controls
            $("#genres").append(`
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="g_${value}" checked="">
                <label class="custom-control-label" for="g_${value}">${value}</label>
            </div>`);
        });
        // populate movies
        $.getMovies();
    })
    .fail($.ajaxError);

    //// listeners
    // tags select listener
    $("#search").on('keyup', $.getMovies);
    // genres switches listener
    $(document).on('click', '.genreswitch input', $.getMovies);

    // info buttons listener
    $(document).on('click', `#results button`, $.getInfo);

    // rating buton listener
    $(document).on('click', `#info button`, function() {
    //$(".ratingbtn").click(function() {
        alert("click");
        // reading input
        var movieId = $(this).attr('data-movieid');
        var title = $(this).attr('data-title');
        // adding item
        ratings.add({"movieId": movieId, "title": title});
        //$.refreshRatings();
        $.each(ratings, function(i, field) {
            // populating container
            alert(field);
        });
    });
});