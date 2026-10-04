import { AskList, Button } from "tour-de-growth";

/*
 * The requests, one screen (design system extension 07, A18 T3.c): the
 * numbers that come from someone else, one card per role that holds them,
 * each with its request exactly as it will be copied. Copying is the only
 * way a request leaves the device, and the person does it: nothing is sent.
 *
 * Every prop is the product's own: the island's `AskScreen` (app/[locale]/
 * aarrr-funnel-template/_engine/AskScreen.tsx) called on the engine's
 * fixtures with the resolved copy — the numbers the board's next step opens
 * the screen on (`nextStepFor`, `collectPlan`), each request from
 * `buildRequest` (lib/engine/request.ts), the primary's label from
 * `continueFrom` as the workbench picks it. The copy control is the island's
 * `RequestCopy`, which draws the system's Button: secondary, then quiet once
 * copied. On the page a quiet « ← Tes chiffres » sits above the list.
 */
const noop = () => {};

/**
 * The film's SaaS (`filmState()`, `lib/engine/__tests__/fixtures.ts`) on a first visit, in
 * French: the 5 numbers that take five minutes typed, everything else « à faire ». The board's
 * next step is then the requests (rank 5, `nextStepFor`), and the screen opens on its 5
 * numbers in the funnel's order, one card per role that holds them: Finance (CAC · Marge
 * brute), Support (Cause principale de churn), Data (Coefficient viral (K) · Conversion en
 * payant). A card with two numbers copies one request for both; the support one asks for
 * words, not figures. Nothing copied yet; the primary goes on to the next number to type.
 */
export const FirstVisit = () => (
  <div style={{ maxWidth: 720 }}>
    <AskList
      title={"À demander (5)"}
      lead={"Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses."}
      groups={[
        {
          id: "finance",
          role: "Finance",
          numbers: "CAC · Marge brute",
          request: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me sortir :\n– la dépense d'acquisition en août 2026 (média seul) et le nombre de nouveaux clients payants du même mois\n– la marge brute du dernier trimestre clos, et ce que ses coûts directs comprennent\nDes chiffres bruts me suffisent, sans mise en forme. Merci !",
          action: <Button variant="secondary" onClick={noop}>{"Copier une seule demande (2 chiffres)"}</Button>,
        },
        {
          id: "support",
          role: "Support",
          numbers: "Cause principale de churn",
          request: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me dire :\n– la raison de départ la plus fréquente sur les trois derniers mois, et d'où elle vient\nQuelques mots suffisent. Merci !",
          action: <Button variant="secondary" onClick={noop}>{"Copier la demande"}</Button>,
        },
        {
          id: "data",
          role: "Data",
          numbers: "Coefficient viral (K) · Conversion en payant",
          request: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me sortir :\n– pour les inscrits en juillet 2026, le nombre de personnes inscrites grâce à leurs invitations\n– pour les inscrits en juillet 2026, combien ont payé sous 30 jours, et combien d'inscrits au total\nDes chiffres bruts me suffisent, sans mise en forme. Merci !",
          action: <Button variant="secondary" onClick={noop}>{"Copier une seule demande (2 chiffres)"}</Button>,
        },
      ]}
      done={{ label: "C'est envoyé, passe au chiffre suivant →", onClick: noop }}
      headingId="asks-first-visit"
    />
  </div>
);

/**
 * The same SaaS later, in English: every number a person finds alone is typed, the five to ask
 * for are not. Finance's card has just been copied: its two numbers are stamped with the
 * request and the day (the fixtures' today, 24 September 2026), said on the dashed pending
 * edge, and its button gives way to the quiet « Remind me » (the calendar file). The cards
 * stay where they were, the title keeps its count. Nothing is left to type, so the primary
 * goes to the board.
 */
export const CopiedInSession = () => (
  <div style={{ maxWidth: 720 }}>
    <AskList
      title={"To ask for (5)"}
      lead={"Send the requests today, and fill in the rest while you wait for answers."}
      groups={[
        {
          id: "finance",
          role: "Finance",
          numbers: "CAC · Gross margin",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\n– the acquisition spend in August 2026 (media only) and the number of new paying customers that same month\n– the gross margin of the last closed quarter, and what its direct costs include\nRaw numbers are enough, no formatting needed. Thanks!",
          copied: "Copied on September 24, 2026. Your engine will remind you to follow it up.",
          action: <Button variant="quiet" onClick={noop}>{"Remind me"}</Button>,
        },
        {
          id: "support",
          role: "Support",
          numbers: "Main churn cause",
          request: "Hi — I'm preparing a review of our growth engine. Could you tell me:\n– the most frequent reason for leaving over the last three months, and where it comes from\nA few words are enough. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy the request"}</Button>,
        },
        {
          id: "data",
          role: "Data",
          numbers: "Viral coefficient (K) · Paid conversion",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\n– for the sign-ups from July 2026, the number of people who signed up through their invites\n– for the sign-ups from July 2026, how many paid within 30 days, and how many sign-ups in total\nRaw numbers are enough, no formatting needed. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy one request (2 numbers)"}</Button>,
        },
      ]}
      done={{ label: "Sent, see your engine →", onClick: noop }}
      headingId="asks-copied"
    />
  </div>
);

