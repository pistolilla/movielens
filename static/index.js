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
        url: '/movielens/api/movies', data: body})
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
    $("#info, #infoimg").empty();
    $('#infogif').show();
    var movieId = $(this).attr('data-movieid');
    var imdbId = $(this).attr('data-imdbid');
    var title = $(this).html();

    // populate infobox
    var url = "https://www.omdbapi.com"
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
        <button type="button" class="btn btn-info btn-block m-0 mt-1" id="ratingbtn" data-movieid="${movieId}" data-title="${title}">Rate this movie</button>
        `);
    })
    .fail($.ajaxError);
}

// DocumentReady
$(function() {
    //// init
    // semantic ui
    $(".rating").rating();
    $('.loadinggif').hide();

    // if about undefined
    if ($.urlParam('about') == 0)
        $('#aboutbox').hide();

    // populate genres
    $.getJSON("/movielens/api/genres")
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
    $(document).on('click', '#results button', $.getInfo);
    $(document).on('click', '#recommendations button', $.getInfo);

    // rating buton listener
    $(document).on('click', '#info button', function() {
        // reading input
        var movieId = $(this).attr('data-movieid');
        var title = $(this).attr('data-title');
        // if already in list
        if ($(`#rd_${movieId}`).length) {
            alert(`"${title}" is already in your ratings list`)
        }
        else {
            // adding item to control
            $('#ratings').append(`
                <div id="rd_${movieId}" class="list-group-item d-flex justify-content-between align-items-center p-0 pl-2">
                    ${title}
                    <span class="badge badge-pill">
                        <button data-movieid="${movieId}" type="button" class="btn btn-secondary btn-sm deletebtn">X</button>
                    </span>
                </div>
                <div id="rr_${movieId}">
                    <div id="r_${movieId}" class="ui large star rating" data-rating="3" data-max-rating="5"></div>
                </div>
            `);
            $(`#r_${movieId}`).rating();
        }
    });

    // delete rating listener
    $(document).on('click', '#ratings button', function() {
        // reading input
        var movieId = $(this).attr('data-movieid');
        // delete div and control
        $(`#rd_${movieId}`).remove();
        $(`#rr_${movieId}`).remove();
    });

    // recommend button listener
    $("#recommendbtn").click(function() {
        // reading user's ratings
        var ratings = [];
        $("#ratings .rating").each(function(index, obj) {
            var movieId = parseInt(obj.id.replace("r_", ""));
            //var rating = parseFloat(obj.getAttribute('data-rating'));
            var rating = $(`#${obj.id}`).rating("get rating");
            ratings.push({"movieId": movieId, "rating": rating});
        });
        //alert(JSON.stringify(ratings));
        body = JSON.stringify(ratings);

        // not enough ratings
        if (ratings.length < 3) {
            alert("Please rate at least 3 movies (the more the better)");
            return;
        }

        //// fetch recommendations
        // scrolling to top
        $('html, body').animate({scrollTop: '0px'}, 300);
        // clearing and showing gifs
        $("#recommendations").empty();
        $('#recommendationsgif').show();

        $.ajax({
            type: 'POST', contentType: "application/json", dataType: 'json',
            url: '/movielens/api/recommendations', data: body})
        .done(function(result) {
            $('#recommendationsgif').hide();

            // iterating through results
            $.each(result, function(i, field) {
                // populating container
                htmlblock = `
                <button type="button" class="btn btn-outline-info btn-block text-left font-weight-bold m-0" id="m_${field.movieId}" data-movieid="${field.movieId}" data-imdbid="${field.imdbId}">${field.title}</button>
                `;
                $("#recommendations").append(htmlblock);
            });
        })
        .fail($.ajaxError);

    });
});