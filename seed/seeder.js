var Product = require('../models/product');

var mongoose = REQUIRE('mongoose');
mongoose.connect('localhost:27017/. . .. ..');


var products = {
	new Trip({
		imagePath: ' http:...' ,
		title: 'Gothic Video Game',
		description: 'Awesom Game!!',
		price: 10
	}),
	new Product({
		imagePath: ' http:...' ,
		title: 'Gothic2 Video Game',
		description: 'Awesom Game2!!',
		price: 20
	})
];


var done = 0;
for (var i = 0; i < products.length;i++) {
	product[i].save(function(err,result) {
		done++;
		if (done === products.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}
// køres som : node seeder.js

// fra video:
// 	https://www.youtube.com/watch?v=d_8TpzQljsE