/**
 * The film's SaaS with its CAC and gross margin not yet asked for, in French — the only two
 * numbers left, both Finance's. The screen opens only for two or more numbers (one opens that
 * number's own screen instead), so the smallest list is one card holding two: « Copier une
 * seule demande (2 chiffres) ». The primary says the board comes next.
 */
export const OneRole = () => (
  <div style={{ maxWidth: 720 }}>
    <AskList
      title={"À demander (2)"}
      lead={"Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses."}
      groups={[
        {
          id: "finance",
          role: "Finance",
          numbers: "CAC · Marge brute",
          request: "Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me sortir :\n– la dépense d'acquisition en août 2026 (média seul) et le nombre de nouveaux clients payants du même mois\n– la marge brute du dernier trimestre clos, et ce que ses coûts directs comprennent\nDes chiffres bruts me suffisent, sans mise en forme. Merci !",
          action: <Button variant="secondary" onClick={noop}>{"Copier une seule demande (2 chiffres)"}</Button>,
        },
      ]}
      done={{ label: "C'est envoyé, vois ton moteur →", onClick: noop }}
      headingId="asks-one-role"
    />
  </div>
);

/**
 * The §18.9 hybrid (`hybridState()`) after its five-minute numbers, in English: 11 numbers to
 * ask for, 5 cards. One request per role covers both engines, its lines under « Self-serve »
 * and « Sales-assisted » so the person asked can tell which customers each is about. Finance's
 * card, 5 numbers, comes first; the bottom of the list is below the capture's fold.
 */
export const Hybrid = () => (
  <div style={{ maxWidth: 720 }}>
    <AskList
      title={"To ask for (11)"}
      lead={"Send the requests today, and fill in the rest while you wait for answers."}
      groups={[
        {
          id: "finance",
          role: "Finance",
          numbers: "CAC · Sales-assisted CAC · 12-month NRR · Gross margin · Sales-assisted gross margin",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\nSelf-serve:\n– the acquisition spend in August 2026 (media only) and the number of new paying customers that same month\n– the gross margin of the last closed quarter, and what its direct costs include\nSales-assisted:\n– the sales and marketing spend from June to August 2026 (media only) and the number of new-customer deals won over the same period\n– the ARR of the sales-assisted customers already there twelve months ago, today and twelve months ago\n– the gross margin of the sales-assisted business from June to August 2026, onboarding and customer success included in the costs\nRaw numbers are enough, no formatting needed. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy one request (5 numbers)"}</Button>,
        },
        {
          id: "customer-success",
          role: "Customer success",
          numbers: "Go-live rate · Main reason for non-renewal",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\nSales-assisted:\n– the new customers signed from March to May 2026, and how many were \"live\" within 90 days of signature\n– the reason that comes up most in recent non-renewals, and where we get it from\nRaw numbers are enough, no formatting needed. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy one request (2 numbers)"}</Button>,
        },
        {
          id: "support",
          role: "Support",
          numbers: "Main churn cause",
          request: "Hi — I'm preparing a review of our growth engine. Could you tell me:\nSelf-serve:\n– the most frequent reason for leaving over the last three months, and where it comes from\nA few words are enough. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy the request"}</Button>,
        },
        {
          id: "data",
          role: "Data",
          numbers: "Viral coefficient (K) · Paid conversion",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\nSelf-serve:\n– for the sign-ups from July 2026, the number of people who signed up through their invites\n– for the sign-ups from July 2026, how many paid within 30 days, and how many sign-ups in total\nRaw numbers are enough, no formatting needed. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy one request (2 numbers)"}</Button>,
        },
        {
          id: "marketing",
          role: "Marketing",
          numbers: "Reference customers",
          request: "Hi — I'm preparing a review of our growth engine. Could you pull:\nSales-assisted:\n– the number of sales-assisted customers with a written agreement, under twelve months old, to be named or take a call\nRaw numbers are enough, no formatting needed. Thanks!",
          action: <Button variant="secondary" onClick={noop}>{"Copy the request"}</Button>,
        },
      ]}
      done={{ label: "Sent, go to the next number →", onClick: noop }}
      headingId="asks-hybrid"
    />
  </div>
);
