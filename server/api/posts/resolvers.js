import { withFilter } from 'graphql-subscriptions';
import { find, filter } from 'lodash';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Introduction to GraphQL',
    votes: 2,
  },
  {
    id: 2,
    authorId: 2,
    title: 'Welcome to Meteor',
    votes: 3,
  },
  {
    id: 3,
    authorId: 2,
    title: 'Advanced GraphQL',
    votes: 1,
  },
  {
    id: 4,
    authorId: 3,
    title: 'Launchpad is Cool',
    votes: 7,
  },
];

const POST_SUBSCRIPTION = 'post_subscription';

const createResolvers = pubsub => ({
  Query: {
    posts: (root, args, context) => {
      console.log('resolver found user id' + context.user._id);
      return posts;
    },
    author: (_, { id }) => find(authors, { id }),
  },
  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      pubsub.publish(POST_SUBSCRIPTION, {
        id: postId,
        postUpdated: post,
      });
      return post;
    },
  },
  Author: {
    posts: author => filter(posts, { authorId: author.id }),
  },
  Post: {
    author: post => find(authors, { id: post.authorId }),
  },
  Subscription: {
    postUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(POST_SUBSCRIPTION),
        (payload, variables) => true
        // return payload.id === variables.postId;
      ),
    },
  },
});

export default createResolvers;
