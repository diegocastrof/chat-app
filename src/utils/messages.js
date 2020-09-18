const createMsg = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
}
const createLocationMsg = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  }
}

// console.log(createMsg('text'))
module.exports = { 
  createMsg,
  createLocationMsg 
}