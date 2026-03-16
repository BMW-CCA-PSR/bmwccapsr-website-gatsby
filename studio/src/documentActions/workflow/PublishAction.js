import {PublishIcon} from '@sanity/icons'

export function PublishAction(props) {
  // Sanity v3: use props from document actions API
  if (props.liveEdit || props.draft?.state === 'published') {
    return null;
  }

  const onHandle = () => {
    // Sanity v3: use props.onPublish and props.onComplete
    if (props.onPublish) {
      props.onPublish();
    }
    props.onComplete();
  };

  return {
    disabled: props.draft?.state === 'published',
    icon: PublishIcon,
    shortcut: 'mod+shift+p',
    label: 'Publish',
    onHandle,
  };
}