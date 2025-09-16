import { Meta, StoryObj } from "@storybook/react";
import UserProfilePage from "../pages/app/UserProfilePage";

import { FriendStatusDto } from "@alliance/shared/client";
import { http, HttpResponse } from "msw";
import {
  testActionsWithRelation,
  testForumPosts,
  testFriends,
  testUser,
} from "./testData";

const meta = {
  title: "Alliance/UserProfilePage",
  component: UserProfilePage,
  tags: ["page"],
  parameters: {
    msw: {
      handlers: [
        http.get("/user/1", () => {
          return HttpResponse.json(testUser);
        }),
        http.get("/actions/completed/1", () => {
          return HttpResponse.json(testActionsWithRelation);
        }),
        http.get("/user/listfriends/1", () => {
          return HttpResponse.json(testFriends);
        }),
        http.post("/user/friends/1", () => {
          return HttpResponse.json({});
        }),
        http.get("/user/myfriendrelationship/1", () => {
          return HttpResponse.json({
            status: "none",
          } satisfies FriendStatusDto);
        }),
        http.get("/forum/posts/user/1", () => {
          return HttpResponse.json(testForumPosts);
        }),
      ],
    },
  },
  args: {},
} satisfies Meta<typeof UserProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <UserProfilePage />;
  },
};
