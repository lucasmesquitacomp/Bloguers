
var express = require('express');
var bodyParser = require('body-parser');
var MongoNative = require('mongo-native');

var app = express();

//inicio API
var api = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', 'app/views');
app.set('view engine', 'ejs');

app.use(express.static('www'));

app.get('/', function(req, res) {
	res.render('index');
});

//uso de api
app.use('/api', api);

	api.route('/bloguers')
	
	.get(function (req,res){
		db.collection('bloguers').find().then(function (data){
			res.json(data);
		})
	})
	
	.post(function (req,res){
		var bloguers = db.collection('bloguers');
		var bloguer = req.body;
		if(bloguers.findOne({id: bloguer.id})){
			console.log('exist test');
		}
		else{
			bloguers.insertOne(bloguer).then(function (r){
				res.json(r);
			}, function (err) {
				console.log(err);
				res.status(400).end();
			});
		}
	});

	

	api.delete('/bloguers/:id',function (req,res){
		var idd = req.params.id;
		db.collection('bloguers').findAndRemove({id: idd}).then(function (r){
			console.log(r);
			res.status(200).send('');
		});
	});
	
	api.get('/bloguers/:id', function (req, res){	
		var idd = req.params.id;
		db.collection('bloguers').findOne({id: idd}).then(function (data){
			console.log('teste');
			console.log(data);
			res.json(data);
		})

	})


MongoNative.connect('mongodb://localhost/instabloguers').then(function (db){
	global.db = db;
	app.listen(3000);
})

