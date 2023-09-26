const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const Category = require("../models/category");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of items and their categories
    const [
        numItems,
        numCategories,
    ] = await Promise.all([
        Item.countDocuments({}).exec(),
        Category.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Inventory App Home",
        item_count: numItems,
        category_count: numCategories,
    });
});

// Display list of all items
exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, "name price category num_instock")
      .sort({ name: 1 })
      .populate("description")
      .exec();

      res.render("item_list", { title: "Item List", item_list: allItems });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
    // Get details of specific item
    const item = await Item.findById(req.params.id).populate("category").populate("name").exec();

    if (item === null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_detail", {
        name: item.name,
        item: item,
        num_instock: item.num_instock,
    });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
    // Get all categories which we can use for adding to our item.
    const allCategories = await Category.find().exec();

    res.render("item_form", {
        title: "Create Item",
        categories: allCategories
    });
});

// Handle item create on POST.
exports.item_create_post = [
    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category", "Category must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("price", "Price must not be empty")
      .trim()
      .escape(),
    body("num_instock", "Number in stock must not be empty")
      .trim()
      .escape(),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an Item object with escaped and trimmed data.
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            num_instock: req.body.num_instock,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all categories for form.
            const allCategories = await Category.find().exec();
            res.render("item_form", {
                title: "Create Item",
                categories: allCategories,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save item.
            await item.save();
            res.redirect(item.url);
        }
    })

];

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
    // Get item and category for form.
    const [item, allCategories] = await Promise.all([
        Item.findById(req.params.id).populate("name").populate("description").exec(),
        Category.find().exec(),
    ]);

    if (item === null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
    });

});

// Handle item update on POST.
exports.item_update_post = [
    // Validate and sanitize fields.
    body("name", "Name must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("description", "Description must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("category", "Category must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("price", "Price must not be empty")
      .trim()
      .escape(),
    body("num_instock", "Number in stock must not be empty")
      .trim()
      .escape(),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an Item object with escaped and trimmed data and old id.
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            num_instock: req.body.num_instock,
            _id: req.params.id,
        });

        if(!errors.isEmpty()) {
            // There are errors. Render form again with sanitzied values/error messages.

            // Get all categories for form
            const allCategories = await Category.find().exec();

            res.render("item_form", {
                title: "Update Item",
                categories: allCategories,
                item: item,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            // Redirect to item detail page.
            res.redirect(updatedItem.url);
        }
    }),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of item and its category
    const item = await Item.findById(req.params.id).populate("category").populate("name").exec();

    if (item === null) {
        // No results.
        res.redirect("/inventory/items");
    }

    res.render("item_delete", {
        title: "Delete Item",
        item: item
    });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {

    await Item.findByIdAndRemove(req.body.itemid);
    res.redirect("/inventory/items");
})