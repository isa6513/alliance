import type { FormSchema } from "@alliance/common/forms/form-schema";
import { actionPartnershipsCreateResponse } from "@alliance/shared/client";
import { useAllianceMemberCount } from "@alliance/shared/lib/useAllianceMemberCount";
import { cn } from "@alliance/shared/styles/util";
import React, { type FormEvent, useState } from "react";
import Footer from "../../components/Footer";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import { exampleMemberTaskAction } from "../../lib/exampleMemberTaskAction";
import { socialPreviewMeta } from "../../lib/socialPreviewMeta";
import LargeActionCard from "../app/LargeActionCard";

export function meta() {
  return socialPreviewMeta({
    title: "Outreach Partnerships",
    description:
      "Work with Alliance members who each commit 15 minutes every week to concrete actions for a better world.",
    url: "/outreach-partner",
  });
}

const OUTREACH_CHANNELS = [
  "Website",
  "Newsletter or mailing list",
  "Online meeting",
  "In-person event",
  "Social media",
  "Member community",
  "Other",
] as const;

const PARTNER_OFFERS = [
  {
    title: "Educate our members on your cause",
    body: "Help people who already want to do good understand the issue you work on and why it matters.",
  },
  {
    title: "Get thoughtful feedback",
    body: "Invite members to review your website, actions, product, campaigns, messages, or other materials.",
  },
  {
    title: "Engage or invite engagement",
    body: "Ask members to follow, comment, share, test, attend, or invite others when there is a concrete way to help.",
  },
  {
    title: "Help with data collection",
    body: "Members can send surveys, fill out surveys, or help collect small pieces of information when the task is clear.",
  },
] as const;

const PAST_PARTNERS = [
  { name: "EarthDay", href: "https://www.earthday.org/" },
  { name: "apgard", href: "https://www.apgardai.com/" },
  { name: "NutritionFacts.org", href: "http://nutritionfacts.org" },
] as const;

const outreachPartnerExampleAction = {
  ...exampleMemberTaskAction,
  id: 2,
  name: "Review a reforestation nonprofit's website",
  body: "Learn about a local reforestation project, then give the partner nonprofit focused feedback on whether their website makes the work clear and compelling.",
  category: "environment",
  timeEstimate: 15,
  usersJoined: 186,
  usersCompleted: 139,
  shortDescription:
    "Learn about a local reforestation project, then answer a few questions about the nonprofit's website design.",
};

