const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(__dirname + "/public"));

const connectDB = () => {
  const uri = process.env.MONGO_URI;
  console.log("[mongoose] Connecting to database...");
  try {
    mongoose.connect(
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log("[mongoose] Connection Established.")
    );
  } catch (error) {
    console.log("[mongoose] Could not connect: ", error);
  }
};
connectDB();

const closeDB = () => {
  mongoose.connection.close();
  console.log("[mongoose] Closing Connection.");
};

const productSchema = new Schema({
  _id: { type: Number, default: new mongoose.Types.ObjectId().toHexString() },
  title: String,
  count: { type: Number, default: 1 },
  price: Number,
  category: { type: String, default: "Other" },
  addedToCart: { type: Boolean, default: false },
  addToCartButtonValue: { type: String, default: "Add to Cart" },
  addToCartButtonClass: { type: String, default: "btn btn-info" },
  dateAdded: { type: Date, default: Date.now },
  image: {
    type: String,
    default:
      "https://cdn.iconscout.com/icon/free/png-512/product-135-781070.png",
  },
  description: { type: String, default: "More details will be updated soon." },
});

app.get("/", (req, res) => {
  // res.status(200).send("Hello World!!");
  res.sendFile(__dirname + "/views/addProduct.html");
});

app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word });
});

app.get("/name", (req, res) => {
  res.json({ name: req.query.first + " " + req.query.last });
});

app.get("/addProduct", (req, res) => {
  res.sendFile(__dirname + "/views/addProduct.html");
});

app.post("/addProduct", (req, res) => {
  const productAdd = req.body;
  var Product = mongoose.model("Product", productSchema);

  var createAndSaveProduct = function () {
    var newProduct = new Product({
      title: productAdd.title,
      price: productAdd.price,
      category: productAdd.category,
      image: productAdd.image,
      description: productAdd.description,
    });

    newProduct.save(function (err, data) {
      if (err) return console.error(err);
      else return data;
    });
  };

  createAndSaveProduct();

  res.status(200).json(productAdd);
});

app.listen(process.env.PORT || 3000, () => {
  if (process.env.PORT) {
    console.log(
      "Server up and running. Listening on port: " + process.env.PORT
    );
  } else {
    console.log("Server up and running. Listening on port: " + "3000");
  }
});
