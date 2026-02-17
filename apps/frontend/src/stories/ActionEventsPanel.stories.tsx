import { Meta, StoryObj } from "@storybook/react";
import { testActions } from "./testData";
import ActionEventsPanel from "../components/ActionEventsPanel";

const meta = {
  title: "Alliance/ActionEventsPanel",
  component: ActionEventsPanel,
  tags: ["component"],
  parameters: {
    layout: "centered",
  },
  args: {
    action: testActions[0],
  },
} satisfies Meta<typeof ActionEventsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
