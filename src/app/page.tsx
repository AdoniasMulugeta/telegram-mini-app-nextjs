"use client";

import { Section, Cell, Image, List, Avatar, Title, Text, Placeholder, Spinner } from "@telegram-apps/telegram-ui";
import { useTranslations } from "next-intl";

import { Link } from "@/components/Link/Link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher/LocaleSwitcher";
import { Page } from "@/components/Page";

import tonSvg from "./_assets/ton.svg";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const t = useTranslations("i18n");
  const { data: user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <Page back={false}>
        <Placeholder
          header={<Spinner size="l" />}
          description="Loading user information..."
        />
      </Page>
    );
  }

  if (error) {
    return (
      <Page back={false}>
        <Placeholder
          header="Error"
          description="Failed to load user information"
        />
      </Page>
    );
  }

  return (
    <Page back={false}>
      <List>
        {user && (
          <Section header="User Information" footer={`User ID: ${user.id}`}>
            <Cell
              before={
                user.photo_url ? (
                  <Avatar
                    src={user.photo_url}
                    alt={`${user.first_name}'s avatar`}
                    width={60}
                    height={60}
                  />
                ) : (
                  <Avatar
                    src=""
                    alt="Default avatar"
                    width={60}
                    height={60}
                    style={{ backgroundColor: "#007AFF" }}
                  />
                )
              }
              subtitle={user.username ? `@${user.username}` : "No username"}
            >
              <Title level="3">
                {user.first_name} {user.last_name || ""}
              </Title>
            </Cell>
            {user.is_premium && (
              <Cell>
                <Text>✨ Telegram Premium User</Text>
              </Cell>
            )}
          </Section>
        )}
        <Section
          header="Features"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Link href="/ton-connect">
            <Cell
              before={
                <Image
                  src={tonSvg.src}
                  style={{ backgroundColor: "#007AFF" }}
                  alt="TON Logo"
                />
              }
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link href="/init-data">
            <Cell subtitle="User data, chat information, technical data">
              Init Data
            </Cell>
          </Link>
          <Link href="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">
              Launch Parameters
            </Cell>
          </Link>
          <Link href="/theme-params">
            <Cell subtitle="Telegram application palette information">
              Theme Parameters
            </Cell>
          </Link>
        </Section>
        <Section header={t("header")} footer={t("footer")}>
          <LocaleSwitcher />
        </Section>
      </List>
    </Page>
  );
}
