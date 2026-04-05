import React from "react";
import { GrNavigate } from "react-icons/gr";

const NavigationItemIcon = () =>
  React.createElement(GrNavigate, { color: "var(--card-fg-color)" })

export default {
    name: 'navigationItem',
    title: 'Navigation Item',
    type: 'object',
    icon: NavigationItemIcon,
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Navigation Menu label'
          },
          {
            name: 'navigationItemUrl',
            type: 'reference', 
            title: 'select submenu',
            to: {type: 'navigationMenu'},
          }
    ],
    preview: {
      select: {
        title: 'title',
        submenuTitle: 'navigationItemUrl.title'
      },
      prepare({title, submenuTitle}) {
        const previewTitle = title || submenuTitle || 'Untitled navigation item'
        const subtitle = submenuTitle ? `Submenu: ${submenuTitle}` : 'No submenu selected'

        return {
          title: previewTitle,
          subtitle,
          media: NavigationItemIcon
        }
      }
    }
}
