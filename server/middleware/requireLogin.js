const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const User = mongoose.model("User");

module.exports = (req,res,next)=>{
  const {authorization} = req.headers;

  if(!authorization){
     res.json({error:"You must login first"});
  }
  const token = authorization.replace("Bearer ","")
  jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
    if(err){
       res.json({error:"You must login first"});
    }

    const {_id} = payload
    User.findById(_id).then(userdata=>{
        req.user = userdata
        next()
    })
  })
}
