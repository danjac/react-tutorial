import React, {PropTypes} from 'react';
import {PureRenderMixin} from 'react/addons';
import Router, {Link} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {OverlayTrigger, Popover, Col, Button, Modal, ModalTrigger, Badge} from 'react-bootstrap';
import actions from '../actions';


const UserLink = React.createClass({
    mixins: [PureRenderMixin],

    propTypes: {
        user: PropTypes.object
    },

    contextTypes: {
        router: PropTypes.func
    },

    render() {
        return <Link to={this.context.router.makeHref("user", {name: this.props.user.name})}>{this.props.user.name}</Link>
    }
});

const DeletePostModal = React.createClass({

    mixins: [PureRenderMixin],

    handleDelete (event) {
        event.preventDefault();
        actions.deletePost(this.props.post);
    },

    render() {

        return (
            <Modal title="Delete post" closeButton={false} onRequestHide={null}>
                <div className="modal-body">
                    Are you sure you want to delete your post?
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.handleDelete}>Yes, I'm sure</Button>
                </div>
            </Modal>

        )
    }
})


export default React.createClass({

    propTypes: {
        post: PropTypes.object,
        user: PropTypes.object
    },

    mixins: [
        PureRenderMixin
    ],

    contextTypes: {
        router: PropTypes.func
    },

    handleVoteUp(event) {
        event.preventDefault()
        actions.voteUp(this.props.post) 
    },

    handleVoteDown(event) { 
        event.preventDefault()
        actions.voteDown(this.props.post) 
    },

    deleteLink() {
        const user = this.props.user,
              post = this.props.post
        if (user && post.author._id === user._id) {
            const modal = <DeletePostModal post={post} />
            return (
                <ModalTrigger modal={modal}>
                    <a href="#">delete</a>
                </ModalTrigger>
            )
        }
        return ''
    },

    votingLinks() {
        const user = this.props.user,
              post = this.props.post

        if (!user || user._id === post.author._id || _.includes(user.votes, post._id)){
            return '';
        }

        return (
            <span>
                <a href="#" onClick={this.handleVoteUp}><i className="glyphicon glyphicon-arrow-up"></i></a>
                <a href="#" onClick={this.handleVoteDown}><i className="glyphicon glyphicon-arrow-down"></i></a>
            </span>
        );

    },

    overlay() {

        const post = this.props.post;

        if (!post.comment) {
            return this.thumbnail();
        }

        return (
        <OverlayTrigger trigger='hover' 
                        placement='right' 
                        overlay={<Popover >{post.comment}</Popover>}>
                        {this.thumbnail()}</OverlayTrigger>
        );

    },

    thumbnail() {

        const post = this.props.post;

        return (
              <a href={post.url} target="_blank">
                 <img className="img-rounded" src={"/uploads/" + post.image} alt={post.title} />
              </a>
        );

    },

    render() {

        const post = this.props.post

        return (
            <Col sm={6} md={4}>
                <div className="thumbnail">
                  {this.overlay()}
                  <div className="caption">
                    <h3 className="text-center">
                        <a href={post.url} target="_blank" className="thumbnail">{post.title}</a>
                    </h3>
                    <small>
                    <Badge>{post.score}</Badge>
                    &nbsp;uploaded by <UserLink user={post.author} /> {moment(post.created).fromNow()}
                    &nbsp;{this.votingLinks()}
                    &nbsp;{this.deleteLink()}
                    </small>
                  </div>
                </div>
            </Col>
        );
    }

})