const outreachPartnerExampleFormSchema = {
  title: "Reforestation website feedback",
  description: "",
  pages: [
    {
      id: "page-1",
      title: "Page 1",
      fields: [
        {
          id: "field-site-opened",
          type: "input",
          kind: "radio",
          label: "Were you able to open the nonprofit's homepage?",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    },
    {
      id: "page-2",
      title: "Page 2",
      fields: [
        {
          id: "field-first-attention",
          type: "input",
          kind: "textarea",
          label: "When the site loads, where is your eye drawn first?",
          placeholder:
            "For example: the headline, a photo, a donate button, a statistic, or something else.",
          rows: 2,
          required: true,
        },
        {
          id: "field-phrase-meaning",
          type: "input",
          kind: "textarea",
          label:
            'What do you think they mean by "Rebuild canopy where climate risk and local stewardship overlap"?',
          placeholder:
            "Write what you think the organization is trying to communicate.",
          rows: 2,
          required: true,
        },
        {
          id: "field-main-point",
          type: "input",
          kind: "radio",
          label:
            "After one minute on the page, what seems like the main point?",
          required: true,
          options: [
            {
              label: "They plant trees in specific local areas",
              value: "local-reforestation",
            },
            {
              label: "They need donations or volunteers",
              value: "support-needed",
            },
            {
              label: "They are explaining a broader environmental problem",
              value: "environmental-problem",
            },
            { label: "I am not sure", value: "not-sure" },
          ],
        },
      ],
    },
    {
      id: "page-3",
      title: "Page 3",
      fields: [
        {
          id: "field-one-thing-learned",
          type: "input",
          kind: "textarea",
          label: "What is one thing you learned from the page?",
          placeholder:
            "Share a point you would remember or repeat to someone else.",
          rows: 2,
          required: true,
        },
        {
          id: "field-confusing-moment",
          type: "input",
          kind: "textarea",
          label: "Was anything confusing or hard to follow?",
          placeholder:
            "It is fine to say no. If yes, describe where you got stuck in your own words.",
          rows: 2,
          required: true,
        },
      ],
    },
  ],
  submit: { label: "Complete" },
  outputViews: [],
  aggregateViews: [],
} satisfies FormSchema;

function Field({
  label,
  name,
  children,
  required = false,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={name} className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-zinc-900">
        {label}
        {required ? <span className="text-green-bg-card"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition focus:border-green-bg-card focus:ring-2 focus:ring-green-bg-card/20";

function OutreachPartnerPage() {
  useWhiteBackground();
  const { data: memberCount } = useAllianceMemberCount();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [otherOutreachSelected, setOtherOutreachSelected] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const outreachChannels = formData
      .getAll("outreachChannels")
      .map((value) => String(value));
    if (outreachChannels.length === 0) {
      setSubmitted(false);
      setOutreachError(
        "Select at least one way your organization could share.",
      );
      return;
    }

    setOutreachError(null);
    setSubmitError(null);
    setSubmitting(true);
    try {
      await actionPartnershipsCreateResponse({
        body: {
          organizationName: String(
            formData.get("organizationName") ?? "",
          ).trim(),
          organizationWebsite: String(
            formData.get("organizationWebsite") ?? "",
          ).trim(),
          personName: String(formData.get("personName") ?? "").trim(),
          contact: String(formData.get("contact") ?? "").trim(),
          outreachChannels,
          outreachOtherDetails: String(
            formData.get("outreachOtherDetails") ?? "",
          ).trim(),
          audienceSize: String(formData.get("audienceSize") ?? "").trim(),
          desiredCollaboration: String(
            formData.get("desiredCollaboration") ?? "",
          ).trim(),
          notes: String(formData.get("notes") ?? "").trim(),
        },
        throwOnError: true,
      });
      form.reset();
      setOtherOutreachSelected(false);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit action partnership form", error);
      setSubmitted(false);
      setSubmitError(
        "Something went wrong submitting this. Please try again or email contact@worldalliance.org.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <PrelaunchNavbar transparent={false} absolute={false} />
      <main className="bg-white">
        <section>
          <div className="mx-auto grid w-full max-w-[74rem] grid-cols-1 gap-8 px-5 pt-12 pb-10 sm:px-8 md:pt-16 md:pb-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(460px,1.05fr)] lg:items-center lg:gap-12 xl:gap-14">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                <h1 className="font-serif text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl lg:text-5xl">
                  Mobilize a reliable online community that cares
                </h1>
                <p className="text-lg leading-relaxed text-zinc-700">
                  At the Alliance, our{" "}
                  <span className="font-semibold text-zinc-900">
                    {memberCount ? memberCount.toLocaleString() : ""}
                    {memberCount ? " " : ""}volunteer members
                  </span>{" "}
                  each spend 15 minutes a week taking actions on our online
                  platform.
                </p>
                <p className="text-lg leading-relaxed text-zinc-700">
                  For organizations working to address our priorities, we can
                  design a focused task within our weekly action program in
                  which members learn about your work, give feedback, support a
                  campaign, or help with another clear request.
                </p>
              </div>

              <p className="text-lg leading-relaxed text-zinc-700">
                We have previously worked with organizations like{" "}
                {PAST_PARTNERS.map((partner, index) => (
                  <React.Fragment key={partner.name}>
                    {index === 0
                      ? ""
                      : index === PAST_PARTNERS.length - 1
                        ? ", and "
                        : ", "}
                    <a
                      href={partner.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      {partner.name}
                    </a>
                  </React.Fragment>
                ))}
                .
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <article className="rounded-md border border-zinc-200 bg-white p-5">
                  <h2 className="font-serif text-2xl font-semibold text-green-bg">
                    What we can do
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-zinc-700">
                    Run a focused action where members help with a clear, useful
                    task.
                  </p>
                </article>
                <article className="rounded-md border border-zinc-200 bg-white p-5">
                  <h2 className="font-serif text-2xl font-semibold text-green-bg">
                    What we ask
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-zinc-700">
                    Share the Alliance through a newsletter, website, meeting,
                    event, social channel, or similar place.
                  </p>
                </article>
              </div>
            </div>

            <aside className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 sm:px-6 sm:py-5">
              <div className="mb-4">
                <h2 className="font-serif text-2xl font-semibold text-green-bg">
                  Example member action
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 sm:text-base">
                  A reforestation nonprofit could have Alliance members learn
                  about its work and answer some questions about its website.
                </p>
              </div>
              <div className="mx-auto max-w-xl overflow-hidden rounded-md [zoom:1] sm:[zoom:0.9] lg:[zoom:0.78] xl:[zoom:0.84]">
                <LargeActionCard
                  action={outreachPartnerExampleAction}
                  staticTaskFormSchema={outreachPartnerExampleFormSchema}
                  staticTaskInitialPageIndex={1}
                  userRelation="none"
                  onUpdateActionState={() => {}}
                  onCompleteAction={() => {}}
                  showDetails={false}
                  className="pointer-events-none border border-zinc-200 bg-white p-3 shadow-sm sm:p-4 [&_.my-4]:my-2 [&_.pt-6]:pt-3 [&_.text-title]:text-xl!"
                />
              </div>
              <p className="mt-3 text-center text-sm text-zinc-500 sm:mt-5">
                Sample action a member would see on the platform
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-grey-0">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-8 md:py-16">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-zinc-950 sm:text-4xl">
                How we can help
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-zinc-700">
                Alliance members care about the world. Because they are
                coordinated and used to taking structured actions, they make a
                strong audience for thoughtful feedback, quick research, and
                other practical help.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {PARTNER_OFFERS.map((offer) => (
                <article
                  key={offer.title}
                  className="rounded-md border border-zinc-200 bg-white p-6"
                >
                  <h3 className="font-serif text-2xl font-semibold text-green-bg">
                    {offer.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-zinc-700">
                    {offer.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="outreach-partner-form">
          <div className="mx-auto grid w-full max-w-[68rem] grid-cols-1 gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[0.66fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-3xl font-semibold text-zinc-950 sm:text-4xl">
                Sign up as a potential outreach partner
              </h2>
              <p className="text-lg leading-relaxed text-zinc-700">
                Tell us what you are working on, what kind of action might help,
                and how your organization could share the Alliance with people
                who might want to join.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 rounded-md border border-zinc-200 bg-white p-5 sm:p-7"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Organization name"
                  name="organizationName"
                  required
                >
                  <input
                    className={inputClassName}
                    id="organizationName"
                    name="organizationName"
                    placeholder="Reforest Local"
                    required
                    type="text"
                  />
                </Field>
                <Field
                  label="Organization website"
                  name="organizationWebsite"
                  required
                >
                  <input
                    className={inputClassName}
                    id="organizationWebsite"
                    name="organizationWebsite"
                    placeholder="https://example.org"
                    required
                    type="url"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Your name" name="personName" required>
                  <input
                    className={inputClassName}
                    id="personName"
                    name="personName"
                    placeholder="Your name"
                    required
                    type="text"
                  />
                </Field>
                <Field label="Email" name="contact" required>
                  <input
                    className={inputClassName}
                    id="contact"
                    name="contact"
                    placeholder="Email"
                    required
                    type="email"
                  />
                </Field>
              </div>

              <Field
                label="What would you like Alliance members to do?"
                name="desiredCollaboration"
                required
              >
                <textarea
                  className={cn(inputClassName, "min-h-32 resize-y")}
                  id="desiredCollaboration"
                  name="desiredCollaboration"
                  placeholder="For example: learn about a cause, review a website, give campaign feedback, engage on social media, help with a survey, or something more custom."
                  required
                />
              </Field>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-semibold text-zinc-900">
                  How could your organization get the word out about the
                  Alliance in return?{" "}
                  <span className="text-green-bg-card">*</span>
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {OUTREACH_CHANNELS.map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-800"
                    >
                      <input
                        name="outreachChannels"
                        type="checkbox"
                        value={channel}
                        className="size-4 accent-green-bg-card"
                        disabled={submitting}
                        onChange={(event) => {
                          if (channel === "Other") {
                            setOtherOutreachSelected(event.target.checked);
                          }
                          setOutreachError(null);
                          setSubmitted(false);
                          setSubmitError(null);
                        }}
                      />
                      {channel}
                    </label>
                  ))}
                </div>
                {otherOutreachSelected ? (
                  <Field
                    label="What other way could you share?"
                    name="outreachOtherDetails"
                    required
                  >
                    <textarea
                      className={cn(inputClassName, "min-h-24 resize-y")}
                      id="outreachOtherDetails"
                      name="outreachOtherDetails"
                      placeholder="Briefly describe the other channel or context."
                      required={otherOutreachSelected}
                      maxLength={1000}
                    />
                  </Field>
                ) : null}
                {outreachError ? (
                  <p className="text-sm font-medium text-red-600">
                    {outreachError}
                  </p>
                ) : null}
              </fieldset>

              <Field
                label="Membership, mailing list, or audience size"
                name="audienceSize"
                required
              >
                <input
                  className={inputClassName}
                  id="audienceSize"
                  name="audienceSize"
                  placeholder="Approximate size and where those people are"
                  required
                  type="text"
                />
              </Field>

              <Field label="Other notes" name="notes">
                <textarea
                  className={cn(inputClassName, "min-h-28 resize-y")}
                  id="notes"
                  name="notes"
                  placeholder="Anything else we should know?"
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="self-start rounded-md bg-green-bg-card px-6 py-3 text-base font-semibold text-white transition hover:bg-green-bg focus:outline-none focus:ring-2 focus:ring-green-bg-card/30"
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
              {submitError ? (
                <p className="text-sm font-medium text-red-600">
                  {submitError}
                </p>
              ) : null}
              {submitted ? (
                <p className="text-sm font-medium text-green-bg">
                  Thanks. We received your response and will follow up soon.
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default OutreachPartnerPage;
