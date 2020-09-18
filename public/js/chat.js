const socket = io()

// Elements
const $input = document.getElementById('input')
const $submit = document.getElementById('submit')
const $btnLocation = document.getElementById('location')
const $msgContainer = document.getElementById('msg-container')
const $sidebar = document.getElementById('sidebar')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const userlistTemplate = document.getElementById('userlist-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, { 
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A') 
  })
  $msgContainer.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', location => {
  const html = Mustache.render(locationTemplate, { 
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm A')
  })
  $msgContainer.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('userList', ({ room , users }) => {
  const html = Mustache.render(userlistTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href('/')
  }
})


const sendToServer = (e) => { 
  $submit.setAttribute('disabled', 'disabled')
  const message = $input.value
  if (message) {
    socket.emit('newMessage', message, (error) => {
      $submit.removeAttribute('disabled')
      $input.value = ''
      $input.focus()
  
      if (error) {
        console.log(error)
      }
      console.log('Your message was delivered')
    })
  }
  $submit.removeAttribute('disabled')
  e.preventDefault()
}

const shareLocation = (e) => {
  // Checks if geolocation is supported
  if (!navigator.geolocation) {
    return alert ('Your browser does not support GeoLocation')
  }
  // Disables the button
  $btnLocation.setAttribute('disabled', 'disabled')
  // Gets the location, send back an object with lat, long
  navigator.geolocation.getCurrentPosition(position => {
    const coordinates = {
      lat: position.coords.latitude,
      long: position.coords.longitude
    }
    // Emits to server
    socket.emit('sendLocation', coordinates, (error) => {
      $btnLocation.removeAttribute('disabled')
      if (error) {
        return console.log(error)
      }
      console.log('Your location was shared successfully!')
    })
  })
}

const autoscroll = () => {
  // Gets last message
  const $newMessage = $msgContainer.lastElementChild
  // Get computed styles
  const newMessageStyles = getComputedStyle($newMessage)
  // Get margin value
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  // Calculate total height
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $msgContainer.offsetHeight

  // Total height of message container
  const msgContainerHeight = $msgContainer.scrollHeight

  // How far I've scrolled...
  const scrollOffset = $msgContainer.scrollTop + visibleHeight

  // Autoscroll to bottom
  if (msgContainerHeight - newMessageHeight <= scrollOffset) {
    $msgContainer.scrollTop = $msgContainer.scrollHeight
  }

}

$submit.addEventListener('click', sendToServer)
$btnLocation.addEventListener('click', shareLocation)