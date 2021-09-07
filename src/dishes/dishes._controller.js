const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//middleware
function dishExists(req, res, next){
    const dishId=req.params.dishId
    foundDish = dishes.find((dish) => dish.id===dishId)
    if(foundDish){
        res.locals.foundDish=foundDish
        return next()
    }else{
        return next({status:404, message:'dish does not exist'})
    }
}

function validateCreate(req, res, next){
    const {data} = req.body
    error=[]
    //start by verifying data exists and is an object
    if(typeof(data)==="object"){
        const { name, description, price, image_url} = data
    //then verify name exists and contains text
        if(name?.trim().length===0 || name === undefined) error.push('name is required')
    //then same with description
        if(description?.trim().length===0 || description === undefined) error.push('description is required')
    //verify price is a number greater than 0
        if(price <=0 || price===undefined|| typeof(price) !== 'number') error.push('price must be greater than 0 and a valid number')
    //verify image is not empty
        if(image_url?.trim().length===0 ||image_url===undefined) error.push('image_url must not be empty')
    //save the data to response.locals and call next
    }else{ 
        error.push('Updated item must be inside a data key of build type {data: {name, description, price, image_url}')
    }
        if(error.length===0){ 
            res.locals.newItem =data
            return next()
        }else {
            error=Array.from(error).join(', ')
            return next({status:400, message: error})}
    
}

function validateUpdate(req, res, next){
    const {data} = req.body
    error=[]
    //start by verifying data exists and is an object
    if(typeof(data)==="object"){
        const { name, description, price, image_url} = data
    //then verify name exists and contains text
        if(name?.trim().length===0 || name===undefined) error.push('name is required')
    //then same with description
        if(description?.trim().length===0|| description===undefined) error.push('description is required')
    //verify price is a number greater than 0
        if(price <=0 || price === undefined || typeof(price) !== 'number') error.push('price must be greater than 0 and a valid number')
    //verify image is not empty
        if(image_url?.trim().length===0 || image_url===undefined) error.push('image url must not be empty')
    //save the data to response.locals and call next
    }else{ error.push('Updated item must be inside a data key of build type {data: {name, description, price, image_url}')}
        if(error.length===0){ 
            res.locals.newItem =data
            return next()
        }else {
            error = Array.from(error).join(', ')
            return next({status:400, message: error})}
    
}

function validateDishId(req, res, next){
    const dishId = req.params.dishId
    const {data}=req.body
    let error = ''
        if(data.id!==undefined || data.id?.length !== 0){
            if(data.id!==dishId){
                error = `please double check your submission you may have used incorrect id, submitted: ${dishId} , body contains: ${data.id}`
            }
        
            if(error.length){
                res.locals.idError=error
                return next()
            }
    }else return next()
}


//CRUD functions 
function list(req, res, next){
    return res.status(200).json({data: dishes})
}

function create(req, res, next){
    const dish = res.locals.newItem
    dish['id']=nextId()
    console.log('should be dish with id', dish)
    dishes.push(dish)
    return res.status(201).json({data: dish})
}

function read(req, res, next){
    return res.status(200).json({data: res.locals.foundDish})
}

function update(req, res, next){
    let existing = res.locals.foundDish
    const update = req.body.data
    
    for(let key of Object.keys(update)){
        existing[key]=update[key]
    }
    if(res.locals.idError) {
        
        return res.status(400).json({error: res.locals.idError})
    } else return res.status(200).json({data: existing})
}


module.exports = {
    list,
    create: [validateCreate, create],
    read: [dishExists, read],
    update: [dishExists, validateUpdate , validateDishId, update],
}