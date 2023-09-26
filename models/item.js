const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 500 },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true },
    num_instock: { type: Number, required: true },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the 'this' object
    return `/inventory/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);