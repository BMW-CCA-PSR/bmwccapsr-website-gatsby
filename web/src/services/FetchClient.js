import sanityClient from "../../client";

export class Client {
  constructor() {
    this.client = sanityClient;
  }

  listZundfolgeArticles = () => {
    return this.client.fetch(`*[_type == "post"] | order(publishedAt)`);
  };

  fetchAuthor = () => {
    return this.client.fetch(`*[_type == "author"]{
      bio,
      "authorImage": image.asset-url
    }`);
  };

  fetchMostRecentEvent = () => {
    return this.client.fetch(
      `*[_type == "event" && (
        (defined(endDate) && dateTime(endDate + "T23:59:59Z") >= dateTime(now())) ||
        (!defined(endDate) && defined(endTime) && dateTime(endTime) >= dateTime(now())) ||
        (!defined(endDate) && !defined(endTime) && defined(startDate) && dateTime(startDate + "T23:59:59Z") >= dateTime(now())) ||
        (!defined(endDate) && !defined(endTime) && !defined(startDate) && dateTime(startTime) >= dateTime(now()))
      )]{title, slug} | order(coalesce(startDate, startTime) asc)[0]`
    );
  };

  fetchUpcomingEvents = (limit = 2) => {
    return this.client.fetch(
      `*[_type == "event" && defined(slug.current) && !(lower(title) match "*board meeting*") && (
        (defined(endDate) && dateTime(endDate + "T23:59:59Z") >= dateTime(now())) ||
        (!defined(endDate) && defined(endTime) && dateTime(endTime) >= dateTime(now())) ||
        (!defined(endDate) && !defined(endTime) && defined(startDate) && dateTime(startDate + "T23:59:59Z") >= dateTime(now())) ||
        (!defined(endDate) && !defined(endTime) && !defined(startDate) && dateTime(startTime) >= dateTime(now()))
      )] | order(coalesce(startDate, startTime) asc)[0...${limit}]{
        _id,
        title,
        onlineEvent,
        onlineLink,
        venueName,
        slug { current },
        startDate,
        endDate,
        startTime,
        mainImage{
          ...,
          asset->{_id, url}
        },
        category->{title},
        address{line1, line2, city, state}
      }`
    );
  };

  fetchVolunteerRoles = () => {
    return this.client.fetch(
      `*[_type == "volunteerRole"] | order(motorsportRegEvent.start asc, _createdAt desc){
        _id,
        "assignedVolunteerCount": count(assignedVolunteers[defined(_ref)]),
        role->{
          name,
          description,
          detail,
          pointValue,
          icon,
          color
        },
        slug,
        active,
        date,
        duration,
        compensation,
        skillLevel,
        membershipRequired,
        descriptionPdf{
          asset->{url}
        },
        motorsportRegEvent{
          origin,
          eventId,
          sanityEventId,
          name,
          start,
          end,
          url,
          imageUrl,
          venueName,
          venueCity,
          venueRegion,
          eventType,
          registrationStart,
          registrationEnd,
          latitude,
          longitude
        }
      }`
    );
  };

  fetchVolunteerPositionBySlug = (slug) => {
    if (!slug) return Promise.resolve(null);
    return this.client.fetch(
      `*[_type == "volunteerRole" && slug.current == $slug][0]{
        active,
        "assignedVolunteerCount": count(assignedVolunteers[defined(_ref)]),
        role->{
          name,
          description,
          detail,
          pointValue,
          icon,
          color
        },
        motorsportRegEvent{
          origin,
          eventId,
          sanityEventId,
          name,
          start,
          end,
          url,
          imageUrl,
          venueName,
          venueCity,
          venueRegion,
          eventType,
          registrationStart,
          registrationEnd,
          latitude,
          longitude,
          lat,
          lng,
          lon,
          long
        }
      }`,
      { slug }
    );
  };

  fetchAssignedVolunteerCount = (positionId) => {
    if (!positionId) return Promise.resolve(null);
    return this.client.fetch(
      `count(*[_type == "volunteerApplication" && position._ref == $positionId && status == "assigned" && isActive == true])`,
      { positionId }
    );
  };

  fetchVolunteerFixedRoles = () => {
    return this.client.fetch(
      `*[_type == "volunteerFixedRole"] | order(pointValue asc, name asc){
        _id,
        name,
        description,
        detail,
        pointValue,
        roleScope,
        assignmentCardinality,
        icon,
        color
      }`
    );
  };

  fetchEvents = () => {
    return this.client.fetch(
      `*[_type == "event" && defined(slug.current) && !(lower(title) match "*board meeting*") && (
          (defined(endDate) && dateTime(endDate + "T23:59:59Z") >= dateTime(now())) ||
          (!defined(endDate) && defined(endTime) && dateTime(endTime) >= dateTime(now())) ||
          (!defined(endDate) && !defined(endTime) && defined(startDate) && dateTime(startDate + "T23:59:59Z") >= dateTime(now())) ||
          (!defined(endDate) && !defined(endTime) && !defined(startDate) && dateTime(startTime) >= dateTime(now()))
        )] | order(coalesce(startDate, startTime) asc){
        _id,
        title,
        onlineEvent,
        onlineLink,
        venueName,
        slug { current },
        startDate,
        endDate,
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
  };

  fetchAllEvents = () => {
    return this.client.fetch(
      `*[_type == "event" && defined(slug.current)] | order(coalesce(startDate, startTime) asc){
        _id,
        title,
        onlineEvent,
        onlineLink,
        venueName,
        slug { current },
        startDate,
        endDate,
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
  };
}
