require('dotenv').config()

const express = require('express')

const app = express()

const port = process.env.PORT

const cors = require('cors')

const routes = require('./routes')

const { defaultRoute, globalError } = require('./middlewares')

app.use(cors())

app.use(express.json())

app.use('/api', routes)

app.all('*', defaultRoute)

app.use(globalError)

app.listen(port, () => console.info(`Express server running on port: ${port}`))
