/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import React from "react";

const Footer = ({ siteTitle }) => (
  <footer sx={{
    backgroundColor: "grey"
  }}>
    <div sx={{
      mx: "auto",
      px: 8
    }}>
      <div sx={{
        width:"full",
        display:"flex",
        py:6
      }}>
        <div sx={{
          display:"flex-1",
          mb:6
        }}>
          <a
            sx={{color: "orange"}}
            className="text-orange-600 no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            href="#"
          >
            {siteTitle}
          </a>
        </div>

        <div 
          sx={{display:"flex-1"}}>
          <p sx={{color: "gray"}}>Links</p>
          <ul sx={{listStyle:"reset", mb:6}}>
            <li sx={{mt:2, display:"inline-block", mr:2}}>
              <a href="https://www.tailwindtoolbox.com/templates/landing-page">
                <span className="hover:underline text-gray-800 hover:text-orange-500">
                  Page theme
                </span>
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://sanity.io/docs"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Sanity Help
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://slack.sanity.io"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Slack Community
              </a>
            </li>
          </ul>
        </div>
        <div sx={{display:"flex-1"}}>
          <p className="uppercase text-gray-500 md:mb-6">Legal</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <span className="no-underline hover:underline text-gray-800 hover:text-orange-500">
                Terms
              </span>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <span className="no-underline hover:underline text-gray-800 hover:text-orange-500">
                Privacy
              </span>
            </li>
          </ul>
        </div>
        <div sx={{display:"flex-1"}}>
          <p className="uppercase text-gray-500 md:mb-6">Social</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://twitter.com/sanity_io"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Twitter
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://www.linkedin.com/company/sanity-io/"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Linkedin
              </a>
            </li>
          </ul>
        </div>
        <div sx={{display:"flex-1"}}>
          <p className="uppercase text-gray-500 md:mb-6">Company</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <Link
                to="/blog"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Blog
              </Link>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://www.sanity.io/contact"
                className="no-underline hover:underline text-gray-800 hover:text-orange-500"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;