const path = require("path");

const orders = require(path.resolve("src/data/orders-data"));

const nextId = require("../utils/nextId");

const dishes = require(path.resolve("src/data/dishes-data"));


//Middleware and validation functions

function hasReqFields(req, res, next) {
    const data = req.body.data || {};
    const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  
    for (const field of requiredFields) {
      if (!data[field]) {
        return next({
          status: 400,
          message: `Order must include a ${field}`,
        });
      }
    }

    const dishes = data.dishes;
    if (!Array.isArray(dishes) || dishes.length == 0) {
      return next({
        status: 400,
        message: "Dish must include at least one dish",
      });
    }

    let error = false;
    dishes.forEach((dish, index) => {
      if (
        !Number.isInteger(dish.quantity) ||
        dish.quanity < 0 ||
        !dish.quantity
      ) {
        error = true;
        next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an number greater than 0`,
        });
      }
    });
    res.locals.data = data;
    if (!error) next();
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const order = orders.find((order) => order.id === orderId);
    if (!order) {
      next({ status: 404, message: `Order does not exist ${orderId}` });
    } else {
      res.locals.order = order;
      next();
    }
}

function statusValid(req, res, next) {
    const order = res.locals.order;
    if (order.status !== "pending") {
      return next({
        status: 400,
        message: `Cannot delete with ${order.status}; status must be pending`,
      });
    }
    next();
}

function idValid(req, res, next) {
    const {
        data: { id, status },
      } = req.body;
      const { orderId } = req.params;
      if (id && id !== orderId) {
        return next({
          status: 400,
          message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
        });
      }
      if (
        !status ||
        !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
      ) {
        return next({
          status: 400,
          message:
            "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
      }
      next();
    }

//CRUD functions

function list(req, res) {
  res.json({ data: orders });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const { orderDish } = req.params;
  const dishOrder = orders.find((order) => order.dishes === orderDish);

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
    res.json({ data: res.locals.order });
  }  

function update(req, res, next) {
if (res.locals.data.hasOwnProperty("id")) {
    delete res.locals.data.id;
}
const updatedOrder = Object.assign(res.locals.order, res.locals.data);
res.json({ data: updatedOrder });
}

function destroy(req, res, next) {
  orders.splice(orders.indexOf(res.locals.order), 1);
  res.sendStatus(204);
}




module.exports = {
  list,
  create: [hasReqFields, create],
  read: [orderExists, read],
  update: [orderExists, hasReqFields, idValid, update],
  delete: [orderExists, statusValid, destroy],
};