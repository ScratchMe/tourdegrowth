LeverSum — design system extension 09. The compounding, readable.

Q9. Today: a table ("what each lever brings on its own") and one sentence.
Here the same figures as lengths on one scale, all ink:

    Activation rate: 18% → 24%   ████████        +€18,000
    Monthly logo churn: 6% → 4%  ██████          +€13,000
    Monthly expansion: 2% → 3%   ███             +€6,400
    Each alone, added up         ████|███|██      +€38,000
    Together                     █████████████  ┐ +€42,000
                                              └─┘ the extra
    Together they bring ~€4,400 more than each alone, added up:
    each lever works on what the others add. That's compounding.

## Rules

- Shown when two levers or more are moved (one lever: nothing to add up).
- Rows in funnel order. "Each alone, added up" draws the solo bars end to
  end, a paper hairline between them, so each length still reads.
- The bracket over the end of "together" measures what the levers do to each
  other. Never a colour.
- The sentence keeps today's word ("compounding" / « l'effet composé ») and
  says it plainly. ("One after the other" was rejected: applying levers one
  after the other already compounds; the sum is of each lever *alone*.)
- `size="slide"`: a fixed canvas; on a screen under 760px the label goes on
  its own line above its bar.
