"use client";

import {
  Section,
  Cell,
  List,
  Avatar,
  Title,
  Text,
  Placeholder,
  Spinner,
  Input,
  IconContainer,
} from "@telegram-apps/telegram-ui";
import { Page } from "@/components/Page";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
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

  const staticBots = [
    {
      id: 1,
      name: "meeni_meet_bot",
      username: "tiny_meet_bot",
      initial: "M",
      color: "#90C979",
    },
    {
      id: 2,
      name: "etma",
      username: "Tma_et_bot",
      initial: "E",
      color: "#90C979",
    },
    {
      id: 3,
      name: "Quizzy",
      username: "quizzy_ai_bot",
      initial: "Q",
      color: "#FF9F40",
    },
    {
      id: 4,
      name: "wagabot",
      username: "wagaet_bot",
      initial: "W",
      color: "#A78BFA",
    },
    {
      id: 5,
      name: "Liyou Store",
      username: "liyoustore_bot",
      initial: "LS",
      color: "#5EEAD4",
    },
    {
      id: 6,
      name: "LABA FINANCE BOT",
      username: "LABA_FINANCE_BOT",
      initial: "LB",
      color: "#5EEAD4",
    },
  ];

  return (
    <Page back={false}>
      <div style={{ padding: "16px 0" }}>
        {user && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar
              src={user.telegramUser?.photoUrl || ""}
              alt={`${user.name}'s avatar`}
              size={96}
              style={{
                margin: "0 auto 16px",
                backgroundColor: user.telegramUser?.photoUrl
                  ? undefined
                  : "#007AFF",
              }}
            />
            <Title level="1" weight="1" style={{ marginBottom: 8 }}>
              {user.name}
            </Title>
            {user.telegramUser?.username && (
              <Text
                weight="3"
                style={{ color: "var(--tgui--hint_color)", marginBottom: 8 }}
              >
                @{user.telegramUser?.username}
              </Text>
            )}
          </div>
        )}

        <div style={{ padding: "0 16px 16px" }}>
          <Input placeholder="Search" style={{ marginBottom: 16 }} />
        </div>

        <List>
          <Section header="My bots">
            <Cell
              before={
                <IconContainer
                  style={{ backgroundColor: "var(--tgui--accent_text_color)" }}
                >
                  {/* <Icon24Add style={{ color: "white" }} /> */}
                </IconContainer>
              }
              onClick={() => {}}
            >
              Create a New Bot
            </Cell>

            {staticBots.map((bot) => (
              <Cell
                key={bot.id}
                before={
                  <Avatar
                    size={40}
                    style={{
                      backgroundColor: bot.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      {bot.initial}
                    </span>
                  </Avatar>
                }
                subtitle={`@${bot.username}`}
                onClick={() => {}}
              >
                {bot.name}
              </Cell>
            ))}
          </Section>
        </List>
      </div>
    </Page>
  );
}
