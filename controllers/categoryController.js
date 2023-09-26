const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Item = require("../models/item");
const Category = require("../models/category");


// Display list of all item categories
exports.category_list = asyncHandler(async (req, res, next) => {
    const allCategories = await Category.find({}, "name description")
    .sort({ name: 1 })
    .populate("description")
    .exec();

    res.render("category_list", { title: "Category List", category_list: allCategories });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec(),
    ]);
    if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_detail", {
        title: "Category Detail",
        category: category,
        category_items: itemsInCategory,
    });
});

// Display item Category create form on GET
exports.category_create_get = asyncHandler(async (req, res, next) => {
    res.render("category_form", { title: "Create Category" });
});

// Handle Category create on POST
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name must not be empty")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("description", "Description must not be empty")
      .trim()
      .isLength({ min: 1 })
      .escape(),


    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data
        const category = new Category({ name: req.body.name, description: req.body.description });

        if(!errors.isEmpty()) {
            // There are errors. 
            // Render the form again with 
            // sanitized values/error messages
            res.render("category_form", {
                title: "Create Category",
                category: category,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid.
            // Check if category with same name already exists
            const categoryExists = await Category.findOne({ name: req.body.name })
              .collation({ locale: "en", strength: 2 })
              .exec();
            if (categoryExists) {
                // Category exists, redirect to its detail page.
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                // New category saved. Redirect to category detail page.
                res.redirect(category.url);
            }
        }
    }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of category and all of its items
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec(),
    ]);

    if (category === null) {
        // No results.
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
    }

    res.render("category_delete", {
        title: "Delete Category",
        category: category,
        category_items: itemsInCategory,
    });

});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of category and all of its items
    const [category, itemsInCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({ category: req.params.id }, "name description").exec(),
    ]);

    if(itemsInCategory.length > 0) {
        // Category has items. Render in same way as for GET route.
        res.render("category_delete", {
            title: "Delete Category",
            category: category,
            category_items: itemsInCategory,
        });
        return;
    } else {
        // Category has no books. Delete object and redirect to list of categories.
        await Category.findByIdAndRemove(req.body.categoryid);
        res.redirect("/inventory/categories");
    }
});