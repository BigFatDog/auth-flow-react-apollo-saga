const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }

  type Post @cacheControl(maxAge: 240) {
    id: Int!
    title: String
    author: Author
    votes: Int @cacheControl(maxAge: 30)
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    author(id: Int!): Author
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }

  type Subscription {
    # Subscription for when editing a post
    postUpdated(id: Int!): Post
  }
`;

export default typeDefs;
