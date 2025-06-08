
import { Row, Col, Button, Spinner, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation, useNavigate } from 'react-router';

import { Navigation } from './Navigation';
import { useEffect, useState } from 'react';
import { LoginForm, TotpForm } from './Auth';

import API from '../API.js';

function NotFoundLayout(props) {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
  }

  function LoginLayout(props) {
    return (
      <Row>
        <Col>
          <LoginForm login={props.login} />
        </Col>
      </Row>
    );
  }

function TotpLayout(props) {
  return (
    <Row>
      <Col>
        <TotpForm totpSuccessful={props.totpSuccessful} />
      </Col>
    </Row>
  );
}

  function GenericLayout(props) {
  
    return (
      <>
      {
        <Row>
          <Col>
            <Navigation loggedIn={props.loggedIn} user={props.user} loggedInTotp={props.loggedInTotp} logout={props.logout} />
          </Col>
        </Row>
      }
        <Row><Col>
          {props.message? <Alert className='my-1' onClose={() => props.setMessage('')} variant='danger' dismissible>
            {props.message}</Alert> : null}
        </Col></Row>

        <Row>
          <Col xs={3}>
          </Col>
  
          <Col xs={9}>
            <Outlet />
  
          </Col>
        </Row>
      </>
    );
  }
  
  export { GenericLayout, NotFoundLayout, LoginLayout, TotpLayout };
