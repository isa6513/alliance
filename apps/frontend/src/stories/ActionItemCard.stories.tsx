import { Meta, StoryObj } from "@storybook/react";
import ActionItemCard from "../components/ActionItemCard";
import { testActions } from "./testData";

const meta = {
  title: "Alliance/ActionItemCard",
  component: ActionItemCard,
  tags: ["component"],
  parameters: {
    layout: "centered",
  },
  args: {
    action: testActions[0],
  },
} satisfies Meta<typeof ActionItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
