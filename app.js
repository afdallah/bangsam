require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const branchRouter = require('./routes/branch')
const pickupRouter = require('./routes/pickup')
const addressRouter = require('./routes/address')
const itemTypeRouter = require('./routes/itemType')
const balanceRouter = require('./routes/balance')
const dashboardRouter = require('./routes/dashboard')
const withdrawHistory = require('./routes/withdrawHistory')

const app = express()

app.use(
  '/documentation',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss:
      '.topbar-wrapper { justify-content: center; text-align: center } .swagger-ui .topbar a { justify-content: center } .swagger-ui.swagger-container{ max-width: 100% } .swagger-ui { margin:auto; max-width: 70%;  } .wrapper .block { margin: 0 -20px }'
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/branches', branchRouter)
app.use('/pick-ups', pickupRouter)
app.use('/address', addressRouter)
app.use('/item-types', itemTypeRouter)
app.use('/books', balanceRouter)
app.use('/dashboard', dashboardRouter)
app.use('/withdraw-histories', withdrawHistory)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send('The page you are looking for is not found')
})

// error handler
app.use(function (err, req, res, next) {
  const { statusCode = 400, message } = err

  res.status(statusCode).json({
    status: false,
    statusCode,
    message
  })
})

module.exports = app
