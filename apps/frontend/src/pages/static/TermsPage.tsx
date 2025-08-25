import MarkdownWrapper from "../../components/MarkdownWrapper";

const TermsPage = () => {
  return (
    <div>
      <MarkdownWrapper
        id="terms-and-conditions"
        markdownContent={`
# Terms & Conditions for SMS and Email Notifications

Last updated: 2025-08-25

These Terms & Conditions (“Terms”) govern the use of email and SMS/text message notifications (“Messaging Services”) offered by **Alliance Foundation** (“Alliance,” “we,” “our,” or “us”) through **The Alliance Platform** (the “Platform”). By opting in to receive notifications, you agree to these Terms and our [Privacy Policy](/privacypolicy).

---

## 1. Eligibility and Consent

* You must be a registered user of the Alliance Platform to receive notifications.
* By opting in through your account settings, you consent to receive communications from us, including but not limited to service updates, reminders, confirmations, and notifications related to your activity on the Platform.
* Opting in is entirely voluntary. You will not receive SMS or email notifications unless you expressly choose to do so.

---

## 2. Message Frequency

The number and type of messages you receive will vary based on your activity on the Platform, your notification preferences, and the categories of alerts you choose to enable.
Typical communications include, but are not limited to:

  * Account activity updates
  * Notifications related to actions, events, or commitments you have joined
  * Service announcements, feature updates, and important legal or policy changes

---

## 3. Opt-Out and Account Controls

* You may opt out of SMS or email notifications at any time through your account settings.
* For SMS/text messages, you may also reply **“STOP”** to any message you receive from us to unsubscribe immediately from that notification channel.
* For email communications, you may use the “Unsubscribe” link included in the footer of each message, or adjust your preferences in your account settings.
* Please allow a reasonable processing time (up to 72 hours) for opt-out requests to take effect.

---

## 4. Customer Support and Contact

For questions, concerns, or assistance regarding Messaging Services, you may contact us at:

  * **Email:** [support@worldalliance.org](mailto:support@worldalliance.org)


---

## 5. Messaging Costs and Carrier Liability

* Standard message and data rates may apply for SMS/text messages, depending on your mobile carrier and plan.
* We are not responsible for any charges incurred from your mobile service provider as a result of receiving our messages.
* Message delivery is subject to your mobile carrier’s network availability and performance. We are not liable for delayed or undelivered messages.

---

## 6. Privacy

* Your privacy is important to us. Personal information collected for Messaging Services will be handled in accordance with our [Privacy Policy](/privacy).
* We will never sell, rent, or disclose your mobile phone number or email address to unaffiliated third parties for their marketing purposes without your explicit consent.

---

## 7. Prohibited Uses

* Messaging Services are intended solely for communications between Alliance Foundation and you, the account holder.
* You may not use, misuse, or attempt to interfere with Messaging Services in a way that could damage or disrupt the Platform or its users.

---

## 8. Termination of Messaging Services

* We reserve the right to suspend or terminate Messaging Services at any time, with or without notice.
* If your account on the Platform is deactivated, closed, or terminated, you will no longer receive Messaging Services.

---

## 9. Modifications to Terms

* We may revise these Terms from time to time. Changes will be posted at this page (/terms) with an updated effective date.
* Continued use of Messaging Services after such modifications constitutes your acceptance of the updated Terms.

---

## 10. Limitation of Liability

* Messaging Services are provided on an “as is” and “as available” basis.
* Alliance Foundation disclaims liability for any damages, losses, or claims arising from or related to the receipt (or failure to receive) SMS or email messages.
* To the maximum extent permitted by law, Alliance Foundation and its affiliates are not responsible for indirect, incidental, or consequential damages arising from Messaging Services.

---

## 11. Acceptance of Terms

By opting in to receive SMS or email notifications from the Alliance Platform, you acknowledge that you have read, understood, and agreed to these Terms.
`}
      />
    </div>
  );
};

export default TermsPage;
