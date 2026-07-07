import { actionPartnershipsCreateResponse } from "@alliance/shared/client";
import { useAllianceMemberCount } from "@alliance/shared/lib/useAllianceMemberCount";
import { cn } from "@alliance/shared/styles/util";
import React, { type FormEvent, useState } from "react";
import Footer from "../../components/Footer";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import PrelaunchNavbar from "../../components/PrelaunchNavbar";
import { socialPreviewMeta } from "../../lib/socialPreviewMeta";

export function meta() {
  return socialPreviewMeta({
    title: "Action Partnerships",
    description:
      "Work with Alliance members who each commit 15 minutes every week to concrete actions for a better world.",
    url: "/action-partner",
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

function ActionPartnerPage() {
  useWhiteBackground();
  const { data: memberCount } = useAllianceMemberCount();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outreachError, setOutreachError] = useState<string | null>(null);

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
          personName: String(formData.get("personName") ?? "").trim(),
          contact: String(formData.get("contact") ?? "").trim(),
          outreachChannels,
          audienceSize: String(formData.get("audienceSize") ?? "").trim(),
          desiredCollaboration: String(
            formData.get("desiredCollaboration") ?? "",
          ).trim(),
          notes: String(formData.get("notes") ?? "").trim(),
        },
        throwOnError: true,
      });
      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit action partnership inquiry", error);
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
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pt-12 pb-10 sm:px-8 md:pt-16 md:pb-12">
            <div className="flex flex-col gap-5">
              <h1 className="font-serif text-4xl leading-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                Partner with people
                <br />
                committed to help
              </h1>
              <p className="text-lg leading-relaxed text-zinc-700">
                At the Alliance, our{" "}
                <span className="font-semibold text-zinc-900">
                  {memberCount ? memberCount.toLocaleString() : ""}
                  {memberCount ? " " : ""}volunteer members
                </span>{" "}
                each commit 15 minutes a week to coordinated actions to improve
                the world.
              </p>
              <p className="text-lg leading-relaxed text-zinc-700">
                For aligned organizations, we can design a focused task within
                our weekly action program where participating members learn
                about your work, give feedback, support a campaign, or help with
                another clear request.
              </p>
              <p className="text-lg leading-relaxed text-zinc-700">
                In return, we ask partners to share the Alliance with more
                people who want to make a difference.
              </p>
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
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-md border border-zinc-200 bg-white md:grid-cols-2">
              <article className="p-6">
                <h3 className="font-serif text-2xl text-green-bg">
                  What we can do
                </h3>
                <p className="mt-2 text-base leading-relaxed text-zinc-700">
                  Run a focused action where members help with a clear, useful
                  task.
                </p>
              </article>
              <article className="border-t border-zinc-200 p-6 md:border-t-0 md:border-l">
                <h3 className="font-serif text-2xl text-green-bg">
                  What we ask
                </h3>
                <p className="mt-2 text-base leading-relaxed text-zinc-700">
                  Share the Alliance through a newsletter, website, meeting,
                  event, social channel, or similar place.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 border-t border-zinc-200 px-5 py-12 sm:px-8 md:py-16">
            <div>
              <h2 className="font-serif text-3xl text-zinc-950 sm:text-4xl">
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
                  <h3 className="font-serif text-2xl text-green-bg">
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

        <section id="action-partner-form">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 border-t border-zinc-200 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[0.72fr_1fr]">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-3xl text-zinc-950 sm:text-4xl">
                Sign up as a potential action partner
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
                    required
                    type="text"
                  />
                </Field>
                <Field label="Your name" name="personName" required>
                  <input
                    className={inputClassName}
                    id="personName"
                    name="personName"
                    required
                    type="text"
                  />
                </Field>
              </div>

              <Field label="Your contact information" name="contact" required>
                <input
                  className={inputClassName}
                  id="contact"
                  name="contact"
                  placeholder="Email, phone, or another preferred contact"
                  required
                  type="text"
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
                        onChange={() => {
                          setOutreachError(null);
                          setSubmitted(false);
                          setSubmitError(null);
                        }}
                      />
                      {channel}
                    </label>
                  ))}
                </div>
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
                {submitting ? "Sending..." : "Send action partnership inquiry"}
              </button>
              {submitError ? (
                <p className="text-sm font-medium text-red-600">
                  {submitError}
                </p>
              ) : null}
              {submitted ? (
                <p className="text-sm font-medium text-green-bg">
                  Thanks. We received your inquiry and will follow up soon.
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

export default ActionPartnerPage;
