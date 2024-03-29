import React, { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import { Route, Router, Switch } from 'wouter'
import HomePage from './components/HomePage'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import PlayerData from './components/PlayerData'
import Header from './components/Header'
// import ScoreSubmission from './components/ScoreSubmission'
import CreateLeague from './components/CreateLeague'
import CreateTeam from './components/CreateTeam'
import CreateCharacter from './components/CreateCharacter'
import UserTable from './components/UserTable'
import CreateScoreableObject from './components/CreateScoreableObject'
import CreateScoringEvent from './components/CreateScoringEvent'
import LoginPage from './components/LoginPage'
import './App.css'
import { useNavigate, useLocation } from 'react-router-dom'
import UserContext from './context/UserContext'
import ScoringEventsTable from './components/ScoringEventsTable'


const LoggedInRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BACKEND_PORT}/auth/check`,
      {
        credentials: 'include'
      }
    )
      .then(response => response.json())
      .then(data => {
        setIsAuthenticated(data)
        if (!data) {
          // Redirect the user to the Discord login page
          window.location.href =
            'https://discord.com/api/oauth2/authorize?client_id=1093461191705239562&redirect_uri=http%3A%2F%2Flocalhost%3A8001%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify%20email'
        }
      })
  }, [])
  if (isAuthenticated === null) {
    ;<div>Loading...</div>
  }
  return (
    <Component />
    // <Route
    //   {...rest}
    //   render={props => (isAuthenticated ? <Component {...props} /> : null)}
    // />
  )
}

const AdminOnlyRoute = ({ component: Component, ...rest }) => {
  const [isAdmin, setIsAdmin] = useState(null)
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BACKEND_PORT}/user`,
      {
        credentials: 'include'
      }
    )
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data.role === 'admin') {
          setIsAdmin(true)
        }
        if (!data) {
          // Redirect the user to the Discord login page
          window.location.href =
            'https://discord.com/api/oauth2/authorize?client_id=1093461191705239562&redirect_uri=http%3A%2F%2Flocalhost%3A8001%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify%20email'
        }
      })
  }, [])
  if (isAdmin === null) {
    ;<div>Loading...</div>
  }
  return <Component />
}

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
})

const App = () => {
  const [userId, setuserId] = useState(/* initial player ID */)
  const [teamId, setTeamId] = useState(/* initial team ID */)
  const [isAdmin, setIsAdmin] = useState(/* initial admin status */)
  const [isTeamLeader, setIsTeamLeader] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Replace this with your code to fetch the player ID from your backend
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_BACKEND_PORT}/user/`,
      {
        credentials: 'include'
      }
    )
      .then(res => {
        if (!res.status === 200) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data) {
          setIsLoggedIn(true)
          setuserId(data.id)
          setTeamId(data.teamId)
          setIsTeamLeader(data.isTeamLeader)
          if (data.role === 'admin') {
            setIsAdmin(true)
          }
        }
      })
  }, [])

  return (
    <UserContext.Provider value={{ userId, teamId, isAdmin, isLoggedIn, isTeamLeader }}>
      <ThemeProvider theme={theme}>
        <div className='App'>
          <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} />{' '}
          {/* Pass the player ID to the Header component */}
          <Container>
            <Switch>
              <Route path='/' component={HomePage} />
              <AdminOnlyRoute path='/CreateLeague' component={CreateLeague} />
              <LoggedInRoute
                path='/CreateCharacter'
                component={CreateCharacter}
              />
              <AdminOnlyRoute path='/CreateTeam' component={CreateTeam} />
              <AdminOnlyRoute path='/Users' component={UserTable} />
              {/* <ProtectedRoute path='/player/:userId' component={PlayerData} /> */}
              <AdminOnlyRoute
                path='/CreateScoreableObject'
                component={CreateScoreableObject}
              />
              <LoggedInRoute
                path='/CreateScoringEvent'
                component={CreateScoringEvent}
              />
              {/* <AdminOnlyRoute path='/player/:userId' component={PlayerData} /> */}
              <LoggedInRoute path='/playerData' component={PlayerData} />
              <LoggedInRoute path='/login' component={LoginPage} />
              <AdminOnlyRoute
                path='/scoringEvents'
                component={ScoringEventsTable}
              />
            </Switch>
          </Container>
        </div>
      </ThemeProvider>
    </UserContext.Provider>
  )
}

export default App
