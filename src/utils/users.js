const users = []

const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()
  // Validate data
  if (!username || !room) {
    return { error : 'Username and room are required'}
  }
  // Check for existing user
  const findUser = users.find(user => {
    return user.username === username && user.room === room 
  })
  // Handeling existing user
  if (findUser) {
    return {error: 'Username is already being used'}
  }
  // Store user
  const user = { id, username, room}
  users.push(user)
  return user
}

const getUser = (id) => {
  const found = users.find(user => user.id === id)
  if (!found) {
    return { error: 'We can not find an user with the given id' }
  }
  return found
}

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter(user => user.room === room)
  return usersInRoom
}

const removeUser = (id) => {
  const found = getUser(id)
  const index = users.indexOf(found)
  const deletedUser = users.splice(index, 1)
  return deletedUser
}

module.exports = {
  users,
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
