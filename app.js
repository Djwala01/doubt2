const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const createObject = eachMovie => {
  return {
    movieName: eachMovie.movie_name,
  }
}
const getObject = result => {
  return {
    movieId: result.movie_id,
    directorId: result.director_id,
    movieName: result.movie_name,
    leadActor: result.lead_actor,
  }
}

//API 1

app.get('/movies/', async (request, response) => {
  const moviesQuery = `SELECT * FROM movie`
  const movieArray = await db.all(moviesQuery)
  response.send(movieArray.map(eachMovie => createObject(eachMovie)))
})

//API 2

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postMovieQuery = `
  INSERT INTO
    movie ( director_id, movie_name, lead_actor)
  VALUES
    ("${directorId}", '${movieName}', '${leadActor}');`
  const dbResponse = await db.run(postMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getQuery = `SELECT * FROM movie
  WHERE movie_id=${movieId};`
  const result = await db.get(getQuery)
  response.send(getObject(result))
})
