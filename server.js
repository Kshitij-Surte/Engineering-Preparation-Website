const express = require("express");
const app = express();
const upload = require("express-fileupload");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require("fs");
const ejs = require('ejs');
mongoose.connect("mongodb://localhost:27017/pracDB", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(upload());
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// setting the port at which server is running 
const port =  5000 || process.env.PORT; 
// initialization of arrays to keep a track of content to be displayed 
var fe = [];
var secomps = [];
var error = 0;
var subjects =[];
var rooms = ["public"];

// Creating schema 
const studyMaterialSchema = new mongoose.Schema({
    year: String,
    subjectName: String,
    topicName: String,
    notes: String,
    formulae: String,
    py: String,
    competativeNotes: String,
});

const announcementSchema = new mongoose.Schema({
    teacherName: String,
    date : String,
    year : String,
    announcementHeading: String,
    announcementBody: String
});

const chatSchema = new mongoose.Schema({
    roomName : String,
    name: String,
    message: String,
    image: String
});

const reviewSchema = new mongoose.Schema({
    name: String, 
    email: String,
    rating: Number,
    feedback: String
});



// creation of collections 
const studyMaterial = mongoose.model("studyMaterial", studyMaterialSchema);
const announcement = mongoose.model("annoucement", announcementSchema);
const chat = mongoose.model("chat", chatSchema);
const review = mongoose.model("review", reviewSchema);

    // sample data to store and check the exitance and workoing of db 
    
    //     const sampleUpload = new studyMaterial ({
    //         year: "fe",
    //         subjectName: "subject",
    //         topicName: "Topic",
    //         notes: "notes.pdf",
    //         formulae: "formula.pdf",
    //         py: "past_year_questions.pdf",
    //         competativeNotes: "CompetativeNotes.pdf",
    // });
    // sampleUpload.save();

    const sampleAnnnouncemnet = new announcement({
        teacherName: "teachername",
        date : "16/4/21",
        year : "global",
        announcementHeading: "head",
        announcementBody: "Body" 
    });
    sampleAnnnouncemnet.save();

    const sampleChat= new chat({
        roomName : "public",  
        name: "BOT",
        message: "Welcome to chatroom",
        image: "no image"
    });
    sampleChat.save();

    const reviewsample = new review({
        name: "XYZ",
        email: "xyz@gmail.com",
        rating: 7,
        feedback: "Great Efforts !!"
    });
    reviewsample.save();



app.get("/", (req, res)=>{ 
    res.render("homePage",{ FESubjects: fe, SECompsSubjects: secomps, chatroom: rooms}); 

});  

app.get("/about", (req, res)=>{ 
    res.render("about",{ chatroom: rooms}); 

});  

app.get("/login", (req, res)=>{
    res.render("login"); 

}); 
app.post("/login", (req, res)=>{
    const username = req.body.user;
    const password = req.body.pass;
    if(username === "teacher" && password === "password")
    {
        // console.log("logged in");
        res.render("teacher");
    }
    else{
        res.render("error");
    }
  });

app.get("/announcement", (req, res)=>{
    announcement.find({}, function(err, announcements){
        if(!err){
            res.render("announcement", {announcements: announcements, chatroom: rooms});
        }
    });   
});

// review related stuff 
app.get("/review", (req, res)=>{
    review.find({}, function(err, reviews){
        res.render("review", { reviews: reviews, chatroom: rooms});
    });
});

app.post("/newreview", (req, res)=>{
    const usernaam = req.body.username;
    const emailid = req.body.email;
    const rating = req.body.rating;
    const feedback = req.body.feedback;
    if(rating > 10){
        res.render("error");
    }
    else{
        const reviewsample = new review({
            name: usernaam,
            email: emailid,
            rating: rating,
            feedback: feedback
        });
        reviewsample.save();
        res.redirect("/review")
    }

});

app.post("/search", (req, res)=>{
    const search = _.toLower(req.body.search); 
    let searchele = "/" + search;
    // console.log(searchele);
    res.redirect(searchele);
});

// when the user selects a particular subject  
app.get("/:subject", (req, res)=>{
    const subject = req.params.subject;
    // console.log(subject);
    var subjectName = _.toLower(subject);
    if(subjects.includes(subjectName)){   
        studyMaterial.find({subjectName: subjectName}, function(err, subjectInfo){
            res.render("subject", {subjectInfo: subjectInfo, chatroom: rooms, subjectName: subjectName});
        });
    }
    else{
        res.redirect('/');
    }
});   


 

 



app.post("/upload", (req,res)=>{
    if(req.files)
    {
        // for chapter notes 
        var notesFile = req.files.notes;
        var notes = notesFile.name;
        // console.log(notes); 
        notesFile.mv("./public/uploads/"+notes, function (err) {
            if(err){
                console.log("file:"+ notes +"not uploaded due to an error");
                error++;
            }
        }); 
        // for formulae file 
        var formulaeFile = req.files.formulae;
        var formulae = formulaeFile.name;
        formulaeFile.mv("./public/uploads/"+formulae, function (err) {
            if(err){
                console.log("file:"+ formulae +"not uploaded due to an error");
                error++;
            }
        });
        // for past-year questions file 
        var pyFile = req.files.py;
        var py = pyFile.name;
        pyFile.mv("./public/uploads/"+py, function (err) {
            if(err){
                console.log("file:"+ py +"not uploaded due to an error");
                error++;
            }
        });
        // for competative notes file 
        var competativeNotesFile = req.files.competativeNotes;
        var competativeNotes = competativeNotesFile.name;
        competativeNotesFile.mv("./public/uploads/"+competativeNotes, function (err) {
            if(err){
                console.log("file:"+ competativeNotes +"not uploaded due to an error");
                error++;
            }
        });

        // creatimg ay kind-of string to all lower case 
        var yearFinal = _.toLower(req.body.year);
        var subjectFinal = _.toLower(req.body.subject);
        var topicFinal = _.toLower(req.body.topic);
        

        if(yearFinal == "fe")
        {
            fe.push(subjectFinal); 
            subjects.push(subjectFinal); 
             // creation of the object to be saved in DataBase 
            const sample = new studyMaterial ({
                year: "fe",
                subjectName: subjectFinal,
                topicName: topicFinal,
                notes: notes,
                formulae: formulae,
                py: py,
                competativeNotes: competativeNotes,
            });
            sample.save();
        }
        if(yearFinal == "secomps")
        {
            secomps.push(subjectFinal);
            subjects.push(subjectFinal);
             // creation of the object to be saved in DataBase 
             const sample = new studyMaterial ({
                year: "secomps",
                subjectName: subjectFinal,
                topicName: topicFinal,
                notes: notes,
                formulae: formulae,
                py: py,
                competativeNotes: competativeNotes,
                });
            sample.save();
        }
           

  
    }
    res.redirect("success");
});
// delete a file 
app.post("/delete", (req,  res)=>{
    const field = req.body.feild;
    const topicname = req.body.topicName;
    const filename = req.body.filename;
    fs.unlink( __dirname + "/" + filename, function (err) {
        if (!err)
         {
            console.log('File deleted!');
            res.send("success");
        }
        
    }); 
//   studyMaterials.updateOne({ topic: topicname},{$set:{ ${feild}: ""}});
  
});

// update the existing file 
app.post("/update", (req,res)=>{
    console.log("into update");
    if(req.files){
        var file = req.files.file;
        var filename = file.name; 
        console.log("file received"); 
        fs.unlink( __dirname + "/" + filename, function (err) {
            if (!err)
             {
                console.log('File deleted!');
            }
            
        });  
        console.log("hello");
      file.mv("./uploads/"+filename, function (err) {
        if(!err){
           res.render("success");            
        }

     });
    }

});




// announcements related stuff 

 

app.post("/newAnnouncement", (req, res)=>{
    const teacherName = req.body.teacherName;
    const date = req.body.date; 
    const announcementHeading = req.body.announcementHeading;
    const announcementBody = req.body.announcementBody;
    const year = _.toLower(req.body.year);
     // creation of the object to be saved in DataBase 
    const notice = new announcement ({
        teacherName: teacherName,
        date : date,
        year : year,
        announcementHeading: announcementHeading ,
        announcementBody: announcementBody
        });
        notice.save();
    res.redirect("/announcement");
});

// creation of rooms related stuff 
app.post("/createRoom", (req,res)=>{
    const roomName = req.body.roomName;
    if(rooms.includes(roomName)){
        res.redirect(`/doubtroom/${roomName}`);
    }
    else{
        rooms.push(roomName);
        const sampleChat= new chat({
            roomName : roomName,
            name: "BOT",
            message: `Welcome to ${roomName} chatroom`,
            image: "no image" 
        });
        sampleChat.save();
        res.render("success"); 
    }
    
});

//chat room related stuff 
app.get("/doubtroom/:roomname", (req,res)=>{
  const roomName = req.params.roomname;
  chat.find({roomName: roomName}, (err, chats)=>{
      res.render("chat",{ chat: chats, room: roomName, chatroom: rooms});  
      
    });
    
});
app.post("/newchat", (req,res)=>{  
    const roomName = req.body.room;
    let url = "/doubtroom/" + roomName;
  const user = req.body.name;
  const message = req.body.message;
         if(req.files)
         {
              // for image file 
              const imageFile = req.files.imgfile;
              const filename = imageFile.name;
              const extension = filename.slice(-3);
            //   console.log(extension);
              if( extension ==="jpg" || extension ==="peg" || extension ==="png"  )
              {
                //   console.log("into");
                  imageFile.mv("./public/doubtroom/files/"+ filename, function (err) {
                      if(err){
                          console.log("file:"+ filename +"not uploaded due to an error");
                          res.render("error");
                          error++;
                          
                      }
                      else{
                        const samp = new chat ({
                            roomName : roomName,
                            name: user,
                             message: message,
                             image: filename
                        });
                            samp.save();   
                            res.redirect(url); 
                     }
                    });
              } // end 0f extension condition
              else{
                  res.render("error");
              }
         } // end of required files condition

        else
        { 
            const samp = new chat ({
                roomName : roomName,
                name: user,
                 message: message,
                 image: "no image"
            });
                samp.save();  
                res.redirect(url); 
        }

});





app.listen(port, ()=>{console.log(`server running at http://localhost:${port}`);});