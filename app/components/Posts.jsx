import React, {PropTypes} from 'react';
import {PureRenderMixin} from 'react/addons';
import Immutable from 'immutable';
import {Grid, Row, Col, Pager, PageItem} from 'react-bootstrap';
import Post from './Post';


export default React.createClass({

    mixins: [PureRenderMixin],

    propTypes: {
        result: PropTypes.object,
        user: PropTypes.object,
        fetchPosts: PropTypes.func
    },

    getDefaultProps() {
        return {
            result: {
                total: 0,
                isFirst: true,
                isLast: true,
                posts: Immutable.List(),
                page: 1
            }
        };
    },


    handlePageClick(page) {
        this.props.fetchPosts(page);
    },
     
    handleLastPageClick(event) {
        event.preventDefault()
        if (this.props.result.isFirst) {
            return;
        }
        this.handlePageClick(this.props.result.page - 1);
    },

    handleNextPageClick(event) {
        event.preventDefault()
        if (this.props.result.isLast) {
            return;
        }
        this.handlePageClick(this.props.result.page + 1);
    },

    renderPager() {
        return (
            <Pager>
                <PageItem previous onClick={this.handleLastPageClick} disabled={this.props.result.isFirst}>&larr; Previous</PageItem>
                <PageItem next onClick={this.handleNextPageClick} disabled={this.props.result.isLast}>&rarr; Next</PageItem>
            </Pager>
        );
    },


    render() {

        return (
            <div>
                <Grid>
                    <Row>
                        {this.props.result.posts.map((post) => {
                            return <Post key={post._id} post={post} user={this.props.user} />
                        }).toJS()}
                    </Row>
                </Grid>
                {this.renderPager()}
            </div>
        );
    }
})
