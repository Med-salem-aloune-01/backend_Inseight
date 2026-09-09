const { User, Admin, Teacher, Student } = require("../models/User");
const { notifyAdmins } = require("./notificationController.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {
  const { firstName, lastName, email, phone, password, role, studentCode, speciality, department } = req.body;

  try {
    const userExiste = await User.findOne({ email });

    if (userExiste) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = { firstName, lastName, email, phone, password: hashedPassword };

    let user;
    if (role === 'teacher') {
      user = await Teacher.create({ ...payload, speciality , department });
    } else {
      user = await Student.create({ ...payload, studentCode });
    }

    if (user.role === 'student') {
      await notifyAdmins({
        title: 'Nouvel étudiant inscrit',
        message: `${user.firstName} ${user.lastName} vient de créer un compte.`,
        type: 'new_student',
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: "Identifiants invalides"
      });
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!isMatch) {
      return res.status(400).json({
        message: "Identifiants invalides"
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );


    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });


  } catch(error) {

    res.status(500).json({
      message:error.message
    });

  }
};




exports.logout = async (req,res)=>{

  res.clearCookie("token");

  res.status(200).json({
    success:true,
    message:"Déconnexion réussie"
  });

};




exports.updateProfile = async(req,res)=>{

  try {

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new:true
      }
    );


    res.status(200).json({
      success:true,
      data:user
    });


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }

};



exports.changePassword = async(req,res)=>{

  try {

    const {
      currentPassword,
      newPassword
    } = req.body;


    
    const user = await User.findById(req.user.id).select('+password');


    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );


    if(!isMatch){

      return res.status(400).json({
        message:"Mot de passe actuel incorrect"
      });

    }


    user.password = await bcrypt.hash(
      newPassword,
      10
    );


    await user.save();


    res.status(200).json({
      success:true,
      message:"Mot de passe mis à jour"
    });



  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }

};