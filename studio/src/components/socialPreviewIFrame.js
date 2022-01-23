import React from 'react'
import S from '@sanity/desk-tool/structure-builder'
import resolveSlugByType from '../../resolveSlugByType'
import { toPlainText } from 'part:social-preview/utils'
import SocialPreview from 'part:social-preview/component'
import {
    GoThumbsup as ThumbsUp,
} from 'react-icons/go'

function SocialPreviewIFrame(props) {
    return S.view.component(
        SocialPreview({
            prepareFunction: (
                { title, mainImage, slug, excerpt }
            ) => ({
                title,
                description: toPlainText(excerpt || []),
                siteUrl: 'https://bmw-club-psr.org',
                ogImage: mainImage,
                slug: `${resolveSlugByType(props)}${slug.current}`
            }),
        })
    ).title('Social & SEO').icon(ThumbsUp)
}

export default SocialPreviewIFrame