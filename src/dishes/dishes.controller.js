const path = require("path");


const dishes = require(path.resolve("src/data/dishes-data"));


const nextId = require("../utils/nextId");

//Middleware and validation functions

function dishExists(req, res, next) {
    const { dishId } = req.params;
    const dish = dishes.find((dish) => dish.id === dishId);
    if (!dish) {
      return next({ status: 404, message: "Not found" });
    } else {
      res.locals.dish = dish;
      next();
    }
  }

function hasReqFields(req, res, next) {
const data = req.body.data || {};
const requiredFields = ["name", "description", "price", "image_url"];
for (const field of requiredFields) {
    if (!data[field]) {
    return next({
        status: 400,
        message: `Dish must require a ${field}`,
    });
    }
}
next();
}

//CRUD functions 

function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (price < 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const { dishId } = req.params;
  const dish = dishes.find((dish) => dish.id === dishId);
  if (id && id !== dish.id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route:${dishId}`,
    });
  }

  if (!Number.isInteger(price) || price <= 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0,`,
    });
  }

  if (dish.name !== name) {
    dish.name = name;
  }
  if (dish.description !== description) {
    dish.description = description;
  }
  if (dish.price !== price) {
    dish.price = price;
  }
  if (dish.image_url !== image_url) {
    dish.image_Url = image_url;
  }
  res.json({ data: dish });
}

module.exports = {
  list,
  create: [hasReqFields, create],
  read: [dishExists, read],
  update: [dishExists, hasReqFields, update],
};