const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const validFields=[]

function hasValidFields(req, res, next) {
    const { data = {} } = req.body;
  
    const invalidFields = Object.keys(data).filter(
      (field) => !validFields.has(field)
    );
  
    if (invalidFields.length){
      return next({
        status: 400,
        message: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }
    return next();
  }

function validateOrder(req, res, next){
    const {data} = req.body;
    error = []
    if(typeof(data)==='object'){
        const {deliverTo, mobileNumber, dishes} = data
        if(deliverTo?.trim().length===0 || deliverTo===undefined) error.push('Deliver to is required')
        if(mobileNumber?.trim().length===0 || mobileNumber===undefined) error.push('Mobile number is required')
        if(dishes.length===0 || typeof(dishes) !=='array') error.push('dishes must be an array and contain at least 1 dish')
        for(dish in dishes){
            if(dish.quantity <= 0 || typeof(dish.quantity) !=='number') error.push('Dish quantity must be a positive number')
        }
    } else error.push('data must be an object containing post request')
    if(error.length===0){ 
        res.locals.newOrder =data
        return next() 
    }else {
        error=Array.from(error).join(', ')
        return next({status:400, message: error})}

}
function list(req, res, next){
    return res.status(200).json({data: orders})
}

function create(req, res, next){
    let order = res.locals.newOrder
    order.id=nextId
    orders.push(order)
    return res.status(201).json({data: order})
}

function read(req, res, next){
    
}

function update(req, res, next){
    
}

function destroy(req, res, next){
    
}

module.exports = {
    list,
    create:[validateOrder, create],
    read,
    update,
    destroy
}