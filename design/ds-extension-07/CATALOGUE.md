# The engine's numbers, as its page prints them

*Extracted on 2026-10-02 from the prerendered page (`/en/aarrr-funnel-template`, `/fr/aarrr-funnel-template`), section "The engine's numbers", folded by default. Generic slots (`[cohort month]`, the activation event) stand where a real setup fills in its own words. Every string is still marked "to be reviewed" in the code. This is the expertise brief 07 asks to keep: read it, do not rewrite it.*

## English

### Self-serve: 17 numbers

Three per stage, like the Tour's three questions, and five for Revenue, which also carries the MRR movements. For each: its formula, where to find it, and the trap to know before quoting it.


#### Acquisition

- **Sign-up rate** (The stage's number)
  - The share of the month's visitors who create an account.
  - *Formula*: sign-ups in the month ÷ unique visitors in the month
  - *Where to find it*:
    - GA4 — the month's total Users (the Users metric; add it to the Traffic acquisition report if it isn't there), not Sessions
    - Mixpanel or Amplitude — a two-step funnel, page view then sign-up, over the month
    - Product database — the accounts created in the month: the most reliable count of sign-ups
  - *The trap*: Visitors come from analytics, sign-ups often from your database: the two don't count the same people (blockers, several devices). Write it in your definition.
  - *Reference*: 2–5% · for context, never to name a stage: for cold paid traffic, far higher for warm traffic; your traffic is a mix
  - *Effort*: On your own, 5 min
- **Top channel share**
  - The share of your sign-ups that comes from your main channel.
  - *Formula*: sign-ups from the top channel ÷ sign-ups in the month
  - *Where to find it*:
    - GA4 — the User acquisition report, dimension "First user default channel group"
    - HubSpot — the contacts created in [month], grouped by their original source (the Original Traffic Source property, or Original Source depending on your account)
    - Salesforce — the leads created in [month], grouped by the Lead Source field
  - *The trap*: In GA4, "Referral" means a referring website, not a customer's recommendation; and "Direct" groups visits that arrived with no known source (bookmark, typed address, link without a referrer).
  - *Reference*: No reference worth publishing: no threshold of dependence on one channel is worth publishing; the share and the channel's name are enough to open the discussion.
  - *Effort*: On your own, ~1 h
- **CAC**
  - What a new paying customer costs, on average.
  - *Formula*: acquisition spend in the month ÷ new paying customers in the month
  - *Where to find it*:
    - Google Ads, Meta Ads Manager, LinkedIn Campaign Manager — the amount spent in [month], all campaigns together
    - Finance — marketing and sales salaries and tools, for the "+ team" and "fully loaded" variants
    - Stripe or Chargebee — the subscriptions that became paid in [month], free trials excluded
  - *The trap*: A month's spend against the same month's customers assumes people buy within a month. If your cycle is longer, shift the spend and write it down.
  - *Reference*: No reference worth publishing: there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC).
  - *Effort*: Ask someone

#### Activation

