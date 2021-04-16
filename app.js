//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
var _ = require("lodash");
const app = express();

mongoose.connect('mongodb+srv://vit19988:Aa211572512@cluster0.rlc9r.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemsSchema ={
  name: String
}

const Item =mongoose.model("Item", itemsSchema)

const item1 = new Item({ 
  name: 'Please add + to create the item', 

});

const item2 = new Item({ 
  name: 'yed Aey', 

});

const item3 = new Item({ 
  name: 'yed Bee', 

});

const defaultItems =[item1];
const listSchema = {
  name: String,
  items: [itemsSchema]

}

const List=mongoose.model("List",listSchema)

// Item.insertMany(defaultItems, function(err){
//   if (err){
//       console.log(err);
//   }else{
//       console.log("success save deafault items to DB")
//   }
// })

app.get("/", function(req, res) {

  Item.find(function(err,foundItems){
      console.log(foundItems.length)
      if (foundItems.length===0){
          Item.insertMany(defaultItems, function(err){
            if (err){
                console.log(err);
            }else{
                console.log("success save deafault items to DB")
            }
          });
          res.redirect("/");
      }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    })
  })

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(req.body.newItem);
  const item = new Item({ 
    name: itemName 
  });
  console.log(item);
  console.log(item);


  if (listName == 'Today'){
    item.save();
    
    var timeout = 100;

    setTimeout(function () {
      res.redirect("/")
    }, timeout);
      
    
  }else{
    List.findOne({name:listName}, function(err,foundList){
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();

      var timeout = 100;

      setTimeout(function () {
        res.redirect("/"+listName);
      }, timeout);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId=req.body.checkBox;
  const listName=req.body.listName;

  if (listName == 'Today'){
      Item.deleteOne({_id:checkedItemId},function(err){
      if(!err){
        res.redirect("/");
      }})
  }else{
    List.findOneAndUpdate(
      {name:listName}, 
      {$pull: {items:{_id:checkedItemId} }},
      function(err){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    )
      
  }
})

  
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName }, function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Doesn't exist!");

        // create a new list//
        const list = new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save();
        res.redirect("/"+customListName)

      }else{
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  console.log(req.body.newItem);
  const item = new Item({ 
    name: itemName 
  });

  item.save();
  res.redirect("/");
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen( process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
