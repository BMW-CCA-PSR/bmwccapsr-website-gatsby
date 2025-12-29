import React from 'react'
import ReactPlayer from 'react-player'

const EmbedPlayer = (props) => {
  return (
    <div>
      Embedded video
      {props.renderDefault(props)}
    </div>
  )
}

export default EmbedPlayer