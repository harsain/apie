var express = require("express");
var router = express.Router();
var fs = require("fs");
var _ = require("lodash");
var schemaValidator = require("ajv");

fs.readFile("./db.json", "utf8", (err, data) => {
  if (err) {
    throw new Error("invalid db JSON");
  }

  data = JSON.parse(data);
  validateDBSchema(data);
  entities = Object.keys(data);
  entities.forEach(element => {

    router.get("/" + element, function(req, res) {
      res.send(data[element]);
    });

    router.get("/" + element + "/:id", function(req, res) {
      response = _.find(data[element], { id: parseInt(req.params.id) });
      if (response === undefined) {
        res.render("error", {
          error: {
            status: 400,
            stack: element + " with ID: " + req.params.id + " not found"
          }
        });
      } else {
        res.send(response);
      }
    });

    elementKeys = Object.keys(data[element][0]);
    console.debug(elementKeys);
    elementKeys.forEach(elementKey => {
      entities.forEach(entity => {
        if (elementKey == entity + "_id") {
          console.log("------------------")
          console.log("MATCHED")
          console.debug(elementKey);
          console.debug(entity);
          console.log("------------------")
        }
      })
    })

  });
});

/* GET home page. */
router.get("/", function(req, res, next) {
  var routeArr = [];
  router.stack.forEach(route => {
    methods = [];
    for (const method in route.route.methods) {
      if (method === "_ all") continue;
      methods.push(method.toUpperCase());
    }
    routeArr.push({ path: route.route.path, methods: methods });
  });

  res.render("index", { title: "APIE", routes: routeArr });
});

function validateDBSchema(data) {
  fs.readFile("./schema.json", "utf8", (err, schemaString) => {
    if (err) {
      throw new Error("invalid schema file");
    }
    var ajv = new schemaValidator();
    var valid = ajv.validate(JSON.parse(schemaString), data);
    if (!valid) {
      throw new Error(ajv.errorsText());
    }
  });
}

module.exports = router;
