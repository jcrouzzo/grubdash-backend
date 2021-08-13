const path = require("path");
const { forEach } = require("../data/dishes-data");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// MIDDLEWARE functions to be used in controller
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish === undefined) {
    return next({
      status: 404,
      message: `Dish ID '${dishId}' is not found.`,
    });
  } else {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    next();
  }
}

function validateDishBody(req, res, next) {
  const { data } = req.body;
  const {
    data: { name, description, image_url, price },
  } = req.body;
  const properties = ["name", "description", "image_url", "price"];

  if (!data) {
    return next({ status: 400, message: `A 'data' property is required.` });
  }

  for (value of properties) {
    if (
      !data.hasOwnProperty(value) ||
      data[value] === "" ||
      data[value === null]
    ) {
      return next({ status: 400, message: `Dish must include a ${value}` });
    }
  }

  if (!Number.isInteger(price) || price <= 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  res.locals.name = name;
  res.locals.description = description;
  res.locals.image_url = image_url;
  res.locals.price = price;

  return next();
}

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res) {
  const newDish = {
    id: nextId,
    name: res.locals.name,
    description: res.locals.description,
    price: res.locals.price,
    image_url: res.locals.image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  const dish = res.locals.dish;
  res.status(200).json({ data: dish });
}

function update(req, res) {
  const dishIdInBody = req.body.data.id;
  const dishId = res.locals.dishId;
  if (dishIdInBody === undefined) {
    next();
  }

  if (dishIdInBody !== dishId) {
    return next({
      status: 404,
      message: `Dish id does not match route id. Dish: ${dishIdInBody}, Route: ${dishId}`,
    });
  }
}

function list(req, res) {
  res.status(200).json({ data: dishes });
}

module.exports = {
  list,
  create: [validateDishBody, create],
  read: [dishExists, read],
  update: [dishExists, validateDishBody, update],
};
