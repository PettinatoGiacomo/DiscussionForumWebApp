
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { Outlet, Link} from 'react-router';

import { Navigation } from './Navigation';
import { LoginForm, TotpForm } from './Auth';
import { CreatePostForm } from './Post';

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

function CreatePostLayout(props) {
  return (
    <Row>
      <Col>
        <CreatePostForm />
      </Col>
    </Row>
  );
}

function GenericLayout(props) {
  //Generic layout used for homepage and /post/:id routes it only contains the navigation bar and the outlet for the content
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
        {props.message ? <Alert className='my-1' onClose={() => props.setMessage('')} variant='danger' dismissible>
          {props.message}</Alert> : null}
      </Col></Row>

      <Row>
        <Col>
          <Outlet />
        </Col>
      </Row>
    </>
  );
}



export { GenericLayout, NotFoundLayout, LoginLayout, TotpLayout, CreatePostLayout };
