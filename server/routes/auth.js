require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const router = express.Router();
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:process.env.SENDGRID_API
    }
}))

router.post("/register", function(req, res) {

  const {name,email,password} = req.body;

  if(!email || !password || !name){
     return res.json({error:"Please add all the fields"})
  }

  User.findOne({email}, function(err, foundUser) {
    if (!err) {
      if (foundUser) {
        res.json({error:"Already registered!"});
      } else {
        bcrypt.hash(password, 10, function(error, hash) {
          if(!error){
            const user = new User({
              name,
              email,
              password: hash
            });

            user.save(function(err) {
              if (!err) {
                transporter.sendMail({
                    to:user.email,
                    from:"no-reply@bms.com",
                    subject:"Registration Successfully Done",
                    html:`<h1>welcome to My Bank</h1><p>Your Unique ID is:${user._id}`
                });
                res.json({message:"Successfully registered!"});
              } else {
                console.log(err);
              }
            });
          }else{
            console.log(error);
          }
        });
      }
    }else{
      console.log(err);
    }
  });
});

router.post("/login", function(req, res) {
  const {email,password} = req.body;

  if(!email || !password){
     res.json({error:"Please add email or password"});
  }

  User.findOne({email},function(err, foundUser){
    if(!err){
      if(foundUser){
        bcrypt.compare(password,foundUser.password,function(err,result){
          if(result){
            const token = jwt.sign({_id:foundUser._id},process.env.JWT_SECRET);
            const {_id,name,email} = foundUser;
            res.json({token,user:{_id,name,email}});
          }
        });
      }
    }else{
      console.log(err);
    }
  });
});

router.get("/myaccount", requireLogin, function(req, res) {
  User.find(req.user._id,function(err, foundAccount){
    if(!err){
      if(foundAccount){
        res.json(foundAccount);
      }
    }else{
      console.log(err);
    }
  });
});

router.post("/addmoney", function(req,res) {
  const {money,_id} = req.body;

  User.findById({_id},function(err, foundUser){
    if(!err){
      if(foundUser){
        if(!foundUser.money){
          foundUser.money = money;
        }else{
          foundUser.money = Number(foundUser.money) + Number(money);
        }
        foundUser.save(function(error){
          if(error){
            console.log(error);
          }else{
            res.json({message: "Added"});
          }
        });
      }
    }else{
      console.log(err);
    }
  });
});

router.post("/sendmoney", function(req,res) {
  const {money,_id,email} = req.body;

  User.findById({_id},function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(Number(foundUser.money) < 200){
          res.json({error: "You don't have enough balance"});
        }
        else{
          foundUser.money= Number(foundUser.money) - Number(money);
        }
      }
      foundUser.save(function(error){
        if(error){
          console.log(error);
        }else{
          res.json({message: "Sent"});
        }
      });
    }
  });

  User.findOne({email},function(err,foundUser) {
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(!foundUser.money){
          foundUser.money = money;
        }else{
          foundUser.money = Number(foundUser.money) + Number(money);
        }
      }
      foundUser.save(function(error){
        if(error){
          console.log(error);
        }else{
          res.json({message: "Sent"});
        }
      });
    }
  });
});

module.exports = router;
