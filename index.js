const express = require('express')
const app = express()
const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt')
const multer = require("multer")
const cookieParser = require('cookie-parser')

const cookie_secret = "fortniteamongus"

app.use(cookieParser());

//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images")
	}, 
	filename: (req, file, cb) => {
		//cb(null, req.body.name + path.extname(file.originalname))
		cb(null, req.body.name + '.png')
	}
})

const upload = multer({storage: storage})

//db.run("CREATE DATABASE test;")
//let db = new sqlite3.Database(':memory:');
let db
db = new sqlite3.Database('./test.db', (err)=>{
	if(err){
		console.log("database error")
		db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE)
	}
})

db.run(`CREATE TABLE dex (
	name CHAR(10), 
	type1 CHAR(10),
	type2 CHAR(10),
	HP INT(255),
	Atk INT(255),
	Def INT(255),
	SpA INT(255),
	SpDef INT(255),
	Spe INT(255),
	BST INT(255));`, (err)=>{
		if(err){
			console.log("table already made")
		}
	})

db.run(`CREATE TABLE passwords (
	username CHAR(255), 
	password CHAR(255));`, (err)=>{
		if(err){
			console.log("password table already made")
		}
	})
/*
db.run(`CREATE TRIGGER bst_insert
		AFTER INSERT 
		ON dex trigger_type
		EXECUTE stored_procedure_name;`)
*/
/*
let query = `UPDATE dex SET bst = (SELECT SUM(Hp + Atk + Def + SpA + SpDef + Spe) 
			FROM dex WHERE name = '` + req.body.name + `') WHERE name = '` + req.body.name + `';`
*/

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

/*
function generateToken(){

}
*/

function authenticate(req){
	let token = req.cookies["acesskey"]
	console.log(token)
	console.log(req.cookies["username"])

	let rtrn_value = false
	jwt.verify(token, cookie_secret, (err, user) => {
    	if(err){
    		console.log(err)
    		rtrn_value = false
    	}else if(user == req.cookies["username"]){
			console.log("valid acess in auth function")
			rtrn_value = true;
		}else{
			console.log("invalid cookie or secret")
			rtrn_value = false
		}
	})
	return rtrn_value
}
app.get("/view/:name", (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	console.log('website acessed')
	db.get("SELECT * FROM dex WHERE name = ?;", [req.params.name], (err, row) =>{
		if (err){
			console.log("error");
			res.send("error encountered please try again later")
		}else if(row == undefined){
			console.log("no data");
			res.send("no data for " + req.params.name)
		}else{
			console.log(row)
			res.render("get", {name: row.name, type1: row.type1, type2: row.type2, 
								hp: row.HP, atk: row.Atk, def: row.Def, spa: row.SpA,
								spdef: row.SpDef, spe: row.Spe, bst: row.BST,
								img_name: "/images/" + row.name+".png"})
		}
	})
})

app.get("/view", (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	console.log(req.body.name)
	res.render("get")
})


app.get("/create", (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	console.log('entering data')
	res.render("create")
})
app.get("/update", (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	console.log('updating data')
	res.render("update")
})


