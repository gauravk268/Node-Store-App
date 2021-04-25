const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Schema } = mongoose;
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(__dirname + "/public"));
app.use(cors());

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
  title: String,
  count: { type: Number, default: 1 },
  price: Number,
  category: { type: String, default: "Other" },
  dateAdded: { type: Date, default: Date.now },
  image: {
    type: String,
    default:
      "https://cdn.iconscout.com/icon/free/png-512/product-135-781070.png",
  },
  description: { type: String, default: "More details will be updated soon." },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/addProduct.html");
});

app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word });
});

app.get("/name", (req, res) => {
  res.json({ name: req.query.first + " " + req.query.last });
});

app.get("/products", (req, res) => {
  const Product = mongoose.model("Product", productSchema);

  Product.find({}, function (err, products) {
    if (err) {
      console.log("[mongodb] Error occured: ", err);
      return handleError(err);
    }
    res.status(200).send(products);
  });
});

app.post("/addProduct", (req, res) => {
  const privateKey = "20185005";
  if (req.body.key !== privateKey) {
    console.log(
      "Private Key do not matched, cannot save product. ",
      req.body.key
    );
    res
      .status(400)
      .send(
        "<h1>Private Key do not matched, cannot save product. Please try again with correct key</h1>"
      );
    return;
  }

  const productAdd = req.body;

  const Product = mongoose.model("Product", productSchema);

  if (productAdd.image === "") {
    productAdd.image =
      "https://cdn.iconscout.com/icon/free/png-512/product-135-781070.png";
  }

  if (productAdd.description === "") {
    productAdd.description = "More details will be updated soon.";
  }

  const createAndSaveProduct = () => {
    var newProduct = new Product({
      title: productAdd.title,
      price: productAdd.price,
      category: productAdd.category,
      image: productAdd.image,
      description: productAdd.description,
    });

    // console.log(newProduct);

    newProduct.save((err, savedProduct) => {
      if (err) {
        console.log("Could not save Product: " + err);
        res
          .status(500)
          .send("<h2>Could not save your product. Please try again.</h2>");
      } else {
        console.log("[mongoose] New Product added successfully.");
        res.status(200).send("<h1>Product added successfully. </h1>");
      }
    });
  };

  createAndSaveProduct();
});

// app.get("/feedback", (req, res) => {
//   res.status(200).sendFile(__dirname + "/views/feedback.html");
// });

// app.post("/feedback", (req, res) => {
//   console.log("req: ", req.body);
//   res.status(200).send(req.body);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server up and running on port: ", PORT);
});
