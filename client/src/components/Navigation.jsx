import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { LoginButton, LogoutButton } from './Auth';

const Navigation = (props) => {

    return (
        <Navbar bg="dark" expand="md" variant="dark" className="navbar-padding">
            <Navbar.Brand className="mx-2">
                <h1>Forum</h1>
            </Navbar.Brand>
            <Nav>
                <Navbar.Text className="mx-2 fs-5">
                    {props.user && props.user.name && 
                    `Logged in ${props.loggedInTotp ? '(2FA)' : ''} as: ${props.user.name}`}
                </Navbar.Text>
                <Form className="mx-2 mt-1">
                    {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                    <Link to="/"><Button variant="outline-light">Go to the main page</Button></Link>
                    {props.loggedIn && <Link to="/create-post"><Button variant="outline-light">Create a new post</Button></Link>}
                </Form>
            </Nav>
        </Navbar>
    );
}

export { Navigation };
