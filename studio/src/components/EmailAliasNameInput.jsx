import React, { useEffect, useState } from "react";
import { CopyIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text, useToast } from "@sanity/ui";
import { useClient } from "sanity";
import {
  buildEmailAliasAddress,
  normalizeDomain,
  normalizeEmailAliasLocalPart,
} from "../lib/emailAlias";

const API_VERSION = "2024-06-01";
const SITE_DOMAIN_QUERY = `coalesce(*[_id == "drafts.siteSettings"][0].domain, *[_id == "siteSettings"][0].domain, "")`;

const EmailAliasNameInput = (props) => {
  const { renderDefault, value } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [domain, setDomain] = useState("");

  useEffect(() => {
    let cancelled = false;

    client
      .fetch(SITE_DOMAIN_QUERY)
      .then((nextDomain) => {
        if (cancelled) return;
        setDomain(normalizeDomain(nextDomain));
      })
      .catch(() => {
        if (cancelled) return;
        setDomain("");
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const aliasAddress = buildEmailAliasAddress(value, domain);
  const aliasName = normalizeEmailAliasLocalPart(value);
  const hasAlias = Boolean(aliasName);
  const helperText = hasAlias
    ? aliasAddress || `${aliasName}@<set domain in Site Settings>`
    : "Enter an alias name";
  const canCopy = hasAlias;

  const handleCopy = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(helperText);
      toast.push({
        status: "success",
        title: "Alias copied",
      });
    } catch {
      toast.push({
        status: "error",
        title: "Could not copy alias",
      });
    }
  };

  return (
    <Stack space={3}>
      {renderDefault(props)}
      <Card border overflow="hidden" radius={2} tone={hasAlias ? "primary" : "default"}>
        <Flex align="stretch">
          <Box flex={1} padding={3}>
            <Stack space={2}>
              <Text muted size={1}>
                Email Alias
              </Text>
              <Text size={2} weight="semibold">
                {helperText}
              </Text>
            </Stack>
          </Box>
          <Button
            aria-label="Copy alias"
            disabled={!canCopy}
            icon={CopyIcon}
            mode="bleed"
            onClick={handleCopy}
            padding={4}
            style={{
              alignSelf: "stretch",
              borderRadius: 0,
            }}
          />
        </Flex>
      </Card>
    </Stack>
  );
};

export default EmailAliasNameInput;
