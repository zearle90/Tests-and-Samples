var port = 8080;
var io = require('socket.io').listen(port);
var connection_string = "mongodb://zearle90:monsters1@ds047468.mongolab.com:47468/zearle90"
var mongojs = require('mongojs');
var db = mongojs(connection_string, ['tourgigs']);
var chatlogs = db.collection('tourgigs');

io.sockets.on('connection', function (socket) {
	socket.on('join room', function (room) {
	    socket.join(room);
		socket.set('roomID', room, function(roomID){});
		chatlogs.find({chat_room: room}).sort({$natural: -1}).limit(20, function(err, message) {
			socket.emit('message', message);
		});
	});
	
	socket.emit('message', { message: 'Welcome to Chat!' });
	
	socket.on('send', function (data) {
		socket.get('roomID', function(err, roomID) {
			var time = new Date();
			io.sockets.in(roomID).emit('message', data);
			var document = {chat_room: roomID, username: data.username, message: data.message, timestamp: time};
			chatlogs.insert(document, {safe: true}, function(err, records){console.log('Record added as '+records[0]._id);});
		});
	});
});