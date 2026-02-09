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

  fetchUpcomingEvents = (limit = 2) => {
    return this.client.fetch(
      `*[_type == "event" && dateTime(startTime) > dateTime(now()) && !(lower(title) match "*board meeting*")] | order(startTime asc)[0...${limit}]{
        _id,
        title,
        onlineEvent,
        onlineLink,
        venueName,
        slug { current },
        startTime,
        mainImage{
          ...,
          asset->{_id, url}
        },
        category->{title},
        address{line1, line2, city, state}
      }`
    );
  }

  fetchVolunteerRoles = () => {
    return this.client.fetch(
      `*[_type == "volunteerRole" && active == true] | order(motorsportRegEvent.start asc, _createdAt desc){
        _id,
        title,
        slug,
        active,
        workDescription,
        date,
        duration,
        compensation,
        volunteerPoints,
        skillLevel,
        membershipRequired,
        descriptionPdf{
          asset->{url}
        },
        category->{title},
        motorsportRegEvent{
          eventId,
          name,
          start,
          end,
          url,
          imageUrl,
          venueName,
          venueCity,
          venueRegion
        }
      }`
    );
  }

  fetchVolunteerCategories = () => {
    return this.client.fetch(
      `*[_type == "volunteerCategory"] | order(title asc){
        _id,
        title
      }`
    );
  }

  fetchEvents = () => {
    return this.client.fetch(
      `*[_type == "event" && (
          (defined(endTime) && dateTime(endTime) >= dateTime(now())) ||
          (!defined(endTime) && dateTime(startTime) >= dateTime(now()))
        )] | order(startTime asc){
        _id,
        title,
        onlineEvent,
        onlineLink,
        venueName,
        slug { current },
        startTime,
        endTime,
        mainImage{
          ...,
          asset->{_id, url}
        },
        category->{title},
        address{line1, line2, city, state}
      }`
    );
  }

};
