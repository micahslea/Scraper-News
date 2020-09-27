var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// var Note = require("./models/Note.js");
// var Article = require("./models/Article.js");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// mongoose.Promise = Promise;

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function (req, res) {
  res.render("index");
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/unit18Populater", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// var db = mongoose.connection;

// Show any mongoose errors
// db.on("error", function (error) {
//   console.log("Mongoose Error: ", error);
// });

// // Once logged in to the db through mongoose, log a success message
// db.once("open", function () {
//   console.log("Mongoose connection successful.");
// });

// Routes

app.get("/", function (req, res) {
  Article.find({ saved: false }, function (error, data) {
    var hbsObject = {
      article: data,
    };
    console.log(hbsObject);
    res.render("home", hbsObject);
  });
});

app.get("/saved", function (req, res) {
  Article.find({ saved: true })
    .populate("notes")
    .exec(function (error, articles) {
      var hbsObject = {
        article: articles,
      };
      res.render("saved", hbsObject);
    });
});

// A GET route for scraping CNN.com's last 50 stories
app.get("/scrape", function (req, res) {
  console.log("running scrape");

  db.Article.deleteMany({}, function (err) {
    console.log(err);
  });
  // First, we grab the body of the html with axios
  axios
    .get("https://www.wrcbtv.com/category/50813/tennessee-headlines")
    .then(function (response) {
      // console.log(response);
      console.log("connected to News");
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $(".CardList-item-content").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).children("a").find("div").text();
        result.link = $(this).children("a").attr("href");
        result.summary = $(this).children("p").text();

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {
            // View the added result in the console
            console.log("dbArticle = ", dbArticle);
          })
          .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
      // console.log(db.Article.find({ _id }).length);
      // Send a message to the client
      // res.send(db.Article.find({ _id }).length);
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  var id = req.params.id;
  db.Article.find({ _id: mongojs.ObjectId(id) })
    .populate("note")
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  var id = req.params.id;
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate(
        { id },
        { $push: { notes: dbNote._id } },
        { new: true }
      );
    })
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
