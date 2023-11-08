const Product = require("../models/productModel");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorRes");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {
    try {
      const existingProduct = await Product.findOne(
        { title: { $regex: new RegExp(req.body.title, "i") } }
      );    

      if (existingProduct) {
        return res.status(400).json({ error: "Product with the same title already exists" });
      }

      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error) {
      return res.status(400).json({ error });
    }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params; 

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    // Use mongoose.Types.ObjectId to create a valid ObjectId from the extracted id
    const objectId = new mongoose.Types.ObjectId(id);

    const updateProduct = await Product.findOneAndUpdate({ _id: objectId }, req.body, {
      new: true,
    });

    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete({ _id: id });
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product Deleted", deleteProduct});
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBulkProducts = async (req, res) => {
  try {
    const { ProductIds } = req.body;
    const deleteProducts = await Product.deleteMany({ _id: { $in: ProductIds } });
    res.json(deleteProducts);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getaProduct = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById({ _id: id });
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    const searchQuery = queryObj.search;
    if (searchQuery) {
      queryObj.$or = [
        { title: { $regex: `^${searchQuery}`, $options: 'i' } },
        { category: { $regex: `^${searchQuery}`, $options: 'i' } },
        { brand: { $regex: `^${searchQuery}`, $options: 'i' } },
      ];
      delete queryObj.search;
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getProductsByVendor = async (req, res) => {
  const { vendorId } = req.params;
  validateMongoDbId(vendorId);
  const products = await Product.find({ vendor_id: vendorId }).populate('vendor_id');
  res.json(products);
};

exports.updateProductVendor = async (req, res) => {
  const { productId } = req.params;
  const { vendorId } = req.body;

  validateMongoDbId(productId);
  validateMongoDbId(vendorId);

  const product = await Product.findByIdAndUpdate(
    productId,
    { vendor_id: vendorId },
    { new: true }
  );

  res.json(product);
};

exports.addToWishlist = async (req, res) => {
    const { prodId } = req.body;
    const { _id } = req.user._id;
    try {
      const user = await User.findById(_id);
      const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
      if (alreadyadded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      } else {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        res.json(user);
      }
    } catch (error) {
      throw new Error(error);
    }
};

exports.deleteAllWishlistItems = async (req, res) => {
  const { _id } = req.user._id;

  try {
    // Find the user by ID
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear the user's wishlist by setting it to an empty array
    user.wishlist = [];

    // Save the user to update the wishlist
    await user.save();

    res.json({ message: "All wishlist items deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting wishlist items" });
  }
};

exports.rating = async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
};