//name: type1, type2, hp, atk, def, spa, spdf, spe, bst
app.post("/create", upload.single("image"), (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	db.get("SELECT COUNT(1) FROM dex WHERE name = '" + req.body.name + "';", (err, val) =>{
		if (err){
			console.log("error");
			res.send("error encountered please try again later")
		}else if(val['COUNT(1)'] == 0){
			console.log(req.body.name + " does not already exist")
			console.log(val)
			db.run(`INSERT INTO dex (name, type1, type2, Hp, Atk, Def, SpA, SpDef, Spe)
			 	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
			 	[req.body.name, req.body.type1, req.body.type2, req.body.hp, req.body.atk, req.body.def, req.body.spa, req.body.spdef, req.body.spe],  
			 	(err)=>{
			 	if(err){
			 		console.log(err)
			 	}
			})
			
			let query = `UPDATE dex SET bst = (SELECT SUM(Hp + Atk + Def + SpA + SpDef + Spe) 
			FROM dex WHERE name = '` + req.body.name + `') WHERE name = '` + req.body.name + `';`
			db.run(query)
			
			
			req.image
			res.send("data created for " + req.body.name)
		}else{
			console.log("data already exists for " + req.body.name)
			res.send("data already exists for " + req.body.name)
		}
	})
	
})
"UPDATE dex SET bst = 8 WHERE ;"
"SELECT SUM(Hp + Atk + Def + SpA + SpDef + Spe) FROM dex WHERE name = "
app.post("/update", upload.single("image"), (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	res.send(`${req.body.name}: ${req.body.type1}/${req.body.type2}\n
			Hp: ${req.body.hp}\n
			Atk: ${req.body.atk}\n
			Def: ${req.body.def}\n
			SpA: ${req.body.spa}\n
			SpDef: ${req.body.spdef}\n
			Spe: ${req.body.spe}\n
			Bst: ${req.body.hp + req.body.atk + req.body.def + req.body.spa + req.body.spdef + req.body.spe}`)
	let arr = [["type1", req.body.type1], ["type2", req.body.type2], ["Hp", req.body.hp], ["Atk", req.body.atk], 
		["Def", req.body.def], ["SpA", req.body.spa], ["SpDef", req.body.spdef], ["Spe", req.body.spe]]

	let sqlstring = "UPDATE dex SET " 
	arr.forEach((tup)=>{
		if(tup[1] != "" && tup[1] != undefined){
			if(tup[0] == "type1" || tup[0] == "type2"){
				tup[1] = "'" + tup[1] + "'"
			}
			sqlstring = sqlstring + tup[0] + " = " + tup[1] + ", "
		}
	})
	if(sqlstring[sqlstring.length-1] == ' ' && sqlstring[sqlstring.length-2] == ','){
		sqlstring = sqlstring.slice(0, sqlstring.length-2) + " "
	}

	sqlstring = sqlstring + "WHERE name = '" + req.body.name + "';"
	db.run(sqlstring, (err)=>{
		if(err){
			console.log(err)
		}
	})
	
	let query = `UPDATE dex SET bst = (SELECT SUM(Hp + Atk + Def + SpA + SpDef + Spe) 
			FROM dex WHERE name = '` + req.body.name + `') WHERE name = '` + req.body.name + `';`
	db.run(query)
	
})

app.get("/register", (req, res, next) =>{
	console.log("registering")
	res.render("register")
})

app.post("/register", (req, res, next) =>{
	console.log(`username:${req.body.username} password:${req.body.password}`)
	bcrypt.hash(req.body.password, 10).then(hashed =>{
		console.log(hashed)

		let query = "SELECT COUNT(1) FROM passwords WHERE username = '" + req.body.username + "';"
		db.get(query, (err, val)=>{
			if (err){
				console.log("error");
				res.send("error encountered please try again later" + err)
			}else if(val['COUNT(1)'] == 0){
				console.log(req.body.username + " does not already exist")
				db.run(`INSERT INTO passwords (username, password)
				 	VALUES (?, ?);`, 
				 	[req.body.username, hashed],  
				 	(err)=>{
				 	if(err){
				 		console.log(err)
				 	}
				 })
				 res.send("sucessfuly registered")
			}else{
				res.send("user already registered")
			}	
		})
	})
})
app.get("/login", (req, res, next) =>{
	console.log("login")
	res.render("login")
})

app.post("/login", (req, res, next) =>{
	console.log(`username:${req.body.username} password:${req.body.password}`)
	
	let query = "SELECT password FROM passwords WHERE username = '" + req.body.username + "';"
	db.get(query, (err, val)=>{
		if (err){
				console.log("error");
				res.send("error encountered please try again later" + err)
		}else if(!val){
			res.send("user not resigerted")
		}else{
			console.log(val)
			bcrypt.compare(req.body.password, val['password']).then(valid =>{
				if(valid){
  					let json_cookie = jwt.sign(req.body.username, cookie_secret, {})
  					res.cookie("acesskey", json_cookie)
  					res.cookie("username", req.body.username)
        			//res.cookie("valid", true)
					res.send("valid login")
				}else{
					res.send("invalid login")
				}
			})
		}
	})
})
app.get("/logout", (req, res, next) =>{
	console.log("logginout")
 	res.clearCookie("valid");
	res.send("logged out")
})


app.delete("/:name", (req, res, next) =>{
	if(!authenticate(req)){
		console.log("invalid acess")
		res.send("please login")
		return
	}

	db.run("DELETE FROM dex WHERE name = ?;", req.params.name, (err)=>{
		if(err){
			console.log(err)
		}
	})
	res.send(`deleted ${req.params.name}`)
})

app.listen(3000, () => {
	console.log('server on port 3000')
})

console.log("hi")