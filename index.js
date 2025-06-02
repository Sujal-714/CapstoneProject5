import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
let posts = [];
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Bookreview",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",async(req,res)=>{
   try {
    let result;
    const sortField = req.query.sort;
    const validSortFields = ["id","title", "rating", "created_at"];
    const sortBy = validSortFields.includes(sortField) ? sortField : "id"; // default sort
    if(sortBy === "title" || sortBy === "id"){
    result = await db.query(`SELECT * FROM books ORDER BY ${sortBy}`);
    }else if(sortBy === "rating" || sortBy === "created_at"){
   result = await db.query(`SELECT * FROM books ORDER BY ${sortBy} DESC`);
    }
    posts = result.rows;


    res.render("index.ejs", {posts, sort: sortField || "id" }
    );
  } catch (err) {
    console.log(err);
  }
});
app.get("/create",(req,res)=>{
    res.render("create");
  });

app.post("/submit",async(req,res) =>{
  const { title, description,rating,isbn } = req.body;
  try {
    await db.query("INSERT INTO books (title,description ,rating,isbn) VALUES ($1,$2,$3,$4)", [title,description,rating,isbn]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  // posts.push({id,title,description,image,rating});
  res.redirect("/"); 
});

app.get("/post/:id",async(req,res) =>{
  try {
    const id = req.params.id;
  
    
    const result = await db.query("SELECT * FROM books WHERE id = $1 ",[id]);
    let post = result.rows[0];
   if(!post) return res.status(404).send("Post not found");
  res.render("post",{post});
  } catch (err) {
    console.log(err);
  }
 
});
app.get("/edit/:id",async(req,res) =>{
    try {
    const id = req.params.id;
    
    const result = await db.query("SELECT * FROM books WHERE id = $1 ",[id]);
    let post = result.rows[0];
   if(!post) return res.status(404).send("Post not found");
  res.render("edit",{post});
  } catch (err) {
    console.log(err);
  }
 
  // const post = posts.find(p=>p.id === req.params.id);
  // if(!post) return res.status(404).send("Post not found");
  // res.render("edit",{post});
});

app.post("/edit/:id",async(req,res)=>{
 try {
    const id = req.params.id;
    
    const result = await db.query("SELECT * FROM books WHERE id = $1 ",[id]);
    let post = result.rows[0];
   if(!post) return res.status(404).send("Post not found");
   if(req.body.title && req.body.title !== post.title){
  post.title = req.body.title;  
  }
  if(req.body.description && req.body.description !== post.description){
    post.description = req.body.description; 
    }
    if(req.body.rating && req.body.rating !== post.rating){
    post.rating = req.body.rating; 
    }
     if(req.body.isbn && req.body.isbn !== post.isbn){
    post.rating = req.body.rating; 
    }
   
  await db.query("UPDATE  books SET title = $1, description = $2, rating = $3, image = $4 WHERE id = $5",[post.title ,  post.description,post.rating, post.isbn,id] );
  res.redirect("/post/"+req.params.id);
  } catch (err) {
    console.log(err);
  }
 

});
app.post("/delete/:id",async(req,res) =>{
    try {
    const id = req.params.id;
    
    const result = await db.query("SELECT * FROM books WHERE id = $1 ",[id]);
    let post = result.rows[0];
   if(!post) return res.status(404).send("Post not found");
 await db.query("DELETE FROM books WHERE id = $1",[id]);
 res.redirect("/");
  } catch (err) {
    console.log(err);
  }
// const index = posts.findIndex(p => p.id === req.params.id);
// if(index !== -1) posts.splice(index,1);
// res.redirect("/");
});
app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`);
});