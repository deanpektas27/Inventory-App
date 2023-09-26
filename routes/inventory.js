const express = require("express");
const router = express.Router();

// Require controller modules
const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");

// INVENTORY ITEM ROUTES //

// GET inventory home page
router.get("/", item_controller.index);

// GET request for creating item.
router.get("/item/create", item_controller.item_create_get);

// POST request for creating item.
router.post("/item/create", item_controller.item_create_post);

// GET request for updating item.
router.get("/item/:id/update", item_controller.item_update_get);

// POST request for updating item.
router.post("/item/:id/update", item_controller.item_update_post);

// GET request for deleting item.
router.get("/item/:id/delete", item_controller.item_delete_get);

// POST request for deleting item.
router.post("/item/:id/delete", item_controller.item_delete_post);

// GET request for one item.
router.get("/item/:id", item_controller.item_detail);

// GET request for list of all store items.
router.get("/items", item_controller.item_list);

// INVENTORY CATEGORY ROUTES //

// GET request for creating category.
router.get("/category/create", category_controller.category_create_get);

// POST request for creating category.
router.post("/category/create", category_controller.category_create_post);

// GET request for deleting category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request for deleting category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request for one category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all store item categories.
router.get("/categories", category_controller.category_list);

module.exports = router;