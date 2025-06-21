import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import {useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { GenericLayout, NotFoundLayout, LoginLayout, TotpLayout, CreatePostLayout,} from './components/Layout';
import { CommentsLayout, PostsListLayout } from './components/Post';
import API from './API.js';

function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);//user info
  const [loggedInTotp, setLoggedInTotp] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(true);

  // If an error occurs, the error message will be shown using a state.
  const handleErrors = (err) => {
    //console.log('DEBUG: err: '+JSON.stringify(err));
    let msg = '';
    if (err.error)
      msg = err.error;
    else if (err.errors) {
      if (err.errors[0].msg)
        msg = err.errors[0].msg + " : " + err.errors[0].path;
    } else if (Array.isArray(err))
      msg = err[0].msg + " : " + err[0].path;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";

    setMessage(msg); //only the last error is shown.

    if (msg === 'Not authenticated')
      setTimeout(() => {  // do logout in the app state
        setUser(undefined); setLoggedIn(false); setLoggedInTotp(false); setDirty(true);
      }, 2000);
    else
      setTimeout(() => setDirty(true), 2000);  // Fetch the current version from server, after a while
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        if (user.isTotp)
          setLoggedInTotp(true);
      } catch (err) {
        // NO need to do anything: user is simply not yet authenticated
      }
    };
    checkAuth();
  }, []);  // The useEffect callback is called only the first time the component is mounted.

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setLoggedInTotp(false);
    // clean up everything
    setUser(null);
  };


  return (
    <Container fluid>
      <Routes>
        <Route path="/" element={
          <GenericLayout message={message} setMessage={setMessage} loggedIn={loggedIn} user={user} loggedInTotp={loggedInTotp} logout={handleLogout} />
        }>
          <Route index element={<PostsListLayout handleErrors={handleErrors} loggedIn={loggedIn} user={user} loggedInTotp={loggedInTotp}></PostsListLayout>} />
          <Route path="post/:id" element={<CommentsLayout user={user} loggedInTotp={loggedInTotp} loggedIn={loggedIn}></CommentsLayout>} />
          <Route path='/login' element={
            <LoginPages loggedIn={loggedIn} login={handleLogin} user={user} setLoggedInTotp={setLoggedInTotp} />
          } />
          <Route path="create-post" element={<CreatePostLayout handleErrors={handleErrors} />} />
          <Route path="*" element={<NotFoundLayout />} />
        </Route>
      </Routes>
    </Container>
  )
}

/*
admin logged in+otp -> navigate to homepage
user logged in -> navigate to homepage
admin logged in -> navigate to TOTP layout
user/admin not logged in -> navigate to login layout
*/
function LoginPages(props) {
  if (props.loggedIn) {
    if (props.user.canDoTotp) {
      if (props.loggedInTotp) {
        return <Navigate replace to='/' />;
      } else {
        return <TotpLayout totpSuccessful={() => props.setLoggedInTotp(true)} />;
      }
    } else {
      return <Navigate replace to='/' />;
    }
  } else {
    return <LoginLayout login={props.login} />;
  }
}


export default App;