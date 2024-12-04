const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
// const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

//Register endpoint
router.post('/register', async(req,res)=>{
    try {
        const {username, email, password}=req.body
        const user = new User({email, username, password})
        await user.save()
        res.status(201).send({message:"user registered successfully"})
        console.log(req.body)
    } catch (error) {
        console.log("errors Registering user",error)
        res.status(500).send({message: "errors Registering user"})
        
    }
})

//login endpoint
router.post('/login',async (req,res)=>{
    const {email, password}=req.body
    
    try {
        const user= await User.findOne({email})
    if(!user){
        return res.status(400).send({message: 'User Not Found'})
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch){
        return res.status(400).send({message:'Password not matched'})
    }

    const token = await generateToken(user._id)
    // console.log(token)

    res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite: 'none'
    })


    res.status(200).send({message:'Logged in Successfully',token,user:{
        _id:user._id,
        email:user.email,
        username:user.username,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        profession: user.profession
    }})
    } catch (error) {
        console.log("errors logged in user",error)
        res.status(500).send({message: "errors logged in user"})
    }

    
})

//jwt token verification endpoint
// router.get('/users',verifyToken,async(req,res)=>{
//     res.send({message : "protected users"})
// })

//logout endpoint
router.post('/logout',(req, res)=>{
    res.clearCookie('token')
    res.status(200).send({message:'Logged out Successfully'})
})

//delete user
router.delete('/users/:id',async(req,res)=>{
    try {
        const {id}=req.params
        const user = await User.findByIdAndDelete(id)
        if(!user){
            return res.status(404).send({message : 'User Not FOund'})

        }
        res.status(200).send({message : 'User Deleted Successfully'})
    } catch (error) {
        console.log("errors Deleting user",error)
        res.status(500).send({message: "errors Deleting user"})
    }
})


//get all users
router.get('/users', async(req,res)=>{
    try {
        const users = await User.find({},'id email role').sort({createdAt:-1})
        res.status(200).send(users)
    } catch (error) {
        console.log("errors Registering user",error)
        res.status(500).send({message: "errors Fetching user"})
    }
})

//update user role
router.put('/users/:id', async (req,res)=>{
    try {
        const {id}=req.params
        const {role}=req.body
        const user = await User.findByIdAndUpdate(id, {role}, {new: true})

        if(!user){
            return res.status(404).send({message : 'User Not Found'})
        }
        return res.status(200).send({message : 'User role Updated successfully',user})

    } catch (error) {
        console.log("errors Updating user role",error)
        res.status(500).send({message: "errors Updating user role"})
    }
})

//edit or update profile
router.patch('/edit-profile', async (req,res)=>{
    try {
        const {userId, username, profileImage, bio, profession}=req.body

        if(!userId){
            return res.status(400).send({message : 'User ID is Required'})
        }
        const user = await User.findById(userId)
        console.log(user)

        if(!user){
            return res.status(400).send({message : 'User not Found'})
        }
        //update profile
        if(username !== undefined) user.username = username
        if(profileImage !== undefined) user.profileImage = profileImage
        if(bio !== undefined) user.bio = bio
        if(profession !== undefined) user.profession = profession

        await user.save()
        res.status(200).send({
            message:'Profile Updated Successfully',
            user:{
                _id:user._id,
                email:user.email,
                username:user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        })

    } catch (error) {
        console.log("errors Updating user Profile",error)
        res.status(500).send({message: "errors Updating user Profile"})
    }
})

module.exports= router