- **Activation rate** (The stage's number)
  - The share of sign-ups who reach first value in time.
  - *Formula*: cohort sign-ups who triggered the activation event within n days ÷ cohort sign-ups
  - *Where to find it*:
    - Amplitude — a Funnel Analysis chart: sign-up then the activation event, n-day conversion window
    - Mixpanel or PostHog — a funnel from sign-up to the activation event, with a conversion window of n days
    - GA4 — a funnel exploration (Explore tab), if the activation event is sent to GA4
  - *The trap*: Change the chosen action and the rate can double or halve. Write your definition down, and keep it from one month to the next.
  - *Reference*: 20–40% · for context, never to name a stage: for SaaS onboarding, often lower for free trials; it all depends on how demanding the chosen event is
  - *Effort*: On your own, ~1 h
- **Activation event**
  - The action that shows a sign-up has reached the product's value.
  - *Formula*: the action's name, and the number of days allowed to do it
  - *Where to find it*:
    - Product — a product team decision, not a number a tool gives you on its own
  - *The trap*: An action picked because it is easy to count is not a moment of value. The one that counts separates the sign-ups who stay from those who leave.
  - *Effort*: On your own, 5 min
- **Median time to value**
  - How long a sign-up takes to reach first value.
  - *Formula*: median time between sign-up and the activation event
  - *Where to find it*:
    - Amplitude, Mixpanel or PostHog — the sign-up then the activation event funnel, shown as time to convert rather than as a rate
    - GA4 — no median in the standard reports: ask the data team, from the event export
  - *The trap*: An average drops when stragglers give up, and then looks like progress. Use the median.
  - *Reference*: No reference worth publishing: "within the first session" is an often-quoted ambition, not a measured norm.
  - *Effort*: On your own, ~1 h

#### Retention

- **Day-30 retention** (The stage's number)
  - The share of sign-ups still active a month after signing up.
  - *Formula*: cohort sign-ups still active 30 days after signing up ÷ cohort sign-ups
  - *Where to find it*:
    - Amplitude — a Retention Analysis chart: starting event sign-up, return event your usage action
    - Mixpanel or PostHog — a retention report on the cohort, read at day 30
    - GA4 — a cohort exploration (Explore tab), if usage is sent there
  - *The trap*: "Active" must be written down: a login isn't usage. And say whether day 30 means that exact day or the week around it: tools do both.
  - *Reference*: No reference worth publishing: the published orders of magnitude are for consumer apps; in SaaS, compare the shape of your curve from one month to the next.
  - *Effort*: On your own, ~1 h
- **Monthly logo churn**
  - The share of paying customers who leave in the month.
  - *Formula*: paying customers lost in the month ÷ paying customers at the start of the month
  - *Where to find it*:
    - Stripe — the Billing overview page, "Subscriber churn rate" chart; Stripe computes it over thirty rolling days, new subscribers included: recount it by month if you can
    - Chargebee — the customer churn reports (RevenueStory, depending on your edition)
    - ChartMogul or Baremetrics — the customer churn chart, by month
  - *The trap*: This counts customers, not revenue: revenue churn is another number. And a monthly churn above thirty percent is often an annual figure.
  - *Reference*: 1–2% · for context, never to name a stage: for high-ticket B2B SaaS; low-ticket products run much higher, enterprise contracts much lower
  - *Effort*: On your own, 5 min
- **Main churn cause**
  - Why customers leave, and how you know.
  - *Formula*: the cause, and where it comes from: data, interviews or gut feel
  - *Where to find it*:
    - HubSpot or Salesforce — the loss-reason field of customers who left, if it is filled in
    - Support — read the latest cancellations and the tickets that came before them
  - *The trap*: A hunch shared by the whole team is still a hunch. Ten cancellations read beat one conviction.
  - *Effort*: Ask someone

#### Referral

- **Referred sign-up share** (The stage's number)
  - The share of sign-ups brought in by a user.
  - *Formula*: sign-ups who came through a user (code, invite link, "how did you hear about us?" answer) ÷ cohort sign-ups
  - *Where to find it*:
    - Referral tool or invitations table — the sign-ups from [cohort month] who have a referrer or a code
    - HubSpot — a "how did you hear about us?" property filled in at sign-up
  - *The trap*: GA4's "referral" source counts websites that send traffic, not customers who recommend you.
  - *Reference*: No reference worth publishing: from almost none to a majority depending on whether other people see the product; compare with yourself.
  - *Effort*: On your own, ~1 h
- **Referral mechanism**
  - What lets one user bring in another.
  - *Formula*: none, in communication only, or in the product
  - *Where to find it*:
    - Product — the product team knows whether there is an invite, a referral scheme or sharing in the product
  - *The trap*: Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share of sign-ups.
  - *Effort*: On your own, 5 min
- **Viral coefficient (K)**
  - How many new sign-ups each sign-up brings in, on average.
  - *Formula*: sign-ups invited by the cohort ÷ cohort sign-ups
  - *Where to find it*:
    - Invitations table — the invitees who signed up, attached to the cohort of whoever invited them
    - Mixpanel or Amplitude — if the invite is tracked there as an event, joined with the invitations table
  - *The trap*: K divides by every sign-up in the cohort, not just by those who invited someone.
  - *Reference*: 0.15–0.5 · for context, never to name a stage: the realistic range for most products; a sustained K above 1 is rare and almost always temporary
  - *Effort*: Ask someone

#### Revenue

- **Paid conversion** (The stage's number)
  - The share of sign-ups who pay within the window.
  - *Formula*: cohort sign-ups who paid within n days ÷ cohort sign-ups
  - *Where to find it*:
    - Data — a join between the product database and Stripe or Chargebee, on the customer id
    - Stripe or Chargebee — each customer's first payment date, to match against their sign-up date
    - HubSpot or Salesforce — the cohort's won deals, if a salesperson is involved
  - *The trap*: The rates that circulate mix trials, freemium and card-at-sign-up. Only compare with yourself, from one month to the next.
  - *Reference*: No reference worth publishing: no published rate uses the same base as yours.
  - *Effort*: Ask someone
- **Monthly ARPA**
  - The average monthly revenue of a paying customer.
  - *Formula*: MRR ÷ paying customers
  - *Where to find it*:
    - Stripe — the Billing overview page: MRR and active subscribers, or the ARPU it shows directly
    - Chargebee — MRR and active customers in its subscription reports
    - ChartMogul — the ARPA chart, directly
  - *The trap*: An ARPA rising while the number of customers falls is often small customers leaving.
  - *Reference*: No reference worth publishing: it varies by three orders of magnitude from one product category to another.
  - *Effort*: On your own, 5 min
- **Gross margin**
  - What is left of a payment after the cost of serving the customer.
  - *Formula*: (revenue – direct cost of service: hosting, payment fees, support) ÷ revenue
  - *Where to find it*:
    - Finance — the income statement of the last closed quarter: revenue, then the direct cost of service
  - *The trap*: Using revenue instead of margin flatters the payback: margin is what pays the CAC back.
  - *Reference*: 70–85% · for context, never to name a stage: in SaaS; much lower as soon as people are part of the delivery
  - *Effort*: Ask someone
- **Monthly expansion**
  - The revenue customers already on board add in the month: upgrades, seats, add-ons.
  - *Formula*: expansion MRR in the month ÷ MRR at the start of the month
  - *Where to find it*:
    - Stripe — the Billing overview page: the month's MRR movements, the "expansion" line
    - Chargebee — the MRR movement reports (RevenueStory, depending on your edition)
    - ChartMogul or Baremetrics — the MRR movements chart, by month
  - *The trap*: New customers' MRR is not expansion: only customers already paying at the start of the month count.
  - *Reference*: No reference worth publishing: the room for expansion depends on the pricing model: large with seats, small with a flat price.
  - *Effort*: On your own, ~1 h
- **Monthly contraction**
  - The revenue customers who stay take away in the month: a cheaper plan, fewer seats.
  - *Formula*: MRR lost to downgrades in the month ÷ MRR at the start of the month
  - *Where to find it*:
    - Stripe — the Billing overview page: the month's MRR movements, the "contraction" line
    - Chargebee — the MRR movement reports (RevenueStory, depending on your edition)
    - ChartMogul or Baremetrics — the MRR movements chart, by month
  - *The trap*: A customer who leaves is not a downgrade: their MRR is churn, counted separately.
  - *Reference*: No reference worth publishing: it depends on the pricing model as much as on the product: no order of magnitude fits everyone.
  - *Effort*: On your own, ~1 h

#### And five computed numbers

- **LTV**
  - *Formula*: ARPA × gross margin × lifetime (1 ÷ monthly churn, at most 36 months)
  - *The trap*: lifetime capped at 36 months: many practitioners cap it between three and five years, we take the low end
- **CAC payback**
  - *Formula*: CAC ÷ (ARPA × gross margin), in months
  - *Reference*: 12–24 months · for context, never to name a stage: a commonly cited reference, not a law: the real comparison is still the cash in the bank
- **LTV:CAC**
  - *Formula*: LTV ÷ CAC
  - *Reference*: 3 · for context, never to name a stage: a rule of thumb, not a law
- **Monthly GRR**
  - *Formula*: 100% – churn – contraction, on the MRR at the start of the month
- **Monthly NRR**
  - *Formula*: 100% – churn – contraction + expansion, on the MRR at the start of the month

### Sales-assisted: 15 numbers

Three per stage, two for Referral and four for Revenue, which also carries sales-assisted's margin. Flows and cohorts read over rolling three-month periods: one month has too few deals.


#### Acquisition

- **Lead-to-opportunity rate** (The stage's number)
  - The share of a period's leads that become a qualified opportunity.
  - *Formula*: leads created [over three months] that became a qualified opportunity within n days ÷ leads created [over three months]
  - *Where to find it*:
    - HubSpot — the contacts created over the period, with the date they entered the Opportunity lifecycle stage: an export, then those who got there within n days
    - Salesforce — a leads report with conversion details: created over the period, converted within n days (converted date minus created date)
    - Pipedrive — the leads inbox: the period's leads converted into a deal; otherwise, an export
  - *The trap*: "Lead" has no shared definition: imported contacts or webinar sign-ups drag the rate down. Write down what counts as a lead, and as an opportunity.
  - *Reference*: No reference worth publishing: the rate depends entirely on what the company calls a lead.
  - *Effort*: On your own, ~1 h
- **Sales-assisted CAC**
  - What a new customer signed by the sales team costs, on average.
  - *Formula*: sales and marketing spend [over three months] ÷ new sales-assisted customers signed [over three months]
  - *Where to find it*:
    - Finance — the quarter's sales and marketing spend, loaded salaries included for the "fully loaded" variant
    - HubSpot, Salesforce or Pipedrive — the new-customer deals won over the period: the number it divides by
    - Ad platforms — the period's media cost, for the "media only" variant
  - *The trap*: If the median cycle runs past three months, this quarter's customers come from earlier spend. In a hybrid, split the shared spend by a key, and write it down.
  - *Reference*: No reference worth publishing: there is no good CAC in absolute terms: it is judged against what a customer brings in (payback, LTV:CAC).
  - *Effort*: Ask someone
- **Median sales cycle**
  - How long it takes to sign a deal, from opportunity to contract.
  - *Formula*: median days between an opportunity's creation and its signature, over the new-customer deals won [over three months]
  - *Where to find it*:
    - Salesforce — a report of the opportunities won over the period, with their age in days: an export, then the median
    - HubSpot — the deals won, from create date to close date: an export, then the median, since the reports give averages
    - Pipedrive — deal duration in the reports is an average: the median comes from an export
  - *The trap*: One 400-day deal moves the average by weeks: use the median. And an opportunity created late, after the demo, shortens the cycle on paper.
  - *Reference*: No reference worth publishing: the cycle depends on the deal size and on who signs at the customer: it is followed quarter to quarter.
  - *Effort*: On your own, ~1 h

#### Activation

- **Go-live rate** (The stage's number)
  - The share of new customers live within the set time after signature.
  - *Formula*: new customers signed [over three months] live within n days ÷ new customers signed [over three months]
  - *Where to find it*:
    - Customer success platform — each account's onboarding stage and its date: Gainsight, Vitally or Planhat keep it
    - HubSpot or Salesforce — an onboarding pipeline, or a "live" date field on the account, if there is one
    - Customer success spreadsheet — often the only place the date is written down
  - *The trap*: Counting deployed accounts instead of live ones doubles the rate. And read the mature cohort: a customer signed less than n days ago hasn't had its window.
  - *Reference*: No reference worth publishing: go-live depends on what the offer needs set up: it is followed against its own target.
  - *Effort*: Ask someone
- **What "live" means**
  - The concrete result that shows a customer got what they bought.
  - *Formula*: the result that counts as "live", and the number of days allowed to reach it after signature
  - *Where to find it*:
    - Customer success and product — a decision to make together: what a live customer does that a merely deployed account doesn't
  - *The trap*: "Deployed" isn't "live": an account delivered that nobody uses doesn't renew.
  - *Effort*: On your own, 5 min
- **Time to go-live**
  - The time, in days, from signature to go-live.
  - *Formula*: median days from signature to go-live, for the customers signed [over three months] who got there
  - *Where to find it*:
    - Customer success platform — each account's signature date and onboarding end date
    - HubSpot or Salesforce — the signature date and the "live" date, if they exist
    - Onboarding spreadsheet — both dates, account by account
  - *The trap*: Median, and only over those who got there: the others are in the go-live rate.
  - *Reference*: No reference worth publishing: it depends on what the offer needs set up.
  - *Effort*: On your own, ~1 h

#### Retention

- **Contract renewal rate** (The stage's number)
  - The share of contracts up for renewal that renew, counted in customers.
  - *Formula*: contracts renewed ÷ contracts up for renewal [over three months], in customers, not in money
  - *Where to find it*:
    - HubSpot, Salesforce or Pipedrive — a renewals pipeline: won ÷ closed over the period
    - Stripe or Chargebee — the subscriptions whose term ended in the period, and their status today
    - Customer success — the quarter's list of renewal dates, when the CRM doesn't keep it
  - *The trap*: Auto-renewal isn't "won": count the cancellations received before the term ends. A multi-year contract not yet up for renewal stays out.
  - *Reference*: No reference worth publishing: the glossary quotes a monthly churn, not a renewal rate: converting it would assume monthly contracts.
  - *Effort*: On your own, ~1 h
- **12-month NRR**
  - What last year's sales-assisted customers are worth today, in revenue.
  - *Formula*: today's ARR from the sales-assisted customers already there twelve months ago ÷ their ARR twelve months ago
  - *Where to find it*:
    - ChartMogul — net revenue retention by cohort, depending on the plan
    - Finance — the board reporting
    - Salesforce — the sum of active contracts per account at two dates, if contracts live there
  - *The trap*: Published alone, it hides the loss: an NRR above 100% can rest on a base that loses one customer in five. Read it with the renewal rate.
  - *Reference*: 110–130% · for context, never to name a stage: considered solid in B2B SaaS, context and not a target
  - *Effort*: Ask someone
- **Main reason for non-renewal**
  - The reason that comes up most when a customer doesn't renew.
  - *Formula*: the reason, and how we know it: data, interviews or gut feel
  - *Where to find it*:
    - HubSpot, Salesforce or Pipedrive — the lost reason on lost renewals, often a custom field
    - Customer success — go through the latest departures with the team
  - *The trap*: "Price" is the quickest box to tick. Cross the stated reason with usage over the 90 days before.
  - *Effort*: Ask someone

#### Referral

- **Referred opportunities** (The stage's number)
  - The share of opportunities brought in by a customer or a partner.
  - *Formula*: opportunities created [over three months] that came from a referral ÷ opportunities created [over three months]
  - *Where to find it*:
    - Salesforce — the lead or opportunity source: its referral and partner values
    - HubSpot — a deal source property, often one to create: the original source doesn't know about referrals
    - The sales team — where their last ten opportunities came from: often faster and more accurate
  - *The trap*: A zero almost always means "nobody counted it". And a web tool's "referral" source counts websites, not people.
  - *Reference*: No reference worth publishing: from almost none to the majority depending on the product: the only reference is its own number.
  - *Effort*: On your own, ~1 h
- **Reference customers**
  - The share of sales-assisted customers who agree to be named or take a call.
  - *Formula*: sales-assisted customers with a written agreement under twelve months old ÷ sales-assisted customers at the end of [month]
  - *Where to find it*:
    - Marketing or customer success — the references spreadsheet, with each agreement's date
    - HubSpot, Salesforce or Pipedrive — a "reference customer" property on the company, if the team created one
  - *The trap*: The logos on the website count customers who left and agreements never renewed.
  - *Reference*: No reference worth publishing: an agreement to be named depends on each customer.
  - *Effort*: Ask someone

#### Revenue

- **Win rate** (The stage's number)
  - The share of closed opportunities that are won.
  - *Formula*: new-customer opportunities won ÷ new-customer opportunities closed (won + lost) [over three months]
  - *Where to find it*:
    - Salesforce — the new-customer opportunities closed over the period: won ÷ closed
    - HubSpot — the new-business deals closed over the period: won ÷ (won + lost)
    - Pipedrive — deal conversion over the period, in the reports
  - *The trap*: Dead deals never marked "lost" inflate the rate, and a "no decision" is a loss. Sales to existing customers don't belong here.
  - *Reference*: No reference worth publishing: the rate depends on deal size and on what counts as an opportunity: it is followed against its own target.
  - *Effort*: On your own, 5 min
- **New-contract ACV**
  - What a new signed contract is worth per year, on average.
  - *Formula*: annual value of the new-customer contracts signed [over three months], onboarding fees excluded ÷ number of those contracts
  - *Where to find it*:
    - HubSpot — the ACV property on won deals, otherwise their amount
    - Salesforce — the amount on won opportunities: check it covers one year, not the whole term
    - Finance — the contracts signed over the period
  - *The trap*: An amount covering a three-year contract triples the ACV, and onboarding isn't recurring. An average gets pulled by one big deal: look at the median too.
  - *Reference*: No reference worth publishing: ACV spans several orders of magnitude from one category to another: no reference holds for all.
  - *Effort*: On your own, 5 min
- **Sales-assisted ARPA**
  - A sales-assisted customer's average monthly revenue.
  - *Formula*: MRR of the sales-assisted customers at the end of [month] ÷ sales-assisted customers at the end of [month]
  - *Where to find it*:
    - Stripe, Chargebee or ChartMogul — MRR and customers filtered on sales-assisted customers: a segment, a plan, a property
    - Finance — sales-assisted ARR ÷ 12, and the number of sales-assisted customers
  - *The trap*: In a hybrid, a customer counts in the one motion that signed their current contract: a self-serve customer moved over by a salesperson counts here.
  - *Reference*: No reference worth publishing: three orders of magnitude separate categories: no reference holds for all.
  - *Effort*: On your own, 5 min
- **Sales-assisted gross margin**
  - What is left of sales-assisted revenue after the cost of serving those customers, onboarding included.
  - *Formula*: (sales-assisted revenue – cost to serve it, onboarding and customer success included) ÷ sales-assisted revenue, [over three months]
  - *Where to find it*:
    - Finance — the income statement by offer or segment, when it keeps one; otherwise the company-wide margin as a fallback
  - *The trap*: A company-wide margin flatters sales-assisted when its offer includes onboarding: ask finance for the margin by motion.
  - *Reference*: No reference worth publishing: onboarding and customer success weigh differently in every offer.
  - *Effort*: Ask someone

#### And three computed numbers

- **Sales-assisted LTV**
  - *Formula*: ACV ÷ 12 × sales-assisted gross margin × lifetime (from the renewal rate, at most 36 months)
  - *The trap*: lifetime capped at 36 months, as in self-serve: many practitioners cap it between three and five years, we take the low end
- **Sales-assisted CAC payback**
  - *Formula*: sales-assisted CAC ÷ (ACV ÷ 12 × sales-assisted gross margin), in months
  - *Reference*: 12–24 months · for context, never to name a stage: a commonly cited reference, not a law: the real comparison is still the cash in the bank
- **Sales-assisted LTV:CAC**
  - *Formula*: sales-assisted LTV ÷ sales-assisted CAC
  - *Reference*: 3 · for context, never to name a stage: a rule of thumb, not a law

### The link, if you sell both ways

- **Opportunities from self-serve**
  - The share of sales-assisted opportunities that started from a self-serve account.
  - *Formula*: opportunities created [over three months] from a self-serve account ÷ opportunities created [over three months]
  - *Where to find it*:
    - HubSpot — the deal source, or a "PQL" property set by the product integration
    - Salesforce — the lead source, or a campaign dedicated to PQLs
    - Data — a product database × CRM join on the company's domain
  - *The trap*: A share of the pipeline, not an attribution: the account may already have talked to a salesperson. And it doesn't add up with the referred share.
  - *Reference*: No reference worth publishing: the only reference worth having is the team's own base rate.
  - *Effort*: On your own, ~1 h

## Français

### Libre-service : 17 chiffres

Trois par étape, comme les trois questions du Tour, et cinq pour Revenue, qui porte aussi les mouvements du MRR. Pour chacun : sa formule, où le trouver, et le piège à connaître avant de le citer.


#### Acquisition

- **Taux d'inscription** (Le chiffre de l'étape)
  - La part des visiteurs du mois qui créent un compte.
  - *Formule*: inscrits du mois ÷ visiteurs uniques du mois
  - *Où le trouver*:
    - GA4 — le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions
    - Mixpanel ou Amplitude — un entonnoir en deux étapes, page vue puis inscription, sur le mois
    - Base produit — les comptes créés sur le mois : le compte le plus fiable pour les inscrits
  - *Le piège*: Les visiteurs viennent de l'analytics, les inscrits souvent de ta base : les deux ne comptent pas les mêmes personnes (bloqueurs, appareils multiples). Écris-le dans ta définition.
  - *Repère*: 2 à 5 % · pour situer, sans désigner d'étape : pour du trafic payant froid, bien plus pour du trafic chaud ; ton trafic est un mélange
  - *Effort*: Seul, 5 min
- **Part du premier canal**
  - La part de tes inscrits qui vient de ton canal principal.
  - *Formule*: inscrits venus du premier canal ÷ inscrits du mois
  - *Où le trouver*:
    - GA4 — le rapport Acquisition d'utilisateurs, dimension « Groupe de canaux par défaut pour le premier utilisateur »
    - HubSpot — les contacts créés en [mois], regroupés par leur source d'origine (propriété Original Traffic Source, ou Original Source selon ton compte)
    - Salesforce — les leads créés en [mois], regroupés par le champ Lead Source
  - *Le piège*: Dans GA4, « Referral » veut dire site référent, pas recommandation d'un client ; et « Direct » regroupe les visites arrivées sans source connue (favori, adresse tapée, lien sans référent).
  - *Repère*: Pas de repère publiable : aucun seuil de dépendance à un canal n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion.
  - *Effort*: Seul, ~1 h
- **CAC**
  - Ce que coûte, en moyenne, un nouveau client payant.
  - *Formule*: dépense d'acquisition du mois ÷ nouveaux clients payants du mois
  - *Où le trouver*:
    - Google Ads, Meta Ads Manager, LinkedIn Campaign Manager — le montant dépensé en [mois], toutes campagnes confondues
    - Finance — les salaires et les outils des équipes marketing et ventes, pour les variantes « + équipe » et « tout chargé »
    - Stripe ou Chargebee — les abonnements devenus payants en [mois], essais gratuits exclus
  - *Le piège*: La dépense d'un mois face aux clients du même mois suppose qu'on achète en moins d'un mois. Si ton cycle est plus long, décale la dépense et écris-le.
  - *Repère*: Pas de repère publiable : il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC).
  - *Effort*: À demander

#### Activation

- **Taux d'activation** (Le chiffre de l'étape)
  - La part des inscrits qui atteignent la première valeur à temps.
  - *Formule*: inscrits de la cohorte ayant déclenché l'événement d'activation sous n jours ÷ inscrits de la cohorte
  - *Où le trouver*:
    - Amplitude — un graphique Funnel Analysis : inscription puis l'événement d'activation, fenêtre de conversion de n jours
    - Mixpanel ou PostHog — un entonnoir inscription puis l'événement d'activation, avec une fenêtre de conversion de n jours
    - GA4 — une exploration de l'entonnoir (onglet Explorer), si l'événement d'activation est envoyé à GA4
  - *Le piège*: Change l'action retenue et le taux peut varier du simple au double. Écris ta définition, et garde la même d'un mois à l'autre.
  - *Repère*: 20 à 40 % · pour situer, sans désigner d'étape : pour un onboarding SaaS, souvent plus bas en essai gratuit ; tout dépend de l'exigence de l'événement retenu
  - *Effort*: Seul, ~1 h
- **Événement d'activation**
  - L'action qui montre qu'un inscrit a touché la valeur du produit.
  - *Formule*: le nom de l'action, et le nombre de jours laissés pour la faire
  - *Où le trouver*:
    - Produit — une décision de l'équipe produit, pas un chiffre qu'un outil sort tout seul
  - *Le piège*: Une action choisie parce qu'elle est facile à compter n'est pas un moment de valeur. Celle qui compte distingue les inscrits qui restent de ceux qui partent.
  - *Effort*: Seul, 5 min
- **Time-to-value médian**
  - Le temps qu'il faut à un inscrit pour atteindre la première valeur.
  - *Formule*: médiane du délai entre l'inscription et l'événement d'activation
  - *Où le trouver*:
    - Amplitude, Mixpanel ou PostHog — l'entonnoir inscription puis l'événement d'activation, affiché en temps de conversion plutôt qu'en taux
    - GA4 — pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements
  - *Le piège*: Une moyenne baisse quand les traînards abandonnent, et ressemble alors à un progrès. Prends la médiane.
  - *Repère*: Pas de repère publiable : « dès la première session » est une ambition souvent citée, pas une norme mesurée.
  - *Effort*: Seul, ~1 h

#### Retention

- **Rétention à J30** (Le chiffre de l'étape)
  - La part des inscrits encore actifs un mois après leur inscription.
  - *Formule*: inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte
  - *Où le trouver*:
    - Amplitude — un graphique Retention Analysis : événement de départ l'inscription, retour ton action d'usage
    - Mixpanel ou PostHog — un rapport de rétention sur la cohorte, lu au trentième jour
    - GA4 — une exploration de cohortes (onglet Explorer), si l'usage y est envoyé
  - *Le piège*: « Actif » doit être écrit : une connexion n'est pas un usage. Et dis si J30 veut dire le trentième jour pile ou la semaine qui l'entoure : les outils font les deux.
  - *Repère*: Pas de repère publiable : les ordres de grandeur publiés portent sur les applis grand public ; en SaaS, compare la forme de ta courbe d'un mois à l'autre.
  - *Effort*: Seul, ~1 h
- **Churn logo mensuel**
  - La part des clients payants qui partent dans le mois.
  - *Formule*: clients payants perdus dans le mois ÷ clients payants au 1er du mois
  - *Où le trouver*:
    - Stripe — la page Billing overview, graphique « Subscriber churn rate » ; Stripe le calcule sur trente jours glissants, nouveaux abonnés compris : recompte-le au mois si tu peux
    - Chargebee — les rapports de churn clients (RevenueStory, selon ton édition)
    - ChartMogul ou Baremetrics — le graphique de churn clients, au mois
  - *Le piège*: On compte des clients, pas du revenu : le churn en revenu est un autre chiffre. Et un churn mensuel au-dessus de trente pour cent est souvent un chiffre annuel.
  - *Repère*: 1 à 2 % · pour situer, sans désigner d'étape : pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut, les contrats entreprise bien plus bas
  - *Effort*: Seul, 5 min
- **Cause principale de churn**
  - Pourquoi les clients partent, et comment tu le sais.
  - *Formule*: la cause, et d'où elle vient : données, entretiens ou intuition
  - *Où le trouver*:
    - HubSpot ou Salesforce — le champ de raison de perte des clients partis, s'il est rempli
    - Support — relire les derniers départs et les tickets qui les ont précédés
  - *Le piège*: Une intuition partagée par toute l'équipe reste une intuition. Dix départs relus valent mieux qu'une conviction.
  - *Effort*: À demander

#### Referral

- **Part des inscrits recommandés** (Le chiffre de l'étape)
  - La part des inscrits amenés par un utilisateur.
  - *Formule*: inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte
  - *Où le trouver*:
    - Outil de parrainage ou table d'invitations — les inscrits en [mois de cohorte] qui ont un parrain ou un code
    - HubSpot — une propriété « comment nous avez-vous connus ? » remplie à l'inscription
  - *Le piège*: La source « referral » de GA4 compte des sites qui envoient du trafic, pas des clients qui recommandent.
  - *Repère*: Pas de repère publiable : de presque rien à la majorité selon que le produit se voit ou non ; compare-toi à toi-même.
  - *Effort*: Seul, ~1 h
- **Mécanisme de recommandation**
  - Ce qui permet à un utilisateur d'en amener un autre.
  - *Formule*: aucun, en communication seulement, ou dans le produit
  - *Où le trouver*:
    - Produit — l'équipe produit sait s'il existe une invitation, un parrainage ou un partage dans le produit
  - *Le piège*: Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part des inscrits recommandés.
  - *Effort*: Seul, 5 min
- **Coefficient viral (K)**
  - Le nombre de nouveaux inscrits que chaque inscrit amène, en moyenne.
  - *Formule*: inscrits invités par la cohorte ÷ inscrits de la cohorte
  - *Où le trouver*:
    - Table d'invitations — les invités qui se sont inscrits, rattachés à la cohorte de celui qui les a invités
    - Mixpanel ou Amplitude — si l'invitation y est suivie comme un événement, croisée avec la table d'invitations
  - *Le piège*: K se divise par tous les inscrits de la cohorte, pas seulement par ceux qui ont invité quelqu'un.
  - *Repère*: 0,15 à 0,5 · pour situer, sans désigner d'étape : fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et presque toujours temporaire
  - *Effort*: À demander

#### Revenue

- **Conversion en payant** (Le chiffre de l'étape)
  - La part des inscrits qui paient dans la fenêtre.
  - *Formule*: inscrits de la cohorte ayant payé sous n jours ÷ inscrits de la cohorte
  - *Où le trouver*:
    - Data — une jointure entre la base produit et Stripe ou Chargebee, sur l'identifiant client
    - Stripe ou Chargebee — la date du premier paiement de chaque client, à rapprocher de sa date d'inscription
    - HubSpot ou Salesforce — les affaires gagnées de la cohorte, si un commercial intervient
  - *Le piège*: Les taux qui circulent mélangent essai, freemium et carte bancaire demandée à l'inscription. Ne compare qu'à toi-même, d'un mois à l'autre.
  - *Repère*: Pas de repère publiable : aucun taux publié ne porte sur la même base que le tien.
  - *Effort*: À demander
- **ARPA mensuel**
  - Le revenu mensuel moyen d'un client payant.
  - *Formule*: MRR ÷ clients payants
  - *Où le trouver*:
    - Stripe — la page Billing overview : le MRR et les abonnés actifs, ou directement l'ARPU qu'elle affiche
    - Chargebee — le MRR et les clients actifs dans ses rapports d'abonnement
    - ChartMogul — le graphique ARPA, directement
  - *Le piège*: Un ARPA qui monte pendant que le nombre de clients baisse, ce sont souvent les petits clients qui partent.
  - *Repère*: Pas de repère publiable : il varie de trois ordres de grandeur d'une catégorie de produit à l'autre.
  - *Effort*: Seul, 5 min
- **Marge brute**
  - Ce qu'il reste d'un paiement après le coût de servir le client.
  - *Formule*: (revenu – coût direct de service : hébergement, frais de paiement, support) ÷ revenu
  - *Où le trouver*:
    - Finance — le compte de résultat du dernier trimestre clos : le revenu, puis les coûts directs de service
  - *Le piège*: Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC.
  - *Repère*: 70 à 85 % · pour situer, sans désigner d'étape : en SaaS ; bien moins dès qu'il y a de l'humain dans la livraison
  - *Effort*: À demander
- **Expansion mensuelle**
  - Le revenu que les clients déjà là ajoutent dans le mois : montées en gamme, sièges, options.
  - *Formule*: MRR d'expansion du mois ÷ MRR au 1er du mois
  - *Où le trouver*:
    - Stripe — la page Billing overview : les mouvements de MRR du mois, ligne « expansion »
    - Chargebee — les rapports de mouvements de MRR (RevenueStory, selon ton édition)
    - ChartMogul ou Baremetrics — le graphique des mouvements de MRR, au mois
  - *Le piège*: Le MRR des nouveaux clients n'est pas de l'expansion : seuls comptent ceux qui payaient déjà au 1er du mois.
  - *Repère*: Pas de repère publiable : la place pour l'expansion dépend du modèle de prix : forte avec des sièges, faible avec un prix fixe.
  - *Effort*: Seul, ~1 h
- **Rétrogradation mensuelle**
  - Le revenu que les clients qui restent retirent dans le mois : offre moins chère, sièges en moins.
  - *Formule*: MRR perdu en rétrogradations dans le mois ÷ MRR au 1er du mois
  - *Où le trouver*:
    - Stripe — la page Billing overview : les mouvements de MRR du mois, ligne « contraction »
    - Chargebee — les rapports de mouvements de MRR (RevenueStory, selon ton édition)
    - ChartMogul ou Baremetrics — le graphique des mouvements de MRR, au mois
  - *Le piège*: Un client qui part n'est pas une rétrogradation : son MRR relève du churn, compté à part.
  - *Repère*: Pas de repère publiable : elle dépend du modèle de prix autant que du produit : aucun ordre de grandeur ne vaut pour tous.
  - *Effort*: Seul, ~1 h

#### Et cinq chiffres calculés

- **LTV**
  - *Formule*: ARPA × marge brute × durée de vie (1 ÷ churn mensuel, au plus 36 mois)
  - *Le piège*: durée de vie plafonnée à 36 mois : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas
- **CAC payback**
  - *Formule*: CAC ÷ (ARPA × marge brute), en mois
  - *Repère*: 12 à 24 mois · pour situer, sans désigner d'étape : repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie
- **LTV:CAC**
  - *Formule*: LTV ÷ CAC
  - *Repère*: 3 · pour situer, sans désigner d'étape : un repère, pas une loi
- **GRR mensuelle**
  - *Formule*: 100 % – churn – rétrogradation, sur le MRR du 1er du mois
- **NRR mensuelle**
  - *Formule*: 100 % – churn – rétrogradation + expansion, sur le MRR du 1er du mois

### Assisté : 15 chiffres

Trois par étape, deux pour Referral et quatre pour Revenue, qui porte aussi la marge de l'assisté. Les flux et les cohortes se lisent sur trois mois glissants : un mois compte trop peu d'affaires.


#### Acquisition

- **Passage des leads en opportunités** (Le chiffre de l'étape)
  - La part des leads d'une période qui deviennent une opportunité qualifiée.
  - *Formule*: leads créés [sur trois mois] devenus une opportunité qualifiée sous n jours ÷ leads créés [sur trois mois]
  - *Où le trouver*:
    - HubSpot — les contacts créés sur la période, avec leur date d'entrée dans l'étape Opportunité du cycle de vie : un export, puis ceux arrivés sous n jours
    - Salesforce — un rapport de leads avec leur conversion : créés sur la période, convertis sous n jours (date de conversion moins date de création)
    - Pipedrive — la boîte de réception des leads : ceux de la période convertis en affaire ; sinon, un export
  - *Le piège*: « Lead » n'a pas de définition commune : des contacts importés ou des inscrits à un webinar font chuter le taux. Écris ce qui compte comme lead, et comme opportunité.
  - *Repère*: Pas de repère publiable : le taux dépend entièrement de ce que l'entreprise appelle un lead.
  - *Effort*: Seul, ~1 h
- **CAC assisté**
  - Ce que coûte, en moyenne, un nouveau client signé par l'équipe commerciale.
  - *Formule*: dépense ventes et marketing [sur trois mois] ÷ nouveaux clients assistés signés [sur trois mois]
  - *Où le trouver*:
    - Finance — la dépense ventes et marketing du trimestre, salaires chargés compris pour la variante « tout chargé »
    - HubSpot, Salesforce ou Pipedrive — les affaires « nouveau client » gagnées sur la période : le nombre qui divise
    - Régies publicitaires — le coût média de la période, pour la variante « média seul »
  - *Le piège*: Si le cycle médian dépasse trois mois, les clients signés ce trimestre viennent des dépenses d'avant. En hybride, répartis la dépense commune selon une clé, et écris-la.
  - *Repère*: Pas de repère publiable : il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un client rapporte (payback, LTV:CAC).
  - *Effort*: À demander
- **Cycle de vente médian**
  - Le temps qu'il faut pour signer une affaire, de l'opportunité au contrat.
  - *Formule*: médiane des jours entre la création de l'opportunité et sa signature, sur les affaires « nouveau client » gagnées [sur trois mois]
  - *Où le trouver*:
    - Salesforce — un rapport des opportunités gagnées sur la période, avec leur ancienneté en jours : un export, puis la médiane
    - HubSpot — les transactions gagnées, de la date de création à la date de fermeture : un export, puis la médiane, car les rapports donnent des moyennes
    - Pipedrive — la durée des affaires dans les rapports est une moyenne : la médiane se calcule sur un export
  - *Le piège*: Une affaire à 400 jours déplace la moyenne de plusieurs semaines : prends la médiane. Et une opportunité créée tard, après la démo, raccourcit le cycle sur le papier.
  - *Repère*: Pas de repère publiable : le cycle dépend du ticket et de qui signe chez le client : il se suit d'un trimestre à l'autre.
  - *Effort*: Seul, ~1 h

#### Activation

- **Mise en production** (Le chiffre de l'étape)
  - La part des nouveaux clients en production dans le délai fixé après la signature.
  - *Formule*: nouveaux clients signés [sur trois mois] en production sous n jours ÷ nouveaux clients signés [sur trois mois]
  - *Où le trouver*:
    - Outil de Customer Success — l'étape d'onboarding de chaque compte et sa date : Gainsight, Vitally ou Planhat la gardent
    - HubSpot ou Salesforce — un pipeline d'onboarding, ou un champ date « en production » sur le compte, s'il existe
    - Tableur du Customer Success — souvent le seul endroit où la date est notée
  - *Le piège*: Compter les comptes déployés plutôt qu'en production double le taux. Et lis la cohorte mûre : un client signé il y a moins de n jours n'a pas eu sa fenêtre.
  - *Repère*: Pas de repère publiable : la mise en production dépend de ce que l'offre demande d'installer : elle se suit contre sa propre cible.
  - *Effort*: À demander
- **Ce que « en production » veut dire**
  - Le résultat concret qui prouve qu'un client a obtenu ce qu'il a acheté.
  - *Formule*: le résultat qui compte comme « en production », et le nombre de jours laissés pour l'atteindre après la signature
  - *Où le trouver*:
    - Customer Success et produit — une décision à prendre ensemble : ce que fait un client en production, et que ne fait pas un compte seulement déployé
  - *Le piège*: « Déployé » n'est pas « en production » : un compte livré que personne n'utilise ne renouvelle pas.
  - *Effort*: Seul, 5 min
- **Délai de mise en production**
  - Le temps, en jours, entre la signature et la mise en production.
  - *Formule*: médiane des jours entre la signature et la mise en production, pour les clients signés [sur trois mois] qui y sont arrivés
  - *Où le trouver*:
    - Outil de Customer Success — la date de signature et la date de fin d'onboarding de chaque compte
    - HubSpot ou Salesforce — la date de signature et la date « en production », si elles existent
    - Tableur d'onboarding — les deux dates, compte par compte
  - *Le piège*: Médiane, et seulement sur ceux qui y sont arrivés : les autres sont dans le taux de mise en production.
  - *Repère*: Pas de repère publiable : il dépend de ce que l'offre demande d'installer.
  - *Effort*: Seul, ~1 h

#### Retention

- **Renouvellement des contrats** (Le chiffre de l'étape)
  - La part des contrats arrivés à échéance qui se renouvellent, comptés en clients.
  - *Formule*: contrats renouvelés ÷ contrats arrivés à échéance [sur trois mois], en clients et non en euros
  - *Où le trouver*:
    - HubSpot, Salesforce ou Pipedrive — un pipeline de renouvellements : gagnées ÷ closes sur la période
    - Stripe ou Chargebee — les abonnements dont l'échéance tombait sur la période, et leur statut aujourd'hui
    - Customer Success — la liste des échéances du trimestre, quand le CRM ne la tient pas
  - *Le piège*: La tacite reconduction ne se « gagne » pas : compte les résiliations reçues avant l'échéance. Un contrat pluriannuel qui n'arrive pas à échéance sort du compte.
  - *Repère*: Pas de repère publiable : le glossaire cite un churn mensuel, pas un taux de renouvellement : le convertir supposerait des contrats mensuels.
  - *Effort*: Seul, ~1 h
- **NRR sur douze mois**
  - Ce que valent aujourd'hui, en revenu, les clients assistés d'il y a un an.
  - *Formule*: ARR aujourd'hui des clients assistés déjà là il y a douze mois ÷ leur ARR il y a douze mois
  - *Où le trouver*:
    - ChartMogul — la rétention nette de revenu par cohorte, selon l'offre
    - Finance — le reporting au board
    - Salesforce — la somme des contrats actifs par compte à deux dates, si les contrats y vivent
  - *Le piège*: Publiée seule, elle cache la perte : une NRR au-dessus de 100 % peut tenir sur une base qui perd un client sur cinq. Lis-la avec le renouvellement.
  - *Repère*: 110 à 130 % · pour situer, sans désigner d'étape : considérée comme solide en SaaS B2B, du contexte et non une cible
  - *Effort*: À demander
- **Cause principale de non-renouvellement**
  - La raison qui revient le plus quand un client ne renouvelle pas.
  - *Formule*: la cause, et comment on la sait : données, entretiens ou intuition
  - *Où le trouver*:
    - HubSpot, Salesforce ou Pipedrive — la raison de perte des renouvellements perdus, souvent un champ personnalisé
    - Customer Success — relire les derniers départs avec l'équipe
  - *Le piège*: « Le prix » est la case la plus rapide à cocher. Croise la raison déclarée avec l'usage des 90 jours d'avant.
  - *Effort*: À demander

#### Referral

- **Opportunités recommandées** (Le chiffre de l'étape)
  - La part des opportunités amenées par un client ou un partenaire.
  - *Formule*: opportunités créées [sur trois mois] venues d'une recommandation ÷ opportunités créées [sur trois mois]
  - *Où le trouver*:
    - Salesforce — la source du lead ou de l'opportunité : ses valeurs recommandation et partenaire
    - HubSpot — une propriété de source de la transaction, souvent à créer : la source d'origine ne connaît pas les recommandations
    - Les commerciaux — l'origine de leurs dix dernières opportunités : souvent plus vite et plus juste
  - *Le piège*: Un zéro veut presque toujours dire « personne ne l'a compté ». Et la source « referral » d'un outil web compte des sites, pas des personnes.
  - *Repère*: Pas de repère publiable : de presque rien à la majorité selon le produit : la seule référence est son propre chiffre.
  - *Effort*: Seul, ~1 h
- **Clients références**
  - La part des clients assistés d'accord pour être cités ou prendre un appel.
  - *Formule*: clients assistés avec un accord écrit de moins de douze mois ÷ clients assistés à fin [mois]
  - *Où le trouver*:
    - Marketing ou Customer Success — le tableur des références, avec la date de chaque accord
    - HubSpot, Salesforce ou Pipedrive — une propriété « client référence » sur la société, si l'équipe l'a créée
  - *Le piège*: Les logos du site comptent des clients partis et des accords jamais renouvelés.
  - *Repère*: Pas de repère publiable : un accord de citation dépend de chaque client.
  - *Effort*: À demander

#### Revenue

- **Taux de closing** (Le chiffre de l'étape)
  - La part des opportunités conclues qui se signent.
  - *Formule*: opportunités « nouveau client » gagnées ÷ opportunités « nouveau client » conclues (gagnées + perdues) [sur trois mois]
  - *Où le trouver*:
    - Salesforce — les opportunités « nouveau client » closes sur la période : gagnées ÷ closes
    - HubSpot — les transactions « nouvelle affaire » fermées sur la période : gagnées ÷ (gagnées + perdues)
    - Pipedrive — la conversion des affaires sur la période, dans les rapports
  - *Le piège*: Les affaires mortes jamais passées « perdues » gonflent le taux, et un « sans décision » est une perte. Les ventes aux clients existants n'ont rien à faire ici.
  - *Repère*: Pas de repère publiable : le taux dépend du ticket et de ce qui compte comme opportunité : il se suit contre sa propre cible.
  - *Effort*: Seul, 5 min
- **ACV des nouveaux contrats**
  - Ce que vaut par an, en moyenne, un nouveau contrat signé.
  - *Formule*: valeur annuelle des contrats « nouveau client » signés [sur trois mois], hors mise en service ÷ nombre de ces contrats
  - *Où le trouver*:
    - HubSpot — la propriété ACV des transactions gagnées, sinon leur montant
    - Salesforce — le montant des opportunités gagnées : vérifie qu'il porte une année, pas toute la durée
    - Finance — les contrats signés sur la période
  - *Le piège*: Un montant qui porte trois ans de contrat triple l'ACV, et la mise en service n'est pas récurrente. Une moyenne se laisse tirer par un gros contrat : regarde aussi la médiane.
  - *Repère*: Pas de repère publiable : l'ACV couvre plusieurs ordres de grandeur d'une catégorie à l'autre : aucun repère ne vaut pour tous.
  - *Effort*: Seul, 5 min
- **ARPA assisté**
  - Le revenu mensuel moyen d'un client assisté.
  - *Formule*: MRR des clients assistés à fin [mois] ÷ clients assistés à fin [mois]
  - *Où le trouver*:
    - Stripe, Chargebee ou ChartMogul — le MRR et les clients filtrés sur les clients assistés : un segment, un plan, une propriété
    - Finance — l'ARR assisté ÷ 12, et le nombre de clients assistés
  - *Le piège*: En hybride, un client compte dans la seule motion qui a signé son contrat en cours : un client du libre-service passé par un commercial compte ici.
  - *Repère*: Pas de repère publiable : trois ordres de grandeur séparent les catégories : aucun repère ne vaut pour tous.
  - *Effort*: Seul, 5 min
- **Marge brute de l'assisté**
  - Ce qu'il reste du revenu assisté après le coût de servir ces clients, mise en service comprise.
  - *Formule*: (revenu assisté – coût pour le servir, mise en service et Customer Success compris) ÷ revenu assisté, [sur trois mois]
  - *Où le trouver*:
    - Finance — le compte de résultat par offre ou par segment, quand elle le tient ; sinon, la marge globale en repli
  - *Le piège*: Une marge globale flatte l'assisté quand son offre comprend de la mise en service : demande la marge par motion à la finance.
  - *Repère*: Pas de repère publiable : la mise en service et le Customer Success pèsent différemment dans chaque offre.
  - *Effort*: À demander

#### Et trois chiffres calculés

- **LTV assistée**
  - *Formule*: ACV ÷ 12 × marge brute de l'assisté × durée de vie (tirée du renouvellement, au plus 36 mois)
  - *Le piège*: durée de vie plafonnée à 36 mois, comme en libre-service : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le bas
- **CAC payback assisté**
  - *Formule*: CAC assisté ÷ (ACV ÷ 12 × marge brute de l'assisté), en mois
  - *Repère*: 12 à 24 mois · pour situer, sans désigner d'étape : repère couramment cité, pas une loi : la vraie comparaison reste la trésorerie
- **LTV:CAC assisté**
  - *Formule*: LTV assistée ÷ CAC assisté
  - *Repère*: 3 · pour situer, sans désigner d'étape : un repère, pas une loi

### La liaison, si tu vends des deux façons

- **Opportunités venues du libre-service**
  - La part des opportunités assistées nées d'un compte du libre-service.
  - *Formule*: opportunités créées [sur trois mois] à partir d'un compte du libre-service ÷ opportunités créées [sur trois mois]
  - *Où le trouver*:
    - HubSpot — la source de la transaction, ou une propriété « PQL » posée par l'intégration produit
    - Salesforce — la source du lead, ou une campagne dédiée aux PQL
    - Données — la jointure base produit × CRM sur le domaine de l'entreprise
  - *Le piège*: Une part du pipeline, pas une attribution : le compte avait peut-être déjà parlé à un commercial. Et elle ne s'additionne pas à la part recommandée.
  - *Repère*: Pas de repère publiable : la seule référence qui vaille est le taux de base de l'équipe.
  - *Effort*: Seul, ~1 h
