import React from 'react'
import ReactPlayer from 'react-player'
import { Box, Card, Text } from '@sanity/ui'

const EmbedPlayer = (props) => {
  const url = String(props?.value?.url || props?.url || '').trim()

  if (!url) {
    return (
      <Card padding={2} radius={2} tone="transparent">
        <Text size={1} muted>
          Add a video URL
        </Text>
      </Card>
    )
  }

  return (
    <Card padding={2} radius={2} shadow={1}>
      <Box style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        <Box style={{ position: 'absolute', inset: 0 }}>
          <ReactPlayer url={url} controls width="100%" height="100%" />
        </Box>
      </Box>
      <Text size={1} style={{ marginTop: 8, overflowWrap: 'anywhere' }}>
        {url}
      </Text>
    </Card>
  )
}

export default EmbedPlayer
