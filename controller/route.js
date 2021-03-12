const express = require('express')
const router = express.Router();
const bodyParser = require('body-parser')
const path = require('path');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const config = require('../config/config')
const User = require('../model/UserSchema')
const Movie = require('../model/MovieSchema')
const db = require('../config/db')


router.use(bodyParser.json({ extended: false })); // using the body-parser module
router.use(cookieParser())


router.post('/register', (req,res)=>{
    User.findOne({email: req.body.email},(err,user)=>{
        if(user){
            res.send("User already registered!")
        }
        else{
            bcrypt.hash(req.body.password, 10,function(err, hash){    //hashing the password using bcrypt
                User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    is_admin: req.body.is_admin   
                })
            })
            res.send("user registered successfully")
        }
})
    
})


router.post('/login',(req, res)=>{
    User.findOne({email: req.body.email},(err,user)=>{
        if(!user) return res.send("No user found, register first!")
        else{
            const passIsValid = bcrypt.compare(req.body.password, user.password) //comparing the password
            if (!passIsValid) return res.send("Invalid password")
            else{
                const token = jwt.sign({id:user._id},config.secret,{ expiresIn:3600})
                User.findOneAndUpdate({email: req.body.email}, {$set: {is_active: true, key: token}},function(err,result){
                    if(err){
                        console.log(err)
                    } 
                })
                res.cookie("token",token)
                res.send(`Welcome ${user.name} your token is ${token}`)
            }
        }
})
})
//creating movie route
router.post('/movie',(req,res)=>{
    jwt.verify(req.cookies.token, config.secret, (err, data)=>{
        // console.log(data)
        if (err){
            // console.log("error")
            res.send("Login/Register to get access!")
        }
        else{
            Movie.findOne({name: req.body.movie_name},{_id:0,numVotes:0,__v:0},(err,movie)=>{
                if(movie == null){
                    res.send("Movie not found!")
                }
                else{
                    Movie.find({"genre":movie.genre,"name":{$ne:movie.name}},{_id:0,numVotes:0,__v:0}).sort({"rating":-1}).exec(function(err,model){
                        res.json({"your movie":movie,
                                    "Movie Recomendation":model    //giving movie recomendation
                                })
                    })
                }                        
            })
        }
    })
})

//creating rating route
router.post('/rating', (req,res)=>{
    jwt.verify(req.cookies.token, config.secret, (err, data)=>{
        if (err){
            // console.log("error")
            res.send("Login/Register to get access!")
        }
        else{
            Movie.findOne({name: req.body.movie_name},{},(err,movie)=>{
                if(movie == null){
                    res.send("Movie not found!")
                }
                else{
                    //updating the ratings
                    const new_rating = (((movie.rating * movie.numVotes) + req.body.rating)/(movie.numVotes+1)).toFixed(1)
                    const new_numVotes = movie.numVotes+1
                    Movie.findOneAndUpdate({'name':movie.name},{$set:{'rating':new_rating, 'numVotes':new_numVotes}},function(err,result){
                        if(err){
                            throw err
                        }
                    })
                    Movie.findOne({name: req.body.movie_name},{_id:0,__v:0},(err,movie)=>{
                        if(err){
                            throw err
                        }
                        else{
                            //displaying the updated movie details
                            res.json({
                                "message": "Rating successfully updated",
                                movie
                            })
                        }
                    })
                }
            })
        }
    })
})


router.post('/admin', (req,res)=>{
    jwt.verify(req.cookies.token, config.secret, (err, data)=>{
        if (err){
            res.send("Login/Register to get access!")
        }
        else{
            User.findOne({_id: data.id},(err,user)=>{
                if(err){
                    throw err
                }
                else{
                    if(user.is_admin){
                        const operation = req.body.operation
                        if(operation == "add_movie"){
                            Movie.create({
                                name: req.body.name,
                                rating: req.body.rating,
                                year: req.body.year,
                                genre: req.body.genre,
                                numVotes: req.body.numVotes
                            })
                            res.send("Successfully added movie")
                        } else if(operation == "delete_movie"){
                            Movie.findOne({name: req.body.name},function(err,movie){
                                if(movie == null){
                                    res.send("Movie not found to delele!")
                                }
                                else{
                                    Movie.deleteOne({'name':movie.name},function(err, result){
                                        res.send("Successfully deleted....")
                                    })
                                }
                            
                            })
                        } 
                    }else{
                        res.status(404) 
                        res.send(" Restricted area, you are not an admin")
                    } 
                }
            })
        }
})
})


router.post('/logout', (req,res)=>{
    jwt.verify(req.cookies.token, config.secret, (err, data)=>{
        res.clearCookie('token');
        res.send('Logged out, Hope to see you again!');
    })
})


module.exports = router;