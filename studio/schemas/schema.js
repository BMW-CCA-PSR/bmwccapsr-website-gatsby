import createSchema from 'part:@sanity/base/schema-creator'

import schemaTypes from 'all:part:@sanity/base/schema-type'

// document schemas
import navMenu from './documents/navMenu'
import author from './documents/author'
import category from './documents/category'
import post from './documents/post'
import page from './documents/page'
import siteSettings from './documents/siteSettings'
import route from './documents/route'
import event from './documents/event'
import eventCategory from './documents/eventCategory'
import tier from './documents/tier'
import advertiser from './documents/advertiser'
import advertiserCategory from './documents/advertiserCategory'
import workflow from './documents/workflow'

import simpleBlockContent from './objects/simpleBlockContent'

import * as plugs from './plugs'
import plugDefaultFields from './plugs/_plugDefaultFields'

// Object types
import { instagram, videoEmbed } from './objects/embeds'
import cta from './objects/cta'
import bodyPortableText from './objects/bodyPortableText'
import excerptPortableText from './objects/excerptPortableText'
import mainImage from './objects/mainImage'
import authorReference from './objects/authorReference'
import link from './objects/link'
import variation from './objects/variation'
import openGraph from './objects/openGraph'
import navItem from './objects/navItem'
import address from './objects/address'
import poc from './objects/poc'

const allPlugs = Object.values(plugs).map((plug) => {
  return { ...plug, fields: plugDefaultFields.concat(plug.fields) }
})

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    variation,
    openGraph,
    route,
    link,
    simpleBlockContent,
    cta,
    siteSettings,
    post,
    navMenu,
    page,
    category,
    author,
    mainImage,
    authorReference,
    instagram,
    videoEmbed,
    bodyPortableText,
    excerptPortableText,
    navItem,
    event,
    eventCategory,
    tier,
    advertiser,
    advertiserCategory,
    address,
    workflow,
    poc
  ])
  .concat(allPlugs),
})
