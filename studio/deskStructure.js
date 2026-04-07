import {
  GoBrowser as PageIcon,
  GoFile,
  GoHome,
  GoGear as Settings,
  GoSync as LifecycleIcon,
  GoPencil as EditIcon,
  GoMegaphone as BlogIcon,
  GoChecklist as ApprovedIcon,
  GoEye as ReviewIcon,
  GoCircleSlash as RejectedIcon,
  GoArchive as AllIcon,
  GoPerson as AuthorIcon,
} from "react-icons/go";
import {
  RiCalendarCheckLine as ActiveIcon,
  RiCalendar2Line as AllEventIcon,
  RiFolder2Line as CatIcon,
  RiAdvertisementLine as AdIcon,
  RiAdvertisementFill as AdIconFill,
  RiHeartLine as HeartIcon,
  RiHeartFill as HeartFillIcon,
} from "react-icons/ri";
import { ImStatsBars2 as TierIcon } from "react-icons/im";
import { IoCarSport as MsrIcon } from "react-icons/io5";
import {
  MdMenu,
  MdBuild,
  MdEmail,
  MdOutlineEmail,
  MdLocalOffer,
  MdOutlineLocalOffer,
} from "react-icons/md";
import VolunteerApplicationsPane from "./src/components/VolunteerApplicationsPane";
//import { workflowListItems } from './src/structure/workflow'

const createZundfolgeIssueList = (S, title, filter = '_type == "zundfolgeIssue"', params = {}) =>
  S.documentTypeList("zundfolgeIssue")
    .title(title)
    .menuItems(S.documentTypeList("zundfolgeIssue").getMenuItems())
    .filter(filter)
    .apiVersion("2023-01-01")
    .params(params)
    .defaultOrdering([
      { field: "publishYear", direction: "desc" },
      { field: "publishMonthSort", direction: "desc" },
    ])
    .child((documentId) =>
      S.document().documentId(documentId).schemaType("zundfolgeIssue"),
    );

const fetchZundfolgeIssueYears = async (client) => {
  const rows = await client.fetch(
    '*[_type == "zundfolgeIssue" && defined(publishYear)]{publishYear}',
  );

  return Array.from(
    new Set(
      (Array.isArray(rows) ? rows : [])
        .map((row) => Number(row?.publishYear))
        .filter((year) => Number.isInteger(year)),
    ),
  ).sort((a, b) => b - a);
};

const fetchVolunteerCategories = async (client) => {
  const rows = await client.fetch(
    '*[_type == "volunteerCategory"]|order(title asc){_id, title}',
  );

  return Array.isArray(rows) ? rows : [];
};

const buildZundfolgeIssueYearItems = (S, years = []) =>
  years.map((year) =>
    S.listItem()
      .title(String(year))
      .id(`zundfolge-issue-year-${year}`)
      .child(
        createZundfolgeIssueList(
          S,
          `Issues from ${year}`,
          '_type == "zundfolgeIssue" && publishYear == $year',
          { year },
        ),
      ),
  );

const buildZundfolgeIssueDecadeItems = (S, years = []) =>
  Array.from(new Set(years.map((year) => Math.floor(year / 10) * 10)))
    .sort((a, b) => b - a)
    .map((decade) =>
      S.listItem()
        .title(`${decade}s`)
        .id(`zundfolge-issue-decade-${decade}`)
        .child(
          createZundfolgeIssueList(
            S,
            `Issues from the ${decade}s`,
            '_type == "zundfolgeIssue" && publishYear >= $startYear && publishYear < $endYear',
            {
              startYear: decade,
              endYear: decade + 10,
            },
          ),
        ),
    );

const createEmailAliasList = (S, title, filter, params = {}) =>
  S.documentTypeList("emailAlias")
    .title(title)
    .filter(filter)
    .apiVersion("2023-01-01")
    .params(params)
    .child((documentId) =>
      S.document().documentId(documentId).schemaType("emailAlias"),
    );

// const hiddenDocTypes = (listItem) =>
//   !['workflow.metadata', 'media.tag', 'route', 'navigationMenu', 'post', 'page', 'siteSettings', 'author', 'category', 'event', 'eventCategory', 'tier', 'advertiser', 'advertiserCategory'].includes(
//     listItem.getId()
//   )

