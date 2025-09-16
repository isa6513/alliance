import { Meta, StoryObj } from "@storybook/react";
import ActionPage from "../pages/app/ActionPage";

import { UserActionDto } from "@alliance/shared/client";
import { http, HttpResponse } from "msw";
import { testActions, testActivities, testForumPosts } from "./testData";

const meta = {
  title: "Alliance/ActionPage",
  component: ActionPage,
  tags: ["page"],
  parameters: {
    msw: {
      handlers: [
        http.get("/actions/1", () => {
          return HttpResponse.json(testActions[0]);
        }),
        http.get("/forum/posts/action/1", () => {
          return HttpResponse.json(testForumPosts);
        }),
        http.get("/actions/1/activities", () => {
          return HttpResponse.json(testActivities);
        }),
        http.get("/actions/myStatus/1", () => {
          return HttpResponse.json({
            status: "joined",
            dateCommitted: "2021-01-01",
            dateCompleted: "2021-01-01",
            deadline: "2021-01-01",
            actionId: 1,
          } satisfies UserActionDto);
        }),
      ],
    },
  },
  args: {},
} satisfies Meta<typeof ActionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <ActionPage />;
  },
};
