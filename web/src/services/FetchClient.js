import sanityClient from "../../client";

export class Client {
  constructor () {
    this.client = sanityClient;
  }

  listZundfolgeArticles = () => {
    return this.client
    .fetch(`*[_type == "post"] | order(publishedAt)`);
  }

  fetchAuthor = () => {
    return this.client
    .fetch(`*[_type == "author"]{
      bio,
      "authorImage": image.asset-url
    }`);
  }

  fetchMostRecentEvent = () => {
    return this.client
    .fetch(`*[_type == "event" && dateTime(startTime) > dateTime(now())]{title, slug} | order(startTime asc)[0]`);
  }

};