export default (S, context) => {
  const client = context.getClient({ apiVersion: "2024-06-01" });

  return S.list()
    .title("Content")
    .items([
      // zundfolge
      S.listItem()
        .title("Zundfolge")
        .icon(BlogIcon)
        .child(
          S.list()
            .title("Zundfolge")
            .items([
              S.listItem()
                .title("Published articles")
                .icon(BlogIcon)
                .id("publishedArticles")
                .child(
                  S.documentTypeList("post")
                    .title("Published articles")
                    .menuItems(S.documentTypeList("post").getMenuItems())
                    // Only show posts with publish date earlier than now and that is not drafts
                    .filter(
                      '_type == "post" && publishedAt < now() && !(_id in path("drafts.**"))',
                    )
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType("post"),
                    ),
                ),
              S.documentTypeListItem("post")
                .title("All articles")
                .icon(AllIcon),
              S.listItem()
                .title("Articles by category")
                .child(
                  // List out all categories
                  S.documentTypeList("category")
                    .title("Articles by category")
                    .child((catId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentTypeList("post")
                        .title("Articles")
                        .filter('_type == "post" && $catId == category._ref')
                        .apiVersion("2023-01-01")
                        .params({ catId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType("post"),
                        ),
                    ),
                ),
              S.listItem()
                .title("Articles by author")
                .child(
                  S.documentTypeList("author")
                    .title("Articles by author")
                    .child((authorId) =>
                      S.documentTypeList("post")
                        .title("Articles")
                        .filter('_type == "post" && $authorId in authors[].author._ref')
                        .apiVersion("2023-01-01")
                        .params({ authorId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType("post"),
                        ),
                    ),
                ),
              S.divider(),
              S.documentTypeListItem("author")
                .title("Authors")
                .icon(AuthorIcon),
              S.documentTypeListItem("category").title("Categories"),
              S.divider(),
              S.listItem()
                .title("Archive")
                .icon(AllIcon)
                .child(
                  S.list()
                    .title("Archive")
                    .items([
                      S.listItem()
                        .title("All Issues")
                        .id("allIssues")
                        .child(createZundfolgeIssueList(S, "All Issues")),
                      S.listItem()
                        .title("Issues by Year")
                        .id("issuesByYear")
                        .child(async () => {
                          const years = await fetchZundfolgeIssueYears(client);
                          return S.list()
                            .title("Issues by Year")
                            .items(buildZundfolgeIssueYearItems(S, years));
                        }),
                      S.listItem()
                        .title("Issues by Decade")
                        .id("issuesByDecade")
                        .child(async () => {
                          const years = await fetchZundfolgeIssueYears(client);
                          return S.list()
                            .title("Issues by Decade")
                            .items(buildZundfolgeIssueDecadeItems(S, years));
                        }),
                    ]),
                ),
            ]),
        ),
      // events
      S.listItem()
        .title("Events")
        .icon(ActiveIcon)
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Active events")
                .schemaType("event")
                .icon(ActiveIcon)
                .child(
                  S.documentList("event")
                    .title("Active events")
                    .menuItems(S.documentTypeList("event").getMenuItems())
                    // Only show events with startTime date later than now and that is not drafts
                    .filter(
                      '_type == "event" && startTime > now() && !(_id in path("drafts.**"))',
                    )
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType("event"),
                    ),
                ),
              S.documentTypeListItem("event")
                .title("All events")
                .icon(AllEventIcon),
              S.listItem()
                .title("Events by category")
                .child(
                  // List out all categories
                  S.documentTypeList("eventCategory")
                    .title("Events by category")
                    .child((catId) =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentTypeList("event")
                        .title("Events")
                        .filter('_type == "event" && $catId == category._ref')
                        .apiVersion("2023-01-01")
                        .params({ catId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType("event"),
                        ),
                    ),
                ),
              S.listItem()
                .title("Events by source")
                .child(
                  S.list()
                    .title("Events by source")
                    .items([
                      S.listItem()
                        .title("MSR")
                        .id("events-source-msr")
                        .icon(MsrIcon)
                        .child(
                          S.documentTypeList("event")
                            .title("MSR Events")
                            .filter('_type == "event" && source == "msr"')
                            .apiVersion("2023-01-01")
                            .child((documentId) =>
                              S.document().documentId(documentId).schemaType("event"),
                            ),
                        ),
                      S.listItem()
                        .title("Manual")
                        .id("events-source-manual")
                        .icon(EditIcon)
                        .child(
                          S.documentTypeList("event")
                            .title("Manual Events")
                            .filter('_type == "event" && (source == "manual" || !defined(source))')
                            .apiVersion("2023-01-01")
                            .child((documentId) =>
                              S.document().documentId(documentId).schemaType("event"),
                            ),
                        ),
                    ]),
                ),
              S.divider(),
              S.documentTypeListItem("eventCategory")
                .title("Categories")
                .icon(MdLocalOffer),
              S.listItem()
                .title("Sources")
                .icon(MdBuild)
                .child(
                  S.list()
                    .title("Sources")
                    .items([
                      S.listItem()
                        .title("MSR")
                        .icon(MsrIcon)
                        .child(
                          S.document()
                            .schemaType("sourceSettings")
                            .documentId("source-settings-msr")
                            .title("MSR Source Settings"),
                        ),
                    ]),
                ),
            ]),
        ),
      // advertisers
      S.listItem()
        .title("Advertisers")
        .icon(AdIcon)
        .child(
          S.list()
            .title("Advertisers")
            .items([
              S.listItem()
                .title("Active advertisers")
                .schemaType("advertiser")
                .icon(AdIconFill)
                .child(
                  S.documentList("advertiser")
                    .title("Active advertiser")
                    .menuItems(S.documentTypeList("advertiser").getMenuItems())
                    .filter(
                      '_type == "advertiser" && active && !(_id in path("drafts.**"))',
                    )
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType("advertiser"),
                    ),
                ),
              S.listItem()
                .title("Active partners")
                .schemaType("advertiser")
                .icon(AdIconFill)
                .child(
                  S.documentList("advertiser")
                    .title("Active partners")
                    .menuItems(S.documentTypeList("advertiser").getMenuItems())
                    .filter(
                      '_type == "advertiser" && partner && !(_id in path("drafts.**"))',
                    )
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType("advertiser"),
                    ),
                ),
              S.documentTypeListItem("advertiser")
                .title("All advertisers")
                .icon(AdIcon),
              S.listItem()
                .title("Advertisers by category")
                .child(
                  S.documentTypeList("advertiserCategory")
                    .title("Advertisers by category")
                    .child((catId) =>
                      S.documentTypeList("advertiser")
                        .title("Advertisers")
                        .filter(
                          '_type == "advertiser" && $catId == category._ref',
                        )
                        .apiVersion("2023-01-01")
                        .params({ catId }),
                    ),
                ),
              S.listItem()
                .title("Advertisers by tier")
                .child(
                  S.documentTypeList("tier")
                    .title("Advertisers by tier")
                    .child((tierId) =>
                      S.documentTypeList("advertiser")
                        .title("Advertisers")
                        .filter('_type == "advertiser" && $tierId == tier._ref')
                        .apiVersion("2023-01-01")
                        .params({ tierId }),
                    ),
                ),
              S.divider(),
              S.documentTypeListItem("tier").title("Rate Tiers").icon(TierIcon),
              S.documentTypeListItem("advertiserCategory").title("Categories"),
            ]),
        ),
      // volunteers
      S.listItem()
        .title("Volunteers")
        .icon(HeartIcon)
        .child(
          S.list()
            .title("Volunteers")
            .items([
              S.listItem()
                .title("Active positions")
                .schemaType("volunteerRole")
                .icon(HeartFillIcon)
                .child(
                  S.documentList("volunteerRole")
                    .title("Active positions")
                    .menuItems(
                      S.documentTypeList("volunteerRole").getMenuItems(),
                    )
                    .filter(
                      `_type == "volunteerRole" &&
                        active == true &&
                        (
                          !(
                            defined(motorsportRegEvent.eventId) ||
                            defined(motorsportRegEvent.name) ||
                            defined(motorsportRegEvent.start) ||
                            defined(motorsportRegEvent.url) ||
                            defined(motorsportRegEvent.venueName) ||
                            defined(motorsportRegEvent.venueCity) ||
                            defined(motorsportRegEvent.venueRegion)
                          ) ||
                          (
                            defined(
                              coalesce(
                                date,
                                string::split(motorsportRegEvent.start, "T")[0]
                              )
                            ) &&
                            coalesce(
                              date,
                              string::split(motorsportRegEvent.start, "T")[0]
                            ) > string::split(now(), "T")[0] &&
                            (
                              !defined(motorsportRegEvent.registrationEnd) ||
                              motorsportRegEvent.registrationEnd == "" ||
                              string::split(motorsportRegEvent.registrationEnd, "T")[0] >= string::split(now(), "T")[0]
                            )
                          )
                        )`,
                    )
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType("volunteerRole"),
                    ),
                ),
              S.documentTypeListItem("volunteerRole")
                .title("All positions")
                .icon(HeartIcon),
              S.listItem()
                .title("Positions by role")
                .icon(HeartIcon)
                .child(
                  S.documentTypeList("volunteerFixedRole")
                    .title("Positions by role")
                    .child((roleId) =>
                      S.documentTypeList("volunteerRole")
                        .title("Positions")
                        .filter(
                          '_type == "volunteerRole" && $roleId == role._ref',
                        )
                        .apiVersion("2023-01-01")
                        .params({ roleId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType("volunteerRole"),
                        ),
                    ),
                ),
              S.divider(),
              S.listItem()
                .title("Pending applications")
                .icon(ReviewIcon)
                .child(
                  S.component()
                    .id("volunteer-pending-applications")
                    .title("Pending Applications")
                    .component(VolunteerApplicationsPane)
                    .options({
                      statuses: ["submitted"],
                      actionTargets: ["assigned", "denied", "withdrawn"],
                      lockStatusFilter: true,
                    }),
                ),
              S.listItem()
                .title("Assigned applications")
                .icon(ApprovedIcon)
                .child(
                  S.component()
                    .id("volunteer-assigned-applications")
                    .title("Assigned Applications")
                    .component(VolunteerApplicationsPane)
                    .options({
                      statuses: ["assigned"],
                      actionTargets: ["withdrawn"],
                      lockStatusFilter: true,
                    }),
                ),
              S.listItem()
                .title("Rejected applications")
                .icon(RejectedIcon)
                .child(
                  S.component()
                    .id("volunteer-rejected-applications")
                    .title("Rejected Applications")
                    .component(VolunteerApplicationsPane)
                    .options({
                      statuses: ["denied"],
                      actionTargets: [],
                      lockStatusFilter: true,
                    }),
                ),
              S.listItem()
                .title("All applications")
                .icon(AllIcon)
                .child(
                  S.component()
                    .id("volunteer-all-applications")
                    .title("All Applications")
                    .component(VolunteerApplicationsPane)
                    .options({
                      actionTargets: ["assigned", "denied", "withdrawn"],
                      lockStatusFilter: false,
                    }),
                ),
              S.divider(),
              S.documentTypeListItem("volunteerFixedRole").title("Roles"),
              S.listItem()
                .title("Roles by point value")
                .child(
                  S.list()
                    .title("Roles by point value")
                    .items(
                      [1, 2, 3, 4, 5, 10].map((pointValue) =>
                        S.listItem()
                          .id(`volunteer-roles-point-${pointValue}`)
                          .title(
                            `${pointValue} point${pointValue === 1 ? "" : "s"}`,
                          )
                          .child(
                            S.documentTypeList("volunteerFixedRole")
                              .title(
                                `${pointValue} point${pointValue === 1 ? "" : "s"}`,
                              )
                              .filter(
                                '_type == "volunteerFixedRole" && pointValue == $pointValue',
                              )
                              .apiVersion("2023-01-01")
                              .params({ pointValue }),
                          ),
                      ),
                    ),
                ),
              S.listItem()
                .title("Roles by category")
                .icon(MdLocalOffer)
                .child(async () => {
                  const categories = await fetchVolunteerCategories(client);
                  return S.list()
                    .title("Roles by category")
                    .items(
                      categories.map((category) =>
                        S.listItem()
                          .id(`volunteer-category-${category._id}`)
                          .title(category.title || "Untitled category")
                          .icon(MdLocalOffer)
                          .child(
                            S.documentTypeList("volunteerFixedRole")
                              .title(category.title || "Untitled category")
                              .filter(
                                '_type == "volunteerFixedRole" && category._ref == $categoryId',
                              )
                              .apiVersion("2023-01-01")
                              .params({ categoryId: category._id }),
                          ),
                      ),
                    );
                }),
              S.divider(),
              S.documentTypeListItem("volunteerCategory")
                .title("Categories")
                .icon(MdLocalOffer),
            ]),
        ),
      S.divider(),
      // site settings
      S.listItem()
        .id("siteSettings")
        .title("Site Settings")
        .icon(Settings)
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      // page settings
      S.listItem()
        .id("pageSettings")
        .title("Page Settings")
        .icon(PageIcon)
        .child(
          S.list()
            .title("Page Settings")
            .items([
              S.listItem()
                .id("frontpage")
                .title("Homepage Settings")
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("frontpage")
                    .title("Homepage Settings"),
                ),
              S.listItem()
                .id("joinPage")
                .title("Join Page Settings")
                .icon(PageIcon)
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("join")
                    .title("Join Page Settings"),
                ),
              S.listItem()
                .id("volunteerPageSettings")
                .title("Volunteer Page Settings")
                .icon(PageIcon)
                .child(
                  S.list()
                    .title("Volunteer Page Settings")
                    .items([
                      S.listItem()
                        .id("volunteerOverviewPageSettings")
                        .title("Overview Page Settings")
                        .icon(PageIcon)
                        .child(
                          S.document()
                            .schemaType("volunteerOverviewPageSettings")
                            .documentId("volunteerOverviewPageSettings")
                            .title("Overview Page Settings"),
                        ),
                      S.listItem()
                        .id("volunteerRewardsPageSettings")
                        .title("Rewards Page Settings")
                        .icon(PageIcon)
                        .child(
                          S.document()
                            .schemaType("volunteerRewardsPageSettings")
                            .documentId("volunteerRewardsPageSettings")
                            .title("Rewards Page Settings"),
                        ),
                      S.listItem()
                        .id("volunteerRolesPageSettings")
                        .title("Roles Page Settings")
                        .icon(PageIcon)
                        .child(
                          S.document()
                            .schemaType("volunteerRolesPageSettings")
                            .documentId("volunteerRolesPageSettings")
                            .title("Roles Page Settings"),
                        ),
                      S.divider(),
                      S.listItem()
                        .id("volunteerApplicationLifecycleSettings")
                        .title("Application Lifecycle Settings")
                        .icon(LifecycleIcon)
                        .child(
                          S.document()
                            .schemaType("volunteerApplicationLifecycleSettings")
                            .documentId("volunteerApplicationLifecycleSettings")
                            .title("Application Lifecycle Settings"),
                        ),
                    ]),
                ),
              S.divider(),
              S.listItem()
                .title("All Pages")
                .icon(PageIcon)
                .child(
                  S.documentList("page")
                    .title("All Pages")
                    .menuItems(S.documentTypeList("page").getMenuItems())
                    .filter(
                      '_type == "page" && !(_id in ["frontpage","join","drafts.frontpage","drafts.join"])',
                    )
                    .apiVersion("2023-01-01"),
                ),
            ]),
        ),
      // page builder
      S.listItem()
        .title("Page Builder")
        .icon(MdBuild)
        .child(
          S.list()
            .title("Landing Pages")
            .items([
              S.listItem()
                .title("Navigation Menus")
                .icon(MdMenu)
                .schemaType("navigationMenu")
                .child(
                  S.documentTypeList("navigationMenu").title(
                    "Navigation Menus",
                  ),
                ),
              S.listItem()
                .title("Routes")
                .schemaType("route")
                .child(
                  S.documentTypeList("route")
                    .title("Routes")
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType("route"),
                    ),
                ),
              S.listItem()
                .title("Pages")
                .schemaType("page")
                .child(
                  S.documentList("page")
                    .title("Pages")
                    .menuItems(S.documentTypeList("page").getMenuItems())
                    .filter('_type == "page" && _id != "frontpage"')
                    .apiVersion("2023-01-01"),
                ),
            ]),
        ),
      S.listItem()
        .title("Email Settings")
        .icon(MdEmail)
        .child(
          S.list()
            .title("Email Settings")
            .items([
              S.listItem()
                .title("Active Aliases")
                .icon(MdEmail)
                .schemaType("emailAlias")
                .child(
                  S.documentTypeList("emailAlias")
                    .title("Active Aliases")
                    .filter('_type == "emailAlias" && enabled != false')
                    .apiVersion("2023-01-01")
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType("emailAlias"),
                    ),
                ),
              S.listItem()
                .title("All Aliases")
                .icon(MdOutlineEmail)
                .schemaType("emailAlias")
                .child(
                  S.documentTypeList("emailAlias")
                    .title("All Aliases")
                    .child((documentId) =>
                      S.document().documentId(documentId).schemaType("emailAlias"),
                    ),
                ),
              S.listItem()
                .title("Aliases by Type")
                .icon(MdOutlineEmail)
                .child(
                  S.documentTypeList("emailAliasType")
                    .title("Aliases by Type")
                    .menuItems(
                      S.documentTypeList("emailAliasType").getMenuItems(),
                    )
                    .child((typeId) =>
                      createEmailAliasList(
                        S,
                        "Aliases",
                        '_type == "emailAlias" && type._ref == $typeId',
                        { typeId },
                      ),
                    ),
                ),
              S.divider(),
              S.listItem()
                .title("Types")
                .icon(MdOutlineLocalOffer)
                .schemaType("emailAliasType")
                .child(
                  S.documentTypeList("emailAliasType")
                    .title("Types")
                    .menuItems(
                      S.documentTypeList("emailAliasType").getMenuItems(),
                    )
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType("emailAliasType"),
                    ),
                ),
              S.divider(),
              S.listItem()
                .id("emailSendingSettings")
                .title("Sending Settings")
                .icon(Settings)
                .child(
                  S.document()
                    .schemaType("emailSendingSettings")
                    .documentId("emailSendingSettings")
                    .title("Sending Settings"),
                ),
            ]),
        ),
    ]);
  };
