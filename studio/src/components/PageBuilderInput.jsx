import React, { useCallback, useMemo, useState } from "react";
import { AddIcon } from "@sanity/icons";
import { randomKey } from "@sanity/util/content";
import { Box, Button, Card, Dialog, Flex, Grid, Heading, Stack, Text } from "@sanity/ui";
import { ArrayOfObjectsInput } from "sanity";

const PREVIEW_ROOT = "/static/page-builder";
const PREVIEW_EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"];

const SECTION_METADATA = {
  uiComponentRef: {
    description: "Insert a reusable UI reference by name.",
  },
  hero: {
    description: "Large hero area with image, text, and CTA.",
  },
  heroCarousel: {
    description: "Multiple hero slides displayed as a carousel.",
  },
  ctaPlug: {
    description: "Callout section with copy and action buttons.",
  },
  zundfolgeLatest: {
    description: "Latest Zundfolge issue teaser block.",
  },
  upcomingEvents: {
    description: "Upcoming events feed with configurable limit.",
  },
  homepageSponsors: {
    description: "Partner and sponsor logo section.",
  },
  headerBar: {
    description: "Simple section header or divider block.",
  },
  pageContent: {
    description: "Rich text content section for general page copy.",
  },
  advertisement: {
    description: "Ad placement block for sponsorship inventory.",
  },
};

const getPreviewSources = (schemaType) => {
  const customPreviewPath =
    schemaType?.options?.pageBuilderPreviewImage ||
    schemaType?.options?.pageBuilder?.previewImage;

  if (customPreviewPath) {
    return [customPreviewPath];
  }

  return PREVIEW_EXTENSIONS.map(
    (extension) => `${PREVIEW_ROOT}/${schemaType.name}.${extension}`
  );
};

const getVisibleSchemaTypes = (schemaTypes = []) =>
  schemaTypes.filter((schemaType) => schemaType && schemaType.hidden !== true);

const PreviewImage = ({ schemaType }) => {
  const sources = useMemo(() => getPreviewSources(schemaType), [schemaType]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const Icon = schemaType.icon;
  const currentSource = sources[sourceIndex];

  if (!currentSource) {
    return (
      <FallbackPreview
        icon={Icon}
        title={schemaType.title || schemaType.name}
        name={schemaType.name}
      />
    );
  }

  return (
    <img
      src={currentSource}
      alt={schemaType.title || schemaType.name}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
        borderRadius: "6px",
      }}
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
};

const FallbackPreview = ({ icon: Icon, title, name }) => (
  <Flex
    align="center"
    justify="center"
    direction="column"
    gap={3}
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "6px",
      background:
        "linear-gradient(135deg, rgba(28, 39, 56, 0.12), rgba(28, 39, 56, 0.03))",
      border: "1px solid rgba(28, 39, 56, 0.12)",
    }}
  >
    {Icon ? (
      <Box style={{ fontSize: "1.5rem", lineHeight: 0 }}>
        <Icon />
      </Box>
    ) : null}
    <Stack space={2}>
      <Text align="center" size={1} weight="semibold">
        {title}
      </Text>
      <Text align="center" muted size={0}>
        {name}
      </Text>
    </Stack>
  </Flex>
);

const PreviewCard = ({ schemaType, onSelect }) => {
  const title = schemaType.title || schemaType.name;
  const description =
    SECTION_METADATA[schemaType.name]?.description || schemaType.name;
  const Icon = schemaType.icon;

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(schemaType);
      }
    },
    [onSelect, schemaType]
  );

  return (
    <Card
      as="button"
      border
      padding={3}
      radius={3}
      shadow={1}
      tone="default"
      onClick={() => onSelect(schemaType)}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        background: "transparent",
        height: "100%",
      }}
    >
      <Stack space={3}>
        <Box
          style={{
            width: "100%",
            minHeight: "180px",
            aspectRatio: "16 / 9",
          }}
        >
          <PreviewImage schemaType={schemaType} />
        </Box>
        <Stack space={2}>
          <Flex align="center" gap={2}>
            {Icon ? (
              <Box style={{ fontSize: "1rem", lineHeight: 0 }}>
                <Icon />
              </Box>
            ) : null}
            <Heading as="h3" size={1}>
              {title}
            </Heading>
          </Flex>
          <Text muted size={1}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
};

const PageBuilderInput = (props) => {
  const { onInsert, readOnly, schemaType } = props;
  const [isDialogOpen, setDialogOpen] = useState(false);

  const sectionTypes = useMemo(
    () => getVisibleSchemaTypes(schemaType.of),
    [schemaType.of]
  );

  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  const handleSelect = useCallback(
    (selectedSchemaType) => {
      onInsert({
        items: [
          {
            _type: selectedSchemaType.name,
            _key: randomKey(12),
          },
        ],
        position: "after",
        referenceItem: -1,
        open: true,
      });
      closeDialog();
    },
    [closeDialog, onInsert]
  );

  const renderArrayFunctions = useCallback(
    () => (
      <Button
        mode="ghost"
        icon={AddIcon}
        text="Add section"
        onClick={openDialog}
        disabled={readOnly}
      />
    ),
    [openDialog, readOnly]
  );

  return (
    <>
      <ArrayOfObjectsInput {...props} arrayFunctions={renderArrayFunctions} />
      {isDialogOpen ? (
        <Dialog
          id="page-builder-section-selector"
          header="Select a page section"
          width={5}
          zOffset={1000}
          onClose={closeDialog}
        >
          <Box padding={4}>
            <Stack space={4}>
              <Text muted size={1}>
                Choose a section type to insert into the page builder.
              </Text>
              <Grid columns={[1, 1, 2, 3]} gap={3}>
                {sectionTypes.map((sectionType) => (
                  <PreviewCard
                    key={sectionType.name}
                    schemaType={sectionType}
                    onSelect={handleSelect}
                  />
                ))}
              </Grid>
            </Stack>
          </Box>
        </Dialog>
      ) : null}
    </>
  );
};

export default PageBuilderInput;
