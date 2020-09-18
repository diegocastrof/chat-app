const express = require('express')
const socketio = require('socket.io')

const { dirname } = require('path')
const path = require('path')
const http = require('http')
const { createMsg, createLocationMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {
  
  console.log('new WebSocket connection')
  
  socket.on('join', ({ username, room }, callback) => {
    // Get user and make sure there's one
    const user = addUser({ id:socket.id, username, room })
    
    if (user.error) {
      return callback(user.error)
    }
    
    // Join user to room 
    socket.join(user.room)
    // Send Admin messages on joining
    socket.emit('message', createMsg('Admin', `Welcome ${user.username}`))
    socket.broadcast.to(user.room).emit('message', createMsg('Admin', `${user.username} has joined`))
    // Update sidebar userlist
    io.to(user.room).emit('userList', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('newMessage', (message, callback)  => {
    const user = getUser(socket.id)
    if (user.error) {
      alert(user.error)
      location.href('/')
    }
    io.to(user.room).emit('message', createMsg(user.username, message))
    callback()
  })
  
  socket.on('sendLocation', (coordinates, callback) => {
    if (!coordinates.lat || !coordinates.long) {
      return callback('Error: We are not able to find your location')
    }
    const user = getUser(socket.id)
    if (user.error) {
      alert(user.error)
      location.href('/')
    }

    io.to(user.room).emit('locationMessage', createLocationMsg(user.username, `https://google.com/maps?q=${coordinates.lat},${coordinates.long}`))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    
    // Send admin message when leaving room
    if (user) {
      io.to(user.room).emit('message', createMsg('Admin', `${user.username} has left the room`))
    }
    // Update sidebar user list
    io.to(user.room).emit('userList', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    
  })

})

const port = process.env.PORT || 3000

server.listen(port, () => console.log('Listening on port:', port))