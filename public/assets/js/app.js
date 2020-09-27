// var axios = require("axios");
// var cheerio = require("cheerio");
// var db = require("models");

$(".scrape").on("click", function (e) {
  e.preventDefault();
  console.log("scraped");
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).done(function (data) {
    articleCards();
    // toggleCards();
    // window.location = "/";
  });
  console.log("working");
  articleCards();
  // toggleCards();
});

function toggleCards() {
  var x = document.getElementById("article-cards");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function articleCards() {
  console.log("articleCards");
  // let cardDiv = $("<div>")
  //   .addClass("card")
  //   .attr("style", "width: 18rem;")
  //   .text("something else");
  // let carBody = $("<div>").addClass("card-body");
  // let cardTitle = $("<h5>").addClass("card-title").text(data[i].title);
  // let cardText = $("<p>").addClass("card-text").text(data[i].summary);
  // let cardLink = $("<a>")
  //   .addClass("card-link")
  //   .attr("href", data[i].link)
  //   .text("Article Link");
  $.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      console.log("working in for loop");

      let cardDiv = $("<div>").addClass("card");

      let cardBody = $("<div>").addClass("card-body");
      let cardTitle = $("<h5 />", { text: data[i].title }).addClass(
        "card-title"
      );
      let cardText = $("<p />").addClass("card-text").text(data[i].summary);
      let cardLink = $("<a />")
        .addClass("card-link")
        .attr("href", data[i].link)
        .text("Read Article");

      let saveBtn = $("<button>")
        .addClass("btn btn-primary")
        .attr({ type: "button" })
        .text("Save Article");

      cardBody.append(cardTitle);
      cardBody.append(cardText);
      cardBody.append(cardLink);
      cardBody.append(saveBtn);

      cardDiv.append(cardBody);

      $("#article-cards").append(cardDiv);

      console.log("data-id = ", data[i]._id);
    }
  });
}

// Grab the articles as a json
$.getJSON("/articles", function (data) {
  console.log("data length = ", data.length);
  $("#modal-text").text(`You have scraped ${data.length} articles!`);
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(
      "<p data-id='" +
        data[i]._id +
        "'>" +
        data[i].title +
        "<br />" +
        data[i].link +
        "</p>"
    );
  }
});

// Whenever someone clicks a p tag
$(document).on("click", ".btn-primary", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append(
        "<button data-id='" + data._id + "' id='savenote'>Save Note</button>"
      );

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val(),
    },
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
