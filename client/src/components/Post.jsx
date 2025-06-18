import { React, useState, useEffect } from 'react';
import { Container, Col, Button, Card, Table, Row, Form } from 'react-bootstrap';
import { Routes, Route, Outlet, Link, useParams, Navigate, useNavigate } from 'react-router';

import API from '../API.js';

function PostsListLayout(props) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        //console.log('DEBUG: PostsListLayout useEffect called');
        const fetchPosts = async () => {
            try {
                const postsData = await API.getPosts();
                setPosts(postsData);
            } catch (err) {
                props.handleErrors(err);
            }
        };
        fetchPosts();
    }, []);

    return (<ListOfPosts posts={posts} />);
}

function ListOfPosts(props) {
    const posts = props.posts;
    return (
        <Container>
            {posts.map(post => (

                <Card key={post.id} className="my-2">
                    <Card.Header className="bg-dark text-white">
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-white">  {post.timestamp}<br />{post.authorName}</Card.Subtitle>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>{post.text}</Card.Text>

                    </Card.Body>
                    <Card.Footer>
                        <Link to={`/post/${post.id}`}>
                            <Card.Text>Comments: {post.numComments}/{post.maxComments}</Card.Text>
                        </Link>
                    </Card.Footer>
                </Card>

            ))
            }
        </Container >
    )
}

function CommentsLayout(props) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentText, setCommentText] = useState('');
    const { id } = useParams();


    useEffect(() => {
        //console.log('DEBUG: CommentsLayout useEffect called');
        const fetchPost = async () => {
            try {
                const postData = await API.getPost(id);
                setPost(postData);
                const commentsData = await API.getComments(id);
                setComments(commentsData);
            } catch (err) {
                props.handleErrors(err);
            }
        };
        fetchPost();
    }, [id]);//useEffect will run when the component mounts and when the id changes

    const handleAddComment = (event) => {
        event.preventDefault();
        API.addComment(id, newCommentText)
            .then((newComment) => {
                setComments([newComment,...comments]);
            })
            .catch((err) => {
                props.handleErrors(err);
            });
        setCommentText(''); // Clear the input field
    }
    if (!post) return <div>Loading...</div>;

    return (
        <Container>
            <Card key={post.id} className="my-2">
                <Card.Header className="bg-dark text-white">
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-white">
                        {post.timestamp}<br />{post.authorName}
                    </Card.Subtitle>
                </Card.Header>
                <Card.Body>
                    <Card.Text>{post.text}</Card.Text>
                </Card.Body>
            </Card>

            <AddCommentForm handleAddComment={handleAddComment} newCommentText={newCommentText} setCommentText={setCommentText}></AddCommentForm>

            {comments.map(comment => (
                <Card key={comment.commentID} className="mb-3 shadow-sm">
                    <Card.Body>
                        <Row>
                            <Col>{comment.authorName}:</Col>
                            <Col className="text-end">{comment.timestamp}</Col>
                        </Row>
                        <Row>
                            <Col>{comment.commentText}</Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    )
}


function AddCommentForm(props) {
    return (            
    <Form onSubmit={props.handleAddComment}>
                <Row>
                    <Col >
                        <Form.Group className="mb-3" controlId="commentText">
                            <Form.Control as="textarea" rows={2} placeholder="Write your comment here..." value={props.newCommentText} onChange={(e) => props.setCommentText(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs="auto">
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Form>
            )
}
export { PostsListLayout, CommentsLayout };